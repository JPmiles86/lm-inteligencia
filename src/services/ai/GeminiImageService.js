/**
 * Gemini Image Generation Service - Google's Gemini 2.5 Flash with native image generation
 * Uses the multimodal capabilities of Gemini 2.5 Flash to generate text AND images in single API calls
 * 
 * Key Features:
 * - Model: gemini-2.5-flash-image-preview
 * - Multimodal: Text + Image in single conversation
 * - Response modalities: ['IMAGE', 'TEXT']
 * - Base64 image output for display/download
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiImageService {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY;
    this.client = null;
    this.model = 'gemini-2.5-flash-image-preview';
    
    if (this.apiKey) {
      this.client = new GoogleGenerativeAI(this.apiKey);
    }
  }

  /**
   * Initialize the service with an API key
   */
  initialize(apiKey) {
    this.apiKey = apiKey;
    this.client = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured() {
    return !!(this.client && this.apiKey);
  }

  /**
   * Generate images from blog content using Gemini's multimodal capabilities
   */
  async generateImagesFromBlog(blogContent, imageCount = 4, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured');
    }

    const {
      style = 'photorealistic',
      vertical = 'general',
      imageTypes = ['hero', 'section', 'illustration']
    } = options;

    try {
      // Initialize the model with multimodal capabilities
      const model = this.client.getGenerativeModel({ 
        model: this.model,
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      });

      // Create comprehensive prompt for image generation
      const prompt = this.buildBlogImagePrompt(blogContent, imageCount, style, vertical, imageTypes);

      console.log('[GeminiImageService] Generating images with prompt length:', prompt.length);
      
      const startTime = Date.now();
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const endTime = Date.now();
      
      // Extract images and text from the multimodal response
      const images = [];
      const captions = [];
      const parts = response.candidates[0].content.parts;
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        if (part.inlineData && part.inlineData.data) {
          // Extract image data
          images.push({
            id: `gemini_image_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 6)}`,
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType,
            url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
            caption: '', // Will be populated from text parts
            placement: this.determinePlacement(i, imageCount, imageTypes),
            style: style,
            provider: 'gemini',
            model: this.model,
            selected: i === 0, // First image selected by default
            createdAt: new Date().toISOString(),
            cost: 0, // Will be calculated based on usage
            metadata: {
              vertical,
              imageType: imageTypes[i % imageTypes.length],
              generatedFromBlog: true,
              index: i
            }
          });
        } else if (part.text) {
          // Extract captions and descriptions from text
          captions.push(part.text);
        }
      }

      // Associate captions with images
      this.associateCaptions(images, captions);

      // Calculate approximate cost (rough estimation)
      const estimatedCost = this.calculateImageGenerationCost(images.length);
      
      return {
        success: true,
        images,
        totalImages: images.length,
        model: this.model,
        style,
        vertical,
        tokensUsed: result.response?.usageMetadata?.totalTokenCount || 0,
        cost: estimatedCost,
        durationMs: endTime - startTime,
        metadata: {
          blogContentLength: blogContent.length,
          requestedCount: imageCount,
          actualCount: images.length,
          generatedAt: new Date().toISOString(),
          multimodal: true
        }
      };
    } catch (error) {
      console.error('[GeminiImageService] Error generating images from blog:', error);
      
      return {
        success: false,
        error: error.message,
        images: [],
        fallback: true,
        metadata: {
          errorType: error.name,
          model: this.model,
          failedAt: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Generate a single image with custom prompt
   */
  async generateImageWithPrompt(prompt, style = 'photorealistic', options = {}) {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured');
    }

    const {
      aspectRatio = '16:9',
      quality = 'high',
      safetyLevel = 'standard'
    } = options;

    try {
      const model = this.client.getGenerativeModel({ 
        model: this.model,
        generationConfig: {
          responseModalities: ['IMAGE'],
          temperature: 0.8,
        }
      });

      const enhancedPrompt = this.buildSingleImagePrompt(prompt, style, aspectRatio, quality);

      console.log('[GeminiImageService] Generating single image with prompt:', enhancedPrompt.substring(0, 100) + '...');
      
      const startTime = Date.now();
      const result = await model.generateContent(enhancedPrompt);
      const response = await result.response;
      const endTime = Date.now();
      
      // Extract the first image from response
      const parts = response.candidates[0].content.parts;
      const imagePart = parts.find(part => part.inlineData && part.inlineData.data);
      
      if (!imagePart) {
        throw new Error('No image generated in response');
      }

      const image = {
        id: `gemini_single_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        data: imagePart.inlineData.data,
        mimeType: imagePart.inlineData.mimeType,
        url: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
        caption: this.generateCaption(prompt),
        prompt: prompt,
        style: style,
        provider: 'gemini',
        model: this.model,
        selected: true,
        createdAt: new Date().toISOString(),
        cost: this.calculateImageGenerationCost(1),
        metadata: {
          aspectRatio,
          quality,
          safetyLevel,
          customPrompt: true,
          generatedAt: new Date().toISOString()
        }
      };
      
      return {
        success: true,
        image,
        tokensUsed: result.response?.usageMetadata?.totalTokenCount || 0,
        cost: image.cost,
        durationMs: endTime - startTime,
        metadata: {
          prompt: prompt.substring(0, 100),
          style,
          model: this.model
        }
      };
    } catch (error) {
      console.error('[GeminiImageService] Error generating single image:', error);
      
      return {
        success: false,
        error: error.message,
        image: null,
        metadata: {
          prompt: prompt.substring(0, 100),
          errorType: error.name,
          model: this.model,
          failedAt: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Generate multiple style variations of the same prompt
   */
  async generateImageVariations(prompt, styles = ['photorealistic', 'illustration', 'cartoon'], options = {}) {
    const results = [];
    
    for (const style of styles) {
      try {
        const result = await this.generateImageWithPrompt(prompt, style, options);
        if (result.success) {
          results.push({
            ...result.image,
            id: `${result.image.id}_${style}`,
            style,
            variationOf: prompt
          });
        }
      } catch (error) {
        console.error(`[GeminiImageService] Error generating ${style} variation:`, error);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return {
      success: results.length > 0,
      variations: results,
      totalVariations: results.length,
      originalPrompt: prompt,
      styles: styles,
      metadata: {
        requestedStyles: styles.length,
        successfulStyles: results.length,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Build comprehensive prompt for blog image generation
   */
  buildBlogImagePrompt(blogContent, imageCount, style, vertical, imageTypes) {
    const styleInstructions = this.getStyleInstructions(style);
    const verticalContext = this.getVerticalContext(vertical);
    
    return `
Create ${imageCount} unique, high-quality images to accompany this blog post content. Use ${style} style with professional composition.

BLOG CONTENT:
${blogContent.substring(0, 3000)}${blogContent.length > 3000 ? '...' : ''}

REQUIREMENTS:
${styleInstructions}
${verticalContext}

For each image:
1. Generate a visually distinct image that complements the content
2. Ensure images are diverse in composition and subject matter
3. Make images suitable for blog article placement
4. Avoid text overlays unless specifically needed
5. Maintain consistent quality and professional appearance

Image Types to Include:
${imageTypes.map((type, index) => `${index + 1}. ${type} - ${this.getImageTypeDescription(type)}`).join('\n')}

IMPORTANT: Generate exactly ${imageCount} images with accompanying descriptions for each image explaining its relevance to the blog content.

Generate the images now.
    `.trim();
  }

  /**
   * Build prompt for single image generation
   */
  buildSingleImagePrompt(prompt, style, aspectRatio, quality) {
    const styleInstructions = this.getStyleInstructions(style);
    
    return `
Create a single high-quality image: ${prompt}

Style Requirements:
${styleInstructions}

Technical Requirements:
- Aspect ratio: ${aspectRatio}
- Quality level: ${quality}
- Professional composition
- No text overlays unless specifically requested
- Suitable for blog/article content
- Clear, detailed, and visually appealing

Generate the image now.
    `.trim();
  }

  /**
   * Get style-specific instructions
   */
  getStyleInstructions(style) {
    const styleMap = {
      photorealistic: `
        - Photorealistic style with natural lighting and composition
        - High detail and professional photography quality
        - Realistic textures, shadows, and depth of field
        - Clean, modern aesthetic suitable for business content`,
      
      illustration: `
        - Digital illustration with clean lines and vibrant colors
        - Modern, professional illustration style
        - Clear visual hierarchy and composition
        - Suitable for infographics and educational content`,
      
      cartoon: `
        - Clean cartoon/animated style with friendly appeal
        - Bright, engaging colors with clear visual elements
        - Professional but approachable aesthetic
        - Suitable for educational or entertainment content`,
      
      abstract: `
        - Abstract artistic interpretation with creative composition
        - Focus on shapes, colors, and visual metaphors
        - Modern, sophisticated design approach
        - Conceptual representation of ideas`,

      infographic: `
        - Infographic style with data visualization elements
        - Clean, organized layout with visual hierarchy
        - Professional color scheme and typography
        - Focus on clarity and information presentation`
    };

    return styleMap[style] || styleMap.photorealistic;
  }

  /**
   * Get vertical-specific context
   */
  getVerticalContext(vertical) {
    const verticalMap = {
      hospitality: 'Context: Hospitality industry - hotels, restaurants, travel, customer service',
      healthcare: 'Context: Healthcare industry - medical, wellness, patient care, health technology',
      tech: 'Context: Technology industry - software, innovation, digital solutions, tech trends',
      athletics: 'Context: Sports and athletics - fitness, sports equipment, training, competition',
      general: 'Context: General business and professional content'
    };

    return verticalMap[vertical] || verticalMap.general;
  }

  /**
   * Get description for image types
   */
  getImageTypeDescription(type) {
    const typeMap = {
      hero: 'Main header image that captures the overall theme',
      section: 'Supporting image for a specific section or topic',
      illustration: 'Explanatory image or diagram',
      infographic: 'Data visualization or process diagram',
      footer: 'Concluding image or call-to-action visual'
    };

    return typeMap[type] || 'Supporting visual content';
  }

  /**
   * Determine image placement based on index and types
   */
  determinePlacement(index, totalImages, imageTypes) {
    if (index === 0) return 'hero';
    if (index === totalImages - 1) return 'footer';
    return imageTypes[index % imageTypes.length] || 'section';
  }

  /**
   * Associate captions with images based on text content
   */
  associateCaptions(images, captions) {
    const combinedCaptions = captions.join(' ');
    
    // Simple association - split captions evenly among images
    const captionSegments = this.splitCaptionsForImages(combinedCaptions, images.length);
    
    images.forEach((image, index) => {
      if (captionSegments[index]) {
        image.caption = captionSegments[index].trim();
      } else {
        image.caption = `Generated ${image.style} image ${index + 1}`;
      }
    });
  }

  /**
   * Split caption text for multiple images
   */
  splitCaptionsForImages(text, imageCount) {
    if (!text || !text.trim()) {
      return Array(imageCount).fill('Generated image');
    }

    // Look for numbered lists or clear separators
    const segments = text.split(/(?:\d+[\.\)]\s*|Image \d+:|Caption \d+:)/);
    
    if (segments.length >= imageCount) {
      return segments.slice(1, imageCount + 1);
    }

    // Fallback: split by sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const segmentSize = Math.ceil(sentences.length / imageCount);
    
    const result = [];
    for (let i = 0; i < imageCount; i++) {
      const startIndex = i * segmentSize;
      const endIndex = Math.min(startIndex + segmentSize, sentences.length);
      const segment = sentences.slice(startIndex, endIndex).join('. ').trim();
      result.push(segment || `Generated image ${i + 1}`);
    }
    
    return result;
  }

  /**
   * Generate a simple caption for single images
   */
  generateCaption(prompt) {
    return `Generated image: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`;
  }

  /**
   * Calculate estimated cost for image generation (approximate)
   */
  calculateImageGenerationCost(imageCount) {
    // Rough estimation - actual costs may vary
    // Based on typical AI image generation pricing
    const costPerImage = 0.02; // $0.02 per image (estimated)
    return imageCount * costPerImage;
  }

  /**
   * Convert base64 image data to blob for download
   */
  base64ToBlob(base64Data, mimeType) {
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
    } catch (error) {
      console.error('[GeminiImageService] Error converting base64 to blob:', error);
      return null;
    }
  }

  /**
   * Download image as file
   */
  downloadImage(image, fileName) {
    try {
      const blob = this.base64ToBlob(image.data, image.mimeType);
      if (!blob) throw new Error('Failed to create blob');
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `gemini-image-${image.id}.${image.mimeType.split('/')[1]}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('[GeminiImageService] Error downloading image:', error);
      return false;
    }
  }

  /**
   * Get image data URL for display
   */
  getImageDataUrl(image) {
    if (image.url) return image.url;
    return `data:${image.mimeType};base64,${image.data}`;
  }

  /**
   * Validate image data
   */
  validateImage(image) {
    const requiredFields = ['id', 'data', 'mimeType'];
    return requiredFields.every(field => image && image[field]);
  }

  /**
   * Get service status and capabilities
   */
  getStatus() {
    return {
      configured: this.isConfigured(),
      model: this.model,
      capabilities: [
        'Blog image generation',
        'Custom prompt images',
        'Style variations',
        'Multimodal generation',
        'Base64 output',
        'Caption generation'
      ],
      supportedStyles: ['photorealistic', 'illustration', 'cartoon', 'abstract', 'infographic'],
      supportedFormats: ['PNG', 'JPEG', 'WebP']
    };
  }
}

// Export singleton instance
export const geminiImageService = new GeminiImageService();
export default GeminiImageService;