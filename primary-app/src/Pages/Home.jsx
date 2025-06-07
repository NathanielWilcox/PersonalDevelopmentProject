import React from 'react';
import '../index.css';
import { useAuth } from '../utils/authContext';


const Home = () => {
    // Use useAuth hook to get the current user and auth state
    const { user, isLoggedIn } = useAuth(); // isLoggedIn is used to check if the user is logged in, line
    // Debugging log to check user
    console.log('Home user:', user);
    // If user is not available, you can handle it accordingly
    if (!user) {
        return (
            <div className="home-container">
                <h1>Welcome to the Creative Community</h1>
                <p>Please log in to access the community features.</p>
            </div>
        );
    }
    // Debugging log to check if user is logged in
    console.log('Home isLoggedIn:', isLoggedIn); // Debugging log to check login status
    // If user is available, you can render the home page content
    // You can also use user to display user-specific information or features
    // For example, you can display the user's name or profile picture
    console.log('Home user name:', user.name || user.username);
    console.log('Home user email:', user.email);
    console.log('Home user avatar:', user.avatar);
    // You can also use user to fetch user-specific data from the backend if needed
    // For example, you can fetch user posts, profiles, or locations from the backend
    

    // Render the home page content
    return (
        <div className="home-container">
            <h1>Welcome to the Creative Community</h1>
            <p>
                Connect with artists, musicians, and other creatives. Share your work, discover new talent, and collaborate on projects.
            </p>
        </div>
    );
}

export default Home;
// TODO: Build main component(Feed of posts, profiles, locations, that artists, musicians, and other creatives can share with each other. With a focus on community building and collaboration.)
// TODO: Add a search bar to the home page that allows users to search for posts, profiles, and locations. (Only to be used by logged in users. No messaging capability, just discovery and their own contact info[that the user can choose to share or not]. And a way to report posts that are inappropriate or offensive.)
// TODO: Add a way for users to filter posts by category (e.g. music, art, etc.). (Only to be used by logged in users. A like feature, and an anonymous repost, this is about connecting people with artists, musicians, and other creatives. Not about social media.)
