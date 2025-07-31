import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { dbConfig } from './config.js'; // Import database configuration
import rateLimit from 'express-rate-limit';

const app = express();

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

app.get('/', (req, res) => {
	res.json('hello from the express backend!');
});

app.get('/userprofiletable', getUserProfileLimiter, (req, res) => {
	const q = 'SELECT * FROM userprofiletable';
	dbconn.query(q, (err, data) => {
		if (err) return res.json({ error: err.message }); // Handle error and send response
		return res.json(data);
	});
});

app.post('/userprofiletable', createUserLimiter, async (req, res) => {
	const { id, name, password } = req.body;
	try {
		// Hash the password before storing
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);
		const q = "INSERT INTO userprofiletable (idusers, username, userpassword) VALUES (?, ?, ?)";
		dbconn.query(q, [id, name, hashedPassword], (err, data) => {
			if (err) return res.json({ error: err.message });
			return res.json({ message: 'User profile created successfully!', data });
		});
	} catch (err) {
		return res.status(500).json({ error: 'Error hashing password' });
	}
});

app.post('/login', loginLimiter, (req, res) => {
	const { username, password } = req.body;
	const q = 'SELECT * FROM userprofiletable WHERE username = ?';
	dbconn.query(q, [username], async (err, data) => {
		if (err) return res.json({ error: err.message });
		if (data.length === 0) {
			return res.status(401).json({ message: 'Invalid username or password' });
		}
		const user = data[0];
		try {
			const match = await bcrypt.compare(password, user.userpassword);
			if (match) {
				// Generate JWT token
				const payload = { id: user.idusers, username: user.username };
				const secret = process.env.JWT_SECRET || 'your_jwt_secret';
				const token = jwt.sign(payload, secret, { expiresIn: '1h' });
				return res.json({ message: 'Login successful!', user, token });
			} else {
				return res.status(401).json({ message: 'Invalid username or password' });
			}
		} catch (err) {
			return res.status(500).json({ error: 'Error comparing passwords' });
		}
	});
});

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