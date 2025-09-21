import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
dotenv.config();

// Destructure environment variables
const {
  BACKEND_PORT,
  FRONTEND_HOST,
  FRONTEND_HOSTNAME,
  DB_HOST,
  DB_USER,
} = process.env;

async function waitForDb() {
  let retries = 10;
  while (retries) {
    try {
      console.log(`⏳ Checking MySQL... (${retries} retries left)`);

      const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_CONNECTION_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT)
      });

      await conn.query('SELECT 1'); // lightweight ping
      await conn.end();

      console.log('✅ MySQL is ready to accept connections');
      return;
    } catch (err) {
      console.log(`❌ MySQL not ready: ${err.code || err.message}`);
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000)); // wait 5s
    }
  }
  throw new Error('❌ Could not connect to MySQL after multiple retries');
}

export async function initDbPool() {
  await waitForDb();

  // Create the pool only after DB is confirmed ready
  return mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_CONNECTION_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}


await waitForDb();


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


export { serverConfig, corsConfig }; // Add JWT if uncommented