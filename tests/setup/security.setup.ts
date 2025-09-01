// Security test setup - for testing security vulnerabilities and protection
process.env.NODE_ENV = 'test';

// Increased timeout for security tests (penetration testing can be slow)
jest.setTimeout(60000);

// Mock dangerous external calls in security tests
global.fetch = jest.fn();

// Mock file system operations for security testing
jest.mock('fs');
jest.mock('path');

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

console.log('Security test setup loaded');