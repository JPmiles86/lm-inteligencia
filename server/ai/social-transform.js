/**
 * Social Media Transform API Endpoint - Transform blog content to social media posts
 * Supports Twitter/X, LinkedIn, Facebook, and Instagram with platform-specific formatting
 */

// Import the social media service
let SocialMediaService;

try {
  const socialModule = await import('../../src/services/ai/SocialMediaService.js');
  SocialMediaService = socialModule.SocialMediaService;
} catch (error) {
  console.log('[Social Transform API] Using fallback service:', error.message);
  
  // Fallback service class
  class FallbackSocialMediaService {
    async transformToAllPlatforms(config) {
      return {
        success: true,
        results: {
          twitter: [{
            id: 'fallback_twitter_1',
            platform: 'twitter',
            content: `Just published: ${config.title}\n\n${config.synopsis}\n\nThoughts? 🧵`,
            hashtags: ['#content', '#blog'],
            characterCount: 100,
            hook: 'Just published:',
            cta: 'Thoughts?',
            variation: 'Fallback version',
            isFallback: true,
            createdAt: new Date().toISOString()
          }],
          linkedin: [{
            id: 'fallback_linkedin_1',
            platform: 'linkedin',
            content: `I just published: ${config.title}\n\n${config.synopsis}\n\nThis explores key insights valuable for our industry.\n\nWhat's your experience? #ProfessionalDevelopment`,
            hashtags: ['#ProfessionalDevelopment', '#Industry'],
            characterCount: 200,
            hook: 'I just published:',
            cta: 'What\'s your experience?',
            variation: 'Fallback version',
            isFallback: true,
            createdAt: new Date().toISOString()
          }]
        },
        errors: null,
        metadata: {
          processedPlatforms: config.platforms || ['twitter', 'linkedin'],
          successCount: 2,
          errorCount: 0,
          fallback: true,
          generatedAt: new Date().toISOString()
        }
      };
    }
  }
  
  SocialMediaService = FallbackSocialMediaService;
}

