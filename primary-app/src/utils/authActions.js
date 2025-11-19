import { loginStart, loginSuccess, loginFailure, logout } from '../store/authSlice';
import Cookies from 'js-cookie';
import { handleApiResponse } from './errorHandling';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Enhanced login handler with consistent error handling
const handleLogin = (userData, navigate) => async (dispatch) => {
    console.log('🔵 handleLogin called with:', userData);
    dispatch(loginStart());

    if (!userData?.username || !userData?.password) {
        console.log('❌ Missing credentials');
        dispatch(loginFailure('Username and password are required'));
        return;
    }

    try {
        console.log('🔵 Making API call to:', `${API_BASE_URL}/login`);
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        console.log('🔵 Response status:', response.status);
        const data = await handleApiResponse(response);
        console.log('🔵 Response data:', data);

        const { id, username, email, role, token } = data;

        // Store auth data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ id, username, email, role }));

        Cookies.set('token', token, { expires: 7, secure: true });
        Cookies.set('username', username, { expires: 7, secure: true });

        // Update application state
        console.log('✅ Dispatching loginSuccess with user:', { id, username, email, role });
        dispatch(loginSuccess({ user: { id, username, email, role }, token }));

        if (navigate) {
            console.log('🔵 Navigating to /home');
            navigate('/home', { state: { user: { id, username, email, role } } });
        }
    } catch (error) {
        const message = error.status === 401 ? 'Invalid username or password' :
            error.message || 'Login failed, please try again';
        console.error('❌ Login error:', error);
        dispatch(loginFailure(message));
    }
};

// Enhanced logout handler
const handleLogout = (dispatch, navigate) => {
    console.log('🔵 handleLogout called');
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
};

export { handleLogin, handleLogout };