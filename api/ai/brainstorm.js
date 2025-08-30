/**
 * Brainstorming API Endpoint - Generate multiple blog ideas from a topic
 * Uses GPT-5 with high reasoning effort for creative ideation
 */

// Import the generation service to leverage existing provider infrastructure
let GenerationService;

try {
  const genModule = await import('../../src/services/ai/GenerationServiceReal.js');
  GenerationService = genModule.GenerationService;
} catch (error) {
  console.log('[Brainstorm API] Using stub generation service:', error.message);
  const stubs = await import('../../src/services/ai/StubServices.js');
  GenerationService = stubs.GenerationService;
}

const generationService = new GenerationService();

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
      action = 'generate-ideas',
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

    console.log('[Brainstorm API] Request received:', {
      action,
      topic,
      count,
      vertical,
      tone,
      provider,
      model
    });

    // Validate required fields
    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required and cannot be empty'
      });
    }

    if (count < 1 || count > 50) {
      return res.status(400).json({
        success: false,
        error: 'Count must be between 1 and 50'
      });
    }

    // Handle different actions
    switch (action) {
      case 'generate-ideas':
        return await handleGenerateIdeas(req, res, {
          topic,
          count,
          vertical,
          tone,
          contentTypes,
          customPrompt,
          provider,
          model,
          customContext
        });
      
      default:
        return res.status(400).json({
          success: false,
          error: `Unknown action: ${action}`
        });
    }

  } catch (error) {
    console.error('[Brainstorm API] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Generate blog ideas using AI
 */
async function handleGenerateIdeas(req, res, params) {
  const {
    topic,
    count,
    vertical,
    tone,
    contentTypes,
    customPrompt,
    provider,
    model,
    customContext
  } = params;

  try {
    const startTime = Date.now();

    // Build the brainstorming prompt
    const prompt = customPrompt || buildBrainstormingPrompt({
      topic,
      count,
      vertical,
      tone,
      contentTypes,
      customContext
    });

    console.log('[Brainstorm API] Using prompt length:', prompt.length);

    // Generate ideas using the existing generation service
    const generationConfig = {
      mode: 'direct',
      task: 'brainstorming',
      prompt: prompt,
      provider: provider,
      model: model,
      vertical: vertical,
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
        additionalContext: `Brainstorming session for topic: ${topic}`
      }
    };

    const result = await generationService.generateContent(generationConfig);
    
    if (!result.success) {
      console.error('[Brainstorm API] Generation failed:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate ideas',
        fallback: true
      });
    }

    const endTime = Date.now();
    const durationMs = endTime - startTime;

    // Parse the generated content into structured ideas
    const ideas = parseGeneratedIdeas(result.generation, topic, count);

    console.log('[Brainstorm API] Generated ideas count:', ideas.length);

    return res.json({
      success: true,
      ideas: ideas,
      tokensUsed: result.tokensUsed || 0,
      cost: result.cost || 0,
      durationMs: durationMs,
      metadata: {
        topic,
        count: ideas.length,
        requestedCount: count,
        vertical,
        tone,
        contentTypes,
        provider,
        model,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Brainstorm API] Error in handleGenerateIdeas:', error);
    
    // Provide fallback ideas if generation completely fails
    const fallbackIdeas = generateFallbackIdeas(topic, count);
    
    return res.status(200).json({
      success: true,
      ideas: fallbackIdeas,
      tokensUsed: 0,
      cost: 0,
      durationMs: 0,
      fallback: true,
      error: `Generation failed, provided fallback ideas: ${error.message}`,
      metadata: {
        topic,
        count: fallbackIdeas.length,
        requestedCount: count,
        vertical,
        tone,
        fallback: true,
        generatedAt: new Date().toISOString()
      }
    });
  }
}

/**
 * Build the brainstorming prompt based on parameters
 */
function buildBrainstormingPrompt({ topic, count, vertical, tone, contentTypes, customContext }) {
  const verticalContext = vertical !== 'all' ? 
    `Focus specifically on the ${vertical} industry/vertical.` : 
    'Consider multiple industries and verticals where relevant.';
  
  const contentTypeContext = contentTypes.length > 0 ?
    `Prioritize these content types: ${contentTypes.join(', ')}.` :
    'Include a variety of content types (how-to guides, listicles, tutorials, comparisons, case studies, etc.).';

  const toneContext = `Maintain a ${tone} tone throughout.`;
  
  const customSection = customContext ? 
    `\nAdditional Context: ${customContext}` : '';

  return `
You are an expert content strategist and creative ideation specialist. Generate exactly ${count} unique, compelling blog post ideas about the topic: "${topic}".

Requirements:
- ${verticalContext}
- ${contentTypeContext}  
- ${toneContext}
- Each idea must be unique and offer a distinct angle or perspective
- Ideas should be specific enough to create actionable content
- Include SEO potential and audience appeal considerations
- Ensure ideas are practical and feasible to write

${customSection}

For each idea, provide:
1. Title: A compelling, specific headline (50-70 characters ideal for SEO)
2. Angle: The unique perspective or approach (1-2 sentences)
3. Description: Brief overview of what the content would cover (2-3 sentences)
4. Tags: 3-5 relevant tags for categorization
5. Difficulty: Content creation difficulty (Beginner/Intermediate/Advanced)
6. Estimated Word Count: Suggested length for the full article

Format your response as a JSON array where each idea is an object with the above properties. Ensure valid JSON syntax.

Example structure:
[
  {
    "title": "5 Proven Strategies That Transform Customer Service",
    "angle": "Focus on actionable, data-backed strategies with real examples",
    "description": "Explore five evidence-based approaches to customer service excellence, including communication techniques, technology integration, and staff training methodologies that demonstrably improve satisfaction scores.",
    "tags": ["customer-service", "strategy", "improvement", "business", "guide"],
    "difficulty": "Intermediate",
    "estimatedWordCount": 1500
  }
]

IMPORTANT: Return ONLY the JSON array, no additional text or formatting. Generate exactly ${count} unique ideas for "${topic}".
  `.trim();
}

/**
 * Parse and format the AI-generated ideas
 */
function parseGeneratedIdeas(rawContent, topic, requestedCount) {
  try {
    let ideas = [];
    
    if (typeof rawContent === 'string') {
      // Clean the content and look for JSON
      const cleanContent = rawContent.trim();
      
      // Look for JSON array pattern
      const jsonMatch = cleanContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          ideas = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.log('[Brainstorm API] JSON parse failed, trying structured text parsing');
          ideas = parseStructuredText(cleanContent, topic);
        }
      } else {
        ideas = parseStructuredText(cleanContent, topic);
      }
    } else if (Array.isArray(rawContent)) {
      ideas = rawContent;
    } else {
      throw new Error('Invalid content format');
    }

    // Ensure we have an array
    if (!Array.isArray(ideas)) {
      ideas = [ideas];
    }

    // Format and validate each idea
    const formattedIdeas = ideas.map((idea, index) => {
      const id = `idea_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`;
      
      return {
        id,
        title: (idea.title || `${topic} - Idea ${index + 1}`).substring(0, 100),
        angle: (idea.angle || 'Unique perspective on the topic').substring(0, 200),
        description: (idea.description || 'A comprehensive exploration of the topic').substring(0, 500),
        tags: Array.isArray(idea.tags) ? idea.tags.slice(0, 5) : ['general', 'content'],
        difficulty: ['Beginner', 'Intermediate', 'Advanced'].includes(idea.difficulty) ? idea.difficulty : 'Intermediate',
        estimatedWordCount: typeof idea.estimatedWordCount === 'number' && idea.estimatedWordCount > 0 ? 
          Math.min(5000, Math.max(500, idea.estimatedWordCount)) : 1200,
        isFavorited: false,
        createdAt: new Date().toISOString(),
        score: calculateIdeaScore(idea),
        metadata: {
          generatedFromTopic: topic,
          generationIndex: index
        }
      };
    }).filter(idea => idea.title && idea.title.length > 0);

    // Ensure we have at least some ideas, pad if necessary
    while (formattedIdeas.length < Math.min(requestedCount, 3)) {
      const fallbackIdea = generateSingleFallbackIdea(topic, formattedIdeas.length);
      formattedIdeas.push(fallbackIdea);
    }

    return formattedIdeas.slice(0, requestedCount);

  } catch (error) {
    console.error('[Brainstorm API] Error parsing ideas:', error);
    return generateFallbackIdeas(topic, requestedCount);
  }
}

