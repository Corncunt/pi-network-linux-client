/**
 * Authentication API Module
 * 
 * Handles user authentication, registration, and token management.
 * 
 * @module api/auth
 */

// In-memory token storage (would be replaced with secure storage in production)
let authToken = null;

/**
 * Get the stored authentication token
 * 
 * @returns {string|null} The authentication token if available
 */
const getToken = () => authToken;

/**
 * Store an authentication token
 * 
 * @param {string} token - The authentication token to store
 */
const setToken = (token) => {
  authToken = token;
};

/**
 * Clear the stored authentication token (logout)
 */
const clearToken = () => {
  authToken = null;
};

/**
 * Log in with username and password
 * 
 * @param {Object} client - Axios client instance
 * @param {string} username - User's username or email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User data and authentication token
 */
const login = async (client, username, password) => {
  try {
    const response = await client.post('/auth/login', { username, password });
    if (response.data && response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
};

/**
 * Register a new user account
 * 
 * @param {Object} client - Axios client instance
 * @param {Object} userData - User registration data
 * @param {string} userData.username - Desired username
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - User's password
 * @param {string} userData.phoneNumber - User's phone number
 * @returns {Promise<Object>} New user data and authentication token
 */
const register = async (client, userData) => {
  try {
    const response = await client.post('/auth/register', userData);
    if (response.data && response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error.message);
    throw error;
  }
};

/**
 * Verify a user's phone number with a code
 * 
 * @param {Object} client - Axios client instance
 * @param {string} phoneNumber - User's phone number
 * @param {string} verificationCode - Verification code received by SMS
 * @returns {Promise<Object>} Verification result
 */
const verifyPhone = async (client, phoneNumber, verificationCode) => {
  try {
    const response = await client.post('/auth/verify-phone', {
      phoneNumber,
      verificationCode
    });
    return response.data;
  } catch (error) {
    console.error('Phone verification failed:', error.message);
    throw error;
  }
};

/**
 * Reset a user's password
 * 
 * @param {Object} client - Axios client instance
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Reset password result
 */
const resetPassword = async (client, email) => {
  try {
    const response = await client.post('/auth/reset-password', { email });
    return response.data;
  } catch (error) {
    console.error('Password reset failed:', error.message);
    throw error;
  }
};

/**
 * Log out the current user
 * 
 * @param {Object} client - Axios client instance
 * @returns {Promise<Object>} Logout result
 */
const logout = async (client) => {
  try {
    const response = await client.post('/auth/logout');
    clearToken();
    return response.data;
  } catch (error) {
    console.error('Logout failed:', error.message);
    // Clear token even if the request fails
    clearToken();
    throw error;
  }
};

module.exports = {
  getToken,
  setToken,
  clearToken,
  login,
  register,
  verifyPhone,
  resetPassword,
  logout
};

