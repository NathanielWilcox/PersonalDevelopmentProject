import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import csrf from 'csurf';
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
import { uploadMiddleware, getMediaUrl, deleteMediaFile } from './utils/uploadMiddleware.js';
import { validateMediaFile, detectMediaType, cleanPostData } from './utils/mediaHelpers.js';
import { buildPostFiltersQuery, buildOrderClause, getPaginationOffset, formatPostsResponse, userOwnsPost, validatePostData } from './utils/postHelpers.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cookieParser());

// CORS configuration - allow credentials
app.use(cors({ 
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
    credentials: true 
}));

// Body parser with limits
app.use(express.json({ limit: '5mb' }));

// CSRF protection middleware - can use cookies or request body
const csrfProtection = csrf({ cookie: true });

// Cookie-based CSRF token generation endpoint
app.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

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

// Rate limiter for post creation endpoint
const createPostLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Max 20 posts per hour
    message: { error: 'Too many posts created. Please try again later.' }
});

// Rate limiter for feed endpoint
const getFeedLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 30, // 30 requests per 5 minutes
    message: { error: 'Too many feed requests. Please slow down.' }
});

// Serve uploaded files statically (for local filesystem MVP)
app.use('/uploads', express.static('uploads'));

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

    // Set JWT in HTTP-only cookie (cannot be accessed by JavaScript, secure against XSS)
    res.cookie('token', result.token, {
        httpOnly: true,      // Cannot be accessed by JavaScript
        secure: false,       // Set to true in production with HTTPS
        sameSite: 'strict',  // Prevent CSRF attacks
        maxAge: 3600000      // 1 hour in milliseconds
    });

    // Return user data (NOT token) in response
    res.json({
        id: result.id,
        username: result.username,
        email: result.email,
        role: result.role,
        message: 'Login successful'
    });
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
        const userId = Number(req.params.id);
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

/**
 * @api {post} /api/posts Create Post
 * @apiName CreatePost
 * @apiGroup Posts
 * @apiDescription Create a new post with media upload
 */
