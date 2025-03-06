/**
 * User API Module
 * 
 * Handles user profile and account management.
 * 
 * @module api/user
 */

const { authClient } = require('./auth');

/**
 * Get the current user's profile information
 * 
 * @returns {Promise<Object>} User profile data
 */
const getProfile = async () => {
  try {
    const response = await authClient.get('/user/profile');
    return response.data;
  } catch (error) {
    console.error('Failed to get user profile:', error.message);
    throw error;
  }
};

/**
 * Update the current user's profile information
 * 
 * @param {Object} profileData - Updated profile information
 * @param {string} [profileData.displayName] - User's display name
 * @param {string} [profileData.bio] - User's biography
 * @param {string} [profileData.location] - User's location
 * @returns {Promise<Object>} Updated user profile
 */
const updateProfile = async (profileData) => {
  try {
    const response = await authClient.patch('/user/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Failed to update profile:', error.message);
    throw error;
  }
};

/**
 * Upload a profile picture
 * 
 * @param {File|Blob} imageFile - Image file to upload
 * @returns {Promise<Object>} Upload result with image URL
 */
const uploadProfilePicture = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    
    const response = await authClient.post('/user/profile/picture', formData, {
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
 * @param {string} currentPassword - User's current password
 * @param {string} newPassword - User's new password
 * @returns {Promise<Object>} Password change result
 */
const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await authClient.post('/user/change-password', {
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
 * @returns {Promise<Object>} Verification status
 */
const getVerificationStatus = async () => {
  try {
    const response = await authClient.get('/user/verification-status');
    return response.data;
  } catch (error) {
    console.error('Failed to get verification status:', error.message);
    throw error;
  }
};

/**
 * Get the user's notification settings
 * 
 * @returns {Promise<Object>} Notification settings
 */
const getNotificationSettings = async () => {
  try {
    const response = await authClient.get('/user/notification-settings');
    return response.data;
  } catch (error) {
    console.error('Failed to get notification settings:', error.message);
    throw error;
  }
};

/**
 * Update the user's notification settings
 * 
 * @param {Object} settings - Updated notification settings
 * @returns {Promise<Object>} Updated notification settings
 */
const updateNotificationSettings = async (settings) => {
  try {
    const response = await authClient.patch('/user/notification-settings', settings);
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

