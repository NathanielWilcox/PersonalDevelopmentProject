import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './Components/NavBar';
import './index.css';
import Login from './Pages/Login';
import Home from './Pages/Home';
import Map from './Pages/Map';
import Profile from './Pages/Profile';

const App = () => {
	return (
		<>
		<NavBar />
		<Routes>
			<Route path="/login" element={<Login />} />
			<Route path="/home" element={<Home />} />
			<Route path="/map" element={<Map />} />
			<Route path="/profile" element={<Profile />} />
			<Route path="/" element={<Home />} />
		</Routes>
		</>
	);
};

export default App;
// TODO: Protect routes and handle user authorization.
// TODO: Implement user roles and permissions.
/*
TODO: 
- Protect routes and handle user authorization.
- Implement user roles and permissions.
- Add error boundaries for better error handling.
- Implement input validation and sanitization.
- Use HTTPS and secure cookies for authentication.
- Store sensitive data securely (avoid localStorage for tokens).
- Add logging and monitoring for critical actions.
- Handle loading and error states in UI components.
- Implement rate limiting and brute-force protection on login.
- Ensure accessibility (a11y) best practices.
- Add unit and integration tests for components and routes.
- Keep dependencies up to date and monitor for vulnerabilities.
- Use environment variables for configuration and secrets.
- Implement logout and session expiration handling.
- Provide user feedback for failed actions and errors.
*/