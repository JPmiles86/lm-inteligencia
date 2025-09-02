import { Router, Request, Response } from 'express';
import { selectProvider } from '../services/providerSelector';
import { asyncHandler, ValidationError, ProviderError } from '../middleware/error.middleware';
import { generateWithProvider } from '../services/aiGenerationService';
import { openAIAPIHandler } from '../services/providers/openai';
import { anthropicAPIHandler } from '../services/providers/anthropic';
import { googleAPIHandler } from '../services/providers/google';
import { perplexityAPIHandler } from '../services/providers/perplexity';

const router = Router();

// Generate blog content
router.post('/generate/blog', asyncHandler(async (req: Request, res: Response) => {
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
router.post('/generate/image', asyncHandler(async (req: Request, res: Response) => {
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
router.post('/generate/research', asyncHandler(async (req: Request, res: Response) => {
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
router.post('/generate/creative', asyncHandler(async (req: Request, res: Response) => {
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

// Brainstorm endpoint - Generate multiple blog ideas from a topic
router.post('/brainstorm', asyncHandler(async (req: Request, res: Response) => {
  const {
    topic,
    count = 10,
    vertical = 'all',
    tone = 'professional',
    contentTypes = [],
    prompt: customPrompt,
    provider = 'openai',
    model = 'gpt-4o',
    customContext = ''
  } = req.body;

  // Validate required fields
  if (!topic || typeof topic !== 'string') {
    throw new ValidationError('Topic is required and must be a string');
  }

  // Limit count to reasonable values
  if (count > 30) {
    throw new ValidationError('Count cannot exceed 30 ideas');
  }

  try {
    // Build brainstorming prompt
    let prompt = customPrompt || `Generate ${count} unique and creative blog post ideas about "${topic}".
    
    Requirements:
    - Industry/Vertical: ${vertical === 'all' ? 'General audience' : vertical}
    - Tone: ${tone}
    ${contentTypes.length > 0 ? `- Content types to include: ${contentTypes.join(', ')}` : ''}
    ${customContext ? `- Additional context: ${customContext}` : ''}
    
    For each idea, provide:
    1. A catchy, SEO-friendly title
    2. A unique angle or perspective
    3. A brief description (2-3 sentences)
    4. 3-5 relevant tags
    5. Difficulty level (Beginner/Intermediate/Advanced)
    6. Estimated word count (500-3000 words)
    
    Format the response as a JSON array of objects with these fields:
    - title: string
    - angle: string
    - description: string
    - tags: string[]
    - difficulty: "Beginner" | "Intermediate" | "Advanced"
    - estimatedWordCount: number
    
    Be creative and provide diverse ideas that would appeal to different audiences.`;

    // Select provider configuration
    const providerConfig = await selectProvider(
      'creative',
      provider,
      ['text'],
      []
    );

    if (model) {
      providerConfig.model = model;
    }

    const startTime = Date.now();

    // Generate ideas using the provider
    const results = await generateWithProvider(providerConfig, {
      type: 'creative',
      prompt,
      context: { topic, vertical, tone, contentTypes },
      outputCount: 1,
      settings: {
        ...providerConfig.settings,
        temperature: 0.8,
        top_p: 0.9,
        response_format: { type: 'json_object' }
      }
    });

    const responseTime = Date.now() - startTime;

    // Parse the generated ideas
    let ideas: any[] = [];
    try {
      const result = results[0];
      const content = result.content || '';
      
      // Try to parse as JSON
      if (content.includes('[') && content.includes(']')) {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          ideas = JSON.parse(jsonMatch[0]);
        }
      } else if (content.includes('{')) {
        // Sometimes the AI returns a single object or wrapped response
        const parsed = JSON.parse(content);
        ideas = Array.isArray(parsed) ? parsed : (parsed.ideas || [parsed]);
      }

      // Add metadata to each idea
      ideas = ideas.map((idea: any, index: number) => ({
        id: `${Date.now()}-${index}`,
        title: idea.title || `Idea ${index + 1}`,
        angle: idea.angle || '',
        description: idea.description || '',
        tags: Array.isArray(idea.tags) ? idea.tags : [],
        difficulty: idea.difficulty || 'Intermediate',
        estimatedWordCount: idea.estimatedWordCount || 1000,
        isFavorited: false,
        createdAt: new Date().toISOString(),
        score: Math.random() * 100,
        metadata: {
          generatedFromTopic: topic,
          generationIndex: index,
          vertical,
          tone,
          contentTypes
        }
      }));
    } catch (parseError) {
      console.error('Failed to parse ideas:', parseError);
      // Return a fallback idea if parsing fails
      ideas = [{
        id: `${Date.now()}-0`,
        title: `Blog Post About ${topic}`,
        angle: 'Expert perspective',
        description: `An in-depth exploration of ${topic} with practical insights and actionable advice.`,
        tags: [topic.toLowerCase(), tone, vertical].filter(Boolean),
        difficulty: 'Intermediate',
        estimatedWordCount: 1500,
        isFavorited: false,
        createdAt: new Date().toISOString(),
        score: 75,
        metadata: {
          generatedFromTopic: topic,
          generationIndex: 0,
          fallback: true
        }
      }];
    }

    res.json({
      success: true,
      ideas,
      generation: ideas, // For backward compatibility
      tokensUsed: results[0].tokens || 0,
      cost: results[0].cost || 0,
      durationMs: responseTime,
      metadata: {
        provider: providerConfig.provider,
        model: providerConfig.model,
        topic,
        count: ideas.length,
        vertical,
        tone,
        contentTypes
      }
    });
  } catch (error) {
    console.error('Brainstorming error:', error);
    if (error instanceof ProviderError) {
      throw error;
    }
    throw new Error(`Brainstorming failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// Analyze content
router.post('/analyze', asyncHandler(async (req: Request, res: Response) => {
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
router.get('/providers/capabilities', asyncHandler(async (req: Request, res: Response) => {
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
router.post('/test', asyncHandler(async (req: Request, res: Response) => {
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
router.post('/openai/text', asyncHandler(async (req: Request, res: Response) => {
  await openAIAPIHandler.handleTextGeneration(req, res);
}));

router.post('/openai/image', asyncHandler(async (req: Request, res: Response) => {
  await openAIAPIHandler.handleImageGeneration(req, res);
}));

router.post('/openai/blog', asyncHandler(async (req: Request, res: Response) => {
  await openAIAPIHandler.handleBlogGeneration(req, res);
}));

router.post('/openai/embedding', asyncHandler(async (req: Request, res: Response) => {
  await openAIAPIHandler.handleEmbedding(req, res);
}));

router.get('/openai/test', asyncHandler(async (req: Request, res: Response) => {
  await openAIAPIHandler.handleConnectionTest(req, res);
}));

// Anthropic specific routes
router.post('/anthropic/text', asyncHandler(async (req: Request, res: Response) => {
  await anthropicAPIHandler.handleTextGeneration(req, res);
}));

router.post('/anthropic/blog', asyncHandler(async (req: Request, res: Response) => {
  await anthropicAPIHandler.handleBlogGeneration(req, res);
}));

router.post('/anthropic/improve', asyncHandler(async (req: Request, res: Response) => {
  await anthropicAPIHandler.handleWritingImprovement(req, res);
}));

router.post('/anthropic/analyze', asyncHandler(async (req: Request, res: Response) => {
  await anthropicAPIHandler.handleContentAnalysis(req, res);
}));

router.post('/anthropic/long-form', asyncHandler(async (req: Request, res: Response) => {
  await anthropicAPIHandler.handleLongFormGeneration(req, res);
}));

router.post('/anthropic/constitutional', asyncHandler(async (req: Request, res: Response) => {
  await anthropicAPIHandler.handleConstitutionalGeneration(req, res);
}));

router.get('/anthropic/test', asyncHandler(async (req: Request, res: Response) => {
  await anthropicAPIHandler.handleConnectionTest(req, res);
}));

// Google AI specific routes
router.post('/google/text', asyncHandler(async (req: Request, res: Response) => {
  await googleAPIHandler.handleTextGeneration(req, res);
}));

router.post('/google/multimodal', asyncHandler(async (req: Request, res: Response) => {
  await googleAPIHandler.handleMultimodal(req, res);
}));

router.post('/google/chat', asyncHandler(async (req: Request, res: Response) => {
  await googleAPIHandler.handleChat(req, res);
}));

router.post('/google/blog', asyncHandler(async (req: Request, res: Response) => {
  await googleAPIHandler.handleBlogGeneration(req, res);
}));

router.post('/google/image', asyncHandler(async (req: Request, res: Response) => {
  await googleAPIHandler.handleImageGeneration(req, res);
}));

router.post('/google/analyze-image', asyncHandler(async (req: Request, res: Response) => {
  await googleAPIHandler.handleImageAnalysis(req, res);
}));

router.post('/google/blog-images', asyncHandler(async (req: Request, res: Response) => {
  await googleAPIHandler.handleBlogImageGeneration(req, res);
}));

router.post('/google/image-variations', asyncHandler(async (req: Request, res: Response) => {
  await googleAPIHandler.handleImageVariations(req, res);
}));

router.post('/google/tokens', asyncHandler(async (req: Request, res: Response) => {
  await googleAPIHandler.handleTokenCount(req, res);
}));

router.post('/google/embedding', asyncHandler(async (req: Request, res: Response) => {
  await googleAPIHandler.handleEmbedding(req, res);
}));

router.get('/google/test', asyncHandler(async (req: Request, res: Response) => {
  await googleAPIHandler.handleConnectionTest(req, res);
}));

router.get('/google/usage', asyncHandler(async (req: Request, res: Response) => {
  await googleAPIHandler.handleUsageStats(req, res);
}));

// Perplexity specific routes
router.post('/perplexity/text', asyncHandler(async (req: Request, res: Response) => {
  await perplexityAPIHandler.handleTextGeneration(req, res);
}));

router.post('/perplexity/research', asyncHandler(async (req: Request, res: Response) => {
  await perplexityAPIHandler.handleResearch(req, res);
}));

router.post('/perplexity/fact-check', asyncHandler(async (req: Request, res: Response) => {
  await perplexityAPIHandler.handleFactCheck(req, res);
}));

router.post('/perplexity/blog', asyncHandler(async (req: Request, res: Response) => {
  await perplexityAPIHandler.handleBlogGeneration(req, res);
}));

router.post('/perplexity/compare', asyncHandler(async (req: Request, res: Response) => {
  await perplexityAPIHandler.handleComparison(req, res);
}));

router.get('/perplexity/test', asyncHandler(async (req: Request, res: Response) => {
  await perplexityAPIHandler.handleConnectionTest(req, res);
}));

router.get('/perplexity/models', asyncHandler(async (req: Request, res: Response) => {
  await perplexityAPIHandler.handleGetModels(req, res);
}));

export default router;