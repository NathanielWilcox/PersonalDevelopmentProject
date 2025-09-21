// frontend config file

const apiConfig = {
    apiBaseUrl: 'http://localhost:8800/api', // Base URL for API requests
}

const portConfig = {
    backendPort: 8800, // Port for the backend server}
    frontendPort: 3000, // Port for the frontend application
    sqlServerPort: 3306, // Port for the SQL server
};

const googleMapsConfig = {
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, // Google Maps API key
    googleMapsSourceHTML: 'https://storage.googleapis.com/maps-solutions-scjh86wbg1/neighborhood-discovery/ip2a/neighborhood-discovery.html', // Source HTML for Google Maps
    googleMapsLibraries: ['places', 'geometry'], // Libraries to load with Google Maps
    
    // Default settings for Google Maps
    defaultLocation: {
        lat: 33.7490, // Default latitude (Atlanta, GA)
        lng: -84.3880 // Default longitude (Atlanta, GA)
    }, 
    defaultZoom: 12, // Default zoom level for the map
    maxMarkers: 100, // Maximum number of markers to display on the map
    mapStyles: {
        default: 'https://storage.googleapis.com/maps-solutions-scjh86wbg1/neighborhood-discovery/oawi/neighborhood-discovery.html', // Default map style URL
        custom: 'https://storage.googleapis.com/maps-solutions-scjh86wbg1/neighborhood-discovery/oawi/custom-style.json' // Custom map style URL
    },
    auth: {
        loginUrl: '/login', // URL for login endpoint
        logoutUrl: '/logout', // URL for logout endpoint
        profileUrl: '/profile' // URL for user profile endpoint
    },
    notifications: {
        successDuration: 3000, // Duration for success notifications in milliseconds
        errorDuration: 5000 // Duration for error notifications in milliseconds
    },
    // Add any other configuration settings you need
    // This section can be used for additional third-party service configurations
    // that integrate with Google Maps, such as:
    // - Places API for location search and autocomplete
    // - Directions API for route planning
    // - Geocoding API for address lookup
    // - Map styling services
    // - Analytics or tracking services related to map usage
    // Add configuration objects here as needed for those services.
    featureFlags: {
        enableNeighborhoodDiscovery: true, // Flag to enable/disable neighborhood discovery feature
        enableBookmarks: true, // Flag to enable/disable bookmarks feature
        enableRoutePlanning: false, // Flag to enable/disable route planning feature
        enableUserPreferences: false, // Flag to enable/disable user preferences feature
        enableJourneySharing: false // Flag to enable/disable journey sharing feature
    },
    // Security settings
    security: {
        useHttps: true, // Use HTTPS for API requests
        secureCookies: true, // Use secure cookies for authentication
        contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' http://localhost:3000" // Content Security Policy settings
    }  
};

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
};

export { apiConfig, portConfig, googleMapsConfig, dbConfig };
// Note:
// - The `defaultLocation` and `defaultZoom` can be adjusted based on your application's needs.
// - The `mapStyles` can be customized to use different map styles as needed.
// - The `auth` object contains URLs for authentication endpoints.
// - The `notifications` object defines durations for success and error notifications.
// - The `featureFlags` can be used to toggle features on or off without deploying new code.
// - The `security` object contains security-related settings, such as using HTTPS and secure cookies.
// - Ensure to keep sensitive information like API keys secure and not hard-coded in the frontend code.
// - Consider using environment variables or a secure vault for sensitive configurations in production.
// - This configuration file can be imported in your React components or services to access the settings.
// - You can extend this configuration file as your application grows to include more settings or features.