#!/usr/bin/env node

/**
 * Pi Network API Traffic Analyzer
 * 
 * This script sets up a proxy server to capture and analyze network traffic
 * from the Pi Network macOS application. It logs all API requests and responses
 * to a JSON file for further analysis.
 * 
 * Dependencies:
 * - http-proxy-middleware: For setting up the proxy server
 * - express: For creating the web server
 * - winston: For logging
 * - commander: For CLI options parsing
 * 
 * Usage:
 * 1. Install dependencies: npm install http-proxy-middleware express winston commander
 * 2. Run the script: node network-traffic-analyzer.js --target https://api.minepi.com
 * 3. Configure your macOS Pi Network application to use this proxy
 *    (System Preferences > Network > Advanced > Proxies > Web Proxy)
 * 4. Use the Pi Network app normally, and the traffic will be captured
 * 
 * Options:
 *   --target      Target API URL to proxy (default: https://api.minepi.com)
 *   --port        Port to run the proxy server on (default: 8888)
 *   --output      Output file for logging (default: pi-network-api-traffic.json)
 *   --filter      Filter requests by URL pattern (e.g., '/v1/auth')
 *   --verbose     Enable verbose logging
 * 
 * Note: This script is for research purposes only. Be aware of Pi Network's
 * terms of service and privacy considerations when using this tool.
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const path = require('path');
const winston = require('winston');
const { program } = require('commander');

// Parse command line arguments
program
  .option('--target <url>', 'Target API URL to proxy', 'https://api.minepi.com')
  .option('--port <number>', 'Port to run the proxy server on', '8888')
  .option('--output <file>', 'Output file for logging', 'pi-network-api-traffic.json')
  .option('--filter <pattern>', 'Filter requests by URL pattern')
  .option('--verbose', 'Enable verbose logging', false)
  .parse(process.argv);

const options = program.opts();

// Configure logger
const logger = winston.createLogger({
  level: options.verbose ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ 
      filename: 'network-analyzer.log' 
    })
  ]
});

// Create directory for output if it doesn't exist
const outputDir = path.dirname(options.output);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Initialize the traffic log if it doesn't exist
if (!fs.existsSync(options.output)) {
  fs.writeFileSync(options.output, JSON.stringify([], null, 2));
}

/**
 * Load existing traffic log
 * @returns {Array} The traffic log
 */
function loadTrafficLog() {
  try {
    const data = fs.readFileSync(options.output, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    logger.error(`Error loading traffic log: ${error.message}`);
    return [];
  }
}

/**
 * Save traffic log to file
 * @param {Array} log - The traffic log to save
 */
function saveTrafficLog(log) {
  try {
    fs.writeFileSync(options.output, JSON.stringify(log, null, 2));
  } catch (error) {
    logger.error(`Error saving traffic log: ${error.message}`);
  }
}

/**
 * Log API request and response to file
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 * @param {Buffer} body - The response body
 */
function logApiTraffic(req, res, body) {
  try {
    const responseData = body.toString();
    const parsedResponseData = tryParseJson(responseData);
    
    // Skip if the request doesn't match the filter
    if (options.filter && !req.url.includes(options.filter)) {
      return;
    }
    
    const requestHeaders = { ...req.headers };
    delete requestHeaders.cookie; // Remove sensitive data
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      request: {
        method: req.method,
        url: req.url,
        headers: requestHeaders,
        body: tryParseJson(req.body) || req.body || null
      },
      response: {
        statusCode: res.statusCode,
        headers: res.headers,
        body: parsedResponseData || responseData
      }
    };
    
    const trafficLog = loadTrafficLog();
    trafficLog.push(logEntry);
    saveTrafficLog(trafficLog);
    
    logger.info(`Logged ${req.method} ${req.url} - ${res.statusCode}`);
  } catch (error) {
    logger.error(`Error logging API traffic: ${error.message}`);
  }
}

/**
 * Try to parse JSON string
 * @param {string} jsonString - The JSON string to parse
 * @returns {Object|null} - Parsed object or null if parsing failed
 */
function tryParseJson(jsonString) {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return null;
  }
}

// Create Express application
const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Proxy middleware options
const proxyOptions = {
  target: options.target,
  changeOrigin: true,
  secure: false, // Set to true if target uses HTTPS
  onProxyRes: (proxyRes, req, res) => {
    const chunks = [];
    
    proxyRes.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    proxyRes.on('end', () => {
      const body = Buffer.concat(chunks);
      logApiTraffic(req, proxyRes, body);
    });
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error: ${err.message}`);
    res.writeHead(500, {
      'Content-Type': 'text/plain',
    });
    res.end('Proxy error: ' + err.message);
  }
};

// Create the proxy middleware
const apiProxy = createProxyMiddleware(proxyOptions);

// Add routes
app.use('/', apiProxy);

// Add simple status endpoint
app.get('/proxy-status', (req, res) => {
  res.json({
    status: 'running',
    target: options.target,
    filter: options.filter || 'none'
  });
});

// Start the server
const server = app.listen(parseInt(options.port), () => {
  logger.info(`Pi Network API Traffic Analyzer running on port ${options.port}`);
  logger.info(`Proxying requests to ${options.target}`);
  logger.info(`Logging traffic to ${options.output}`);
  if (options.filter) {
    logger.info(`Filtering requests by pattern: ${options.filter}`);
  }
  logger.info('Press Ctrl+C to stop');
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Stopping Pi Network API Traffic Analyzer...');
  server.close(() => {
    logger.info('Server stopped');
    process.exit(0);
  });
});

// Error handling
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught exception: ${error.message}`);
  logger.error(error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
});

