import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError, withJwtErrorHandling } from './errorHandling.js';

/**
 * Middleware to verify JWT token from HTTP-only cookie or Authorization header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const verifyToken = (req, res, next) => {
    try {
        // First try to get token from HTTP-only cookie
        let token = req.cookies?.token;

        // Fallback to Authorization header if no cookie
        if (!token) {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new AuthenticationError('Missing or invalid authorization header');
            }
            token = authHeader.split(' ')[1];
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        next(err); // Pass error to error handler middleware
    }
};

/**
 * Middleware to verify user roles
 * @param {string[]} allowedRoles - Array of roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
export const verifyRoles = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user || !req.user.role) {
                throw new AuthenticationError('User not authenticated');
            }

            if (!allowedRoles.includes(req.user.role)) {
                throw new AuthorizationError('User not authorized to access this resource');
            }

            next();
        } catch (err) {
            next(err); // Pass error to error handler middleware
        }
    };
};