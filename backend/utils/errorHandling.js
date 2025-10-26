/**
 * Custom error classes for different types of errors
 */
export class DatabaseError extends Error {
    constructor(message, cause = null) {
        super(message);
        this.name = 'DatabaseError';
        this.cause = cause;
        this.statusCode = 500;
    }
}

export class ValidationError extends Error {
    constructor(message, fields = {}) {
        super(message);
        this.name = 'ValidationError';
        this.fields = fields;
        this.statusCode = 400;
    }
}

export class AuthenticationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AuthenticationError';
        this.statusCode = 401;
    }
}

export class AuthorizationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AuthorizationError';
        this.statusCode = 403;
    }
}

export class ResourceNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ResourceNotFoundError';
        this.statusCode = 404;
    }
}

export class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConflictError';
        this.statusCode = 409;
    }
}

/**
 * Async error handler middleware for Express
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global error handling middleware for Express
 */
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', {
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        cause: err.cause,
        fields: err.fields,
    });

    // Determine appropriate status code
    const statusCode = err.statusCode || 500;

    // Format error response
    const errorResponse = {
        error: {
            message: err.message,
            code: err.name,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
            ...(err.fields && { fields: err.fields }),
        },
    };

    res.status(statusCode).json(errorResponse);
};

/**
 * Database operation wrapper with error handling
 * @param {Function} operation - Database operation to execute
 * @returns {Promise} - Resolves with operation result or rejects with appropriate error
 */
export const withDbErrorHandling = async (operation) => {
    try {
        return await operation();
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            throw new ConflictError('Resource already exists');
        }
        if (err.code === 'ER_NO_REFERENCED_ROW') {
            throw new ValidationError('Invalid reference to related resource');
        }
        throw new DatabaseError('Database operation failed', err);
    }
};

/**
 * JWT error handling wrapper
 * @param {Function} operation - JWT operation to execute
 * @param {string} errorMessage - Custom error message for JWT failures
 * @returns {Promise} - Resolves with operation result or rejects with appropriate error
 */
export const withJwtErrorHandling = async (operation, errorMessage = 'JWT operation failed') => {
    try {
        return await operation();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            throw new AuthenticationError('Invalid token');
        }
        if (err.name === 'TokenExpiredError') {
            throw new AuthenticationError('Token expired');
        }
        throw new AuthenticationError(errorMessage);
    }
};

/**
 * Input validation wrapper that checks required fields and formats
 * @param {Object} data - Input data to validate
 * @param {Object} schema - Validation schema with field requirements
 * @throws {ValidationError} If validation fails
 */
export const validateInput = (data, schema) => {
    const errors = {};

    for (const [field, requirements] of Object.entries(schema)) {
        // Check required fields
        if (requirements.required && !data[field]) {
            errors[field] = `${field} is required`;
            continue;
        }

        // Skip validation if field is not present and not required
        if (!data[field]) continue;

        // Validate field format if pattern is specified
        if (requirements.pattern && !requirements.pattern.test(data[field])) {
            errors[field] = requirements.message || `Invalid ${field} format`;
        }

        // Validate field length if specified
        if (requirements.minLength && data[field].length < requirements.minLength) {
            errors[field] = `${field} must be at least ${requirements.minLength} characters`;
        }
        if (requirements.maxLength && data[field].length > requirements.maxLength) {
            errors[field] = `${field} must not exceed ${requirements.maxLength} characters`;
        }

        // Validate enum values if specified
        if (requirements.enum && !requirements.enum.includes(data[field])) {
            errors[field] = `${field} must be one of: ${requirements.enum.join(', ')}`;
        }
    }

    if (Object.keys(errors).length > 0) {
        throw new ValidationError('Validation failed', errors);
    }
};