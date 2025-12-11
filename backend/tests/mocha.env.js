// Setup environment for tests
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.DB_USER = 'root';
process.env.DB_CONNECTION_PASSWORD = 'rootdev04061997!';
process.env.DB_NAME = 'profiledata';
process.env.JWT_SECRET = 'test-secret-key-do-not-use-in-production';
process.env.BACKEND_PORT = '8800';
process.env.FRONTEND_HOST = 'http://localhost:3000';
