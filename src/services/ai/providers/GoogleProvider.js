// Google Provider Implementation
// Supports Gemini 2.5 series with thinking control and Imagen 4.0 variants

import { GoogleGenerativeAI } from '@google/generative-ai';

export class GoogleProvider {
  constructor(config) {
    this.provider = 'google';
    this.config = config;
    this.client = new GoogleGenerativeAI(this.decryptApiKey(config.apiKeyEncrypted));
    
    // Model configurations with 2025 pricing and features
    this.models = {
      'gemini-2.5-pro': {
        maxTokens: 8000,
        inputCost: 0.003,  // per 1K tokens
        outputCost: 0.012,
        contextWindow: 1000000, // 1M tokens
        supportsThinking: true,
        supportsMultimodal: true,
        supportsStreaming: true
      },
      'gemini-2.5-flash': {
        maxTokens: 8000,
        inputCost: 0.00075,
        outputCost: 0.003,
        contextWindow: 1000000,
        supportsThinking: true,
        supportsThinkingBudget: true,
        supportsMultimodal: true,
        supportsStreaming: true
      },
      'gemini-2.5-flash-lite': {
        maxTokens: 8000,
        inputCost: 0.000375,
        outputCost: 0.0015,
        contextWindow: 1000000,
        supportsThinking: false, // Lite version doesn't support thinking
        supportsMultimodal: true,
        supportsStreaming: true
      },
      'imagen-4.0-generate-001': {
        type: 'image',
        cost: 0.04, // per image
        maxImages: 4,
        resolutions: ['1K', '2K'],
        aspectRatios: ['1:1', '9:16', '16:9', '3:4', '4:3']
      },
      'imagen-4.0-ultra-generate-001': {
        type: 'image',
        cost: 0.06, // per image
        maxImages: 2,
        resolutions: ['2K'],
        aspectRatios: ['1:1', '9:16', '16:9', '3:4', '4:3']
      },
      'imagen-4.0-fast-generate-001': {
        type: 'image',
        cost: 0.02, // per image
        maxImages: 4,
        resolutions: ['1K'],
        aspectRatios: ['1:1', '9:16', '16:9', '3:4', '4:3']
      }
    };
  }

  // ================================
  // GENERATION METHODS
  // ================================

  async generate(config) {
    const { task, prompt, model = 'gemini-2.5-flash', options = {} } = config;
    const modelConfig = this.models[model];
    
    if (!modelConfig) {
      throw new Error(`Model ${model} not supported`);
    }

    return await this.executeWithRetry(async () => {
      const startTime = Date.now();
      let result;
      
      if (modelConfig.type === 'image') {
        result = await this.generateImage(prompt, model, options);
      } else {
        result = await this.generateText(prompt, model, task, options);
      }

      const latency = Date.now() - startTime;
      
      return {
        content: result.content,
        usage: {
          inputTokens: result.usage?.inputTokens || 0,
          outputTokens: result.usage?.outputTokens || 0,
          thinkingTokens: result.usage?.thinkingTokens || 0,
          totalTokens: result.usage?.totalTokens || 0,
          cost: this.calculateCost(result.usage, model),
          latencyMs: latency
        },
        metadata: {
          model,
          provider: this.provider,
          finishReason: result.finishReason,
          safetyRatings: result.safetyRatings,
          blockReason: result.blockReason,
          thinkingBudgetUsed: result.thinkingBudgetUsed,
          citationMetadata: result.citationMetadata,
          ...(result.metadata || {})
        }
      };
    }, options.maxRetries, options.retryDelay);
  }

  async generateText(prompt, model, task, options) {
    const modelConfig = this.models[model];
    const geminiModel = this.client.getGenerativeModel({ 
      model,
      ...this.getModelConfig(task, options, modelConfig)
    });

    // Build content array for multimodal support
    const content = this.buildContent(prompt, options);
    
    // Generate content
    const response = await geminiModel.generateContent(content);
    const result = response.response;
    
    // Handle blocked content
    if (result.promptFeedback?.blockReason) {
      throw new Error(`Content blocked: ${result.promptFeedback.blockReason}`);
    }

    const text = result.text();
    const usage = this.extractUsage(result);
    
    return {
      content: text,
      usage,
      finishReason: result.candidates?.[0]?.finishReason,
      safetyRatings: result.candidates?.[0]?.safetyRatings,
      blockReason: result.promptFeedback?.blockReason,
      thinkingBudgetUsed: usage.thinkingTokens > 0,
      citationMetadata: result.candidates?.[0]?.citationMetadata
    };
  }

