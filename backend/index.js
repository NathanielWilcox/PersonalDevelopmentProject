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
import { NotFoundError, ForbiddenError } from './utils/errorHandling.js';
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

// CRUD operations for user profiles(Create, Read, Update, Delete)
// Secure password storage with bcrypt
// User authentication with JWT
// Environment variables for sensitive data
// Input validation and sanitization
// Error handling and logging
const app = express();
const dbconn = mysql.createConnection(dbConfig);
const PORT = serverConfig.port || 8800; // Default to 8800 if not set
app.use(cors({ origin: 'http://localhost:3000', methods: ['GET','POST','PUT','DELETE'], allowedHeaders: ['Content-Type','Authorization'] , credentials: true })); // Adjust origin as needed for production
app.use(express.json());

// Connect to the MySQL database
async function connectToDatabase(retries = 5, delay = 2000) {
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			await dbconn.connect();
			console.log('DB MySQL connected and ready');
			return;
		} catch (err) {
			console.error(`DB connection attempt ${attempt} failed:`, err);
			if (attempt < retries) {
				console.log(`Retrying in ${delay / 1000} seconds...`);
				await new Promise(res => setTimeout(res, delay));
			}
		}
	}
	console.error('All DB connection attempts failed. Exiting.');
	process.exit(1);
}
connectToDatabase();

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
 * @api {get} /api/userprofile Get All User Profiles
 * @apiName GetUserProfiles
 * @apiGroup User Profile
 * @apiDescription Retrieves all user profiles from the database with rate limiting
 * 
 * @apiSuccess {Object[]} profiles List of user profiles
 * @apiSuccess {Number} profiles.idusers Unique identifier for the user
 * @apiSuccess {String} profiles.username Username (3-45 characters)
 * @apiSuccess {String} profiles.email User's email address (optional, up to 100 characters)
 * @apiSuccess {String} profiles.role User's role ('user', 'photographer', 'videographer', 'musician', 'artist', 'admin')
 * @apiSuccess {Date} profiles.created Account creation timestamp
 * 
 * @apiError {Object} error Error object containing error message
 * 
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost:8800/api/userprofile
 * 
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "idusers": 1,
 *         "username": "john_doe",
 *         "email": "john@example.com",
 *         "role": "photographer",
 *         "created": "2025-10-12T14:10:17.000Z"
 *       }
 *     ]
 */
// Protected route - requires authentication
app.get('/api/userprofile', 
    getUserProfileLimiter, 
    verifyToken,
    verifyRoles(['user', 'photographer', 'videographer', 'musician', 'artist', 'admin']),
    asyncHandler(async (req, res) => {
    const result = await withDbErrorHandling(async () => {
        // Get the user ID from the decoded token (added by verifyToken middleware)
        const userId = req.user.id;
        const getProfileQuery = 'SELECT idusers, username, email, role, created FROM userprofile WHERE idusers = ?';
        const [data] = await dbconn.promise().query(getProfileQuery, [userId]);
        
        if (!data || data.length === 0) {
            throw new NotFoundError('User profile not found');
        }
        
        return data[0]; // Return single user profile
    });
    res.json(result);
}));

