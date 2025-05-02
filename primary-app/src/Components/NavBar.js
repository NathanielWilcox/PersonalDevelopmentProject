import React from 'react';
import { NavLink } from 'react-router-dom';

const NavBar = () => {
	return (
		<nav className="navbar">
			<ul>
				<li>
					<NavLink to="/">Home</NavLink>
				</li>
				<li>
					<NavLink to="/map">Map</NavLink>
				</li>
				<li>
					<NavLink to="/profile">Profile</NavLink>
				</li>
			</ul>
		</nav>
	);
};

export default NavBar;
// This component creates a navigation bar with links to the Home, Map, and Profile pages.
