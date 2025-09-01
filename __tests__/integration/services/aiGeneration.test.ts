/**
 * AI Generation Service Integration Tests
 * Tests for AI content generation with provider fallback
 */

import { AIGenerationService } from '../../../api/services/aiGenerationService';
import { db } from '../../../src/services/database/connection';
import { providers, blogs, images } from '../../../src/db/schema';
import { encryptApiKey } from '../../../api/utils/encryption';

describe('AI Generation Service Integration Tests', () => {
  let service: AIGenerationService;

  beforeAll(() => {
    service = new AIGenerationService();
  });

  beforeEach(async () => {
    // Clean up tables
    await db.delete(images);
    await db.delete(blogs);
    await db.delete(providers);

    // Setup test providers
    await db.insert(providers).values([
      {
        name: 'openai',
        active: true,
        apiKey: encryptApiKey('test-openai-key'),
        models: ['gpt-4', 'gpt-3.5-turbo'],
        settings: { temperature: 0.7 },
      },
      {
        name: 'anthropic',
        active: true,
        apiKey: encryptApiKey('test-claude-key'),
        models: ['claude-3-opus'],
        settings: { maxTokens: 4000 },
      },
      {
        name: 'google',
        active: false, // Disabled for fallback testing
        apiKey: encryptApiKey('test-gemini-key'),
        models: ['gemini-pro'],
        settings: {},
      },
    ]);
  });

  afterAll(async () => {
    await db.$client.end();
  });

  describe('generateContent', () => {
    it('should generate content with primary provider', async () => {
      const request = {
        prompt: 'Write a blog post about AI',
        type: 'blog_post' as const,
        options: {
          tone: 'professional',
          length: 'medium',
        },
      };

      const result = await service.generateContent(request);

      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      expect(result.provider).toBe('openai');
      expect(result.model).toBeDefined();
      expect(result.usage).toBeDefined();
    });

    it('should fallback to secondary provider on failure', async () => {
      // Disable primary provider
      await db
        .update(providers)
        .set({ active: false })
        .where({ name: 'openai' });

      const request = {
        prompt: 'Write a blog post about AI',
        type: 'blog_post' as const,
      };

      const result = await service.generateContent(request);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('anthropic'); // Fallback provider
    });

    it('should handle all providers failing', async () => {
      // Disable all providers
      await db.update(providers).set({ active: false });

      const request = {
        prompt: 'Write a blog post about AI',
        type: 'blog_post' as const,
      };

      const result = await service.generateContent(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No active providers');
    });

    it('should respect provider preferences', async () => {
      const request = {
        prompt: 'Write a blog post about AI',
        type: 'blog_post' as const,
        provider: 'anthropic', // Prefer Anthropic
      };

      const result = await service.generateContent(request);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('anthropic');
    });

    it('should validate content type', async () => {
      const request = {
        prompt: 'Write something',
        type: 'invalid_type' as any,
      };

      await expect(service.generateContent(request)).rejects.toThrow('Invalid content type');
    });
  });

  describe('generateBlogPost', () => {
    it('should generate complete blog post with metadata', async () => {
      const request = {
        topic: 'AI in Healthcare',
        keywords: ['medical AI', 'diagnosis', 'treatment'],
        tone: 'informative',
        length: 1500,
      };

      const result = await service.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.blog).toBeDefined();
      expect(result.blog.title).toBeDefined();
      expect(result.blog.content).toBeDefined();
      expect(result.blog.excerpt).toBeDefined();
      expect(result.blog.tags).toBeInstanceOf(Array);
      expect(result.blog.seoTitle).toBeDefined();
      expect(result.blog.seoDescription).toBeDefined();
    });

    it('should save blog post to database when requested', async () => {
      const request = {
        topic: 'AI in Healthcare',
        keywords: ['medical AI'],
        save: true,
      };

      const result = await service.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.blogId).toBeDefined();

      // Verify in database
      const savedBlog = await db
        .select()
        .from(blogs)
        .where({ id: result.blogId })
        .limit(1);

      expect(savedBlog[0]).toBeDefined();
      expect(savedBlog[0].title).toBe(result.blog.title);
    });

    it('should generate blog with images when requested', async () => {
      const request = {
        topic: 'AI in Healthcare',
        includeImages: true,
        imageCount: 2,
      };

      const result = await service.generateBlogPost(request);

      expect(result.success).toBe(true);
      expect(result.images).toBeDefined();
      expect(result.images).toHaveLength(2);
      expect(result.images[0].prompt).toBeDefined();
      expect(result.images[0].url).toBeDefined();
    });
  });

  describe('enhanceContent', () => {
    it('should enhance existing content', async () => {
      const request = {
        content: 'AI is transforming healthcare.',
        enhancements: ['expand', 'add_examples', 'improve_flow'],
      };

      const result = await service.enhanceContent(request);

      expect(result.success).toBe(true);
      expect(result.enhanced).toBeDefined();
      expect(result.enhanced.length).toBeGreaterThan(request.content.length);
      expect(result.changes).toBeDefined();
      expect(result.changes).toHaveLength(3);
    });

    it('should maintain original tone when enhancing', async () => {
      const request = {
        content: 'AI is amazing! It\'s revolutionizing everything!',
        enhancements: ['expand'],
        maintainTone: true,
      };

      const result = await service.enhanceContent(request);

      expect(result.success).toBe(true);
      expect(result.enhanced).toContain('!'); // Should maintain enthusiastic tone
    });
  });

  describe('generateImage', () => {
    it('should generate image with DALL-E when available', async () => {
      const request = {
        prompt: 'A futuristic hospital with AI robots',
        style: 'photorealistic',
        size: '1024x1024' as const,
      };

      const result = await service.generateImage(request);

      expect(result.success).toBe(true);
      expect(result.url).toBeDefined();
      expect(result.provider).toBe('openai');
      expect(result.model).toContain('dall-e');
    });

    it('should extract and enhance image prompts from content', async () => {
      const content = `
        The modern hospital features advanced AI systems.
        [Image: A state-of-the-art medical facility with holographic displays]
        Doctors work alongside AI assistants.
        [Image: Medical professionals using AR glasses for diagnosis]
      `;

      const result = await service.extractImagePrompts(content);

      expect(result.success).toBe(true);
      expect(result.prompts).toHaveLength(2);
      expect(result.prompts[0].original).toContain('medical facility');
      expect(result.prompts[0].enhanced).toBeDefined();
      expect(result.prompts[0].style).toBeDefined();
    });

    it('should batch generate multiple images', async () => {
      const requests = [
        { prompt: 'AI robot doctor', style: 'futuristic' },
        { prompt: 'Digital health dashboard', style: 'modern' },
      ];

      const results = await service.batchGenerateImages(requests);

      expect(results.success).toBe(true);
      expect(results.images).toHaveLength(2);
      expect(results.failed).toHaveLength(0);
      expect(results.images[0].url).toBeDefined();
      expect(results.images[1].url).toBeDefined();
    });
  });

  describe('Provider Fallback System', () => {
    it('should track provider health', async () => {
      // Simulate multiple failures
      for (let i = 0; i < 5; i++) {
        await service.recordProviderFailure('openai', 'API error');
      }

      const health = await service.getProviderHealth();

      expect(health.openai.failureCount).toBe(5);
      expect(health.openai.isHealthy).toBe(false);
    });

    it('should use fallback order based on health', async () => {
      // Mark OpenAI as unhealthy
      for (let i = 0; i < 10; i++) {
        await service.recordProviderFailure('openai', 'API error');
      }

      const request = {
        prompt: 'Test prompt',
        type: 'blog_post' as const,
      };

      const result = await service.generateContent(request);

      expect(result.success).toBe(true);
      expect(result.provider).not.toBe('openai'); // Should use fallback
    });

    it('should recover provider health after success', async () => {
      // Record failures
      for (let i = 0; i < 5; i++) {
        await service.recordProviderFailure('anthropic', 'Timeout');
      }

      // Record success
      await service.recordProviderSuccess('anthropic', 100);

      const health = await service.getProviderHealth();

      expect(health.anthropic.failureCount).toBe(0);
      expect(health.anthropic.isHealthy).toBe(true);
    });
  });

  describe('Usage Tracking', () => {
    it('should track token usage per provider', async () => {
      const request = {
        prompt: 'Write a short story',
        type: 'creative' as const,
      };

      await service.generateContent(request);

      const usage = await service.getUsageStats();

      expect(usage.totalTokens).toBeGreaterThan(0);
      expect(usage.byProvider.openai).toBeDefined();
      expect(usage.byProvider.openai.tokens).toBeGreaterThan(0);
    });

    it('should calculate costs based on token usage', async () => {
      const request = {
        prompt: 'Write a blog post',
        type: 'blog_post' as const,
      };

      const result = await service.generateContent(request);

      expect(result.usage).toBeDefined();
      expect(result.usage.totalTokens).toBeGreaterThan(0);
      expect(result.usage.estimatedCost).toBeGreaterThan(0);
    });

    it('should enforce usage limits', async () => {
      // Set low usage limit
      await service.setUsageLimit('openai', { dailyTokens: 100 });

      // Generate content to exceed limit
      const request = {
        prompt: 'Write a very long detailed blog post about everything in the universe',
        type: 'blog_post' as const,
        options: { length: 'long' },
      };

      const result = await service.generateContent(request);

      // Should fallback to another provider or fail
      if (result.success) {
        expect(result.provider).not.toBe('openai');
      } else {
        expect(result.error).toContain('limit');
      }
    });
  });
});

export {};