/**
 * Image Generation API Endpoint - Generate images using Google's Gemini 2.5 Flash
 * Uses the native image generation capabilities of Gemini 2.5 Flash for multimodal content creation
 */

// Import the Gemini Image Service
let GeminiImageService;

try {
  const geminiModule = await import('../../src/services/ai/GeminiImageService.js');
  GeminiImageService = geminiModule.GeminiImageService;
} catch (error) {
  console.log('[Image Generation API] Error importing GeminiImageService:', error.message);
  // Fallback to a stub implementation
  GeminiImageService = class {
    constructor() {
      this.configured = false;
    }
    isConfigured() { return false; }
    async generateImagesFromBlog() {
      throw new Error('GeminiImageService not available');
    }
    async generateImageWithPrompt() {
      throw new Error('GeminiImageService not available');
    }
  };
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const {
      action = 'generate-from-blog',
      blogContent,
      prompt: customPrompt,
      style = 'photorealistic',
      imageCount = 4,
      vertical = 'general',
      imageTypes = ['hero', 'section', 'illustration'],
      aspectRatio = '16:9',
      quality = 'high',
      apiKey,
      options = {}
    } = req.body;

    console.log('[Image Generation API] Request received:', {
      action,
      style,
      imageCount,
      vertical,
      hasContent: !!blogContent,
      hasPrompt: !!customPrompt,
      hasApiKey: !!apiKey
    });

    // Validate API key
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Gemini API key is required',
        code: 'MISSING_API_KEY'
      });
    }

    // Initialize service
    const geminiService = new GeminiImageService(apiKey);

    if (!geminiService.isConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'Failed to configure Gemini Image Service',
        code: 'SERVICE_CONFIG_ERROR'
      });
    }

    // Handle different actions
    switch (action) {
      case 'generate-from-blog':
        return await handleBlogImageGeneration(req, res, geminiService, {
          blogContent,
          imageCount,
          style,
          vertical,
          imageTypes,
          options
        });
      
      case 'generate-from-prompt':
        return await handlePromptImageGeneration(req, res, geminiService, {
          prompt: customPrompt,
          style,
          aspectRatio,
          quality,
          options
        });
      
      case 'generate-variations':
        return await handleImageVariations(req, res, geminiService, {
          prompt: customPrompt,
          styles: options.styles || ['photorealistic', 'illustration', 'cartoon'],
          aspectRatio,
          quality,
          options
        });
      
      case 'status':
        return res.json({
          success: true,
          status: geminiService.getStatus()
        });
      
      default:
        return res.status(400).json({
          success: false,
          error: `Unknown action: ${action}`,
          availableActions: ['generate-from-blog', 'generate-from-prompt', 'generate-variations', 'status']
        });
    }

  } catch (error) {
    console.error('[Image Generation API] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Generate images from blog content
 */
async function handleBlogImageGeneration(req, res, geminiService, params) {
  const {
    blogContent,
    imageCount,
    style,
    vertical,
    imageTypes,
    options
  } = params;

  try {
    // Validate blog content
    if (!blogContent || typeof blogContent !== 'string' || blogContent.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Blog content is required and must be a non-empty string',
        code: 'INVALID_BLOG_CONTENT'
      });
    }

    if (blogContent.length > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Blog content too long. Maximum 10,000 characters allowed.',
        code: 'CONTENT_TOO_LONG'
      });
    }

    // Validate image count
    if (imageCount < 1 || imageCount > 10) {
      return res.status(400).json({
        success: false,
        error: 'Image count must be between 1 and 10',
        code: 'INVALID_IMAGE_COUNT'
      });
    }

    console.log('[Image Generation API] Generating images from blog content');
    
    const startTime = Date.now();
    const result = await geminiService.generateImagesFromBlog(
      blogContent,
      imageCount,
      {
        style,
        vertical,
        imageTypes,
        ...options
      }
    );
    const endTime = Date.now();

    if (result.success && result.images.length > 0) {
      console.log('[Image Generation API] Successfully generated images:', result.images.length);
      
      return res.json({
        success: true,
        images: result.images,
        totalImages: result.images.length,
        requestedCount: imageCount,
        tokensUsed: result.tokensUsed || 0,
        cost: result.cost || 0,
        durationMs: endTime - startTime,
        metadata: {
          ...result.metadata,
          action: 'generate-from-blog',
          style,
          vertical,
          imageTypes,
          blogContentLength: blogContent.length,
          apiEndpoint: '/api/ai/generate-images',
          generatedAt: new Date().toISOString()
        }
      });
    } else {
      console.error('[Image Generation API] Failed to generate images:', result.error);
      
      // Return fallback response
      return res.status(200).json({
        success: false,
        error: result.error || 'Failed to generate images',
        images: [],
        fallback: true,
        metadata: {
          action: 'generate-from-blog',
          errorType: 'GENERATION_FAILED',
          durationMs: endTime - startTime,
          failedAt: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('[Image Generation API] Error in handleBlogImageGeneration:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to generate images from blog content',
      message: error.message,
      code: 'BLOG_GENERATION_ERROR',
      metadata: {
        action: 'generate-from-blog',
        errorType: error.name,
        failedAt: new Date().toISOString()
      }
    });
  }
}

/**
 * Generate image from custom prompt
 */
async function handlePromptImageGeneration(req, res, geminiService, params) {
  const {
    prompt,
    style,
    aspectRatio,
    quality,
    options
  } = params;

  try {
    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Custom prompt is required and must be a non-empty string',
        code: 'INVALID_PROMPT'
      });
    }

    if (prompt.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Prompt too long. Maximum 1,000 characters allowed.',
        code: 'PROMPT_TOO_LONG'
      });
    }

    console.log('[Image Generation API] Generating image from custom prompt');
    
    const startTime = Date.now();
    const result = await geminiService.generateImageWithPrompt(
      prompt,
      style,
      {
        aspectRatio,
        quality,
        ...options
      }
    );
    const endTime = Date.now();

    if (result.success && result.image) {
      console.log('[Image Generation API] Successfully generated custom image:', result.image.id);
      
      return res.json({
        success: true,
        image: result.image,
        tokensUsed: result.tokensUsed || 0,
        cost: result.cost || 0,
        durationMs: endTime - startTime,
        metadata: {
          ...result.metadata,
          action: 'generate-from-prompt',
          promptLength: prompt.length,
          style,
          aspectRatio,
          quality,
          apiEndpoint: '/api/ai/generate-images',
          generatedAt: new Date().toISOString()
        }
      });
    } else {
      console.error('[Image Generation API] Failed to generate custom image:', result.error);
      
      return res.status(200).json({
        success: false,
        error: result.error || 'Failed to generate image from prompt',
        image: null,
        fallback: true,
        metadata: {
          action: 'generate-from-prompt',
          errorType: 'GENERATION_FAILED',
          durationMs: endTime - startTime,
          failedAt: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('[Image Generation API] Error in handlePromptImageGeneration:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to generate image from prompt',
      message: error.message,
      code: 'PROMPT_GENERATION_ERROR',
      metadata: {
        action: 'generate-from-prompt',
        errorType: error.name,
        failedAt: new Date().toISOString()
      }
    });
  }
}

/**
 * Generate multiple style variations of the same prompt
 */
async function handleImageVariations(req, res, geminiService, params) {
  const {
    prompt,
    styles,
    aspectRatio,
    quality,
    options
  } = params;

  try {
    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required for variations',
        code: 'INVALID_PROMPT'
      });
    }

    // Validate styles
    if (!Array.isArray(styles) || styles.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Styles array is required for variations',
        code: 'INVALID_STYLES'
      });
    }

    if (styles.length > 5) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 5 style variations allowed',
        code: 'TOO_MANY_STYLES'
      });
    }

    console.log('[Image Generation API] Generating style variations:', styles);
    
    const startTime = Date.now();
    const result = await geminiService.generateImageVariations(
      prompt,
      styles,
      {
        aspectRatio,
        quality,
        ...options
      }
    );
    const endTime = Date.now();

    if (result.success && result.variations.length > 0) {
      console.log('[Image Generation API] Successfully generated variations:', result.variations.length);
      
      return res.json({
        success: true,
        variations: result.variations,
        totalVariations: result.variations.length,
        requestedStyles: styles.length,
        successfulStyles: result.variations.length,
        originalPrompt: prompt,
        durationMs: endTime - startTime,
        metadata: {
          ...result.metadata,
          action: 'generate-variations',
          promptLength: prompt.length,
          requestedStyles: styles,
          aspectRatio,
          quality,
          apiEndpoint: '/api/ai/generate-images',
          generatedAt: new Date().toISOString()
        }
      });
    } else {
      console.error('[Image Generation API] Failed to generate variations:', result.error);
      
      return res.status(200).json({
        success: false,
        error: 'Failed to generate style variations',
        variations: result.variations || [],
        fallback: true,
        metadata: {
          action: 'generate-variations',
          errorType: 'GENERATION_FAILED',
          durationMs: endTime - startTime,
          failedAt: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('[Image Generation API] Error in handleImageVariations:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to generate image variations',
      message: error.message,
      code: 'VARIATIONS_ERROR',
      metadata: {
        action: 'generate-variations',
        errorType: error.name,
        failedAt: new Date().toISOString()
      }
    });
  }
}

/**
 * Utility function to validate image generation parameters
 */
function validateImageParams(params) {
  const {
    style = 'photorealistic',
    imageCount = 4,
    vertical = 'general',
    aspectRatio = '16:9',
    quality = 'high'
  } = params;

  const errors = [];

  // Validate style
  const validStyles = ['photorealistic', 'illustration', 'cartoon', 'abstract', 'infographic'];
  if (!validStyles.includes(style)) {
    errors.push(`Invalid style. Must be one of: ${validStyles.join(', ')}`);
  }

  // Validate image count
  if (typeof imageCount !== 'number' || imageCount < 1 || imageCount > 10) {
    errors.push('Image count must be a number between 1 and 10');
  }

  // Validate vertical
  const validVerticals = ['general', 'hospitality', 'healthcare', 'tech', 'athletics'];
  if (!validVerticals.includes(vertical)) {
    errors.push(`Invalid vertical. Must be one of: ${validVerticals.join(', ')}`);
  }

  // Validate aspect ratio
  const validRatios = ['16:9', '4:3', '1:1', '3:4'];
  if (!validRatios.includes(aspectRatio)) {
    errors.push(`Invalid aspect ratio. Must be one of: ${validRatios.join(', ')}`);
  }

  // Validate quality
  const validQualities = ['high', 'standard', 'draft'];
  if (!validQualities.includes(quality)) {
    errors.push(`Invalid quality. Must be one of: ${validQualities.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}