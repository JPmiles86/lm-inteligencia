interface EnhancementOptions {
  style?: 'photorealistic' | 'illustration' | 'artistic' | 'diagram';
  quality?: 'standard' | 'high' | 'ultra';
  lighting?: 'natural' | 'studio' | 'dramatic' | 'soft';
  mood?: 'professional' | 'casual' | 'dramatic' | 'cheerful';
  brandGuidelines?: {
    colors?: string[];
    avoid?: string[];
    mustInclude?: string[];
  };
}

export class PromptEnhancer {
  /**
   * Enhance a basic prompt for better image generation
   */
  enhancePrompt(
    originalPrompt: string,
    options: EnhancementOptions = {}
  ): string {
    let enhanced = originalPrompt;
    
    // Add style descriptors
    enhanced = this.addStyleDescriptors(enhanced, options.style);
    
    // Add quality modifiers
    enhanced = this.addQualityModifiers(enhanced, options.quality);
    
    // Add lighting
    enhanced = this.addLighting(enhanced, options.lighting);
    
    // Add mood
    enhanced = this.addMood(enhanced, options.mood);
    
    // Apply brand guidelines
    if (options.brandGuidelines) {
      enhanced = this.applyBrandGuidelines(enhanced, options.brandGuidelines);
    }
    
    // Add technical specifications
    enhanced = this.addTechnicalSpecs(enhanced);
    
    // Clean up and optimize
    enhanced = this.cleanupPrompt(enhanced);
    
    return enhanced;
  }
  
  /**
   * Enhance multiple prompts with consistency
   */
  enhanceMultiplePrompts(
    prompts: string[],
    options: EnhancementOptions = {}
  ): string[] {
    // Extract common style elements
    const commonStyle = this.extractCommonStyle(prompts);
    
    return prompts.map((prompt, index) => {
      const enhancedOptions = {
        ...options,
        // Maintain consistency across images
        style: options.style || commonStyle
      };
      
      // Add positional context
      if (index === 0) {
        // Hero image
        enhancedOptions.quality = 'ultra';
      }
      
      return this.enhancePrompt(prompt, enhancedOptions);
    });
  }
  
  private addStyleDescriptors(prompt: string, style?: string): string {
    const styleMap = {
      photorealistic: 'photorealistic, high detail, professional photography',
      illustration: 'digital illustration, vector art style, clean lines',
      artistic: 'artistic interpretation, creative composition, unique style',
      diagram: 'technical diagram, clear labels, informative, educational'
    };
    
    if (style && styleMap[style as keyof typeof styleMap]) {
      return `${prompt}, ${styleMap[style as keyof typeof styleMap]}`;
    }
    
    return prompt;
  }
  
  private addQualityModifiers(prompt: string, quality?: string): string {
    const qualityMap = {
      standard: '4k resolution, sharp focus',
      high: '8k resolution, ultra sharp, highly detailed',
      ultra: '16k resolution, hyperrealistic, extreme detail, award-winning'
    };
    
    if (quality && qualityMap[quality as keyof typeof qualityMap]) {
      return `${prompt}, ${qualityMap[quality as keyof typeof qualityMap]}`;
    }
    
    return `${prompt}, high quality`;
  }
  
  private addLighting(prompt: string, lighting?: string): string {
    const lightingMap = {
      natural: 'natural lighting, golden hour',
      studio: 'studio lighting, professional setup',
      dramatic: 'dramatic lighting, high contrast',
      soft: 'soft diffused lighting, gentle shadows'
    };
    
    if (lighting && lightingMap[lighting as keyof typeof lightingMap]) {
      return `${prompt}, ${lightingMap[lighting as keyof typeof lightingMap]}`;
    }
    
    return prompt;
  }
  
  private addMood(prompt: string, mood?: string): string {
    const moodMap = {
      professional: 'professional atmosphere, business setting',
      casual: 'relaxed atmosphere, informal setting',
      dramatic: 'dramatic mood, intense atmosphere',
      cheerful: 'bright and cheerful, positive energy'
    };
    
    if (mood && moodMap[mood as keyof typeof moodMap]) {
      return `${prompt}, ${moodMap[mood as keyof typeof moodMap]}`;
    }
    
    return prompt;
  }
  
  private applyBrandGuidelines(
    prompt: string,
    guidelines: EnhancementOptions['brandGuidelines']
  ): string {
    let enhanced = prompt;
    
    if (guidelines?.colors && guidelines.colors.length > 0) {
      enhanced += `, color palette: ${guidelines.colors.join(', ')}`;
    }
    
    if (guidelines?.mustInclude && guidelines.mustInclude.length > 0) {
      enhanced += `, must include: ${guidelines.mustInclude.join(', ')}`;
    }
    
    if (guidelines?.avoid && guidelines.avoid.length > 0) {
      enhanced += `, avoid: ${guidelines.avoid.join(', ')}`;
    }
    
    return enhanced;
  }
  
  private addTechnicalSpecs(prompt: string): string {
    // Add technical specifications for better generation
    const specs = [
      'centered composition',
      'rule of thirds',
      'balanced elements'
    ];
    
    // Only add if not already present
    const specsToAdd = specs.filter(spec => 
      !prompt.toLowerCase().includes(spec.toLowerCase())
    );
    
    if (specsToAdd.length > 0) {
      return `${prompt}, ${specsToAdd[0]}`;
    }
    
    return prompt;
  }
  
  private cleanupPrompt(prompt: string): string {
    // Remove duplicate words
    const words = prompt.split(/[\s,]+/);
    const unique = Array.from(new Set(words));
    
    // Rebuild prompt
    let cleaned = unique.join(' ');
    
    // Fix punctuation
    cleaned = cleaned.replace(/\s+/g, ' ');
    cleaned = cleaned.replace(/,\s*,/g, ',');
    cleaned = cleaned.trim();
    
    // Limit length (some APIs have limits)
    if (cleaned.length > 1000) {
      cleaned = cleaned.substring(0, 997) + '...';
    }
    
    return cleaned;
  }
  
  private extractCommonStyle(prompts: string[]): 'photorealistic' | 'illustration' | 'artistic' | 'diagram' {
    // Analyze all prompts to find common style
    const styles = {
      photorealistic: 0,
      illustration: 0,
      artistic: 0,
      diagram: 0
    };
    
    for (const prompt of prompts) {
      const lower = prompt.toLowerCase();
      if (lower.includes('photo') || lower.includes('realistic')) {
        styles.photorealistic++;
      }
      if (lower.includes('illustration') || lower.includes('drawing')) {
        styles.illustration++;
      }
      if (lower.includes('artistic') || lower.includes('creative')) {
        styles.artistic++;
      }
      if (lower.includes('diagram') || lower.includes('chart')) {
        styles.diagram++;
      }
    }
    
    // Return most common style
    const maxStyle = Object.entries(styles).reduce((a, b) => 
      a[1] > b[1] ? a : b
    );
    
    return maxStyle[0] as 'photorealistic' | 'illustration' | 'artistic' | 'diagram';
  }
}

export const promptEnhancer = new PromptEnhancer();