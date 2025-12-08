/**
 * Centralized test server management
 * Uses supertest which doesn't require starting a real server
 */

let app = null;

/**
 * Get the app instance for testing (no server start needed with supertest)
 */
const startTestServer = async () => {
  if (app) {
    return app; // Already loaded
  }

  // Clear require cache to get fresh app instance
  delete require.cache[require.resolve('../src/index.js')];
  
  app = require('../src/index.js');
  return app;
};

/**
 * Cleanup (no actual server to stop with supertest)
 */
const stopTestServer = async () => {
  app = null;
};

/**
 * Get the app instance
 */
const getApp = () => {
  if (!app) {
    throw new Error('App not loaded. Call startTestServer() in beforeAll()');
  }
  return app;
};

module.exports = {
  startTestServer,
  stopTestServer,
  getApp
};
