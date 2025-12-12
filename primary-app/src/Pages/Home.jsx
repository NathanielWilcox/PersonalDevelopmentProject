import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import '../index.css';
import CreatePostModal from '../Components/CreatePostModal';
import PostsFeed from '../Components/PostsFeed';
import FeedFilters from '../Components/FeedFilters';
import './Home.css';

const Home = () => {
    const user = useSelector(state => state.auth.user);
    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        filterBy: 'all',
        mediaType: 'all',
        sort: 'newest'
    });

    // If user is not logged in
    if (!isLoggedIn) {
        return (
            <div className="home-container">
                <h1>Welcome to the Creative Community</h1>
                <p>Please log in to access the community features.</p>
            </div>
        );
    }

    return (
        <div className="home-container">
            <div className="home-header">
                <div className="header-content">
                    <h1>Welcome, {user?.username}!</h1>
                    <p>Discover and share work with creative professionals</p>
                </div>
                <button
                    className="btn btn-create-post"
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    + Create Post
                </button>
            </div>

            {/* Feed Filters */}
            <FeedFilters filters={filters} onFilterChange={setFilters} />

            {/* Posts Feed with Infinite Scroll */}
            <div className="feed-wrapper">
                <PostsFeed filters={filters} />
            </div>

            {/* Create Post Modal */}
            <CreatePostModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
};

export default Home;
