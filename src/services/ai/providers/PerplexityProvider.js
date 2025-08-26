// Perplexity Provider Implementation
// Uses OpenAI SDK with Perplexity's base URL for real-time web search and research

import OpenAI from 'openai';

export class PerplexityProvider {
  constructor(config) {
    this.provider = 'perplexity';
    this.config = config;
    this.client = new OpenAI({
      apiKey: this.decryptApiKey(config.apiKeyEncrypted),
      baseURL: 'https://api.perplexity.ai'
    });
    
    // Model configurations with 2025 pricing and features
    this.models = {
      'sonar': {
        inputCost: 0.0002,   // $0.2 per 1M input tokens
        outputCost: 0.0008,  // $0.8 per 1M output tokens
        contextWindow: 127000,
        supportsWebSearch: true,
        supportsStreaming: true,
        searchMode: 'web'
      },
      'sonar-pro': {
        inputCost: 0.003,    // $3 per 1M input tokens
        outputCost: 0.015,   // $15 per 1M output tokens
        contextWindow: 127000,
        supportsWebSearch: true,
        supportsAcademic: true,
        supportsStreaming: true,
        supportsAdvancedFilters: true,
        searchMode: 'web'
      },
      'sonar-deep-research': {
        inputCost: 0.005,    // $5 per 1M input tokens
        outputCost: 0.025,   // $25 per 1M output tokens
        reasoningCost: 0.05, // Additional reasoning cost
        contextWindow: 127000,
        supportsWebSearch: true,
        supportsReasoning: true,
        supportsExhaustive: true,
        supportsStreaming: true,
        searchMode: 'web'
      },
      'sonar-reasoning-pro': {
        inputCost: 0.008,    // $8 per 1M input tokens (can vary 3-8)
        outputCost: 0.04,    // $40 per 1M output tokens (can vary 15-40)
        reasoningCost: 0.06,
        contextWindow: 127000,
        supportsWebSearch: true,
        supportsReasoning: true,
        supportsStreaming: true,
        searchMode: 'web'
      }
    };
  }

  // ================================
  // GENERATION METHODS
  // ================================

  async generate(config) {
    const { task, prompt, model = 'sonar-pro', options = {} } = config;
    const modelConfig = this.models[model];
    
    if (!modelConfig) {
      throw new Error(`Model ${model} not supported`);
    }

    return await this.executeWithRetry(async () => {
      const startTime = Date.now();
      
      // Build messages for research
      const messages = this.buildMessages(prompt, task, options);
      
      // Build request configuration
      const requestConfig = {
        model,
        messages,
        temperature: this.getTemperature(task, options),
        max_tokens: options.maxTokens || 4000,
        ...this.getSearchConfiguration(task, options, modelConfig),
        ...this.getAdvancedConfiguration(options)
      };

      const response = await this.client.chat.completions.create(requestConfig);
      const result = response.choices[0];
      const latency = Date.now() - startTime;
      
      return {
        content: result.message.content,
        usage: {
          inputTokens: response.usage?.prompt_tokens || 0,
          outputTokens: response.usage?.completion_tokens || 0,
          reasoningTokens: response.usage?.reasoning_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
          cost: this.calculateCost(response.usage, model),
          latencyMs: latency
        },
        metadata: {
          model,
          provider: this.provider,
          finishReason: result.finish_reason,
          searchResults: response.search_results || [],
          relatedQuestions: response.related_questions || [],
          citations: this.extractCitations(response.search_results || []),
          searchMode: this.getSearchMode(options, modelConfig),
          searchContextSize: options.searchContextSize || 'medium'
        }
      };
    }, options.maxRetries, options.retryDelay);
  }

  // ================================
  // STREAMING METHODS
  // ================================

  supportsStreaming() {
    return true;
  }

