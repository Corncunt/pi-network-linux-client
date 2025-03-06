/**
 * Wallet API Module
 * 
 * Handles cryptocurrency wallet operations, transactions, and balances.
 * 
 * @module api/wallet
 */

/**
 * Get the user's wallet balance
 * 
 * @param {Object} client - Axios client instance
 * @returns {Promise<Object>} Wallet balance information
 */
const getBalance = async (client) => {
  try {
    const response = await client.get('/wallet/balance');
    return response.data;
  } catch (error) {
    console.error('Failed to get wallet balance:', error.message);
    throw error;
  }
};

/**
 * Get the transaction history for the user's wallet
 * 
 * @param {Object} client - Axios client instance
 * @param {Object} [options] - Query options
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=20] - Number of transactions per page
 * @param {string} [options.sort='desc'] - Sort order ('asc' or 'desc')
 * @returns {Promise<Object>} Transaction history with pagination info
 */
const getTransactionHistory = async (client, options = {}) => {
  try {
    const { page = 1, limit = 20, sort = 'desc' } = options;
    const response = await client.get('/wallet/transactions', {
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
 * @param {Object} client - Axios client instance
 * @param {string} transactionId - The ID of the transaction
 * @returns {Promise<Object>} Transaction details
 */
const getTransactionDetails = async (client, transactionId) => {
  try {
    const response = await client.get(`/wallet/transactions/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get transaction details:', error.message);
    throw error;
  }
};

/**
 * Send Pi to another user
 * 
 * @param {Object} client - Axios client instance
 * @param {string} recipient - Recipient's username or address
 * @param {number} amount - Amount of Pi to send
 * @param {string} [memo] - Optional memo for the transaction
 * @returns {Promise<Object>} Transaction result
 */

