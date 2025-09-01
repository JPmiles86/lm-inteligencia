# Agent-1C: Test Infrastructure Repair Specialist
**Priority:** 🟡 HIGH
**Duration:** 8 hours
**Dependencies:** Can work in parallel with Agent-1A and 1B
**Created:** 2025-08-31

## 🎯 MISSION
Fix the broken test infrastructure including Jest configuration errors and missing dependencies. Establish a working test suite foundation for the project.

## 📋 CONTEXT
- **Current Issue:** Jest configuration has syntax errors, missing dependencies
- **Specific Error:** `moduleNameMapping` should be `moduleNameMapper`
- **Missing Module:** `jest-junit` not installed
- **Goal:** Enable automated testing for quality assurance

## ✅ SUCCESS CRITERIA
1. `npm test` runs without configuration errors
2. At least one test suite passing
3. Test coverage reporting works
4. Can run unit, integration, and e2e tests
5. CI-ready test configuration

## 🔧 SPECIFIC TASKS

### 1. Fix Jest Configuration (1 hour)

#### Fix `/jest.config.js` or `/jest.config.ts`
```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  
  // FIX: Change moduleNameMapping to moduleNameMapper
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/tests/mocks/fileMock.js'
  },
  
  setupFilesAfterEnv: ['<rootDir>/tests/setup/setupTests.ts'],
  
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ],
  
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  testMatch: [
    '**/__tests__/**/*.{ts,tsx}',
    '**/*.{spec,test}.{ts,tsx}'
  ],
  
  // Add reporters including jest-junit
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test-results',
      outputName: 'junit.xml'
    }]
  ]
};
```

### 2. Install Missing Dependencies (1 hour)

```bash
# Core testing dependencies
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event

# Missing reporter
npm install --save-dev jest-junit

# Mocking utilities
npm install --save-dev identity-obj-proxy
npm install --save-dev msw @mswjs/data

# For e2e tests
npm install --save-dev @playwright/test

# For API testing
npm install --save-dev supertest @types/supertest
```

### 3. Create Test Setup Files (1 hour)

#### `/tests/setup/setupTests.ts`
```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
```

#### `/tests/mocks/fileMock.js`
```javascript
module.exports = 'test-file-stub';
```

### 4. Create Test Structure (1 hour)

```
/tests/
  ├── unit/
  │   ├── components/
  │   │   └── AIContentDashboard.test.tsx
  │   ├── services/
  │   │   └── providerSelector.test.ts
  │   └── utils/
  │       └── validation.test.ts
  ├── integration/
  │   ├── api/
  │   │   └── generation.test.ts
  │   └── workflows/
  │       └── blogCreation.test.ts
  ├── e2e/
  │   └── userFlows.spec.ts
  ├── setup/
  │   └── setupTests.ts
  └── mocks/
      └── handlers.ts
```

### 5. Write Foundation Tests (2 hours)

#### Unit Test Example: `/tests/unit/services/providerSelector.test.ts`
```typescript
import { selectProvider } from '@/api/services/providerSelector';

describe('Provider Selection Service', () => {
  describe('selectProvider', () => {
    it('should select preferred provider when available', async () => {
      // Mock available providers
      const mockProviders = {
        openai: { name: 'openai', available: true },
        anthropic: { name: 'anthropic', available: true }
      };
      
      const provider = await selectProvider('writing', 'anthropic');
      expect(provider.name).toBe('anthropic');
    });
    
    it('should fallback when preferred not available', async () => {
      const provider = await selectProvider('research', 'invalid');
      expect(['perplexity', 'anthropic', 'google', 'openai'])
        .toContain(provider.name);
    });
    
    it('should throw when no providers available', async () => {
      await expect(selectProvider('image', 'invalid'))
        .rejects.toThrow('No provider available');
    });
  });
});
```

#### Integration Test: `/tests/integration/api/generation.test.ts`
```typescript
import request from 'supertest';
import { app } from '@/api/server';

describe('Blog Generation API', () => {
  describe('POST /api/generate/blog', () => {
    it('should generate blog content', async () => {
      const response = await request(app)
        .post('/api/generate/blog')
        .send({
          prompt: 'Write about AI testing',
          context: { vertical: 'tech' }
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('provider');
    });
    
    it('should handle provider failures gracefully', async () => {
      // Test fallback behavior
    });
  });
});
```

