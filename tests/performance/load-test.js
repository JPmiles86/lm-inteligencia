// Performance and Load Testing for AI Content Generation System
// Uses k6 for comprehensive performance testing

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
export let errorRate = new Rate('errors');
export let generationDuration = new Trend('generation_duration', true);
export let tokenThroughput = new Trend('tokens_per_second');
export let costPerGeneration = new Trend('cost_per_generation');
export let totalGenerations = new Counter('total_generations');
export let failedGenerations = new Counter('failed_generations');

// Test configuration
const API_BASE_URL = __ENV.API_BASE_URL || 'http://localhost:8000';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'test-auth-token';

// Test scenarios with different user loads
export let options = {
  scenarios: {
    // Light load - normal usage
    light_load: {
      executor: 'constant-vus',
      vus: 5,
      duration: '2m',
      tags: { scenario: 'light_load' },
    },
    
    // Medium load - busy periods
    medium_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 20 },
        { duration: '3m', target: 20 },
        { duration: '1m', target: 0 },
      ],
      tags: { scenario: 'medium_load' },
    },
    
    // High load - peak usage
    high_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '5m', target: 50 },
        { duration: '2m', target: 0 },
      ],
      tags: { scenario: 'high_load' },
    },
    
    // Stress test - beyond normal capacity
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100 },
        { duration: '2m', target: 100 },
        { duration: '1m', target: 200 },
        { duration: '3m', target: 200 },
        { duration: '2m', target: 0 },
      ],
      tags: { scenario: 'stress_test' },
    },
    
    // Spike test - sudden load increases
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '10s', target: 100 }, // Spike
        { duration: '1m', target: 100 },
        { duration: '10s', target: 10 }, // Drop
        { duration: '30s', target: 10 },
      ],
      tags: { scenario: 'spike_test' },
    },
    
    // Soak test - extended duration
    soak_test: {
      executor: 'constant-vus',
      vus: 15,
      duration: '10m',
      tags: { scenario: 'soak_test' },
    },
  },
  
  thresholds: {
    // Overall performance thresholds
    http_req_duration: ['p(95)<30000'], // 95% of requests under 30s
    http_req_failed: ['rate<0.05'],     // Error rate under 5%
    
    // Custom metrics thresholds
    errors: ['rate<0.05'],
    generation_duration: ['p(95)<45000'], // 95% of generations under 45s
    tokens_per_second: ['avg>5'],         // Average tokens per second
    
    // Scenario-specific thresholds
    'http_req_duration{scenario:light_load}': ['p(95)<20000'],
    'http_req_duration{scenario:medium_load}': ['p(95)<25000'],
    'http_req_duration{scenario:high_load}': ['p(95)<35000'],
  },
};

// Test data generators
const PROMPTS = {
  short: [
    'Write a brief blog about AI trends',
    'Generate marketing tips for hotels',
    'Create content about healthcare technology',
    'Write about digital transformation',
  ],
  
  medium: [
    'Write a comprehensive blog about implementing AI chatbots in the hospitality industry',
    'Create a detailed guide to digital marketing strategies for healthcare providers',
    'Develop content about emerging technologies in sports analytics',
    'Write about the future of AI in customer service',
  ],
  
  long: [
    'Write an extensive analysis of artificial intelligence implementation in the hospitality industry, covering technical architecture, integration challenges, staff training, customer experience, ROI analysis, and future trends',
    'Create a comprehensive guide to healthcare AI systems, including regulatory compliance, patient privacy, clinical workflows, and implementation strategies',
    'Develop detailed content about sports technology trends, covering performance analytics, fan engagement, venue management, and athlete monitoring systems',
  ],
};

const VERTICALS = ['hospitality', 'healthcare', 'tech', 'athletics'];
const PROVIDERS = ['openai', 'anthropic', 'google'];
const MODELS = {
  openai: ['gpt-5', 'gpt-4.1'],
  anthropic: ['claude-sonnet-4', 'claude-haiku-3'],
  google: ['gemini-2.5-pro', 'gemini-2.5-flash'],
};

// Utility functions
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateTestPayload(complexity = 'medium') {
  const provider = getRandomItem(PROVIDERS);
  const vertical = getRandomItem(VERTICALS);
  
  return {
    task: getRandomItem(['blog_writing_complete', 'title_generation', 'idea_generation']),
    mode: getRandomItem(['direct', 'structured']),
    vertical: vertical,
    prompt: getRandomItem(PROMPTS[complexity]),
    provider: provider,
    model: getRandomItem(MODELS[provider]),
    outputCount: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 2 : 1,
    context: {
      styleGuides: {
        brand: true,
        vertical: [vertical],
      },
      previousContent: {
        mode: Math.random() > 0.8 ? 'selected' : 'none',
      },
    },
  };
}

// Main test function
export default function () {
  const scenario = __ENV.SCENARIO || 'medium_load';
  
  // Adjust test complexity based on scenario
  let complexity = 'medium';
  if (scenario === 'light_load') complexity = 'short';
  if (scenario === 'stress_test' || scenario === 'spike_test') complexity = 'long';
  
  const payload = generateTestPayload(complexity);
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
    timeout: '60s',
  };
  
  // Record start time for custom metrics
  const startTime = Date.now();
  
  // Make the API request
  const response = http.post(
    `${API_BASE_URL}/api/ai/generate`,
    JSON.stringify(payload),
    params
  );
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Record metrics
  totalGenerations.add(1);
  generationDuration.add(duration);
  
  // Check response
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response has success field': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.hasOwnProperty('success');
      } catch {
        return false;
      }
    },
    'generation completed successfully': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true && body.data;
      } catch {
        return false;
      }
    },
    'response time acceptable': (r) => r.timings.duration < 45000,
  });
  
  if (!success) {
    errorRate.add(1);
    failedGenerations.add(1);
  } else {
    errorRate.add(0);
    
    // Extract additional metrics from successful responses
    try {
      const body = JSON.parse(response.body);
      if (body.success && body.data && body.usage) {
        if (body.usage.totalTokens && duration > 0) {
          tokenThroughput.add(body.usage.totalTokens / (duration / 1000));
        }
        if (body.usage.cost) {
          costPerGeneration.add(body.usage.cost);
        }
      }
    } catch (error) {
      console.error('Error parsing response metrics:', error);
    }
  }
  
  // Log errors for debugging
  if (response.status !== 200) {
    console.error(`Request failed: ${response.status} - ${response.body}`);
  }
  
  // Add realistic delay between requests
  const thinkTime = Math.random() * 2 + 1; // 1-3 seconds
  sleep(thinkTime);
}

