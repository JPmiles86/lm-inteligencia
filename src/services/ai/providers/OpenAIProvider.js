// OpenAI Provider Implementation
// Supports GPT-5 Responses API, GPT-4.1 Chat Completions, and DALL-E 3

import OpenAI from 'openai';

export class OpenAIProvider {
  constructor(config) {
    this.provider = 'openai';
    this.config = config;
    this.client = new OpenAI({
      apiKey: this.decryptApiKey(config.apiKeyEncrypted)
    });
    
    // Model configurations
    this.models = {
      // GPT-5 series (Responses API)
      'gpt-5': { 
        api: 'responses', 
        inputCost: 0.005, 
        outputCost: 0.015,
        reasoningCost: 0.06,
        supportsReasoning: true,
        supportsWebSearch: true
      },
      'gpt-5-mini': { 
        api: 'responses', 
        inputCost: 0.001, 
        outputCost: 0.004,
        reasoningCost: 0.02,
        supportsReasoning: true,
        supportsWebSearch: true
      },
      'gpt-5-nano': { 
        api: 'responses', 
        inputCost: 0.0005, 
        outputCost: 0.002,
        reasoningCost: 0.01,
        supportsReasoning: true,
        supportsWebSearch: false
      },
      
      // GPT-4.1 series (Chat Completions API)  
      'gpt-4.1': { 
        api: 'chat', 
        inputCost: 0.003, 
        outputCost: 0.01,
        supportsVision: true
      },
      'gpt-4.1-mini': { 
        api: 'chat', 
        inputCost: 0.0015, 
        outputCost: 0.006,
        supportsVision: true
      },
      
      // O1 series (Responses API)
      'o1': { 
        api: 'responses', 
        inputCost: 0.015, 
        outputCost: 0.06,
        reasoningCost: 0.06,
        supportsReasoning: true
      },
      
      // Image models
      'dall-e-3': { 
        api: 'images', 
        cost: 0.04 // per image, 1024x1024
      }
    };
  }

  // ================================
  // GENERATION METHODS
  // ================================

  async generate(config) {
    const { task, prompt, model, options = {} } = config;
    const modelConfig = this.models[model];
    
    if (!modelConfig) {
      throw new Error(`Model ${model} not supported`);
    }

    return await this.executeWithRetry(async () => {
      const startTime = Date.now();
      let result;
      
      switch (modelConfig.api) {
        case 'responses':
          result = await this.generateWithResponses(prompt, model, task, options);
          break;
        case 'chat':
          result = await this.generateWithChat(prompt, model, task, options);
          break;
        case 'images':
          result = await this.generateImage(prompt, model, options);
          break;
        default:
          throw new Error(`Unsupported API type: ${modelConfig.api}`);
      }

      const latency = Date.now() - startTime;
      
      return {
        content: result.content,
        usage: {
          inputTokens: result.usage?.input_tokens || 0,
          outputTokens: result.usage?.output_tokens || 0,
          reasoningTokens: result.usage?.reasoning_tokens || 0,
          totalTokens: result.usage?.total_tokens || 0,
          cost: this.calculateCost(result.usage, model),
          latencyMs: latency
        },
        metadata: {
          model,
          provider: this.provider,
          reasoning: result.reasoning,
          sources: result.search_results,
          finishReason: result.finish_reason,
          responseId: result.response_id,
          toolCalls: result.tool_calls,
          functionCall: result.function_call,
          ...(result.metadata || {})
        }
      };
    }, options.maxRetries, options.retryDelay);
  }

  async generateWithResponses(prompt, model, task, options) {
    const modelConfig = this.models[model];
    
    const config = {
      model,
      input: this.buildPrompt(prompt, task, options),
      ...this.getReasoningConfig(task, options),
      ...this.getVerbosityConfig(task, options),
      ...this.getToolsConfig(task, options, modelConfig),
      ...this.getStructuredOutputConfig(options),
      ...this.getAdvancedConfig(task, options, modelConfig)
    };

    // Add instructions for system-level guidance
    if (options.systemInstruction) {
      config.instructions = options.systemInstruction;
    }

    // Add previous response context if available
    if (options.previousResponseId) {
      config.previous_response_id = options.previousResponseId;
    }

    // Add conversation context if available
    if (options.conversationHistory) {
      config.conversation_history = options.conversationHistory;
    }

    // Add metadata tracking
    if (options.metadata) {
      config.metadata = options.metadata;
    }

    const response = await this.client.responses.create(config);
    
    return {
      content: this.extractContent(response),
      usage: response.usage,
      reasoning: response.reasoning,
      search_results: response.search_results,
      finish_reason: response.status,
      response_id: response.id,
      metadata: response.metadata
    };
  }

