// Unit tests for OpenAI Provider - GPT-5 Responses API and GPT-4.1 integration
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { OpenAIProvider } from '../../../../../src/services/ai/providers/OpenAIProvider.js';
import OpenAI from 'openai';

// Mock OpenAI SDK
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const MockedOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;
  let mockClient: jest.Mocked<OpenAI>;

  const mockConfig = {
    provider: 'openai',
    apiKeyEncrypted: 'encrypted-test-key',
    defaultModel: 'gpt-5',
    fallbackModel: 'gpt-4.1',
    monthlyLimit: 100,
    currentUsage: 25,
    active: true,
  };

  // Mock OpenAI client methods
  const mockResponses = {
    create: jest.fn(),
  };

  const mockChat = {
    completions: {
      create: jest.fn(),
    },
  };

  const mockImages = {
    generate: jest.fn(),
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock OpenAI client
    mockClient = {
      responses: mockResponses,
      chat: mockChat,
      images: mockImages,
    } as unknown;

    MockedOpenAI.mockImplementation(() => mockClient);

    // Mock decryptApiKey method
    jest.spyOn(OpenAIProvider.prototype, 'decryptApiKey' as unknown).mockReturnValue('test-api-key');
    
    provider = new OpenAIProvider(mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Provider Initialization', () => {
    it('should initialize with correct configuration', () => {
      expect(provider.provider).toBe('openai');
      expect(provider.config).toEqual(mockConfig);
      expect(MockedOpenAI).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
      });
    });

    it('should have correct model configurations', () => {
      expect(provider.models['gpt-5']).toEqual({
        api: 'responses',
        inputCost: 0.005,
        outputCost: 0.015,
        reasoningCost: 0.06,
        supportsReasoning: true,
        supportsWebSearch: true,
      });

      expect(provider.models['gpt-4.1']).toEqual({
        api: 'chat',
        inputCost: 0.003,
        outputCost: 0.01,
        supportsVision: true,
      });

      expect(provider.models['dall-e-3']).toEqual({
        api: 'images',
        cost: 0.04,
      });
    });

    it('should handle API key decryption', () => {
      expect(provider.decryptApiKey).toHaveBeenCalledWith('encrypted-test-key');
    });
  });

  describe('GPT-5 Responses API Generation', () => {
    beforeEach(() => {
      mockResponses.create.mockResolvedValue({
        id: 'resp_12345',
        choices: [{
          message: {
            content: 'Generated content using GPT-5 Responses API',
            reasoning: 'I analyzed the prompt and determined the best approach...',
          },
          finish_reason: 'stop',
        }],
        usage: {
          prompt_tokens: 150,
          completion_tokens: 800,
          reasoning_tokens: 200,
          total_tokens: 1150,
        },
        model: 'gpt-5',
      });
    });

    it('should generate content using GPT-5 Responses API', async () => {
      const config = {
        task: 'blog_writing_complete',
        prompt: 'Write a blog about AI in healthcare',
        model: 'gpt-5',
        options: {
          temperature: 0.7,
          maxTokens: 2000,
          enableReasoning: true,
          reasoningEffort: 'high',
        },
      };

      const result = await provider.generate(config);

      expect(mockResponses.create).toHaveBeenCalledWith({
        model: 'gpt-5',
        input: [{
          type: 'text',
          text: expect.stringContaining('Write a blog about AI in healthcare'),
        }],
        temperature: 0.7,
        max_completion_tokens: 2000,
        reasoning_effort: 'high',
        include_reasoning: true,
      });

      expect(result.content).toBe('Generated content using GPT-5 Responses API');
      expect(result.reasoning).toBe('I analyzed the prompt and determined the best approach...');
      expect(result.usage).toEqual({
        inputTokens: 150,
        outputTokens: 800,
        reasoningTokens: 200,
        totalTokens: 1150,
        cost: expect.any(Number),
        latencyMs: expect.any(Number),
      });
      expect(result.metadata.finishReason).toBe('stop');
    });

    it('should handle web search in GPT-5', async () => {
      const config = {
        task: 'research',
        prompt: 'Research the latest AI trends in 2025',
        model: 'gpt-5',
        options: {
          enableWebSearch: true,
          searchRecency: 'week',
        },
      };

      await provider.generate(config);

      expect(mockResponses.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-5',
          web_search: {
            enabled: true,
            recency: 'week',
          },
        })
      );
    });

    it('should handle structured outputs with schema', async () => {
      const config = {
        task: 'data_extraction',
        prompt: 'Extract key information from this text',
        model: 'gpt-5',
        options: {
          responseSchema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              summary: { type: 'string' },
              keywords: { type: 'array', items: { type: 'string' } },
            },
            required: ['title', 'summary'],
          },
          strictSchema: true,
        },
      };

      await provider.generate(config);

      expect(mockResponses.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-5',
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'response_schema',
              strict: true,
              schema: config.options.responseSchema,
            },
          },
        })
      );
    });

    it('should calculate costs correctly for GPT-5', async () => {
      const config = {
        task: 'blog_writing_complete',
        prompt: 'Test prompt',
        model: 'gpt-5',
      };

      const result = await provider.generate(config);

      // Cost calculation: (150 * 0.005) + (800 * 0.015) + (200 * 0.06) = 0.75 + 12 + 12 = $24.75 per 1K tokens
      // Actual: (150/1000 * 0.005) + (800/1000 * 0.015) + (200/1000 * 0.06) = $0.0285
      expect(result.usage.cost).toBeCloseTo(0.0285, 4);
    });
  });

  describe('GPT-4.1 Chat Completions Generation', () => {
    beforeEach(() => {
      mockChat.completions.create.mockResolvedValue({
        id: 'chatcmpl_12345',
        choices: [{
          message: {
            content: 'Generated content using GPT-4.1 Chat Completions',
            role: 'assistant',
          },
          finish_reason: 'stop',
        }],
        usage: {
          prompt_tokens: 120,
          completion_tokens: 600,
          total_tokens: 720,
        },
        model: 'gpt-4.1',
      });
    });

    it('should generate content using GPT-4.1 Chat Completions', async () => {
      const config = {
        task: 'conversation',
        prompt: 'Help me with a marketing strategy',
        model: 'gpt-4.1',
        options: {
          temperature: 0.8,
          maxTokens: 1500,
        },
      };

      const result = await provider.generate(config);

      expect(mockChat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4.1',
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('AI assistant'),
          },
          {
            role: 'user',
            content: 'Help me with a marketing strategy',
          },
        ],
        temperature: 0.8,
        max_tokens: 1500,
      });

      expect(result.content).toBe('Generated content using GPT-4.1 Chat Completions');
      expect(result.usage.totalTokens).toBe(720);
    });

    it('should handle vision inputs with GPT-4.1', async () => {
      const config = {
        task: 'image_analysis',
        prompt: 'Describe this image',
        model: 'gpt-4.1',
        options: {
          images: ['https://example.com/image.jpg'],
        },
      };

      await provider.generate(config);

      expect(mockChat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4.1',
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: [
                { type: 'text', text: 'Describe this image' },
                { 
                  type: 'image_url', 
                  image_url: { url: 'https://example.com/image.jpg' }
                },
              ],
            }),
          ]),
        })
      );
    });

    it('should handle conversation history', async () => {
      const config = {
        task: 'conversation',
        prompt: 'Continue our discussion',
        model: 'gpt-4.1',
        options: {
          conversationHistory: [
            { role: 'user', content: 'What is AI?' },
            { role: 'assistant', content: 'AI stands for Artificial Intelligence...' },
          ],
        },
      };

      await provider.generate(config);

      expect(mockChat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            { role: 'user', content: 'What is AI?' },
            { role: 'assistant', content: 'AI stands for Artificial Intelligence...' },
            { role: 'user', content: 'Continue our discussion' },
          ]),
        })
      );
    });
  });

  describe('DALL-E 3 Image Generation', () => {
    beforeEach(() => {
      mockImages.generate.mockResolvedValue({
        data: [{
          url: 'https://example.com/generated-image.png',
          revised_prompt: 'A modern office space with AI technology, professional lighting',
        }],
      });
    });

    it('should generate images using DALL-E 3', async () => {
      const config = {
        task: 'image_generation',
        prompt: 'A modern office with AI technology',
        model: 'dall-e-3',
        options: {
          size: '1024x1024',
          quality: 'hd',
          style: 'vivid',
        },
      };

      const result = await provider.generate(config);

      expect(mockImages.generate).toHaveBeenCalledWith({
        model: 'dall-e-3',
        prompt: 'A modern office with AI technology',
        size: '1024x1024',
        quality: 'hd',
        style: 'vivid',
        n: 1,
      });

      expect(result.images).toEqual([{
        url: 'https://example.com/generated-image.png',
        revisedPrompt: 'A modern office space with AI technology, professional lighting',
      }]);
      expect(result.usage.cost).toBe(0.04); // $0.04 per 1024x1024 image
    });

    it('should handle multiple image generation', async () => {
      mockImages.generate.mockResolvedValue({
        data: [
          { url: 'https://example.com/image1.png', revised_prompt: 'Revised prompt 1' },
          { url: 'https://example.com/image2.png', revised_prompt: 'Revised prompt 2' },
        ],
      });

      const config = {
        task: 'image_generation',
        prompt: 'Business concept illustrations',
        model: 'dall-e-3',
        options: {
          count: 2,
        },
      };

      const result = await provider.generate(config);

      expect(result.images).toHaveLength(2);
      expect(result.usage.cost).toBe(0.08); // $0.04 * 2 images
    });
  });

  describe('Streaming Generation', () => {
    it('should support streaming for chat completions', async () => {
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { choices: [{ delta: { content: 'Hello' } }] };
          yield { choices: [{ delta: { content: ' world' } }] };
          yield { choices: [{ delta: { content: '!' } }] };
          yield { choices: [{ finish_reason: 'stop' }], usage: { total_tokens: 10 } };
        },
      };

      mockChat.completions.create.mockResolvedValue(mockStream);

      const config = {
        task: 'chat',
        prompt: 'Say hello',
        model: 'gpt-4.1',
        options: { stream: true },
      };

      const stream = provider.generateStream(config);
      const chunks: unknown[] = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(4);
      expect(chunks[0]).toEqual({ chunk: 'Hello', type: 'content' });
      expect(chunks[1]).toEqual({ chunk: ' world', type: 'content' });
      expect(chunks[2]).toEqual({ chunk: '!', type: 'content' });
      expect(chunks[3]).toEqual({ 
        chunk: '', 
        type: 'complete', 
        usage: { totalTokens: 10 } 
      });
    });

    it('should handle streaming errors gracefully', async () => {
      mockChat.completions.create.mockRejectedValue(new Error('Stream error'));

      const config = {
        task: 'chat',
        prompt: 'Test streaming error',
        model: 'gpt-4.1',
        options: { stream: true },
      };

      const stream = provider.generateStream(config);
      const chunks: unknown[] = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toEqual({ 
        chunk: '', 
        type: 'error', 
        error: 'Stream error' 
      });
    });
  });

  describe('Error Handling and Retries', () => {
    it('should handle API rate limiting with exponential backoff', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.status = 429;

      mockResponses.create
        .mockRejectedValueOnce(rateLimitError)
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce({
          choices: [{ message: { content: 'Success after retries' } }],
          usage: { total_tokens: 100 },
        });

      jest.spyOn(provider, 'executeWithRetry' as unknown).mockImplementation(async (fn) => {
        // Simulate retry logic
        try {
          return await fn();
        } catch (error) {
          if (error.status === 429) {
            // Wait and retry
            await new Promise(resolve => setTimeout(resolve, 10));
            return await fn();
          }
          throw error;
        }
      });

      const config = {
        task: 'test',
        prompt: 'Test rate limiting',
        model: 'gpt-5',
      };

      const result = await provider.generate(config);
      
      expect(result.content).toBe('Success after retries');
      expect(mockResponses.create).toHaveBeenCalledTimes(3);
    });

    it('should handle invalid model errors', async () => {
      const config = {
        task: 'test',
        prompt: 'Test invalid model',
        model: 'invalid-model',
      };

      await expect(provider.generate(config))
        .rejects.toThrow('Model invalid-model not supported');
    });

    it('should handle API authentication errors', async () => {
      const authError = new Error('Invalid API key');
      authError.status = 401;

      mockResponses.create.mockRejectedValueOnce(authError);

      const config = {
        task: 'test',
        prompt: 'Test auth error',
        model: 'gpt-5',
      };

      await expect(provider.generate(config)).rejects.toThrow('Invalid API key');
    });

    it('should handle network connectivity issues', async () => {
      const networkError = new Error('Network timeout');
      networkError.code = 'ECONNRESET';

      mockResponses.create.mockRejectedValueOnce(networkError);

      const config = {
        task: 'test',
        prompt: 'Test network error',
        model: 'gpt-5',
        options: { maxRetries: 0 }, // No retries for this test
      };

      await expect(provider.generate(config)).rejects.toThrow('Network timeout');
    });
  });

  describe('Provider Testing and Health Checks', () => {
    it('should test connection successfully', async () => {
      mockResponses.create.mockResolvedValueOnce({
        choices: [{ message: { content: 'Test successful' } }],
        usage: { total_tokens: 10 },
        model: 'gpt-5',
      });

      const result = await provider.testConnection();

      expect(result.success).toBe(true);
      expect(result.model).toBe('gpt-5');
      expect(result.latencyMs).toBeGreaterThan(0);
      expect(mockResponses.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-5',
          input: [{ type: 'text', text: 'Test connection. Respond with "OK".' }],
          max_completion_tokens: 10,
        })
      );
    });

    it('should handle connection test failures', async () => {
      mockResponses.create.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await provider.testConnection();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection failed');
    });
  });

  describe('Usage Tracking and Cost Calculation', () => {
    it('should track token usage accurately', async () => {
      mockResponses.create.mockResolvedValue({
        choices: [{ message: { content: 'Test content' } }],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 200,
          reasoning_tokens: 50,
          total_tokens: 350,
        },
        model: 'gpt-5',
      });

      const config = {
        task: 'test',
        prompt: 'Test usage tracking',
        model: 'gpt-5',
      };

      const result = await provider.generate(config);

      expect(result.usage).toEqual({
        inputTokens: 100,
        outputTokens: 200,
        reasoningTokens: 50,
        totalTokens: 350,
        cost: expect.any(Number),
        latencyMs: expect.any(Number),
      });
    });

    it('should calculate costs correctly for different models', () => {
      const testCases = [
        {
          model: 'gpt-5',
          usage: { prompt_tokens: 1000, completion_tokens: 2000, reasoning_tokens: 500 },
          expectedCost: (1000/1000 * 0.005) + (2000/1000 * 0.015) + (500/1000 * 0.06), // $0.065
        },
        {
          model: 'gpt-4.1',
          usage: { prompt_tokens: 1000, completion_tokens: 2000 },
          expectedCost: (1000/1000 * 0.003) + (2000/1000 * 0.01), // $0.023
        },
        {
          model: 'o1',
          usage: { prompt_tokens: 1000, completion_tokens: 2000, reasoning_tokens: 1000 },
          expectedCost: (1000/1000 * 0.015) + (2000/1000 * 0.06) + (1000/1000 * 0.06), // $0.195
        },
      ];

      testCases.forEach(({ model, usage, expectedCost }) => {
        const cost = provider.calculateCost(usage, model);
        expect(cost).toBeCloseTo(expectedCost, 6);
      });
    });
  });

  describe('Advanced Features', () => {
    it('should handle prompt caching', async () => {
      const config = {
        task: 'cached_generation',
        prompt: 'Long context prompt that should be cached',
        model: 'gpt-5',
        options: {
          enableCaching: true,
          cacheBreakpoint: 1000,
        },
      };

      await provider.generate(config);

      expect(mockResponses.create).toHaveBeenCalledWith(
        expect.objectContaining({
          cached_content: expect.objectContaining({
            enabled: true,
            breakpoint: 1000,
          }),
        })
      );
    });

    it('should handle function/tool calling', async () => {
      mockResponses.create.mockResolvedValue({
        choices: [{
          message: {
            content: 'I need to call a function',
            tool_calls: [{
              id: 'call_123',
              type: 'function',
              function: {
                name: 'search_knowledge_base',
                arguments: '{"query": "AI trends"}',
              },
            }],
          },
          finish_reason: 'tool_calls',
        }],
        usage: { total_tokens: 150 },
      });

      const config = {
        task: 'function_calling',
        prompt: 'Search for information about AI trends',
        model: 'gpt-5',
        options: {
          tools: [{
            type: 'function',
            function: {
              name: 'search_knowledge_base',
              description: 'Search the knowledge base',
              parameters: {
                type: 'object',
                properties: {
                  query: { type: 'string', description: 'Search query' },
                },
                required: ['query'],
              },
            },
          }],
        },
      };

      const result = await provider.generate(config);

      expect(result.metadata.toolCalls).toEqual([{
        id: 'call_123',
        type: 'function',
        function: {
          name: 'search_knowledge_base',
          arguments: '{"query": "AI trends"}',
        },
      }]);
      expect(result.metadata.finishReason).toBe('tool_calls');
    });
  });
});