#### Component Test: `/tests/unit/components/AIContentDashboard.test.tsx`
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { AIContentDashboard } from '@/components/ai/AIContentDashboard';

describe('AIContentDashboard', () => {
  it('should render dashboard with quick actions', () => {
    render(<AIContentDashboard />);
    
    expect(screen.getByText('AI Content Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });
  
  it('should open brainstorming modal on button click', async () => {
    render(<AIContentDashboard />);
    
    const brainstormButton = screen.getByText('Brainstorm Ideas');
    fireEvent.click(brainstormButton);
    
    expect(screen.getByText('Ideation & Brainstorming')).toBeInTheDocument();
  });
});
```

### 6. Create Test Scripts (1 hour)

Update `package.json` scripts:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=tests/unit",
    "test:integration": "jest --testPathPattern=tests/integration",
    "test:e2e": "playwright test",
    "test:ci": "jest --coverage --watchAll=false --reporters=default --reporters=jest-junit"
  }
}
```

### 7. Set Up Mock Service Worker (1 hour)

#### `/tests/mocks/handlers.ts`
```typescript
import { rest } from 'msw';

export const handlers = [
  // Mock provider endpoints
  rest.get('/api/providers', (req, res, ctx) => {
    return res(
      ctx.json([
        { provider: 'openai', hasKey: true, active: true },
        { provider: 'anthropic', hasKey: false, active: false }
      ])
    );
  }),
  
  // Mock generation endpoints
  rest.post('/api/generate/blog', (req, res, ctx) => {
    return res(
      ctx.json({
        content: 'Generated blog content...',
        provider: 'openai',
        model: 'gpt-4'
      })
    );
  })
];
```

## 📝 REQUIRED DELIVERABLES

### 1. Test Infrastructure Report
**File:** `/docs/agent-reports/AGENT-1C-TEST-SETUP.md`
```markdown
# Test Infrastructure Setup Report

## Configuration Fixed
- Jest config syntax errors resolved
- Missing dependencies installed
- Test structure created

## Test Suites Created
- Unit tests: X files
- Integration tests: Y files
- E2E tests: Z files

## Coverage Baseline
- Lines: X%
- Branches: Y%
- Functions: Z%
```

### 2. Testing Guidelines
**File:** `/docs/TESTING_GUIDELINES.md`
- How to write tests
- Naming conventions
- Mock strategies
- Coverage requirements

### 3. Update Master Progress Log
Report completion status and test results

## 🔍 VALIDATION STEPS

1. **Configuration Test:**
```bash
npm test -- --listTests
# Should list test files without errors
```

2. **Run Tests:**
```bash
npm test
# Should run and pass foundation tests
```

3. **Coverage Report:**
```bash
npm run test:coverage
# Should generate coverage report
```

4. **CI Simulation:**
```bash
npm run test:ci
# Should run tests and generate junit.xml
```

## ⚠️ IMPORTANT NOTES

1. **Don't Over-Test Yet:** Focus on infrastructure, not comprehensive coverage
2. **Mock External Services:** Don't call real APIs in tests
3. **Fast Tests:** Keep unit tests under 10ms each
4. **Isolated Tests:** Each test should be independent
5. **Clear Names:** Test names should describe what they test

## 🚫 DO NOT

1. Write tests that depend on external services
2. Use real API keys in tests
3. Create slow tests (>1 second)
4. Skip error scenarios
5. Ignore flaky tests

## 💡 TIPS

### For Async Tests
```typescript
it('should handle async operations', async () => {
  const result = await someAsyncFunction();
  expect(result).toBeDefined();
});
```

### For Error Testing
```typescript
it('should throw on invalid input', () => {
  expect(() => functionThatThrows()).toThrow('Expected error');
});
```

### For Component Testing
```typescript
it('should update on user interaction', async () => {
  const user = userEvent.setup();
  render(<Component />);
  
  await user.click(screen.getByRole('button'));
  expect(screen.getByText('Updated')).toBeInTheDocument();
});
```

---

*Report completion to `/docs/agent-reports/` and update `/MASTER_PROGRESS_LOG.md`*