/**
 * Parse structured text format as fallback
 */
function parseStructuredText(content, topic) {
  const ideas = [];
  
  // Try to find numbered items or clear sections
  const patterns = [
    /(\d+[\.\)]\s*)(.*?)(?=\d+[\.\)]|$)/gs,
    /(Title:|Headline:)\s*(.*?)(?=(Title:|Headline:)|$)/gs,
    /^(.+)$/gm
  ];

  for (const pattern of patterns) {
    const matches = [...content.matchAll(pattern)];
    
    if (matches.length > 1) {
      matches.forEach((match, index) => {
        const title = (match[2] || match[1] || match[0])
          .replace(/^(Title:|Headline:|Idea:|Blog:)\s*/i, '')
          .trim()
          .split('\n')[0]
          .substring(0, 80);
        
        if (title && title.length > 5) {
          ideas.push({
            title: title,
            angle: `Creative approach to ${topic}`,
            description: `A comprehensive blog post exploring ${title.toLowerCase()}. This content would provide valuable insights and practical information for readers interested in ${topic}.`,
            tags: [topic.toLowerCase().replace(/\s+/g, '-'), 'content', 'guide'],
            difficulty: 'Intermediate',
            estimatedWordCount: 1200 + (index * 200)
          });
        }
      });
      
      if (ideas.length > 0) break;
    }
  }

  return ideas.length > 0 ? ideas : generateFallbackIdeas(topic, 3);
}

