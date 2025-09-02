import Anthropic from '@anthropic-ai/sdk';
import { db } from '../../../db';
import { providerSettings } from '../../../db/schema';
// TODO: Frontend should not decrypt - get decrypted keys from backend API
// import { decrypt } from '../../../../api/utils/encryption';
import { eq } from 'drizzle-orm';

export interface AnthropicConfig {
  model?: 'claude-3-opus-20240229' | 'claude-3-sonnet-20240229' | 'claude-3-haiku-20240307';
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  stream?: boolean;
  system?: string;
}

export class AnthropicService {
  private client: Anthropic | null = null;
  private apiKey: string | null = null;
  
  async initialize(): Promise<void> {
    try {
      // Get encrypted API key from database
      const settings = await db.select()
        .from(providerSettings)
        .where(eq(providerSettings.provider, 'anthropic'))
        .limit(1);
      
      if (!settings.length || !settings[0].apiKeyEncrypted) {
        throw new Error('Anthropic API key not configured');
      }
      
      // TODO: Frontend should not decrypt - security issue
      // this.apiKey = decrypt(settings[0].apiKeyEncrypted, settings[0].encryptionSalt || '');
      this.apiKey = settings[0].apiKeyEncrypted || '';
      
      // Initialize Anthropic client
      this.client = new Anthropic({
        apiKey: this.apiKey
      });
      
      // Update last tested timestamp
      await db.update(providerSettings)
        .set({ 
          lastTested: new Date(),
          testSuccess: true 
        })
        .where(eq(providerSettings.provider, 'anthropic'));
        
    } catch (error) {
      console.error('Failed to initialize Anthropic service:', error);
      throw error;
    }
  }
  
