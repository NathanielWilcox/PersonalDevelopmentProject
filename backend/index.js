import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serverConfig } from './config/config.js';
import rateLimit from 'express-rate-limit';
import { verifyToken, verifyRoles } from './utils/authMiddleware.js';
import { AuthorizationError, ResourceNotFoundError } from './utils/errorHandling.js';
import {
    asyncHandler,
    errorHandler,
    withDbErrorHandling,
    withJwtErrorHandling,
    validateInput,
    ValidationError,
    AuthenticationError,
    ConflictError
} from './utils/errorHandling.js';

const app = express();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_CONNECTION_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Use a connection pool instead of a single connection
const dbconn = mysql.createPool(dbConfig);
const PORT = serverConfig.port || 8800;

app.use(cors({ origin: 'http://localhost:3000', methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'], credentials: true }));
app.use(express.json());

// Connect to the MySQL database
async function connectToDatabase(retries = 5, delay = 2000) {
    console.log(`Attempting to connect to DB at ${dbConfig.host}:${dbConfig.port}...`);
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`DB connection attempt ${attempt}...`);
            const connection = await dbconn.promise().getConnection();
            console.log('✅ DB MySQL connected and ready');
            connection.release();
            return;
        } catch (err) {
            console.error(`❌ DB connection attempt ${attempt} failed:`, err.message);
            if (attempt < retries) {
                console.log(`Retrying in ${delay / 1000} seconds...`);
                await new Promise(res => setTimeout(res, delay));
            }
        }
    }
    console.error('❌ All DB connection attempts failed. Exiting.');
    process.exit(1);
}

// Rate limiter for user profile creation endpoint
const createUserLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: { error: 'Too many accounts created from this IP, please try again after 15 minutes.' }
});

// Rate limiter for user profile table GET endpoint
const getUserProfileLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Rate limiter for login endpoint
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 login requests per windowMs
    message: { error: 'Too many login attempts from this IP, please try again after 15 minutes.' }
});

// Test endpoint to verify server is running
app.get('/', (req, res) => {
    res.json('hello from the express backend!');
});

// Health-check route
app.get('/ping', (req, res) => {
    console.log('✅ /ping route hit');
    res.status(200).json({ message: 'pong' });
});

/**
 * @api {get} /api/userprofile Get User Profile
 * @apiName GetUserProfile
 * @apiGroup User Profile
 * @apiDescription Retrieves the authenticated user's profile from the database
 */
app.get('/api/userprofile',
    getUserProfileLimiter,
    verifyToken,
    verifyRoles(['user', 'photographer', 'videographer', 'musician', 'artist', 'admin']),
    asyncHandler(async (req, res) => {
        const result = await withDbErrorHandling(async () => {
            const userId = req.user.id;
            const getProfileQuery = 'SELECT idusers, username, email, role, created FROM userprofile WHERE idusers = ?';
            const [data] = await dbconn.promise().query(getProfileQuery, [userId]);

            if (!data || data.length === 0) {
                throw new ResourceNotFoundError('User profile not found');
            }

            return data[0];
        });
        res.json(result);
    }));

/**
 * @api {post} /api/create Create New User Profile
 * @apiName CreateUserProfile
 * @apiGroup User Profile
 */
app.post('/api/create', createUserLimiter, asyncHandler(async (req, res) => {
    const userSchema = {
        username: {
            required: true,
            pattern: /^[a-zA-Z0-9_]{3,30}$/,
            message: 'Username must be 3-30 characters long and contain only letters, numbers, and underscores'
        },
        password: {
            required: true,
            minLength: process.env.NODE_ENV === 'production' ? 6 : 2,
            message: 'Password must be at least 6 characters long'
        },
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Invalid email format'
        },
        role: {
            enum: ['user', 'photographer', 'videographer', 'musician', 'artist', 'admin'],
            default: 'user'
        }
    };

    validateInput(req.body, userSchema);

    const { username, password, email, role = 'user' } = req.body;

    const result = await withDbErrorHandling(async () => {
        const hashedPassword = await bcrypt.hash(password, 10);
        const createUserQuery = 'INSERT INTO userprofile (username, password, email, role) VALUES (?, ?, ?, ?)';
        const [data] = await dbconn.promise().query(
            createUserQuery,
            [username, hashedPassword, email || null, role]
        );
        return data;
    });

    res.status(201).json({
        message: 'User profile created successfully!',
        userId: result.insertId
    });
}));

