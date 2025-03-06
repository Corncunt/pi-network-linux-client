#!/usr/bin/env node

/**
 * Pi Network Authentication Debug Script
 * 
 * This script helps debug authentication issues with the Pi Network API by:
 * 1. Using interactive prompts for username/password input
 * 2. Testing multiple API endpoints to determine which one works
 * 3. Storing successful credentials in a local config file
 * 4. Showing detailed logs of requests and responses
 * 5. Providing clear instructions for troubleshooting
 * 
 * Usage:
 *   node debug-auth.js
 *   
 * Options:
 *   --help      Show help information
 *   --clear     Clear stored credentials
 *   --verbose   Show detailed logs
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const util = require('util');
const { program } = require('commander');
const Store = require('electron-store');

// Use prompt-sync for simple command line prompts
// This avoids adding new dependencies as electron already has it
let prompt;
try {
  // Try to require prompt-sync (it might be installed globally)
  prompt = require('prompt-sync')({ sigint: true });
} catch (error) {
  // If not available, provide instructions for manual installation
  console.log('\x1b[33m[WARNING]\x1b[0m The prompt-sync package is needed but not found.');
  console.log('Please install it by running:');
  console.log('  npm install prompt-sync');
  process.exit(1);
}

// Setup command line arguments
program
  .version('1.0.0')
  .description('Debug Pi Network authentication issues interactively')
  .option('-v, --verbose', 'Enable verbose output (show detailed request/response data)')
  .option('-c, --clear', 'Clear stored credentials')
  .option('-s, --save', 'Save successful credentials for future use')
  .option('-t, --test', 'Test saved credentials (if available)')
  .parse(process.argv);

const options = program.opts();

// Create a local store for saving credentials
const store = new Store({
  name: 'pi-debug-credentials',
  encryptionKey: 'pi-network-debug-auth'  // Simple encryption for stored credentials
});

// Configure API endpoints to test
const endpoints = [
  {
    name: 'v2 endpoint',
    url: 'https://api.minepi.com/v2/auth/login',
    description: 'Using /v2/auth/login path'
  },
  {
    name: 'direct endpoint', 
    url: 'https://api.minepi.com/auth/login',
    description: 'Using /auth/login path (without /v2)'
  }
];

/**
 * Log messages with different colors based on their level
 */
