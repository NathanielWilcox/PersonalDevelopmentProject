import React from 'react';
import NavBar from '../Components/NavBar';
import '../index.css';

const Home = () => {
	return (
		<div className="home-container">
			<NavBar />
			<div className="content">
				<h1>Welcome to the Home Page</h1>
				<p>This is the main page of the application.</p>
			</div>
		</div>
	);
};

export default Home;
