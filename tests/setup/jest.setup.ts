// Jest setup for unit tests - configures testing environment
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/inteligencia_test';

// Mock fetch globally
global.fetch = jest.fn();

// Mock ResizeObserver (for React components)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock WebSocket for streaming tests
global.WebSocket = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1,
}));

// Mock crypto for test environments
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
    getRandomValues: (arr: unknown) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Console warning filters for known test issues
const originalWarn = console.warn;
console.warn = (...args) => {
  // Filter out React warnings we expect in tests
  const message = args[0];
  if (typeof message === 'string') {
    if (
      message.includes('ReactDOM.render is no longer supported') ||
      message.includes('Warning: componentWillReceiveProps') ||
      message.includes('Warning: componentWillMount')
    ) {
      return;
    }
  }
  originalWarn(...args);
};

// Setup for AI testing - mock providers that require API keys
jest.mock('../../src/services/ai/providers/OpenAIProvider.js', () => ({
  OpenAIProvider: jest.fn().mockImplementation(() => ({
    generate: jest.fn().mockResolvedValue({
      content: 'Mock AI generated content',
      tokensUsed: 100,
      cost: 0.002,
    }),
    testConnection: jest.fn().mockResolvedValue({ success: true }),
  })),
}));

jest.mock('../../src/services/ai/providers/AnthropicProvider.js', () => ({
  AnthropicProvider: jest.fn().mockImplementation(() => ({
    generate: jest.fn().mockResolvedValue({
      content: 'Mock Anthropic generated content',
      tokensUsed: 120,
      cost: 0.0024,
    }),
    testConnection: jest.fn().mockResolvedValue({ success: true }),
  })),
}));

jest.mock('../../src/services/ai/providers/GoogleProvider.js', () => ({
  GoogleProvider: jest.fn().mockImplementation(() => ({
    generate: jest.fn().mockResolvedValue({
      content: 'Mock Google generated content',
      tokensUsed: 90,
      cost: 0.0018,
    }),
    testConnection: jest.fn().mockResolvedValue({ success: true }),
  })),
}));

jest.mock('../../src/services/ai/providers/PerplexityProvider.js', () => ({
  PerplexityProvider: jest.fn().mockImplementation(() => ({
    generate: jest.fn().mockResolvedValue({
      content: 'Mock Perplexity research results',
      tokensUsed: 80,
      cost: 0.0016,
    }),
    testConnection: jest.fn().mockResolvedValue({ success: true }),
  })),
}));

// Increase timeout for AI operations
jest.setTimeout(30000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  
  // Clear localStorage
  localStorageMock.clear();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  
  // Clear sessionStorage
  sessionStorageMock.clear();
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
});

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveValidAIResponse(): R;
      toHaveValidTokenUsage(): R;
      toHaveValidCost(): R;
    }
  }
}

// Custom Jest matchers for AI testing
expect.extend({
  toHaveValidAIResponse(received: unknown) {
    const pass = 
      received && 
      typeof received.content === 'string' && 
      received.content.length > 0 &&
      typeof received.tokensUsed === 'number' &&
      received.tokensUsed > 0 &&
      typeof received.cost === 'number' &&
      received.cost >= 0;
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid AI response`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid AI response with content, tokensUsed, and cost`,
        pass: false,
      };
    }
  },
  
  toHaveValidTokenUsage(received: number) {
    const pass = typeof received === 'number' && received > 0 && received < 100000;
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be valid token usage`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid token count (1-100000)`,
        pass: false,
      };
    }
  },
  
  toHaveValidCost(received: number) {
    const pass = typeof received === 'number' && received >= 0 && received < 100;
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be valid cost`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid cost (0-100)`,
        pass: false,
      };
    }
  },
});