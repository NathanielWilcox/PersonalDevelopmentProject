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
	const getProfileQuery = 'SELECT * FROM profiledata.userprofile';
	dbconn.query(getProfileQuery, (err, data) => {
		if (err) return res.json({ error: err.message }); // Handle error and send response
		return res.json(data);
	});
});

// TODO: remake create user endpoint with hashed passwords and validation
// Endpoint to create a new user profile (Create)
app.post('/api/createuser', createUserLimiter, async (req, res) => {
	// method to create a new user profile using Node.js, Express, bcrypt, and MySQL
	// user profile will contain 
	// [varchar(45) username, 
	// varchar(255) password(hashed){note: user will enter plain text, so authentication must hash the plaintext and compare hashes}, 
	// nullable varchar(45) email, 
	// enum role{default 'user','photographer','videographer','musician','technician','admin'}
	// timestamp created,
	// ]
	const { username, password, email } = req.body;

	// Basic input validation
	if (!username || !password) {
		return res.status(400).json({ error: 'Username and password are required.' });
	}
	// Validate username: only allow alphanumeric and underscores, 3-30 chars
	const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
	if (!usernameRegex.test(username)) {
		return res.status(400).json({ error: 'Invalid username format. Only alphanumeric characters and underscores are allowed, 3-30 characters long.' });
	}
	// Validate password: minimum 2 characters for testing, should be 6+ in production
	if (password.length < 2) {
		return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
	}
	// Hash the password before storing it
	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		const userRole = role && ['photographer','videographer','musician','technician','admin','user'].includes(role) ? role : 'user'; // Default role is 'user'

		// Use parameterized query to prevent SQL injection
		const insertQuery = 'INSERT INTO profiledata.userprofile (username, userpassword, email, role) VALUES (?, ?, ?, ?)';
		const values = [username, hashedPassword, email || null, userRole];
		// async/await with try/catch for better error handling, create a new user profile in the database
		await new Promise((resolve, reject) => {
			dbconn.query(insertQuery, values, (err, result) => {
				if (err) return reject(err);
				resolve(result);
			});
		});
		return res.status(201).json({ message: 'User profile created successfully!' });
	} catch (err) {
		console.error('Error creating user profile:', err);
		return res.status(500).json({ error: 'Internal server error' });
	}
});

//This authentication function asynchronously verifies user credentials, compares hashed passwords, and generates a JWT for session management. It is called in the login endpoint to handle user authentication securely.
// Extracted authentication logic for maintainability
async function authenticateUser(username, password) {
	// Return a promise to handle async operations
	return new Promise((resolve, reject) => {
		const authenticateQuery = 'SELECT * FROM profiledata.userprofile WHERE username = ?';
		// Use parameterized query to prevent SQL injection
		dbconn.query(authenticateQuery, [username], async (err, results) => {
			if (err) return reject({ status: 500, error: 'Database query error' });
			if (results.length === 0) return reject({ status: 401, error: 'Invalid username or password' });
			const user = results[0];
			// Compare hashed passwords
			const isPasswordValid = await bcrypt.compare(password, user.userpassword);
			if (!isPasswordValid) return reject({ status: 401, error: 'Invalid username or password' });
			// Generate JWT
			const token = jwt.sign({ id: user.idusers, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
			// Return user info and token
			resolve({ id: user.idusers, username: user.username, email: user.email, role: user.role, token });
		});
	},
); // Note: In a production environment, ensure to handle JWT secret securely and consider token expiration and refresh mechanisms.
}

// Middleware to authenticate JWT tokens for protected routes
function authenticateJWT(req, res, next) {
	const authHeader = req.headers.authorization;

// Example protected route
app.get('/profile', authenticateJWT, (req, res) => {
  res.json({ message: `Welcome user ${req.user.id}` });
});

//TODO: Login endpoint should: validate input, check user existence w/ database table, compare hashed passwords w/ db, generate JWT, handle errors and update global state of app to logged in user and load user profile data
// Verify user credentials async using authenticateUser method and issue JWT (Login), with rate limiting to prevent brute-force attacks
app.post('/login', loginLimiter, async (req, res) => {
	// method to authenticate a user using Node.js, Express, bcrypt, JWT, and MySQL
	const { username, password } = req.body;
	if (!username || !password) {
		return res.status(400).json({ error: 'Username and password are required.' });
	}
	try {
		const result = await authenticateUser(username, password);
		return res.json(result); // Return user info and token
	} catch (err) {
		return res.status(err.status || 500).json({ error: err.error || 'Internal server error' });
	}
});

// Endpoint to update user profile (Update)
app.put('/userprofile/:id', (req, res) => {
	// Update user profile table(email, role) located by id 
	const userId = req.params.id;
	const { username, email, role } = req.body;
	// table columns:[varchar(45) username, 
	// varchar(255) password(hashed){note: user will enter plain text, so authentication must hash the plaintext and compare hashes}, 
	// nullable varchar(45) email, 
	// enum role{default 'user','photographer','videographer','musician','technician','admin'}
	// timestamp created]
	const updateQuery = 'UPDATE profiledata.userprofile SET username = ?, email = ?, role = ? WHERE idusers = ?';
	const values = [username, email, role, userId];
	dbconn.query(updateQuery, values, (err, data) => {
		if (err) return res.status(500).json({ error: err.message });
		return res.json({ message: 'User profile updated successfully!' });
	});
});

// Endpoint to delete user profile (Delete)
app.delete('/userprofile/:id', (req, res) => {
	const userId = req.params.id;
	const deleteQuery = 'DELETE FROM profiledata.userprofile WHERE idusers = ?';
	dbconn.query(deleteQuery, [userId], (err, data) => {
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