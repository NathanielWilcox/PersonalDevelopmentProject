import { loginStart, loginSuccess, loginFailure, logout } from '../store/authSlice';
import Cookies from 'js-cookie';
import { handleApiResponse, withErrorHandling } from './errorHandling';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Enhanced login handler with consistent error handling
const handleLogin = (userData, navigate) => async (dispatch) => {
    dispatch(loginStart());

    if (!userData?.username || !userData?.password) {
        dispatch(loginFailure('Username and password are required'));
        return;
    }

    try {
        await withErrorHandling(async () => {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await handleApiResponse(response);
            const { id, username, email, role, token } = data;

            // Store auth data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ id, username, email, role }));

            Cookies.set('token', token, { expires: 7, secure: true });
            Cookies.set('username', username, { expires: 7, secure: true });

            // Update application state
            dispatch(loginSuccess({ user: { id, username, email, role}, token }));
            
            if (navigate) {
                navigate('/home', { state: { user: { id, username, email, role } } });
            }
        }, (error) => {
            const message = error.status === 401 ? 'Invalid username or password' : 
                        error.message || 'Login failed, please try again';
            dispatch(loginFailure(message));
        })();
    } catch (error) {
        console.error('Login error in handleLogin:', error, {
            userData,
            apiUrl: `${API_BASE_URL}/login`
        });
    }
};

// Enhanced logout handler
const handleLogout = withErrorHandling(async (dispatch, navigate) => {
    // Clear user data and token from local storage and cookies
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    Cookies.remove('token');
    Cookies.remove('username');
    
    // Dispatch logout action to update Redux state
    dispatch(logout());
    
    // Redirect to login page after logout
    if (navigate) {
        navigate('/login');
    }
}, console.error); // Just log any errors that occur during logout

const redirectToHome = withErrorHandling(async () => {
    if (window.location.pathname !== '/home') {
        window.location.href = '/home';
    }
}, console.error);

export { handleLogin, handleLogout, redirectToHome };