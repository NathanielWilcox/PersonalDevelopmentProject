import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import '../index.css';
import { handleLogin } from '../utils/authActions';
import { handleApiResponse, withErrorHandling } from '../utils/errorHandling';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('user');
    const [popupMessage, setPopupMessage] = useState('');
    const [activeForm, setActiveForm] = useState('login');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = withErrorHandling(async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setPopupMessage('Username and password are required');
            setTimeout(() => setPopupMessage(''), 3000);
            return;
        }

        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        await handleApiResponse(response);
        setPopupMessage('Login successful');
        setTimeout(() => {
            setPopupMessage('');
            navigate('/home');
        }, 1000);

        handleLogin(dispatch, { username, password }, navigate);
        dispatch({ type: 'LOGIN_SUCCESS' });
    }, setPopupMessage);

    const handleCreateProfile = withErrorHandling(async (e) => {
        e.preventDefault();

        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, email, role })
        });

        await handleApiResponse(response);
        setPopupMessage('Profile created successfully');
        setUsername('');
        setPassword('');
        setEmail('');
        setRole('user');

        await handleLogin(dispatch, { username, password }, navigate);
    }, setPopupMessage);

    return (
        <div className="login-page">
            <div className="tab-buttons">
                <button
                    className={activeForm === 'login' ? 'active' : ''}
                    onClick={() => setActiveForm('login')}
                >
                    Login
                </button>
                <button
                    className={activeForm === 'create' ? 'active' : ''}
                    onClick={() => setActiveForm('create')}
                >
                    Create Profile
                </button>
            </div>
            <div className="login-container">
                <h1>Login Portal</h1>
                {popupMessage && (
                    <div className="popup-message">{popupMessage}</div>
                )}

                {activeForm === 'login' && (
                    <form onSubmit={handleSubmit}>
                        <h2>Login</h2>
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
                    </form>
                )}

                {activeForm === 'create' && (
                    <form onSubmit={handleCreateProfile}>
                        <h2>Create Profile</h2>
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
                        <input
                            type="email"
                            placeholder="Email (optional)"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        <select value={role} onChange={e => setRole(e.target.value)}>
                            <option value="user">User</option>
                            <option value="photographer">Photographer</option>
                            <option value="videographer">Videographer</option>
                            <option value="musician">Musician</option>
                            <option value="artist">Artist</option>
                        </select>
                        <button type="submit">Create Profile</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
