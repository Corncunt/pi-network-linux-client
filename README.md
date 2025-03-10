# Pi Network Authentication Debugging Guide

## 1. Overview of the Authentication Flow

The Pi Network Linux client uses a multi-step authentication process to securely connect to the Pi Network servers:

1. **Initial Authentication**: 
   - The user enters credentials (username/password) in the login form
   - These credentials are sent to the Pi Network API endpoint (either `/auth/login` or `/v2/auth/login`)
   - On success, the server returns an access token and refresh token

2. **Token Management**:
   - The access token is stored and used for subsequent API requests
   - The token is included in the `Authorization: Bearer <token>` header
   - Tokens have a limited lifespan and must be refreshed periodically

3. **Token Refresh Process**:
   - When the access token expires, requests receive a 401 Unauthorized response
   - The refresh token is used to obtain a new access token without requiring re-login
   - If the refresh token is also expired, the user must log in again

4. **Request Interceptors**:
   - The application uses Axios interceptors to automatically:
     - Add the authentication token to outgoing requests
     - Handle token refresh when receiving 401 responses
     - Retry the original request with the new token

## 2. Common Authentication Issues

Several issues can affect the Pi Network authentication process:

### API Endpoint Mismatches
- Incorrect API base URL (should be `https://api.minepi.com/v2`)
- Path inconsistencies between different parts of the codebase
- API version misalignment (e.g., using `/auth/login` instead of `/v2/auth/login`)

### Request Formatting Problems
- Incorrect Content-Type headers (should be `application/json`)
- Malformed JSON in the request body
- Missing or incorrect parameters (username, password, etc.)

### Token Handling Issues
- Improper storage of tokens causing them to be lost between sessions
- Failure to include the token in the Authorization header
- Incorrect token refresh implementation

### Error Handling Deficiencies
- Inconsistent error response parsing
- Missing error messages in the UI
- Failure to detect and handle network connectivity issues

## 3. How to Use the Debugging Tools

We've created two specialized tools to help debug authentication issues:

### test-auth.js - Command Line Testing Tool

This tool allows direct testing of the Pi Network authentication endpoints:

```bash
# Basic usage
node test-auth.js --username yourusername --password yourpassword

# With verbose logging
node test-auth.js --username yourusername --password yourpassword --verbose

# Get help about available options
node test-auth.js --help
```

Key features:
- Tests both potential API endpoints (`/auth/login` and `/v2/auth/login`)
- Provides detailed request and response information
- Logs all data for later analysis

### debug-auth.js - Interactive Debugging Tool

This more sophisticated tool provides an interactive experience:

```bash
# Basic usage
node debug-auth.js

# With verbose logging
node debug-auth.js --verbose

# Save working credentials for later testing
node debug-auth.js --save
```

Key features:
- Interactive prompts for credentials (better security)
- Tests multiple endpoints and configurations
- Option to save working credentials locally
- Provides tailored troubleshooting recommendations
- Creates detailed log files with timestamp

### Using the Developer Tools

When running the app in development mode:

```bash
npm run dev
```

1. Press `Ctrl+Shift+I` to open the DevTools console
2. Filter the logs by typing "[DEBUG]" in the console filter
3. Watch for authentication-related messages and errors

## 4. Troubleshooting the API Connection

Follow this systematic approach to diagnose authentication issues:

### Step 1: Verify API Endpoints
Use the debug-auth.js tool to determine the correct endpoint:
```bash
node debug-auth.js --verbose
```

Look for:
- Which endpoint returns a successful response
- Any specific error messages from the server
- HTTP status codes (401, 404, 500, etc.)

### Step 2: Check Request Format
Examine the verbose logs to ensure:
- Correct Content-Type headers
- Properly formatted JSON payload
- All required parameters are included

### Step 3: Network Connectivity
- Ensure you can reach api.minepi.com from your network
- Try from different networks (switch between Wi-Fi and cellular)
- Check if a proxy or VPN is interfering with the connection

### Step 4: Account Status
- Verify your Pi Network credentials work in the official app
- Check if your account has security measures like 2FA enabled
- Ensure your account is in good standing (not locked or restricted)

### Step 5: Application Configuration
- Check for environment variables that might override API settings
- Ensure the local storage is functioning properly
- Verify the Electron app has proper permissions

