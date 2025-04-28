import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import NavBar from '../Components/NavBar';
import '../index.css';
import Map from './Map';
import Profile from './Profile';

const Home = () => {
	return (
		<Router>
			<div className="home-container">
				<NavBar />
				<div className="content">
					<h1>Welcome to the Home Page</h1>
					<p>This is the main page of the application.</p>
					<Routes>
						<Route path="/Map" element={<Map />} />
						<Route path="/Profile" element={<Profile />} />
					</Routes>
				</div>
			</div>
		</Router>
	);
};

export default Home;
