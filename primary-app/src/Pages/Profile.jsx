// Description: A simple profile page component that allows users to view and edit their profile information.
// This component includes a profile picture, name, email, and bio fields.
// TODO: Update the profile information when isLoggedIn state changes to true. Only display test data when isLoggedIn is false.
// TODO: Add functionality to fetch user data from the backend when the component mounts.
import React, { useState, useEffect } from 'react';
import { handleApiResponse, withErrorHandling } from '../utils/errorHandling';

// Helper function to validate avatar URLs
function getSafeAvatarUrl(url) {
	// Only allow http, https, or safe data:image URLs (no SVG or other dangerous types)
	if (typeof url === 'string') {
		// Disallow SVG images explicitly
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
			// Extra check: reject any data:image/svg+xml or data:image/svg
			if (
				url.startsWith('data:image/svg') ||
				url.startsWith('data:image/svg+xml')
			) {
				return 'https://placehold.co/150x150';
			}
			return url;
		}
	}
	// Fallback to a default image if unsafe
	return 'https://placehold.co/150x150';
}

const Profile = () => {
    // State for user data
    const [user, setUser] = useState({
        name: 'John Doe',
        email: 'johndoe@example.com',
        bio: 'Software developer with a passion for creating amazing applications.',
        avatar: 'https://placehold.co/150x150',
    });

    // UI state management
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...user });
    
    // Loading and error states
    const [isLoading, setIsLoading] = useState(false);        // Track if data is being fetched/saved
    const [error, setError] = useState(null);                 // Track any error messages
    const [isSaving, setIsSaving] = useState(false);          // Track save operations specifically

    // Fetch profile data when component mounts
    useEffect(() => {
        fetchUserProfile();
    }, []); // Empty dependency array means this runs once on mount

    // Enhanced fetch profile function with consistent error handling
    const fetchUserProfile = withErrorHandling(async () => {
        const response = await fetch('http://localhost:8800/api/userprofile');
        const data = await handleApiResponse(response);
        
        setUser(data);
        setFormData(data);
    }, setError, setIsLoading);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Enhanced save function with consistent error handling
    const handleSave = withErrorHandling(async () => {
        const response = await fetch('http://localhost:8800/api/userprofile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        await handleApiResponse(response);
        setUser(formData);
        setIsEditing(false);
    }, setError, setIsSaving);

	return (
		<>
			<div style={{ textAlign: 'center', padding: '20px' }}>
				{/* Show error message if there is one */}
				{error && (
					<div style={{ color: 'red', marginBottom: '10px' }}>
						Error: {error}
					</div>
				)}

				{/* Show loading spinner when fetching data */}
				{isLoading ? (
					<div>Loading profile data...</div>
				) : (
					<img
						src={getSafeAvatarUrl(user.avatar)}
						alt="User Avatar"
						style={{ borderRadius: '50%', width: '150px', height: '150px' }}
					/>
				)}
				{isEditing ? (
					<div>
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleInputChange}
							placeholder="Name"
							style={{ margin: '10px', padding: '5px' }}
                            disabled={isSaving}  // Disable inputs while saving
						/>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleInputChange}
							placeholder="Email"
                            disabled={isSaving}  // Disable inputs while saving
						/>
						<button 
							onClick={handleSave} 
							disabled={isSaving}
							style={{ margin: '10px', padding: '5px 15px' }}
						>
							{isSaving ? 'Saving...' : 'Save Changes'}
						</button>
						<button 
							onClick={handleSave} 
							disabled={isSaving}
							style={{ margin: '10px', padding: '5px 15px' }}
						>
							{isSaving ? 'Saving...' : 'Save Changes'}
							style={{ margin: '10px', padding: '5px' }}
						</button>
						<textarea
							name="bio"
							value={formData.bio}
							onChange={handleInputChange}
							placeholder="Bio"
							style={{
								margin: '10px',
								padding: '5px',
								width: '200px',
								height: '100px',
							}}
						/>
						<div>
							<button
								onClick={handleSave}
								style={{ margin: '10px', padding: '5px 10px' }}
							>
								Save
							</button>
							<button
								onClick={() => setIsEditing(false)}
								style={{ margin: '10px', padding: '5px 10px' }}
							>
								Cancel
							</button>
						</div>
					</div>
				) : (
					<div>
						<h1>{user.name}</h1>
						<p>Email: {user.email}</p>
						<p>{user.bio}</p>
						<button
							onClick={() => setIsEditing(true)}
							style={{ margin: '10px', padding: '5px 10px' }}
						>
							Edit Profile
						</button>
					</div>
				)}
			</div>
		</>
	);
};

export default Profile;
// TODO: Add functionality to fetch user data from the backend when the component mounts.
// TODO: Add functionality to update the user profile in the backend when the Save button is clicked.
// Note: Backend enforces the following constraints:
// - Username must be at least 3 characters long
// - Email must be in valid format (if provided)
// - Role must be one of: 'user', 'photographer', 'videographer', 'musician', 'artist', 'admin'
// TODO: Add error handling for the fetch requests.
// TODO: Add loading states for the fetch requests.
// TODO: Add validation for the form inputs (e.g., email format, required fields).
// TODO: Add a profile picture selection feature.

// General category: User Profile Management / CRUD Operations