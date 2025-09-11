import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { db } from '../../../db/index.js';
import { providerSettings } from '../../../db/schema.js';
// TODO: Frontend should not decrypt - get decrypted keys from backend API
// import { decrypt } from '../../../../api/utils/encryption.js';
import { eq } from 'drizzle-orm';

export interface GoogleAIConfig {
  model?: 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-2.5-flash-lite' | 'gemini-1.5-pro' | 'gemini-1.5-flash';
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
  candidateCount?: number;
  stopSequences?: string[];
  thinkingBudget?: number;
  responseMimeType?: string;
  responseSchema?: any;
}

export interface GoogleImageInput {
  data: string;
  mimeType: string;
}

export class GoogleAIService {
  private client: GoogleGenerativeAI | null = null;
  private apiKey: string | null = null;
  
  async initialize(): Promise<void> {
    try {
      // Get encrypted API key from database
      const settings = await db.select()
        .from(providerSettings)
        .where(eq(providerSettings.provider, 'google'))
        .limit(1);
      
      if (!settings.length || !settings[0].apiKeyEncrypted) {
        throw new Error('Google AI API key not configured');
      }
      
      // TODO: Frontend should not decrypt - security issue
      // this.apiKey = decrypt(settings[0].apiKeyEncrypted, settings[0].encryptionSalt || '');
      this.apiKey = settings[0].apiKeyEncrypted || '';
      
      // Initialize Google AI client
      this.client = new GoogleGenerativeAI(this.apiKey);
      
      // Update last tested timestamp
      await db.update(providerSettings)
        .set({ 
          lastTested: new Date(),
          testSuccess: true 
        })
        .where(eq(providerSettings.provider, 'google'));
        
    } catch (error) {
      console.error('Failed to initialize Google AI service:', error);
      throw error;
    }
  }
  