## 5. Next Steps for Implementation

Once you've identified the correct endpoint and authentication flow:

### 1. Standardize API URLs
Update all files to use the correct base URL and endpoints:
- main.js
- src/api/auth.js
- Any other files making API calls

### 2. Implement Robust Error Handling
- Add specific error messages for different failure scenarios
- Ensure the UI properly displays these messages
- Log errors with enough context for debugging

### 3. Enhance Token Management
- Implement secure storage of tokens
- Ensure proper token refresh logic
- Add token validation checks

### 4. Add Comprehensive Logging
- Include timestamps and request IDs
- Log important events without exposing sensitive data
- Create a way to enable/disable verbose logging

### 5. Implement Retry Logic
- Add exponential backoff for failed requests
- Handle network interruptions gracefully
- Provide feedback to the user during long operations

### 6. Testing and Validation
- Create automated tests for the authentication flow
- Test edge cases (network drops, server errors, etc.)
- Verify all API interactions work correctly

By following these steps, you should be able to resolve authentication issues and ensure a reliable connection to the Pi Network API.

# Pi Network API Integration

## Overview

This project provides a comprehensive Node.js integration with the Pi Network API, allowing developers to interact with Pi Network services including authentication, wallet operations, mining functionality, user management, and social features. The integration uses a centralized authentication client that handles token management across all API modules.

## Architecture

The API integration is structured with a modular approach:

```
src/api/
├── auth.js        # Authentication & token management
├── wallet.js      # Wallet operations (balance, transfers)
├── mining.js      # Mining sessions & rewards
├── user.js        # User profile & settings
├── social.js      # Social connections & security circle
└── index.js       # API aggregator
```

### Shared Authentication Client

The core of the integration is the `authClient`, a pre-configured Axios instance that:

- Manages authentication tokens
- Automatically injects auth tokens into requests
- Handles token refresh when expired
- Provides consistent error handling

All API modules use this shared client to ensure consistent authentication across the entire application.

## API Modules

### Authentication (auth.js)

Handles user authentication, token management, and session control.

**Key Functions:**

- `login(username, password)` - Authenticate with Pi Network
- `refreshToken(refreshToken)` - Refresh an expired access token
- `logout()` - End the current session
- `checkStatus()` - Verify authentication status

### Wallet (wallet.js)

Manages Pi cryptocurrency operations.

**Key Functions:**

- `getBalance()` - Retrieve current Pi balance
- `getTransactions()` - List past transactions
- `sendPi(recipient, amount, memo)` - Transfer Pi to another user
- `getWalletAddress()` - Get the user's wallet address

### Mining (mining.js)

Controls Pi mining sessions and rewards.

**Key Functions:**

- `startSession()` - Begin a mining session
- `checkRewards()` - Get information about earned rewards
- `getMiningRate()` - Get the current mining rate
- `getActiveMinerCount()` - Get the number of active miners
- `checkMiningStatus()` - Check if the user is currently mining

### User Management (user.js)

Handles user profile data and settings.

**Key Functions:**

- `getProfile()` - Get the user's profile information
- `updateProfile(data)` - Update profile information
- `getAppSettings()` - Get application settings
- `updateAppSettings(settings)` - Update application settings

### Social (social.js)

Manages social connections and security circles.

**Key Functions:**

- `getSecurityCircle()` - Get the user's security circle members
- `addToSecurityCircle(username)` - Add a user to security circle
- `removeFromSecurityCircle(username)` - Remove a user from security circle
- `getInvites()` - Get pending invites

## Token Management

The integration handles authentication tokens securely:

1. **Token Storage**: Tokens are stored securely and never exposed in the client-side code
2. **Automatic Injection**: The `authClient` automatically injects tokens into request headers
3. **Token Refresh**: When a token expires, the system automatically attempts to refresh it
4. **Session Recovery**: If refresh fails, the user is prompted to reauthenticate

```javascript
// How token management works (simplified)
authClient.interceptors.request.use(
  async (config) => {
    // Inject token into request headers
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  }
);

// Handle expired tokens
authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired, try to refresh
      try {
        await refreshToken();
        // Retry the original request
        return authClient(error.config);
      } catch (refreshError) {
        // Refresh failed, force re-login
        clearTokens();
        throw new Error('Session expired. Please login again.');
      }
    }
    return Promise.reject(error);
  }
);
```