/**
 * @api {post} /login User Login
 * @apiName Login
 * @apiGroup Authentication
 */
app.post('/login', loginLimiter, asyncHandler(async (req, res) => {
    console.log('✅ /login route hit');

    const loginSchema = {
        username: { required: true },
        password: { required: true }
    };

    validateInput(req.body, loginSchema);

    const { username, password } = req.body;

    const result = await withDbErrorHandling(async () => {
        const [users] = await dbconn.promise().query(
            'SELECT idusers, username, password, email, role FROM userprofile WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            throw new AuthenticationError('Invalid username or password');
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            throw new AuthenticationError('Invalid username or password');
        }

        const tokenData = await withJwtErrorHandling(async () => {
            return jwt.sign(
                { id: user.idusers, username: user.username, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
        });

        return {
            id: user.idusers,
            username: user.username,
            email: user.email,
            role: user.role,
            token: tokenData
        };
    });

    res.json(result);
}));

/**
 * @api {post} /api/logout User Logout
 * @apiName Logout
 * @apiGroup Authentication
 */
app.post('/api/logout', verifyToken, asyncHandler(async (req, res) => {
    res.json({ message: 'Successfully logged out' });
}));

/**
 * @api {put} /userprofile/:id Update User Profile
 * @apiName UpdateUserProfile
 * @apiGroup User Profile
 */
app.put('/userprofile/:id',
    verifyToken,
    verifyRoles(['user', 'photographer', 'videographer', 'musician', 'artist', 'admin']),
    asyncHandler(async (req, res) => {
        const userId = req.params.id;
        const requestingUserId = req.user.id;
        const userRole = req.user.role;

        if (userId !== requestingUserId && userRole !== 'admin') {
            throw new AuthorizationError('You can only modify your own profile');
        }

        const updateSchema = {
            username: {
                pattern: /^[a-zA-Z0-9_]{3,30}$/,
                message: 'Username must be 3-30 characters long and contain only letters, numbers, and underscores'
            },
            email: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email format'
            },
            role: {
                enum: ['user', 'photographer', 'videographer', 'musician', 'artist', 'admin']
            }
        };

        validateInput(req.body, updateSchema);

        const { username, email, role } = req.body;

        const result = await withDbErrorHandling(async () => {
            const [users] = await dbconn.promise().query(
                'SELECT 1 FROM userprofile WHERE idusers = ?',
                [userId]
            );

            if (users.length === 0) {
                throw new ResourceNotFoundError('User not found');
            }

            const [data] = await dbconn.promise().query(
                'UPDATE userprofile SET username = ?, email = ?, role = ? WHERE idusers = ?',
                [username, email, role, userId]
            );

            if (data.affectedRows === 0) {
                throw new Error('Update failed');
            }

            return data;
        });

        res.json({ message: 'User profile updated successfully!' });
    }));

/**
 * @api {delete} /userprofile/:id Delete User Profile
 * @apiName DeleteUserProfile  
 * @apiGroup User Profile
 */
app.delete('/userprofile/:id',
    verifyToken,
    verifyRoles(['admin']),
    asyncHandler(async (req, res) => {
        const userId = req.params.id;
        const requestingUserId = req.user.id;

        if (req.user.role !== 'admin') {
            throw new AuthorizationError('Only administrators can delete user profiles');
        }

        if (userId === requestingUserId) {
            throw new AuthorizationError('Cannot delete your own admin account');
        }

        const result = await withDbErrorHandling(async () => {
            const [users] = await dbconn.promise().query(
                'SELECT 1 FROM userprofile WHERE idusers = ?',
                [userId]
            );

            if (users.length === 0) {
                throw new ResourceNotFoundError('User not found');
            }

            const [data] = await dbconn.promise().query(
                'DELETE FROM userprofile WHERE idusers = ?',
                [userId]
            );

            if (data.affectedRows === 0) {
                throw new Error('Delete failed');
            }

            return data;
        });

        res.json({ message: 'User profile deleted successfully!' });
    }));

// Server startup with error handling
const startServer = async () => {
    try {
        await connectToDatabase();
        const { port } = serverConfig;

        app.listen(port, () => {
            console.log(`🚀 Server listening on http://localhost:${port}`);
        });
    } catch (err) {
        console.error('Startup error:', err);
        process.exit(1);
    }
};

// Global error handler - must be last
app.use(errorHandler);

// Start the server
startServer();