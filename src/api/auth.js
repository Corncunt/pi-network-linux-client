const axios = require('axios');
// Ensure this matches the PI_API_BASE_URL in main.js
const BASE_API_URL = 'https://api.minepi.com/v2';

// Debug flag - set to true to enable verbose logging
const DEBUG = true;

// Debug logger function
const debugLog = (label, data) => {
  if (DEBUG) {
    console.log(`[DEBUG] ${label}:`, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  }
};

// Local storage/memory management of tokens
let authToken = null;
let refreshToken = null;

/**
 * Shared, pre-configured Axios client for Pi Network API
 * This client automatically handles:
 * - Adding authorization headers to requests
 * - Refreshing tokens when they expire
 * - Consistent error handling
 */
const authClient = axios.create({
  baseURL: BASE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * Request interceptor to automatically add authorization token to requests
 */
authClient.interceptors.request.use(
  async (config) => {
    // If we have an auth token, add it to the request header
    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle token refresh when authorization fails
 */
authClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 Unauthorized and we haven't already tried to refresh
    if (error.response && 
        error.response.status === 401 && 
        !originalRequest._retry && 
        refreshToken) {
      
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token
        const response = await refreshAuthToken();
        
        // If successful, update the auth token and retry the original request
        if (response && response.data && response.data.token) {
          authToken = response.data.token;
          originalRequest.headers['Authorization'] = `Bearer ${authToken}`;
          return authClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and reject with original error
        console.error('Token refresh failed:', refreshError);
        clearTokens();
        return Promise.reject(error);
      }
    }
    
    // If not a 401 or we've already tried to refresh, just reject with the error
    return Promise.reject(error);
  }
);

/**
 * Set authentication tokens after successful login
 * @param {string} token - The authentication token
 * @param {string} refresh - The refresh token
 */
const setTokens = (token, refresh) => {
  authToken = token;
  refreshToken = refresh;
};

/**
 * Clear authentication tokens on logout or auth failure
 */
const clearTokens = () => {
  authToken = null;
  refreshToken = null;
};

/**
 * Get the current authentication token
 * @returns {string|null} The current auth token
 */
const getAuthToken = () => {
  return authToken;
};

/**
 * Get the current refresh token
 * @returns {string|null} The current refresh token
 */
const getRefreshToken = () => {
  return refreshToken;
};

/**
 * Attempt to refresh the authentication token using the refresh token
 * @returns {Promise} The refresh API response
 */
const refreshAuthToken = async () => {
  debugLog('Token Refresh Attempt', 'Trying to refresh authentication token');
  
  // Verify we have a refresh token
  if (!refreshToken) {
    debugLog('Token Refresh Error', 'No refresh token available');
    throw new Error('No refresh token available for token refresh');
  }
  
  try {
    // Don't use the authClient for token refresh to avoid interceptor loops
    debugLog('Refresh Request URL', `${BASE_API_URL}/auth/refresh`);
    
    const response = await axios.post(`${BASE_API_URL}/auth/refresh`, {
      refreshToken: refreshToken
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    debugLog('Token Refresh Response', {
      status: response.status,
      success: !!response.data?.token
    });
    
    return response;
  } catch (error) {
    debugLog('Token Refresh Failed', 'Error refreshing authentication token');
    
    if (error.response) {
      debugLog('Refresh Error

/**
 * Login to Pi Network
 * @param {string} username - User's username or email
 * @param {string} password - User's password
 * @returns {Promise} The login API response
 */
const login = async (username, password) => {
  debugLog('Login Request', { username, endpoint: `${BASE_API_URL}/auth/login` });
  
  try {
    // Log the request details
    const requestBody = { username, password: '********' }; // Password obfuscated for security
    debugLog('Login Request Body', requestBody);
    
    const response = await authClient.post('/auth/login', {
      username,
      password
    });
    
    // Log successful response (excluding sensitive data)
    debugLog('Login Response Status', response.status);
    debugLog('Login Response Headers', response.headers);
    
    const sanitizedResponse = { ...response.data };
    if (sanitizedResponse.token) sanitizedResponse.token = `${sanitizedResponse.token.substring(0, 10)}...`;
    if (sanitizedResponse.refreshToken) sanitizedResponse.refreshToken = `${sanitizedResponse.refreshToken.substring(0, 10)}...`;
    debugLog('Login Response Data', sanitizedResponse);
    
    // Store tokens if login successful
    if (response.data && response.data.token && response.data.refreshToken) {
      debugLog('Setting Auth Tokens', 'Token received and stored');
      setTokens(response.data.token, response.data.refreshToken);
    } else {
      debugLog('Token Warning', 'Response missing expected token data');
    }
    
    return response.data;
  } catch (error) {
    // Enhanced error logging
    debugLog('Login Error', 'Authentication request failed');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      debugLog('Error Status', error.response.status);
      debugLog('Error Headers', error.response.headers);
      debugLog('Error Response', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      debugLog('Error Request', 'No response received from server');
      debugLog('Request Details', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      debugLog('Error Message', error.message);
    }
    
    debugLog('Error Config', error.config);
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout from Pi Network
 * @returns {Promise} The logout API response
 */
const logout = async () => {
  try {
    const response = await authClient.post('/auth/logout');
    // Clear tokens regardless of response
    clearTokens();
    return response.data;
  } catch (error) {
    // Still clear tokens even if the request fails
    clearTokens();
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Check authentication status
 * @returns {Promise} The auth status API response
 */
const checkAuthStatus = async () => {
  try {
    const response = await authClient.get('/auth/status');
    return response.data;
  } catch (error) {
    console.error('Auth status check error:', error);
    throw error;
  }
};

// Export the client and authentication methods
module.exports = {
  authClient,
  login,
  logout,
  checkAuthStatus,
  setTokens,
  clearTokens,
  getAuthToken,
  getRefreshToken,
  refreshAuthToken,
  BASE_API_URL
};
