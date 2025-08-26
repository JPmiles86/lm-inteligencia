// Integration tests for AI Generation API endpoints
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { setupTestDatabase, teardownTestDatabase, cleanTestDatabase, seedTestData } from '../../setup/integration.setup';
import { aiRepository } from '../../../src/repositories/aiRepository';

// Test server setup
const API_BASE_URL = process.env.TEST_API_URL || 'http://localhost:8000';

describe('AI Generation API Integration Tests', () => {
  // testData is declared but not used in the tests - removing it
  // If needed in future, it should be typed properly

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestDatabase();
    await seedTestData();
  });

  afterEach(async () => {
    // Clean up any test-specific data
  });

  describe('POST /api/ai/generate', () => {
    const generateEndpoint = '/api/ai/generate';

    it('should generate content with direct mode', async () => {
      const requestBody = {
        task: 'blog_writing_complete',
        mode: 'direct',
        vertical: 'hospitality',
        prompt: 'Write a blog about hotel marketing trends in 2025',
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        outputCount: 1,
        context: {
          styleGuides: ['brand', 'hospitality'],
          previousContent: { mode: 'none' },
        },
      };

      const response = await request(API_BASE_URL)
        .post(generateEndpoint)
        .send(requestBody)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.mode).toBe('direct');
      expect(response.body.data.results).toHaveLength(1);
      expect(response.body.data.results[0]).toMatchObject({
        nodeId: expect.any(String),
        content: expect.any(String),
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        usage: expect.objectContaining({
          totalTokens: expect.any(Number),
          cost: expect.any(Number),
        }),
      });
      expect(response.body.usage).toBeDefined();
      expect(response.body.timing).toBeDefined();
    });

    it('should generate multiple outputs when requested', async () => {
      const requestBody = {
        task: 'title_generation',
        mode: 'direct',
        vertical: 'healthcare',
        prompt: 'Generate titles for a blog about telemedicine benefits',
        provider: 'anthropic',
        outputCount: 5,
      };

      const response = await request(API_BASE_URL)
        .post(generateEndpoint)
        .send(requestBody)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.results).toHaveLength(5);
      
      // All results should have unique content
      const contents = response.body.data.results.map((r: { content: string }) => r.content);
      const uniqueContents = new Set(contents);
      expect(uniqueContents.size).toBe(5);

      // First result should be selected by default
      expect(response.body.data.selectedIndex).toBe(0);
    });

    it('should handle structured generation workflow', async () => {
      const requestBody = {
        task: 'blog_complete',
        mode: 'structured',
        vertical: 'tech',
        prompt: 'AI-powered software development tools',
        provider: 'anthropic',
        context: {
          styleGuides: ['brand', 'tech'],
        },
      };

      const response = await request(API_BASE_URL)
        .post(generateEndpoint)
        .send(requestBody)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.mode).toBe('structured');
      expect(response.body.data.workflow).toBeDefined();
      expect(response.body.data.results).toBeDefined();

      // Should have results for each workflow step
      const workflowSteps = response.body.data.workflow.steps;
      expect(workflowSteps).toContain('idea');
      expect(workflowSteps).toContain('title');
      expect(workflowSteps).toContain('blog');

      workflowSteps.forEach((step: string) => {
        expect(response.body.data.results[step]).toBeDefined();
        expect(response.body.data.results[step].content).toBeTruthy();
      });
    });

    it('should generate for multiple verticals in parallel mode', async () => {
      const requestBody = {
        task: 'blog_writing_complete',
        mode: 'multi_vertical',
        vertical: ['hospitality', 'healthcare'],
        verticalMode: 'parallel',
        prompt: 'Customer satisfaction strategies',
        provider: 'anthropic',
      };

      const response = await request(API_BASE_URL)
        .post(generateEndpoint)
        .send(requestBody)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.mode).toBe('multi_vertical');
      expect(response.body.data.verticalMode).toBe('parallel');
      expect(response.body.data.targetVerticals).toEqual(['hospitality', 'healthcare']);

      // Should have results for both verticals
      expect(response.body.data.results.hospitality).toBeDefined();
      expect(response.body.data.results.healthcare).toBeDefined();
      
      // Each vertical should have different content
      expect(response.body.data.results.hospitality.content)
        .not.toBe(response.body.data.results.healthcare.content);
    });

    it('should handle batch generation of multiple prompts', async () => {
      const requestBody = {
        prompts: [
          'Write about digital marketing trends',
          'Write about social media strategies',
          'Write about email marketing best practices',
        ],
        task: 'blog_writing_complete',
        mode: 'batch',
        vertical: 'tech',
        provider: 'anthropic',
      };

      const response = await request(API_BASE_URL)
        .post(generateEndpoint)
        .send(requestBody)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.mode).toBe('batch');
      expect(response.body.data.results).toHaveLength(3);

      // Results should be in the same order as prompts
      response.body.data.results.forEach((result: { index: number; result: { content: string } }, index: number) => {
        expect(result.index).toBe(index);
        expect(result.result).toBeDefined();
        expect(result.result.content).toBeTruthy();
      });
    });

    it('should edit existing content', async () => {
      const requestBody = {
        mode: 'edit_existing',
        existingContent: 'Original blog content about marketing strategies...',
        editInstructions: 'Make it more technical and add specific examples',
        task: 'blog_editing',
        vertical: 'tech',
        provider: 'anthropic',
      };

      const response = await request(API_BASE_URL)
        .post(generateEndpoint)
        .send(requestBody)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.mode).toBe('edit_existing');
      expect(response.body.data.originalContent).toBe(requestBody.existingContent);
      expect(response.body.data.editedContent).toBeTruthy();
      expect(response.body.data.instructions).toBe(requestBody.editInstructions);
      expect(response.body.data.nodeId).toBeTruthy();
    });

    it('should validate required fields', async () => {
      const invalidRequestBody = {
        mode: 'direct',
        // Missing task and prompt
      };

      const response = await request(API_BASE_URL)
        .post(generateEndpoint)
        .send(invalidRequestBody)
        .expect(400);

      expect(response.body.error).toContain('Missing required fields');
    });

    it('should handle provider fallback when primary provider fails', async () => {
      // This test assumes the test setup includes a provider that will fail
      const requestBody = {
        task: 'blog_writing_complete',
        mode: 'direct',
        vertical: 'hospitality',
        prompt: 'Test fallback provider',
        provider: 'unavailable_provider', // This should trigger fallback
      };

      const response = await request(API_BASE_URL)
        .post(generateEndpoint)
        .send(requestBody)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.results[0].fallback).toBe(true);
      expect(response.body.data.results[0].originalProvider).toBe('unavailable_provider');
    });

    it('should track analytics for successful generation', async () => {
      const requestBody = {
        task: 'blog_writing_complete',
        mode: 'direct',
        vertical: 'healthcare',
        prompt: 'Healthcare analytics test',
        provider: 'anthropic',
      };

      await request(API_BASE_URL)
        .post(generateEndpoint)
        .send(requestBody)
        .expect(200);

      // Verify analytics were logged
      const analytics = await aiRepository.getAnalytics({
        startDate: new Date(Date.now() - 60000), // Last minute
        provider: 'anthropic',
        vertical: 'healthcare',
      });

      expect(analytics).toHaveLength(1);
      expect(analytics[0].totalGenerations).toBeGreaterThan(0);
      expect(analytics[0].successfulGenerations).toBeGreaterThan(0);
      expect(analytics[0].totalCost).toBeGreaterThan(0);
    });

    it('should handle concurrent requests without conflicts', async () => {
      const requestBody = {
        task: 'title_generation',
        mode: 'direct',
        vertical: 'tech',
        prompt: 'Concurrent generation test',
        provider: 'anthropic',
        outputCount: 1,
      };

      // Make 5 concurrent requests
      const promises = Array.from({ length: 5 }, () => 
        request(API_BASE_URL)
          .post(generateEndpoint)
          .send(requestBody)
      );

      const responses = await Promise.all(promises);

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // Each should have generated unique content
      const contents = responses.map(r => r.body.data.results[0].content);
      const uniqueContents = new Set(contents);
      expect(uniqueContents.size).toBeGreaterThan(1); // At least some variation expected
    });

    it('should respect token limits and costs', async () => {
      const requestBody = {
        task: 'blog_writing_complete',
        mode: 'direct',
        vertical: 'hospitality',
        prompt: 'Write a comprehensive guide to hotel management',
        provider: 'anthropic',
        options: {
          maxTokens: 1000, // Explicit token limit
        },
      };

      const response = await request(API_BASE_URL)
        .post(generateEndpoint)
        .send(requestBody)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.results[0].usage.outputTokens).toBeLessThanOrEqual(1000);
      expect(response.body.data.results[0].usage.cost).toBeGreaterThan(0);
    });
  });

  describe('POST /api/ai/generate with streaming', () => {
    it('should handle streaming generation', async () => {
      const requestBody = {
        task: 'blog_writing_complete',
        mode: 'direct',
        vertical: 'tech',
        prompt: 'Write about streaming AI responses',
        provider: 'anthropic',
        stream: true,
      };

      const response = await request(API_BASE_URL)
        .post('/api/ai/generate')
        .send(requestBody)
        .expect(200);

      // For streaming, we expect Server-Sent Events format
      expect(response.headers['content-type']).toContain('text/event-stream');
      expect(response.text).toContain('data:');
      expect(response.text).toContain('[DONE]');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid provider gracefully', async () => {
      const requestBody = {
        task: 'blog_writing_complete',
        mode: 'direct',
        prompt: 'Test invalid provider',
        provider: 'nonexistent_provider',
      };

      const response = await request(API_BASE_URL)
        .post('/api/ai/generate')
        .send(requestBody)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeTruthy();
    });

    it('should handle invalid mode gracefully', async () => {
      const requestBody = {
        task: 'blog_writing_complete',
        mode: 'invalid_mode',
        prompt: 'Test invalid mode',
        provider: 'anthropic',
      };

      const response = await request(API_BASE_URL)
        .post('/api/ai/generate')
        .send(requestBody)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Unsupported generation mode');
    });

    it('should log failed generations for analytics', async () => {
      const requestBody = {
        task: 'blog_writing_complete',
        mode: 'direct',
        prompt: 'Test failure logging',
        provider: 'nonexistent_provider',
      };

      await request(API_BASE_URL)
        .post('/api/ai/generate')
        .send(requestBody)
        .expect(500);

      // Verify failure was logged
      const analytics = await aiRepository.getAnalytics({
        startDate: new Date(Date.now() - 60000), // Last minute
      });

      const failedGeneration = analytics.find(a => 
        a.failedGenerations > 0 && a.provider === 'nonexistent_provider'
      );
      expect(failedGeneration).toBeDefined();
    });
  });

  describe('Context and Style Guide Integration', () => {
    it('should apply style guides correctly', async () => {
      // First, create a custom style guide
      const styleGuide = await aiRepository.createStyleGuide({
        type: 'writing_style',
        name: 'Test Professional Style',
        content: 'Write in a formal, professional tone with technical depth.',
        active: true,
      });

      const requestBody = {
        task: 'blog_writing_complete',
        mode: 'direct',
        vertical: 'tech',
        prompt: 'Write about artificial intelligence',
        provider: 'anthropic',
        context: {
          styleGuides: {
            writingStyle: [styleGuide.id],
          },
        },
      };

      const response = await request(API_BASE_URL)
        .post('/api/ai/generate')
        .send(requestBody)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Verify the generation node was created with context
      const generationNode = await aiRepository.getGenerationNode(
        response.body.data.results[0].nodeId
      );
      
      expect(generationNode).toBeDefined();
      expect(generationNode!.contextData).toBeTruthy();
      
      const contextData = JSON.parse(generationNode!.contextData as string);
      expect(contextData.styleGuides.writingStyle).toContain(styleGuide.id);
    });

    it('should include previous content when specified', async () => {
      // Create a previous blog post
      const previousNode = await aiRepository.createGenerationNode({
        type: 'blog',
        content: 'Previous blog content about marketing strategies...',
        vertical: 'hospitality',
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
      });

      const requestBody = {
        task: 'blog_writing_complete',
        mode: 'direct',
        vertical: 'hospitality',
        prompt: 'Write a follow-up blog about advanced marketing',
        provider: 'anthropic',
        context: {
          previousContent: {
            mode: 'selected',
            items: [previousNode.id],
            includeElements: {
              titles: true,
              content: true,
              tags: false,
            },
          },
        },
      };

      const response = await request(API_BASE_URL)
        .post('/api/ai/generate')
        .send(requestBody)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify context was properly built and used
      const generationNode = await aiRepository.getGenerationNode(
        response.body.data.results[0].nodeId
      );

      expect(generationNode).toBeDefined();
      expect(generationNode!.contextData).toBeTruthy();
    });
  });

  describe('Database Integration', () => {
    it('should properly store generation nodes in database', async () => {
      const requestBody = {
        task: 'blog_writing_complete',
        mode: 'direct',
        vertical: 'healthcare',
        prompt: 'Database integration test',
        provider: 'anthropic',
      };

      const response = await request(API_BASE_URL)
        .post('/api/ai/generate')
        .send(requestBody)
        .expect(200);

      const nodeId = response.body.data.results[0].nodeId;
      
      // Verify node was stored in database
      const storedNode = await aiRepository.getGenerationNode(nodeId);
      
      expect(storedNode).toBeDefined();
      expect(storedNode!.type).toBe('blog');
      expect(storedNode!.content).toBeTruthy();
      expect(storedNode!.vertical).toBe('healthcare');
      expect(storedNode!.provider).toBe('anthropic');
      expect(storedNode!.tokensInput).toBeGreaterThan(0);
      expect(storedNode!.tokensOutput).toBeGreaterThan(0);
      expect(storedNode!.cost).toBeGreaterThan(0);
    });

    it('should create proper tree relationships for structured generation', async () => {
      const requestBody = {
        task: 'blog_complete',
        mode: 'structured',
        vertical: 'tech',
        prompt: 'Test tree relationships',
        provider: 'anthropic',
      };

      const response = await request(API_BASE_URL)
        .post('/api/ai/generate')
        .send(requestBody)
        .expect(200);

      const rootNodeId = response.body.data.rootNodeId;
      const finalNodeId = response.body.data.finalNodeId;

      // Verify tree structure
      const tree = await aiRepository.getGenerationTree(rootNodeId);
      
      expect(tree.length).toBeGreaterThan(1); // Should have multiple nodes
      
      // All nodes should have the same root
      tree.forEach(node => {
        expect(node.rootId).toBe(rootNodeId);
      });

      // Final node should have parent relationships
      const finalNode = await aiRepository.getGenerationNode(finalNodeId);
      expect(finalNode).toBeDefined();
      expect(finalNode!.parentId).toBeTruthy();
    });
  });

  describe('Performance and Load', () => {
    it('should handle reasonable load without significant performance degradation', async () => {
      const requestBody = {
        task: 'title_generation',
        mode: 'direct',
        vertical: 'tech',
        prompt: 'Performance test generation',
        provider: 'anthropic',
        outputCount: 1,
      };

      const startTime = Date.now();
      
      // Make 10 concurrent requests
      const promises = Array.from({ length: 10 }, () => 
        request(API_BASE_URL)
          .post('/api/ai/generate')
          .send(requestBody)
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // Performance check: 10 requests should complete in reasonable time
      // This is a loose check - adjust based on your performance requirements
      expect(totalTime).toBeLessThan(30000); // 30 seconds max for 10 concurrent requests
    });
  });
});