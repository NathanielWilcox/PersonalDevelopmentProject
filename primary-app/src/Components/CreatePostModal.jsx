import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost, clearCreatePostSuccess } from '../store/postsSlice';
import './CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose, onSuccess }) => {
    const dispatch = useDispatch();
    const token = useSelector(state => state.auth.token);
    const { loading, error, success } = useSelector(state => state.posts.createPostForm);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        visibility: 'public',
        tags: ''
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file type
            const isImage = selectedFile.type.startsWith('image/');
            const isVideo = selectedFile.type.startsWith('video/');
            
            if (!isImage && !isVideo) {
                alert('Please select an image or video file');
                return;
            }

            // Validate file size (50MB)
            if (selectedFile.size > 50 * 1024 * 1024) {
                alert('File size must be less than 50MB');
                return;
            }

            setFile(selectedFile);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            alert('Please select a file to upload');
            return;
        }

        if (!formData.title.trim()) {
            alert('Please enter a title');
            return;
        }

        // Create FormData for multipart request
        const submitFormData = new FormData();
        submitFormData.append('media', file);
        submitFormData.append('title', formData.title);
        submitFormData.append('description', formData.description);
        submitFormData.append('visibility', formData.visibility);
        
        // Handle tags as array
        if (formData.tags.trim()) {
            const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            tagsArray.forEach(tag => {
                submitFormData.append('tags[]', tag);
            });
        }

        // Dispatch create post action
        const result = await dispatch(createPost({ formData: submitFormData, token }));

        if (result.payload && result.payload.postId) {
            // Reset form
            setFormData({
                title: '',
                description: '',
                visibility: 'public',
                tags: ''
            });
            setFile(null);
            setPreview(null);

            // Call success callback if provided
            if (onSuccess) onSuccess();

            // Auto-close after 1 second
            setTimeout(() => {
                dispatch(clearCreatePostSuccess());
                onClose();
            }, 1000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create Post</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                {success && (
                    <div className="alert alert-success">
                        ✓ Post created successfully!
                    </div>
                )}

                {error && (
                    <div className="alert alert-error">
                        ✗ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="create-post-form">
                    {/* File Upload */}
                    <div className="form-group">
                        <label htmlFor="media">Media (Photo or Video)</label>
                        <input
                            type="file"
                            id="media"
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                            disabled={loading}
                            required
                        />
                        <small>Max 50MB. Supported: JPG, PNG, GIF, MP4, QuickTime</small>
                    </div>

                    {/* Preview */}
                    {preview && (
                        <div className="preview-container">
                            {file?.type.startsWith('image/') ? (
                                <img src={preview} alt="Preview" />
                            ) : (
                                <video controls>
                                    <source src={preview} />
                                    Your browser does not support the video tag.
                                </video>
                            )}
                        </div>
                    )}

                    {/* Title */}
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter post title"
                            maxLength={100}
                            disabled={loading}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label htmlFor="description">Description (Optional)</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter post description"
                            maxLength={500}
                            rows={3}
                            disabled={loading}
                        />
                    </div>

                    {/* Tags */}
                    <div className="form-group">
                        <label htmlFor="tags">Tags (Optional)</label>
                        <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={formData.tags}
                            onChange={handleInputChange}
                            placeholder="Enter tags separated by commas"
                            disabled={loading}
                        />
                        <small>Example: portrait, fashion, professional</small>
                    </div>

                    {/* Visibility */}
                    <div className="form-group">
                        <label htmlFor="visibility">Visibility</label>
                        <select
                            id="visibility"
                            name="visibility"
                            value={formData.visibility}
                            onChange={handleInputChange}
                            disabled={loading}
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                            <option value="friends">Friends Only</option>
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Uploading...' : 'Create Post'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostModal;