  async generateWithChat(prompt, model, task, options) {
    const messages = this.buildChatMessages(prompt, task, options);
    
    const config = {
      model,
      messages,
      temperature: options.temperature !== undefined ? options.temperature : this.getTemperature(task),
      max_tokens: options.maxTokens,
      ...this.getAdvancedConfig(task, options, this.models[model])
    };

    // Add tools if specified
    if (options.tools) {
      config.tools = options.tools;
      config.tool_choice = options.toolChoice || 'auto';
    }

    // Add function calling if specified
    if (options.functions) {
      config.functions = options.functions;
      config.function_call = options.functionCall || 'auto';
    }

    // Add response format for structured outputs
    if (options.responseFormat) {
      config.response_format = options.responseFormat;
    }

    const response = await this.client.chat.completions.create(config);
    
    const choice = response.choices[0];
    return {
      content: choice.message.content,
      usage: response.usage,
      finish_reason: choice.finish_reason,
      tool_calls: choice.message.tool_calls,
      function_call: choice.message.function_call,
      response_id: response.id
    };
  }

  async generateImage(prompt, model, options = {}) {
    const response = await this.client.images.generate({
      model,
      prompt,
      size: options.size || "1024x1024",
      quality: options.quality || "standard",
      n: options.count || 1
    });

    return {
      content: response.data,
      usage: { images_generated: response.data.length }
    };
  }

  // ================================
  // STREAMING METHODS
  // ================================

  supportsStreaming() {
    return true;
  }

  async *generateStream(config) {
    const { task, prompt, model, options = {} } = config;
    const modelConfig = this.models[model];
    
    if (modelConfig.api === 'responses') {
      yield* this.streamResponses(prompt, model, task, options);
    } else if (modelConfig.api === 'chat') {
      yield* this.streamChat(prompt, model, task, options);
    } else {
      throw new Error(`Streaming not supported for ${modelConfig.api}`);
    }
  }

  async *streamResponses(prompt, model, task, options) {
    const config = {
      model,
      input: this.buildPrompt(prompt, task, options),
      ...this.getReasoningConfig(task, options),
      ...this.getVerbosityConfig(task, options),
      stream: true
    };

    const stream = await this.client.responses.create(config);
    
    for await (const chunk of stream) {
      if (chunk.content) {
        yield {
          type: 'content',
          content: chunk.content,
          usage: chunk.usage
        };
      }
      
      if (chunk.reasoning) {
        yield {
          type: 'reasoning',
          reasoning: chunk.reasoning
        };
      }
    }
  }

  async *streamChat(prompt, model, task, options) {
    const messages = this.buildChatMessages(prompt, task, options);
    
    const stream = await this.client.chat.completions.create({
      model,
      messages,
      temperature: this.getTemperature(task),
      stream: true
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) {
        yield {
          type: 'content',
          content: delta.content,
          usage: chunk.usage
        };
      }
    }
  }

  // ================================
  // CONFIGURATION HELPERS
  // ================================

  getReasoningConfig(task, options) {
    // Allow override through options
    if (options.reasoning) {
      return { reasoning: options.reasoning };
    }

    const reasoningMap = {
      'blog_writing_complete': { reasoning: { effort: 'medium' } },
      'idea_generation': { reasoning: { effort: 'low' } },
      'title_generation': { reasoning: { effort: 'minimal' } },
      'blog_editing': { reasoning: { effort: 'high' } },
      'seo_analysis': { reasoning: { effort: 'minimal' } },
      'topic_research': { reasoning: { effort: 'low' } },
      'synopsis_generation': { reasoning: { effort: 'low' } },
      'outline_creation': { reasoning: { effort: 'medium' } },
      'social_post_generation': { reasoning: { effort: 'minimal' } },
      'image_prompt_generation': { reasoning: { effort: 'low' } }
    };

    return reasoningMap[task] || { reasoning: { effort: 'medium' } };
  }

  getVerbosityConfig(task, options) {
    // Allow override through options
    if (options.verbosity) {
      return { text: { verbosity: options.verbosity } };
    }

    const verbosityMap = {
      'blog_writing_complete': { text: { verbosity: 'high' } },
      'idea_generation': { text: { verbosity: 'low' } },
      'title_generation': { text: { verbosity: 'low' } },
      'social_post_generation': { text: { verbosity: 'low' } },
      'synopsis_generation': { text: { verbosity: 'medium' } },
      'outline_creation': { text: { verbosity: 'medium' } },
      'seo_analysis': { text: { verbosity: 'low' } },
      'blog_editing': { text: { verbosity: 'medium' } },
      'image_prompt_generation': { text: { verbosity: 'low' } }
    };

    return verbosityMap[task] || { text: { verbosity: 'medium' } };
  }

