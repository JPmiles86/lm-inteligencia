/**
 * Social Media Service - Transform blog content into platform-specific social media posts
 * Supports Twitter/X, LinkedIn, Facebook, and Instagram with platform-specific formatting
 */

// Import the generation service to leverage existing provider infrastructure
let GenerationService;

try {
  const genModule = await import('./GenerationServiceReal.js');
  GenerationService = genModule.GenerationService;
} catch (error) {
  console.log('[SocialMedia Service] Using stub generation service:', error.message);
  const stubs = await import('./StubServices.js');
  GenerationService = stubs.GenerationService;
}

export class SocialMediaService {
  constructor() {
    this.generationService = new GenerationService();
    
    // Platform-specific configurations
    this.platformConfigs = {
      twitter: {
        name: 'Twitter/X',
        maxLength: 280,
        hashtagLimit: 5,
        threadSupport: true,
        maxThreadTweets: 10,
        features: ['hashtags', 'mentions', 'threads']
      },
      linkedin: {
        name: 'LinkedIn',
        maxLength: 3000,
        optimalLength: { min: 1300, max: 3000 },
        hashtagLimit: 5,
        threadSupport: false,
        features: ['hashtags', 'mentions', 'professional_tone']
      },
      facebook: {
        name: 'Facebook',
        maxLength: 63206,
        optimalLength: { min: 200, max: 1000 },
        hashtagLimit: 10,
        threadSupport: false,
        features: ['hashtags', 'engagement_hooks', 'questions']
      },
      instagram: {
        name: 'Instagram',
        maxLength: 2200,
        hashtagLimit: 30,
        optimalHashtags: { min: 10, max: 30 },
        threadSupport: false,
        features: ['hashtags', 'visual_focus', 'stories']
      }
    };
  }

