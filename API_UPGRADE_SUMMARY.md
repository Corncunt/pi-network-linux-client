# API Integration - Upgrade Summary

## What's Changed

We've refactored the API modules to use a shared authenticated Axios client instance for all API operations. This addresses the issues you were experiencing and provides several benefits:

1. **Centralized Token Management**: All authentication tokens are now managed in a single place (auth.js)
2. **Shared Axios Client**: All API modules use the same pre-configured Axios instance with auth interceptors
3. **Consistent Error Handling**: Token refresh and error handling are implemented consistently across all requests
4. **Simplified API Usage**: The client instantiation logic is now cleaner and more maintainable

## Key Components

1. **auth.js**: Contains the shared Axios client (authClient) and all authentication/token handling logic
2. **index.js**: Creates the API facade using the shared authClient and binds methods from all modules
3. **Specialized API modules**: Each module (wallet.js, mining.js, etc.) focuses on domain-specific API calls

## How to Use the New API

### Basic Usage (Recommended)

```javascript
const { api } = require('./src/api');

// Authentication
async function loginUser() {
  const result = await api.auth.login('username', 'password');
  if (result.success) {
    console.log('Logged in successfully:', result.user);
  } else {
    console.error('Login failed:', result.error);
  }
}

// Using other API methods
async function getUserWalletInfo() {
  try {
    const balance = await api.wallet.getBalance();
    console.log('Wallet balance:', balance);
    
    const txHistory = await api.wallet.getTransactionHistory({ limit: 10 });
    console.log('Recent transactions:', txHistory);
  } catch (error) {
    console.error('Error fetching wallet info:', error);
  }
}
```

### Direct Client Usage (Advanced)

For advanced use cases, you can access the authClient directly:

```javascript
const { authClient } = require('./src/api');

// Make custom requests
async function customApiCall() {
  try {
    const response = await authClient.get('/custom/endpoint');
    return response.data;
  } catch (error) {
    console.error('Custom API call failed:', error);
    throw error;
  }
}
```

## Authentication Flow

1. **Login**: Call `api.auth.login(username, password)` to authenticate a user
2. **Token Management**: Authentication tokens are automatically stored and managed
3. **Request Authentication**: All subsequent API calls automatically include the auth token
4. **Token Refresh**: Expired tokens are automatically refreshed when possible
5. **Logout**: Call `api.auth.logout()` to end the session and clear tokens

## Error Handling

All API methods follow a consistent error handling pattern:
- Normal errors are thrown and should be caught using try/catch
- Authentication errors (401) trigger automatic token refresh attempts
- If token refresh fails, tokens are cleared and the user needs to re-authenticate

---

This upgrade provides a solid foundation for your Pi Network API integration. The shared authClient approach ensures consistent authentication handling across all API interactions.
