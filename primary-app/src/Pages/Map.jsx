import React from 'react';
import NavBar from '../Components/NavBar';

const Map = () => {
	const mapStyle = {
		width: '100%',
		height: '500px',
		border: '1px solid #ccc',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#f0f0f0',
	};

	return (
		<div className="map-container">
			<NavBar />
			<div style={mapStyle}>
				<p>Map will be displayed here. Integrate your map API endpoint.</p>
			</div>
		</div>
	);
};

export default Map;