// Test lifecycle functions
export function setup() {
  console.log('Starting AI Content Generation Performance Test');
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log('Test scenarios: light_load, medium_load, high_load, stress_test, spike_test, soak_test');
  
  // Validate API availability
  const healthCheck = http.get(`${API_BASE_URL}/health`);
  if (healthCheck.status !== 200) {
    console.error('API health check failed. Aborting tests.');
    return null;
  }
  
  return { startTime: new Date().toISOString() };
}

export function teardown(data) {
  if (data) {
    console.log(`Test completed. Started at: ${data.startTime}`);
  }
  
  console.log('Performance test summary:');
  console.log('- Check response time thresholds and error rates');
  console.log('- Review token throughput and cost metrics');
  console.log('- Analyze resource utilization on server side');
}

// Specialized test functions for different scenarios
export function testDirectGeneration() {
  const payload = {
    task: 'blog_writing_complete',
    mode: 'direct',
    vertical: 'hospitality',
    prompt: 'Write a blog about hotel AI implementation',
    provider: 'anthropic',
    model: 'claude-sonnet-4',
    outputCount: 1,
  };
  
  const response = http.post(
    `${API_BASE_URL}/api/ai/generate`,
    JSON.stringify(payload),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { test_type: 'direct_generation' },
    }
  );
  
  check(response, {
    'direct generation successful': (r) => r.status === 200,
  });
}

export function testStructuredGeneration() {
  const payload = {
    task: 'blog_complete',
    mode: 'structured',
    vertical: 'healthcare',
    prompt: 'Create a structured blog about telemedicine',
    provider: 'openai',
    model: 'gpt-5',
  };
  
  const response = http.post(
    `${API_BASE_URL}/api/ai/generate`,
    JSON.stringify(payload),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { test_type: 'structured_generation' },
    }
  );
  
  check(response, {
    'structured generation successful': (r) => r.status === 200,
  });
}

export function testMultiVerticalGeneration() {
  const payload = {
    task: 'blog_writing_complete',
    mode: 'multi_vertical',
    vertical: ['hospitality', 'healthcare'],
    verticalMode: 'parallel',
    prompt: 'Customer service best practices',
    provider: 'anthropic',
  };
  
  const response = http.post(
    `${API_BASE_URL}/api/ai/generate`,
    JSON.stringify(payload),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { test_type: 'multi_vertical_generation' },
      timeout: '120s', // Extended timeout for multi-vertical
    }
  );
  
  check(response, {
    'multi-vertical generation successful': (r) => r.status === 200,
  });
}

export function testBatchGeneration() {
  const payload = {
    prompts: [
      'Write about AI in hospitality',
      'Write about digital transformation',
      'Write about customer experience',
    ],
    task: 'blog_writing_complete',
    mode: 'batch',
    vertical: 'tech',
    provider: 'anthropic',
  };
  
  const response = http.post(
    `${API_BASE_URL}/api/ai/generate`,
    JSON.stringify(payload),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { test_type: 'batch_generation' },
      timeout: '180s', // Extended timeout for batch
    }
  );
  
  check(response, {
    'batch generation successful': (r) => r.status === 200,
  });
}

// Memory and resource usage tests
export function testMemoryUsage() {
  // Generate large content to test memory handling
  const payload = {
    task: 'blog_writing_complete',
    mode: 'direct',
    vertical: 'tech',
    prompt: PROMPTS.long[0],
    provider: 'anthropic',
    model: 'claude-sonnet-4',
    options: {
      maxTokens: 4000, // Large output
    },
  };
  
  const response = http.post(
    `${API_BASE_URL}/api/ai/generate`,
    JSON.stringify(payload),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { test_type: 'memory_test' },
      timeout: '90s',
    }
  );
  
  check(response, {
    'large content generation successful': (r) => r.status === 200,
    'response contains substantial content': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success && body.data.results[0].content.length > 2000;
      } catch {
        return false;
      }
    },
  });
}

// Error handling and resilience tests
export function testErrorHandling() {
  // Test various error scenarios
  const errorPayloads = [
    // Missing required fields
    {
      mode: 'direct',
      // Missing task and prompt
    },
    // Invalid provider
    {
      task: 'blog_writing_complete',
      mode: 'direct',
      prompt: 'Test invalid provider',
      provider: 'nonexistent_provider',
    },
    // Invalid mode
    {
      task: 'blog_writing_complete',
      mode: 'invalid_mode',
      prompt: 'Test invalid mode',
      provider: 'anthropic',
    },
  ];
  
  errorPayloads.forEach((payload, index) => {
    const response = http.post(
      `${API_BASE_URL}/api/ai/generate`,
      JSON.stringify(payload),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { test_type: `error_handling_${index}` },
      }
    );
    
    check(response, {
      [`error scenario ${index} handled gracefully`]: (r) => 
        r.status >= 400 && r.status < 500, // Should return client error
    });
  });
}