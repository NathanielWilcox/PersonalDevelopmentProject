import { loginStart, loginSuccess, loginFailure, logout } from '../store/authSlice';
import Cookies from 'js-cookie';
// import axios from 'axios';
// TODO: Implement CRUD operations for user management operations
// TODO: Implment JWT authentication for secure API access

// Use environment variable for API base URL; ensure REACT_APP_API_BASE_URL is set in your production environment
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// const handleLogin = (credentials) => async (dispatch, navigate) => {
//     try {
//         dispatch(loginStart());
//         const response = await axios.post(`${API_BASE_URL}/login`, credentials);
//         const { user, token } = response.data;
        
//         localStorage.setItem('token', token); // Store token in local storage
//         dispatch(loginSuccess({ user, token }));
//         Cookies.set('token', token, { expires: 7, secure: true });
        
//         // Navigate to home page after successful login
//         navigate('/home', { state: { user } });
//     } catch (error) {
//         console.error('Login error:', error);
//         dispatch(loginFailure(error.response?.data?.message || 'Login failed, please try again'));
//     }
// };

const handleLogin = (userData, navigate) => async (dispatch) => { // Redux thunk pattern
    dispatch(loginStart());
    // Validate userData before making API call
    if (!userData || !userData.username || !userData.password) {
        dispatch(loginFailure('Username and password are required'));
        return;
    }
    // Make API call to login endpoint
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (response.ok) {
            const data = await response.json();
            dispatch(loginSuccess({ user: data.user, token: data.token }));
            // Persist token in localStorage and cookies
            localStorage.setItem('token', data.token);
            Cookies.set('token', data.token, { expires: 7, secure: true });
            if (userData && userData.username) {
                Cookies.set('username', userData.username, { expires: 7, secure: true });
            }
            // Navigate to Home page after login
            if (navigate && data.user) {
                navigate('/home', { state: { user: data.user } });
            }
        } else {
            const errorData = await response.json();
            dispatch(loginFailure(errorData.message || 'Login failed, please try again'));
        }
    } catch (error) {
        // Log error with additional context for debugging
        console.error('Login error in handleLogin:', error, {
            userData,
            apiUrl: `${API_BASE_URL}/login`
        });
        dispatch(loginFailure(error.message || 'Login failed, please try again'));
    }
};
const handleLogout = (dispatch, navigate) => {
    // Clear user data and token from local storage and cookies
    localStorage.removeItem('token');
    Cookies.remove('token');
    Cookies.remove('username');
    
    // Dispatch logout action to update Redux state
    dispatch(logout());
    
    // Redirect to login page after logout
    if (navigate) {
        navigate('/login');
    }
};

const redirectToHome = () => {
    // Redirect to home page after logout
    if (window.location.pathname !== '/home') {
        window.location.href = '/home';
    }
};

export { handleLogin, handleLogout, redirectToHome }; // Export the functions for use in components