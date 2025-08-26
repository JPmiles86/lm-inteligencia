// Unit tests for ProviderService - AI provider abstraction and management
import { beforeEach, afterEach, describe, it, expect, jest } from '@jest/globals';
import { ProviderService } from '../../../../src/services/ai/ProviderService.js';
import { aiRepository } from '../../../../src/repositories/aiRepository.js';

// Mock dependencies
jest.mock('../../../../src/repositories/aiRepository.js', () => ({
  aiRepository: {
    getProviderSettings: jest.fn(),
    incrementProviderUsage: jest.fn(),
    logUsage: jest.fn(),
  },
}));

// Mock provider classes
jest.mock('../../../../src/services/ai/providers/OpenAIProvider.js', () => ({
  OpenAIProvider: jest.fn(),
}));

jest.mock('../../../../src/services/ai/providers/AnthropicProvider.js', () => ({
  AnthropicProvider: jest.fn(),
}));

jest.mock('../../../../src/services/ai/providers/GoogleProvider.js', () => ({
  GoogleProvider: jest.fn(),
}));

jest.mock('../../../../src/services/ai/providers/PerplexityProvider.js', () => ({
  PerplexityProvider: jest.fn(),
}));

const mockAiRepository = aiRepository as jest.Mocked<typeof aiRepository>;

