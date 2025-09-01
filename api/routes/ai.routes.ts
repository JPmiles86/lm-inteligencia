import { Router } from 'express';
import { selectProvider } from '../services/providerSelector';
import { asyncHandler, ValidationError, ProviderError } from '../middleware/error.middleware';
import { generateWithProvider } from '../services/aiGenerationService';
import { openAIAPIHandler } from '../services/providers/openai';
import { anthropicAPIHandler } from '../services/providers/anthropic';
import { googleAPIHandler } from '../services/providers/google';
import { perplexityAPIHandler } from '../services/providers/perplexity';

const router = Router();

// Generate blog content
router.post('/generate/blog', asyncHandler(async (req, res) => {
  const { 
    prompt, 
    context = {}, 
    preferredProvider,
    model,
    taskType = 'writing',
    outputCount = 1,
    settings = {}
  } = req.body;

  // Validate required fields
  if (!prompt || typeof prompt !== 'string') {
    throw new ValidationError('Prompt is required and must be a string');
  }

  if (outputCount > 5) {
    throw new ValidationError('Output count cannot exceed 5');
  }

  try {
    // Select appropriate provider
    const providerConfig = await selectProvider(
      taskType,
      preferredProvider,
      ['text'],
      []
    );

    // Override model if specified
    if (model) {
      providerConfig.model = model;
    }

    const startTime = Date.now();
    
    // Generate content
    const results = await generateWithProvider(providerConfig, {
      type: 'blog',
      prompt,
      context,
      outputCount,
      settings: {
        ...providerConfig.settings,
        ...settings
      }
    });

    const responseTime = Date.now() - startTime;

    res.json({
      success: true,
      results,
      metadata: {
        provider: providerConfig.provider,
        model: providerConfig.model,
        taskType,
        responseTime,
        outputCount: results.length,
        totalTokens: results.reduce((sum, r) => sum + (r.tokens || 0), 0),
        totalCost: results.reduce((sum, r) => sum + (r.cost || 0), 0)
      }
    });
  } catch (error) {
    if (error instanceof ProviderError) {
      throw error;
    }
    throw new Error(`Blog generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Generate image content
router.post('/generate/image', asyncHandler(async (req, res) => {
  const {
    prompt,
    preferredProvider,
    model,
    count = 1,
    size = '1024x1024',
    quality = 'standard',
    style,
    settings = {}
  } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    throw new ValidationError('Prompt is required and must be a string');
  }

  if (count > 4) {
    throw new ValidationError('Image count cannot exceed 4');
  }

  try {
    // Select provider with image capabilities
    const providerConfig = await selectProvider(
      'image',
      preferredProvider,
      ['image'],
      []
    );

    if (model) {
      providerConfig.model = model;
    }

    const startTime = Date.now();

    const results = await generateWithProvider(providerConfig, {
      type: 'image',
      prompt,
      count,
      size,
      quality,
      style,
      settings: {
        ...providerConfig.settings,
        ...settings
      }
    });

    const responseTime = Date.now() - startTime;

    res.json({
      success: true,
      results,
      metadata: {
        provider: providerConfig.provider,
        model: providerConfig.model,
        responseTime,
        imageCount: results.length,
        totalCost: results.reduce((sum, r) => sum + (r.cost || 0), 0)
      }
    });
  } catch (error) {
    if (error instanceof ProviderError) {
      throw error;
    }
    throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Generate research content
router.post('/generate/research', asyncHandler(async (req, res) => {
  const {
    query,
    context = {},
    preferredProvider,
    model,
    includeRealtimeData = true,
    maxSources = 10,
    settings = {}
  } = req.body;

  if (!query || typeof query !== 'string') {
    throw new ValidationError('Research query is required and must be a string');
  }

  try {
    // For research, prefer providers with real-time capabilities
    const providerConfig = await selectProvider(
      'research',
      preferredProvider,
      ['research'],
      []
    );

    if (model) {
      providerConfig.model = model;
    }

    const startTime = Date.now();

    const results = await generateWithProvider(providerConfig, {
      type: 'research',
      prompt: query,
      context,
      includeRealtimeData,
      maxSources,
      settings: {
        ...providerConfig.settings,
        ...settings
      }
    });

    const responseTime = Date.now() - startTime;

    res.json({
      success: true,
      results,
      metadata: {
        provider: providerConfig.provider,
        model: providerConfig.model,
        responseTime,
        includeRealtimeData,
        maxSources,
        totalTokens: results.reduce((sum, r) => sum + (r.tokens || 0), 0),
        totalCost: results.reduce((sum, r) => sum + (r.cost || 0), 0)
      }
    });
  } catch (error) {
    if (error instanceof ProviderError) {
      throw error;
    }
    throw new Error(`Research generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Generate creative content (brainstorming, ideation)
router.post('/generate/creative', asyncHandler(async (req, res) => {
  const {
    prompt,
    context = {},
    preferredProvider,
    model,
    creativityLevel = 0.8,
    outputCount = 3,
    settings = {}
  } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    throw new ValidationError('Prompt is required and must be a string');
  }

  if (outputCount > 10) {
    throw new ValidationError('Output count cannot exceed 10 for creative tasks');
  }

  try {
    const providerConfig = await selectProvider(
      'creative',
      preferredProvider,
      ['text'],
      []
    );

    if (model) {
      providerConfig.model = model;
    }

    const startTime = Date.now();

    const results = await generateWithProvider(providerConfig, {
      type: 'creative',
      prompt,
      context,
      outputCount,
      settings: {
        ...providerConfig.settings,
        ...settings,
        temperature: creativityLevel,
        top_p: 0.9
      }
    });

    const responseTime = Date.now() - startTime;

    res.json({
      success: true,
      results,
      metadata: {
        provider: providerConfig.provider,
        model: providerConfig.model,
        responseTime,
        creativityLevel,
        outputCount: results.length,
        totalTokens: results.reduce((sum, r) => sum + (r.tokens || 0), 0),
        totalCost: results.reduce((sum, r) => sum + (r.cost || 0), 0)
      }
    });
  } catch (error) {
    if (error instanceof ProviderError) {
      throw error;
    }
    throw new Error(`Creative generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Analyze content
router.post('/analyze', asyncHandler(async (req, res) => {
  const {
    content,
    analysisType = 'general',
    context = {},
    preferredProvider,
    model,
    settings = {}
  } = req.body;

  if (!content || typeof content !== 'string') {
    throw new ValidationError('Content is required and must be a string');
  }

  const validAnalysisTypes = ['general', 'seo', 'readability', 'sentiment', 'tone', 'structure'];
  if (!validAnalysisTypes.includes(analysisType)) {
    throw new ValidationError(`Analysis type must be one of: ${validAnalysisTypes.join(', ')}`);
  }

  try {
    const providerConfig = await selectProvider(
      'analysis',
      preferredProvider,
      ['text'],
      []
    );

    if (model) {
      providerConfig.model = model;
    }

    const startTime = Date.now();

    const results = await generateWithProvider(providerConfig, {
      type: 'analysis',
      prompt: `Analyze the following content for ${analysisType}:\n\n${content}`,
      context: {
        ...context,
        analysisType,
        contentLength: content.length
      },
      settings: {
        ...providerConfig.settings,
        ...settings
      }
    });

    const responseTime = Date.now() - startTime;

    res.json({
      success: true,
      results,
      metadata: {
        provider: providerConfig.provider,
        model: providerConfig.model,
        analysisType,
        contentLength: content.length,
        responseTime,
        totalTokens: results.reduce((sum, r) => sum + (r.tokens || 0), 0),
        totalCost: results.reduce((sum, r) => sum + (r.cost || 0), 0)
      }
    });
  } catch (error) {
    if (error instanceof ProviderError) {
      throw error;
    }
    throw new Error(`Content analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Get provider capabilities
router.get('/providers/capabilities', asyncHandler(async (req, res) => {
  const { listSupportedProviders, getProviderUsageStats } = await import('../services/providerSelector');
  
  try {
    const [capabilities, usageStats] = await Promise.all([
      listSupportedProviders(),
      getProviderUsageStats()
    ]);

    res.json({
      capabilities,
      usage: usageStats,
      taskTypes: {
        research: 'Real-time information gathering and analysis',
        writing: 'Blog posts, articles, and creative writing',
        creative: 'Brainstorming, ideation, and creative content',
        analysis: 'Content analysis, SEO, readability, sentiment',
        image: 'Image generation from text prompts'
      },
      fallbackChains: {
        research: ['perplexity', 'anthropic', 'google', 'openai'],
        writing: ['anthropic', 'openai', 'google'],
        image: ['google', 'openai'],
        creative: ['openai', 'anthropic', 'google'],
        analysis: ['anthropic', 'openai', 'google']
      }
    });
  } catch (error) {
    throw new Error(`Failed to get provider capabilities: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Test AI generation endpoint
router.post('/test', asyncHandler(async (req, res) => {
  const { provider, model, prompt = 'Test generation. Please respond with "OK".' } = req.body;

  if (!provider) {
    throw new ValidationError('Provider is required for testing');
  }

  try {
    const providerConfig = await selectProvider(
      'writing',
      provider,
      ['text'],
      []
    );

    if (model) {
      providerConfig.model = model;
    }

    const startTime = Date.now();

    const results = await generateWithProvider(providerConfig, {
      type: 'test',
      prompt,
      settings: {
        ...providerConfig.settings,
        max_tokens: 50
      }
    });

    const responseTime = Date.now() - startTime;

    res.json({
      success: true,
      provider: providerConfig.provider,
      model: providerConfig.model,
      response: results[0]?.content || 'No response',
      responseTime,
      tokens: results[0]?.tokens || 0,
      cost: results[0]?.cost || 0
    });
  } catch (error) {
    if (error instanceof ProviderError) {
      throw error;
    }
    throw new Error(`AI test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// OpenAI specific routes
router.post('/openai/text', asyncHandler(async (req, res) => {
  await openAIAPIHandler.handleTextGeneration(req, res);
}));

router.post('/openai/image', asyncHandler(async (req, res) => {
  await openAIAPIHandler.handleImageGeneration(req, res);
}));

router.post('/openai/blog', asyncHandler(async (req, res) => {
  await openAIAPIHandler.handleBlogGeneration(req, res);
}));

router.post('/openai/embedding', asyncHandler(async (req, res) => {
  await openAIAPIHandler.handleEmbedding(req, res);
}));

router.get('/openai/test', asyncHandler(async (req, res) => {
  await openAIAPIHandler.handleConnectionTest(req, res);
}));

// Anthropic specific routes
router.post('/anthropic/text', asyncHandler(async (req, res) => {
  await anthropicAPIHandler.handleTextGeneration(req, res);
}));

router.post('/anthropic/blog', asyncHandler(async (req, res) => {
  await anthropicAPIHandler.handleBlogGeneration(req, res);
}));

router.post('/anthropic/improve', asyncHandler(async (req, res) => {
  await anthropicAPIHandler.handleWritingImprovement(req, res);
}));

router.post('/anthropic/analyze', asyncHandler(async (req, res) => {
  await anthropicAPIHandler.handleContentAnalysis(req, res);
}));

router.post('/anthropic/long-form', asyncHandler(async (req, res) => {
  await anthropicAPIHandler.handleLongFormGeneration(req, res);
}));

router.post('/anthropic/constitutional', asyncHandler(async (req, res) => {
  await anthropicAPIHandler.handleConstitutionalGeneration(req, res);
}));

router.get('/anthropic/test', asyncHandler(async (req, res) => {
  await anthropicAPIHandler.handleConnectionTest(req, res);
}));

// Google AI specific routes
router.post('/google/text', asyncHandler(async (req, res) => {
  await googleAPIHandler.handleTextGeneration(req, res);
}));

router.post('/google/multimodal', asyncHandler(async (req, res) => {
  await googleAPIHandler.handleMultimodal(req, res);
}));

router.post('/google/chat', asyncHandler(async (req, res) => {
  await googleAPIHandler.handleChat(req, res);
}));

router.post('/google/blog', asyncHandler(async (req, res) => {
  await googleAPIHandler.handleBlogGeneration(req, res);
}));

router.post('/google/image', asyncHandler(async (req, res) => {
  await googleAPIHandler.handleImageGeneration(req, res);
}));

router.post('/google/analyze-image', asyncHandler(async (req, res) => {
  await googleAPIHandler.handleImageAnalysis(req, res);
}));

router.post('/google/blog-images', asyncHandler(async (req, res) => {
  await googleAPIHandler.handleBlogImageGeneration(req, res);
}));

router.post('/google/image-variations', asyncHandler(async (req, res) => {
  await googleAPIHandler.handleImageVariations(req, res);
}));

router.post('/google/tokens', asyncHandler(async (req, res) => {
  await googleAPIHandler.handleTokenCount(req, res);
}));

router.post('/google/embedding', asyncHandler(async (req, res) => {
  await googleAPIHandler.handleEmbedding(req, res);
}));

router.get('/google/test', asyncHandler(async (req, res) => {
  await googleAPIHandler.handleConnectionTest(req, res);
}));

router.get('/google/usage', asyncHandler(async (req, res) => {
  await googleAPIHandler.handleUsageStats(req, res);
}));

// Perplexity specific routes
router.post('/perplexity/text', asyncHandler(async (req, res) => {
  await perplexityAPIHandler.handleTextGeneration(req, res);
}));

router.post('/perplexity/research', asyncHandler(async (req, res) => {
  await perplexityAPIHandler.handleResearch(req, res);
}));

router.post('/perplexity/fact-check', asyncHandler(async (req, res) => {
  await perplexityAPIHandler.handleFactCheck(req, res);
}));

router.post('/perplexity/blog', asyncHandler(async (req, res) => {
  await perplexityAPIHandler.handleBlogGeneration(req, res);
}));

router.post('/perplexity/compare', asyncHandler(async (req, res) => {
  await perplexityAPIHandler.handleComparison(req, res);
}));

router.get('/perplexity/test', asyncHandler(async (req, res) => {
  await perplexityAPIHandler.handleConnectionTest(req, res);
}));

router.get('/perplexity/models', asyncHandler(async (req, res) => {
  await perplexityAPIHandler.handleGetModels(req, res);
}));

export default router;