  /**
   * Transform blog content to all social media platforms
   */
  async transformToAllPlatforms(config) {
    const {
      blogContent,
      title,
      synopsis,
      platforms = ['twitter', 'linkedin', 'facebook', 'instagram'],
      provider = 'openai',
      model,
      customInstructions = ''
    } = config;

    console.log('[SocialMedia Service] Transforming to platforms:', platforms);

    const results = {};
    const errors = {};

    // Process each platform
    for (const platform of platforms) {
      try {
        console.log(`[SocialMedia Service] Processing platform: ${platform}`);
        
        const result = await this.transformToPlatform({
          blogContent,
          title,
          synopsis,
          platform,
          provider,
          model,
          customInstructions
        });

        if (result.success) {
          results[platform] = result.posts;
        } else {
          errors[platform] = result.error;
          // Generate fallback content for failed platforms
          results[platform] = this.generateFallbackPosts(platform, title, synopsis);
        }
      } catch (error) {
        console.error(`[SocialMedia Service] Error processing ${platform}:`, error);
        errors[platform] = error.message;
        results[platform] = this.generateFallbackPosts(platform, title, synopsis);
      }
    }

    return {
      success: Object.keys(results).length > 0,
      results,
      errors: Object.keys(errors).length > 0 ? errors : null,
      metadata: {
        processedPlatforms: platforms,
        successCount: Object.keys(results).length,
        errorCount: Object.keys(errors).length,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Transform content for a specific platform
   */
  async transformToPlatform(config) {
    const {
      blogContent,
      title,
      synopsis,
      platform,
      provider = 'openai',
      model,
      customInstructions = ''
    } = config;

    const platformConfig = this.platformConfigs[platform];
    if (!platformConfig) {
      return {
        success: false,
        error: `Unsupported platform: ${platform}`
      };
    }

    try {
      const prompt = this.buildTransformationPrompt({
        blogContent,
        title,
        synopsis,
        platform,
        platformConfig,
        customInstructions
      });

      // Generate content using the existing generation service
      const generationConfig = {
        mode: 'direct',
        task: 'social-media',
        prompt: prompt,
        provider: provider,
        model: model || this.getDefaultModel(provider),
        temperature: 0.8, // Higher creativity for social posts
        maxTokens: 2000,
        context: {
          styleGuides: { brand: true },
          previousContent: { 
            mode: 'none',
            includeElements: {
              titles: false,
              synopsis: false,
              content: false,
              tags: false,
              metadata: false,
              images: false
            }
          },
          additionalContext: `Social media transformation for ${platformConfig.name}`
        }
      };

      const result = await this.generationService.generateContent(generationConfig);
      
      if (!result.success) {
        console.error(`[SocialMedia Service] Generation failed for ${platform}:`, result.error);
        return {
          success: false,
          error: result.error || `Failed to generate content for ${platform}`
        };
      }

      // Parse and format the generated content
      const posts = this.parseAndFormatPosts(result.generation, platform, platformConfig);

      return {
        success: true,
        posts: posts,
        tokensUsed: result.tokensUsed || 0,
        cost: result.cost || 0,
        metadata: {
          platform,
          generatedCount: posts.length,
          provider: result.provider,
          model: result.model,
          generatedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error(`[SocialMedia Service] Error transforming to ${platform}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Build the AI prompt for content transformation
   */
  buildTransformationPrompt({ blogContent, title, synopsis, platform, platformConfig, customInstructions }) {
    const platformRules = this.getPlatformSpecificRules(platform, platformConfig);
    
    let content = blogContent;
    if (typeof content === 'object' && content.content) {
      content = content.content;
    }
    if (typeof content === 'string' && content.length > 3000) {
      content = content.substring(0, 3000) + '...';
    }

    const customSection = customInstructions ? 
      `\nAdditional Instructions: ${customInstructions}` : '';

    return `
You are an expert social media content creator. Transform the following blog content into engaging ${platformConfig.name} posts.

Blog Title: "${title}"
Synopsis: "${synopsis}"

Blog Content:
${content}

Platform: ${platformConfig.name}
${platformRules}

${customSection}

CRITICAL REQUIREMENTS:
- Generate 2-3 variations of posts for this platform
- Each post must be unique and offer different angles/hooks
- Follow all platform-specific requirements exactly
- Include relevant hashtags as specified
- Make posts engaging and shareable
- Extract key insights and value from the blog content

OUTPUT FORMAT:
Provide your response as a JSON array where each post is an object with the following structure:

[
  {
    "content": "The main post content text",
    "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
    "characterCount": 250,
    "hook": "The opening hook used",
    "cta": "Call to action",
    "variation": "Description of this variation's approach",
    "thread": [
      {
        "content": "First tweet content",
        "characterCount": 180
      },
      {
        "content": "Second tweet content", 
        "characterCount": 150
      }
    ] // Only for Twitter/X with thread support
  }
]

IMPORTANT: Return ONLY the JSON array, no additional text or formatting. Generate exactly 2-3 unique variations for ${platformConfig.name}.
    `.trim();
  }

  /**
   * Get platform-specific rules and requirements
   */
  getPlatformSpecificRules(platform, config) {
    const rules = {
      twitter: `
CHARACTER LIMIT: ${config.maxLength} characters maximum per tweet
HASHTAGS: Use ${config.hashtagLimit} relevant hashtags maximum
THREADS: Generate both single tweets and thread options (up to ${config.maxThreadTweets} tweets)
TONE: Conversational, engaging, with strong hooks
FEATURES: Use @mentions when relevant, create tweetable quotes
BEST PRACTICES: Start with hooks, use line breaks, include call-to-action`,

      linkedin: `
CHARACTER LIMIT: ${config.maxLength} characters maximum, optimal range ${config.optimalLength.min}-${config.optimalLength.max}
HASHTAGS: Use exactly ${config.hashtagLimit} professional, industry-relevant hashtags
TONE: Professional but approachable, thought leadership style
FEATURES: Focus on insights, lessons learned, professional value
BEST PRACTICES: Use line breaks for readability, ask thoughtful questions, share actionable advice
FORMAT: Hook → Value/Story → Insight → Call-to-action`,

      facebook: `
CHARACTER LIMIT: No strict limit, but optimal range ${config.optimalLength.min}-${config.optimalLength.max} characters
HASHTAGS: Use up to ${config.hashtagLimit} hashtags, but prioritize engagement over hashtag quantity
TONE: Friendly, conversational, community-focused
FEATURES: Encourage comments and shares, ask questions
BEST PRACTICES: Create discussion starters, use emojis appropriately, focus on storytelling
FORMAT: Engaging story or question → Value → Community engagement call-to-action`,

      instagram: `
CHARACTER LIMIT: ${config.maxLength} characters maximum for captions
HASHTAGS: Use ${config.optimalHashtags.min}-${config.optimalHashtags.max} strategic hashtags for maximum reach
TONE: Visual-focused, inspiring, behind-the-scenes
FEATURES: Assume this will accompany visual content, mention Stories
BEST PRACTICES: Create caption that complements imagery, use emoji strategically, encourage saves
FORMAT: Hook → Story/Value → Hashtag groups → Call-to-action`
    };

    return rules[platform] || `General social media guidelines for ${config.name}`;
  }

  /**
   * Parse and format the AI-generated posts
   */
  parseAndFormatPosts(rawContent, platform, platformConfig) {
    try {
      let posts = [];
      
      if (typeof rawContent === 'string') {
        // Clean the content and look for JSON
        const cleanContent = rawContent.trim();
        
        // Look for JSON array pattern
        const jsonMatch = cleanContent.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          try {
            posts = JSON.parse(jsonMatch[0]);
          } catch (parseError) {
            console.log('[SocialMedia Service] JSON parse failed, trying structured text parsing');
            posts = this.parseStructuredPosts(cleanContent, platform, platformConfig);
          }
        } else {
          posts = this.parseStructuredPosts(cleanContent, platform, platformConfig);
        }
      } else if (Array.isArray(rawContent)) {
        posts = rawContent;
      } else {
        throw new Error('Invalid content format');
      }

      // Ensure we have an array
      if (!Array.isArray(posts)) {
        posts = [posts];
      }

      // Format and validate each post
      const formattedPosts = posts.map((post, index) => {
        const id = `${platform}_post_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`;
        
        const formattedPost = {
          id,
          platform,
          content: this.sanitizeContent(post.content || '', platformConfig.maxLength),
          hashtags: this.validateHashtags(post.hashtags || [], platformConfig.hashtagLimit),
          characterCount: (post.content || '').length,
          hook: post.hook || this.extractHook(post.content || ''),
          cta: post.cta || 'What do you think?',
          variation: post.variation || `Variation ${index + 1}`,
          createdAt: new Date().toISOString(),
          isWithinLimits: this.checkLimits(post.content || '', platformConfig),
          platformLimits: {
            maxLength: platformConfig.maxLength,
            hashtagLimit: platformConfig.hashtagLimit
          }
        };

        // Add thread support for Twitter
        if (platform === 'twitter' && post.thread && Array.isArray(post.thread)) {
          formattedPost.thread = post.thread.map((tweet, tweetIndex) => ({
            id: `${id}_thread_${tweetIndex}`,
            content: this.sanitizeContent(tweet.content || '', 280),
            characterCount: (tweet.content || '').length,
            isWithinLimits: (tweet.content || '').length <= 280
          }));
        }

        return formattedPost;
      }).filter(post => post.content && post.content.length > 0);

      // Ensure we have at least some posts, generate fallback if necessary
      if (formattedPosts.length === 0) {
        console.log(`[SocialMedia Service] No valid posts generated for ${platform}, using fallback`);
        return this.generateFallbackPosts(platform, 'Blog Content', 'Great content to share');
      }

      return formattedPosts;

    } catch (error) {
      console.error('[SocialMedia Service] Error parsing posts:', error);
      return this.generateFallbackPosts(platform, 'Blog Content', 'Great content to share');
    }
  }

  /**
   * Parse structured text format as fallback
   */
  parseStructuredPosts(content, platform, platformConfig) {
    const posts = [];
    
    // Try to find numbered sections or clear post divisions
    const patterns = [
      /(\d+[\.\)]\s*)(.*?)(?=\d+[\.\)]|$)/gs,
      /(Post \d+:)(.*?)(?=(Post \d+:)|$)/gsi,
      /^(.{50,})$/gm
    ];

    for (const pattern of patterns) {
      const matches = [...content.matchAll(pattern)];
      
      if (matches.length > 1) {
        matches.forEach((match, index) => {
          const postContent = (match[2] || match[1] || match[0])
            .replace(/^(Post \d+:|Variation \d+:)\s*/i, '')
            .trim()
            .substring(0, platformConfig.maxLength);
          
          if (postContent && postContent.length > 20) {
            posts.push({
              content: postContent,
              hashtags: this.generateDefaultHashtags(platform),
              variation: `Variation ${index + 1}`
            });
          }
        });
        
        if (posts.length > 0) break;
      }
    }

    return posts.length > 0 ? posts : [];
  }

  /**
   * Generate fallback posts when AI generation fails
   */
  generateFallbackPosts(platform, title, synopsis) {
    const templates = this.getFallbackTemplates(platform);
    
    return templates.map((template, index) => {
      const id = `${platform}_fallback_${Date.now()}_${index}`;
      const content = template.content
        .replace('{title}', title)
        .replace('{synopsis}', synopsis);
      
      return {
        id,
        platform,
        content: this.sanitizeContent(content, this.platformConfigs[platform].maxLength),
        hashtags: template.hashtags,
        characterCount: content.length,
        hook: template.hook,
        cta: template.cta,
        variation: `Fallback ${index + 1}`,
        createdAt: new Date().toISOString(),
        isFallback: true,
        isWithinLimits: content.length <= this.platformConfigs[platform].maxLength,
        platformLimits: {
          maxLength: this.platformConfigs[platform].maxLength,
          hashtagLimit: this.platformConfigs[platform].hashtagLimit
        }
      };
    });
  }

  /**
   * Get fallback templates for each platform
   */
  getFallbackTemplates(platform) {
    const templates = {
      twitter: [
        {
          content: "Just published: {title}\n\n{synopsis}\n\nWhat are your thoughts? 🧵",
          hook: "Just published:",
          cta: "What are your thoughts?",
          hashtags: ['content', 'blog', 'thoughts']
        },
        {
          content: "📝 New blog post is live!\n\n{title}\n\n{synopsis}\n\nCheck it out! 👇",
          hook: "📝 New blog post is live!",
          cta: "Check it out!",
          hashtags: ['newpost', 'blog', 'content']
        }
      ],
      linkedin: [
        {
          content: "I just published a new article: {title}\n\n{synopsis}\n\nThis piece explores key insights that I believe will be valuable for professionals in our industry.\n\nWhat's your experience with this topic? I'd love to hear your thoughts in the comments.\n\n#ProfessionalDevelopment #Industry #Insights",
          hook: "I just published a new article:",
          cta: "What's your experience with this topic?",
          hashtags: ['ProfessionalDevelopment', 'Industry', 'Insights']
        }
      ],
      facebook: [
        {
          content: "🎉 New blog post is here!\n\n{title}\n\n{synopsis}\n\nI'm excited to share these insights with you. Have you experienced something similar? Let me know in the comments!",
          hook: "🎉 New blog post is here!",
          cta: "Have you experienced something similar?",
          hashtags: ['blog', 'newpost', 'insights']
        }
      ],
      instagram: [
        {
          content: "✨ New blog post alert! ✨\n\n{title}\n\n{synopsis}\n\nSwipe to see key takeaways! 👆 Link in bio for the full read.\n\n#blog #content #insights #tips #knowledge #learning #growth #inspiration #community #share",
          hook: "✨ New blog post alert! ✨",
          cta: "Link in bio for the full read",
          hashtags: ['blog', 'content', 'insights', 'tips', 'knowledge', 'learning', 'growth', 'inspiration', 'community', 'share']
        }
      ]
    };

    return templates[platform] || [
      {
        content: `New content: {title}\n\n{synopsis}`,
        hook: "New content:",
        cta: "Check it out!",
        hashtags: ['content', 'new']
      }
    ];
  }

  /**
   * Utility methods
   */

  sanitizeContent(content, maxLength) {
    if (!content) return '';
    
    // Basic sanitization
    let sanitized = content
      .replace(/[^\w\s\.\,\!\?\@\#\$\%\^\&\*\(\)\-\=\+\[\]\{\}\|\\\:\;\"\'\<\>\~\`\/\n\r\u{1F300}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .trim();
    
    // Truncate if necessary
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength - 3) + '...';
    }
    
    return sanitized;
  }

  validateHashtags(hashtags, limit) {
    if (!Array.isArray(hashtags)) return [];
    
    return hashtags
      .map(tag => {
        // Clean hashtag
        let cleanTag = tag.replace(/^#/, '').replace(/[^\w]/g, '');
        return cleanTag ? `#${cleanTag}` : null;
      })
      .filter(tag => tag)
      .slice(0, limit);
  }

  generateDefaultHashtags(platform) {
    const defaults = {
      twitter: ['#blog', '#content', '#insights'],
      linkedin: ['#ProfessionalDevelopment', '#Industry', '#Insights'],
      facebook: ['#blog', '#newpost', '#insights'],
      instagram: ['#blog', '#content', '#insights', '#tips', '#knowledge', '#learning', '#growth', '#inspiration', '#community', '#share']
    };
    
    return defaults[platform] || ['#content'];
  }

  extractHook(content) {
    if (!content) return '';
    
    // Extract first sentence or up to 50 characters
    const firstSentence = content.split(/[.!?]/)[0];
    return firstSentence.length > 50 ? 
      firstSentence.substring(0, 50) + '...' : 
      firstSentence;
  }

  checkLimits(content, platformConfig) {
    return content.length <= platformConfig.maxLength;
  }

  getDefaultModel(provider) {
    const defaults = {
      openai: 'gpt-4o',
      anthropic: 'claude-sonnet-4-20250514',
      google: 'gemini-2.5-flash',
      perplexity: 'sonar-pro'
    };
    return defaults[provider] || 'gpt-4o';
  }

  /**
   * Generate content for a specific platform style
   */
  async generatePlatformVariations(config) {
    const { 
      baseContent, 
      platform, 
      count = 3,
      style = 'engaging',
      provider = 'openai',
      model 
    } = config;

    const variations = [];
    
    for (let i = 0; i < count; i++) {
      const result = await this.transformToPlatform({
        blogContent: baseContent,
        title: `Content Variation ${i + 1}`,
        synopsis: 'Generated variation',
        platform,
        provider,
        model,
        customInstructions: `Create a ${style} variation with a unique approach`
      });
      
      if (result.success && result.posts.length > 0) {
        variations.push(result.posts[0]);
      }
    }
    
    return variations;
  }

  /**
   * Analyze social media performance potential
   */
  analyzeSocialPotential(posts) {
    const analysis = {};
    
    posts.forEach(post => {
      const score = this.calculateEngagementScore(post);
      analysis[post.platform] = {
        score,
        strengths: this.identifyStrengths(post),
        suggestions: this.generateSuggestions(post),
        hashtagAnalysis: this.analyzeHashtags(post.hashtags, post.platform)
      };
    });
    
    return analysis;
  }

  calculateEngagementScore(post) {
    let score = 50; // Base score
    
    // Hook quality
    if (post.hook && post.hook.length > 10) score += 15;
    
    // Call to action presence
    if (post.cta && post.cta.includes('?')) score += 10;
    
    // Hashtag usage
    if (post.hashtags && post.hashtags.length >= 3) score += 10;
    
    // Character count optimization
    const config = this.platformConfigs[post.platform];
    if (config.optimalLength) {
      const { min, max } = config.optimalLength;
      if (post.characterCount >= min && post.characterCount <= max) {
        score += 15;
      }
    }
    
    return Math.min(100, score);
  }

  identifyStrengths(post) {
    const strengths = [];
    
    if (post.hook) strengths.push('Strong opening hook');
    if (post.hashtags && post.hashtags.length > 0) strengths.push('Good hashtag usage');
    if (post.cta) strengths.push('Clear call-to-action');
    if (post.isWithinLimits) strengths.push('Within character limits');
    
    return strengths;
  }

  generateSuggestions(post) {
    const suggestions = [];
    
    if (!post.hook || post.hook.length < 10) {
      suggestions.push('Add a stronger opening hook');
    }
    
    if (!post.cta || !post.cta.includes('?')) {
      suggestions.push('Include an engaging question or call-to-action');
    }
    
    if (!post.hashtags || post.hashtags.length < 3) {
      suggestions.push('Use more relevant hashtags for better reach');
    }
    
    if (!post.isWithinLimits) {
      suggestions.push('Reduce content length to fit platform limits');
    }
    
    return suggestions;
  }

  analyzeHashtags(hashtags, platform) {
    const config = this.platformConfigs[platform];
    
    return {
      count: hashtags ? hashtags.length : 0,
      withinLimit: hashtags ? hashtags.length <= config.hashtagLimit : true,
      suggestions: hashtags && hashtags.length < config.hashtagLimit ? 
        ['Add more relevant hashtags'] : 
        ['Good hashtag usage']
    };
  }
}

export default SocialMediaService;