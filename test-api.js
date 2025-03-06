/**
 * API Integration Test Script
 * 
 * This script demonstrates how to use the refactored Pi Network API client.
 */

// Import the API module
const { api } = require('./src/api');

// Example usage functions
async function testAuthentication() {
  console.log('Testing authentication...');
  
  try {
    // Attempt to login (replace with actual credentials for testing)
    const loginResult = await api.auth.login('testuser', 'password123');
    
    if (loginResult.success) {
      console.log('✅ Login successful!');
      console.log('User:', loginResult.user);
      
      // Check auth status
      const statusResult = await api.auth.checkAuthStatus();
      console.log('Auth status:', statusResult);
      
      // Logout
      const logoutResult = await api.auth.logout();
      console.log('Logout result:', logoutResult);
    } else {
      console.log('❌ Login failed:', loginResult.error);
    }
  } catch (error) {
    console.error('Authentication test error:', error.message);
  }
}

async function testWalletOperations() {
  console.log('\nTesting wallet operations...');
  
  try {
    // First login (would be needed in a real scenario)
    // await api.auth.login('testuser', 'password123');
    
    // Get wallet balance
    console.log('Fetching wallet balance...');
    const balance = await api.wallet.getBalance();
    console.log('Wallet balance:', balance);
    
    // Get transaction history
    console.log('Fetching transaction history...');
    const transactions = await api.wallet.getTransactionHistory({ limit: 5 });
    console.log('Recent transactions:', transactions);
  } catch (error) {
    console.error('Wallet operations test error:', error.message);
  }
}

async function testMiningOperations() {
  console.log('\nTesting mining operations...');
  
  try {
    // Check mining status
    console.log('Checking mining status...');
    const status = await api.mining.checkMiningStatus();
    console.log('Mining status:', status);
    
    // Get mining rate
    console.log('Fetching mining rate...');
    const rate = await api.mining.getMiningRate();
    console.log('Mining rate:', rate);
  } catch (error) {
    console.error('Mining operations test error:', error.message);
  }
}

// Main function to run all tests
async function runTests() {
  console.log('=== PI NETWORK API TEST ===');
  
  // Note: In a real scenario, you would need valid credentials
  // to run these tests. Without valid authentication, most
  // API calls will fail with 401 Unauthorized errors.
  
  await testAuthentication();
  await testWalletOperations();
  await testMiningOperations();
  
  console.log('\n=== TEST COMPLETE ===');
}

// Run the tests
runTests().catch(error => {
  console.error('Test script error:', error);
});