app.post('/api/posts',
    createPostLimiter,
    verifyToken,
    uploadMiddleware.single('media'),
    asyncHandler(async (req, res) => {
        // Validate file upload
        const fileValidation = validateMediaFile(req.file);
        if (!fileValidation.isValid) {
            throw new ValidationError(fileValidation.error);
        }

        // Validate input data
        const { title, description, visibility, tags } = req.body;
        const postValidation = validatePostData({ title, description, visibility });
        if (!postValidation.isValid) {
            throw new ValidationError('Validation failed', postValidation.errors);
        }

        // Detect media type from file
        const media_type = detectMediaType(req.file.mimetype);

        const result = await withDbErrorHandling(async () => {
            // Get relative media URL for database storage
            const mediaUrl = getMediaUrl(req.user.id, req.file.filename);

            // Insert post into database
            const [data] = await dbconn.promise().query(
                `INSERT INTO posts (user_id, title, description, media_type, media_url, visibility, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [req.user.id, title, description || null, media_type, mediaUrl, visibility || 'public']
            );

            // Add tags if provided
            if (tags && Array.isArray(tags) && tags.length > 0) {
                for (const tag of tags) {
                    if (tag.trim()) {
                        await dbconn.promise().query(
                            'INSERT INTO post_tags (post_id, tag) VALUES (?, ?)',
                            [data.insertId, tag.trim()]
                        );
                    }
                }
            }

            return {
                postId: data.insertId,
                message: 'Post created successfully',
                mediaUrl
            };
        });

        res.status(201).json(result);
    }));

/**
 * @api {get} /api/posts/feed Get Feed
 * @apiName GetFeed
 * @apiGroup Posts
 * @apiDescription Get random users' posts with pagination and filters
 * @apiQuery {Number} page Page number (default: 1)
 * @apiQuery {Number} limit Posts per page (default: 10)
 * @apiQuery {String} filter_by Role filter: photographer, videographer, musician, artist, user, all (default: all)
 * @apiQuery {String} media_type Filter: photo, video, text, all (default: all)
 * @apiQuery {String} sort Sort by: newest, popular (default: newest)
 */
app.get('/api/posts/feed',
    getFeedLimiter,
    verifyToken,
    asyncHandler(async (req, res) => {
        const { page = 1, limit = 10, filter_by = 'all', media_type = 'all', sort = 'newest' } = req.query;

        // Build filter and pagination
        const { whereClause, params } = buildPostFiltersQuery({
            filterBy: filter_by,
            mediaType: media_type,
            visibility: 'public'
        });
        const orderClause = buildOrderClause(sort);
        const offset = getPaginationOffset(page, limit);
        const limitNum = Math.max(1, parseInt(limit) || 10);

        const result = await withDbErrorHandling(async () => {
            // Get posts with user info
            const [posts] = await dbconn.promise().query(`
                SELECT 
                    p.id,
                    p.user_id,
                    p.title,
                    p.description,
                    p.media_type,
                    p.media_url,
                    p.likes_count,
                    p.comments_count,
                    p.created_at,
                    p.updated_at,
                    u.username,
                    u.role,
                    (SELECT COUNT(*) FROM post_tags WHERE post_id = p.id) as tag_count
                FROM posts p
                JOIN userprofile u ON p.user_id = u.idusers
                WHERE ${whereClause}
                ORDER BY ${orderClause}
                LIMIT ? OFFSET ?
            `, [...params, limitNum, offset]);

            // Get total count for pagination
            const [countResult] = await dbconn.promise().query(`
                SELECT COUNT(*) as total FROM posts p
                JOIN userprofile u ON p.user_id = u.idusers
                WHERE ${whereClause}
            `, params);

            const total = countResult[0].total;
            const hasMore = offset + limitNum < total;

            return formatPostsResponse(posts, page, limitNum, total);
        });

        res.json(result);
    }));

/**
 * @api {get} /api/posts/:id Get Single Post
 * @apiName GetPost
 * @apiGroup Posts
 * @apiDescription Get a single post with all details and tags
 */
app.get('/api/posts/:id',
    verifyToken,
    asyncHandler(async (req, res) => {
        const result = await withDbErrorHandling(async () => {
            const [posts] = await dbconn.promise().query(`
                SELECT 
                    p.id,
                    p.user_id,
                    p.title,
                    p.description,
                    p.media_type,
                    p.media_url,
                    p.likes_count,
                    p.comments_count,
                    p.created_at,
                    p.updated_at,
                    u.username,
                    u.role
                FROM posts p
                JOIN userprofile u ON p.user_id = u.idusers
                WHERE p.id = ? AND p.visibility = 'public'
            `, [req.params.id]);

            if (!posts.length) {
                throw new ResourceNotFoundError('Post not found');
            }

            // Get tags for this post
            const [tags] = await dbconn.promise().query(
                'SELECT tag FROM post_tags WHERE post_id = ?',
                [req.params.id]
            );

            return { ...posts[0], tags: tags.map(t => t.tag) };
        });

        res.json(result);
    }));

/**
 * @api {delete} /api/posts/:id Delete Post
 * @apiName DeletePost
 * @apiGroup Posts
 * @apiDescription Delete a post (owner only)
 */
app.delete('/api/posts/:id',
    verifyToken,
    asyncHandler(async (req, res) => {
        const result = await withDbErrorHandling(async () => {
            const [posts] = await dbconn.promise().query(
                'SELECT user_id, media_url FROM posts WHERE id = ?',
                [req.params.id]
            );

            if (!posts.length) {
                throw new ResourceNotFoundError('Post not found');
            }

            if (!userOwnsPost(req.user.id, posts[0].user_id)) {
                throw new AuthorizationError('You can only delete your own posts');
            }

            // Delete the post
            const [data] = await dbconn.promise().query(
                'DELETE FROM posts WHERE id = ?',
                [req.params.id]
            );

            // Delete the media file from filesystem
            if (posts[0].media_url) {
                deleteMediaFile(posts[0].media_url);
            }

            return data;
        });

        res.json({ message: 'Post deleted successfully' });
    }));

/**
 * @api {get} /api/posts/user/:userId Get User Posts
 * @apiName GetUserPosts
 * @apiGroup Posts
 * @apiDescription Get all public posts by a specific user
 */
app.get('/api/posts/user/:userId',
    verifyToken,
    asyncHandler(async (req, res) => {
        const { page = 1, limit = 10 } = req.query;
        const offset = getPaginationOffset(page, limit);
        const limitNum = Math.max(1, parseInt(limit) || 10);

        const result = await withDbErrorHandling(async () => {
            // Get posts for this user
            const [posts] = await dbconn.promise().query(`
                SELECT 
                    p.id,
                    p.user_id,
                    p.title,
                    p.description,
                    p.media_type,
                    p.media_url,
                    p.likes_count,
                    p.comments_count,
                    p.created_at,
                    p.updated_at,
                    u.username,
                    u.role,
                    (SELECT COUNT(*) FROM post_tags WHERE post_id = p.id) as tag_count
                FROM posts p
                JOIN userprofile u ON p.user_id = u.idusers
                WHERE p.user_id = ? AND p.visibility = 'public'
                ORDER BY p.created_at DESC
                LIMIT ? OFFSET ?
            `, [req.params.userId, limitNum, offset]);

            // Get total count
            const [countResult] = await dbconn.promise().query(
                'SELECT COUNT(*) as total FROM posts WHERE user_id = ? AND visibility = ?',
                [req.params.userId, 'public']
            );

            return formatPostsResponse(posts, page, limitNum, countResult[0].total);
        });

        res.json(result);
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

// Start the server only in non-test environments
if (process.env.NODE_ENV !== 'test') {
    startServer();
}

export default app;