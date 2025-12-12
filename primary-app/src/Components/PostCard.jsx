import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deletePost } from '../store/postsSlice';
import { getApiBaseUrl } from '../utils/apiClient';
import UserModal from './UserModal';
import './PostCard.css';

const PostCard = ({ post, onDelete }) => {
    const dispatch = useDispatch();
    const token = useSelector(state => state.auth.token);
    const currentUserId = useSelector(state => state.auth.user?.id);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);

    const isOwner = currentUserId === post.user_id;

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            setIsDeleting(true);
            const result = await dispatch(deletePost({ postId: post.id, token }));
            setIsDeleting(false);
            if (result.payload && onDelete) {
                onDelete(post.id);
            }
        }
    };

    // Construct full media URL
    const mediaUrl = post.media_url.startsWith('http') 
        ? post.media_url 
        : `${getApiBaseUrl()}${post.media_url}`;

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <div className="post-card">
                {/* Post Header */}
                <div className="post-header">
                    <div 
                        className="post-user-info"
                        onClick={() => setShowUserModal(true)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="post-avatar">
                            {post.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="post-meta">
                            <h3 className="post-username">{post.username}</h3>
                            <p className="post-role">{post.role}</p>
                            <p className="post-date">{formatDate(post.created_at)}</p>
                        </div>
                    </div>
                    {isOwner && (
                        <button
                            className="btn-delete"
                            onClick={handleDelete}
                        disabled={isDeleting}
                        title="Delete post"
                    >
                        ⋮
                    </button>
                )}
            </div>

            {/* Post Title */}
            <h2 className="post-title">{post.title}</h2>

            {/* Post Description */}
            {post.description && (
                <p className="post-description">{post.description}</p>
            )}

            {/* Media */}
            <div className="post-media">
                {post.media_type === 'video' ? (
                    <video controls>
                        <source src={mediaUrl} />
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <img src={mediaUrl} alt={post.title} />
                )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
                <div className="post-tags">
                    {post.tags.map((tag, index) => (
                        <span key={index} className="tag">#{tag}</span>
                    ))}
                </div>
            )}

            {/* Post Stats */}
            <div className="post-stats">
                <span className="stat">
                    👍 {post.likes_count || 0} Likes
                </span>
                <span className="stat">
                    💬 {post.comments_count || 0} Comments
                </span>
            </div>

            {/* Post Actions */}
            <div className="post-actions">
                <button className="action-btn">
                    👍 Like
                </button>
                <button className="action-btn">
                    💬 Comment
                </button>
                <button className="action-btn">
                    🔗 Share
                </button>
            </div>
        </div>

        {/* User Modal Popup */}
        {showUserModal && (
            <UserModal 
                userId={post.user_id} 
                onClose={() => setShowUserModal(false)}
            />
        )}
        </>
    );
};

export default PostCard;

