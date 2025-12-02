import dotenv from 'dotenv';
dotenv.config();

// Destructure environment variables
const {
  BACKEND_PORT,
  FRONTEND_HOST,
  FRONTEND_HOSTNAME,
} = process.env;

const serverConfig = {
  port: BACKEND_PORT,
  hostname: FRONTEND_HOSTNAME,
};

const corsConfig = {
  origin: FRONTEND_HOST,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

export { serverConfig, corsConfig };