  async generateText(
    prompt: string,
    config: AnthropicConfig = {}
  ): Promise<string> {
    if (!this.client) await this.initialize();
    
    const defaultConfig: AnthropicConfig = {
      model: 'claude-3-sonnet-20240229',
      temperature: 0.7,
      maxTokens: 4000,
      topP: 1
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    
    try {
      const message = await this.client!.messages.create({
        model: finalConfig.model!,
        max_tokens: finalConfig.maxTokens!,
        temperature: finalConfig.temperature,
        top_p: finalConfig.topP,
        top_k: finalConfig.topK,
        system: finalConfig.system,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });
      
      // Extract text from response
      const content = message.content[0];
      if (content.type === 'text') {
        return content.text;
      }
      
      return '';
    } catch (error) {
      console.error('Anthropic text generation failed:', error);
      throw error;
    }
  }
  
  async generateStream(
    prompt: string,
    config: AnthropicConfig = {},
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (!this.client) await this.initialize();
    
    try {
      const stream = await this.client!.messages.create({
        model: config.model || 'claude-3-sonnet-20240229',
        max_tokens: config.maxTokens || 4000,
        temperature: config.temperature || 0.7,
        system: config.system,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: true
      });
      
      for await (const messageStreamEvent of stream) {
        if (messageStreamEvent.type === 'content_block_delta') {
          if (messageStreamEvent.delta.type === 'text_delta') {
            onChunk(messageStreamEvent.delta.text);
          }
        }
      }
    } catch (error) {
      console.error('Anthropic streaming failed:', error);
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
      Write a comprehensive, high-quality blog post about: ${topic}
      
      Requirements:
      1. Create an engaging, SEO-optimized title
      2. Write a compelling excerpt (2-3 sentences) that hooks readers
      3. Produce detailed, well-structured content (1500-2000 words)
      4. Include proper formatting with headers, paragraphs, and lists
      5. Generate 5-7 relevant tags for categorization
      6. Insert 3-4 descriptive image prompts in the format [IMAGE_PROMPT: detailed description]
      
      The content should be:
      - Informative and valuable to readers
      - Well-researched and authoritative
      - Engaging and easy to read
      - Properly structured with clear sections
      
      Format your response as valid JSON with these keys:
      {
        "title": "...",
        "excerpt": "...",
        "content": "...",
        "tags": ["tag1", "tag2", ...],
        "imagePrompts": ["prompt1", "prompt2", ...]
      }
    `;
    
    try {
      const response = await this.generateText(userPrompt, {
        model: 'claude-3-opus-20240229', // Use Opus for best quality
        temperature: 0.7,
        maxTokens: 8000,
        system: systemPrompt
      });
      
      // Parse JSON response
      const result = JSON.parse(response);
      
      // Extract image prompts from content if not provided separately
      if (!result.imagePrompts || result.imagePrompts.length === 0) {
        result.imagePrompts = this.extractImagePrompts(result.content);
      }
      
      return result;
    } catch (error) {
      console.error('Blog generation failed:', error);
      throw error;
    }
  }
  
  async improveWriting(
    text: string,
    improvementType: 'clarity' | 'engagement' | 'seo' | 'grammar' | 'tone'
  ): Promise<string> {
    const prompts = {
      clarity: 'Improve the clarity and readability of this text while maintaining its meaning:',
      engagement: 'Make this text more engaging and compelling for readers:',
      seo: 'Optimize this text for search engines while keeping it natural:',
      grammar: 'Fix any grammar, spelling, or punctuation errors in this text:',
      tone: 'Adjust the tone of this text to be more professional and authoritative:'
    };
    
    const prompt = `${prompts[improvementType]}
    
    Original text:
    ${text}
    
    Provide only the improved version without any explanation.`;
    
    return this.generateText(prompt, {
      model: 'claude-3-sonnet-20240229',
      temperature: 0.3, // Lower temperature for editing tasks
      maxTokens: Math.min(text.length * 2, 4000)
    });
  }
  
  async analyzeContent(
    content: string
  ): Promise<{
    readabilityScore: number;
    seoScore: number;
    suggestions: string[];
    keywords: string[];
    estimatedReadTime: number;
  }> {
    const prompt = `Analyze the following blog content and provide:
    1. Readability score (0-100)
    2. SEO score (0-100)
    3. 3-5 improvement suggestions
    4. 5-10 relevant keywords
    5. Estimated read time in minutes
    
    Content:
    ${content}
    
    Format as JSON with keys: readabilityScore, seoScore, suggestions, keywords, estimatedReadTime`;
    
    try {
      const response = await this.generateText(prompt, {
        model: 'claude-3-haiku-20240307', // Use Haiku for analysis tasks
        temperature: 0.2,
        maxTokens: 1000
      });
      
      return JSON.parse(response);
    } catch (error) {
      console.error('Content analysis failed:', error);
      throw error;
    }
  }
  
  async generateLongFormContent(
    topic: string,
    sections: string[],
    wordsPerSection: number = 500
  ): Promise<{
    title: string;
    sections: Array<{
      heading: string;
      content: string;
    }>;
    conclusion: string;
  }> {
    // Claude excels at long-form content with its 200k context window
    const prompt = `Create a comprehensive long-form article about: ${topic}
    
    Structure:
    ${sections.map((s, i) => `${i + 1}. ${s} (approximately ${wordsPerSection} words)`).join('\n')}
    
    Requirements:
    - Each section should be detailed and informative
    - Include examples, data, and expert insights where relevant
    - Maintain consistency in tone and style throughout
    - End with a compelling conclusion
    
    Format as JSON with keys: title, sections (array of {heading, content}), conclusion`;
    
    try {
      const response = await this.generateText(prompt, {
        model: 'claude-3-opus-20240229',
        temperature: 0.7,
        maxTokens: 100000, // Claude can handle very long outputs
        system: 'You are an expert content writer specializing in creating comprehensive, well-researched articles.'
      });
      
      return JSON.parse(response);
    } catch (error) {
      console.error('Long-form content generation failed:', error);
      throw error;
    }
  }
  
  private buildSystemPrompt(context: any): string {
    let prompt = 'You are Claude, an expert content writer known for creating high-quality, engaging, and informative content.';
    
    if (context.brand) {
      prompt += ` You are writing on behalf of ${context.brand}, maintaining their voice and values.`;
    }
    if (context.vertical) {
      prompt += ` You specialize in ${context.vertical} industry content.`;
    }
    if (context.persona) {
      prompt += ` Your target audience is: ${context.persona}.`;
    }
    if (context.writingStyle) {
      prompt += ` Writing style: ${context.writingStyle}.`;
    }
    
    prompt += ' Always prioritize accuracy, clarity, and value for the reader.';
    
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
      const response = await this.client!.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Hi'
          }
        ]
      });
      
      return !!response.content.length;
    } catch (error) {
      console.error('Anthropic connection test failed:', error);
      return false;
    }
  }
  
  // Anthropic-specific feature: Constitutional AI
  async generateWithConstitution(
    prompt: string,
    constitution: string[],
    config?: AnthropicConfig
  ): Promise<string> {
    const systemPrompt = `You must follow these principles:
    ${constitution.map((rule, i) => `${i + 1}. ${rule}`).join('\n')}
    
    Apply these principles to all your responses.`;
    
    return this.generateText(prompt, {
      ...config,
      system: systemPrompt
    });
  }
}

// Export singleton instance
export const anthropicService = new AnthropicService();