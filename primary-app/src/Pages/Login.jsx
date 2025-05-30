import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [popupMessage, setPopupMessage] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8800/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (response.ok) {
                setPopupMessage('Login successful');
                setIsLoggedIn(true);
                setTimeout(() => {
                    setPopupMessage('');
                    navigate('/home');
                }, 1000);
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
            const response = await fetch('http://localhost:8800/userprofiletable', {
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
            } else {
                setPopupMessage('Unable to create profile, try again please');
            }
        } catch (error) {
            console.error('Error creating profile:', error);
            setPopupMessage('Unable to create profile, try again please');
        }
        setTimeout(() => setPopupMessage(''), 3000);
    };
    // TODO: make loggedIn state global using Redux.
    const onLogout = () => {
        setIsLoggedIn(false);
        setUsername('');
        setPassword('');
        setPopupMessage('Logged out successfully');
        navigate('/login');
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