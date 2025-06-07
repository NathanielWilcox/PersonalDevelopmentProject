import React from 'react';
import '../index.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { handleLogin, handleLogout } from '../utils/authActions'; // Only use handleLogout for logout logic, handleLogin is not used in NavBar(see Login component for login logic)
import Cookies from 'js-cookie';

const NavBar = ({ onLogout }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Use global loggedIn state from Redux and the reducer
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn); // Accessing the global state for login status
    console.log('NavBar isLoggedIn:', isLoggedIn); // Debugging log to check login status
    // Example: Store user data as cookies when logged in

    // Get user data from Redux (replace 'user' with your actual user state)
    const user = useSelector((state) => state.auth.user);
    // Debugging log to check if user is logged in
    console.log('NavBar user:', useSelector((state) => state.auth.user)); // Debugging log to check user state


    // Debugging log to check if dispatch, navigate and cookies are working
    console.log('NavBar dispatch:', dispatch); // Debugging log to check dispatch
    console.log('NavBar navigate:', navigate); // Debugging log to check navigate
    console.log('NavBar Cookies:', Cookies.get()); // Debugging log to check cookies

    //TODO: Remove test user data and replace with db connections and API calls
    // const testUser = {
    //     username: 'testuser',
    //     email: 'test@email.com'
    // };
    // console.log('Test User:', testUser); // Debugging log to check test user data
    
    

    React.useEffect(() => {
        if (isLoggedIn && user) {
            // Set user data as cookies (e.g., username)
            Cookies.set('username', user.username, { expires: 7 });
            // Add more user fields as needed
        } else {
            // Remove cookies on logout
            Cookies.remove('username');
        }
    }, [isLoggedIn, user]);

    const handleLoginClick = () => {
        // Dispatch login action and navigate to Login page
        // This just sends the user to the login page, actual login logic is handled in Login component
        navigate('/login', { state: { from: '/home' } }); // Redirect to login page
    };
    const handleLogoutClick = () => {
        // Only use handleLogout for logout logic
        handleLogout(dispatch, onLogout);
    }
  
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
                {isLoggedIn && (
                    <li>
                        <NavLink to="/profile" className="nav-link">Profile</NavLink>
                    </li>
                )}
                <li>
                    {isLoggedIn ? (
                        <NavLink to="/home" className="nav-link" onClick={handleLogoutClick}>Logout</NavLink>
                    ) : (
                        <NavLink to="/login" className="nav-link" onClick={handleLoginClick}>Login</NavLink>
                    )}
                </li>
            </ul>
        </nav>
    );
};

export default NavBar;
// TODO: Refactor NavBar to use a dedicated CSS file for styling instead of importing component files.
// TODO: Highlight the active NavLink based on the current route.
// TODO: Add accessibility features (aria-labels, keyboard navigation).
// TODO: Make NavBar responsive for mobile devices (hamburger menu).
// TODO: Add user avatar or name when logged in.
// TODO: Write unit tests for NavBar component.
// TODO: Optimize NavBar rendering to avoid unnecessary re-renders.
