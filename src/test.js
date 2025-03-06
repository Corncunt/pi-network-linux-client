/**
 * Pi Network API Integration Test
 * 
 * This file demonstrates how to use the updated Pi Network API modules
 * for authentication, wallet operations, mining status, and profile information.
 */

// 1. Import the necessary API modules
const auth = require('./api/auth');
const wallet = require('./api/wallet');
const mining = require('./api/mining');
const user = require('./api/user');
const social = require('./api/social');

// Define an async function to run all our tests
async function runTests() {
  try {
    console.log('===== PI NETWORK API TEST =====');
    
    // 2. Authentication Example
    console.log('\n----- AUTHENTICATION -----');
    try {
      // Attempt to log in with credentials
      console.log('Logging in user...');
      const loginResponse = await auth.login('username', 'password');
      console.log('Login successful!');
      console.log('Token:', loginResponse.token);
      
      // The auth module's authClient now has the token set in its headers
      // All subsequent API calls will use this token automatically
    } catch (error) {
      console.error('Login failed:', error.message);
      // If authentication fails, we can't proceed with other tests
      return;
    }
    
    // 3. Wallet Operations
    console.log('\n----- WALLET OPERATIONS -----');
    try {
      // Get wallet balance
      console.log('Fetching wallet balance...');
      const balance = await wallet.getBalance();
      console.log('Current Pi balance:', balance.amount);
      
      // Get wallet address
      console.log('Fetching wallet address...');
      const address = await wallet.getWalletAddress();
      console.log('Wallet address:', address);
      
      // Example of how to send Pi (commented out to prevent actual transfers)
      console.log('Example of how to send Pi (not executing):');
      console.log('await wallet.sendPi("recipient_username", 1.0, "Test payment");');
      
      // Get transaction history
      console.log('Fetching transaction history...');
      const transactions = await wallet.getTransactionHistory();
      console.log(`Found ${transactions.length} transactions`);
      if (transactions.length > 0) {
        console.log('Latest transaction:', transactions[0]);
      }
    } catch (error) {
      console.error('Wallet operations failed:', error.message);
    }
    
    // 4. Mining Status
    console.log('\n----- MINING STATUS -----');
    try {
      // Check current mining status
      console.log('Checking mining status...');
      const miningStatus = await mining.checkMiningStatus();
      console.log('Mining active:', miningStatus.isActive);
      console.log('Mining session ends:', new Date(miningStatus.sessionEndTime).toLocaleString());
      
      // Get mining rate
      console.log('Fetching mining rate...');
      const rate = await mining.getMiningRate();
      console.log('Current mining rate:', rate, 'Pi/hour');
      
      // Example of starting a mining session (commented out to prevent actual activation)
      console.log('Example of how to start mining (not executing):');
      console.log('await mining.startMiningSession();');
    } catch (error) {
      console.error('Mining status check failed:', error.message);
    }
    
    // 5. User Profile Information
    console.log('\n----- USER PROFILE -----');
    try {
      // Get user profile
      console.log('Fetching user profile...');
      const profile = await user.getProfile();
      console.log('Username:', profile.username);
      console.log('Full Name:', profile.firstName + ' ' + profile.lastName);
      console.log('Account Type:', profile.accountType);
      console.log('Verification Status:', profile.verificationStatus);
      
      // Get KYC status if available
      if (profile.kycStatus) {
        console.log('KYC Status:', profile.kycStatus);
      }
    } catch (error) {
      console.error('Profile retrieval failed:', error.message);
    }
    
    // 6. Social Features
    console.log('\n----- SOCIAL FEATURES -----');
    try {
      // Get security circle
      console.log('Fetching security circle...');
      const contacts = await social.getSecurityCircle();
      console.log(`Found ${contacts.length} members in security circle`);
      if (contacts.length > 0) {
        console.log('First security circle member:', contacts[0].username);
      }
    } catch (error) {
      console.error('Social features failed:', error.message);
    }
    
    // 7. Logout (cleanup)
    console.log('\n----- LOGGING OUT -----');
    try {
      await auth.logout();
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error.message);
    }
  } catch (error) {
    // Global error handling
    console.error('Test failed with critical error:', error);
  }
}

// Run the tests
console.log('Starting API tests...');
runTests()
  .then(() => console.log('\nTests completed!'))
  .catch(error => console.error('\nTests failed with error:', error));

/**
 * HOW TO RUN:
 * 
 * 1. In your terminal, navigate to the project directory
 * 2. Run: node src/test.js
 * 
 * NOTES:
 * - This test uses the shared authClient from auth.js for all API operations
 * - Authentication token is automatically managed across all API modules
 * - Error handling is implemented at multiple levels:
 *   a. Individual operation level to continue with other tests even if one fails
 *   b. Global try/catch to handle unexpected errors
 * - Token refresh is handled automatically by the authClient's interceptors
 */

