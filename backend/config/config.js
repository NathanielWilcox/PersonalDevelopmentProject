import dotenv from 'dotenv';
dotenv.config();

// Destructure environment variables
const {
    BACKEND_PORT,
    FRONTEND_HOST,
    FRONTEND_HOSTNAME,
} = process.env;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_CONNECTION_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
};

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