const socialMediaService = new SocialMediaService();

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
      action = 'transform-all',
      blogContent,
      title,
      synopsis,
      platforms = ['twitter', 'linkedin', 'facebook', 'instagram'],
      platform, // for single platform transforms
      provider = 'openai',
      model,
      customInstructions = ''
    } = req.body;

    console.log('[Social Transform API] Request received:', {
      action,
      title: title ? title.substring(0, 50) + '...' : 'No title',
      platforms: Array.isArray(platforms) ? platforms : [platform].filter(Boolean),
      provider,
      model
    });

    // Validate required fields
    if (!blogContent && !title) {
      return res.status(400).json({
        success: false,
        error: 'Either blogContent or title is required'
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required for social media transformation'
      });
    }

    // Handle different actions
    switch (action) {
      case 'transform-all':
        return await handleTransformAll(req, res, {
          blogContent,
          title,
          synopsis,
          platforms: Array.isArray(platforms) ? platforms : ['twitter', 'linkedin', 'facebook', 'instagram'],
          provider,
          model,
          customInstructions
        });
      
      case 'transform-single':
        if (!platform) {
          return res.status(400).json({
            success: false,
            error: 'Platform is required for single platform transformation'
          });
        }
        
        return await handleTransformSingle(req, res, {
          blogContent,
          title,
          synopsis,
          platform,
          provider,
          model,
          customInstructions
        });

      case 'generate-variations':
        return await handleGenerateVariations(req, res, {
          baseContent: blogContent,
          platform: platform || 'twitter',
          count: req.body.count || 3,
          style: req.body.style || 'engaging',
          provider,
          model
        });

      case 'analyze-potential':
        return await handleAnalyzePotential(req, res, {
          posts: req.body.posts || []
        });
      
      default:
        return res.status(400).json({
          success: false,
          error: `Unknown action: ${action}`
        });
    }

  } catch (error) {
    console.error('[Social Transform API] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Transform content to all specified platforms
 */
async function handleTransformAll(req, res, params) {
  const {
    blogContent,
    title,
    synopsis,
    platforms,
    provider,
    model,
    customInstructions
  } = params;

  try {
    const startTime = Date.now();

    console.log('[Social Transform API] Transforming to platforms:', platforms);

    const result = await socialMediaService.transformToAllPlatforms({
      blogContent,
      title,
      synopsis,
      platforms,
      provider,
      model,
      customInstructions
    });

    const endTime = Date.now();
    const durationMs = endTime - startTime;

    // Calculate total metrics
    const totalPosts = Object.values(result.results).reduce((sum, posts) => sum + posts.length, 0);
    const totalCost = Object.values(result.results)
      .flat()
      .reduce((sum, post) => sum + (post.cost || 0), 0);

    console.log('[Social Transform API] Transform completed:', {
      platforms: platforms,
      totalPosts,
      durationMs
    });

    return res.json({
      success: result.success,
      results: result.results,
      errors: result.errors,
      totalPosts,
      totalCost,
      durationMs,
      metadata: {
        ...result.metadata,
        originalTitle: title,
        originalSynopsis: synopsis,
        provider,
        model,
        customInstructions: !!customInstructions
      }
    });

  } catch (error) {
    console.error('[Social Transform API] Error in handleTransformAll:', error);
    
    // Provide fallback response
    const fallbackResults = generateFallbackResponse(title, synopsis, platforms);
    
    return res.status(200).json({
      success: true,
      results: fallbackResults,
      errors: { general: `Transformation failed, provided fallback content: ${error.message}` },
      totalPosts: Object.values(fallbackResults).reduce((sum, posts) => sum + posts.length, 0),
      totalCost: 0,
      durationMs: 0,
      fallback: true,
      metadata: {
        originalTitle: title,
        originalSynopsis: synopsis,
        provider,
        model,
        fallback: true,
        generatedAt: new Date().toISOString()
      }
    });
  }
}

/**
 * Transform content to a single platform
 */
async function handleTransformSingle(req, res, params) {
  const {
    blogContent,
    title,
    synopsis,
    platform,
    provider,
    model,
    customInstructions
  } = params;

  try {
    const startTime = Date.now();

    const result = await socialMediaService.transformToPlatform({
      blogContent,
      title,
      synopsis,
      platform,
      provider,
      model,
      customInstructions
    });

    const endTime = Date.now();
    const durationMs = endTime - startTime;

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
        platform,
        fallback: false
      });
    }

    return res.json({
      success: true,
      platform,
      posts: result.posts,
      tokensUsed: result.tokensUsed || 0,
      cost: result.cost || 0,
      durationMs,
      metadata: {
        ...result.metadata,
        originalTitle: title,
        originalSynopsis: synopsis,
        customInstructions: !!customInstructions
      }
    });

  } catch (error) {
    console.error('[Social Transform API] Error in handleTransformSingle:', error);
    
    // Generate fallback for single platform
    const fallbackPosts = generateSinglePlatformFallback(platform, title, synopsis);
    
    return res.status(200).json({
      success: true,
      platform,
      posts: fallbackPosts,
      tokensUsed: 0,
      cost: 0,
      durationMs: 0,
      fallback: true,
      error: `Generation failed, provided fallback: ${error.message}`
    });
  }
}

/**
 * Generate content variations for a platform
 */
async function handleGenerateVariations(req, res, params) {
  const { baseContent, platform, count, style, provider, model } = params;

  try {
    const startTime = Date.now();

    // Use the service method if available
    let variations = [];
    
    if (socialMediaService.generatePlatformVariations) {
      variations = await socialMediaService.generatePlatformVariations({
        baseContent,
        platform,
        count,
        style,
        provider,
        model
      });
    } else {
      // Fallback: generate simple variations
      for (let i = 0; i < count; i++) {
        variations.push({
          id: `var_${platform}_${Date.now()}_${i}`,
          platform,
          content: `${style} variation ${i + 1}: ${baseContent}`,
          hashtags: ['#content', '#variation'],
          variation: `${style} style ${i + 1}`,
          createdAt: new Date().toISOString()
        });
      }
    }

    const endTime = Date.now();

    return res.json({
      success: true,
      platform,
      variations,
      count: variations.length,
      style,
      durationMs: endTime - startTime,
      metadata: {
        provider,
        model,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Social Transform API] Error in handleGenerateVariations:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      platform,
      count: 0
    });
  }
}