  async generateImage(prompt, model, options = {}) {
    // Note: This is a placeholder implementation
    // Google's Imagen API might have different SDK patterns
    const modelConfig = this.models[model];
    
    const imageConfig = {
      numberOfImages: Math.min(options.count || 2, modelConfig.maxImages),
      aspectRatio: options.aspectRatio || '1:1',
      sampleImageSize: options.resolution || '1K',
      personGeneration: options.personGeneration || 'allow_adult',
      ...options.imageConfig
    };

    // Placeholder for actual Imagen API call
    // In practice, this would use Google's image generation API
    const response = {
      generatedImages: [],
      usage: { images_generated: imageConfig.numberOfImages }
    };

    return {
      content: response.generatedImages,
      usage: response.usage
    };
  }

  // ================================
  // STREAMING METHODS
  // ================================

  supportsStreaming() {
    return true;
  }

  async *generateStream(config) {
    const { task, prompt, model = 'gemini-2.5-flash', options = {} } = config;
    const modelConfig = this.models[model];
    
    if (!modelConfig.supportsStreaming) {
      throw new Error(`Model ${model} does not support streaming`);
    }

    if (modelConfig.type === 'image') {
      throw new Error('Image generation does not support streaming');
    }

    try {
      const geminiModel = this.client.getGenerativeModel({ 
        model,
        ...this.getModelConfig(task, options, modelConfig)
      });

      const content = this.buildContent(prompt, options);
      const stream = await geminiModel.generateContentStream(content);
      
      let totalInputTokens = 0;
      let totalOutputTokens = 0;
      let totalThinkingTokens = 0;
      
      for await (const chunk of stream) {
        const chunkText = chunk.text();
        const usage = this.extractUsage(chunk);
        
        if (usage.inputTokens) totalInputTokens = usage.inputTokens;
        if (usage.outputTokens) totalOutputTokens += usage.outputTokens;
        if (usage.thinkingTokens) totalThinkingTokens += usage.thinkingTokens;
        
        if (chunkText) {
          yield {
            type: 'content',
            content: chunkText,
            usage: {
              inputTokens: totalInputTokens,
              outputTokens: totalOutputTokens,
              thinkingTokens: totalThinkingTokens,
              totalTokens: totalInputTokens + totalOutputTokens + totalThinkingTokens
            }
          };
        }
      }
      
      // Final completion event
      yield {
        type: 'completion',
        usage: {
          inputTokens: totalInputTokens,
          outputTokens: totalOutputTokens,
          thinkingTokens: totalThinkingTokens,
          totalTokens: totalInputTokens + totalOutputTokens + totalThinkingTokens,
          cost: this.calculateCost({
            inputTokens: totalInputTokens,
            outputTokens: totalOutputTokens,
            thinkingTokens: totalThinkingTokens
          }, model)
        }
      };
    } catch (error) {
      console.error(`Google streaming error:`, error);
      throw this.handleError(error);
    }
  }

  // ================================
  // CONFIGURATION BUILDERS
  // ================================

  getModelConfig(task, options, modelConfig) {
    const config = {};
    
    // System instruction
    const systemInstruction = this.buildSystemInstruction(task, options);
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }
    
    // Generation config
    const generationConfig = {
      temperature: this.getTemperature(task, options),
      maxOutputTokens: Math.min(
        options.maxTokens || 4000,
        modelConfig.maxTokens
      ),
      ...this.getAdvancedConfig(options)
    };
    
    // Thinking configuration (only for supported models)
    if (modelConfig.supportsThinking && options.thinking !== false) {
      const thinkingConfig = this.getThinkingConfig(task, options, modelConfig);
      if (thinkingConfig) {
        generationConfig.thinkingConfig = thinkingConfig;
      }
    }
    
    config.generationConfig = generationConfig;
    
    // Safety settings
    config.safetySettings = this.getSafetySettings(options);
    
