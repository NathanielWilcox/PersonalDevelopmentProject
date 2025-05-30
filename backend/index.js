import express from 'express';
import mysql from 'mysql';
import cors from 'cors';

const app = express();

const dbconn = mysql.createConnection({
	host: 'localhost', // Database host
	user: 'admin', // Database username
	password: 'rootdev04061997!', // Database password
	database: 'NateSQLServerDevelopment', // Database name
});
// Create a second database connection for testing purposes
// This connection can be used for testing or development without affecting the main database
// const dbconn1 = mysql.createConnection({
// 	host: 'localhost', // Database host
// 	user: 'root', // Database username
// 	password: 'rootdev',
// 	database: 'test',
// });


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
	res.json('hello from the express backend!');
});

app.get('/userprofiletable', (req, res) => {
	const q = 'SELECT * FROM userprofiletable';
	dbconn.query(q, (err, data) => {
		if (err) return res.json({ error: err.message }); // Handle error and send response
		return res.json(data);
	});
});

app.post('/userprofiletable', (req, res) => {
	const q =
		"INSERT INTO userprofiletable ('idusers', 'username', 'userpassword') VALUES (?)";
	const values = [req.body.id, req.body.name, req.body.password];

	dbconn.query(q, [values], (err, data) => {
		if (err) return res.json(err); // Handle error and send response
		// If the query was successful, return the response with the inserted data
		return res.json({ message: 'User profile created successfully!', data });
	});

	dbconn.query(q, [values], (err, data) => {
		if (err) return res.json(err);
		return res.json({ message: 'User profile created successfully!', data });
	});
});

app.post('/login', (req, res) => {
	const { username, password } = req.body;
	const q = 'SELECT * FROM userprofiletable WHERE name = ? AND password = ?';
	const values = [username, password];

	dbconn.query(q, values, (err, data) => {
		if (err) return res.json({ error: err.message });
		if (data.length > 0) {
			return res.json({ message: 'Login successful!', user: data[0] });
		} else {
			return res.status(401).json({ message: 'Invalid username or password' });
		}
	});
});

app.listen(8800, () => {
	console.log(
		'Welcome to the backend server!, running on http://localhost:8800.\nThis is the backend server for the React + Node.js + Express + MySQL example application.'
	);
	console.log('Database connection established successfully!');
	console.log('You can now access the API endpoints at http://localhost:8800/');
	console.log('Available endpoints:');
	console.log('- GET /: Returns a welcome message');
	console.log('- GET /userprofiletable: Fetch all user profiles');
	console.log('- POST /userprofiletable: Create a new user profile');
	console.log('- POST /login: Authenticate a user');
	console.log('frontend endpoints(http://localhost:3000):');
	console.log('- GET /home: Home page');
	console.log('- GET /login: Login page');
	console.log('- GET /map: Map page');
	console.log('- GET /profile: User profile page');
	console.log('SQL Server Connection Details:');
	console.log('Database Host: localhost');
	console.log('Database User: root');
	console.log('Database Port: 3006');
});
