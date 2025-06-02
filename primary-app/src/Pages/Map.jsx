import React from 'react';
import { googleMapsConfig } from '../config/config'; //import here, utilize in the iframe src

const Map = () => {
	return (
		<div className="map-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
			<div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', maxWidth: '100%', padding: '2rem 0' }}>
				<div style={{ width: '90vw', maxWidth: '1200px', height: '60vh', border: '5px solid #ccc', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<iframe 
						src={googleMapsConfig.mapStyles.default}
						title='neighborhood' 
						width="100%" 
						height="100%" 
						style={{ border: 0 }} 
						loading="lazy"
					>
						Neighborhood
						</iframe>
				</div>
			</div>
		</div>
	);
};

export default Map;
// TODO: Add a map component that displays a map of the user's neighborhood.
// TODO: Add a bookmark feature that allows users to save their favorite locations on the map.
// TODO: Implment neighborhood discovery feature that allows users to discover new neighborhoods based on their interests.
// Note: 
// (Add in machine learning model to suggest neighborhoods based on user preferences
// [learn machine learning compatible with React and JavaScript])