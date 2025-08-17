import dotenv from 'dotenv';
dotenv.config();

const {
    FRONTEND_HOST,
    FRONTEND_HOSTNAME,
    BACKEND_PORT,
    DB_HOST,
    DB_USER,
    DB_CONNECTION_PASSWORD,
    DB_NAME,
    DB_PORT
} = process.env;

const dbConfig = {
    host: DB_HOST,
    user: DB_USER,
    password: DB_CONNECTION_PASSWORD, 
    database: DB_NAME,
    port: DB_PORT || 3006, // Default MySQL port
    connectionLimit: 10, // Optional: Set connection limit for the pool
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