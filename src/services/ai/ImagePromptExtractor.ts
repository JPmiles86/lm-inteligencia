export interface ImagePrompt {
  id: string;
  originalPrompt: string;
  enhancedPrompt?: string;
  position: number; // Character position in content
  lineNumber: number;
  context: string; // Surrounding text for context
  suggestedSize?: '1024x1024' | '1792x1024' | '1024x1792';
  suggestedStyle?: 'photorealistic' | 'illustration' | 'artistic' | 'diagram';
  metadata?: {
    paragraphIndex: number;
    sectionTitle?: string;
    importance: 'primary' | 'secondary' | 'decorative';
  };
}

export interface ExtractionResult {
  prompts: ImagePrompt[];
  contentWithPlaceholders: string;
  promptMap: Map<string, ImagePrompt>;
}

export class ImagePromptExtractor {
  private readonly PROMPT_REGEX = /\[IMAGE_PROMPT:\s*([^\]]+)\]/g;
  private readonly PLACEHOLDER_PREFIX = '{{IMAGE_PLACEHOLDER_';
  
  /**
   * Extract all image prompts from blog content
   */
  extractPrompts(content: string): ExtractionResult {
    const prompts: ImagePrompt[] = [];
    const promptMap = new Map<string, ImagePrompt>();
    let contentWithPlaceholders = content;
    let match;
    let promptIndex = 0;
    
    // Reset regex state
    this.PROMPT_REGEX.lastIndex = 0;
    
    while ((match = this.PROMPT_REGEX.exec(content)) !== null) {
      const id = this.generatePromptId(promptIndex);
      const originalPrompt = match[1].trim();
      
      const prompt: ImagePrompt = {
        id,
        originalPrompt,
        position: match.index,
        lineNumber: this.getLineNumber(content, match.index),
        context: this.extractContext(content, match.index),
        suggestedSize: this.suggestImageSize(originalPrompt, match.index, content),
        suggestedStyle: this.suggestImageStyle(originalPrompt),
        metadata: this.extractMetadata(content, match.index)
      };
      
      prompts.push(prompt);
      promptMap.set(id, prompt);
      
      // Replace with placeholder
      const placeholder = `${this.PLACEHOLDER_PREFIX}${id}}}`;
      contentWithPlaceholders = contentWithPlaceholders.replace(
        match[0],
        placeholder
      );
      
      promptIndex++;
    }
    
    return {
      prompts,
      contentWithPlaceholders,
      promptMap
    };
  }
  
  /**
   * Re-embed images into content using placeholders
   */
  embedImages(
    contentWithPlaceholders: string,
    images: Array<{ promptId: string; url: string; alt?: string }>
  ): string {
    let finalContent = contentWithPlaceholders;
    
    for (const image of images) {
      const placeholder = `${this.PLACEHOLDER_PREFIX}${image.promptId}}}`;
      const imageMarkdown = this.createImageMarkdown(image.url, image.alt);
      
      finalContent = finalContent.replace(placeholder, imageMarkdown);
    }
    
    // Remove any remaining placeholders (failed generations)
    finalContent = this.removeUnusedPlaceholders(finalContent);
    
    return finalContent;
  }
  
  /**
   * Analyze prompt to suggest appropriate image size
   */
  private suggestImageSize(
    prompt: string,
    position: number,
    content: string
  ): '1024x1024' | '1792x1024' | '1024x1792' {
    const lowerPrompt = prompt.toLowerCase();
    
    // Check if it's a hero/banner image (usually first image)
    if (position < 500) {
      return '1792x1024'; // Landscape for hero images
    }
    
    // Check for specific aspect ratio hints
    if (lowerPrompt.includes('portrait') || 
        lowerPrompt.includes('vertical') ||
        lowerPrompt.includes('tall')) {
      return '1024x1792';
    }
    
    if (lowerPrompt.includes('landscape') || 
        lowerPrompt.includes('wide') ||
        lowerPrompt.includes('banner') ||
        lowerPrompt.includes('header')) {
      return '1792x1024';
    }
    
    // Check content structure
    const beforeContent = content.substring(Math.max(0, position - 200), position);
    if (beforeContent.includes('##') && !beforeContent.includes('###')) {
      // Section header image - use landscape
      return '1792x1024';
    }
    
    // Default to square
    return '1024x1024';
  }
  
  /**
   * Analyze prompt to suggest image style
   */
  private suggestImageStyle(
    prompt: string
  ): 'photorealistic' | 'illustration' | 'artistic' | 'diagram' {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('photo') || 
        lowerPrompt.includes('realistic') ||
        lowerPrompt.includes('real')) {
      return 'photorealistic';
    }
    
    if (lowerPrompt.includes('illustration') || 
        lowerPrompt.includes('cartoon') ||
        lowerPrompt.includes('drawing') ||
        lowerPrompt.includes('sketch')) {
      return 'illustration';
    }
    
    if (lowerPrompt.includes('diagram') || 
        lowerPrompt.includes('chart') ||
        lowerPrompt.includes('graph') ||
        lowerPrompt.includes('infographic')) {
      return 'diagram';
    }
    
    if (lowerPrompt.includes('artistic') || 
        lowerPrompt.includes('abstract') ||
        lowerPrompt.includes('creative')) {
      return 'artistic';
    }
    
    // Default based on content type
    return 'photorealistic';
  }
  
  /**
   * Extract metadata about prompt location
   */
  private extractMetadata(content: string, position: number): ImagePrompt['metadata'] {
    const beforeContent = content.substring(0, position);
    const paragraphs = beforeContent.split(/\n\n/);
    const paragraphIndex = paragraphs.length - 1;
    
    // Find section title
    const sections = beforeContent.split(/\n#{1,3}\s+/);
    const lastSection = sections[sections.length - 1];
    const sectionTitle = lastSection.split('\n')[0]?.trim();
    
    // Determine importance
    let importance: 'primary' | 'secondary' | 'decorative' = 'secondary';
    if (position < 500) {
      importance = 'primary'; // Hero image
    } else if (beforeContent.split('\n').length > 50) {
      importance = 'decorative'; // Later in content
    }
    
    return {
      paragraphIndex,
      sectionTitle,
      importance
    };
  }
  
  /**
   * Get surrounding context for the prompt
   */
  private extractContext(content: string, position: number): string {
    const contextRadius = 200;
    const start = Math.max(0, position - contextRadius);
    const end = Math.min(content.length, position + contextRadius);
    
    let context = content.substring(start, end);
    
    // Clean up context
    context = context.replace(/\[IMAGE_PROMPT:[^\]]+\]/g, '[IMAGE]');
    context = context.replace(/\s+/g, ' ').trim();
    
    if (start > 0) context = '...' + context;
    if (end < content.length) context = context + '...';
    
    return context;
  }
  
  /**
   * Calculate line number for position
   */
  private getLineNumber(content: string, position: number): number {
    const lines = content.substring(0, position).split('\n');
    return lines.length;
  }
  
  /**
   * Generate unique ID for prompt
   */
  private generatePromptId(index: number): string {
    return `img_${Date.now()}_${index}`;
  }
  
  /**
   * Create markdown for image
   */
  private createImageMarkdown(url: string, alt?: string): string {
    const altText = alt || 'Generated image';
    return `![${altText}](${url})`;
  }
  
  /**
   * Remove any leftover placeholders
   */
  private removeUnusedPlaceholders(content: string): string {
    const placeholderRegex = new RegExp(
      `${this.PLACEHOLDER_PREFIX}[^}]+}}`,
      'g'
    );
    return content.replace(placeholderRegex, '');
  }
}

export const imagePromptExtractor = new ImagePromptExtractor();