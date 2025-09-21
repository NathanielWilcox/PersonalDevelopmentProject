import dotenv from 'dotenv';
import mysql from 'mysql2';
dotenv.config();


// Destructure environment variables
const {
  BACKEND_PORT,
  FRONTEND_HOST,
  FRONTEND_HOSTNAME,
  DB_HOST,
  DB_USER,
  DB_CONNECTION_PASSWORD,
  DB_NAME,
  DB_PORT,
} = process.env;

console.log('DB config:', {
  DB_HOST,
  DB_USER,
});

const dbConfig = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_CONNECTION_PASSWORD,
  database: DB_NAME,
  port: Number(DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


// server port configuration
const serverConfig = {
    port: BACKEND_PORT,
    hostname: FRONTEND_HOSTNAME,
};

// // JWT configuration (if needed for authentication)
// const jwtConfig = {
//     secret: 'your_jwt_secret',
//     expiresIn: '1h'
// };

// cors configuration
const corsConfig = {
    origin: FRONTEND_HOST,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};


export { dbConfig, serverConfig, corsConfig }; // Add JWT if uncommented