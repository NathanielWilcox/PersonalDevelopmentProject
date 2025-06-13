import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import '../index.css';
import { handleLogin } from '../utils/authActions';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [popupMessage, setPopupMessage] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const loginApiUrl = process.env.REACT_APP_LOGIN_API_URL;
    const updateProfileApiUrl = process.env.REACT_APP_UPDATE_PROFILE_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!username || !password) {
                setPopupMessage('Username and password are required');
                setTimeout(() => setPopupMessage(''), 3000);
                return;
            }
            const response = await fetch(
                loginApiUrl,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                }
            );
            if (response.ok) {
                setPopupMessage('Login successful');
                setTimeout(() => {
                    setPopupMessage('');
                    navigate('/home');
                }, 1000);
                handleLogin(dispatch, { username, password }, navigate);
                dispatch({ type: 'LOGIN_SUCCESS' });
                await fetch(
                    updateProfileApiUrl, 
                    {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                }
            );
            } else if (response.status === 401) {
                setPopupMessage('Invalid username or password');
            } else {
                setPopupMessage('Login failed, please check your credentials');
            }
        } catch (error) {
            console.error('Error:', error);
            setPopupMessage('Login failed, please try again');
        }
        setTimeout(() => setPopupMessage(''), 3000);
    };

    const handleCreateProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(process.env.REACT_APP_USER_PROFILE_BASE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Profile created:', data);
                setPopupMessage('Profile created');
                setUsername('');
                setPassword('');
                handleLogin(dispatch, { username, password }, navigate);
            } else {
                setPopupMessage('Unable to create profile, try again please');
            }
        } catch (error) {
            console.error('Error creating profile:', error);
            setPopupMessage('Unable to create profile, try again please');
        }
        setTimeout(() => setPopupMessage(''), 3000);
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h1>Login Portal</h1>
                {popupMessage && (
                    <div className="popup-message">{popupMessage}</div>
                )}
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button type="submit">Login</button>
                    <button type="button" onClick={handleCreateProfile}>Create Profile</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
// Note: The above code now uses Redux for global isLoggedIn state.
// TODO: Keep username, password, and popupMessage as local state.
// TODO: Move isLoggedIn to a global state manager (e.g., Redux or Context API) for app-wide access.
// TODO: Keep the navigate function from useNavigate local to the component.
// TODO: Update handleSubmit, handleCreateProfile, and onLogout to interact with global isLoggedIn state (dispatch actions if using Redux/Context).
// TODO: Keep error handling local unless a global error handler is needed.