  getToolsConfig(task, options, modelConfig) {
    const tools = [];

    // Web search configuration
    if (modelConfig.supportsWebSearch) {
      const needsWebSearch = [
        'topic_research',
        'blog_writing_complete',
        'trend_analysis',
        'competitor_analysis',
        'blog_writing_section'
      ].includes(task);

      if (needsWebSearch || options.enableWebSearch) {
        const searchTool = { 
          type: "web_search_preview",
          search_context_size: options.searchContextSize || "medium"
        };

        // Add location context if provided
        if (options.userLocation) {
          searchTool.user_location = options.userLocation;
        }

        // Add search domain restrictions if provided
        if (options.searchDomains) {
          searchTool.domains = options.searchDomains;
        }

        tools.push(searchTool);
      }
    }

    // Custom tools if provided
    if (options.customTools) {
      tools.push(...options.customTools);
    }

    return tools.length > 0 ? { tools } : {};
  }

  getStructuredOutputConfig(options) {
    if (!options.responseSchema) {
      return {};
    }

    return {
      text: {
        format: {
          type: "json_schema",
          schema: options.responseSchema,
          strict: options.strictSchema !== false // Default to strict unless explicitly disabled
        }
      }
    };
  }

  // Advanced configuration for provider-specific features
  getAdvancedConfig(task, options, modelConfig) {
    const config = {};

    // Response format preferences
    if (options.responseFormat) {
      config.response_format = options.responseFormat;
    }

    // Temperature override
    if (options.temperature !== undefined) {
      config.temperature = options.temperature;
    }

    // Max tokens override  
    if (options.maxTokens) {
      config.max_tokens = options.maxTokens;
    }

    // Stop sequences
    if (options.stopSequences) {
      config.stop = options.stopSequences;
    }

    // Top-p override
    if (options.topP !== undefined) {
      config.top_p = options.topP;
    }

    // Frequency penalty
    if (options.frequencyPenalty !== undefined) {
      config.frequency_penalty = options.frequencyPenalty;
    }

    // Presence penalty
    if (options.presencePenalty !== undefined) {
      config.presence_penalty = options.presencePenalty;
    }

    // Log probabilities
    if (options.logProbs) {
      config.logprobs = options.logProbs;
      config.top_logprobs = options.topLogProbs || 5;
    }

    return config;
  }

  buildPrompt(prompt, task, options) {
    let fullPrompt = prompt;
    
    // Add context if provided
    if (options.context) {
      fullPrompt = `Context:\n${options.context}\n\nTask: ${fullPrompt}`;
    }

    // Add vertical-specific guidance
    if (options.vertical && options.vertical !== 'all') {
      fullPrompt = `Industry: ${options.vertical}\n\n${fullPrompt}`;
    }

    return fullPrompt;
  }

  buildChatMessages(prompt, task, options) {
    const messages = [];
    
    // System message - combine all system-level instructions
    const systemParts = [];
    
    if (options.systemInstruction) {
      systemParts.push(options.systemInstruction);
    }

    // Add context as part of system message
    if (options.context) {
      systemParts.push(`Context: ${options.context}`);
    }

    // Add vertical-specific system instruction
    if (options.vertical && options.vertical !== 'all') {
      systemParts.push(`Focus on the ${options.vertical} industry.`);
    }

    if (systemParts.length > 0) {
      messages.push({
        role: 'system',
        content: systemParts.join('\n\n')
      });
    }

    // Add conversation history if provided
    if (options.conversationHistory && options.conversationHistory.length > 0) {
      messages.push(...options.conversationHistory);
    }

    // Handle multimodal content (text + images)
    if (options.images && options.images.length > 0) {
      const content = [{ type: 'text', text: prompt }];
      
      options.images.forEach(image => {
        content.push({
          type: 'image_url',
          image_url: {
            url: image.url || image,
            detail: image.detail || 'auto'
          }
        });
      });

      messages.push({
        role: 'user',
        content
      });
    } else {
      // Standard text message
      messages.push({
        role: 'user',
        content: prompt
      });
    }

    return messages;
  }

  getTemperature(task) {
    const temperatureMap = {
      'idea_generation': 0.9,
      'title_generation': 0.8,
      'blog_writing_complete': 0.7,
      'social_post_generation': 0.8,
      'seo_analysis': 0.1,
      'topic_research': 0.3
    };

    return temperatureMap[task] || 0.7;
  }

  // ================================
  // UTILITY METHODS
  // ================================

  extractContent(response) {
    // Handle Responses API format
    if (response.output && response.output[0]) {
      const output = response.output[0];
      if (output.content && output.content[0]) {
        const content = output.content[0];
        
        // Handle different content types
        if (content.text) {
          return content.text;
        } else if (typeof content === 'string') {
          return content;
        } else if (content.type === 'text') {
          return content.text;
        }
      }
    }
    
    // Handle legacy response format
    if (response.text) {
      return response.text;
    }

    // Handle Chat Completions format (fallback)
    if (response.choices && response.choices[0] && response.choices[0].message) {
      return response.choices[0].message.content;
    }
    
    return '';
  }

