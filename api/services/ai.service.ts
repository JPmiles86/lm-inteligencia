/**
 * AI Service - Backend Only
 * Handles all AI API calls with decrypted keys on the server
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../index';
import { providerSettings } from '../../src/db/schema';
import { eq } from 'drizzle-orm';
import { encryptionService } from './encryption.service';

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

class AIService {
  private openaiClient: OpenAI | null = null;
  private anthropicClient: Anthropic | null = null;
  private googleClient: GoogleGenerativeAI | null = null;

  /**
   * Get provider configuration from database
   */
  private async getProviderConfig(providerName: string) {
    const result = await db
      .select()
      .from(providerSettings)
      .where(eq(providerSettings.provider, providerName as any))
      .limit(1);

    if (!result.length || !result[0].apiKeyEncrypted) {
      throw new Error(`Provider ${providerName} not configured`);
    }

    const provider = result[0];
    // Decrypt the API key on the backend only!
    const decryptedKey = encryptionService.decrypt(provider.apiKeyEncrypted);

    return {
      ...provider,
      apiKey: decryptedKey,
    };
  }

  /**
   * Initialize OpenAI client
   */
  private async initOpenAI() {
    if (this.openaiClient) return this.openaiClient;

    const config = await this.getProviderConfig('openai');
    this.openaiClient = new OpenAI({
      apiKey: config.apiKey,
    });

    return this.openaiClient;
  }

  /**
   * Initialize Anthropic client
   */
  private async initAnthropic() {
    if (this.anthropicClient) return this.anthropicClient;

    const config = await this.getProviderConfig('anthropic');
    this.anthropicClient = new Anthropic({
      apiKey: config.apiKey,
    });

    return this.anthropicClient;
  }

  /**
   * Initialize Google AI client
   */
  private async initGoogle() {
    if (this.googleClient) return this.googleClient;

    const config = await this.getProviderConfig('google');
    this.googleClient = new GoogleGenerativeAI(config.apiKey);

    return this.googleClient;
  }

  /**
   * Generate text with OpenAI
   */
  async generateWithOpenAI(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      const client = await this.initOpenAI();
      
      const completion = await client.chat.completions.create({
        model: request.model || 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: request.prompt }],
        max_tokens: request.maxTokens || 4000,
        temperature: request.temperature || 0.7,
      });

      return {
        success: true,
        content: completion.choices[0]?.message?.content || '',
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        },
        provider: 'openai',
        model: completion.model,
      };
    } catch (error: any) {
      console.error('OpenAI generation error:', error);
      return {
        success: false,
        error: error.message || 'OpenAI generation failed',
        provider: 'openai',
        model: request.model || 'gpt-4-turbo-preview',
      };
    }
  }

  /**
   * Generate image with OpenAI DALL-E
   */
  async generateImageWithOpenAI(prompt: string, size: string = '1024x1024'): Promise<GenerationResponse> {
    try {
      const client = await this.initOpenAI();
      
      const response = await client.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: size as any,
        quality: 'standard',
        style: 'natural',
      });

      return {
        success: true,
        imageUrl: response.data?.[0]?.url,
        provider: 'openai',
        model: 'dall-e-3',
      };
    } catch (error: any) {
      console.error('DALL-E generation error:', error);
      return {
        success: false,
        error: error.message || 'Image generation failed',
        provider: 'openai',
        model: 'dall-e-3',
      };
    }
  }

  /**
   * Generate text with Anthropic
   */
  async generateWithAnthropic(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      const client = await this.initAnthropic();
      
      const completion = await client.messages.create({
        model: request.model || 'claude-3-opus-20240229',
        messages: [{ role: 'user', content: request.prompt }],
        max_tokens: request.maxTokens || 4000,
        temperature: request.temperature || 0.7,
      });

      const content = completion.content[0]?.type === 'text' 
        ? completion.content[0].text 
        : '';

      return {
        success: true,
        content,
        usage: {
          promptTokens: completion.usage?.input_tokens || 0,
          completionTokens: completion.usage?.output_tokens || 0,
          totalTokens: (completion.usage?.input_tokens || 0) + (completion.usage?.output_tokens || 0),
        },
        provider: 'anthropic',
        model: completion.model,
      };
    } catch (error: any) {
      console.error('Anthropic generation error:', error);
      return {
        success: false,
        error: error.message || 'Anthropic generation failed',
        provider: 'anthropic',
        model: request.model || 'claude-3-opus-20240229',
      };
    }
  }

  /**
   * Generate text with Google
   */
  async generateWithGoogle(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      const client = await this.initGoogle();
      const model = client.getGenerativeModel({ 
        model: request.model || 'gemini-pro' 
      });

      const result = await model.generateContent(request.prompt);
      const response = await result.response;
      const content = response.text();

      return {
        success: true,
        content,
        provider: 'google',
        model: request.model || 'gemini-pro',
      };
    } catch (error: any) {
      console.error('Google generation error:', error);
      return {
        success: false,
        error: error.message || 'Google generation failed',
        provider: 'google',
        model: request.model || 'gemini-pro',
      };
    }
  }

  /**
   * Generate content with fallback
   */
  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    // Determine provider order
    const providerOrder = request.provider 
      ? [request.provider] 
      : ['openai', 'anthropic', 'google'];

    // Try each provider in order
    for (const provider of providerOrder) {
      try {
        let response: GenerationResponse;

        switch (provider) {
          case 'openai':
            if (request.type === 'image') {
              response = await this.generateImageWithOpenAI(request.prompt);
            } else {
              response = await this.generateWithOpenAI(request);
            }
            break;
          case 'anthropic':
            response = await this.generateWithAnthropic(request);
            break;
          case 'google':
            response = await this.generateWithGoogle(request);
            break;
          default:
            continue;
        }

        if (response.success) {
          return response;
        }
      } catch (error) {
        console.error(`Provider ${provider} failed, trying next...`);
        continue;
      }
    }

    // All providers failed
    return {
      success: false,
      error: 'All providers failed',
      provider: 'none',
      model: 'none',
    };
  }

  /**
   * Test a provider with a simple prompt
   */
  async testProvider(providerName: string): Promise<boolean> {
    try {
      const response = await this.generate({
        prompt: 'Say "Hello, World!" in one sentence.',
        provider: providerName,
        maxTokens: 50,
      });

      return response.success;
    } catch {
      return false;
    }
  }
}

export const aiService = new AIService();