import express from 'express';
import mysql from 'mysql';

const app = express();

const dbconn = mysql.createConnection({
	host: 'localhost', // Database host
	user: 'root', // Database username
	password: 'rootdev',
	database: 'test',
});

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
		"INSERT INTO userprofiletable ('name', 'email', 'phone') VALUES (?)";
	const values = [req.body.name, req.body.email, req.body.phone];

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

app.listen(8800, () => {
	console.log(
		`Welcome to the backend server!, running on http://localhost:8800. 
        \nThis is the backend server for the React + Node.js + Express + MongoDB example application. `
	);
});
