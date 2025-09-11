import OpenAI from 'openai';
import { openAIService } from './OpenAIService';

export interface ImageGenerationConfig {
  model?: 'dall-e-3' | 'dall-e-2';
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number;
}

export class OpenAIImageService {
  private client: OpenAI | null = null;
  
  async initialize(): Promise<void> {
    // Use the main OpenAI service for initialization
    await openAIService.initialize();
    this.client = (openAIService as any).client;
  }
  
  async generateImage(
    prompt: string,
    config: ImageGenerationConfig = {}
  ): Promise<string[]> {
    if (!this.client) await this.initialize();
    
    const defaultConfig: ImageGenerationConfig = {
      model: 'dall-e-3',
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid',
      n: 1
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    
    try {
      const response = await this.client!.images.generate({
        model: finalConfig.model!,
        prompt: this.enhancePrompt(prompt),
        n: finalConfig.n,
        size: finalConfig.size,
        quality: finalConfig.quality,
        style: finalConfig.style
      });
      
      return response.data?.map(img => img.url!) || [];
    } catch (error) {
      console.error('OpenAI image generation failed:', error);
      throw error;
    }
  }
  
  async generateBlogImages(
    prompts: string[],
    config?: ImageGenerationConfig
  ): Promise<Array<{ prompt: string; url: string }>> {
    const results = [];
    
    for (const prompt of prompts) {
      try {
        const urls = await this.generateImage(prompt, config);
        results.push({
          prompt,
          url: urls[0]
        });
      } catch (error) {
        console.error(`Failed to generate image for prompt: ${prompt}`, error);
        // Continue with other images even if one fails
        results.push({
          prompt,
          url: ''
        });
      }
    }
    
    return results;
  }
  
  private enhancePrompt(prompt: string): string {
    // Add quality enhancers to the prompt
    const enhancers = [
      'high quality',
      'professional',
      'detailed',
      '4k resolution'
    ];
    
    // Only add if not already present
    let enhanced = prompt;
    for (const enhancer of enhancers) {
      if (!prompt.toLowerCase().includes(enhancer)) {
        enhanced = `${enhanced}, ${enhancer}`;
        break;
      }
    }
    
    return enhanced;
  }
  
  async editImage(
    imageFile: File,
    prompt: string,
    maskFile?: File
  ): Promise<string> {
    if (!this.client) await this.initialize();
    
    try {
      const response = await this.client!.images.edit({
        image: imageFile,
        prompt,
        mask: maskFile,
        n: 1,
        size: '1024x1024'
      });
      
      return response.data?.[0]?.url || '';
    } catch (error) {
      console.error('OpenAI image edit failed:', error);
      throw error;
    }
  }
  
  async createVariations(
    imageFile: File,
    n: number = 2
  ): Promise<string[]> {
    if (!this.client) await this.initialize();
    
    try {
      const response = await this.client!.images.createVariation({
        image: imageFile,
        n,
        size: '1024x1024'
      });
      
      return response.data?.map(img => img.url!) || [];
    } catch (error) {
      console.error('OpenAI image variation failed:', error);
      throw error;
    }
  }
}

export const openAIImageService = new OpenAIImageService();