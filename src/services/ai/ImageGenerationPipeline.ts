import { ImagePrompt } from './ImagePromptExtractor';
import { imageStorageService, StoredImage } from '../storage/ImageStorageService';
import { db } from '@/db';
import { generatedImages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface PipelineConfig {
  maxConcurrent?: number;
  retryAttempts?: number;
  retryDelay?: number;
  preferredProvider?: 'openai' | 'google';
  quality?: 'standard' | 'high';
  storageType?: 'local' | 'cloud';
}

export interface GenerationResult {
  promptId: string;
  success: boolean;
  imageUrl?: string;
  storedImage?: StoredImage;
  error?: string;
  provider?: string;
  model?: string;
  generationTime?: number;
  cost?: number;
}

export class ImageGenerationPipeline {
  private config: PipelineConfig;
  
  constructor(config?: PipelineConfig) {
    this.config = {
      maxConcurrent: 3,
      retryAttempts: 2,
      retryDelay: 1000,
      preferredProvider: 'google',
      quality: 'high',
      storageType: 'local',
      ...config
    };
  }
  
  /**
   * Process multiple image prompts
   */
  async processPrompts(
    prompts: ImagePrompt[],
    blogPostId?: number,
    onProgress?: (completed: number, total: number) => void
  ): Promise<GenerationResult[]> {
    const results: GenerationResult[] = [];
    const batches = this.createBatches(prompts, this.config.maxConcurrent!);
    
    let completed = 0;
    
    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(prompt => this.processSinglePrompt(prompt, blogPostId))
      );
      
      results.push(...batchResults);
      completed += batch.length;
      
      if (onProgress) {
        onProgress(completed, prompts.length);
      }
    }
    
    return results;
  }
  
  /**
   * Process single image prompt
   */
  async processSinglePrompt(
    prompt: ImagePrompt,
    blogPostId?: number
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    
    try {
      // Generate image
      const generation = await this.generateImage(prompt);
      
      if (!generation.success || !generation.imageUrl) {
        throw new Error(generation.error || 'Image generation failed');
      }
      
      // Store image
      const storedImage = await imageStorageService.storeImageFromUrl(
        generation.imageUrl,
        {
          blogPostId,
          promptId: prompt.id
        }
      );
      
      // Save to database
      await this.saveToDatabase({
        blogPostId,
        promptId: prompt.id,
        originalPrompt: prompt.originalPrompt,
        enhancedPrompt: prompt.enhancedPrompt,
        imageUrl: storedImage.url,
        storagePath: storedImage.storagePath,
        thumbnailUrl: storedImage.thumbnailUrl,
        width: storedImage.width,
        height: storedImage.height,
        format: storedImage.format,
        fileSize: storedImage.fileSize,
        provider: generation.provider!,
        model: generation.model,
        generationTime: Date.now() - startTime,
        generationCost: generation.cost,
        altText: this.generateAltText(prompt),
        positionInContent: prompt.position,
        sectionTitle: prompt.metadata?.sectionTitle,
        importance: prompt.metadata?.importance
      });
      
      return {
        promptId: prompt.id,
        success: true,
        imageUrl: storedImage.url,
        storedImage,
        provider: generation.provider,
        model: generation.model,
        generationTime: Date.now() - startTime,
        cost: generation.cost
      };
    } catch (error) {
      console.error(`Failed to process prompt ${prompt.id}:`, error);
      
      return {
        promptId: prompt.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Generate image using AI provider
   */
  private async generateImage(
    prompt: ImagePrompt
  ): Promise<{
    success: boolean;
    imageUrl?: string;
    provider?: string;
    model?: string;
    cost?: number;
    error?: string;
  }> {
    const enhancedPrompt = prompt.enhancedPrompt || prompt.originalPrompt;
    
    // Try preferred provider first
    const providers = await this.getProviderOrder();
    
    for (const provider of providers) {
      try {
        const result = await this.callProvider(provider, enhancedPrompt, prompt);
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.error(`Provider ${provider} failed:`, error);
        continue; // Try next provider
      }
    }
    
    return {
      success: false,
      error: 'All providers failed'
    };
  }
  
  /**
   * Call specific provider for image generation
   */
  private async callProvider(
    provider: string,
    prompt: string,
    imagePrompt: ImagePrompt
  ): Promise<any> {
    const response = await fetch(`/api/${provider}/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        config: {
          size: imagePrompt.suggestedSize,
          quality: this.config.quality,
          style: imagePrompt.suggestedStyle
        }
      })
    });
    
    const data = await response.json();
    
    if (!data.success || !data.urls?.length) {
      throw new Error(data.error || 'No image generated');
    }
    
    return {
      success: true,
      imageUrl: data.urls[0],
      provider,
      model: data.model,
      cost: this.estimateCost(provider)
    };
  }
  
  /**
   * Get provider order based on availability and preference
   */
  private async getProviderOrder(): Promise<string[]> {
    try {
      // Check available providers
      const response = await fetch('/api/providers');
      const providers = await response.json();
      
      const available = providers
        .filter((p: { hasKey: boolean; active: boolean; capabilities?: { image?: boolean } }) => 
          p.hasKey && p.active && p.capabilities?.image)
        .map((p: { provider: string }) => p.provider);
      
      // Sort by preference
      const preferred = this.config.preferredProvider;
      if (preferred && available.includes(preferred)) {
        return [preferred, ...available.filter((p: string) => p !== preferred)];
      }
      
      return available;
    } catch (error) {
      console.error('Failed to get provider order:', error);
      // Fallback to default providers
      return ['google', 'openai'];
    }
  }
  
  /**
   * Save generated image to database
   */
  private async saveToDatabase(data: any): Promise<void> {
    try {
      await db.insert(generatedImages).values(data);
    } catch (error) {
      console.error('Failed to save image to database:', error);
    }
  }
  
  /**
   * Generate alt text for accessibility
   */
  private generateAltText(prompt: ImagePrompt): string {
    // Clean up the prompt for alt text
    let alt = prompt.originalPrompt;
    
    // Remove technical terms
    alt = alt.replace(/high quality|4k|8k|photorealistic|illustration/gi, '');
    
    // Clean up
    alt = alt.replace(/\s+/g, ' ').trim();
    
    // Ensure reasonable length
    if (alt.length > 125) {
      alt = alt.substring(0, 122) + '...';
    }
    
    return alt;
  }
  
  /**
   * Create batches for concurrent processing
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    
    return batches;
  }
  
  /**
   * Estimate generation cost
   */
  private estimateCost(provider: string): number {
    const costs: Record<string, number> = {
      openai: 0.04, // DALL-E 3 standard
      google: 0.02, // Gemini estimate
    };
    
    return costs[provider] || 0.03;
  }
  
  /**
   * Retry failed generations
   */
  async retryFailed(
    results: GenerationResult[],
    blogPostId?: number
  ): Promise<GenerationResult[]> {
    const failed = results.filter(r => !r.success);
    const prompts = failed.map(f => ({ id: f.promptId } as ImagePrompt));
    
    if (prompts.length === 0) {
      return results;
    }
    
    console.log(`Retrying ${prompts.length} failed generations...`);
    
    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay!));
    
    const retryResults = await this.processPrompts(prompts, blogPostId);
    
    // Merge results
    return results.map(r => {
      if (!r.success) {
        const retry = retryResults.find(rr => rr.promptId === r.promptId);
        if (retry && retry.success) {
          return retry;
        }
      }
      return r;
    });
  }
}

// Export singleton instance
export const imageGenerationPipeline = new ImageGenerationPipeline();