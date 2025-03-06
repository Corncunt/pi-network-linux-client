#!/usr/bin/env node

/**
 * Pi Network Authentication Test Script
 * 
 * This script tests the Pi Network authentication endpoints directly using axios.
 * It tries both potential endpoints (with and without /v2 path segment) to determine
 * which one is working correctly.
 * 
 * Usage:
 *   node test-auth.js --username yourusername --password yourpassword
 */

const axios = require('axios');
const { program } = require('commander');
const util = require('util');

// Setup command line arguments
program
  .version('1.0.0')
  .description('Test Pi Network authentication endpoints')
  .requiredOption('-u, --username <username>', 'Pi Network username or email')
  .requiredOption('-p, --password <password>', 'Pi Network password')
  .option('-v, --verbose', 'Enable verbose output')
  .parse(process.argv);

const options = program.opts();

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
        responseData: sanitizedResponseData
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
 * Main function to test all authentication endpoints
 */
async function main() {
  logger.info('Pi Network Authentication Endpoint Test');
  logger.info('--------------------------------------');
  logger.info(`Testing with username: ${options.username}`);
  
  try {
    const results = [];
    
    // Test each endpoint
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint, options.username, options.password);
      results.push(result);
      
      // Add a separator between endpoint tests
      logger.info('--------------------------------------');
    }
    
    // Summary of results
    logger.info('TEST SUMMARY:');
    const successfulEndpoints = results.filter(r => r.success);
    
    if (successfulEndpoints.length > 0) {
      logger.success(`Authentication successful with ${successfulEndpoints.length} endpoint(s):`);
      successfulEndpoints.forEach(r => {
        logger.success(`- ${r.endpoint} returned status ${r.status} with valid tokens`);
      });
      
      // Recommend the endpoint to use
      const recommended = successfulEndpoints[0];
      logger.success(`RECOMMENDATION: Use ${recommended.endpoint} (${endpoints.find(e => e.name === recommended.endpoint).url})`);
    } else {
      logger.error('Authentication failed with all tested endpoints.');
      logger.error('Please check your credentials and network connection.');
      
      // Provide more detailed error information
      results.forEach(r => {
        logger.error(`- ${r.endpoint}: ${r.errorMessage}`);
      });
      
      logger.warn('Troubleshooting tips:');
      logger.warn('1. Verify your username and password are correct');
      logger.warn('2. Check your internet connection');
      logger.warn('3. The Pi Network API might be experiencing issues');
      logger.warn('4. Try again later or contact Pi Network support');
    }
    
  } catch (error) {
    logger.error(`Unexpected error: ${error.message}`);
    logger.object('Error details', error);
  }
}

// Run the main function
main().catch(error => {
  logger.error(`Fatal error: ${error.message}`);
  process.exit(1);
});

