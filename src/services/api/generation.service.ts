/**
 * Generation Service - Frontend
 * Calls backend API for all AI generation tasks
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export interface GenerationRequest {
  prompt: string;
  provider?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  type?: 'text' | 'blog' | 'image';
}

export interface GenerationResponse {
  success: boolean;
  content?: string;
  imageUrl?: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  provider: string;
  model: string;
}

export interface ProviderConfig {
  provider: string;
  apiKey: string;
  models?: string[];
  settings?: Record<string, any>;
}

class GenerationService {
  /**
   * Generate content using backend API
   */
  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/generation/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Generation failed:', error);
      return {
        success: false,
        error: error.message || 'Generation failed',
        provider: 'none',
        model: 'none',
      };
    }
  }

  /**
   * Generate image using backend API
   */
  async generateImage(prompt: string, size: string = '1024x1024'): Promise<GenerationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/generation/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, size }),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Image generation failed:', error);
      return {
        success: false,
        error: error.message || 'Image generation failed',
        provider: 'openai',
        model: 'dall-e-3',
      };
    }
  }

  /**
   * Configure a provider (user adds their API key)
   */
  async configureProvider(config: ProviderConfig): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // Use the new provider-save-simple endpoint
      const response = await fetch(`/api/provider-save-simple?provider=${config.provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: config.apiKey }),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Provider configuration failed:', error);
      return {
        success: false,
        error: error.message || 'Configuration failed',
      };
    }
  }

  /**
   * Test a provider's configuration
   */
  async testProvider(provider: string): Promise<{ success: boolean; isValid: boolean; message?: string }> {
    try {
      // Use the new provider-save-simple endpoint with test flag
      const response = await fetch(`/api/provider-save-simple?provider=${provider}&test=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return { ...data, isValid: data.success };
    } catch (error: any) {
      console.error('Provider test failed:', error);
      return {
        success: false,
        isValid: false,
        message: error.message || 'Test failed',
      };
    }
  }

  /**
   * Get configured providers (without API keys)
   */
  async getProviders(): Promise<{ success: boolean; providers?: any[]; error?: string }> {
    try {
      // Use the new providers-simple endpoint
      const response = await fetch(`/api/providers-simple`);
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Failed to get providers:', error);
      return {
        success: false,
        error: error.message || 'Failed to get providers',
      };
    }
  }

  /**
   * Generate blog post with enhanced features
   */
  async generateBlogPost(topic: string, options?: {
    keywords?: string[];
    tone?: string;
    length?: number;
    includeImages?: boolean;
  }): Promise<GenerationResponse> {
    const prompt = this.buildBlogPrompt(topic, options);
    
    const response = await this.generate({
      prompt,
      type: 'blog',
      maxTokens: options?.length || 2000,
      temperature: 0.7,
    });

    // Generate images if requested
    if (options?.includeImages && response.success) {
      // Extract suggested image prompts from content
      const imagePrompts = this.extractImagePrompts(response.content || '');
      
      // Generate images for each prompt
      for (const imagePrompt of imagePrompts) {
        await this.generateImage(imagePrompt);
      }
    }

    return response;
  }

  /**
   * Build a blog post prompt from parameters
   */
  private buildBlogPrompt(topic: string, options?: {
    keywords?: string[];
    tone?: string;
    length?: number;
  }): string {
    let prompt = `Write a comprehensive blog post about "${topic}".`;
    
    if (options?.keywords && options.keywords.length > 0) {
      prompt += ` Include these keywords naturally: ${options.keywords.join(', ')}.`;
    }
    
    if (options?.tone) {
      prompt += ` Use a ${options.tone} tone.`;
    }
    
    if (options?.length) {
      prompt += ` Target length: approximately ${options.length} words.`;
    }
    
    prompt += ' Include a compelling title, introduction, main sections with headers, and a conclusion.';
    
    return prompt;
  }

  /**
   * Extract image prompts from blog content
   */
  private extractImagePrompts(content: string): string[] {
    const prompts: string[] = [];
    
    // Look for [Image: ...] placeholders
    const imageMatches = content.match(/\[Image:\s*([^\]]+)\]/g);
    if (imageMatches) {
      imageMatches.forEach(match => {
        const prompt = match.replace(/\[Image:\s*/, '').replace(/\]/, '');
        prompts.push(prompt);
      });
    }
    
    // If no explicit image prompts, generate one for the main topic
    if (prompts.length === 0 && content.length > 100) {
      // Extract the title or first heading
      const titleMatch = content.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        prompts.push(`Professional blog header image for "${titleMatch[1]}"`);
      }
    }
    
    return prompts;
  }
}

// Export singleton instance
export const generationService = new GenerationService();