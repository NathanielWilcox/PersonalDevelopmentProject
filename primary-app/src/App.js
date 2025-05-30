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