## Usage Examples

### Authentication

```javascript
const { auth } = require('./src/api');

// Login
async function loginUser(username, password) {
  try {
    const result = await auth.login(username, password);
    console.log('Login successful!', result.user);
    return result;
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
}

// Logout
async function logoutUser() {
  try {
    await auth.logout();
    console.log('Logout successful!');
  } catch (error) {
    console.error('Logout failed:', error.message);
  }
}
```

### Wallet Operations

```javascript
const { wallet } = require('./src/api');

// Check balance
async function checkBalance() {
  try {
    const balance = await wallet.getBalance();
    console.log('Current balance:', balance.amount, 'Pi');
    return balance;
  } catch (error) {
    console.error('Failed to get balance:', error.message);
    throw error;
  }
}

// Send Pi
async function sendPayment(recipient, amount, memo = '') {
  try {
    const result = await wallet.sendPi(recipient, amount, memo);
    console.log('Payment sent successfully!', result.transactionId);
    return result;
  } catch (error) {
    console.error('Payment failed:', error.message);
    throw error;
  }
}
```

### Mining

```javascript
const { mining } = require('./src/api');

// Start mining
async function startMining() {
  try {
    const session = await mining.startSession();
    console.log('Mining session started:', session.id);
    return session;
  } catch (error) {
    console.error('Failed to start mining:', error.message);
    throw error;
  }
}

// Check mining status
async function checkMiningStatus() {
  try {
    const status = await mining.checkMiningStatus();
    console.log('Mining active:', status.active);
    console.log('Current rate:', status.rate, 'Pi/hour');
    return status;
  } catch (error) {
    console.error('Failed to check mining status:', error.message);
    throw error;
  }
}
```

## Testing the Integration

1. **Set up credentials**:
   Create a `.env` file with your Pi Network credentials (for testing only, never commit this file)
   ```
   PI_USERNAME=your_username
   PI_PASSWORD=your_password
   ```

2. **Run the test script**:
   ```
   node src/test.js
   ```

3. **Check each module**:
   The test script will try each of the main API functions and report success or failure.

## Error Handling

The integration provides consistent error handling across all modules:

```javascript
try {
  const result = await wallet.sendPi('recipient', 1.0, 'Test payment');
  // Handle success
} catch (error) {
  if (error.response) {
    // The server responded with an error
    console.error('API Error:', error.response.data.message);
    
    // Handle specific error codes
    if (error.response.status === 401) {
      // Authentication error
    } else if (error.response.status === 400) {
      // Invalid request
    }
  } else if (error.request) {
    // No response received
    console.error('Network Error: No response from server');
  } else {
    // Other error
    console.error('Error:', error.message);
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# Pi Network for Linux

## Project Overview

This project aims to create an unofficial Linux client for Pi Network, enabling Linux users to interact with the Pi Network ecosystem. Pi Network is a cryptocurrency project that allows users to earn Pi coins by validating transactions on a mobile app.

Since Pi Network doesn't officially support Linux, this project reverse engineers the existing macOS/Windows applications to create a compatible Linux version using Electron, providing similar functionality while respecting Pi Network's terms of service.

The project includes a modular API client structure and network traffic analysis tools to help with reverse engineering the Pi Network application protocol.

### Key Features (Planned)

- User authentication and account management
- Wallet functionality and transaction history
- Mining/earning mechanism
- Invites and team building features
- Profile management
- Notifications and updates

## Setup Instructions

### Prerequisites

- Linux-based operating system (Debian/Ubuntu, Fedora/RHEL, or other major distributions)
- Internet connection for downloading dependencies

### Quick Setup

1. Clone this repository:
```bash
git clone https://github.com/yourusername/pi-network-linux.git
cd pi-network-linux
```

2. Run the setup script:
```bash
./setup.sh
```

This script will:
- Check for and install required dependencies (Node.js, npm)
- Set up the development environment
- Install project dependencies
- Provide instructions for running the application

### Manual Setup

If you prefer to set up manually or the setup script doesn't work for your distribution:

1. Ensure Node.js and npm are installed:
```bash
# For Debian/Ubuntu
sudo apt update && sudo apt install -y nodejs npm

