import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { handleApiResponse, getUserFriendlyError } from '../utils/errorHandling';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8800';

const Profile = () => {
    // Get user info and token from Redux
    const user = useSelector((state) => state.auth.user);
    const token = useSelector((state) => state.auth.token);

    // State for user data
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        role: 'user',
    });

    // UI state
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...profileData });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Gallery state
    const [userPosts, setUserPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [postsError, setPostsError] = useState(null);

    const fetchUserProfile = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetch(`${API_BASE_URL}/api/userprofile`, {
                credentials: 'include',  // Include HTTP-only cookies
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await handleApiResponse(response);
            setProfileData(data);
            setFormData(data);
        } catch (err) {
            console.error('❌ Profile fetch failed:', err);
            setError(getUserFriendlyError(err));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchUserPosts = useCallback(async () => {
        if (!user?.id) return;
        
        try {
            setPostsLoading(true);
            setPostsError(null);
            
            const response = await fetch(
                `${API_BASE_URL}/api/posts/user/${user.id}?page=1&limit=12`,
                {
                    credentials: 'include',  // Include HTTP-only cookies
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            const data = await handleApiResponse(response);
            setUserPosts(data.posts || []);
        } catch (err) {
            console.error('❌ Posts fetch failed:', err);
            setPostsError(getUserFriendlyError(err));
            setUserPosts([]);
        } finally {
            setPostsLoading(false);
        }
    }, [user?.id]);

    // Fetch both profile and posts on mount
    useEffect(() => {
        if (user?.id && token) {
            fetchUserProfile();
            fetchUserPosts();
        }
    }, [user?.id, token, fetchUserProfile, fetchUserPosts]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setError(null);
            
            const response = await fetch(`${API_BASE_URL}/userprofile/${user.id}`, {
                method: 'PUT',
                credentials: 'include',  // Include HTTP-only cookies
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            await handleApiResponse(response);
            setProfileData(formData);
            setIsEditing(false);
        } catch (err) {
            console.error('❌ Save failed:', err);
            setError(getUserFriendlyError(err));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            {/* Profile Header Section */}
            <div style={{ textAlign: 'center', padding: '20px' }}>
                {error && (
                    <div style={{ 
                        color: 'red', 
                        marginBottom: '10px', 
                        padding: '10px', 
                        backgroundColor: '#ffe6e6',
                        borderRadius: '4px'
                    }}>
                        Error: {error}
                    </div>
                )}

                {isLoading ? (
                    <div>Loading profile data...</div>
                ) : (
                    <div>
                        <h1>{profileData.username}</h1>
                        <p>Email: {profileData.email}</p>
                        <p>Role: {profileData.role}</p>
                    </div>
                )}

                {isEditing ? (
                    <div style={{ 
                        marginTop: '20px', 
                        border: '1px solid #ccc', 
                        padding: '20px', 
                        borderRadius: '5px', 
                        maxWidth: '400px', 
                        margin: '20px auto' 
                    }}>
                        <h2>Edit Profile</h2>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="Username"
                            disabled={isSaving}
                            style={{ width: '100%', margin: '10px 0', padding: '8px', boxSizing: 'border-box' }}
                        />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email"
                            disabled={isSaving}
                            style={{ width: '100%', margin: '10px 0', padding: '8px', boxSizing: 'border-box' }}
                        />
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            disabled={isSaving}
                            style={{ width: '100%', margin: '10px 0', padding: '8px', boxSizing: 'border-box' }}
                        >
                            <option value="user">User</option>
                            <option value="photographer">Photographer</option>
                            <option value="videographer">Videographer</option>
                            <option value="musician">Musician</option>
                            <option value="artist">Artist</option>
                        </select>
                        <div style={{ marginTop: '20px' }}>
                            <button 
                                onClick={handleSave} 
                                disabled={isSaving}
                                style={{ 
                                    margin: '0 10px', 
                                    padding: '10px 20px',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isSaving ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button 
                                onClick={() => setIsEditing(false)} 
                                disabled={isSaving}
                                style={{ 
                                    margin: '0 10px', 
                                    padding: '10px 20px',
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        style={{ 
                            marginTop: '20px',
                            padding: '10px 20px',
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            {/* Posts Gallery Section */}
            <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>My Posts</h2>
                
                {postsError && (
                    <div style={{ 
                        color: '#d32f2f', 
                        textAlign: 'center', 
                        padding: '10px',
                        marginBottom: '20px'
                    }}>
                        Error loading posts: {postsError}
                    </div>
                )}

                {postsLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <p>Loading gallery...</p>
                    </div>
                ) : userPosts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        <p>No posts yet. Create your first post on the Home page!</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '20px'
                    }}>
                        {userPosts.map((post) => {
                            const mediaUrl = post.media_url.startsWith('http') 
                                ? post.media_url 
                                : `${API_BASE_URL}${post.media_url}`;
                            
                            return (
                                <div 
                                    key={post.id} 
                                    style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        backgroundColor: '#fff',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                    }}
                                >
                                    {/* Thumbnail */}
                                    <div style={{
                                        width: '100%',
                                        height: '200px',
                                        backgroundColor: '#f0f0f0',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {post.media_type === 'video' ? (
                                            <video 
                                                src={mediaUrl}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <img 
                                                src={mediaUrl}
                                                alt={post.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        )}
                                    </div>

                                    {/* Post Info */}
                                    <div style={{ padding: '15px' }}>
                                        <h3 style={{ 
                                            margin: '0 0 8px 0', 
                                            fontSize: '16px', 
                                            overflow: 'hidden', 
                                            textOverflow: 'ellipsis', 
                                            whiteSpace: 'nowrap' 
                                        }}>
                                            {post.title}
                                        </h3>
                                        {post.description && (
                                            <p style={{ 
                                                margin: '0 0 10px 0', 
                                                fontSize: '13px', 
                                                color: '#666', 
                                                overflow: 'hidden', 
                                                textOverflow: 'ellipsis', 
                                                whiteSpace: 'nowrap' 
                                            }}>
                                                {post.description}
                                            </p>
                                        )}
                                        <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                                            👍 {post.likes_count || 0} · 💬 {post.comments_count || 0}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
};

export default Profile;
