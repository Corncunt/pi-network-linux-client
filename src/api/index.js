/**
 * Pi Network API Client
 * 
 * This module is the main entry point for the Pi Network API client.
 * It initializes and configures the API client and exports all API endpoints.
 * 
 * @module api
 */

const axios = require('axios');
const auth = require('./auth');
const user = require('./user');
const wallet = require('./wallet');
const mining = require('./mining');
const social = require('./social');

/**
 * Default configuration for the API client
 */
const defaultConfig = {
  baseURL: 'https://api.minepi.com/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

/**
 * PiNetworkAPI class to interact with the Pi Network API
 */
class PiNetworkAPI {
  /**
   * Creates an instance of the Pi Network API client
   * 
   * @param {Object} config - Configuration options for the API client
   * @param {string} config.baseURL - Base URL for the API
   * @param {number} config.timeout - Request timeout in milliseconds
   * @param {Object} config.headers - Default headers for all requests
   */
  constructor(config = {}) {
    this.config = { ...defaultConfig, ...config };
    this.client = axios.create(this.config);
    
    // Intercept requests to add auth token if available
    this.client.interceptors.request.use(request => {
      const token = auth.getToken();
      if (token) {
        request.headers.Authorization = `Bearer ${token}`;
      }
      return request;
    });
    
    // Intercept responses to handle common errors
    this.client.interceptors.response.use(
      response => response,
      error => {
        // Handle authentication errors
        if (error.response && error.response.status === 401) {
          auth.clearToken();
        }
        return Promise.reject(error);
      }
    );
    
    // Bind all API methods
    this.auth = this._bindMethods(auth);
    this.user = this._bindMethods(user);
    this.wallet = this._bindMethods(wallet);
    this.mining = this._bindMethods(mining);
    this.social = this._bindMethods(social);
  }
  
  /**
   * Binds API methods to use the configured axios client
   * 
   * @private
   * @param {Object} module - API module with methods
   * @returns {Object} - Module with bound methods
   */
  _bindMethods(module) {
    const bound = {};
    Object.keys(module).forEach(key => {
      if (typeof module[key] === 'function') {
        bound[key] = (...args) => module[key](this.client, ...args);
      } else {
        bound[key] = module[key];
      }
    });
    return bound;
  }
}

// Export a singleton instance with default config
const defaultInstance = new PiNetworkAPI();

// Export the class for creating custom instances
module.exports = {
  // Default instance
  api: defaultInstance,
  
  // Factory function for creating custom instances
  createAPI: (config) => new PiNetworkAPI(config),
  
  // Export individual modules for direct access
  auth,
  user,
  wallet,
  mining,
  social
};

