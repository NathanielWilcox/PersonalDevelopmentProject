import { loginStart, loginSuccess, loginFailure, logout } from '../store/authSlice';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8800/api';

export const handleLogin = async (dispatch, userData, navigate) => { // Utility function to handle login logic
    dispatch(loginStart());
    // Simulate an API call for login
    if (!userData || !userData.username || !userData.password) {
        dispatch(loginFailure('Username and password are required'));
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (response.ok) {
            const data = await response.json();
            dispatch(loginSuccess({ user: data.user, token: data.token }));
        } else if (response.status === 401) {
            dispatch(loginFailure('Invalid username or password'));
        } else {
            dispatch(loginFailure('Login failed, please try again'));
        }
    }
    catch (error) {
        console.error('Login error:', error);
        dispatch(loginFailure('Login failed, please try again'));
    }
    if (userData && userData.username) {
        Cookies.set('username', userData.username, { expires: 7 });
    }
    // Navigate to Home page after login
    navigate('/home', { state: { userData } });
};

export const handleLogout = (dispatch, onLogout) => {
    dispatch(logout());
    Cookies.remove('username');
    if (onLogout) {
        onLogout();
    }
    window.location.href = '/home';
};
