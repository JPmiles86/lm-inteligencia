// Real Generation Service with Multi-Provider Support
import pg from 'pg';
import crypto from 'crypto';
const { Pool } = pg;

export class GenerationService {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  // Decrypt API key from database
  decryptApiKey(encryptedKey, salt) {
    if (!encryptedKey || !salt) return null;
    
    try {
      // Use a simple XOR decryption for now (in production, use proper encryption)
      // This is a placeholder - implement proper decryption based on your encryption method
      const decipher = crypto.createDecipher('aes-256-cbc', salt);
      let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Error decrypting API key:', error);
      // For now, return the encrypted key as-is (for testing)
      return encryptedKey;
    }
  }

  // Get provider configuration from database
  async getProviderConfig(provider) {
    try {
      const query = `
        SELECT api_key_encrypted, encryption_salt, default_model, fallback_model
        FROM provider_settings
        WHERE provider = $1
      `;
      
      const result = await this.pool.query(query, [provider]);
      
      if (result.rows.length === 0) {
        console.error(`No configuration found for provider: ${provider}`);
        return null;
      }
      
      const config = result.rows[0];
      
      // Decrypt the API key
      const apiKey = this.decryptApiKey(config.api_key_encrypted, config.encryption_salt);
      
      if (!apiKey) {
        console.error(`Failed to decrypt API key for provider: ${provider}`);
        return null;
      }
      
      return {
        apiKey,
        defaultModel: config.default_model,
        fallbackModel: config.fallback_model
      };
    } catch (error) {
      console.error('Error fetching provider config:', error);
      return null;
    }
  }

  // Helper to get style guides by IDs
  async getStyleGuidesByIds(guideIds) {
    if (!guideIds || guideIds.length === 0) return [];
    
    try {
      const placeholders = guideIds.map((_, i) => `$${i + 1}`).join(',');
      const query = `
        SELECT id, type, name, content, description 
        FROM style_guides 
        WHERE id::text IN (${placeholders})
      `;
      
      const result = await this.pool.query(query, guideIds);
      return result.rows;
    } catch (error) {
      console.error('Error fetching style guides:', error);
      return [];
    }
  }

  // Build context from style guides
  async buildContextFromGuides(styleGuideIds) {
    const guides = await this.getStyleGuidesByIds(styleGuideIds);
    
    if (guides.length === 0) return '';
    
    let context = '## Style Guidelines\n\n';
    
    guides.forEach(guide => {
      context += `### ${guide.name}\n`;
      if (guide.description) {
        context += `${guide.description}\n\n`;
      }
      context += `${guide.content}\n\n`;
    });
    
    return context;
  }

