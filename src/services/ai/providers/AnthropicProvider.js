// Anthropic Provider Implementation
// Supports Claude models with proper message formatting and streaming

import Anthropic from '@anthropic-ai/sdk';

export class AnthropicProvider {
  constructor(config) {
    this.provider = 'anthropic';
    this.config = config;
    this.client = new Anthropic({
      apiKey: this.decryptApiKey(config.apiKeyEncrypted)
    });
    
    // Model configurations with 2025 pricing
    this.models = {
      'claude-opus-4': {
        maxTokens: 200000,
        inputCost: 0.015,  // per 1K tokens
        outputCost: 0.075,
        contextWindow: 200000
      },
      'claude-sonnet-4': {
        maxTokens: 200000,
        inputCost: 0.003,
        outputCost: 0.015,
        contextWindow: 200000
      },
      'claude-3.7-sonnet': {
        maxTokens: 200000,
        inputCost: 0.003,
        outputCost: 0.015,
        contextWindow: 200000
      },
      'claude-haiku-4': {
        maxTokens: 200000,
        inputCost: 0.00025,
        outputCost: 0.00125,
        contextWindow: 200000
      }
    };
  }

  // ================================
  // GENERATION METHODS
  // ================================

  async generate(config) {
    const { task, prompt, model = 'claude-sonnet-4', options = {} } = config;
    const modelConfig = this.models[model];
    
    if (!modelConfig) {
      throw new Error(`Model ${model} not supported`);
    }

    const startTime = Date.now();
    
    try {
      const messages = this.buildMessages(prompt, task, options);
      const systemMessage = this.buildSystemMessage(task, options);
      
      const requestConfig = {
        model,
        max_tokens: Math.min(
          options.maxTokens || 4000, 
          modelConfig.maxTokens
        ),
        messages,
        system: systemMessage,
        temperature: this.getTemperature(task),
        ...this.getToolsConfig(options)
      };

      const response = await this.client.messages.create(requestConfig);
      
      const latency = Date.now() - startTime;
      const content = this.extractContent(response);
      
      return {
        content,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
          cost: this.calculateCost(response.usage, model),
          latencyMs: latency
        },
        metadata: {
          model,
          provider: this.provider,
          finishReason: response.stop_reason,
          stopSequence: response.stop_sequence
        }
      };
      
    } catch (error) {
      console.error(`Anthropic generation error:`, error);
      throw this.handleError(error);
    }
  }

  // ================================
  // STREAMING METHODS
  // ================================

  supportsStreaming() {
    return true;
  }

  async *generateStream(config) {
    const { task, prompt, model = 'claude-sonnet-4', options = {} } = config;
    const modelConfig = this.models[model];
    
    if (!modelConfig) {
      throw new Error(`Model ${model} not supported`);
    }

    try {
      const messages = this.buildMessages(prompt, task, options);
      const systemMessage = this.buildSystemMessage(task, options);
      
      const stream = await this.client.messages.create({
        model,
        max_tokens: Math.min(
          options.maxTokens || 4000, 
          modelConfig.maxTokens
        ),
        messages,
        system: systemMessage,
        temperature: this.getTemperature(task),
        stream: true
      });

      let inputTokens = 0;
      let outputTokens = 0;

      for await (const chunk of stream) {
        if (chunk.type === 'message_start') {
          inputTokens = chunk.message.usage.input_tokens;
        }
        
        if (chunk.type === 'content_block_delta') {
          const text = chunk.delta.text || '';
          if (text) {
            yield {
              type: 'content',
              content: text,
              usage: { 
                inputTokens, 
                outputTokens: outputTokens++ 
              }
            };
          }
        }
        
        if (chunk.type === 'message_delta') {
          outputTokens = chunk.usage.output_tokens;
        }
        
        if (chunk.type === 'message_stop') {
          yield {
            type: 'completion',
            usage: {
              inputTokens,
              outputTokens,
              totalTokens: inputTokens + outputTokens,
              cost: this.calculateCost({ 
                input_tokens: inputTokens, 
                output_tokens: outputTokens 
              }, model)
            }
          };
        }
      }
    } catch (error) {
      console.error(`Anthropic streaming error:`, error);
      throw this.handleError(error);
    }
  }

  // ================================
  // MESSAGE BUILDING
  // ================================

  buildMessages(prompt, task, options) {
    const messages = [];
    
    // Add context as assistant message if provided
    if (options.context && options.context.trim()) {
      messages.push({
        role: 'user',
        content: `Here's some context for the task:\n\n${options.context}`
      });
      messages.push({
        role: 'assistant',
        content: 'I understand the context. I\'ll use this information to help with your task.'
      });
    }

    // Add any conversation history
    if (options.conversationHistory) {
      messages.push(...options.conversationHistory);
    }

    // Add main prompt
    let mainPrompt = this.enhancePromptForTask(prompt, task, options);
    
    messages.push({
      role: 'user',
      content: mainPrompt
    });

    return messages;
  }

  buildSystemMessage(task, options) {
    let systemMessage = '';
    
    // Add role-based instruction
    const roleInstructions = this.getRoleInstructions(task, options.vertical);
    if (roleInstructions) {
      systemMessage += roleInstructions + '\n\n';
    }
    
    // Add task-specific instructions
    const taskInstructions = this.getTaskInstructions(task);
    if (taskInstructions) {
      systemMessage += taskInstructions + '\n\n';
    }
    
    // Add format instructions
    if (options.outputFormat) {
      systemMessage += `Output format: ${options.outputFormat}\n\n`;
    }
    
    // Add custom system instruction
    if (options.systemInstruction) {
      systemMessage += options.systemInstruction;
    }
    
    return systemMessage.trim() || undefined;
  }

  enhancePromptForTask(prompt, task, options) {
    let enhancedPrompt = prompt;
    
    // Add vertical context
    if (options.vertical && options.vertical !== 'all') {
      const verticalContext = this.getVerticalContext(options.vertical);
      enhancedPrompt = `${verticalContext}\n\n${enhancedPrompt}`;
    }
    
    // Add specific task enhancements
    switch (task) {
      case 'blog_writing_complete':
        enhancedPrompt += '\n\nPlease include:\n- Engaging title\n- Clear structure with headers\n- SEO-friendly content\n- Call to action';
        break;
        
      case 'idea_generation':
        enhancedPrompt += '\n\nProvide diverse, creative ideas that are actionable and relevant to the target audience.';
        break;
        
      case 'title_generation':
        enhancedPrompt += '\n\nGenerate compelling, SEO-friendly titles that grab attention and accurately represent the content.';
        break;
        
      case 'seo_analysis':
        enhancedPrompt += '\n\nAnalyze for keyword density, readability, meta descriptions, and provide specific improvement suggestions.';
        break;
    }
    
    return enhancedPrompt;
  }

  // ================================
  // CONFIGURATION HELPERS
  // ================================

  getRoleInstructions(task, vertical) {
    const roleMap = {
      'blog_writing_complete': 'You are an expert content writer specializing in creating engaging, SEO-optimized blog posts.',
      'idea_generation': 'You are a creative strategist who generates innovative content ideas.',
      'title_generation': 'You are a copywriting expert specializing in compelling headlines.',
      'seo_analysis': 'You are an SEO expert who analyzes content for search optimization.',
      'blog_editing': 'You are an experienced editor who improves content clarity and engagement.',
      'social_post_generation': 'You are a social media expert who creates engaging posts.'
    };
    
    let instruction = roleMap[task] || 'You are a helpful AI assistant.';
    
    if (vertical && vertical !== 'all') {
      instruction += ` You have deep expertise in the ${vertical} industry.`;
    }
    
    return instruction;
  }

  getTaskInstructions(task) {
    const instructions = {
      'blog_writing_complete': `
        Write a comprehensive blog post that:
        - Starts with a hook to grab attention
        - Uses clear, scannable formatting with headers
        - Provides valuable, actionable information
        - Includes relevant examples and insights
        - Ends with a strong call to action
        - Is optimized for SEO without keyword stuffing
      `,
      'idea_generation': `
        Generate ideas that are:
        - Fresh and original
        - Relevant to the target audience
        - Actionable and specific
        - Diverse in scope and approach
        - Backed by current trends when applicable
      `,
      'title_generation': `
        Create titles that:
        - Grab attention immediately
        - Clearly convey the value proposition
        - Are SEO-friendly but not stuffed
        - Match the content's tone and audience
        - Are appropriate length for the platform
      `
    };
    
    return instructions[task]?.trim();
  }

  getVerticalContext(vertical) {
    const contexts = {
      'hospitality': 'Focus on hotels, restaurants, travel, and guest experience. Consider seasonal trends, customer service excellence, and revenue management.',
      'healthcare': 'Address healthcare providers, patient care, medical compliance, and healthcare technology. Ensure accuracy and sensitivity.',
      'tech': 'Cover technology trends, software solutions, digital transformation, and innovation. Use appropriate technical depth.',
      'athletics': 'Focus on sports, fitness, athlete performance, and sports business. Consider both professional and recreational contexts.'
    };
    
    return contexts[vertical] || '';
  }

  getTemperature(task) {
    const temperatureMap = {
      'idea_generation': 0.9,
      'title_generation': 0.8,
      'blog_writing_complete': 0.7,
      'social_post_generation': 0.8,
      'blog_editing': 0.3,
      'seo_analysis': 0.1,
      'synopsis_generation': 0.6
    };
    
    return temperatureMap[task] || 0.7;
  }

  getToolsConfig(options) {
    // Anthropic doesn't have built-in tools like web search
    // But we can structure the response for tool use if needed
    if (options.tools) {
      return {
        tools: options.tools,
        tool_choice: options.toolChoice || 'auto'
      };
    }
    
    return {};
  }

  // ================================
  // UTILITY METHODS
  // ================================

  extractContent(response) {
    if (response.content && response.content.length > 0) {
      return response.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');
    }
    
    return '';
  }

  calculateCost(usage, model) {
    const modelConfig = this.models[model];
    if (!modelConfig || !usage) return 0;

    const inputCost = (usage.input_tokens || 0) * (modelConfig.inputCost / 1000);
    const outputCost = (usage.output_tokens || 0) * (modelConfig.outputCost / 1000);
    
    return parseFloat((inputCost + outputCost).toFixed(6));
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
      // Simple health check with minimal token usage
      const response = await this.client.messages.create({
        model: 'claude-haiku-4',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hello' }]
      });
      
      return {
        status: 'healthy',
        model: 'claude-haiku-4',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Anthropic health check failed: ${error.message}`);
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
    if (error.status === 429) {
      return new Error(`Anthropic rate limit exceeded: ${error.message}`);
    }
    
    if (error.status === 400) {
      return new Error(`Anthropic bad request: ${error.message}`);
    }
    
    if (error.status === 401) {
      return new Error(`Anthropic authentication failed: Invalid API key`);
    }
    
    if (error.status === 500) {
      return new Error(`Anthropic server error: ${error.message}`);
    }
    
    return new Error(`Anthropic error: ${error.message}`);
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

        console.warn(`Anthropic request failed (attempt ${attempt}/${maxRetries}), retrying in ${Math.round(totalDelay)}ms:`, error.message);
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

  decryptApiKey(encryptedKey) {
    // Simple base64 decoding - in production use proper decryption
    return Buffer.from(encryptedKey, 'base64').toString('utf8');
  }
}