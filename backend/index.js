import dotenv from 'dotenv'; 
dotenv.config();

import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbConfig } from './config/config.js'; // Import database configuration
import rateLimit from 'express-rate-limit';

const app = express();
// CRUD operations for user profiles(Create, Read, Update, Delete)
// Secure password storage with bcrypt
// User authentication with JWT
// Environment variables for sensitive data
// Input validation and sanitization
// Error handling and logging

// console.log('credentials loaded in from .env file:', process.env.DB_USER, process.env.DB_CONNECTION_PASSWORD, process.env.DB_NAME, process.env.DB_PORT);
// console.log('Database configuration:', dbConfig);
const dbconn = mysql.createConnection(dbConfig);

// Connect to the MySQL database
dbconn.connect((err) => {
	if (err) {
		console.error('Database connection failed:', err);
		return;
	}
	console.log('Database connected successfully!');
});

app.use(cors());
app.use(express.json());

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

// Endpoint to fetch all user profiles
app.get('/api/userprofile', getUserProfileLimiter, (req, res) => {
	const q = 'SELECT * FROM profiledata.userprofile';
	dbconn.query(q, (err, data) => {
		if (err) return res.json({ error: err.message }); // Handle error and send response
		return res.json(data);
	});
});

// TODO: remake create user endpoint with hashed passwords and validation
// Endpoint to create a new user profile (Create)
app.post('/api/createuser', createUserLimiter, async (req, res) => {
	//method to create a new user profile
});

//This authentication function asynchronously verifies user credentials, compares hashed passwords, and generates a JWT for session management. It is called in the login endpoint to handle user authentication securely.
// Extracted authentication logic for maintainability
async function authenticateUser(username, password) {
	// Return a promise to handle async operations
	return new Promise((resolve, reject) => {
		const q = 'SELECT * FROM profiledata.userprofile WHERE username = ?';
		// Use parameterized query to prevent SQL injection
		dbconn.query(q, [username], async (err, data) => {
			if (err) return reject({ status: 500, error: err.message });
			if (data.length === 0) {
				return reject({ status: 401, error: 'Invalid username or password' });
			}
			const user = data[0];
			// Compare hashed passwords
			try {
				const match = await bcrypt.compare(password, user.userpassword);
				if (match) {
					const payload = { id: user.idusers, username: user.username, role: user.role };
					const secret = process.env.JWT_SECRET || 'your_jwt_secret';
					const token = jwt.sign(payload, secret, { expiresIn: '1h' });
					const safeUser = { id: user.idusers, username: user.username };
					return resolve({ user: safeUser, token });
				} else {
					return reject({ status: 401, error: 'Invalid username or password' });
				}
			} catch (err) {
				return reject({ status: 500, error: 'Error comparing passwords' });
			}
		});
	});
}

//TODO: Login endpoint should: validate input, check user existence w/ database table, compare hashed passwords w/ db, generate JWT, handle errors and update global state of app to logged in user and load user profile data
// Authentication is handled asynchronously with proper error handling via the authenticateUser function
// Endpoint login user (Read)
app.post('/login', loginLimiter, async (req, res) => {
	const { username, password } = req.body;

	// Explicit username validation: only allow alphanumeric and underscores, 3-30 chars
	const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
	if (!username || !usernameRegex.test(username)) {
		return res.status(400).json({ error: 'Invalid username format.' });
	}
	// Password presence check
	if (!password) {
		return res.status(400).json({ error: 'Password is required.' });
	}
	// Authenticate user
	try {
		const { user, token } = await authenticateUser(username, password);
		return res.json({ message: 'Login successful!', user, token });
	} catch (err) {
		return res.status(err.status || 500).json({ error: err.error || 'Authentication failed' });
	}
});

// Endpoint to update user profile (Update)
app.put('/userprofile/:id', (req, res) => {
	// Update user profile by ID
	const userId = req.params.id;
	const { name, password } = req.body;
	const q = 'UPDATE profiledata.userprofile SET username = ?, userpassword = ? WHERE idusers = ?';
	dbconn.query(q, [name, password, userId], (err, data) => {
		if (err) return res.status(500).json({ error: err.message });
		return res.json({ message: 'User profile updated successfully!' });
	});
});

// Endpoint to delete user profile (Delete)
app.delete('/userprofile/:id', (req, res) => {
	const userId = req.params.id;
	const q = 'DELETE FROM profiledata.userprofile WHERE idusers = ?';
	dbconn.query(q, [userId], (err, data) => {
		if (err) return res.status(500).json({ error: err.message });
		return res.json({ message: 'User profile deleted successfully!' });
	});
});

// Start the server
app.listen(8800, () => {
	console.log(
		'Welcome to the backend server!, running on http://localhost:8800.\nThis is the backend server for the React + Node.js + Express + MySQL example application.'
	);
	console.log('Database connection established successfully!');
	// Uncomment the following lines to display available endpoints and database connection details
	// console.log('You can now access the API endpoints at http://localhost:8800/');
	// console.log('Available endpoints:');
	// console.log('- GET /: Returns a welcome message');
	// console.log('- GET /userprofiletable: Fetch all user profiles');
	// console.log('- POST /userprofiletable: Create a new user profile');
	// console.log('- POST /login: Authenticate a user');
	// console.log('frontend endpoints(http://localhost:3000):');
	// console.log('- GET /home: Home page');
	// console.log('- GET /login: Login page');
	// console.log('- GET /map: Map page');
	// console.log('- GET /profile: User profile page');
	// console.log('SQL Server Connection Details:');
	// console.log('Database Host: localhost');
	// console.log('Database User: root');
	// console.log('Database Port: 3006');
});
// TODO: Implement error handling for database connection issues.
// TODO: Implement logging for database queries and errors.
// TODO: Implement a connection pool for better performance and resource management.
// TODO: Implement security measures like input validation and sanitization to prevent SQL injection attacks.