# For Fedora/RHEL
sudo dnf install -y nodejs npm
```

2. Install project dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

## Development Guidelines

### Code Style

- Follow JavaScript Standard Style guidelines
- Use meaningful variable and function names
- Include JSDoc comments for functions and complex code blocks
- Write clean, modular code with appropriate error handling

### Branch Strategy

- `main`: Stable release version
- `dev`: Active development branch
- Feature branches: Use format `feature/feature-name`
- Bug fix branches: Use format `fix/bug-description`

### Commit Messages

Use conventional commit format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding or modifying tests
- `chore:` for maintenance tasks

## Project Structure

```
pi-network-linux/
├── main.js                 # Main Electron process
├── preload.js              # Preload script for secure context bridge
├── renderer.js             # Renderer process script
├── index.html              # Main UI entry point
├── package.json            # Project configuration and dependencies
├── research.md             # Documentation of Pi Network research findings
├── development-plan.md     # Project development plan and roadmap
├── setup.sh                # Environment setup script
├── src/                    # Application source code
│   └── api/                # API client modules
│       ├── index.js        # Main API client initialization
│       ├── auth.js         # Authentication-related endpoints
│       ├── user.js         # User profile and account endpoints
│       ├── wallet.js       # Cryptocurrency wallet endpoints
│       ├── mining.js       # Mining/earning mechanism endpoints
│       └── social.js       # Security circles and social features
├── reverse-engineering/    # Reverse engineering documentation and tools
│   ├── network-analysis.md           # Guide for analyzing network traffic
│   └── network-traffic-analyzer.js   # Tool for capturing and analyzing API calls
└── assets/                 # Images, icons, and other static assets
```

## Contribution Guidelines

We welcome contributions from the community! Here's how you can help:

1. **Report Issues**: Create GitHub issues for bugs or feature requests
2. **Submit Pull Requests**: Contribute code improvements or new features
3. **Documentation**: Help improve or translate documentation
4. **Testing**: Test the application on different Linux distributions

### Pull Request Process

1. Fork the repository and create your branch from `dev`
2. Update documentation as needed for changes
3. Ensure all tests pass
4. Submit a pull request with a clear description of changes

## Testing Instructions

### Running Tests

```bash
npm test
```

### Manual Testing

1. Start the application using `npm start`
2. Test all user flows and interactions
3. Check for console errors or unexpected behavior
4. Test on different Linux distributions if possible

## License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2023 Pi Network Linux Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Disclaimer

**IMPORTANT: This is an UNOFFICIAL project and is NOT affiliated with, endorsed by, or connected to Pi Network, Pi Core Team, or any of their affiliates or subsidiaries.**

This project is created by community members for educational purposes and to provide Linux compatibility. The developers of this project make no claims to Pi Network intellectual property and are not responsible for any issues that may arise from using this software.

Use at your own risk. This project does not guarantee:
- Compatibility with future Pi Network updates
- The security of your Pi Network account or assets
- Compliance with all Pi Network terms of service

**All Pi Network logos, trademarks, and assets are the property of their respective owners.**

## Current Progress and Next Steps

### Completed
- Basic Electron application structure
- Modular API client architecture with placeholders for all main Pi Network features
- Network traffic analyzer for reverse engineering the Pi Network protocol
- Development environment setup and project documentation

### API Client Structure
The project implements a modular API client with the following components:
- **Main API Client** (`src/api/index.js`): Handles configuration, authentication headers, and exports all API modules
- **Authentication** (`src/api/auth.js`): Endpoints for login, registration, and session management
- **User Profile** (`src/api/user.js`): Endpoints for user data and account settings
- **Wallet** (`src/api/wallet.js`): Cryptocurrency wallet operations and transaction history
- **Mining** (`src/api/mining.js`): Interfaces for the Pi mining/earning mechanism
- **Social Features** (`src/api/social.js`): Security circles and invitation system

### Coming Next
- Complete API endpoint discovery through reverse engineering
- Implementation of authentication and basic user functionality
- UI development with React components
- Testing across various Linux distributions
- First beta release for community testing

We welcome contributors to help with any of these upcoming tasks!

