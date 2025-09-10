#!/usr/bin/env node

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

const tests = [
  {
    name: 'Health Check',
    method: 'GET',
    endpoint: '/health',
    expectedStatus: 200
  },
  {
    name: 'Providers List',
    method: 'GET', 
    endpoint: '/ai/providers',
    expectedStatus: 200
  },
  {
    name: 'Style Guides',
    method: 'GET',
    endpoint: '/ai/style-guides',
    expectedStatus: 200
  },
  {
    name: 'Brainstorm Ideas',
    method: 'POST',
    endpoint: '/ai/brainstorm',
    body: {
      action: 'generate-ideas',
      topic: 'test topic',
      count: 3,
      vertical: 'all',
      tone: 'professional',
      contentTypes: [],
      prompt: 'Generate 3 test ideas',
      provider: 'openai',
      model: 'gpt-3.5-turbo'
    },
    expectedStatus: 200
  }
];

async function runTests() {
  console.log('🧪 Testing API endpoints...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (test.body) {
        options.body = JSON.stringify(test.body);
      }
      
      const response = await fetch(BASE_URL + test.endpoint, options);
      
      if (response.status === test.expectedStatus) {
        console.log(`✅ ${test.name}: PASSED (${response.status})`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED (Expected ${test.expectedStatus}, got ${response.status})`);
        const text = await response.text();
        console.log(`   Response: ${text.substring(0, 200)}...`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

// Check if server is running
fetch(BASE_URL + '/health')
  .then(() => {
    runTests();
  })
  .catch(() => {
    console.log('❌ Server is not running on http://localhost:3000');
    console.log('   Please start the server with: npm run dev:api');
    process.exit(1);
  });