// Database connection configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'rootdev04061997!', // replace with your actual password
    database: 'DevComputerNateSQLServer', // replace with your actual database name
    port: 3006
};

// server port configuration
const serverConfig = {
    port: 8800,
    hostname: 'localhost'
};

// // JWT configuration (if needed for authentication)
// const jwtConfig = {
//     secret: 'your_jwt_secret',
//     expiresIn: '1h'
// };

// cors configuration
const corsConfig = {
    origin: 'http://localhost:3000', // replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};


export { dbConfig, serverConfig, corsConfig }; // Add JWT if uncommented