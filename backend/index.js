import express from 'express';
import mysql from 'mysql';

const app = express();

const dbconn = mysql.createConnection({
	host: 'localhost', // Database host
	user: 'root', // Database username
	password: 'rootdev',
	database: 'test',
});

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

app.listen(8800, () => {
	console.log(
		`Welcome to the backend server!, running on http://localhost:8800. 
        \nThis is the backend server for the React + Node.js + Express + MongoDB example application. `
	);
});
