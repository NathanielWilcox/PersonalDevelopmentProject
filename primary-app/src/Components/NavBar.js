import React from 'react';
import { NavLink } from 'react-router-dom';
import '../Pages/Home.jsx'; // Importing styles from Home.jsx for consistent styling
import '../Pages/Map.jsx'; // Importing styles from Map.jsx for consistent styling
import '../Pages/Login.jsx'; // Importing styles from Login.jsx for consistent styling
import '../Pages/Profile.jsx'; // Importing styles from Profile.jsx for consistent styling


const NavBar = () => {
	return (
		<nav className="navbar">
			<ul className="navbar-left">
				<li>
					<NavLink to="/home" className="nav-link">Home</NavLink>
				</li>
				<li>
					<NavLink to="/map" className="nav-link">Map</NavLink>
				</li>
			</ul>
			<ul className="navbar-right">
				<li>
					<NavLink to="/profile" className="nav-link">Profile</NavLink>
				</li>
				<li>
					<NavLink to="/login" className="nav-link">Login</NavLink>
				</li>
			</ul>
		</nav>
	);
};

export default NavBar;
// This component creates a navigation bar with links to the Home, Map, and Profile pages.