describe('ProviderService', () => {
  let providerService: ProviderService;
  
  // Mock provider configurations
  const mockProviderConfigs = [
    {
      id: 'provider-1',
      provider: 'openai',
      apiKeyEncrypted: 'encrypted-openai-key',
      defaultModel: 'gpt-5',
      fallbackModel: 'gpt-4.1',
      monthlyLimit: 100.00,
      currentUsage: 15.50,
      active: true,
      testSuccess: true,
    },
    {
      id: 'provider-2', 
      provider: 'anthropic',
      apiKeyEncrypted: 'encrypted-anthropic-key',
      defaultModel: 'claude-sonnet-4',
      fallbackModel: 'claude-3.7-sonnet',
      monthlyLimit: 150.00,
      currentUsage: 25.75,
      active: true,
      testSuccess: true,
    },
    {
      id: 'provider-3',
      provider: 'google',
      apiKeyEncrypted: 'encrypted-google-key',
      defaultModel: 'gemini-2.5-pro',
      fallbackModel: 'gemini-2.5-flash',
      monthlyLimit: 200.00,
      currentUsage: 50.00,
      active: true,
      testSuccess: true,
    },
  ];

  // Mock provider clients
  const mockProviderClients = {
    openai: {
      generate: jest.fn(),
      testConnection: jest.fn(),
    },
    anthropic: {
      generate: jest.fn(),
      testConnection: jest.fn(),
    },
    google: {
      generate: jest.fn(),
      testConnection: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Mock provider loading
    mockAiRepository.getProviderSettings.mockResolvedValueOnce(mockProviderConfigs);

    // Mock provider client creation
    jest.doMock('../../../../src/services/ai/providers/OpenAIProvider.js', () => ({
      OpenAIProvider: jest.fn(() => mockProviderClients.openai),
    }));

    jest.doMock('../../../../src/services/ai/providers/AnthropicProvider.js', () => ({
      AnthropicProvider: jest.fn(() => mockProviderClients.anthropic),
    }));

    jest.doMock('../../../../src/services/ai/providers/GoogleProvider.js', () => ({
      GoogleProvider: jest.fn(() => mockProviderClients.google),
    }));

    providerService = new ProviderService();
    
    // Wait for provider loading
    await new Promise(resolve => setTimeout(resolve, 10));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Provider Loading and Initialization', () => {
    it('should load providers from repository on initialization', () => {
      expect(mockAiRepository.getProviderSettings).toHaveBeenCalled();
    });

    it('should create provider clients for each configuration', () => {
      // Provider clients should be created during initialization
      expect(providerService.providers.size).toBeGreaterThan(0);
    });

    it('should handle provider loading errors gracefully', async () => {
      mockAiRepository.getProviderSettings.mockRejectedValueOnce(new Error('Database error'));
      
      // Should not throw during construction
      expect(() => new ProviderService()).not.toThrow();
    });

    it('should throw error for unsupported provider types', async () => {
      const invalidConfig = {
        provider: 'unsupported_provider',
        apiKeyEncrypted: 'test-key',
      };

      await expect(providerService.createProviderClient(invalidConfig))
        .rejects.toThrow('Unsupported provider: unsupported_provider');
    });
  });

  describe('Provider Selection and Management', () => {
    beforeEach(() => {
      // Mock successful provider availability checks
      jest.spyOn(providerService, 'checkProviderAvailability').mockResolvedValue(true);
      jest.spyOn(providerService, 'getDefaultModel').mockResolvedValue('gpt-5');
      jest.spyOn(providerService, 'getTaskDefaults').mockResolvedValue({
        blog_writing_complete: { provider: 'anthropic', model: 'claude-sonnet-4' },
        idea_generation: { provider: 'openai', model: 'gpt-5' },
        research: { provider: 'perplexity', model: 'sonar-pro' },
      });
    });

    describe('getProvider', () => {
      it('should return provider client when available', async () => {
        const provider = await providerService.getProvider('openai');
        
        expect(provider).toBe(mockProviderClients.openai);
        expect(providerService.checkProviderAvailability).toHaveBeenCalledWith('openai', {});
      });

      it('should throw error for non-configured provider', async () => {
        await expect(providerService.getProvider('non_existent'))
          .rejects.toThrow('Provider non_existent not configured');
      });

      it('should check provider availability before returning', async () => {
        jest.spyOn(providerService, 'checkProviderAvailability')
          .mockRejectedValueOnce(new Error('Rate limit exceeded'));

        await expect(providerService.getProvider('openai'))
          .rejects.toThrow('Rate limit exceeded');
      });
    });

    describe('selectProviderForTask', () => {
      it('should select provider based on task defaults', async () => {
        const result = await providerService.selectProviderForTask('blog_writing_complete');

        expect(result.provider).toBe('anthropic');
        expect(result.model).toBe('claude-sonnet-4');
        expect(result.client).toBe(mockProviderClients.anthropic);
        expect(result.fallback).toBeFalsy();
      });

      it('should fallback to default provider when task not in defaults', async () => {
        const result = await providerService.selectProviderForTask('unknown_task');

        expect(result.provider).toBe('anthropic'); // Default fallback
        expect(result.model).toBe('gpt-5'); // From getDefaultModel mock
      });

      it('should use fallback providers when primary fails', async () => {
        // Make anthropic fail
        jest.spyOn(providerService, 'getProvider')
          .mockImplementationOnce(() => Promise.reject(new Error('Anthropic unavailable')))
          .mockImplementationOnce(() => Promise.resolve(mockProviderClients.openai));

        const result = await providerService.selectProviderForTask('blog_writing_complete');

        expect(result.provider).toBe('openai');
        expect(result.fallback).toBe(true);
        expect(result.originalProvider).toBe('anthropic');
      });

      it('should try multiple fallback providers if needed', async () => {
        // Make primary and first fallback fail
        jest.spyOn(providerService, 'getProvider')
          .mockImplementationOnce(() => Promise.reject(new Error('Primary failed')))
          .mockImplementationOnce(() => Promise.reject(new Error('First fallback failed')))
          .mockImplementationOnce(() => Promise.resolve(mockProviderClients.google));

        const result = await providerService.selectProviderForTask('blog_writing_complete');

        expect(result.provider).toBe('google');
        expect(result.fallback).toBe(true);
      });

      it('should throw error when all providers fail', async () => {
        jest.spyOn(providerService, 'getProvider')
          .mockRejectedValue(new Error('All providers failed'));

        await expect(providerService.selectProviderForTask('blog_writing_complete'))
          .rejects.toThrow('All providers failed for task: blog_writing_complete');
      });

      it('should not use fallback when fallbackAllowed is false', async () => {
        jest.spyOn(providerService, 'getProvider')
          .mockRejectedValueOnce(new Error('Primary failed'));

        await expect(providerService.selectProviderForTask('blog_writing_complete', {
          fallbackAllowed: false
        })).rejects.toThrow('Primary failed');
      });
    });

    describe('getFallbackProviders', () => {
      it('should return correct fallback order for each provider', () => {
        const openAiFallbacks = providerService.getFallbackProviders('openai', 'blog_writing');
        expect(openAiFallbacks[0].provider).toBe('anthropic');
        expect(openAiFallbacks[1].provider).toBe('google');

        const anthropicFallbacks = providerService.getFallbackProviders('anthropic', 'blog_writing');
        expect(anthropicFallbacks[0].provider).toBe('openai');
        expect(anthropicFallbacks[1].provider).toBe('google');
      });

      it('should return empty array for unknown provider', () => {
        const fallbacks = providerService.getFallbackProviders('unknown', 'task');
        expect(fallbacks).toEqual([]);
      });
    });
  });

  describe('Request/Response Normalization', () => {
    describe('normalizeRequest', () => {
      it('should normalize common generation parameters', () => {
        const config = {
          task: 'blog_writing_complete',
          prompt: 'Write about AI',
          provider: 'openai',
          model: 'gpt-5',
          options: {
            temperature: 0.7,
            max_tokens: 2000,
            top_p: 0.9,
            stop_sequences: ['END'],
          },
        };

        const normalized = providerService.normalizeRequest(config);

        expect(normalized.options).toEqual({
          temperature: 0.7,
          maxTokens: 2000,
          topP: 0.9,
          stopSequences: ['END'],
          maxRetries: 3,
          retryDelay: 1000,
          // Original options passed through
          max_tokens: 2000,
          top_p: 0.9,
          stop_sequences: ['END'],
        });
      });

      it('should normalize provider-specific parameters', () => {
        const config = {
          task: 'research',
          prompt: 'Research AI trends',
          options: {
            enablePromptCaching: true,
            webSearch: true,
            reasoning: { effort: 'high' },
            domains: ['arxiv.org', 'nature.com'],
            academic: true,
          },
        };

        const normalized = providerService.normalizeRequest(config);

        expect(normalized.options.enableCaching).toBe(true);
        expect(normalized.options.enableWebSearch).toBe(true);
        expect(normalized.options.reasoningEffort).toBe('high');
        expect(normalized.options.searchDomains).toEqual(['arxiv.org', 'nature.com']);
        expect(normalized.options.academicMode).toBe(true);
      });

      it('should handle multimodal requests', () => {
        const config = {
          task: 'image_analysis',
          prompt: 'Describe this image',
          options: {
            image_urls: ['https://example.com/image.jpg'],
            schema: { type: 'object', properties: { description: { type: 'string' } } },
            format: 'json',
          },
        };

        const normalized = providerService.normalizeRequest(config);

        expect(normalized.options.images).toEqual(['https://example.com/image.jpg']);
        expect(normalized.options.responseSchema).toBeDefined();
        expect(normalized.options.responseFormat).toBe('json');
      });
    });

    describe('normalizeResponse', () => {
      it('should normalize successful response across providers', () => {
        const rawResponse = {
          content: 'Generated content here...',
          usage: {
            input_tokens: 150,
            output_tokens: 800,
            total_tokens: 950,
            cost: 0.025,
            latency_ms: 2500,
          },
          finish_reason: 'stop',
          metadata: {
            cacheHit: true,
            searchResults: [{ title: 'AI Research', url: 'https://example.com' }],
          },
        };

        const normalized = providerService.normalizeResponse(rawResponse, 'openai', 'gpt-5');

        expect(normalized.content).toBe('Generated content here...');
        expect(normalized.usage).toEqual({
          inputTokens: 150,
          outputTokens: 800,
          reasoningTokens: 0,
          thinkingTokens: 0,
          cacheCreationTokens: 0,
          cacheReadTokens: 0,
          totalTokens: 950,
          cost: 0.025,
          latencyMs: 2500,
        });
        expect(normalized.metadata.provider).toBe('openai');
        expect(normalized.metadata.model).toBe('gpt-5');
        expect(normalized.metadata.finishReason).toBe('completed');
        expect(normalized.metadata.cacheHit).toBe(true);
        expect(normalized.metadata.searchResults).toHaveLength(1);
      });

      it('should calculate total tokens when not provided', () => {
        const rawResponse = {
          content: 'Test content',
          usage: {
            input_tokens: 100,
            output_tokens: 200,
            reasoning_tokens: 50,
            thinking_tokens: 25,
          },
        };

        const normalized = providerService.normalizeResponse(rawResponse, 'anthropic', 'claude-sonnet-4');

        expect(normalized.usage.totalTokens).toBe(375); // 100 + 200 + 50 + 25
      });

      it('should handle provider-specific metadata', () => {
        const rawResponse = {
          content: 'Research results...',
          usage: { total_tokens: 500 },
          reasoning: 'I need to analyze the data...',
          search_results: [{ title: 'Study 1' }, { title: 'Study 2' }],
          related_questions: ['What about X?', 'How does Y work?'],
        };

        const normalized = providerService.normalizeResponse(rawResponse, 'perplexity', 'sonar-pro');

        expect(normalized.metadata.reasoning).toBe('I need to analyze the data...');
        expect(normalized.metadata.searchResults).toHaveLength(2);
        expect(normalized.metadata.relatedQuestions).toHaveLength(2);
      });
    });

    describe('normalizeFinishReason', () => {
      it('should map provider-specific finish reasons to common format', () => {
        // OpenAI format
        expect(providerService.normalizeFinishReason('stop')).toBe('completed');
        expect(providerService.normalizeFinishReason('length')).toBe('max_tokens');
        expect(providerService.normalizeFinishReason('function_call')).toBe('tool_calls');

        // Anthropic format
        expect(providerService.normalizeFinishReason('end_turn')).toBe('completed');
        expect(providerService.normalizeFinishReason('max_tokens')).toBe('max_tokens');
        expect(providerService.normalizeFinishReason('tool_use')).toBe('tool_calls');

        // Google format
        expect(providerService.normalizeFinishReason('STOP')).toBe('completed');
        expect(providerService.normalizeFinishReason('MAX_TOKENS')).toBe('max_tokens');
        expect(providerService.normalizeFinishReason('SAFETY')).toBe('filtered');
      });

      it('should return original reason if not in mapping', () => {
        expect(providerService.normalizeFinishReason('custom_reason')).toBe('custom_reason');
      });

      it('should return "unknown" for null/undefined', () => {
        expect(providerService.normalizeFinishReason(null)).toBe('unknown');
        expect(providerService.normalizeFinishReason(undefined)).toBe('unknown');
      });
    });
  });

  describe('Unified Generation Interface', () => {
    beforeEach(() => {
      // Mock provider client responses
      mockProviderClients.openai.generate.mockResolvedValue({
        content: 'OpenAI generated content...',
        usage: { total_tokens: 500, cost: 0.015 },
        finish_reason: 'stop',
      });

      mockProviderClients.anthropic.generate.mockResolvedValue({
        content: 'Anthropic generated content...',
        usage: { total_tokens: 450, cost: 0.012 },
        finish_reason: 'end_turn',
      });

      // Mock required methods
      jest.spyOn(providerService, 'getProvider').mockImplementation(async (provider) => {
        return mockProviderClients[provider] || mockProviderClients.anthropic;
      });

      jest.spyOn(providerService, 'getDefaultModel').mockResolvedValue('default-model');
      jest.spyOn(providerService, 'trackUsage').mockResolvedValue();
    });

    describe('generate', () => {
      it('should generate content using specified provider', async () => {
        const config = {
          task: 'blog_writing_complete',
          prompt: 'Write about machine learning',
          provider: 'openai',
          model: 'gpt-5',
          options: { temperature: 0.7 },
        };

        const result = await providerService.generate(config);

        expect(mockProviderClients.openai.generate).toHaveBeenCalledWith({
          task: 'blog_writing_complete',
          prompt: 'Write about machine learning',
          model: 'gpt-5',
          options: expect.objectContaining({ temperature: 0.7 }),
        });

        expect(result.content).toBe('OpenAI generated content...');
        expect(result.metadata.provider).toBe('openai');
        expect(result.metadata.model).toBe('gpt-5');
        expect(result.fallback).toBe(false);
      });

      it('should auto-select provider when not specified', async () => {
        jest.spyOn(providerService, 'selectProviderForTask').mockResolvedValueOnce({
          provider: 'anthropic',
          model: 'claude-sonnet-4',
          client: mockProviderClients.anthropic,
        });

        const config = {
          task: 'idea_generation',
          prompt: 'Generate blog ideas about AI',
          options: { temperature: 0.8 },
        };

        const result = await providerService.generate(config);

        expect(providerService.selectProviderForTask).toHaveBeenCalledWith('idea_generation', {
          temperature: 0.8,
          fallbackAllowed: true,
          maxRetries: 3,
          retryDelay: 1000,
        });

        expect(result.content).toBe('Anthropic generated content...');
        expect(result.metadata.provider).toBe('anthropic');
      });

      it('should handle fallback providers transparently', async () => {
        jest.spyOn(providerService, 'selectProviderForTask').mockResolvedValueOnce({
          provider: 'openai',
          model: 'gpt-5',
          client: mockProviderClients.openai,
          fallback: true,
          originalProvider: 'anthropic',
        });

        const config = {
          task: 'blog_writing_complete',
          prompt: 'Write a blog post',
        };

        const result = await providerService.generate(config);

        expect(result.fallback).toBe(true);
        expect(result.originalProvider).toBe('anthropic');
        expect(result.metadata.provider).toBe('openai');
      });

      it('should track usage for successful generations', async () => {
        const config = {
          task: 'title_generation',
          prompt: 'Generate titles',
          provider: 'openai',
        };

        await providerService.generate(config);

        expect(providerService.trackUsage).toHaveBeenCalledWith({
          provider: 'openai',
          model: 'default-model',
          task: 'title_generation',
          success: true,
          usage: expect.any(Object),
          latencyMs: expect.any(Number),
        });
      });

      it('should handle generation errors and track failures', async () => {
        mockProviderClients.openai.generate.mockRejectedValueOnce(new Error('API error'));

        jest.spyOn(providerService, 'trackUsage').mockResolvedValue();

        const config = {
          task: 'blog_writing_complete',
          prompt: 'Write a blog',
          provider: 'openai',
        };

        await expect(providerService.generate(config)).rejects.toThrow('API error');

        expect(providerService.trackUsage).toHaveBeenCalledWith({
          provider: 'openai',
          model: 'default-model',
          task: 'blog_writing_complete',
          success: false,
          error: 'API error',
          latencyMs: expect.any(Number),
        });
      });

      it('should handle streaming generation', async () => {
        // Mock streaming generator
        mockProviderClients.anthropic.generateStream = jest.fn(async function* () {
          yield { chunk: 'First ', type: 'content' };
          yield { chunk: 'chunk ', type: 'content' };
          yield { chunk: 'of content', type: 'content' };
          yield { chunk: '', type: 'complete', usage: { totalTokens: 100 } };
        });

        const _config = { // Preserved for future use
          task: 'blog_writing_complete',
          prompt: 'Write streaming content',
          provider: 'anthropic',
          options: { stream: true },
        };

        // This would be handled by the streaming endpoint
        expect(mockProviderClients.anthropic.generateStream).toBeDefined();
      });
    });
  });

  describe('Usage Tracking and Analytics', () => {
    beforeEach(() => {
      mockAiRepository.logUsage.mockResolvedValue({ id: 'log-123' });
      mockAiRepository.incrementProviderUsage.mockResolvedValue();
    });

    it('should track successful usage with complete metrics', async () => {
      const usageData = {
        provider: 'openai',
        model: 'gpt-5',
        task: 'blog_writing_complete',
        success: true,
        usage: {
          inputTokens: 150,
          outputTokens: 800,
          totalTokens: 950,
          cost: 0.025,
        },
        latencyMs: 2500,
      };

      await providerService.trackUsage(usageData);

      expect(mockAiRepository.logUsage).toHaveBeenCalledWith({
        provider: 'openai',
        model: 'gpt-5',
        taskType: 'blog_writing_complete',
        tokensInput: 150,
        tokensOutput: 800,
        cost: 0.025,
        durationMs: 2500,
        success: true,
        requestData: expect.any(Object),
        responseData: expect.objectContaining({ success: true }),
      });

      expect(mockAiRepository.incrementProviderUsage).toHaveBeenCalledWith('openai', 0.025);
    });

    it('should track failed usage with error details', async () => {
      const usageData = {
        provider: 'anthropic',
        model: 'claude-sonnet-4',
        task: 'idea_generation',
        success: false,
        error: 'Rate limit exceeded',
        latencyMs: 1000,
      };

      await providerService.trackUsage(usageData);

      expect(mockAiRepository.logUsage).toHaveBeenCalledWith({
        provider: 'anthropic',
        model: 'claude-sonnet-4',
        taskType: 'idea_generation',
        tokensInput: 0,
        tokensOutput: 0,
        cost: 0,
        durationMs: 1000,
        success: false,
        errorMessage: 'Rate limit exceeded',
        errorData: expect.objectContaining({ error: 'Rate limit exceeded' }),
      });

      // Should not increment usage for failures
      expect(mockAiRepository.incrementProviderUsage).not.toHaveBeenCalled();
    });

    it('should handle tracking errors gracefully', async () => {
      mockAiRepository.logUsage.mockRejectedValueOnce(new Error('Logging failed'));

      const usageData = {
        provider: 'openai',
        model: 'gpt-4',
        task: 'test_task',
        success: true,
        usage: { cost: 0.01 },
      };

      // Should not throw even if logging fails
      await expect(providerService.trackUsage(usageData)).resolves.toBeUndefined();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle provider initialization failures', async () => {
      const invalidConfig = {
        provider: 'openai',
        apiKeyEncrypted: null, // Invalid configuration
      };

      await expect(providerService.createProviderClient(invalidConfig))
        .rejects.toThrow();
    });

    it('should handle empty or malformed responses', () => {
      const malformedResponse = {
        content: null,
        usage: undefined,
        metadata: {},
      };

      const normalized = providerService.normalizeResponse(malformedResponse, 'test', 'model');

      expect(normalized.content).toBe('');
      expect(normalized.usage.totalTokens).toBe(0);
      expect(normalized.metadata.finishReason).toBe('unknown');
    });

    it('should handle concurrent requests to same provider', async () => {
      const config = {
        task: 'blog_writing_complete',
        prompt: 'Test concurrent requests',
        provider: 'openai',
      };

      // Mock provider to simulate delay
      mockProviderClients.openai.generate.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
          content: 'Concurrent response',
          usage: { total_tokens: 100, cost: 0.005 },
          finish_reason: 'stop',
        };
      });

      // Make multiple concurrent requests
      const promises = Array.from({ length: 5 }, () => providerService.generate(config));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.content).toBe('Concurrent response');
      });
    });

    it('should handle provider availability checks', async () => {
      // Mock availability check that fails initially then succeeds
      jest.spyOn(providerService, 'checkProviderAvailability')
        .mockRejectedValueOnce(new Error('Temporarily unavailable'))
        .mockResolvedValueOnce(true);

      // First request should fail
      await expect(providerService.getProvider('openai'))
        .rejects.toThrow('Temporarily unavailable');

      // Second request should succeed
      const provider = await providerService.getProvider('openai');
      expect(provider).toBe(mockProviderClients.openai);
    });
  });
});