  async *generateStream(config) {
    const { task, prompt, model = 'sonar-pro', options = {} } = config;
    const modelConfig = this.models[model];
    
    if (!modelConfig.supportsStreaming) {
      throw new Error(`Model ${model} does not support streaming`);
    }

    try {
      const messages = this.buildMessages(prompt, task, options);
      
      const requestConfig = {
        model,
        messages,
        temperature: this.getTemperature(task, options),
        stream: true,
        ...this.getSearchConfiguration(task, options, modelConfig),
        ...this.getAdvancedConfiguration(options)
      };

      const stream = await this.client.chat.completions.create(requestConfig);
      
      let totalInputTokens = 0;
      let totalOutputTokens = 0;
      let totalReasoningTokens = 0;
      let searchResults = [];
      let relatedQuestions = [];

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        
        if (delta?.content) {
          yield {
            type: 'content',
            content: delta.content,
            usage: { 
              inputTokens: totalInputTokens, 
              outputTokens: totalOutputTokens++,
              reasoningTokens: totalReasoningTokens
            }
          };
        }

        // Final chunk contains complete usage and search results
        if (chunk.choices[0]?.finish_reason) {
          totalInputTokens = chunk.usage?.prompt_tokens || 0;
          totalOutputTokens = chunk.usage?.completion_tokens || 0;
          totalReasoningTokens = chunk.usage?.reasoning_tokens || 0;
          searchResults = chunk.search_results || [];
          relatedQuestions = chunk.related_questions || [];

          yield {
            type: 'completion',
            usage: {
              inputTokens: totalInputTokens,
              outputTokens: totalOutputTokens,
              reasoningTokens: totalReasoningTokens,
              totalTokens: totalInputTokens + totalOutputTokens + totalReasoningTokens,
              cost: this.calculateCost({
                prompt_tokens: totalInputTokens,
                completion_tokens: totalOutputTokens,
                reasoning_tokens: totalReasoningTokens
              }, model)
            },
            searchResults,
            relatedQuestions,
            citations: this.extractCitations(searchResults)
          };
        }
      }
    } catch (error) {
      console.error(`Perplexity streaming error:`, error);
      throw this.handleError(error);
    }
  }

  // ================================
  // MESSAGE BUILDING
  // ================================

  buildMessages(prompt, task, options) {
    const messages = [];
    
    // System message for research context
    const systemMessage = this.buildSystemMessage(task, options);
    if (systemMessage) {
      messages.push({
        role: 'system',
        content: systemMessage
      });
    }

    // Add conversation history if provided
    if (options.conversationHistory && options.conversationHistory.length > 0) {
      messages.push(...options.conversationHistory);
    }

    // Main research prompt
    const researchPrompt = this.enhancePromptForResearch(prompt, task, options);
    messages.push({
      role: 'user',
      content: researchPrompt
    });

    return messages;
  }

  buildSystemMessage(task, options) {
    const systemParts = [];
    
    // Role-based instruction
    const roleInstruction = this.getRoleInstruction(task, options.vertical);
    if (roleInstruction) {
      systemParts.push(roleInstruction);
    }
    
    // Task-specific instruction
    const taskInstruction = this.getTaskInstruction(task);
    if (taskInstruction) {
      systemParts.push(taskInstruction);
    }
    
    // Research-specific instructions
    const researchInstruction = this.getResearchInstruction(task, options);
    if (researchInstruction) {
      systemParts.push(researchInstruction);
    }
    
    // Custom system instruction
    if (options.systemInstruction) {
      systemParts.push(options.systemInstruction);
    }
    
    return systemParts.join('\n\n');
  }

  enhancePromptForResearch(prompt, task, options) {
    let enhancedPrompt = prompt;
    
    // Add vertical context
    if (options.vertical && options.vertical !== 'all') {
      enhancedPrompt = `Research for the ${options.vertical} industry: ${enhancedPrompt}`;
    }
    
    // Add research depth guidance
    switch (task) {
      case 'topic_research':
        enhancedPrompt += '\n\nProvide comprehensive research with current information and reliable sources.';
        break;
      case 'competitor_analysis':
        enhancedPrompt += '\n\nAnalyze competitive landscape with specific examples and recent developments.';
        break;
      case 'trend_analysis':
        enhancedPrompt += '\n\nIdentify current and emerging trends with supporting data and examples.';
        break;
      case 'fact_checking':
        enhancedPrompt += '\n\nVerify claims with authoritative sources and provide contradicting evidence if found.';
        break;
    }
    
    return enhancedPrompt;
  }

  // ================================
  // SEARCH CONFIGURATION
  // ================================

  getSearchConfiguration(task, options, modelConfig) {
    const config = {};
    
    // Search mode
    if (modelConfig.supportsAcademic && (options.academicMode || task === 'academic_research')) {
      config.search_mode = 'academic';
    }
    
    // Web search options
    if (modelConfig.supportsWebSearch) {
      config.web_search_options = {
        search_context_size: options.searchContextSize || this.getDefaultContextSize(task),
        ...(options.enableImageSearch && { image_search_relevance_enhanced: true }),
        ...(options.userLocation && { user_location: options.userLocation })
      };
    }
    
    // Advanced filters (for Pro models)
    if (modelConfig.supportsAdvancedFilters) {
      // Domain filtering
      if (options.searchDomains) {
        config.search_domain_filter = options.searchDomains.slice(0, 10); // Max 10 domains
      }
      
      // Date filtering
      if (options.searchRecency) {
        config.search_recency_filter = options.searchRecency;
      }
      
      if (options.searchAfterDate) {
        config.search_after_date_filter = options.searchAfterDate;
      }
      
      if (options.searchBeforeDate) {
        config.search_before_date_filter = options.searchBeforeDate;
      }
      
      if (options.lastUpdatedAfter) {
        config.last_updated_after_filter = options.lastUpdatedAfter;
      }
      
      // Related questions
      if (options.returnRelatedQuestions !== false) {
        config.return_related_questions = true;
      }
      
      // Images
      if (options.returnImages === false) {
        config.return_images = false;
      }
    }
    
    // Reasoning configuration (for reasoning models)
    if (modelConfig.supportsReasoning) {
      config.reasoning_effort = options.reasoningEffort || this.getDefaultReasoningEffort(task);
    }
    
    // Search control
    if (options.disableSearch) {
      config.disable_search = true;
    }
    
    if (options.enableSearchClassifier === false) {
      config.enable_search_classifier = false;
    }
    
    return config;
  }

  getAdvancedConfiguration(options) {
    const config = {};
    
    // Standard OpenAI parameters
    if (options.topP !== undefined) {
      config.top_p = options.topP;
    }
    
    if (options.frequencyPenalty !== undefined) {
      config.frequency_penalty = options.frequencyPenalty;
    }
    
    if (options.presencePenalty !== undefined) {
      config.presence_penalty = options.presencePenalty;
    }
    
    if (options.stopSequences) {
      config.stop = options.stopSequences;
    }
    
    return config;
  }

  getDefaultContextSize(task) {
    const contextMap = {
      'topic_research': 'high',
      'competitor_analysis': 'high',
      'trend_analysis': 'medium',
      'fact_checking': 'low',
      'quick_research': 'low',
      'academic_research': 'high'
    };
    
    return contextMap[task] || 'medium';
  }

  getDefaultReasoningEffort(task) {
    const effortMap = {
      'topic_research': 'medium',
      'competitor_analysis': 'high',
      'trend_analysis': 'medium',
      'fact_checking': 'low',
      'academic_research': 'high'
    };
    
    return effortMap[task] || 'medium';
  }

  getSearchMode(options, modelConfig) {
    if (options.academicMode && modelConfig.supportsAcademic) {
      return 'academic';
    }
    return modelConfig.searchMode || 'web';
  }

  // ================================
  // TASK-SPECIFIC CONFIGURATIONS
  // ================================

  getRoleInstruction(task, vertical) {
    const roleMap = {
      'topic_research': 'You are an expert researcher who provides comprehensive, accurate information with reliable sources.',
      'competitor_analysis': 'You are a competitive intelligence analyst who identifies market trends and competitor strategies.',
      'trend_analysis': 'You are a trend analyst who identifies emerging patterns and market developments.',
      'fact_checking': 'You are a fact-checker who verifies claims against authoritative sources.',
      'academic_research': 'You are an academic researcher who focuses on peer-reviewed sources and scholarly content.',
      'quick_research': 'You are a research assistant who provides quick, accurate answers with sources.'
    };
    
    let instruction = roleMap[task] || 'You are a knowledgeable research assistant.';
    
    if (vertical && vertical !== 'all') {
      instruction += ` You specialize in the ${vertical} industry.`;
    }
    
    return instruction;
  }

  getTaskInstruction(task) {
    const instructions = {
      'topic_research': `
        Provide comprehensive research that:
        - Covers all important aspects of the topic
        - Includes recent developments and trends
        - Cites authoritative sources
        - Identifies key statistics and data points
        - Suggests related areas for further research
      `,
      'competitor_analysis': `
        Analyze competitors by:
        - Identifying key players in the market
        - Comparing strategies and approaches
        - Highlighting competitive advantages
        - Noting recent developments or changes
        - Providing actionable insights
      `,
      'trend_analysis': `
        Identify trends by:
        - Analyzing recent market developments
        - Highlighting emerging patterns
        - Providing supporting data and examples
        - Explaining potential implications
        - Suggesting future directions
      `,
      'fact_checking': `
        Verify information by:
        - Checking claims against reliable sources
        - Identifying any conflicting information
        - Providing clear verdict on accuracy
        - Explaining the evidence basis
        - Noting any limitations or caveats
      `
    };
    
    return instructions[task]?.trim();
  }

  getResearchInstruction(task, options) {
    const instructions = [];
    
    // Source quality emphasis
    instructions.push('Always prioritize authoritative, recent, and reliable sources.');
    
    // Citation requirement
    instructions.push('Include specific citations and source information for all factual claims.');
    
    // Academic focus if requested
    if (options.academicMode) {
      instructions.push('Focus on peer-reviewed sources, academic papers, and scholarly content.');
    }
    
    // Recency emphasis for certain tasks
    if (['trend_analysis', 'competitor_analysis'].includes(task)) {
      instructions.push('Emphasize the most recent information and developments.');
    }
    
    return instructions.join(' ');
  }

  getTemperature(task, options) {
    // Allow explicit override
    if (options.temperature !== undefined) {
      return options.temperature;
    }
    
    const temperatureMap = {
      'topic_research': 0.2,
      'competitor_analysis': 0.3,
      'trend_analysis': 0.3,
      'fact_checking': 0.0, // Most deterministic
      'academic_research': 0.1,
      'quick_research': 0.2
    };
    
    return temperatureMap[task] || 0.2;
  }

  // ================================
  // UTILITY METHODS
  // ================================

  extractCitations(searchResults) {
    return searchResults.map(result => ({
      title: result.title,
      url: result.url,
      date: result.date,
      snippet: result.snippet || result.description
    }));
  }

  calculateCost(usage, model) {
    const modelConfig = this.models[model];
    if (!modelConfig || !usage) return 0;

    let cost = 0;
    cost += (usage.prompt_tokens || 0) * (modelConfig.inputCost / 1000000);
    cost += (usage.completion_tokens || 0) * (modelConfig.outputCost / 1000000);
    
    // Reasoning tokens (for reasoning models)
    if (modelConfig.reasoningCost && usage.reasoning_tokens) {
      cost += usage.reasoning_tokens * (modelConfig.reasoningCost / 1000000);
    }

    return parseFloat(cost.toFixed(6));
  }

  async estimateCost(tokens, model) {
    const modelConfig = this.models[model];
    if (!modelConfig) return 0;

    // Research typically has more input than output (80/20 split)
    const inputTokens = Math.floor(tokens * 0.8);
    const outputTokens = Math.floor(tokens * 0.2);

    return this.calculateCost(
      { prompt_tokens: inputTokens, completion_tokens: outputTokens },
      model
    );
  }

  async checkHealth() {
    try {
      const response = await this.client.chat.completions.create({
        model: 'sonar',
        messages: [{ role: 'user', content: 'Test connection' }],
        max_tokens: 10,
        temperature: 0
      });
      
      return {
        status: 'healthy',
        model: 'sonar',
        response: response.choices[0]?.message?.content,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Perplexity health check failed: ${error.message}`);
    }
  }

  async testConnection() {
    try {
      await this.checkHealth();
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  handleError(error) {
    // Handle Perplexity-specific error types
    if (error.status) {
      switch (error.status) {
        case 400:
          if (error.message.includes('domain filter')) {
            return new Error(`Perplexity domain filter error: Maximum 10 domains allowed`);
          }
          if (error.message.includes('date format')) {
            return new Error(`Perplexity date filter error: Use MM/DD/YYYY format`);
          }
          return new Error(`Perplexity bad request: ${error.message}`);
        case 401:
          return new Error(`Perplexity authentication failed: Invalid API key`);
        case 403:
          return new Error(`Perplexity forbidden: ${error.message}`);
        case 429:
          const retryAfter = error.headers?.['retry-after'];
          const retryMsg = retryAfter ? ` (retry after ${retryAfter} seconds)` : '';
          return new Error(`Perplexity rate limit exceeded: ${error.message}${retryMsg}`);
        case 503:
          return new Error(`Perplexity service unavailable: ${error.message}`);
        case 500:
        case 502:
        case 504:
          return new Error(`Perplexity server error (${error.status}): ${error.message}`);
      }
    }

    // Handle quota exceeded
    if (error.message && error.message.includes('quota')) {
      return new Error(`Perplexity quota exceeded: ${error.message}`);
    }

    return new Error(`Perplexity error: ${error.message}`);
  }

  // Enhanced retry logic with exponential backoff
  async executeWithRetry(operation, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const isRetryable = this.isRetryableError(error);
        
        if (attempt === maxRetries || !isRetryable) {
          throw this.handleError(error);
        }

        // Calculate delay with exponential backoff and jitter
        const delay = baseDelay * Math.pow(2, attempt - 1);
        const jitter = Math.random() * 1000;
        const totalDelay = delay + jitter;

        console.warn(`Perplexity request failed (attempt ${attempt}/${maxRetries}), retrying in ${Math.round(totalDelay)}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, totalDelay));
      }
    }
  }

  isRetryableError(error) {
    // Retry on rate limits, server errors, and network issues
    if (error.status) {
      return [429, 500, 502, 503, 504].includes(error.status);
    }
    
    // Network errors
    return error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT';
  }

  // ================================
  // ASYNC OPERATIONS
  // ================================

  async createAsyncResearch(config) {
    // Implement async research for long-running tasks
    const response = await fetch('https://api.perplexity.ai/async/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.client.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        request: {
          model: config.model || 'sonar-deep-research',
          messages: this.buildMessages(config.prompt, config.task, config.options),
          ...this.getSearchConfiguration(config.task, config.options, this.models[config.model])
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Async request failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async checkAsyncStatus(jobId) {
    const response = await fetch(
      `https://api.perplexity.ai/async/chat/completions/${jobId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.client.apiKey}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.statusText}`);
    }

    return await response.json();
  }

  decryptApiKey(encryptedKey) {
    // Simple base64 decoding - in production use proper decryption
    return Buffer.from(encryptedKey, 'base64').toString('utf8');
  }
}