/**
 * API Module for Pi Network social and security circle features
 * This module handles all endpoints related to security circles, invitations,
 * and social graph interactions within the Pi Network ecosystem
 * 
 * @module api/social
 */

const { authClient } = require('./auth');

/**
 * Get the current user's security circle information
 * 
 * @async
 * @returns {Promise<Object>} - Details about the user's security circle
 * @throws {Error} If security circle information could not be retrieved
 */
const getSecurityCircle = async () => {
  try {
    const response = await authClient.get('/social/security-circle');
    return response.data;
  } catch (error) {
    console.error('Failed to get security circle information:', error.message);
    throw error;
  }
};

/**
 * Add a user to the security circle
 * 
 * @async
 * @param {string} userId - ID of the user to add to the security circle
 * @returns {Promise<Object>} - Updated security circle information
 * @throws {Error} If the user could not be added to the security circle
 */
const addToSecurityCircle = async (userId) => {
  try {
    const response = await authClient.post('/social/security-circle/add', { userId });
    return response.data;
  } catch (error) {
    console.error('Failed to add user to security circle:', error.message);
    throw error;
  }
};

/**
 * Remove a user from the security circle
 * 
 * @async
 * @param {string} userId - ID of the user to remove from the security circle
 * @returns {Promise<Object>} - Updated security circle information
 * @throws {Error} If the user could not be removed from the security circle
 */
const removeFromSecurityCircle = async (userId) => {
  try {
    const response = await authClient.post('/social/security-circle/remove', { userId });
    return response.data;
  } catch (error) {
    console.error('Failed to remove user from security circle:', error.message);
    throw error;
  }
};

/**
 * Invite a user to join Pi Network
 * 
 * @async
 * @param {Object} invitation - Invitation details
 * @param {string} invitation.phoneNumber - Phone number of the invitee
 * @param {string} [invitation.email] - Email of the invitee
 * @param {string} [invitation.message] - Custom invitation message
 * @returns {Promise<Object>} - Information about the sent invitation
 * @throws {Error} If the invitation could not be sent
 */
const inviteUser = async (invitation) => {
  try {
    const response = await authClient.post('/social/invite', invitation);
    return response.data;
  } catch (error) {
    console.error('Failed to send invitation:', error.message);
    throw error;
  }
};

/**
 * Get all pending invitations sent by the user
 * 
 * @async
 * @param {Object} options - Options for fetching invitations
 * @param {number} [options.limit=20] - Maximum number of records to return
 * @param {number} [options.page=1] - Page number for pagination
 * @returns {Promise<Object>} - List of pending invitations
 * @throws {Error} If invitations could not be retrieved
 */
const getSentInvitations = async (options = {}) => {
  try {
    const { limit = 20, page = 1 } = options;
    
    const response = await authClient.get('/social/invitations/sent', {
      params: { limit, page }
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to get sent invitations:', error.message);
    throw error;
  }
};

/**
 * Get all invitations received by the user
 * 
 * @async
 * @param {Object} options - Options for fetching invitations
 * @param {number} [options.limit=20] - Maximum number of records to return
 * @param {number} [options.page=1] - Page number for pagination
 * @returns {Promise<Object>} - List of received invitations
 * @throws {Error} If invitations could not be retrieved
 */
const getReceivedInvitations = async (options = {}) => {
  try {
    const { limit = 20, page = 1 } = options;
    
    const response = await authClient.get('/social/invitations/received', {
      params: { limit, page }
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to get received invitations:', error.message);
    throw error;
  }
};

/**
 * Accept an invitation to join someone's security circle
 * 
 * @async
 * @param {string} invitationId - ID of the invitation to accept
 * @returns {Promise<Object>} - Updated invitation status
 * @throws {Error} If the invitation could not be accepted
 */
const acceptInvitation = async (invitationId) => {
  try {
    const response = await authClient.post('/social/invitations/accept', {
      invitationId
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to accept invitation:', error.message);
    throw error;
  }
};

/**
 * Reject an invitation to join someone's security circle
 * 
 * @async
 * @param {string} invitationId - ID of the invitation to reject
 * @returns {Promise<Object>} - Updated invitation status
 * @throws {Error} If the invitation could not be rejected
 */
const rejectInvitation = async (invitationId) => {
  try {
    const response = await authClient.post('/social/invitations/reject', {
      invitationId
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to reject invitation:', error.message);
    throw error;
  }
};

module.exports = {
  getSecurityCircle,
  addToSecurityCircle,
  removeFromSecurityCircle,
  inviteUser,
  getSentInvitations,
  getReceivedInvitations,
  acceptInvitation,
  rejectInvitation
};
