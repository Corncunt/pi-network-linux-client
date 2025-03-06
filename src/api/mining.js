/**
 * API Module for Pi Network mining and earning mechanisms
 * This module handles all endpoints related to mining Pi cryptocurrency
 * 
 * @module api/mining
 */

/**
 * Start a mining session for the current user
 * 
 * @async
 * @param {Object} options - Options for starting the mining session
 * @param {number} [options.duration=3600] - Duration of mining session in seconds
 * @param {boolean} [options.enableNotifications=true] - Whether to enable notifications
 * @returns {Promise<Object>} - Information about the started mining session
 * @throws {Error} If the mining session could not be started
 */
const startMiningSession = async (client, options = {}) => {
  try {
    const { duration = 3600, enableNotifications = true } = options;
    
    const response = await client.post('/mining/start', {
      duration,
      enableNotifications
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to start mining session:', error.message);
    throw error;
  }
};

/**
 * Check the current mining status and accumulated earnings
 * 
 * @async
 * @returns {Promise<Object>} - Current mining status and earnings information
 * @throws {Error} If mining status could not be retrieved
 */
const checkMiningStatus = async (client) => {
  try {
    const response = await client.get('/mining/status');
    return response.data;
  } catch (error) {
    console.error('Failed to check mining status:', error.message);
    throw error;
  }
};

/**
 * Get the user's mining history
 * 
 * @async
 * @param {Object} options - Options for fetching mining history
 * @param {number} [options.limit=20] - Maximum number of records to return
 * @param {number} [options.page=1] - Page number for pagination
 * @param {string} [options.startDate] - Start date filter in ISO format
 * @param {string} [options.endDate] - End date filter in ISO format
 * @returns {Promise<Object>} - Mining history with pagination details
 * @throws {Error} If mining history could not be retrieved
 */
const getMiningHistory = async (client, options = {}) => {
  try {
    const { 
      limit = 20, 
      page = 1, 
      startDate, 
      endDate 
    } = options;
    
    const params = { limit, page };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await client.get('/mining/history', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to get mining history:', error.message);
    throw error;
  }
};

/**
 * Get the current mining rate for the user
 * 
 * @async
 * @returns {Promise<Object>} - Mining rate information including base rate and bonuses
 * @throws {Error} If mining rate could not be retrieved
 */
const getMiningRate = async (client) => {
  try {
    const response = await client.get('/mining/rate');
    return response.data;
  } catch (error) {
    console.error('Failed to get mining rate:', error.message);
    throw error;
  }
};

module.exports = {
  startMiningSession,
  checkMiningStatus,
  getMiningHistory,
  getMiningRate
};
