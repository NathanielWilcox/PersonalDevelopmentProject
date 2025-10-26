import bcrypt from 'bcryptjs';
import mysql from 'mysql2';
import dotenv from 'dotenv'; 
dotenv.config();

// Update these credentials to match your .env or config
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_CONNECTION_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

const saltRounds = 10;

// Select all users and their current passwords
connection.query('SELECT idusers, password FROM userprofile', async (err, results) => {
    if (err) {
        console.error('Error fetching users:', err);
        connection.end();
        return;
    }

    for (const row of results) {
        const { idusers, userpassword } = row;

        // Optionally, skip if already hashed (bcrypt hashes start with $2)
        if (userpassword.startsWith('$2')) {
            console.log(`User ${idusers} already has a hashed password.`);
            continue;
        }

        try {
            const hash = await bcrypt.hash(userpassword, saltRounds);

            // Update the userpassword column with the hashed password
            connection.query(
                'UPDATE userprofile SET password = ? WHERE idusers = ?',
                [hash, idusers],
                (updateErr) => {
                    if (updateErr) {
                        console.error(`Error updating password for user ${idusers}:`, updateErr);
                    } else {
                        console.log(`Password for user ${idusers} updated to hashed value.`);
                    }
                }
            );
        } catch (hashErr) {
            console.error(`Error hashing password for user ${idusers}:`, hashErr);
        }
    }

    // End connection after all updates are done
    setTimeout(() => connection.end(), 2000); // Give time for all updates to finish
});