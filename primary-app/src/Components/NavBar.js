import React from 'react';
import { NavLink } from 'react-router-dom';
import '../Pages/Home.jsx'; // Importing styles from Home.jsx for consistent styling
import '../Pages/Map.jsx'; // Importing styles from Map.jsx for consistent styling
import '../Pages/Login.jsx'; // Importing styles from Login.jsx for consistent styling
import '../Pages/Profile.jsx'; // Importing styles from Profile.jsx for consistent styling


const NavBar = ({ isLoggedIn, onLogout }) => {
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
					{isLoggedIn ? (
						<button className="nav-link" onClick={onLogout}>Logout</button>
					) : (
						<NavLink to="/login" className="nav-link">Login</NavLink>
					)}
				</li>
			</ul>
		</nav>
	);
};

export default NavBar;
// TODO: Refactor NavBar to use a dedicated CSS file for styling instead of importing component files.
// TODO: Use Redux or React Context to manage isLoggedIn state globally.
// TODO: Ensure onLogout properly updates global authentication state and redirects to login page.
// TODO: Highlight the active NavLink based on the current route.
// TODO: Add accessibility features (aria-labels, keyboard navigation).
// TODO: Make NavBar responsive for mobile devices (hamburger menu).
// TODO: Add user avatar or name when logged in.
// TODO: Write unit tests for NavBar component.
// TODO: Optimize NavBar rendering to avoid unnecessary re-renders.
