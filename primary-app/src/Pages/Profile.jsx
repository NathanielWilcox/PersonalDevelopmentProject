// Description: A simple profile page component that allows users to view and edit their profile information.
// This component includes a profile picture, name, email, and bio fields.
// TODO: Update the profile information when isLoggedIn state changes to true. Only display test data when isLoggedIn is false.
// TODO: Add functionality to fetch user data from the backend when the component mounts.
import React, { useState } from 'react';

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
	const [user, setUser] = useState({
		name: 'John Doe',
		email: 'johndoe@example.com',
		bio: 'Software developer with a passion for creating amazing applications.',
		avatar: 'https://placehold.co/150x150',
	});

	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({ ...user });

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSave = () => {
		setUser({ ...formData });
		setIsEditing(false);
	};

	return (
		<>
			<div style={{ textAlign: 'center', padding: '20px' }}>
				<img
					src={getSafeAvatarUrl(user.avatar)}
					alt="User Avatar"
					style={{ borderRadius: '50%', width: '150px', height: '150px' }}
				/>
				{isEditing ? (
					<div>
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleInputChange}
							placeholder="Name"
							style={{ margin: '10px', padding: '5px' }}
						/>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleInputChange}
							placeholder="Email"
							style={{ margin: '10px', padding: '5px' }}
						/>
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
// TODO: Add error handling for the fetch requests.
// TODO: Add loading states for the fetch requests.
// TODO: Add validation for the form inputs (e.g., email format, required fields).
// TODO: Add a profile picture selection feature.

// General category: User Profile Management / CRUD Operations