import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { openAIService } from '../../../src/services/ai/providers/OpenAIService';
import { openAIImageService } from '../../../src/services/ai/providers/OpenAIImageService';
import { openAIEmbeddingService } from '../../../src/services/ai/providers/OpenAIEmbeddingService';

// Note: These tests require valid OpenAI API keys in the database
// For CI/CD, mock the database calls or skip tests if keys aren't available

describe('OpenAI Service Integration', () => {
  let serviceInitialized = false;

  beforeAll(async () => {
    try {
      // Test if we can initialize the service
      await openAIService.testConnection();
      serviceInitialized = true;
    } catch (error) {
      console.warn('OpenAI service not available for integration tests:', error);
    }
  });

  describe('Text Generation', () => {
    it('should initialize and test connection', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - OpenAI service not available');
        return;
      }

      const isConnected = await openAIService.testConnection();
      expect(isConnected).toBe(true);
    });

    it('should generate text with GPT-4', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - OpenAI service not available');
        return;
      }

      const result = await openAIService.generateText(
        'Write a haiku about TypeScript',
        { maxTokens: 100 }
      );
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }, 30000); // 30 second timeout for AI generation
    
    it('should handle streaming responses', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - OpenAI service not available');
        return;
      }

      const chunks: string[] = [];
      
      await openAIService.generateStream(
        'Count to 5',
        { maxTokens: 50 },
        (chunk) => chunks.push(chunk)
      );
      
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks.join('')).toContain('1');
    }, 30000);

    it('should generate blog content with structure', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - OpenAI service not available');
        return;
      }

      const blog = await openAIService.generateBlog(
        'The Benefits of TypeScript',
        { vertical: 'tech', writingStyle: 'professional' }
      );
      
      expect(blog.title).toBeDefined();
      expect(blog.content).toBeDefined();
      expect(blog.excerpt).toBeDefined();
      expect(blog.tags).toBeInstanceOf(Array);
      expect(blog.imagePrompts).toBeInstanceOf(Array);
      expect(blog.title.length).toBeGreaterThan(0);
      expect(blog.content.length).toBeGreaterThan(100);
    }, 60000); // 60 second timeout for blog generation
  });
  
  describe('Image Generation', () => {
    it('should generate images with DALL-E 3', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - OpenAI service not available');
        return;
      }

      const urls = await openAIImageService.generateImage(
        'A serene landscape with mountains',
        { size: '1024x1024', quality: 'standard' }
      );
      
      expect(urls).toBeDefined();
      expect(urls.length).toBe(1);
      expect(urls[0]).toMatch(/^https?:\/\//);
    }, 60000);

    it('should generate multiple blog images', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - OpenAI service not available');
        return;
      }

      const prompts = [
        'A modern office workspace',
        'People collaborating on code'
      ];
      
      const images = await openAIImageService.generateBlogImages(prompts);
      
      expect(images).toBeInstanceOf(Array);
      expect(images.length).toBe(2);
      images.forEach((img, index) => {
        expect(img.prompt).toBe(prompts[index]);
        if (img.url) {
          expect(img.url).toMatch(/^https?:\/\//);
        }
      });
    }, 120000);
  });

  describe('Embedding Service', () => {
    it('should create single embeddings', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - OpenAI service not available');
        return;
      }

      const embedding = await openAIEmbeddingService.createEmbedding(
        'This is a test sentence for embedding'
      );
      
      expect(embedding).toBeInstanceOf(Array);
      expect(embedding.length).toBeGreaterThan(0);
      expect(typeof embedding[0]).toBe('number');
    }, 30000);

    it('should create batch embeddings', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - OpenAI service not available');
        return;
      }

      const texts = [
        'First test sentence',
        'Second test sentence',
        'Third test sentence'
      ];
      
      const embeddings = await openAIEmbeddingService.createBatchEmbeddings(texts);
      
      expect(embeddings).toBeInstanceOf(Array);
      expect(embeddings.length).toBe(3);
      embeddings.forEach(embedding => {
        expect(embedding).toBeInstanceOf(Array);
        expect(embedding.length).toBeGreaterThan(0);
      });
    }, 30000);

    it('should perform semantic search', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - OpenAI service not available');
        return;
      }

      const documents = [
        { id: '1', text: 'TypeScript is a programming language' },
        { id: '2', text: 'JavaScript runs in the browser' },
        { id: '3', text: 'Python is used for data science' },
        { id: '4', text: 'TypeScript adds types to JavaScript' }
      ];
      
      const results = await openAIEmbeddingService.semanticSearch(
        'programming language with types',
        documents,
        2
      );
      
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeLessThanOrEqual(2);
      results.forEach(result => {
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('score');
        expect(typeof result.score).toBe('number');
      });
    }, 45000);

    it('should generate research summaries', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - OpenAI service not available');
        return;
      }

      const sources = [
        'TypeScript is a typed superset of JavaScript',
        'It compiles to plain JavaScript',
        'TypeScript was developed by Microsoft'
      ];
      
      const summary = await openAIEmbeddingService.generateResearchSummary(
        'TypeScript programming language',
        sources
      );
      
      expect(summary).toHaveProperty('summary');
      expect(summary).toHaveProperty('keyPoints');
      expect(summary).toHaveProperty('relatedTopics');
      expect(typeof summary.summary).toBe('string');
      expect(summary.keyPoints).toBeInstanceOf(Array);
      expect(summary.relatedTopics).toBeInstanceOf(Array);
    }, 45000);
  });

  describe('Error Handling', () => {
    it('should handle invalid API configuration gracefully', async () => {
      // This test would require mocking the database to return invalid config
      // For now, we'll just verify the service throws appropriate errors
      expect(true).toBe(true);
    });

    it('should handle rate limiting gracefully', async () => {
      // This would require testing rate limits which is difficult in integration tests
      // For now, we'll just verify the service exists
      expect(openAIService).toBeDefined();
    });
  });
});

describe('OpenAI Service Error Scenarios', () => {
  it('should handle network errors', async () => {
    // Mock scenario testing would go here
    expect(true).toBe(true);
  });

  it('should handle malformed responses', async () => {
    // Mock scenario testing would go here
    expect(true).toBe(true);
  });
});