    return config;
  }

  buildSystemInstruction(task, options) {
    const instructions = [];
    
    // Role-based instruction
    const roleInstruction = this.getRoleInstruction(task, options.vertical);
    if (roleInstruction) {
      instructions.push(roleInstruction);
    }
    
    // Task-specific instruction
    const taskInstruction = this.getTaskInstruction(task);
    if (taskInstruction) {
      instructions.push(taskInstruction);
    }
    
    // Vertical context
    if (options.vertical && options.vertical !== 'all') {
      const verticalContext = this.getVerticalContext(options.vertical);
      if (verticalContext) {
        instructions.push(verticalContext);
      }
    }
    
    // Custom system instruction
    if (options.systemInstruction) {
      instructions.push(options.systemInstruction);
    }
    
    return instructions.join('\n\n');
  }

  buildContent(prompt, options) {
    const parts = [];
    
    // Add text content
    parts.push({ text: this.enhancePrompt(prompt, options) });
    
    // Add multimodal content if provided
    if (options.images && options.images.length > 0) {
      for (const image of options.images) {
        if (typeof image === 'string') {
          // Base64 or URL
          parts.push({
            inlineData: {
              mimeType: image.mimeType || 'image/jpeg',
              data: image.data || image
            }
          });
        } else if (image.fileData) {
          // File reference
          parts.push({
            fileData: {
              mimeType: image.mimeType,
              fileUri: image.fileUri
            }
          });
        }
      }
    }
    
    // Add context if provided
    if (options.context && typeof options.context === 'string') {
      parts.unshift({ text: `Context: ${options.context}` });
    }
    
    return { parts };
  }

  getThinkingConfig(task, options, modelConfig) {
    // Allow explicit override
    if (options.thinking !== undefined) {
      if (options.thinking === false) {
        return null; // Disable thinking
      } else if (typeof options.thinking === 'object') {
        return options.thinking; // Custom thinking config
      }
    }
    
    // Only Flash models support thinking budget
    if (!modelConfig.supportsThinkingBudget) {
      return null; // Use default thinking
    }
    
    // Task-based thinking budget
    const budgetMap = {
      'blog_writing_complete': { thinkingBudget: 800 },
      'idea_generation': { thinkingBudget: 200 },
      'title_generation': { thinkingBudget: 0 }, // Disable for speed
      'synopsis_generation': { thinkingBudget: 300 },
      'outline_creation': { thinkingBudget: 500 },
      'blog_editing': { thinkingBudget: 600 },
      'seo_analysis': { thinkingBudget: 100 },
      'social_post_generation': { thinkingBudget: 0 },
      'image_prompt_generation': { thinkingBudget: 200 }
    };
    
    return budgetMap[task] || { thinkingBudget: 300 }; // Default moderate budget
  }

  getAdvancedConfig(options) {
    const config = {};
    
    // Top-k sampling
    if (options.topK !== undefined) {
      config.topK = options.topK;
    }
    
    // Top-p sampling
    if (options.topP !== undefined) {
      config.topP = options.topP;
    }
    
    // Stop sequences
    if (options.stopSequences) {
      config.stopSequences = options.stopSequences;
    }
    
    // Response MIME type for structured outputs
    if (options.responseMimeType) {
      config.responseMimeType = options.responseMimeType;
    }
    
    // Response schema for structured outputs
    if (options.responseSchema) {
      config.responseSchema = options.responseSchema;
    }
    
    return config;
  }

  getSafetySettings(options) {
    // Default safety settings - can be overridden
    const defaultSettings = [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      }
    ];
    
    return options.safetySettings || defaultSettings;
  }

  // ================================
  // TASK-SPECIFIC CONFIGURATIONS
  // ================================

  getRoleInstruction(task, vertical) {
    const roleMap = {
      'blog_writing_complete': 'You are an expert content writer who creates engaging, SEO-optimized blog posts.',
      'idea_generation': 'You are a creative strategist who generates innovative and actionable content ideas.',
      'title_generation': 'You are a copywriting expert who creates compelling, click-worthy headlines.',
      'synopsis_generation': 'You are a content strategist who writes clear, engaging summaries.',
      'outline_creation': 'You are a content strategist who creates well-structured, logical outlines.',
      'seo_analysis': 'You are an SEO expert who analyzes content for search optimization.',
      'blog_editing': 'You are an experienced editor who improves content clarity and engagement.',
      'social_post_generation': 'You are a social media expert who creates engaging platform-specific content.',
      'image_prompt_generation': 'You are a visual creative who writes detailed, artistic image descriptions.'
    };
    
    let instruction = roleMap[task] || 'You are a helpful AI assistant.';
    
    if (vertical && vertical !== 'all') {
      instruction += ` You have deep expertise in the ${vertical} industry.`;
    }
    
    return instruction;
  }

  getTaskInstruction(task) {
    const instructions = {
      'blog_writing_complete': `
        Write a comprehensive blog post that:
        - Starts with a compelling hook
        - Uses clear headers and scannable formatting
        - Provides valuable, actionable information
        - Includes relevant examples and insights
        - Ends with a strong call to action
        - Is optimized for SEO naturally
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
        - Clearly convey value proposition
        - Are SEO-friendly but natural
        - Match the content tone
        - Are appropriate length for the platform
      `,
      'seo_analysis': `
        Analyze the content for:
        - Keyword optimization opportunities
        - Content structure and readability
        - Meta description effectiveness
        - Internal linking possibilities
        - Technical SEO considerations
      `
    };
    
    return instructions[task]?.trim();
  }

  getVerticalContext(vertical) {
    const contexts = {
      'hospitality': 'Focus on hotels, restaurants, travel, and guest experience. Consider seasonal trends, customer service excellence, and revenue management strategies.',
      'healthcare': 'Address healthcare providers, patient care, medical compliance, and healthcare technology. Ensure accuracy, sensitivity, and compliance considerations.',
      'tech': 'Cover technology trends, software solutions, digital transformation, and innovation. Use appropriate technical depth for the audience.',
      'athletics': 'Focus on sports, fitness, athlete performance, and sports business. Consider both professional and recreational contexts.'
    };
    
    return contexts[vertical] || '';
  }

  enhancePrompt(prompt, options) {
    let enhancedPrompt = prompt;
    
    // Add context prefix if not already included in system instruction
    if (options.context && !options.systemInstruction) {
      enhancedPrompt = `Context: ${options.context}\n\n${enhancedPrompt}`;
    }
    
    return enhancedPrompt;
  }

  getTemperature(task, options) {
    // Allow explicit override
    if (options.temperature !== undefined) {
      return options.temperature;
    }
    
    const temperatureMap = {
      'idea_generation': 0.9,
      'title_generation': 0.8,
      'blog_writing_complete': 0.7,
      'social_post_generation': 0.8,
      'blog_editing': 0.3,
      'seo_analysis': 0.1,
      'synopsis_generation': 0.6,
      'outline_creation': 0.5,
      'image_prompt_generation': 0.8
    };
    
    return temperatureMap[task] || 0.7;
  }

  // ================================
  // UTILITY METHODS
  // ================================

  extractUsage(result) {
    const usage = result.usageMetadata || {};
    
    return {
      inputTokens: usage.promptTokenCount || 0,
      outputTokens: usage.candidatesTokenCount || 0,
      thinkingTokens: usage.thinkingTokenCount || 0,
      totalTokens: usage.totalTokenCount || 0
    };
  }

  calculateCost(usage, model) {
    const modelConfig = this.models[model];
    if (!modelConfig || !usage) return 0;

    if (modelConfig.type === 'image') {
      const imageCount = usage.images_generated || 0;
      return parseFloat((imageCount * modelConfig.cost).toFixed(6));
    }

    let cost = 0;
    cost += (usage.inputTokens || 0) * (modelConfig.inputCost / 1000);
    cost += (usage.outputTokens || 0) * (modelConfig.outputCost / 1000);
    
    // Thinking tokens are charged at input rate
    if (usage.thinkingTokens) {
      cost += usage.thinkingTokens * (modelConfig.inputCost / 1000);
    }

    return parseFloat(cost.toFixed(6));
  }

  async estimateCost(tokens, model) {
    const modelConfig = this.models[model];
    if (!modelConfig) return 0;

    if (modelConfig.type === 'image') {
      return modelConfig.cost; // Per image
    }

    // Rough estimate: 70% input, 30% output
    const inputTokens = Math.floor(tokens * 0.7);
    const outputTokens = Math.floor(tokens * 0.3);

    return this.calculateCost(
      { inputTokens, outputTokens },
      model
    );
  }

  async checkHealth() {
    try {
      // Simple health check with minimal token usage
      const model = this.client.getGenerativeModel({ 
        model: 'gemini-2.5-flash-lite',
        generationConfig: {
          maxOutputTokens: 10,
          temperature: 0
        }
      });
      
      const result = await model.generateContent('Hello');
      
      return {
        status: 'healthy',
        model: 'gemini-2.5-flash-lite',
        response: result.response.text(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Google health check failed: ${error.message}`);
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
    // Handle Google-specific error types
    if (error.status) {
      switch (error.status) {
        case 400:
          if (error.message.includes('token limit')) {
            return new Error(`Google token limit exceeded: ${error.message}`);
          }
          return new Error(`Google bad request: ${error.message}`);
        case 401:
          return new Error(`Google authentication failed: Invalid API key`);
        case 403:
          return new Error(`Google forbidden: ${error.message}`);
        case 429:
          const retryAfter = error.headers?.['retry-after'];
          const retryMsg = retryAfter ? ` (retry after ${retryAfter} seconds)` : '';
          return new Error(`Google rate limit exceeded: ${error.message}${retryMsg}`);
        case 500:
        case 502:
        case 503:
        case 504:
          return new Error(`Google server error (${error.status}): ${error.message}`);
      }
    }

    // Handle content blocking
    if (error.message && error.message.includes('BLOCKED')) {
      return new Error(`Google content blocked: ${error.message}`);
    }

    // Handle quota exceeded
    if (error.message && error.message.includes('quota')) {
      return new Error(`Google quota exceeded: ${error.message}`);
    }

    return new Error(`Google error: ${error.message}`);
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

        console.warn(`Google request failed (attempt ${attempt}/${maxRetries}), retrying in ${Math.round(totalDelay)}ms:`, error.message);
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