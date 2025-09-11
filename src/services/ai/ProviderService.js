// Provider Service - Unified abstraction layer for all AI providers
// Handles provider selection, configuration, fallbacks, and usage tracking

import { aiRepository } from '../../repositories/aiRepository.ts.js';

export class ProviderService {
  constructor() {
    this.providers = new Map();
    this.loadProviders();
  }

  async loadProviders() {
    try {
      const providerConfigs = await aiRepository.getProviderSettings();
      
      for (const config of providerConfigs) {
        this.providers.set(config.provider, {
          ...config,
          client: await this.createProviderClient(config)
        });
      }
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  }

  async createProviderClient(config) {
    // Ensure we have the decrypted API key
    const clientConfig = {
      ...config,
      apiKey: config.apiKeyEncrypted && !config.apiKeyEncrypted.startsWith('[') 
        ? (typeof config.apiKeyEncrypted === 'string' && config.apiKeyEncrypted.length > 0 
          ? await this.decryptApiKey(config.apiKeyEncrypted)
          : config.apiKeyEncrypted)
        : config.apiKey
    };

    switch (config.provider) {
      case 'openai':
        const { OpenAIProvider } = await import('./providers/OpenAIProvider.js');
        return new OpenAIProvider(clientConfig);
      
      case 'anthropic':
        const { AnthropicProvider } = await import('./providers/AnthropicProvider.js');
        return new AnthropicProvider(clientConfig);
      
      case 'google':
        const { GoogleProvider } = await import('./providers/GoogleProvider.js');
        return new GoogleProvider(clientConfig);
      
      case 'perplexity':
        const { PerplexityProvider } = await import('./providers/PerplexityProvider.js');
        return new PerplexityProvider(clientConfig);
      
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  }

  // ================================
  // PROVIDER SELECTION & MANAGEMENT
  // ================================

  async getProvider(providerName, options = {}) {
    const provider = this.providers.get(providerName);
    
    if (!provider) {
      throw new Error(`Provider ${providerName} not configured`);
    }

    // Check if provider is available and within limits
    await this.checkProviderAvailability(providerName, options);
    
    return provider.client;
  }

  async selectProviderForTask(task, options = {}) {
    const { vertical, complexity = 'medium', fallbackAllowed = true } = options;
    
    // Get task-specific provider preferences
    const preferences = await this.getTaskDefaults();
    let selectedProvider = preferences[task]?.provider || 'anthropic';
    
    try {
      // Try primary provider
      const provider = await this.getProvider(selectedProvider, options);
      return {
        provider: selectedProvider,
        model: preferences[task]?.model || await this.getDefaultModel(selectedProvider),
        client: provider
      };
    } catch (error) {
      if (!fallbackAllowed) {
        throw error;
      }
      
      // Try fallback providers
      const fallbacks = this.getFallbackProviders(selectedProvider, task);
      
      for (const fallback of fallbacks) {
        try {
          const provider = await this.getProvider(fallback.provider, options);
          console.warn(`Using fallback provider ${fallback.provider} for task ${task}`);
          
          return {
            provider: fallback.provider,
            model: fallback.model,
            client: provider,
            fallback: true,
            originalProvider: selectedProvider
          };
        } catch (fallbackError) {
          console.error(`Fallback provider ${fallback.provider} also failed:`, fallbackError);
          continue;
        }
      }
      
      throw new Error(`All providers failed for task: ${task}`);
    }
  }

  getFallbackProviders(primaryProvider, task) {
    const fallbackMap = {
      'openai': [
        { provider: 'anthropic', model: 'claude-sonnet-4' },
        { provider: 'google', model: 'gemini-2.5-pro' }
      ],
      'anthropic': [
        { provider: 'openai', model: 'gpt-5' },
        { provider: 'google', model: 'gemini-2.5-pro' }
      ],
      'google': [
        { provider: 'anthropic', model: 'claude-sonnet-4' },
        { provider: 'openai', model: 'gpt-5' }
      ],
      'perplexity': [
        { provider: 'openai', model: 'gpt-5' }, // For research tasks
        { provider: 'anthropic', model: 'claude-sonnet-4' }
      ]
    };
    
    return fallbackMap[primaryProvider] || [];
  }

  // ================================
  // REQUEST/RESPONSE NORMALIZATION
  // ================================

  normalizeRequest(config) {
    const {
      task,
      prompt,
      provider: requestedProvider,
      model: requestedModel,
      options = {},
      fallbackAllowed = true
    } = config;

    // Normalize common options across providers
    const normalizedOptions = {
      // Basic generation parameters
      temperature: options.temperature,
      maxTokens: options.maxTokens || options.max_tokens,
      topP: options.topP || options.top_p,
      topK: options.topK || options.top_k,
      stopSequences: options.stopSequences || options.stop_sequences || options.stop,
      
      // Provider-specific features mapped to common interface
      enableCaching: options.enableCaching || options.enablePromptCaching,
      enableWebSearch: options.enableWebSearch || options.webSearch,
      enableReasoning: options.enableReasoning || options.reasoning,
      reasoningEffort: options.reasoningEffort || options.reasoning?.effort,
      
      // Thinking and verbosity controls
      thinking: options.thinking || options.thinkingConfig,
      verbosity: options.verbosity,
      
      // Structured outputs
      responseSchema: options.responseSchema || options.schema,
      responseFormat: options.responseFormat || options.format,
      strictSchema: options.strictSchema,
      
      // Multimodal support
      images: options.images || options.image_urls,
      
      // Search and research options (mainly for Perplexity)
      searchDomains: options.searchDomains || options.domains,
      searchRecency: options.searchRecency || options.recency,
      academicMode: options.academicMode || options.academic,
      returnRelatedQuestions: options.returnRelatedQuestions,
      
      // Context and conversation
      context: options.context,
      systemInstruction: options.systemInstruction || options.system,
      conversationHistory: options.conversationHistory || options.messages,
      
      // Vertical and task-specific options
      vertical: options.vertical,
      
      // Retry and reliability
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000,
      
      // Pass through any provider-specific options
      ...options
    };

    return {
      task,
      prompt,
      provider: requestedProvider,
      model: requestedModel,
      options: normalizedOptions,
      fallbackAllowed
    };
  }

  normalizeResponse(rawResponse, provider, model) {
    // Normalize the response format across all providers
    const normalized = {
      content: rawResponse.content || '',
      usage: {
        inputTokens: rawResponse.usage?.inputTokens || rawResponse.usage?.input_tokens || 0,
        outputTokens: rawResponse.usage?.outputTokens || rawResponse.usage?.output_tokens || 0,
        reasoningTokens: rawResponse.usage?.reasoningTokens || rawResponse.usage?.reasoning_tokens || 0,
        thinkingTokens: rawResponse.usage?.thinkingTokens || rawResponse.usage?.thinking_tokens || 0,
        cacheCreationTokens: rawResponse.usage?.cacheCreationInputTokens || rawResponse.usage?.cache_creation_input_tokens || 0,
        cacheReadTokens: rawResponse.usage?.cacheReadInputTokens || rawResponse.usage?.cache_read_input_tokens || 0,
        totalTokens: rawResponse.usage?.totalTokens || rawResponse.usage?.total_tokens || 0,
        cost: rawResponse.usage?.cost || 0,
        latencyMs: rawResponse.usage?.latencyMs || rawResponse.usage?.latency_ms || 0
      },
      metadata: {
        provider,
        model,
        finishReason: this.normalizeFinishReason(rawResponse.metadata?.finishReason || rawResponse.finish_reason),
        
        // Provider-specific metadata
        reasoning: rawResponse.metadata?.reasoning || rawResponse.reasoning,
        thinking: rawResponse.metadata?.thinking || rawResponse.thinking,
        searchResults: rawResponse.metadata?.searchResults || rawResponse.search_results || [],
        citations: rawResponse.metadata?.citations || [],
        relatedQuestions: rawResponse.metadata?.relatedQuestions || rawResponse.related_questions || [],
        safetyRatings: rawResponse.metadata?.safetyRatings || rawResponse.safety_ratings,
        
        // Caching information
        cacheHit: rawResponse.metadata?.cacheHit || false,
        cacheCreated: rawResponse.metadata?.cacheCreated || false,
        
        // Tool usage
        toolCalls: rawResponse.metadata?.toolCalls || rawResponse.tool_calls || [],
        functionCall: rawResponse.metadata?.functionCall || rawResponse.function_call,
        
        // Response IDs for conversation continuity
        responseId: rawResponse.metadata?.responseId || rawResponse.id,
        
        // Error information
        errors: rawResponse.metadata?.errors || [],
        warnings: rawResponse.metadata?.warnings || []
      }
    };

    // Calculate total tokens if not provided
    if (!normalized.usage.totalTokens) {
      normalized.usage.totalTokens = 
        normalized.usage.inputTokens + 
        normalized.usage.outputTokens + 
        normalized.usage.reasoningTokens + 
        normalized.usage.thinkingTokens;
    }

    return normalized;
  }

  normalizeFinishReason(finishReason) {
    if (!finishReason) return 'unknown';

    // Map different provider finish reasons to common format
    const reasonMap = {
      // OpenAI
      'stop': 'completed',
      'length': 'max_tokens',
      'function_call': 'tool_calls',
      'tool_calls': 'tool_calls',
      'content_filter': 'filtered',
      
      // Anthropic  
      'end_turn': 'completed',
      'max_tokens': 'max_tokens',
      'stop_sequence': 'stop_sequence',
      'tool_use': 'tool_calls',
      
      // Google
      'STOP': 'completed',
      'MAX_TOKENS': 'max_tokens',
      'SAFETY': 'filtered',
      'RECITATION': 'filtered',
      
      // Perplexity (uses OpenAI format)
      'incomplete': 'incomplete'
    };

    return reasonMap[finishReason.toLowerCase()] || finishReason;
  }

  // ================================
  // UNIFIED GENERATION INTERFACE
  // ================================

  async generate(config) {
    const normalizedConfig = this.normalizeRequest(config);
    const {
      task,
      prompt,
      provider: requestedProvider,
      model: requestedModel,
      options,
      fallbackAllowed
    } = normalizedConfig;

    const startTime = Date.now();
    let result;
    let selectedProvider;

    try {
      // Select provider and model
      if (requestedProvider) {
        const provider = await this.getProvider(requestedProvider, options);
        selectedProvider = {
          provider: requestedProvider,
          model: requestedModel || await this.getDefaultModel(requestedProvider),
          client: provider
        };
      } else {
        selectedProvider = await this.selectProviderForTask(task, {
          ...options,
          fallbackAllowed
        });
      }

      // Generate content using selected provider
      const rawResult = await selectedProvider.client.generate({
        task,
        prompt,
        model: selectedProvider.model,
        options
      });

      // Normalize the response
      result = this.normalizeResponse(rawResult, selectedProvider.provider, selectedProvider.model);
      result.fallback = selectedProvider.fallback || false;
      result.originalProvider = selectedProvider.originalProvider;

      // Track successful usage
      await this.trackUsage({
        provider: selectedProvider.provider,
        model: selectedProvider.model,
        task,
        success: true,
        tokensInput: result.usage.inputTokens,
        tokensOutput: result.usage.outputTokens,
        tokensUsed: result.usage.totalTokens,
        cost: result.usage.cost,
        latencyMs: Date.now() - startTime,
        vertical: options.vertical,
        mode: options.mode
      });

      return result;

    } catch (error) {
      // Normalize error
      const normalizedError = this.normalizeError(error, selectedProvider?.provider);
      
      // Track failed usage
      await this.trackUsage({
        provider: selectedProvider?.provider || requestedProvider || 'unknown',
        model: selectedProvider?.model || requestedModel || 'unknown',
        task,
        success: false,
        error: normalizedError.message,
        latencyMs: Date.now() - startTime,
        vertical: options.vertical,
        mode: options.mode
      });

      throw normalizedError;
    }
  }

  normalizeError(error, provider) {
    // Create a normalized error with consistent properties
    const normalizedError = new Error(error.message);
    normalizedError.provider = provider;
    normalizedError.originalError = error;
    
    // Normalize error types
    if (error.message.includes('rate limit') || error.message.includes('429')) {
      normalizedError.type = 'rate_limit';
      normalizedError.retryable = true;
    } else if (error.message.includes('authentication') || error.message.includes('401')) {
      normalizedError.type = 'authentication';
      normalizedError.retryable = false;
    } else if (error.message.includes('quota') || error.message.includes('insufficient_quota')) {
      normalizedError.type = 'quota_exceeded';
      normalizedError.retryable = false;
    } else if (error.message.includes('content') && error.message.includes('blocked')) {
      normalizedError.type = 'content_filtered';
      normalizedError.retryable = false;
    } else if (error.message.includes('timeout') || error.message.includes('504')) {
      normalizedError.type = 'timeout';
      normalizedError.retryable = true;
    } else if (error.message.includes('server') || /50[0-9]/.test(error.message)) {
      normalizedError.type = 'server_error';
      normalizedError.retryable = true;
    } else if (error.message.includes('model') && error.message.includes('not')) {
      normalizedError.type = 'model_not_found';
      normalizedError.retryable = false;
    } else {
      normalizedError.type = 'unknown';
      normalizedError.retryable = false;
    }

    return normalizedError;
  }

  // ================================
  // STREAMING INTERFACE
  // ================================

  async generateStream(config, responseStream) {
    const normalizedConfig = this.normalizeRequest(config);
    const { task, prompt, provider: requestedProvider, options } = normalizedConfig;
    
    let selectedProvider;
    let totalUsage = {
      inputTokens: 0,
      outputTokens: 0,
      reasoningTokens: 0,
      thinkingTokens: 0,
      totalTokens: 0,
      cost: 0
    };
    
    try {
      // Select provider
      if (requestedProvider) {
        const provider = await this.getProvider(requestedProvider, options);
        selectedProvider = {
          provider: requestedProvider,
          model: options.model || await this.getDefaultModel(requestedProvider),
          client: provider
        };
      } else {
        selectedProvider = await this.selectProviderForTask(task, options);
      }

      // Check if provider supports streaming
      if (!selectedProvider.client.supportsStreaming()) {
        throw new Error(`Provider ${selectedProvider.provider} does not support streaming`);
      }

      // Start streaming generation
      const stream = selectedProvider.client.generateStream({
        task,
        prompt,
        model: selectedProvider.model,
        options
      });

      // Process and normalize stream chunks
      for await (const chunk of stream) {
        const normalizedChunk = this.normalizeStreamChunk(chunk, selectedProvider.provider);
        
        if (normalizedChunk.type === 'content' && normalizedChunk.content) {
          responseStream.write(`data: ${JSON.stringify(normalizedChunk)}\n\n`);
        }
        
        if (normalizedChunk.type === 'completion') {
          // Accumulate final usage
          totalUsage = {
            inputTokens: normalizedChunk.usage?.inputTokens || 0,
            outputTokens: normalizedChunk.usage?.outputTokens || 0,
            reasoningTokens: normalizedChunk.usage?.reasoningTokens || 0,
            thinkingTokens: normalizedChunk.usage?.thinkingTokens || 0,
            totalTokens: normalizedChunk.usage?.totalTokens || 0,
            cost: normalizedChunk.usage?.cost || 0
          };
          
          // Send normalized completion event
          const completionChunk = {
            type: 'completion',
            provider: selectedProvider.provider,
            model: selectedProvider.model,
            fallback: selectedProvider.fallback || false,
            usage: totalUsage,
            metadata: normalizedChunk.metadata || {}
          };
          
          responseStream.write(`data: ${JSON.stringify(completionChunk)}\n\n`);
        }
      }

      // Track usage
      await this.trackUsage({
        provider: selectedProvider.provider,
        model: selectedProvider.model,
        task,
        success: true,
        tokensInput: totalUsage.inputTokens,
        tokensOutput: totalUsage.outputTokens,
        tokensUsed: totalUsage.totalTokens,
        cost: totalUsage.cost,
        streaming: true,
        vertical: options.vertical,
        mode: options.mode
      });

    } catch (error) {
      const normalizedError = this.normalizeError(error, selectedProvider?.provider);
      
      responseStream.write(`data: ${JSON.stringify({ 
        type: 'error', 
        error: normalizedError.message,
        errorType: normalizedError.type,
        retryable: normalizedError.retryable,
        provider: selectedProvider?.provider || 'unknown'
      })}\n\n`);
      
      await this.trackUsage({
        provider: selectedProvider?.provider || 'unknown',
        model: selectedProvider?.model || 'unknown', 
        task,
        success: false,
        error: normalizedError.message,
        streaming: true,
        vertical: options.vertical,
        mode: options.mode
      });
    }
  }

  normalizeStreamChunk(chunk, provider) {
    // Normalize streaming chunks from different providers
    const normalized = {
      type: chunk.type,
      timestamp: Date.now()
    };

    switch (chunk.type) {
      case 'content':
        normalized.content = chunk.content || chunk.delta?.content || chunk.text || '';
        normalized.usage = chunk.usage ? this.normalizeUsage(chunk.usage) : undefined;
        break;

      case 'completion':
        normalized.usage = this.normalizeUsage(chunk.usage);
        normalized.metadata = {
          searchResults: chunk.searchResults || chunk.search_results || [],
          citations: chunk.citations || [],
          relatedQuestions: chunk.relatedQuestions || chunk.related_questions || [],
          cacheHit: chunk.cacheHit || false,
          finishReason: this.normalizeFinishReason(chunk.finishReason || chunk.finish_reason)
        };
        break;

      case 'reasoning':
      case 'thinking':
        normalized.content = chunk.reasoning || chunk.thinking || chunk.content || '';
        break;

      case 'error':
        normalized.error = chunk.error;
        normalized.errorType = chunk.errorType;
        break;

      default:
        // Pass through unknown chunk types
        normalized.data = chunk;
    }

    return normalized;
  }

  normalizeUsage(usage) {
    if (!usage) return undefined;

    return {
      inputTokens: usage.inputTokens || usage.input_tokens || usage.prompt_tokens || 0,
      outputTokens: usage.outputTokens || usage.output_tokens || usage.completion_tokens || 0,
      reasoningTokens: usage.reasoningTokens || usage.reasoning_tokens || 0,
      thinkingTokens: usage.thinkingTokens || usage.thinking_tokens || 0,
      cacheCreationTokens: usage.cacheCreationTokens || usage.cache_creation_input_tokens || 0,
      cacheReadTokens: usage.cacheReadTokens || usage.cache_read_input_tokens || 0,
      totalTokens: usage.totalTokens || usage.total_tokens || 
        ((usage.inputTokens || usage.input_tokens || usage.prompt_tokens || 0) + 
         (usage.outputTokens || usage.output_tokens || usage.completion_tokens || 0) + 
         (usage.reasoningTokens || usage.reasoning_tokens || 0) + 
         (usage.thinkingTokens || usage.thinking_tokens || 0)),
      cost: usage.cost || 0
    };
  }

  // ================================
  // PROVIDER MANAGEMENT
  // ================================

  async getProviders() {
    return await aiRepository.getProviderSettings();
  }

  async configureProvider(config) {
    const { provider, apiKey, defaultModel, taskDefaults, limits } = config;
    
    // Get default models for the provider
    const defaultModels = this.getDefaultModelsForProvider(provider);
    
    // Test connection before saving
    await this.testConnection(provider, apiKey, defaultModel || defaultModels[0]);
    
    // Check if provider already exists
    const existingProviders = await aiRepository.getProviderSettings(provider);
    let providerConfig;
    
    if (existingProviders.length > 0) {
      // Update existing provider
      providerConfig = await aiRepository.updateProviderSettings(provider, {
        apiKeyEncrypted: await this.encryptApiKey(apiKey),
        defaultModel: defaultModel || defaultModels[0],
        taskDefaults: taskDefaults ? JSON.stringify(taskDefaults) : null,
        monthlyLimit: limits?.monthly || null,
        active: true,
        lastTested: new Date(),
        testSuccess: true
      });
    } else {
      // Create new provider
      providerConfig = await aiRepository.createProviderSettings({
        provider,
        apiKeyEncrypted: await this.encryptApiKey(apiKey),
        defaultModel: defaultModel || defaultModels[0],
        taskDefaults: taskDefaults ? JSON.stringify(taskDefaults) : null,
        monthlyLimit: limits?.monthly || null,
        active: true,
        lastTested: new Date(),
        testSuccess: true
      });
    }

    // Update in-memory provider
    const decryptedConfig = {
      ...providerConfig,
      apiKeyEncrypted: await this.decryptApiKey(providerConfig.apiKeyEncrypted)
    };
    
    this.providers.set(provider, {
      ...decryptedConfig,
      client: await this.createProviderClient(decryptedConfig)
    });

    return providerConfig;
  }

  getDefaultModelsForProvider(provider) {
    const modelMap = {
      'openai': ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      'anthropic': ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
      'google': ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
      'perplexity': ['llama-3.1-sonar-large-128k-online', 'llama-3.1-sonar-small-128k-online']
    };
    
    return modelMap[provider] || [];
  }

  async updateProvider(provider, updates) {
    const existing = this.providers.get(provider);
    if (!existing) {
      throw new Error(`Provider ${provider} not found`);
    }

    // Update database
    const updated = await aiRepository.updateProviderSettings(provider, updates);
    
    // Update in-memory provider
    this.providers.set(provider, {
      ...updated,
      client: await this.createProviderClient(updated)
    });

    return updated;
  }

  async deleteProvider(provider) {
    await aiRepository.deleteProviderSettings(provider);
    this.providers.delete(provider);
    return { success: true, message: `${provider} configuration deleted successfully` };
  }

  // ================================
  // HEALTH & AVAILABILITY
  // ================================

  async checkProviderHealth(provider) {
    try {
      const providerClient = await this.getProvider(provider);
      const health = await providerClient.checkHealth();
      
      return {
        provider,
        status: 'healthy',
        ...health
      };
    } catch (error) {
      return {
        provider,
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  async checkProviderAvailability(provider, options = {}) {
    const config = this.providers.get(provider);
    if (!config) {
      throw new Error(`Provider ${provider} not configured`);
    }

    // Check rate limits
    const usage = await aiRepository.getProviderUsage(provider, 'day');
    if (config.dailyLimit && usage.cost >= config.dailyLimit) {
      throw new Error(`Daily limit exceeded for provider ${provider}`);
    }

    const monthlyUsage = await aiRepository.getProviderUsage(provider, 'month');
    if (config.monthlyLimit && monthlyUsage.cost >= config.monthlyLimit) {
      throw new Error(`Monthly limit exceeded for provider ${provider}`);
    }

    return true;
  }

  async testConnection(provider, apiKey, model) {
    try {
      const tempClient = await this.createProviderClient({
        provider,
        apiKey: apiKey, // Use apiKey directly for testing
        models: JSON.stringify([model || this.getDefaultModelsForProvider(provider)[0]])
      });

      const result = await tempClient.testConnection();
      
      return {
        success: true,
        message: 'Connection successful',
        provider,
        model: model || this.getDefaultModelsForProvider(provider)[0],
        latency: result.latency || 0
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Connection failed',
        provider,
        model: model || this.getDefaultModelsForProvider(provider)[0],
        error: error.message
      };
    }
  }

  async updateApiKey(provider, apiKey) {
    const encrypted = await this.encryptApiKey(apiKey);
    return await aiRepository.updateProviderSettings(provider, {
      apiKeyEncrypted: encrypted,
      updatedAt: new Date()
    });
  }

  async updateModels(provider, models) {
    return await aiRepository.updateProviderSettings(provider, {
      models: JSON.stringify(models),
      updatedAt: new Date()
    });
  }

  async updateTaskDefaults(provider, taskDefaults) {
    return await aiRepository.updateProviderSettings(provider, {
      taskDefaults: JSON.stringify(taskDefaults),
      updatedAt: new Date()
    });
  }

  async updateLimits(provider, limits) {
    return await aiRepository.updateProviderSettings(provider, {
      monthlyLimit: limits.monthlyLimit,
      updatedAt: new Date()
    });
  }

  // ================================
  // COST & USAGE TRACKING
  // ================================

  async trackUsage(usageData) {
    await aiRepository.logUsage({
      provider: usageData.provider,
      model: usageData.model,
      task: usageData.task,
      tokensInput: usageData.tokensInput || 0,
      tokensOutput: usageData.tokensOutput || 0,
      tokensTotal: usageData.tokensUsed || 0,
      cost: usageData.cost || 0,
      latencyMs: usageData.latencyMs || 0,
      success: usageData.success,
      error: usageData.error,
      streaming: usageData.streaming || false,
      vertical: usageData.vertical,
      mode: usageData.mode
    });

    // Update provider usage counter
    if (usageData.cost) {
      await aiRepository.incrementProviderUsage(
        usageData.provider, 
        usageData.cost
      );
    }
  }

  async estimateCost(tokens, provider, model) {
    const providerClient = this.providers.get(provider)?.client;
    if (!providerClient) {
      return 0;
    }

    return await providerClient.estimateCost(tokens, model);
  }

  // ================================
  // CONFIGURATION HELPERS
  // ================================

  async getTaskDefaults() {
    const defaults = {
      'blog_writing_complete': { provider: 'anthropic', model: 'claude-sonnet-4' },
      'idea_generation': { provider: 'anthropic', model: 'claude-opus-4' },
      'title_generation': { provider: 'openai', model: 'gpt-5-nano' },
      'synopsis_generation': { provider: 'anthropic', model: 'claude-sonnet-4' },
      'outline_creation': { provider: 'anthropic', model: 'claude-sonnet-4' },
      'blog_editing': { provider: 'openai', model: 'gpt-5' },
      'seo_analysis': { provider: 'openai', model: 'gpt-5-nano' },
      'topic_research': { provider: 'perplexity', model: 'sonar-pro' },
      'image_prompt_generation': { provider: 'anthropic', model: 'claude-sonnet-4' },
      'social_post_generation': { provider: 'openai', model: 'gpt-5-mini' }
    };

    // Override with user-configured defaults
    const providers = await this.getProviders();
    for (const provider of providers) {
      if (provider.taskDefaults) {
        Object.assign(defaults, provider.taskDefaults);
      }
    }

    return defaults;
  }

  async getDefaultModel(provider) {
    const config = this.providers.get(provider);
    if (!config) {
      throw new Error(`Provider ${provider} not configured`);
    }

    return config.defaultModel || JSON.parse(config.models || '[]')[0] || 'default';
  }

  async getAvailableModels(provider) {
    const config = this.providers.get(provider);
    if (!config) {
      throw new Error(`Provider ${provider} not configured`);
    }

    return JSON.parse(config.models || '[]');
  }

  // ================================
  // SECURITY HELPERS
  // ================================

  async encryptApiKey(apiKey) {
    try {
      // Use Node.js crypto module for proper encryption
      const crypto = await import('crypto');
      
      // Generate a random salt for this key
      const salt = crypto.randomBytes(16).toString('hex');
      
      // Use a key derived from environment variable or default
      const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-for-development-only';
      const key = crypto.pbkdf2Sync(encryptionKey, salt, 10000, 32, 'sha256');
      
      // Create cipher
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      
      // Encrypt the API key
      let encrypted = cipher.update(apiKey, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Return encrypted key with salt and IV
      return `${salt}:${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
      console.warn('Crypto encryption failed, falling back to base64:', error);
      // Fallback to base64 if crypto fails
      return Buffer.from(apiKey).toString('base64');
    }
  }

  async decryptApiKey(encryptedKey) {
    try {
      // Check if this is the new encrypted format (contains colons)
      if (encryptedKey.includes(':')) {
        const crypto = await import('crypto');
        const [salt, ivHex, encrypted] = encryptedKey.split(':');
        
        // Reconstruct the key
        const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-for-development-only';
        const key = crypto.pbkdf2Sync(encryptionKey, salt, 10000, 32, 'sha256');
        
        // Create decipher
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        
        // Decrypt
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
      } else {
        // Legacy base64 format
        return Buffer.from(encryptedKey, 'base64').toString('utf8');
      }
    } catch (error) {
      console.warn('Crypto decryption failed, trying base64:', error);
      // Fallback to base64 if crypto fails
      try {
        return Buffer.from(encryptedKey, 'base64').toString('utf8');
      } catch (base64Error) {
        console.error('Both encryption formats failed:', base64Error);
        throw new Error('Failed to decrypt API key');
      }
    }
  }
}