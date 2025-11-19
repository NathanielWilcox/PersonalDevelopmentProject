import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_CONNECTION_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306
};

console.log('Testing DB Connection with config:', { ...dbConfig, password: '****' });

async function test() {
    try {
        const conn = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to MySQL!');
        await conn.end();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
    }
}

test();