  calculateCost(usage, model) {
    const modelConfig = this.models[model];
    if (!modelConfig || !usage) return 0;

    let cost = 0;
    
    if (modelConfig.api === 'images') {
      cost = (usage.images_generated || 0) * modelConfig.cost;
    } else {
      cost += (usage.input_tokens || 0) * (modelConfig.inputCost / 1000);
      cost += (usage.output_tokens || 0) * (modelConfig.outputCost / 1000);
      
      if (modelConfig.reasoningCost && usage.reasoning_tokens) {
        cost += usage.reasoning_tokens * (modelConfig.reasoningCost / 1000);
      }
    }

    return parseFloat(cost.toFixed(6));
  }

  async estimateCost(tokens, model) {
    const modelConfig = this.models[model];
    if (!modelConfig) return 0;

    // Rough estimate: 70% input, 30% output
    const inputTokens = Math.floor(tokens * 0.7);
    const outputTokens = Math.floor(tokens * 0.3);

    return this.calculateCost(
      { input_tokens: inputTokens, output_tokens: outputTokens },
      model
    );
  }

  async checkHealth() {
    try {
      const response = await this.client.models.list();
      return {
        status: 'healthy',
        models: response.data.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`OpenAI health check failed: ${error.message}`);
    }
  }

  async testConnection() {
    try {
      await this.client.models.retrieve('gpt-4.1-mini');
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  handleError(error) {
    // Handle specific OpenAI error types
    if (error.type) {
      switch (error.type) {
        case 'insufficient_quota':
          return new Error(`OpenAI quota exceeded: ${error.message}`);
        case 'model_not_found':
          return new Error(`OpenAI model not found: ${error.message}`);
        case 'invalid_request_error':
          return new Error(`OpenAI invalid request: ${error.message}`);
        case 'authentication_error':
          return new Error(`OpenAI authentication failed: ${error.message}`);
        case 'permission_error':
          return new Error(`OpenAI permission denied: ${error.message}`);
        case 'rate_limit_error':
          return new Error(`OpenAI rate limit exceeded: ${error.message}`);
        case 'server_error':
          return new Error(`OpenAI server error: ${error.message}`);
        case 'service_unavailable':
          return new Error(`OpenAI service unavailable: ${error.message}`);
      }
    }

    // Handle HTTP status codes
    if (error.status) {
      switch (error.status) {
        case 400:
          return new Error(`OpenAI bad request: ${error.message}`);
        case 401:
          return new Error(`OpenAI authentication failed: ${error.message}`);
        case 403:
          return new Error(`OpenAI forbidden: ${error.message}`);
        case 404:
          return new Error(`OpenAI not found: ${error.message}`);
        case 429:
          // Extract retry-after header if available
          const retryAfter = error.headers?.['retry-after'];
          const retryMsg = retryAfter ? ` (retry after ${retryAfter} seconds)` : '';
          return new Error(`OpenAI rate limit exceeded: ${error.message}${retryMsg}`);
        case 500:
        case 502:
        case 503:
        case 504:
          return new Error(`OpenAI server error (${error.status}): ${error.message}`);
      }
    }

    // Handle response format errors
    if (error.output && error.output[0] && error.output[0].content && error.output[0].content[0]) {
      const content = error.output[0].content[0];
      if (content.type === 'refusal') {
        return new Error(`OpenAI refused request: ${content.refusal}`);
      }
    }

    // Handle incomplete responses
    if (error.status === 'incomplete') {
      const reason = error.incomplete_details?.reason;
      if (reason === 'max_output_tokens') {
        return new Error('OpenAI response truncated: Maximum output tokens reached');
      } else if (reason === 'content_filter') {
        return new Error('OpenAI content filtered: Response blocked by content policy');
      } else if (reason === 'function_calls') {
        return new Error('OpenAI function calls incomplete: Function execution failed');
      }
      return new Error(`OpenAI incomplete response: ${reason || 'Unknown reason'}`);
    }
    
    return new Error(`OpenAI error: ${error.message}`);
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

        console.warn(`OpenAI request failed (attempt ${attempt}/${maxRetries}), retrying in ${Math.round(totalDelay)}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, totalDelay));
      }
    }
  }

  isRetryableError(error) {
    // Retry on rate limits, server errors, and network issues
    if (error.status) {
      return [429, 500, 502, 503, 504].includes(error.status);
    }
    
    if (error.type) {
      return ['rate_limit_error', 'server_error', 'service_unavailable'].includes(error.type);
    }
    
    // Network errors
    return error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT';
  }

  decryptApiKey(encryptedKey) {
    // Simple base64 decoding - in production use proper decryption
    return Buffer.from(encryptedKey, 'base64').toString('utf8');
  }
}