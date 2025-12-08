// Test setup file - Load environment variables from .env.test
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.test') });

// Ensure we're in test mode
if (process.env.NODE_ENV !== 'test') {
  process.env.NODE_ENV = 'test';
}

// Suppress console logs during tests
global.console.log = jest.fn();
global.console.warn = jest.fn();
global.console.error = jest.fn();

// Increase timeout for database operations
// 30 seconds for beforeEach/afterEach hooks (database cleanup, setup)
// 15 seconds for individual tests
jest.setTimeout(30000);

