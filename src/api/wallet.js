/**
 * Wallet API Module
 * 
 * Handles cryptocurrency wallet operations, transactions, and balances.
 * 
 * @module api/wallet
 */
const { authClient } = require('./auth');

/**
 * Get the user's wallet balance
 * 
 * @returns {Promise<Object>} Wallet balance information
 */
const getBalance = async () => {
  try {
    const response = await authClient.get('/wallet/balance');
    return response.data;
  } catch (error) {
    console.error('Failed to get wallet balance:', error.message);
    throw error;
  }
};

/**
 * Get the transaction history for the user's wallet
 * 
 * @param {Object} [options] - Query options
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=20] - Number of transactions per page
 * @param {string} [options.sort='desc'] - Sort order ('asc' or 'desc')
 * @returns {Promise<Object>} Transaction history with pagination info
 */
const getTransactionHistory = async (options = {}) => {
  try {
    const { page = 1, limit = 20, sort = 'desc' } = options;
    const response = await authClient.get('/wallet/transactions', {
      params: { page, limit, sort }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get transaction history:', error.message);
    throw error;
  }
};

/**
 * Get details for a specific transaction
 * 
 * @param {string} transactionId - The ID of the transaction
 * @returns {Promise<Object>} Transaction details
 */
const getTransactionDetails = async (transactionId) => {
  try {
    const response = await authClient.get(`/wallet/transactions/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get transaction details:', error.message);
    throw error;
  }
};

/**
 * Send Pi to another user
 * 
 * @param {string} recipient - Recipient's username or address
 * @param {number} amount - Amount of Pi to send
 * @param {string} [memo] - Optional memo for the transaction
 * @returns {Promise<Object>} Transaction result
 */
const sendPi = async (recipient, amount, memo = '') => {
  try {
    const response = await authClient.post('/wallet/send', {
      recipient,
      amount,
      memo
    });
    return response.data;
  } catch (error) {
    console.error('Failed to send Pi:', error.message);
    throw error;
  }
};

/**
 * Get the user's wallet address
 * 
 * @returns {Promise<Object>} Wallet address information
 */
const getWalletAddress = async () => {
  try {
    const response = await authClient.get('/wallet/address');
    return response.data;
  } catch (error) {
    console.error('Failed to get wallet address:', error.message);
    throw error;
  }
};

module.exports = {
  getBalance,
  getTransactionHistory,
  getTransactionDetails,
  sendPi,
  getWalletAddress
};
