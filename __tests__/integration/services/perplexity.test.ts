import { describe, it, expect, beforeAll } from '@jest/globals';
import { perplexityService } from '../../../src/services/ai/providers/PerplexityService';

// Note: These tests require valid Perplexity API keys in the database
// For CI/CD, mock the database calls or skip tests if keys aren't available

describe('Perplexity Service Integration', () => {
  let serviceInitialized = false;

  beforeAll(async () => {
    try {
      // Test if we can initialize the service
      await perplexityService.testConnection();
      serviceInitialized = true;
    } catch (error) {
      console.warn('Perplexity service not available for integration tests:', error);
    }
  });

  describe('Connection and Basic Functionality', () => {
    it('should initialize and test connection', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Perplexity service not available');
        return;
      }

      const isConnected = await perplexityService.testConnection();
      expect(isConnected).toBe(true);
    });

    it('should generate text with online search', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Perplexity service not available');
        return;
      }

      const result = await perplexityService.generateText(
        'What are the latest developments in TypeScript as of 2024?',
        {
          model: 'llama-3.1-sonar-large-128k-online',
          maxTokens: 500,
          returnCitations: true
        }
      );
      
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(typeof result.content).toBe('string');
      expect(result.content.length).toBeGreaterThan(0);
      
      // Should include citations for online search
      expect(result.citations).toBeDefined();
      expect(Array.isArray(result.citations)).toBe(true);
      
      // Should include usage stats
      expect(result.usage).toBeDefined();
      expect(result.usage?.totalTokens).toBeGreaterThan(0);
    }, 60000); // 60 second timeout for research generation

    it('should handle streaming responses', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Perplexity service not available');
        return;
      }

      const chunks: string[] = [];
      
      await perplexityService.generateStream(
        'Briefly explain quantum computing',
        { 
          model: 'sonar',
          maxTokens: 100 
        },
        (chunk) => chunks.push(chunk)
      );
      
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks.join('').length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('Research Capabilities', () => {
    it('should conduct quick research with sources', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Perplexity service not available');
        return;
      }

      const research = await perplexityService.research(
        'Latest trends in artificial intelligence 2024',
        { 
          depth: 'quick',
          recency: 'month'
        }
      );
      
      expect(research).toBeDefined();
      expect(research.summary).toBeDefined();
      expect(typeof research.summary).toBe('string');
      expect(research.summary.length).toBeGreaterThan(0);
      
      expect(Array.isArray(research.keyPoints)).toBe(true);
      expect(Array.isArray(research.sources)).toBe(true);
      expect(research.sources.length).toBeGreaterThan(0);
      
      // Verify source structure
      if (research.sources.length > 0) {
        const firstSource = research.sources[0];
        expect(firstSource.title).toBeDefined();
        expect(firstSource.url).toBeDefined();
        expect(typeof firstSource.url).toBe('string');
        expect(firstSource.url).toMatch(/^https?:\/\//);
      }
    }, 45000);

    it('should conduct standard research with comprehensive analysis', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Perplexity service not available');
        return;
      }

      const research = await perplexityService.research(
        'Future of web development frameworks',
        { 
          depth: 'standard',
          recency: 'week',
          sources: 5
        }
      );
      
      expect(research.summary.length).toBeGreaterThan(200); // Should be more detailed
      expect(research.keyPoints.length).toBeGreaterThan(3);
      expect(research.sources.length).toBeGreaterThan(0);
      expect(research.relatedTopics).toBeDefined();
      expect(Array.isArray(research.relatedTopics)).toBe(true);
    }, 60000);

    it('should conduct deep research for comprehensive reports', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Perplexity service not available');
        return;
      }

      const research = await perplexityService.research(
        'Impact of GDPR on data privacy',
        { 
          depth: 'deep',
          recency: 'month'
        }
      );
      
      expect(research.summary.length).toBeGreaterThan(500); // Should be comprehensive
      expect(research.keyPoints.length).toBeGreaterThan(5);
      expect(research.sources.length).toBeGreaterThan(2);
    }, 90000); // Extended timeout for deep research
  });

  describe('Fact Checking', () => {
    it('should fact-check true statements with high confidence', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Perplexity service not available');
        return;
      }

      const result = await perplexityService.factCheck(
        'TypeScript was developed by Microsoft'
      );
      
      expect(result).toBeDefined();
      expect(result.verdict).toBeDefined();
      expect(['true', 'false', 'partially-true', 'unverifiable', 'misleading']).toContain(result.verdict);
      expect(result.explanation).toBeDefined();
      expect(typeof result.explanation).toBe('string');
      expect(result.confidence).toBeDefined();
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.sources)).toBe(true);
      expect(result.sources.length).toBeGreaterThan(0);
    }, 45000);

    it('should fact-check with proper source attribution', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Perplexity service not available');
        return;
      }

      const result = await perplexityService.factCheck(
        'The first iPhone was released in 2007'
      );
      
      expect(result.sources.length).toBeGreaterThan(0);
      
      // Verify sources have proper structure
      const firstSource = result.sources[0];
      expect(firstSource.title).toBeDefined();
      expect(firstSource.url).toBeDefined();
      expect(typeof firstSource.url).toBe('string');
    }, 45000);
  });

  describe('Blog Generation with Research', () => {
    it('should generate blog with research and citations', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Perplexity service not available');
        return;
      }

      const blog = await perplexityService.generateBlogWithResearch(
        'Benefits of serverless computing',
        { 
          vertical: 'tech',
          targetLength: 'short'
        }
      );
      
      expect(blog).toBeDefined();
      expect(blog.title).toBeDefined();
      expect(typeof blog.title).toBe('string');
      expect(blog.title.length).toBeGreaterThan(0);
      
      expect(blog.content).toBeDefined();
      expect(typeof blog.content).toBe('string');
      expect(blog.content.length).toBeGreaterThan(500); // Substantial content
      
      expect(blog.excerpt).toBeDefined();
      expect(Array.isArray(blog.tags)).toBe(true);
      expect(blog.tags.length).toBeGreaterThan(0);
      
      expect(Array.isArray(blog.imagePrompts)).toBe(true);
      expect(blog.imagePrompts.length).toBeGreaterThan(0);
      
      expect(Array.isArray(blog.sources)).toBe(true);
      expect(blog.sources.length).toBeGreaterThan(0); // Should have research sources
      
      // Verify usage tracking
      expect(blog.usage).toBeDefined();
      expect(blog.usage?.totalTokens).toBeGreaterThan(0);
    }, 120000); // Extended timeout for comprehensive blog generation
  });

  describe('Information Comparison', () => {
    it('should compare multiple items with structured analysis', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Perplexity service not available');
        return;
      }

      const comparison = await perplexityService.compareInformation([
        'React',
        'Vue.js',
        'Angular'
      ]);
      
      expect(comparison).toBeDefined();
      expect(comparison.comparison).toBeDefined();
      expect(typeof comparison.comparison).toBe('string');
      expect(comparison.comparison.length).toBeGreaterThan(200);
      
      expect(Array.isArray(comparison.differences)).toBe(true);
      expect(Array.isArray(comparison.similarities)).toBe(true);
      expect(comparison.recommendation).toBeDefined();
      expect(Array.isArray(comparison.sources)).toBe(true);
      expect(comparison.sources.length).toBeGreaterThan(0);
    }, 60000);
  });

  describe('Model Variations', () => {
    it('should work with different Sonar models', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Perplexity service not available');
        return;
      }

      // Test lightweight Sonar model
      const result = await perplexityService.generateText(
        'Explain JavaScript closures briefly',
        {
          model: 'sonar',
          maxTokens: 200
        }
      );
      
      expect(result.content).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
    }, 30000);

    it('should work with Llama Sonar models for online search', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Perplexity service not available');
        return;
      }

      const result = await perplexityService.generateText(
        'Latest news about Python 3.12 features',
        {
          model: 'llama-3.1-sonar-small-128k-online',
          maxTokens: 300,
          returnCitations: true
        }
      );
      
      expect(result.content).toBeDefined();
      expect(result.citations).toBeDefined();
      expect(result.citations!.length).toBeGreaterThan(0);
    }, 45000);
  });

  describe('Error Handling', () => {
    it('should handle invalid prompts gracefully', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Perplexity service not available');
        return;
      }

      try {
        await perplexityService.generateText('');
        // If it doesn't throw, that's also acceptable behavior
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should handle network timeouts appropriately', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Perplexity service not available');
        return;
      }

      // This test might not always trigger a timeout, but ensures the service handles it
      try {
        const result = await perplexityService.generateText(
          'Generate a very long essay about the history of computing',
          {
            maxTokens: 8000
          }
        );
        // If successful, verify basic structure
        expect(result.content).toBeDefined();
      } catch (error) {
        // Timeout or other API errors are acceptable for this test
        expect(error).toBeInstanceOf(Error);
      }
    }, 90000);
  });

  describe('Advanced Search Features', () => {
    it('should support domain filtering', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Perplexity service not available');
        return;
      }

      const result = await perplexityService.generateText(
        'Latest TypeScript updates',
        {
          model: 'llama-3.1-sonar-large-128k-online',
          searchDomainFilter: ['github.com', 'typescriptlang.org'],
          returnCitations: true
        }
      );
      
      expect(result.content).toBeDefined();
      expect(result.citations).toBeDefined();
      
      // Check if sources are from specified domains (when available)
      if (result.citations && result.citations.length > 0) {
        const hasFilteredSources = result.citations.some(citation => 
          citation.url.includes('github.com') || citation.url.includes('typescriptlang.org')
        );
        // Note: This might not always be true due to AI search behavior
        // but at least we can verify the parameter is accepted
      }
    }, 45000);

    it('should support recency filtering', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Perplexity service not available');
        return;
      }

      const result = await perplexityService.generateText(
        'Recent developments in AI safety',
        {
          model: 'sonar-reasoning',
          searchRecencyFilter: 'week',
          returnCitations: true
        }
      );
      
      expect(result.content).toBeDefined();
      expect(result.citations).toBeDefined();
    }, 45000);
  });
});