import { logout } from '../store/authSlice';
import Cookies from 'js-cookie';

export const handleLogin = (dispatch, userData, navigate) => {
    // Dispatch login action to update global state and set isLoggedIn to true
    dispatch({
        type: 'auth/login',
        payload: userData, // userData should contain known profile info
    });
    // Optionally set cookies for user info
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
