# AI Content Generation System - Testing Procedures

## Overview

This document provides comprehensive testing procedures for the AI content generation system. It covers all test types, execution methods, CI/CD integration, and maintenance guidelines.

## Table of Contents

1. [Test Architecture](#test-architecture)
2. [Running Tests Locally](#running-tests-locally)
3. [CI/CD Pipeline Integration](#cicd-pipeline-integration)
4. [Test Coverage Requirements](#test-coverage-requirements)
5. [Performance Testing](#performance-testing)
6. [Security Testing](#security-testing)
7. [Maintenance Procedures](#maintenance-procedures)
8. [Troubleshooting](#troubleshooting)

## Test Architecture

### Testing Pyramid

```
                    E2E Tests (Playwright)
                   /                      \
              Integration Tests (Jest + Supertest)
             /                                    \
        Unit Tests (Jest + React Testing Library)
```

### Test Categories

1. **Unit Tests** (`__tests__/unit/`)
   - Repository layer tests
   - Service layer tests
   - Component tests
   - Provider tests

2. **Integration Tests** (`__tests__/integration/`)
   - API endpoint tests
   - Database integration tests
   - Service integration tests

3. **End-to-End Tests** (`tests/e2e/`)
   - Full user workflow tests
   - Cross-browser compatibility tests
   - Smoke tests for production

4. **Performance Tests** (`tests/performance/`)
   - Load testing with k6
   - Memory usage tests
   - Core Web Vitals measurement

5. **Security Tests** (`__tests__/security/`)
   - API security validation
   - Input sanitization tests
   - Authentication/authorization tests

## Running Tests Locally

### Prerequisites

```bash
# Install dependencies
npm ci

# Install Playwright browsers
npm run playwright:install

# Set up test database
npm run db:test:setup
```

### Running Different Test Types

```bash
# Run all tests
npm run test:all

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run performance tests
npm run test:performance

# Run security tests
npm run test:security

# Run tests with coverage
npm run test:coverage
```

### Running Specific Test Suites

```bash
# Test specific repository
npm test -- __tests__/unit/repositories/aiRepository.test.ts

# Test specific service
npm test -- __tests__/unit/services/ai/GenerationService.test.ts

# Test specific component
npm test -- __tests__/unit/components/ai/ProviderSelector.test.tsx

# Run E2E tests in headed mode
npm run test:e2e -- --headed

# Run E2E tests for specific browser
npx playwright test --project=chromium
```

### Watch Mode for Development

```bash
# Run unit tests in watch mode
npm run test:watch

# Run E2E tests with UI mode
npm run test:e2e:ui
```

## CI/CD Pipeline Integration

### GitHub Actions Workflows

The testing system includes three main workflows:

1. **Test Pipeline** (`.github/workflows/test-pipeline.yml`)
   - Triggered on push/PR to main/develop branches
   - Runs all test types in parallel
   - Enforces coverage thresholds
   - Provides quality gates

2. **Performance Monitoring** (`.github/workflows/performance-monitoring.yml`)
   - Scheduled daily performance tests
   - Monitors performance trends
   - Alerts on degradation

3. **Security Scanning** (`.github/workflows/security-scan.yml`)
   - Daily security scans
   - Dependency vulnerability checks
   - Code security analysis

### Pipeline Stages

```mermaid
graph TD
    A[Setup & Cache] --> B[Lint & Type Check]
    B --> C[Unit Tests]
    B --> D[Integration Tests]
    B --> E[API Tests]
    C --> F[Security Tests]
    D --> F
    E --> F
    F --> G[E2E Tests]
    G --> H[Performance Tests]
    H --> I[Quality Gates]
    I --> J[Deploy]
```

### Quality Gates

Tests must pass these thresholds to proceed:

- **Coverage**: 90% overall, 95% for critical AI components
- **Performance**: P95 < 30s for API requests
- **Security**: No critical vulnerabilities
- **E2E**: All smoke tests pass across browsers

## Test Coverage Requirements

### Coverage Thresholds

```javascript
// Global thresholds
{
  statements: 90,
  branches: 90, 
  functions: 90,
  lines: 90
}

// Critical path thresholds (95%)
{
  'src/services/ai/**': 95,
  'src/repositories/aiRepository.ts': 95,
  'api/ai/**': 95,
  'src/components/ai/**': 95
}
```

### Checking Coverage

```bash
# Generate coverage report
npm run test:coverage

# Check coverage thresholds
npm run coverage:check

# Get coverage percentage
npm run coverage:percentage
```

### Coverage Reports

Coverage reports are generated in multiple formats:
- HTML report: `coverage/lcov-report/index.html`
- LCOV format: `coverage/lcov.info`
- JSON summary: `coverage/coverage-summary.json`

## Performance Testing

### K6 Load Testing

Performance tests use k6 with multiple scenarios:

```bash
# Light load testing
K6_SCENARIO=light_load npm run test:performance

# Stress testing
K6_SCENARIO=stress_test npm run test:performance

# Spike testing
K6_SCENARIO=spike_test npm run test:performance
```

### Performance Scenarios

1. **Light Load**: 5 VUs for 2 minutes
2. **Medium Load**: Ramp to 20 VUs for 3 minutes
3. **High Load**: Ramp to 50 VUs for 5 minutes
4. **Stress Test**: Up to 200 VUs
5. **Spike Test**: Sudden load spikes
6. **Soak Test**: 15 VUs for 10 minutes

### Core Web Vitals

E2E tests include Core Web Vitals measurement:

```bash
# Test Core Web Vitals
npx playwright test core-web-vitals
```

Metrics measured:
- **LCP** (Largest Contentful Paint) < 2.5s
- **FID** (First Input Delay) < 100ms
- **CLS** (Cumulative Layout Shift) < 0.1

### Memory Testing

```bash
# Run memory leak tests
npm run test:memory
```

## Security Testing

### Security Test Categories

1. **API Security**
   - Input validation
   - Authentication bypass
   - SQL injection prevention
   - XSS protection

2. **Dependency Security**
   - npm audit
   - Snyk vulnerability scanning

3. **Code Security**
   - Static analysis with Semgrep
   - ESLint security rules

4. **Infrastructure Security**
   - Configuration scanning
   - Secret detection

### Running Security Tests

```bash
# All security tests
npm run test:security

# Dependency audit
npm audit

# Check for secrets
npm run security:secrets
```

## Maintenance Procedures

### Regular Maintenance Tasks

#### Daily (Automated via CI)
- [ ] Run full test suite
- [ ] Check security vulnerabilities
- [ ] Monitor performance metrics
- [ ] Update test coverage reports

#### Weekly
- [ ] Review test failures and flaky tests
- [ ] Update test fixtures with new data
- [ ] Review and update performance baselines
- [ ] Analyze security scan reports

#### Monthly
- [ ] Update testing dependencies
- [ ] Review and update test documentation
- [ ] Analyze test coverage trends
- [ ] Performance optimization review

### Updating Test Data

Test fixtures are located in `__tests__/fixtures/ai-test-data.ts`:

```typescript
// Update mock responses
export const MOCK_OPENAI_RESPONSES = {
  // Add new response patterns
};

// Update test prompts
export const TEST_PROMPTS = {
  // Add new test scenarios
};
```

### Adding New Tests

#### Unit Test Template

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { YourService } from '../../../src/services/YourService';

describe('YourService', () => {
  let service: YourService;

  beforeEach(() => {
    service = new YourService();
  });

  describe('methodName', () => {
    it('should handle normal case', async () => {
      // Arrange
      const input = 'test input';

      // Act
      const result = await service.methodName(input);

      // Assert
      expect(result).toBeDefined();
    });

    it('should handle error case', async () => {
      // Test error scenarios
    });
  });
});
```

#### Integration Test Template

```typescript
import request from 'supertest';
import { app } from '../../../api/server';

describe('API Integration Tests', () => {
  describe('POST /api/endpoint', () => {
    it('should return success response', async () => {
      const response = await request(app)
        .post('/api/endpoint')
        .send({ data: 'test' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
```

#### E2E Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should complete user workflow', async ({ page }) => {
    await page.goto('/');
    
    // User actions
    await page.click('[data-testid="button"]');
    
    // Assertions
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });
});
```

### Test Environment Management

#### Environment Variables

```bash
# Test database
DATABASE_URL=postgresql://test_user:test_password@localhost:5432/ai_content_test

# API endpoints
API_BASE_URL=http://localhost:3001
BASE_URL=http://localhost:4173

# Test configuration
NODE_ENV=test
CI=true
```

#### Database Setup

```bash
# Create test database
createdb ai_content_test

# Run migrations
npm run db:migrate:test

# Seed test data
npm run db:seed:test
```

## Troubleshooting

### Common Issues

#### Test Timeouts
```bash
# Increase timeout for slow tests
jest --testTimeout=30000
```

#### Database Connection Issues
```bash
# Reset test database
dropdb ai_content_test
createdb ai_content_test
npm run db:migrate:test
```

#### Playwright Browser Issues
```bash
# Reinstall browsers
npx playwright install --force
```

#### Memory Issues
```bash
# Run tests with more memory
node --max_old_space_size=4096 ./node_modules/.bin/jest
```

### Debugging Tests

#### Unit Test Debugging
```typescript
// Add debug output
console.log('Debug:', JSON.stringify(result, null, 2));

// Use Jest debugging
jest.setTimeout(300000); // 5 minutes
```

#### E2E Test Debugging
```bash
# Run in headed mode
npx playwright test --headed --debug

# Enable tracing
npx playwright test --trace on
```

#### Performance Test Debugging
```bash
# Verbose k6 output
k6 run --verbose tests/performance/load-test.js
```

### CI/CD Debugging

#### Pipeline Failures
1. Check GitHub Actions logs
2. Review coverage reports
3. Examine test artifacts
4. Check environment variables

#### Performance Degradation
1. Review performance trends
2. Compare with baseline metrics
3. Check resource utilization
4. Analyze slow queries

#### Security Issues
1. Review vulnerability reports
2. Check dependency updates
3. Analyze code security scans
4. Validate secret detection

### Getting Help

#### Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [k6 Documentation](https://k6.io/docs/)

#### Team Contacts
- **Testing Lead**: [Contact Information]
- **DevOps Team**: [Contact Information] 
- **Security Team**: [Contact Information]

#### Support Channels
- Slack: #testing-support
- Email: testing-team@company.com
- Documentation: [Internal Wiki Link]