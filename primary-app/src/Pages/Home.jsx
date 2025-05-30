import React from 'react';
import '../index.css';

const Home = () => {
    return (
        <div className="home-container">
            <div className="content">
                <h1>Welcome to the Home Page</h1>
                <p>This is the main page of the application.</p>
            </div>
        </div>
    );
};

export default Home;
// TODO: Build main component(Feed of posts, profiles, locations, that artists, musicians, and other creatives can share with each other. With a focus on community building and collaboration.)
// TODO: Add a search bar to the home page that allows users to search for posts, profiles, and locations. (Only to be used by logged in users. No messaging capability, just discovery and their own contact info[that the user can choose to share or not]. And a way to report posts that are inappropriate or offensive.)
// TODO: Add a way for users to filter posts by category (e.g. music, art, etc.). (Only to be used by logged in users. A like feature, and an anonymous repost, this is about connecting people with artists, musicians, and other creatives. Not about social media.)
