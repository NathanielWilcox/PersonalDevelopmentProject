import dotenv from 'dotenv';
dotenv.config();

// Destructure environment variables
const {
    REACT_APP_BACKEND_PORT,
    REACT_APP_FRONTEND_HOST,
    REACT_APP_FRONTEND_HOSTNAME,
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
    port: REACT_APP_BACKEND_PORT,
    hostname: REACT_APP_FRONTEND_HOSTNAME,
};

// // JWT configuration (if needed for authentication)
// const jwtConfig = {
//     secret: 'your_jwt_secret',
//     expiresIn: '1h'
// };

// cors configuration
const corsConfig = {
    origin: REACT_APP_FRONTEND_HOST,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};


export { dbConfig, serverConfig, corsConfig }; // Add JWT if uncommented