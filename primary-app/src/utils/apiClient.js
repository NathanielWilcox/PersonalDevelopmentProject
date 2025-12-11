/**
 * Get the correct API base URL based on environment
 * In Docker: backend container is accessible via 'backend' service name
 * In browser: use localhost
 */
export function getApiBaseUrl() {
  // During initial page load, process.env might not be available
  // Try to use the env variable first
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // Fallback to localhost:8800
  return 'http://localhost:8800';
}

/**
 * API request helper with auth token
 */
export async function apiRequest(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  return response;
}

export default getApiBaseUrl;