const logger = {
  info: (message) => console.log(`\x1b[36m[INFO]\x1b[0m ${message}`),
  success: (message) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${message}`),
  error: (message) => console.log(`\x1b[31m[ERROR]\x1b[0m ${message}`),
  warn: (message) => console.log(`\x1b[33m[WARNING]\x1b[0m ${message}`),
  detail: (message) => {
    if (options.verbose) {
      console.log(`\x1b[90m[DETAIL]\x1b[0m ${message}`);
    }
  },
  object: (label, obj) => {
    if (options.verbose) {
      console.log(`\x1b[90m[DETAIL] ${label}:\x1b[0m`);
      console.log(util.inspect(obj, { colors: true, depth: null }));
    }
  }
};

/**
 * Show welcome banner
 */
function showWelcomeBanner() {
  console.log('\n\x1b[1m\x1b[34m===================================\x1b[0m');
  console.log('\x1b[1m\x1b[34m Pi Network Authentication Debugger \x1b[0m');
  console.log('\x1b[1m\x1b[34m===================================\x1b[0m\n');
  
  console.log('This tool helps debug connection issues with the Pi Network API by:');
  console.log('- Testing your login credentials against multiple API endpoints');
  console.log('- Showing detailed logs of requests and responses');
  console.log('- Saving successful credentials for future testing\n');
  
  if (options.verbose) {
    console.log('\x1b[33mVerbose mode enabled: Showing detailed request/response data\x1b[0m\n');
  }
}

/**
 * Test a single authentication endpoint
 * @param {Object} endpoint - The endpoint configuration to test
 * @param {string} username - The username for authentication
 * @param {string} password - The password for authentication
 * @returns {Promise<Object>} - The result of the authentication attempt
 */
async function testEndpoint(endpoint, username, password) {
  logger.info(`Testing ${endpoint.name}: ${endpoint.description}`);
  logger.detail(`Request URL: ${endpoint.url}`);
  
  const requestData = { username, password };
  logger.detail(`Request payload: { username: "${username}", password: "***" }`);
  
  try {
    // Configure request with detailed logging
    const startTime = new Date();
    
    const response = await axios.post(endpoint.url, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Pi-Network-Linux-TestScript/1.0'
      },
      timeout: 10000,
      validateStatus: () => true // Don't throw errors for any status code
    });
    
    const endTime = new Date();
    const duration = endTime - startTime;
    
    // Log response details
    logger.detail(`Response time: ${duration}ms`);
    logger.detail(`Status code: ${response.status} ${response.statusText}`);
    logger.object('Response headers', response.headers);
    
    // For security reasons, we don't show the actual tokens in logs
    const sanitizedResponseData = { ...response.data };
    if (sanitizedResponseData.token) {
      sanitizedResponseData.token = `${sanitizedResponseData.token.substring(0, 10)}...`;
    }
    if (sanitizedResponseData.refreshToken) {
      sanitizedResponseData.refreshToken = `${sanitizedResponseData.refreshToken.substring(0, 10)}...`;
    }
    logger.object('Response data', sanitizedResponseData);
    
    // Determine if authentication was successful
    if (response.status >= 200 && response.status < 300 && response.data.token) {
      logger.success(`Authentication successful using ${endpoint.name}!`);
      return {
        success: true,
        endpoint: endpoint.name,
        status: response.status,
        hasToken: !!response.data.token,
        hasRefreshToken: !!response.data.refreshToken,
        responseData: sanitizedResponseData,
        actualData: response.data  // Store actual data for possible saving
      };
    } else {
      // Authentication failed
      logger.error(`Authentication failed with ${endpoint.name}. Status: ${response.status}`);
      if (response.data && response.data.error) {
        logger.error(`Error message: ${response.data.error}`);
      }
      
      return {
        success: false,
        endpoint: endpoint.name,
        status: response.status,
        errorMessage: response.data?.error || 'Unknown error',
        responseData: sanitizedResponseData
      };
    }
  } catch (error) {
    // Handle connection errors
    logger.error(`Connection error with ${endpoint.name}: ${error.message}`);
    
    if (error.response) {
      // The server responded with an error status code
      logger.detail(`Status code: ${error.response.status}`);
      logger.object('Response headers', error.response.headers);
      logger.object('Response data', error.response.data);
      
      return {
        success: false,
        endpoint: endpoint.name,
        status: error.response.status,
        errorMessage: error.response.data?.error || error.message,
        responseData: error.response.data
      };
    } else if (error.request) {
      // The request was made but no response was received
      logger.error('No response received from server');
      logger.object('Request details', error.request);
      
      return {
        success: false,
        endpoint: endpoint.name,
        errorMessage: 'No response received from server',
        isConnectionError: true
      };
    } else {
      // Something else caused the error
      return {
        success: false,
        endpoint: endpoint.name,
        errorMessage: error.message,
        isSetupError: true
      };
    }
  }
}

/**
 * Prompt user for credentials
 * @returns {Promise<Object>} The credentials object
 */
async function promptForCredentials() {
  console.log('\nPlease enter your Pi Network credentials:');
  
  // Check if we have saved credentials
  const savedUsername = store.get('username');
  let useSaved = false;
  
  if (savedUsername) {
    console.log(`\x1b[33mFound saved credentials for: ${savedUsername}\x1b[0m`);
    useSaved = prompt('Use saved credentials? (y/n) ').toLowerCase() === 'y';
  }
  
  if (useSaved) {
    return {
      username: store.get('username'),
      password: store.get('password'),
      usedSaved: true
    };
  }
  
  // Get new credentials
  const username = prompt('Username or email: ');
  
  // For security, mask the password input
  process.stdout.write('Password: ');
  const password = prompt('', { echo: '*' });
  console.log(); // Add a newline after password entry
  
  return { username, password, usedSaved: false };
}

/**
 * Save credentials to local store
 * @param {string} username - The username to save
 * @param {string} password - The password to save
 * @param {Object} tokenData - The token data from successful authentication
 */
function saveCredentials(username, password, tokenData) {
  if (options.save) {
    store.set('username', username);
    store.set('password', password);
    store.set('lastTestedEndpoint', tokenData.endpoint);
    store.set('lastTestTime', new Date().toISOString());
    
    // For security, we don't save the actual tokens
    logger.success('Credentials saved successfully for future testing');
  } else {
    logger.info('Credentials not saved. Use --save next time to save them.');
  }
}

/**
 * Clear saved credentials
 */
function clearCredentials() {
  store.clear();
  logger.success('Saved credentials have been cleared');
}

/**
 * Show detailed troubleshooting tips based on test results
 * @param {Array} results - The results of endpoint testing
 */
function showTroubleshootingTips(results) {
  console.log('\n\x1b[1m\x1b[33mTROUBLESHOOTING TIPS:\x1b[0m');
  
  // Check for specific error patterns
  const has401Error = results.some(r => r.status === 401);
  const hasConnectionError = results.some(r => r.isConnectionError);
  const has404Error = results.some(r => r.status === 404);
  
  if (has401Error) {
    console.log('→ Authentication failed (401 Unauthorized):');
    console.log('  • Verify your username and password are correct');
    console.log('  • Check if your Pi Network account has 2FA enabled and requires additional steps');
    console.log('  • Your account might be locked after too many failed attempts');
  }
  
  if (has404Error) {
    console.log('→ Endpoint not found (404 Not Found):');
    console.log('  • The Pi Network API endpoints might have changed');
    console.log('  • Check for Pi Network API documentation updates');
  }
  
  if (hasConnectionError) {
    console.log('→ Connection issues:');
    console.log('  • Check your internet connection');
    console.log('  • Try switching networks (Wi-Fi to cellular or vice versa)');
    console.log('  • Pi Network servers might be experiencing downtime');
  }
  
  console.log('\n→ General tips:');
  console.log('  • Run this script with --verbose for more detailed logs');
  console.log('  • Try the Pi Network mobile app to verify if it works there');
  console.log('  • Check Pi Network community forums for announced issues');
  console.log('  • Try again later as the API may be temporarily unavailable');
  
  console.log('\nIf you manage to successfully login, run this script with --save to');
  console.log('store working credentials for future testing.\n');
}

/**
 * Write a debug log file with detailed information
 * @param {Array} results - The results of endpoint testing
 * @param {Object} credentials - The credentials used
 */
function writeDebugLogFile(results, credentials) {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `pi-auth-debug-${timestamp}.log`;
    
    let logContent = `PI NETWORK AUTHENTICATION DEBUG LOG (${new Date().toISOString()})\n\n`;
    logContent += `Username: ${credentials.username}\n`;
    logContent += `Test run with verbose mode: ${options.verbose ? 'Yes' : 'No'}\n\n`;
    
    results.forEach(result => {
      logContent += `ENDPOINT: ${result.endpoint}\n`;
      logContent += `URL: ${endpoints.find(e => e.name === result.endpoint).url}\n`;
      logContent += `Success: ${result.success ? 'Yes' : 'No'}\n`;
      logContent += `Status: ${result.status || 'N/A'}\n`;
      
      if (result.success) {
        logContent += `Has token: ${result.hasToken ? 'Yes' : 'No'}\n`;
        logContent += `Has refresh token: ${result.hasRefreshToken ? 'Yes' : 'No'}\n`;
      } else {
        logContent += `Error message: ${result.errorMessage || 'None'}\n`;
      }
      
      if (options.verbose) {
        logContent += `Response data: ${JSON.stringify(result.responseData, null, 2)}\n`;
      }
      
      logContent += '\n---\n\n';
    });
    
    fs.writeFileSync(filename, logContent);
    logger.success(`Debug log written to ${filename}`);
    
  } catch (error) {
    logger.error(`Failed to write debug log: ${error.message}`);
  

  }
}

/**
 * Main function that coordinates the entire authentication testing process
 * @returns {Promise<void>}
 */
async function main() {
  // Show welcome message
  showWelcomeBanner();

  // Check if the user just wants to clear credentials
  if (options.clear) {
    clearCredentials();
    return;
  }

  // Get credentials from either saved store or user input
  const credentials = await promptForCredentials();
  
  console.log('\nStarting endpoint tests...');
  const results = [];
  
  // Test each endpoint sequentially
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint, credentials.username, credentials.password);
    results.push(result);
    
    // If this endpoint succeeded, break out of the loop
    if (result.success) {
      if (options.save) {
        saveCredentials(credentials.username, credentials.password, result);
      }
      break;
    }
  }
  
  // Determine overall outcome
  const anySuccess = results.some(r => r.success);
  
  console.log('\n----------------------------------------');
  console.log('TEST SUMMARY:');
  console.log('----------------------------------------');
  
  results.forEach(result => {
    const statusText = result.success 
      ? `\x1b[32mSUCCESS\x1b[0m` 
      : `\x1b[31mFAILED\x1b[0m (${result.status || 'connection error'})`;
    console.log(`${result.endpoint}: ${statusText}`);
  });
  
  console.log('----------------------------------------\n');
  
  // Show troubleshooting tips if all tests failed
  if (!anySuccess) {
    showTroubleshootingTips(results);
  } else {
    console.log('\x1b[32mAuthentication successful!\x1b[0m');
    
    if (!options.save && !credentials.usedSaved) {
      console.log('Tip: Use --save next time to store these working credentials.');
    }
  }
  
  // Write debug log file if in verbose mode
  if (options.verbose) {
    writeDebugLogFile(results, credentials);
  }
}

// Run the main function if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error(`\x1b[31m[FATAL ERROR]\x1b[0m ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  });
}