  async generateText(
    prompt: string,
    config: GoogleAIConfig = {}
  ): Promise<string> {
    if (!this.client) await this.initialize();
    
    const defaultConfig: GoogleAIConfig = {
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      maxOutputTokens: 8192,
      topP: 0.95,
      topK: 40,
      candidateCount: 1
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    
    try {
      const model = this.client!.getGenerativeModel({ 
        model: finalConfig.model!,
        generationConfig: {
          temperature: finalConfig.temperature,
          maxOutputTokens: finalConfig.maxOutputTokens,
          topP: finalConfig.topP,
          topK: finalConfig.topK,
          candidateCount: finalConfig.candidateCount,
          stopSequences: finalConfig.stopSequences,
          responseMimeType: finalConfig.responseMimeType,
          responseSchema: finalConfig.responseSchema
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ]
      });
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Google AI text generation failed:', error);
      throw error;
    }
  }
  
  async generateStream(
    prompt: string,
    config: GoogleAIConfig = {},
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (!this.client) await this.initialize();
    
    try {
      const model = this.client!.getGenerativeModel({ 
        model: config.model || 'gemini-2.5-flash',
        generationConfig: {
          temperature: config.temperature || 0.7,
          maxOutputTokens: config.maxOutputTokens || 8192,
          topP: config.topP || 0.95,
          topK: config.topK || 40
        }
      });
      
      const result = await model.generateContentStream(prompt);
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          onChunk(chunkText);
        }
      }
    } catch (error) {
      console.error('Google AI streaming failed:', error);
      throw error;
    }
  }
  
  async generateWithImages(
    prompt: string,
    images: GoogleImageInput[],
    config?: GoogleAIConfig
  ): Promise<string> {
    if (!this.client) await this.initialize();
    
    try {
      const model = this.client!.getGenerativeModel({ 
        model: config?.model || 'gemini-2.5-flash' // All 2.5 models support multimodal
      });
      
      const parts = [
        { text: prompt },
        ...images.map(img => ({
          inlineData: {
            mimeType: img.mimeType,
            data: img.data
          }
        }))
      ];
      
      const result = await model.generateContent(parts);
      return result.response.text();
    } catch (error) {
      console.error('Google AI multimodal generation failed:', error);
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
      keywords?: string[];
      targetLength?: number;
    }
  ): Promise<{
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
    imagePrompts: string[];
  }> {
    const systemContext = this.buildSystemContext(context);
    
    const prompt = `${systemContext}

Write a comprehensive blog post about: ${topic}

Requirements:
1. Create an SEO-optimized title (60-70 characters)
2. Write a compelling excerpt (150-160 characters)
3. Produce detailed content (${context.targetLength || 1500}-${(context.targetLength || 1500) + 500} words) with proper structure
4. Include H2 and H3 headings for organization
5. Generate 5-7 relevant tags
6. Insert 3-4 image prompts in format [IMAGE_PROMPT: detailed description]
${context.keywords?.length ? `7. Naturally incorporate these keywords: ${context.keywords.join(', ')}` : ''}

The content should be:
- Informative and well-researched
- Engaging and conversational
- SEO-optimized with natural keyword usage
- Properly formatted with sections
- Actionable and valuable to readers

Return as JSON with keys: title, excerpt, content, tags, imagePrompts`;
    
    try {
      const response = await this.generateText(prompt, {
        model: 'gemini-2.5-pro', // Use Pro for complex blog generation
        temperature: 0.7,
        maxOutputTokens: 10000,
        responseMimeType: 'application/json'
      });
      
      // Parse JSON response
      const result = JSON.parse(response);
      
      // Extract image prompts if embedded in content and not in result
      if (!result.imagePrompts || result.imagePrompts.length === 0) {
        result.imagePrompts = this.extractImagePrompts(result.content);
      }
      
      return result;
    } catch (error) {
      console.error('Blog generation failed:', error);
      throw error;
    }
  }
  
  async chat(
    messages: Array<{ role: 'user' | 'model'; content: string }>,
    config?: GoogleAIConfig
  ): Promise<string> {
    if (!this.client) await this.initialize();
    
    try {
      const model = this.client!.getGenerativeModel({ 
        model: config?.model || 'gemini-2.5-flash'
      });
      
      const chat = model.startChat({
        history: messages.slice(0, -1).map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          temperature: config?.temperature || 0.7,
          maxOutputTokens: config?.maxOutputTokens || 8192
        }
      });
      
      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage.content);
      return result.response.text();
    } catch (error) {
      console.error('Google AI chat failed:', error);
      throw error;
    }
  }
  
  async countTokens(text: string, model?: string): Promise<number> {
    if (!this.client) await this.initialize();
    
    try {
      const genModel = this.client!.getGenerativeModel({ 
        model: model || 'gemini-2.5-flash'
      });
      
      const result = await genModel.countTokens(text);
      return result.totalTokens;
    } catch (error) {
      console.error('Token counting failed:', error);
      throw error;
    }
  }
  
  async embedText(text: string): Promise<number[]> {
    if (!this.client) await this.initialize();
    
    try {
      const model = this.client!.getGenerativeModel({ 
        model: 'text-embedding-004'
      });
      
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Google AI embedding failed:', error);
      throw error;
    }
  }
  
  private buildSystemContext(context: any): string {
    let prompt = 'You are an expert content writer using Google Gemini AI.';
    
    if (context.brand) {
      prompt += ` You are writing for ${context.brand}.`;
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
      
      // Test with minimal generation
      const model = this.client!.getGenerativeModel({ 
        model: 'gemini-2.5-flash-lite'
      });
      
      const result = await model.generateContent('Say "test"');
      return !!result.response.text();
    } catch (error) {
      console.error('Google AI connection test failed:', error);
      return false;
    }
  }
  
  async getUsageStats(): Promise<{
    tokensUsed: number;
    requestCount: number;
    cost: number;
  }> {
    // This is a placeholder - Google AI doesn't provide real-time usage stats
    // In practice, you'd track this in your database
    return {
      tokensUsed: 0,
      requestCount: 0,
      cost: 0
    };
  }
  
  private calculateCost(inputTokens: number, outputTokens: number, model: string): number {
    // 2025 Gemini pricing (per 1K tokens)
    const pricing: Record<string, { input: number; output: number }> = {
      'gemini-2.5-pro': { input: 0.003, output: 0.012 },
      'gemini-2.5-flash': { input: 0.00075, output: 0.003 },
      'gemini-2.5-flash-lite': { input: 0.000375, output: 0.0015 }
    };
    
    const modelPricing = pricing[model] || pricing['gemini-2.5-flash'];
    const inputCost = (inputTokens / 1000) * modelPricing.input;
    const outputCost = (outputTokens / 1000) * modelPricing.output;
    
    return inputCost + outputCost;
  }
}

// Export singleton instance
export const googleAIService = new GoogleAIService();