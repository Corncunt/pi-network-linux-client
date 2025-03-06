/**
 * Pi Network API Client
 * 
 * This module is the main entry point for the Pi Network API client.
 * It initializes and configures the API client and exports all API endpoints.
 * 
 * @module api
 */

const auth = require('./auth');
const user = require('./user');
const wallet = require('./wallet');
const mining = require('./mining');
const social = require('./social');

/**
 * PiNetworkAPI class to interact with the Pi Network API
 */
class PiNetworkAPI {
  /**
   * Creates an instance of the Pi Network API client
   * It uses the shared authClient from auth.js
   */
  constructor() {
    // We no longer need to store the client as each module uses the shared authClient
    
    // Bind all API methods
    this.auth = this._bindMethods(auth);
    this.user = this._bindMethods(user);
    this.wallet = this._bindMethods(wallet);
    this.mining = this._bindMethods(mining);
    this.social = this._bindMethods(social);
  }
  
  /**
   * Binds API methods to create a consistent interface
   * 
   * @private
   * @param {Object} module - API module with methods
   * @returns {Object} - Module with bound methods
   */
  _bindMethods(module) {
    const bound = {};
    Object.keys(module).forEach(key => {
      if (typeof module[key] === 'function' && key !== 'refreshTokens') {
        // All modules now use shared authClient, so we don't need to pass the client
        bound[key] = (...args) => module[key](...args);
      } else {
        bound[key] = module[key];
      }
    });
    return bound;
  }
}

// Export a singleton instance
const defaultInstance = new PiNetworkAPI();

// Export the class for creating custom instances
module.exports = {
  // Default instance
  api: defaultInstance,
  
  // Factory function for creating custom instances
  createAPI: () => new PiNetworkAPI(),
  
  // Export individual modules for direct access
  auth,
  user,
  wallet,
  mining,
  social,
  
  // Export the shared authClient for direct use
  authClient: auth.authClient
};
