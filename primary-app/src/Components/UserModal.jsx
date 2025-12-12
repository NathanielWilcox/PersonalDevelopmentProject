import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { handleApiResponse, getUserFriendlyError } from '../utils/errorHandling';
import './UserModal.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8800';

const UserModal = ({ userId, onClose }) => {
    const token = useSelector(state => state.auth.token);
    const currentUserId = useSelector(state => state.auth.user?.id);
    
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (userId && token) {
            fetchUserData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, token]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch user posts
            const postsResponse = await fetch(
                `${API_BASE_URL}/api/posts/user/${userId}?page=1&limit=6`,
                {
                    credentials: 'include',  // Include HTTP-only cookies
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const postsData = await handleApiResponse(postsResponse);
            setUserPosts(postsData.posts || []);
        } catch (err) {
            console.error('❌ Failed to fetch user data:', err);
            setError(getUserFriendlyError(err));
        } finally {
            setLoading(false);
        }
    };

    // Mock user data - in future this could come from an API endpoint
    const mockUserData = {
        id: userId,
        username: userPosts[0]?.username || 'User',
        role: userPosts[0]?.role || 'user',
        followers: 0,
        following: 0
    };

    return (
        <div className="user-modal-overlay" onClick={onClose}>
            <div className="user-modal" onClick={(e) => e.stopPropagation()}>
                <button className="user-modal-close" onClick={onClose}>×</button>

                {loading ? (
                    <div className="user-modal-loading">Loading...</div>
                ) : error ? (
                    <div className="user-modal-error">Error: {error}</div>
                ) : (
                    <>
                        {/* User Header */}
                        <div className="user-modal-header">
                            <div className="user-modal-avatar">
                                {mockUserData.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-modal-info">
                                <h2>{mockUserData.username}</h2>
                                <p className="user-modal-role">{mockUserData.role}</p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="user-modal-stats">
                            <div className="stat-item">
                                <span className="stat-label">Posts</span>
                                <span className="stat-value">{userPosts.length}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Followers</span>
                                <span className="stat-value">{mockUserData.followers}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Following</span>
                                <span className="stat-value">{mockUserData.following}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="user-modal-actions">
                            {userId !== currentUserId && (
                                <>
                                    <button className="btn-follow">Follow</button>
                                    <button className="btn-message">Message</button>
                                </>
                            )}
                            {userId === currentUserId && (
                                <button className="btn-edit">Edit Profile</button>
                            )}
                        </div>

                        {/* Recent Posts */}
                        {userPosts.length > 0 && (
                            <div className="user-modal-posts">
                                <h3>Recent Posts</h3>
                                <div className="posts-grid">
                                    {userPosts.slice(0, 6).map((post) => {
                                        const mediaUrl = post.media_url.startsWith('http')
                                            ? post.media_url
                                            : `${API_BASE_URL}${post.media_url}`;

                                        return (
                                            <div key={post.id} className="post-thumbnail">
                                                {post.media_type === 'video' ? (
                                                    <video src={mediaUrl} />
                                                ) : (
                                                    <img src={mediaUrl} alt={post.title} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default UserModal;