  // Generate with OpenAI
  async generateWithOpenAI(config, apiKey) {
    const {
      prompt,
      systemPrompt,
      model = 'gpt-4o',
      temperature = 0.7,
      maxTokens = 4000,
      task = 'blog'
    } = config;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: temperature,
        max_tokens: maxTokens,
        response_format: task === 'blog' ? { type: 'json_object' } : undefined
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage
    };
  }

  // Generate with Anthropic
  async generateWithAnthropic(config, apiKey) {
    const {
      prompt,
      systemPrompt,
      model = 'claude-3-opus-20240229',
      temperature = 0.7,
      maxTokens = 4000
    } = config;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
        temperature: temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      usage: {
        total_tokens: data.usage?.input_tokens + data.usage?.output_tokens,
        prompt_tokens: data.usage?.input_tokens,
        completion_tokens: data.usage?.output_tokens
      }
    };
  }

  // Generate with Google (Gemini)
  async generateWithGoogle(config, apiKey) {
    const {
      prompt,
      systemPrompt,
      model = 'gemini-pro',
      temperature = 0.7,
      maxTokens = 4000
    } = config;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${prompt}`
          }]
        }],
        generationConfig: {
          temperature: temperature,
          maxOutputTokens: maxTokens
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
      content: data.candidates[0].content.parts[0].text,
      usage: {
        total_tokens: data.usageMetadata?.totalTokenCount || 0,
        prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
        completion_tokens: data.usageMetadata?.candidatesTokenCount || 0
      }
    };
  }

  // Generate with Perplexity
  async generateWithPerplexity(config, apiKey) {
    const {
      prompt,
      systemPrompt,
      model = 'llama-3-sonar-large-32k-online',
      temperature = 0.7,
      maxTokens = 4000
    } = config;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Perplexity API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage
    };
  }

  // Main generation method
  async generateContent(config) {
    const startTime = Date.now();
    
    try {
      // Extract configuration
      const {
        prompt,
        context = {},
        provider = 'openai',
        model,
        temperature = 0.7,
        maxTokens = 4000,
        mode = 'quick',
        task = 'blog',
        vertical = 'hospitality'
      } = config;

      // Get provider configuration from database
      const providerConfig = await this.getProviderConfig(provider);
      
      if (!providerConfig || !providerConfig.apiKey) {
        return {
          success: false,
          error: `Provider ${provider} is not configured. Please add API key in the admin panel.`,
          generation: null
        };
      }

      // Use model from request or fall back to provider's default
      const finalModel = model || providerConfig.defaultModel || this.getDefaultModel(provider);

      // Build context from style guides
      let fullContext = '';
      
      // Add style guides context
      if (context.styleGuides) {
        const allGuideIds = [];
        
        // Collect all guide IDs
        if (context.styleGuides.vertical && Array.isArray(context.styleGuides.vertical)) {
          allGuideIds.push(...context.styleGuides.vertical);
        }
        if (context.styleGuides.persona && Array.isArray(context.styleGuides.persona)) {
          allGuideIds.push(...context.styleGuides.persona);
        }
        if (context.styleGuides.writingStyle && Array.isArray(context.styleGuides.writingStyle)) {
          allGuideIds.push(...context.styleGuides.writingStyle);
        }
        
        // Get brand guide if specified
        if (context.styleGuides.brand === true) {
          // Fetch the active brand guide
          const brandQuery = `
            SELECT id FROM style_guides 
            WHERE type = 'brand' AND active = true 
            LIMIT 1
          `;
          const brandResult = await this.pool.query(brandQuery);
          if (brandResult.rows.length > 0) {
            allGuideIds.push(brandResult.rows[0].id);
          }
        }
        
        if (allGuideIds.length > 0) {
          fullContext = await this.buildContextFromGuides(allGuideIds);
        }
      }
      
      // Add additional context
      if (context.additionalContext) {
        fullContext += `\n## Additional Instructions\n${context.additionalContext}\n`;
      }

      // Build the system prompt based on task
      let systemPrompt = `You are an expert content creator specializing in ${vertical} industry content.`;
      
      if (fullContext) {
        systemPrompt += `\n\nPlease follow these style guidelines and context:\n\n${fullContext}`;
      }

      // Build the user prompt based on task
      let userPrompt = '';
      
      if (task === 'blog') {
        userPrompt = `Create a comprehensive blog post about "${prompt}" for the ${vertical} industry.

Please provide the content in the following JSON format:
{
  "title": "Engaging blog title",
  "slug": "url-friendly-slug",
  "synopsis": "Brief 2-3 sentence summary of the blog post",
  "content": "Full blog content in markdown format with proper headings, paragraphs, and formatting",
  "tags": ["relevant", "tags", "for", "the", "post"],
  "metaTitle": "SEO optimized title (60 chars max)",
  "metaDescription": "SEO meta description (160 chars max)",
  "keywords": ["seo", "keywords"],
  "readingTime": "estimated reading time in minutes",
  "targetAudience": "primary audience for this content"
}

Make the content engaging, informative, and valuable for readers in the ${vertical} industry.`;
      } else {
        userPrompt = prompt;
      }

      // Call the appropriate provider
      let result;
      const generationConfig = {
        prompt: userPrompt,
        systemPrompt,
        model: finalModel,
        temperature,
        maxTokens,
        task
      };

      switch (provider) {
        case 'openai':
          result = await this.generateWithOpenAI(generationConfig, providerConfig.apiKey);
          break;
        case 'anthropic':
          result = await this.generateWithAnthropic(generationConfig, providerConfig.apiKey);
          break;
        case 'google':
          result = await this.generateWithGoogle(generationConfig, providerConfig.apiKey);
          break;
        case 'perplexity':
          result = await this.generateWithPerplexity(generationConfig, providerConfig.apiKey);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      // Parse the response based on task type
      let finalContent;
      
      if (task === 'blog') {
        try {
          // Parse JSON response for blog
          finalContent = JSON.parse(result.content);
        } catch (parseError) {
          console.error('Error parsing blog JSON:', parseError);
          // Fallback to raw content
          finalContent = {
            title: prompt,
            content: result.content,
            synopsis: 'AI generated content',
            tags: [],
            metaTitle: prompt.substring(0, 60),
            metaDescription: 'AI generated blog post',
            keywords: []
          };
        }
      } else {
        finalContent = result.content;
      }

      const endTime = Date.now();
      
      // Calculate costs based on provider and model
      const tokensUsed = result.usage?.total_tokens || 0;
      const cost = this.calculateCost(provider, finalModel, tokensUsed);

      // Update provider usage in database
      await this.updateProviderUsage(provider, cost);

      return {
        success: true,
        generation: finalContent,
        tokensUsed: tokensUsed,
        cost: cost,
        durationMs: endTime - startTime,
        model: finalModel,
        provider: provider
      };

    } catch (error) {
      console.error('Generation error:', error);
      return {
        success: false,
        error: error.message,
        generation: null,
        tokensUsed: 0,
        cost: 0,
        durationMs: Date.now() - startTime
      };
    }
  }

  // Get default model for provider
  getDefaultModel(provider) {
    const defaults = {
      openai: 'gpt-4o',
      anthropic: 'claude-3-opus-20240229',
      google: 'gemini-pro',
      perplexity: 'llama-3-sonar-large-32k-online'
    };
    return defaults[provider] || 'gpt-4o';
  }

  // Calculate cost based on provider and model
  calculateCost(provider, model, tokens) {
    // Rough cost estimates per 1K tokens
    const costs = {
      openai: {
        'gpt-4o': 0.03,
        'gpt-4': 0.03,
        'gpt-3.5-turbo': 0.002
      },
      anthropic: {
        'claude-3-opus-20240229': 0.015,
        'claude-3-sonnet-20240229': 0.003
      },
      google: {
        'gemini-pro': 0.001
      },
      perplexity: {
        'llama-3-sonar-large-32k-online': 0.001
      }
    };
    
    const costPerK = costs[provider]?.[model] || 0.001;
    return (tokens / 1000) * costPerK;
  }

  // Update provider usage in database
  async updateProviderUsage(provider, cost) {
    try {
      const query = `
        UPDATE provider_settings 
        SET current_usage = current_usage + $1
        WHERE provider = $2
      `;
      await this.pool.query(query, [cost, provider]);
    } catch (error) {
      console.error('Error updating provider usage:', error);
    }
  }

  // Generate variations of existing content
  async generateVariations(config) {
    const { baseContent, count = 3, variationType = 'tone' } = config;
    
    const variations = [];
    for (let i = 0; i < count; i++) {
      const result = await this.generateContent({
        prompt: `Create a ${variationType} variation of this content: ${baseContent}`,
        temperature: 0.9
      });
      
      if (result.success) {
        variations.push(result.generation);
      }
    }
    
    return variations;
  }

  // Generate SEO metadata
  async generateSEOMetadata(config) {
    const { content, targetKeywords = [] } = config;
    
    const prompt = `Generate SEO metadata for this content. Target keywords: ${targetKeywords.join(', ')}
    
Content: ${content}

Provide response as JSON with: title, description, keywords array`;
    
    const result = await this.generateContent({
      prompt,
      temperature: 0.3,
      provider: config.provider || 'openai',
      model: config.model || 'gpt-3.5-turbo'
    });
    
    if (result.success) {
      try {
        return JSON.parse(result.generation);
      } catch {
        return {
          title: 'Generated Title',
          description: 'Generated Description',
          keywords: targetKeywords
        };
      }
    }
    
    return {
      title: '',
      description: '',
      keywords: []
    };
  }

  // Enhance existing content
  async enhanceContent(config) {
    const { content, enhancements = ['clarity', 'engagement'] } = config;
    
    const prompt = `Enhance this content for better ${enhancements.join(' and ')}:
    
${content}`;
    
    const result = await this.generateContent({
      prompt,
      temperature: 0.7,
      provider: config.provider || 'openai'
    });
    
    return {
      content: result.success ? result.generation : content
    };
  }
}