// Description: A simple profile page component that allows users to view and edit their profile information.
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { handleApiResponse, getUserFriendlyError } from '../utils/errorHandling';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8800';

console.log('Profile.jsx - API_BASE_URL:', API_BASE_URL);

// Helper function to validate avatar URLs
function getSafeAvatarUrl(url) {
	if (typeof url === 'string') {
		if (
			url.startsWith('https://') ||
			url.startsWith('http://') ||
			(
				url.startsWith('data:image/png') ||
				url.startsWith('data:image/jpeg') ||
				url.startsWith('data:image/jpg') ||
				url.startsWith('data:image/gif') ||
				url.startsWith('data:image/webp')
			)
		) {
			if (url.startsWith('data:image/svg')) {
				return 'https://placehold.co/150x150';
			}
			return url;
		}
	}
	return 'https://placehold.co/150x150';
}

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

    // UI state management
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...profileData });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch profile data when component mounts
    useEffect(() => {
        if (user?.id && token) {
            fetchUserProfile();
        }
    }, [user, token]);

    // Fetch profile function with proper error handling
    const fetchUserProfile = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const url = `${API_BASE_URL}/api/userprofile`;
            console.log('🔵 Fetching profile from:', url);
            console.log('🔵 Token from Redux:', token);
            console.log('🔵 Token type:', typeof token);
            console.log('🔵 Token length:', token ? token.length : 'NO TOKEN');
            console.log('🔵 Token preview:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('🔵 Response status:', response.status);
            
            const data = await handleApiResponse(response);
            console.log('🔵 Profile data:', data);
            
            setProfileData(data);
            setFormData(data);
        } catch (err) {
            console.error('❌ Profile fetch failed:', err);
            const friendlyError = getUserFriendlyError(err);
            console.error('📌 Friendly error:', friendlyError);
            setError(friendlyError);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Save profile function with proper error handling
    const handleSave = async () => {
        try {
            setIsSaving(true);
            setError(null);
            
            const url = `${API_BASE_URL}/userprofile/${user.id}`;
            console.log('🔵 Saving profile to:', url);
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await handleApiResponse(response);
            console.log('🟢 Profile saved:', data);
            
            setProfileData(formData);
            setIsEditing(false);
        } catch (err) {
            console.error('❌ Save failed:', err);
            const friendlyError = getUserFriendlyError(err);
            console.error('📌 Friendly error:', friendlyError);
            setError(friendlyError);
        } finally {
            setIsSaving(false);
        }
    };


	return (
		<>
			<div style={{ textAlign: 'center', padding: '20px' }}>
				{error && (
					<div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffe6e6' }}>
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
					<div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '20px', borderRadius: '5px', maxWidth: '400px', margin: '20px auto' }}>
						<h2>Edit Profile</h2>
						<input
							type="text"
							name="username"
							value={formData.username}
							onChange={handleInputChange}
							placeholder="Username"
							disabled={isSaving}
							style={{ width: '100%', margin: '10px 0', padding: '8px' }}
						/>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleInputChange}
							placeholder="Email"
							disabled={isSaving}
							style={{ width: '100%', margin: '10px 0', padding: '8px' }}
						/>
						<select
							name="role"
							value={formData.role}
							onChange={handleInputChange}
							disabled={isSaving}
							style={{ width: '100%', margin: '10px 0', padding: '8px' }}
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
		</>
	);
};

export default Profile;

// General category: User Profile Management / CRUD Operations