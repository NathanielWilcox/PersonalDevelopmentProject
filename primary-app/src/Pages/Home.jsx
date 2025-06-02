import React from 'react';
import '../index.css';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const isLoggedIn = useSelector((state) => state.loggedIn.value);
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <div className="home-container">
            <h1>Welcome to the Creative Community</h1>
            <p>
                Connect with artists, musicians, and other creatives. Share your work, discover new talent, and collaborate on projects.
            </p>
            {/* {!isLoggedIn && (
                <button className="login-button" onClick={handleLoginClick}>
                    Login to Join
                </button>
            )} */}
        </div>
    );
}

export default Home;
// TODO: Build main component(Feed of posts, profiles, locations, that artists, musicians, and other creatives can share with each other. With a focus on community building and collaboration.)
// TODO: Add a search bar to the home page that allows users to search for posts, profiles, and locations. (Only to be used by logged in users. No messaging capability, just discovery and their own contact info[that the user can choose to share or not]. And a way to report posts that are inappropriate or offensive.)
// TODO: Add a way for users to filter posts by category (e.g. music, art, etc.). (Only to be used by logged in users. A like feature, and an anonymous repost, this is about connecting people with artists, musicians, and other creatives. Not about social media.)
