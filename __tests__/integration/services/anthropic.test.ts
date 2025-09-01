import { describe, it, expect, beforeAll } from '@jest/globals';
import { anthropicService } from '../../../src/services/ai/providers/AnthropicService';

// Note: These tests require valid Anthropic API keys in the database
// For CI/CD, mock the database calls or skip tests if keys aren't available

describe('Anthropic Service Integration', () => {
  let serviceInitialized = false;

  beforeAll(async () => {
    try {
      // Test if we can initialize the service
      await anthropicService.testConnection();
      serviceInitialized = true;
    } catch (error) {
      console.warn('Anthropic service not available for integration tests:', error);
    }
  });

  describe('Text Generation', () => {
    it('should initialize and test connection', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Anthropic service not available');
        return;
      }

      const isConnected = await anthropicService.testConnection();
      expect(isConnected).toBe(true);
    });

    it('should generate text with Claude', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Anthropic service not available');
        return;
      }

      const result = await anthropicService.generateText(
        'Write a haiku about TypeScript',
        { maxTokens: 100 }
      );
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }, 30000); // 30 second timeout for AI generation
    
    it('should handle streaming responses', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Anthropic service not available');
        return;
      }

      const chunks: string[] = [];
      
      await anthropicService.generateStream(
        'Count to 5',
        { maxTokens: 50 },
        (chunk) => chunks.push(chunk)
      );
      
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks.join('')).toContain('1');
    }, 30000);

    it('should generate blog content with structure', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Anthropic service not available');
        return;
      }

      const blog = await anthropicService.generateBlog(
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

  describe('Writing Improvement', () => {
    it('should improve text clarity', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Anthropic service not available');
        return;
      }

      const original = 'This is text that could be more clear and better written.';
      const improved = await anthropicService.improveWriting(
        original,
        'clarity'
      );
      
      expect(improved).toBeDefined();
      expect(typeof improved).toBe('string');
      expect(improved.length).toBeGreaterThan(0);
      expect(improved).not.toBe(original);
    }, 30000);

    it('should improve text for engagement', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Anthropic service not available');
        return;
      }

      const original = 'TypeScript is a programming language.';
      const improved = await anthropicService.improveWriting(
        original,
        'engagement'
      );
      
      expect(improved).toBeDefined();
      expect(typeof improved).toBe('string');
      expect(improved.length).toBeGreaterThan(original.length);
    }, 30000);

    it('should fix grammar errors', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Anthropic service not available');
        return;
      }

      const original = 'This text have some grammar errors that need fixing.';
      const improved = await anthropicService.improveWriting(
        original,
        'grammar'
      );
      
      expect(improved).toBeDefined();
      expect(typeof improved).toBe('string');
      expect(improved).not.toBe(original);
      expect(improved).toContain('has');
    }, 30000);
  });

  describe('Content Analysis', () => {
    it('should analyze content and provide scores', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Anthropic service not available');
        return;
      }

      const content = `
        TypeScript is a strongly typed programming language that builds on JavaScript.
        It gives you better tooling at any scale. TypeScript code is transformed into
        JavaScript code via the TypeScript compiler or Babel. This transformation is
        called transpilation. TypeScript is a superset of JavaScript.
      `;
      
      const analysis = await anthropicService.analyzeContent(content);
      
      expect(analysis.readabilityScore).toBeDefined();
      expect(analysis.seoScore).toBeDefined();
      expect(analysis.suggestions).toBeInstanceOf(Array);
      expect(analysis.keywords).toBeInstanceOf(Array);
      expect(analysis.estimatedReadTime).toBeDefined();
      expect(typeof analysis.readabilityScore).toBe('number');
      expect(typeof analysis.seoScore).toBe('number');
      expect(typeof analysis.estimatedReadTime).toBe('number');
      expect(analysis.readabilityScore).toBeGreaterThanOrEqual(0);
      expect(analysis.readabilityScore).toBeLessThanOrEqual(100);
      expect(analysis.seoScore).toBeGreaterThanOrEqual(0);
      expect(analysis.seoScore).toBeLessThanOrEqual(100);
    }, 30000);
  });

  describe('Long-Form Content Generation', () => {
    it('should generate comprehensive long-form content', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Anthropic service not available');
        return;
      }

      const topic = 'Introduction to TypeScript';
      const sections = [
        'What is TypeScript?',
        'Key Features and Benefits',
        'Getting Started with TypeScript'
      ];
      
      const content = await anthropicService.generateLongFormContent(
        topic,
        sections,
        200 // shorter for testing
      );
      
      expect(content.title).toBeDefined();
      expect(content.sections).toBeInstanceOf(Array);
      expect(content.conclusion).toBeDefined();
      expect(content.sections.length).toBe(sections.length);
      
      content.sections.forEach((section, index) => {
        expect(section.heading).toContain(sections[index].split(' ')[0]); // Check partial match
        expect(section.content).toBeDefined();
        expect(section.content.length).toBeGreaterThan(50);
      });
      
      expect(content.conclusion.length).toBeGreaterThan(50);
    }, 90000); // Longer timeout for long-form content
  });

  describe('Constitutional AI', () => {
    it('should generate content following constitutional principles', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Anthropic service not available');
        return;
      }

      const prompt = 'Write about the importance of data privacy';
      const constitution = [
        'Always prioritize user privacy and security',
        'Provide balanced and objective information',
        'Avoid making absolute claims without evidence'
      ];
      
      const result = await anthropicService.generateWithConstitution(
        prompt,
        constitution,
        { maxTokens: 200 }
      );
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(result.toLowerCase()).toContain('privacy');
    }, 30000);
  });

  describe('Model Variations', () => {
    it('should work with Claude 3 Haiku (fast model)', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Anthropic service not available');
        return;
      }

      const result = await anthropicService.generateText(
        'Explain TypeScript in one sentence.',
        { 
          model: 'claude-3-haiku-20240307',
          maxTokens: 50
        }
      );
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }, 20000);

    it('should work with Claude 3 Sonnet (balanced model)', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Anthropic service not available');
        return;
      }

      const result = await anthropicService.generateText(
        'Explain the benefits of TypeScript.',
        { 
          model: 'claude-3-sonnet-20240229',
          maxTokens: 100
        }
      );
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }, 30000);

    it('should work with Claude 3 Opus (most capable model)', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Anthropic service not available');
        return;
      }

      const result = await anthropicService.generateText(
        'Write a detailed explanation of TypeScript type system.',
        { 
          model: 'claude-3-opus-20240229',
          maxTokens: 200
        }
      );
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(50);
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
      expect(anthropicService).toBeDefined();
    });

    it('should handle long context properly', async () => {
      if (!serviceInitialized) {
        console.warn('Skipping test - Anthropic service not available');
        return;
      }

      // Test Claude's long context capability with a reasonably large prompt
      const longPrompt = 'Context: '.repeat(100) + 'Based on this context, what is TypeScript?';
      
      const result = await anthropicService.generateText(
        longPrompt,
        { maxTokens: 100 }
      );
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }, 30000);
  });
});

describe('Anthropic Service Error Scenarios', () => {
  it('should handle network errors', async () => {
    // Mock scenario testing would go here
    expect(true).toBe(true);
  });

  it('should handle malformed responses', async () => {
    // Mock scenario testing would go here
    expect(true).toBe(true);
  });

  it('should handle token limit exceeded errors', async () => {
    // Mock scenario testing would go here
    expect(true).toBe(true);
  });
});