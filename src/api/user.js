/**
 * User API Module
 * 
 * Handles user profile and account management.
 * 
 * @module api/user
 */

/**
 * Get the current user's profile information
 * 
 * @param {Object} client - Axios client instance
 * @returns {Promise<Object>} User profile data
 */
const getProfile = async (client) => {
  try {
    const response = await client.get('/user/profile');
    return response.data;
  } catch (error) {
    console.error('Failed to get user profile:', error.message);
    throw error;
  }
};

/**
 * Update the current user's profile information
 * 
 * @param {Object} client - Axios client instance
 * @param {Object} profileData - Updated profile information
 * @param {string} [profileData.displayName] - User's display name
 * @param {string} [profileData.bio] - User's biography
 * @param {string} [profileData.location] - User's location
 * @returns {Promise<Object>} Updated user profile
 */
const updateProfile = async (client, profileData) => {
  try {
    const response = await client.patch('/user/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Failed to update profile:', error.message);
    throw error;
  }
};

/**
 * Upload a profile picture
 * 
 * @param {Object} client - Axios client instance
 * @param {File|Blob} imageFile - Image file to upload
 * @returns {Promise<Object>} Upload result with image URL
 */
const uploadProfilePicture = async (client, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    
    const response = await client.post('/user/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to upload profile picture:', error.message);
    throw error;
  }
};

/**
 * Change the user's password
 * 
 * @param {Object} client - Axios client instance
 * @param {string} currentPassword - User's current password
 * @param {string} newPassword - User's new password
 * @returns {Promise<Object>} Password change result
 */
const changePassword = async (client, currentPassword, newPassword) => {
  try {
    const response = await client.post('/user/change-password', {
      currentPassword,
      newPassword
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to change password:', error.message);
    throw error;
  }
};

/**
 * Get the user's account verification status
 * 
 * @param {Object} client - Axios client instance
 * @returns {Promise<Object>} Verification status
 */
const getVerificationStatus = async (client) => {
  try {
    const response = await client.get('/user/verification-status');
    return response.data;
  } catch (error) {
    console.error('Failed to get verification status:', error.message);
    throw error;
  }
};

/**
 * Get the user's notification settings
 * 
 * @param {Object} client - Axios client instance
 * @returns {Promise<Object>} Notification settings
 */
const getNotificationSettings = async (client) => {
  try {
    const response = await client.get('/user/notification-settings');
    return response.data;
  } catch (error) {
    console.error('Failed to get notification settings:', error.message);
    throw error;
  }
};

/**
 * Update the user's notification settings
 * 
 * @param {Object} client - Axios client instance
 * @param {Object} settings - Updated notification settings
 * @returns {Promise<Object>} Updated notification settings
 */
const updateNotificationSettings = async (client, settings) => {
  try {
    const response = await client.patch('/user/notification-settings', settings);
    return response.data;
  } catch (error) {
    console.error('Failed to update notification settings:', error.message);
    throw error;
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  changePassword,
  getVerificationStatus,
  getNotificationSettings,
  updateNotificationSettings
};

