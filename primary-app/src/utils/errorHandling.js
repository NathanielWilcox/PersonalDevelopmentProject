/**
 * Custom error class for API responses
 */
export class APIError extends Error {
    constructor(message, status, details = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.details = details;
    }
}

/**
 * Handles API response checking and error conversion
 * @param {Response} response - Fetch API response object
 * @returns {Promise} - Resolves with response JSON or throws APIError
 */
export async function handleApiResponse(response) {
    let data = null;
    const contentType = response.headers.get('content-type');
    
    try {
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            data = text ? { message: text } : null;
        }
    } catch (err) {
        console.error('Failed to parse response:', err);
        data = null;
    }
    
    if (!response.ok) {
        const errorMessage = 
            typeof data?.error === 'string' ? data.error :
            typeof data?.error?.message === 'string' ? data.error.message :
            data?.message || `HTTP ${response.status}: ${response.statusText}`;
        
        throw new APIError(errorMessage, response.status, data);
    }
    
    return data;
}

/**
 * Creates a user-friendly error message based on error type and details
 * @param {Error} error - The caught error object
 * @returns {string} - User-friendly error message
 */
export function getUserFriendlyError(error) {
    if (error instanceof APIError) {
        switch (error.status) {
            case 400:
                return 'Please check your input and try again';
            case 401:
                return 'Invalid username or password';
            case 403:
                return 'You do not have permission to perform this action';
            case 404:
                return 'The requested resource was not found';
            case 409:
                return 'This username is already taken';
            case 500:
                return 'Server error. Please try again later';
            default:
                return error.message || 'An unexpected error occurred';
        }
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return 'Unable to connect to the server. Please check your internet connection';
    }

    return 'An unexpected error occurred. Please try again';
}

/**
 * Wraps an async function with consistent error handling
 * @param {Function} asyncFn - The async function to wrap
 * @param {Function} setError - Function to set error message
 * @param {Function} setLoading - Optional function to set loading state
 * @returns {Function} - Wrapped function with error handling
 */
export function withErrorHandling(asyncFn, setError, setLoading = null) {
    return async (...args) => {
        try {
            if (setLoading) setLoading(true);
            if (setError) setError(null); // Clear previous errors
            
            const result = await asyncFn(...args);
            return result;
        } catch (error) {
            console.error('Operation failed:', error);
            const message = getUserFriendlyError(error);
            if (setError) setError(message);
            throw error; // Re-throw for additional handling if needed
        } finally {
            if (setLoading) setLoading(false);
        }
    };
}