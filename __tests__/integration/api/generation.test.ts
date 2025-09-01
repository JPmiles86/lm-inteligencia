import request from 'supertest';
import { setupServer } from 'msw/node';
import { handlers } from '../../mocks/handlers';
import { testDb, cleanTestDatabase, seedTestData } from '../../setup/integration.setup';

// Create MSW server for API mocking
const server = setupServer(...handlers);

describe('Blog Generation API Integration', () => {
  let app: any;

  beforeAll(async () => {
    // Start MSW server
    server.listen({ onUnhandledRequest: 'warn' });
    
    // Import the Express app (after MSW is set up)
    const { default: expressApp } = await import('../../../api/server');
    app = expressApp;
  });

  afterAll(async () => {
    server.close();
  });

  beforeEach(async () => {
    await cleanTestDatabase();
    await seedTestData();
    server.resetHandlers();
  });

  describe('POST /api/generate/blog', () => {
    it('should generate blog content with valid request', async () => {
      const response = await request(app)
        .post('/api/generate/blog')
        .send({
          prompt: 'Write about AI testing best practices',
          context: { 
            vertical: 'technology',
            styleGuide: 'professional',
            targetAudience: 'developers'
          },
          provider: 'openai',
          model: 'gpt-4o'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('provider', 'openai');
      expect(response.body).toHaveProperty('model', 'gpt-4o');
      expect(response.body).toHaveProperty('tokensUsed');
      expect(response.body).toHaveProperty('cost');
      expect(response.body).toHaveProperty('generationTime');

      // Validate response structure
      expect(typeof response.body.content).toBe('string');
      expect(response.body.content.length).toBeGreaterThan(0);
      expect(typeof response.body.tokensUsed).toBe('number');
      expect(typeof response.body.cost).toBe('number');
      expect(response.body.tokensUsed).toBeGreaterThan(0);
      expect(response.body.cost).toBeGreaterThan(0);
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/generate/blog')
        .send({
          // Missing prompt
          context: { vertical: 'technology' }
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('prompt');
    });

    it('should handle invalid provider', async () => {
      const response = await request(app)
        .post('/api/generate/blog')
        .send({
          prompt: 'Test content',
          provider: 'invalid-provider'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should fallback to alternative provider when primary fails', async () => {
      const response = await request(app)
        .post('/api/generate/blog')
        .send({
          prompt: 'Test content with fallback',
          context: { vertical: 'hospitality' },
          provider: 'anthropic', // Will fail in our MSW mock
          fallbackEnabled: true
        });

      // Should either succeed with fallback or return specific error
      if (response.status === 200) {
        expect(response.body).toHaveProperty('provider');
        expect(response.body).toHaveProperty('content');
        // Provider might be different due to fallback
      } else {
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error');
      }
    });

    it('should respect rate limiting', async () => {
      // Make multiple requests to trigger rate limiting
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/generate/blog')
          .send({
            prompt: 'Rate limit test',
            context: { vertical: 'technology' }
          })
      );

      const responses = await Promise.all(requests);
      
      // Some requests should succeed, some might be rate limited
      const successfulRequests = responses.filter(r => r.status === 200);
      const rateLimitedRequests = responses.filter(r => r.status === 429);

      expect(successfulRequests.length + rateLimitedRequests.length).toBe(10);
    });

    it('should validate input sanitization', async () => {
      const maliciousPrompt = '<script>alert("xss")</script>Test prompt';
      
      const response = await request(app)
        .post('/api/generate/blog')
        .send({
          prompt: maliciousPrompt,
          context: { vertical: 'technology' }
        });

      if (response.status === 200) {
        // Content should be sanitized
        expect(response.body.content).not.toContain('<script>');
      } else {
        // Or request should be rejected
        expect(response.status).toBe(400);
      }
    });
  });

  describe('POST /api/generate/ideas', () => {
    it('should generate ideas with valid context', async () => {
      const response = await request(app)
        .post('/api/generate/ideas')
        .send({
          context: {
            vertical: 'hospitality',
            targetAudience: 'hotel managers',
            contentType: 'blog'
          },
          count: 5
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ideas');
      expect(Array.isArray(response.body.ideas)).toBe(true);
      expect(response.body.ideas.length).toBeGreaterThan(0);
      
      // Validate idea structure
      response.body.ideas.forEach((idea: any) => {
        expect(idea).toHaveProperty('id');
        expect(idea).toHaveProperty('content');
        expect(idea).toHaveProperty('score');
        expect(typeof idea.content).toBe('string');
        expect(typeof idea.score).toBe('number');
        expect(idea.score).toBeGreaterThan(0);
        expect(idea.score).toBeLessThanOrEqual(1);
      });
    });

    it('should handle different verticals', async () => {
      const verticals = ['hospitality', 'technology', 'healthcare', 'finance'];
      
      for (const vertical of verticals) {
        const response = await request(app)
          .post('/api/generate/ideas')
          .send({
            context: { vertical },
            count: 3
          });

        expect(response.status).toBe(200);
        expect(response.body.ideas).toBeDefined();
        expect(response.body).toHaveProperty('vertical', vertical);
      }
    });
  });

  describe('POST /api/generate/titles', () => {
    it('should generate titles for a given idea', async () => {
      const response = await request(app)
        .post('/api/generate/titles')
        .send({
          idea: 'AI-powered customer service automation',
          context: { vertical: 'technology' },
          count: 10
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('titles');
      expect(Array.isArray(response.body.titles)).toBe(true);
      
      response.body.titles.forEach((title: any) => {
        expect(title).toHaveProperty('id');
        expect(title).toHaveProperty('content');
        expect(title).toHaveProperty('score');
        expect(title).toHaveProperty('type');
        expect(typeof title.content).toBe('string');
        expect(title.content.length).toBeGreaterThan(0);
      });
    });

    it('should generate different title types', async () => {
      const response = await request(app)
        .post('/api/generate/titles')
        .send({
          idea: 'Hotel revenue optimization strategies',
          context: { vertical: 'hospitality' },
          count: 15
        });

      expect(response.status).toBe(200);
      
      const titleTypes = response.body.titles.map((title: any) => title.type);
      const uniqueTypes = [...new Set(titleTypes)];
      
      // Should have multiple title types
      expect(uniqueTypes.length).toBeGreaterThan(1);
      expect(uniqueTypes).toContain('list');
    });
  });

  describe('Error handling', () => {
    it('should handle provider service errors gracefully', async () => {
      // Mock a service failure
      const response = await request(app)
        .post('/api/generate/error')
        .send({
          prompt: 'This should trigger an error'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle timeout errors', async () => {
      const response = await request(app)
        .post('/api/generate/timeout')
        .timeout(5000) // 5 second timeout
        .send({
          prompt: 'This should timeout'
        });

      expect(response.status).toBe(408);
    });

    it('should handle database connection errors', async () => {
      // This would require mocking database failures
      // For now, just ensure the endpoint exists
      const response = await request(app)
        .post('/api/generate/blog')
        .send({
          prompt: 'Test with potential DB error',
          context: { vertical: 'technology' }
        });

      // Should either succeed or fail gracefully
      expect([200, 500, 503]).toContain(response.status);
    });
  });

  describe('Performance tests', () => {
    it('should handle concurrent requests', async () => {
      const concurrentRequests = 5;
      const requests = Array(concurrentRequests).fill(null).map((_, index) =>
        request(app)
          .post('/api/generate/blog')
          .send({
            prompt: `Concurrent test request ${index}`,
            context: { vertical: 'technology' }
          })
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const endTime = Date.now();

      // All requests should complete
      expect(responses.length).toBe(concurrentRequests);
      
      // Most should succeed (allowing for some rate limiting)
      const successfulResponses = responses.filter(r => r.status === 200);
      expect(successfulResponses.length).toBeGreaterThan(0);

      // Should complete in reasonable time (adjust based on expected performance)
      expect(endTime - startTime).toBeLessThan(30000); // 30 seconds
    });

    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/generate/blog')
        .send({
          prompt: 'Performance test content generation',
          context: { vertical: 'technology' }
        });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (response.status === 200) {
        // Should respond within 10 seconds for successful requests
        expect(responseTime).toBeLessThan(10000);
        expect(response.body).toHaveProperty('generationTime');
      }
    });
  });
});