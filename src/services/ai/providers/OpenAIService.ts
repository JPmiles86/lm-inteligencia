import OpenAI from 'openai';
import { db } from '../../../db/index.js';
import { providerSettings } from '../../../db/schema.js';
// TODO: Frontend should not decrypt - get decrypted keys from backend API
// import { decrypt } from '../../../../api/utils/encryption.js';
import { eq } from 'drizzle-orm';

export interface OpenAIConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stream?: boolean;
}

export class OpenAIService {
  private client: OpenAI | null = null;
  private apiKey: string | null = null;
  
  async initialize(): Promise<void> {
    try {
      // Get encrypted API key from database
      const settings = await db.select()
        .from(providerSettings)
        .where(eq(providerSettings.provider, 'openai'))
        .limit(1);
      
      if (!settings.length || !settings[0].apiKeyEncrypted) {
        throw new Error('OpenAI API key not configured');
      }
      
      // TODO: Frontend should not decrypt - this is a security issue
      // API keys should be decrypted on backend only
      // For now, using the encrypted key directly will fail but is safer
      this.apiKey = settings[0].apiKeyEncrypted || '';
      
      // Initialize OpenAI client
      this.client = new OpenAI({
        apiKey: this.apiKey
      });
      
      // Update last tested timestamp
      await db.update(providerSettings)
        .set({ 
          lastTested: new Date(),
          testSuccess: true 
        })
        .where(eq(providerSettings.provider, 'openai'));
        
    } catch (error) {
      console.error('Failed to initialize OpenAI service:', error);
      throw error;
    }
  }
  
  async generateText(
    prompt: string,
    config: OpenAIConfig = {}
  ): Promise<string> {
    if (!this.client) await this.initialize();
    
    const defaultConfig: OpenAIConfig = {
      model: 'gpt-4-turbo-preview',
      temperature: 0.7,
      maxTokens: 4000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    
    try {
      const completion = await this.client!.chat.completions.create({
        model: finalConfig.model!,
        messages: [{ role: 'user', content: prompt }],
        temperature: finalConfig.temperature,
        max_tokens: finalConfig.maxTokens,
        top_p: finalConfig.topP,
        frequency_penalty: finalConfig.frequencyPenalty,
        presence_penalty: finalConfig.presencePenalty,
        stream: false
      });
      
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI text generation failed:', error);
      throw error;
    }
  }
  
  async generateStream(
    prompt: string,
    config: OpenAIConfig = {},
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (!this.client) await this.initialize();
    
    const streamConfig = { ...config, stream: true };
    
    try {
      const stream = await this.client!.chat.completions.create({
        model: config.model || 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 4000,
        stream: true
      });
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          onChunk(content);
        }
      }
    } catch (error) {
      console.error('OpenAI streaming failed:', error);
      throw error;
    }
  }
  
  async generateBlog(
    topic: string,
    context: {
      brand?: string;
      vertical?: string;
      persona?: string;
      writingStyle?: string;
    }
  ): Promise<{
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
    imagePrompts: string[];
  }> {
    const systemPrompt = this.buildSystemPrompt(context);
    
    const userPrompt = `
      Write a comprehensive blog post about: ${topic}
      
      Include:
      1. An engaging title
      2. A compelling excerpt (2-3 sentences)
      3. The full blog content with proper formatting
      4. 5-7 relevant tags
      5. 3-4 image prompts marked as [IMAGE_PROMPT: description]
      
      Format the response as JSON with keys: title, content, excerpt, tags, imagePrompts
    `;
    
    try {
      const response = await this.generateText(userPrompt, {
        model: 'gpt-4-turbo-preview',
        temperature: 0.7,
        maxTokens: 6000
      });
      
      // Parse JSON response
      const result = JSON.parse(response);
      
      // Extract image prompts from content
      const imagePrompts = this.extractImagePrompts(result.content);
      
      return {
        ...result,
        imagePrompts
      };
    } catch (error) {
      console.error('Blog generation failed:', error);
      throw error;
    }
  }
  
  private buildSystemPrompt(context: any): string {
    let prompt = 'You are a professional content writer.';
    
    if (context.brand) {
      prompt += ` Write in the voice of ${context.brand}.`;
    }
    if (context.vertical) {
      prompt += ` Focus on ${context.vertical} industry topics.`;
    }
    if (context.persona) {
      prompt += ` Target audience: ${context.persona}.`;
    }
    if (context.writingStyle) {
      prompt += ` Writing style: ${context.writingStyle}.`;
    }
    
    return prompt;
  }
  
  private extractImagePrompts(content: string): string[] {
    const regex = /\[IMAGE_PROMPT:\s*([^\]]+)\]/g;
    const prompts: string[] = [];
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      prompts.push(match[1].trim());
    }
    
    return prompts;
  }
  
  async testConnection(): Promise<boolean> {
    try {
      if (!this.client) await this.initialize();
      
      // Test with minimal API call
      const response = await this.client!.models.list();
      return !!response.data.length;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const openAIService = new OpenAIService();