// TODO: remake create user endpoint with hashed passwords and validation
/**
 * @api {post} /api/create Create New User Profile
 * @apiName CreateUserProfile
 * @apiGroup User Profile
 * @apiDescription Creates a new user profile with password hashing and data validation
 * 
 * @apiParam {String} username Username (3-45 characters, alphanumeric and underscores only)
 * @apiParam {String} password Password to be hashed (minimum 6 characters in production)
 * @apiParam {String} [email] Optional email address (must be valid format if provided)
 * @apiParam {String} [role="user"] User role (one of: 'user', 'photographer', 'videographer', 'musician', 'artist', 'admin')
 * 
 * @apiSuccess {String} message Success message
 * @apiSuccess {Number} userId ID of the created user
 * 
 * @apiError {Object} error Error object with message
 * @apiError {String} error.message Error description
 * 
 * @apiExample {curl} Example usage:
 *     curl -X POST http://localhost:8800/api/create \
 *          -H "Content-Type: application/json" \
 *          -d '{"username":"john_doe", "password":"secretpass", "email":"john@example.com", "role":"photographer"}'
 * 
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "message": "User profile created successfully!",
 *       "userId": 1
 *     }
 * 
 * @apiErrorExample {json} Error Response - Username Exists:
 *     HTTP/1.1 409 Conflict
 *     {
 *       "error": "Username already exists."
 *     }
 * 
 * @apiErrorExample {json} Error Response - Invalid Input:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Invalid username format. Only alphanumeric characters and underscores are allowed, 3-30 characters long."
 *     }
 * 
 * @apiNote Database Optimizations:
 * - Username has a unique index for fast lookups
 * - Email has an index for searching
 * - Compound index on role and created date for filtered queries
 * - Built-in constraints enforce data integrity
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

    // Validate input
    validateInput(req.body, userSchema);

    const { username, password, email, role = 'user' } = req.body;

    // Create user with error handling
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



//TODO: Login endpoint should: validate input, check user existence w/ database table, compare hashed passwords w/ db, generate JWT, handle errors and update global state of app to logged in user and load user profile data
// Verify user credentials async using authenticateUser method and issue JWT (Login), with rate limiting to prevent brute-force attacks
app.post('/login', loginLimiter, asyncHandler(async (req, res) => {
    console.log('✅ /login route hit');

    const loginSchema = {
        username: { required: true },
        password: { required: true }
    };

    // Validate login input
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

// Endpoint to update user profile (Update)
app.put('/userprofile/:id', 
    verifyToken,
    verifyRoles(['user', 'photographer', 'videographer', 'musician', 'artist', 'admin']),
    asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const requestingUserId = req.user.id;
    const userRole = req.user.role;

    // Only allow users to modify their own profile, unless they're an admin
    if (userId !== requestingUserId && userRole !== 'admin') {
        throw new ForbiddenError('You can only modify your own profile');
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
        // First check if user exists
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

// Endpoint to delete user profile (Delete)
app.delete('/userprofile/:id', 
    verifyToken,
    verifyRoles(['admin']), // Only admin can delete profiles
    asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const requestingUserId = req.user.id;

    // Even though we have the admin role check in verifyRoles,
    // let's double check here for an extra layer of security
    if (req.user.role !== 'admin') {
        throw new ForbiddenError('Only administrators can delete user profiles');
    }

    // Prevent admin from deleting their own account
    if (userId === requestingUserId) {
        throw new ForbiddenError('Cannot delete your own admin account');
    }

    const result = await withDbErrorHandling(async () => {
        // First check if user exists
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
});

// Start the server + test DB conection
// Server startup with error handling
const startServer = async () => {
    try {
        await connectToDatabase();
        const { port } = serverConfig;
        
        app.listen(port, () => {
            console.log(`Server listening on http://localhost:${port}`);
        });
    } catch (err) {
        console.error('Startup error:', err);
        process.exit(1);
    }
};

// Logout endpoint
app.post('/api/logout', verifyToken, asyncHandler(async (req, res) => {
    // In a real-world application, you might want to invalidate the token
    // by adding it to a blacklist or maintaining a token revocation list
    // For now, we'll just send a success response since the client will
    // remove the token
    res.json({ message: 'Successfully logged out' });
}));

startServer();

// TODO: fix JWT authentication middleware to protect routes
// if (authHeader) {
// 	const token = authHeader.split(' ')[1];
// 	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
// 		if (err) {
// 			return res.status(403).json({ error: 'Invalid token' });
// 		}
// 		req.user = user;
// 		next();
// 	});
// } else {
// 	res.status(401).json({ error: 'Authorization header missing' });
// }

// Function to handle user logout
const handleLogout = (dispatch, navigate) => {
	// Clear user data and token from local storage and cookies
	localStorage.removeItem('token');
	Cookies.remove('token');
	Cookies.remove('username');
	// Dispatch logout action to update Redux state
	dispatch(logout());
	// Redirect to login page after logout
	if (navigate) {
		navigate('/login');
	}
};

//This authentication function asynchronously verifies user credentials, compares hashed passwords, and generates a JWT for session management. It is called in the login endpoint to handle user authentication securely.
// Extracted authentication logic for maintainability
async function authenticateUser(username, password) {
	// Return a promise to handle async operations
	return new Promise((resolve, reject) => {
		const authenticateQuery = 'SELECT idusers, username, password, email, role FROM userprofile WHERE username = ?';
		// Use parameterized query to prevent SQL injection
		dbconn.query(authenticateQuery, [username], async (err, results) => {
			if (err) return reject({ status: 500, error: 'Database query error' });
			if (results.length === 0) return reject({ status: 401, error: 'Invalid username or password' });
			const user = results[0];
			// Compare hashed passwords
			const isPasswordValid = await bcrypt.compare(password, user.password);
			if (!isPasswordValid) return reject({ status: 401, error: 'Invalid username or password' });
			// Generate JWT
			const token = jwt.sign({ id: user.idusers, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
			// Return user info and token
			resolve({ id: user.idusers, username: user.username, email: user.email, role: user.role, token });
		});
	},
); // Note: In a production environment, ensure to handle JWT secret securely and consider token expiration and refresh mechanisms.
}

async function hashPassword(plainTextPassword) {
	const saltRounds = 10;
	return await bcrypt.hash(plainTextPassword, saltRounds);
}

// Global error handler - must be last
app.use(errorHandler);

export { handleLogout };