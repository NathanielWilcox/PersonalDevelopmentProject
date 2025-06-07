import { loginStart, loginSuccess, loginFailure, logout } from '../store/authSlice';
import Cookies from 'js-cookie';

export const handleLogin = (dispatch, userData, navigate) => {
    dispatch(loginStart());
    if (!userData || !userData.username || !userData.password) {
        dispatch(loginFailure('Username and password are required'));
        return;
    }
    // Simulate token generation (replace with real API call as needed)
    const token = 'dummy-token';
    dispatch(loginSuccess({ user: userData, token }));
    if (userData && userData.username) {
        Cookies.set('username', userData.username, { expires: 7 });
    }
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
