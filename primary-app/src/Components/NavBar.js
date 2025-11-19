import React from 'react';
import '../index.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { handleLogout } from '../utils/authActions';
import Cookies from 'js-cookie';

const NavBar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const user = useSelector((state) => state.auth.user);

    // Set or remove cookies based on login state
    React.useEffect(() => {
        if (isLoggedIn && user) {
            Cookies.set('username', user.username, { expires: 7, secure: true });
        } else {
            Cookies.remove('username');
        }
    }, [isLoggedIn, user]);

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleLogoutClick = () => {
        handleLogout(dispatch, navigate);
    };

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
                        <button onClick={handleLogoutClick} className="nav-link logout-btn">Logout</button>
                    ) : (
                        <NavLink to="/login" className="nav-link" onClick={handleLoginClick}>Login</NavLink>
                    )}
                </li>
            </ul>
        </nav>
    );
};

export default NavBar;