/**
 * Generate fallback ideas when AI generation fails
 */
function generateFallbackIdeas(topic, count) {
  const fallbackTemplates = [
    {
      title: `Complete Guide to ${topic}`,
      angle: 'Comprehensive overview covering all essential aspects',
      tags: ['guide', 'comprehensive', 'basics']
    },
    {
      title: `Top 10 ${topic} Tips for Beginners`,
      angle: 'Beginner-friendly approach with practical, actionable advice',
      tags: ['tips', 'beginners', 'practical']
    },
    {
      title: `${topic}: Common Mistakes and How to Avoid Them`,
      angle: 'Problem-solving approach focusing on pitfalls and solutions',
      tags: ['mistakes', 'solutions', 'troubleshooting']
    },
    {
      title: `The Future of ${topic}: Trends and Predictions`,
      angle: 'Forward-looking analysis of industry developments',
      tags: ['trends', 'future', 'predictions']
    },
    {
      title: `${topic} Case Studies: Real Success Stories`,
      angle: 'Evidence-based approach using real-world examples',
      tags: ['case-studies', 'success', 'examples']
    }
  ];

  const ideas = [];
  
  for (let i = 0; i < Math.min(count, fallbackTemplates.length); i++) {
    const template = fallbackTemplates[i];
    const id = `fallback_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 6)}`;
    
    ideas.push({
      id,
      title: template.title,
      angle: template.angle,
      description: `An in-depth exploration of ${topic}. This post would provide valuable insights, practical advice, and actionable information for readers looking to understand or improve their knowledge of ${topic}.`,
      tags: template.tags,
      difficulty: 'Intermediate',
      estimatedWordCount: 1200 + (i * 300),
      isFavorited: false,
      createdAt: new Date().toISOString(),
      score: 70,
      metadata: {
        generatedFromTopic: topic,
        generationIndex: i,
        fallback: true
      }
    });
  }

  // Fill remaining slots if needed
  while (ideas.length < count) {
    const extraIdea = generateSingleFallbackIdea(topic, ideas.length);
    ideas.push(extraIdea);
  }

  return ideas;
}

/**
 * Generate a single fallback idea
 */
function generateSingleFallbackIdea(topic, index) {
  const approaches = [
    'How to Master',
    'The Ultimate Guide to',
    'Best Practices for',
    '5 Ways to Improve Your',
    'Understanding',
    'Advanced Techniques in',
    'The Business of',
    'Troubleshooting'
  ];
  
  const approach = approaches[index % approaches.length];
  const id = `fallback_single_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`;
  
  return {
    id,
    title: `${approach} ${topic}`,
    angle: `${approach.toLowerCase()} approach with practical insights`,
    description: `A detailed exploration of ${topic} using a ${approach.toLowerCase()} methodology. This content would provide readers with actionable information and valuable insights.`,
    tags: [topic.toLowerCase().replace(/\s+/g, '-'), 'guide', 'practical'],
    difficulty: 'Intermediate',
    estimatedWordCount: 1000 + (index * 200),
    isFavorited: false,
    createdAt: new Date().toISOString(),
    score: 65,
    metadata: {
      generatedFromTopic: topic,
      generationIndex: index,
      fallback: true
    }
  };
}

/**
 * Calculate a quality score for an idea
 */
function calculateIdeaScore(idea) {
  let score = 50; // Base score
  
  // Title length optimization
  if (idea.title && idea.title.length >= 30 && idea.title.length <= 70) {
    score += 15;
  }
  
  // Description quality
  if (idea.description && idea.description.length >= 50) {
    score += 10;
  }
  
  // Tag relevance
  if (idea.tags && idea.tags.length >= 3) {
    score += 10;
  }
  
  // Word count appropriateness
  if (idea.estimatedWordCount >= 800 && idea.estimatedWordCount <= 2500) {
    score += 10;
  }
  
  // Angle specificity
  if (idea.angle && idea.angle.length >= 20) {
    score += 5;
  }
  
  return Math.min(100, score);
}