/**
 * Analyze social media potential of posts
 */
async function handleAnalyzePotential(req, res, params) {
  const { posts } = params;

  try {
    if (!Array.isArray(posts) || posts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Posts array is required for analysis'
      });
    }

    // Use the service method if available
    let analysis = {};
    
    if (socialMediaService.analyzeSocialPotential) {
      analysis = socialMediaService.analyzeSocialPotential(posts);
    } else {
      // Fallback: simple analysis
      posts.forEach(post => {
        analysis[post.platform] = {
          score: 75,
          strengths: ['Content provided', 'Platform appropriate'],
          suggestions: ['Consider adding more engagement elements'],
          hashtagAnalysis: {
            count: post.hashtags ? post.hashtags.length : 0,
            withinLimit: true,
            suggestions: ['Good hashtag usage']
          }
        };
      });
    }

    return res.json({
      success: true,
      analysis,
      postsAnalyzed: posts.length,
      metadata: {
        analyzedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Social Transform API] Error in handleAnalyzePotential:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Generate fallback response when service fails
 */
function generateFallbackResponse(title, synopsis, platforms) {
  const fallbackResults = {};
  
  platforms.forEach(platform => {
    fallbackResults[platform] = generateSinglePlatformFallback(platform, title, synopsis);
  });
  
  return fallbackResults;
}

/**
 * Generate fallback for a single platform
 */
function generateSinglePlatformFallback(platform, title, synopsis) {
  const templates = {
    twitter: [
      {
        id: `fallback_${platform}_${Date.now()}_1`,
        platform,
        content: `📝 ${title}\n\n${synopsis}\n\nThoughts?`,
        hashtags: ['#blog', '#content'],
        characterCount: 100,
        hook: '📝 New post:',
        cta: 'Thoughts?',
        variation: 'Fallback tweet',
        isFallback: true,
        createdAt: new Date().toISOString()
      }
    ],
    linkedin: [
      {
        id: `fallback_${platform}_${Date.now()}_1`,
        platform,
        content: `I just published: ${title}\n\n${synopsis}\n\nWhat are your thoughts on this topic? I'd love to hear your perspective.\n\n#ProfessionalDevelopment #Industry`,
        hashtags: ['#ProfessionalDevelopment', '#Industry'],
        characterCount: 200,
        hook: 'I just published:',
        cta: 'What are your thoughts?',
        variation: 'Fallback LinkedIn post',
        isFallback: true,
        createdAt: new Date().toISOString()
      }
    ],
    facebook: [
      {
        id: `fallback_${platform}_${Date.now()}_1`,
        platform,
        content: `🎉 New post: ${title}\n\n${synopsis}\n\nWhat do you think? Share your experience in the comments!`,
        hashtags: ['#newpost', '#blog'],
        characterCount: 150,
        hook: '🎉 New post:',
        cta: 'Share your experience!',
        variation: 'Fallback Facebook post',
        isFallback: true,
        createdAt: new Date().toISOString()
      }
    ],
    instagram: [
      {
        id: `fallback_${platform}_${Date.now()}_1`,
        platform,
        content: `✨ ${title} ✨\n\n${synopsis}\n\nLink in bio! 👆\n\n#blog #content #new #insights #tips #knowledge #share #community #inspiration #growth`,
        hashtags: ['#blog', '#content', '#new', '#insights', '#tips', '#knowledge', '#share', '#community', '#inspiration', '#growth'],
        characterCount: 200,
        hook: '✨ New content ✨',
        cta: 'Link in bio!',
        variation: 'Fallback Instagram post',
        isFallback: true,
        createdAt: new Date().toISOString()
      }
    ]
  };
  
  return templates[platform] || [
    {
      id: `fallback_${platform}_${Date.now()}_1`,
      platform,
      content: `${title}\n\n${synopsis}`,
      hashtags: ['#content'],
      characterCount: 100,
      hook: 'New content:',
      cta: 'Check it out!',
      variation: 'Fallback post',
      isFallback: true,
      createdAt: new Date().toISOString()
    }
  ];
}