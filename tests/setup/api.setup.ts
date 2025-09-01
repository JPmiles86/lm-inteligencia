// API test setup - for testing API endpoints and server functionality
import { setupTestDatabase, teardownTestDatabase } from './integration.setup';

// Setup environment for API testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';

// Setup test timeout for API tests
jest.setTimeout(30000);

// Mock external API calls
global.fetch = jest.fn();

// Setup database before all tests
beforeAll(async () => {
  await setupTestDatabase();
});

// Cleanup database after all tests
afterAll(async () => {
  await teardownTestDatabase();
});

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

console.log('API test setup loaded');