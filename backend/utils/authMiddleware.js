import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError, withJwtErrorHandling } from './errorHandling.js';

/**
 * Middleware to verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];
    await withJwtErrorHandling(async () => {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }, 'Invalid or expired token');
};

/**
 * Middleware to verify user roles
 * @param {string[]} allowedRoles - Array of roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
export const verifyRoles = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            throw new AuthenticationError('User not authenticated');
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new AuthorizationError('User not authorized to access this resource');
        }

        next();
    };
};