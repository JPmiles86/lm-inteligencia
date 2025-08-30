/**
 * Title Generation API Endpoint - Generate SEO-optimized blog post titles
 * Features: Multiple templates, SEO scoring, A/B testing, keyword optimization
 */

// Import the generation service to leverage existing provider infrastructure
let GenerationService;

try {
  const genModule = await import('../../src/services/ai/GenerationServiceReal.js');
  GenerationService = genModule.GenerationService;
} catch (error) {
  console.log('[Title Generation API] Using stub generation service:', error.message);
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
      action = 'generate-titles',
      topic,
      context = '',
      count = 8,
      templates = ['how-to', 'listicle', 'question'],
      keywords = [],
      seoTarget = 'balanced',
      abTestMode = false,
      template, // For regenerate-single action
      provider = 'openai',
      model = 'gpt-4o'
    } = req.body;

    console.log('[Title Generation API] Request received:', {
      action,
      topic,
      count,
      templates,
      seoTarget,
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

    if (count < 1 || count > 20) {
      return res.status(400).json({
        success: false,
        error: 'Count must be between 1 and 20'
      });
    }

    // Handle different actions
    switch (action) {
      case 'generate-titles':
        return await handleGenerateTitles(req, res, {
          topic,
          context,
          count,
          templates,
          keywords,
          seoTarget,
          abTestMode,
          provider,
          model
        });
      
      case 'regenerate-single':
        return await handleRegenerateSingle(req, res, {
          topic,
          context,
          template: template || templates[0],
          keywords,
          seoTarget,
          provider,
          model
        });
      
      default:
        return res.status(400).json({
          success: false,
          error: `Unknown action: ${action}`
        });
    }

  } catch (error) {
    console.error('[Title Generation API] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Generate multiple title variations
 */
async function handleGenerateTitles(req, res, params) {
  const {
    topic,
    context,
    count,
    templates,
    keywords,
    seoTarget,
    abTestMode,
    provider,
    model
  } = params;

  try {
    const startTime = Date.now();

    // Build the title generation prompt
    const prompt = buildTitleGenerationPrompt({
      topic,
      context,
      count,
      templates,
      keywords,
      seoTarget,
      abTestMode
    });

    console.log('[Title Generation API] Using prompt length:', prompt.length);

    // Generate titles using the existing generation service
    const generationConfig = {
      mode: 'direct',
      task: 'title-generation',
      prompt: prompt,
      provider: provider,
      model: model,
      temperature: 0.8, // Higher temperature for creativity
      maxTokens: 2000,
      vertical: 'all',
      context: {
        styleGuides: { brand: false },
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
        additionalContext: `Title generation for topic: ${topic}`
      }
    };

    const result = await generationService.generateContent(generationConfig);
    
    if (!result.success) {
      console.error('[Title Generation API] Generation failed:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate titles',
        fallback: true
      });
    }

    const endTime = Date.now();
    const durationMs = endTime - startTime;

    // Parse the generated content into structured titles
    const titles = parseGeneratedTitles(result.generation, topic, templates, keywords, count);

    console.log('[Title Generation API] Generated titles count:', titles.length);

    return res.json({
      success: true,
      titles: titles,
      tokensUsed: result.tokensUsed || 0,
      cost: result.cost || 0,
      durationMs: durationMs,
      metadata: {
        topic,
        count: titles.length,
        requestedCount: count,
        templates,
        keywords,
        seoTarget,
        abTestMode,
        provider,
        model,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Title Generation API] Error in handleGenerateTitles:', error);
    
    // Provide fallback titles if generation completely fails
    const fallbackTitles = generateFallbackTitles(topic, templates, count);
    
    return res.status(200).json({
      success: true,
      titles: fallbackTitles,
      tokensUsed: 0,
      cost: 0,
      durationMs: 0,
      fallback: true,
      error: `Generation failed, provided fallback titles: ${error.message}`,
      metadata: {
        topic,
        count: fallbackTitles.length,
        requestedCount: count,
        templates,
        fallback: true,
        generatedAt: new Date().toISOString()
      }
    });
  }
}

/**
 * Regenerate a single title with specific template
 */
async function handleRegenerateSingle(req, res, params) {
  const {
    topic,
    context,
    template,
    keywords,
    seoTarget,
    provider,
    model
  } = params;

  try {
    const startTime = Date.now();

    // Build prompt for single title generation
    const prompt = buildSingleTitlePrompt({
      topic,
      context,
      template,
      keywords,
      seoTarget
    });

    const generationConfig = {
      mode: 'direct',
      task: 'title-generation',
      prompt: prompt,
      provider: provider,
      model: model,
      temperature: 0.9, // Higher temperature for variation
      maxTokens: 500,
      vertical: 'all',
      context: {
        styleGuides: { brand: false },
        previousContent: { mode: 'none', includeElements: {} },
        additionalContext: `Single title regeneration for: ${topic}`
      }
    };

    const result = await generationService.generateContent(generationConfig);
    
    if (!result.success) {
      console.error('[Title Generation API] Single regeneration failed:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to regenerate title'
      });
    }

    const endTime = Date.now();
    const durationMs = endTime - startTime;

    // Parse single title
    const title = parseSingleGeneratedTitle(result.generation, topic, template, keywords);

    return res.json({
      success: true,
      title: title,
      tokensUsed: result.tokensUsed || 0,
      cost: result.cost || 0,
      durationMs: durationMs
    });

  } catch (error) {
    console.error('[Title Generation API] Error in handleRegenerateSingle:', error);
    
    // Provide fallback single title
    const fallbackTitle = generateSingleFallbackTitle(topic, template, keywords);
    
    return res.status(200).json({
      success: true,
      title: fallbackTitle,
      tokensUsed: 0,
      cost: 0,
      durationMs: 0,
      fallback: true,
      error: `Regeneration failed, provided fallback: ${error.message}`
    });
  }
}

/**
 * Build the main title generation prompt
 */
function buildTitleGenerationPrompt({ topic, context, count, templates, keywords, seoTarget, abTestMode }) {
  const templateContext = templates.length > 0 ? 
    `Focus on these title templates: ${templates.join(', ')}.` : 
    'Use a variety of title templates (how-to, listicle, question, comparison, etc.).';

  const keywordContext = keywords.length > 0 ?
    `Incorporate these keywords naturally: ${keywords.join(', ')}.` :
    'Focus on SEO-friendly keywords related to the topic.';

  const seoContext = {
    'organic': 'Optimize for search engines with keyword placement and readability.',
    'social': 'Optimize for social media sharing with emotional hooks and curiosity.',
    'balanced': 'Balance SEO optimization with social media appeal.'
  }[seoTarget];

  const abTestContext = abTestMode ? 
    'Generate titles suitable for A/B testing with different approaches and hooks.' : '';

  const contextSection = context ? 
    `\nAdditional Context: ${context}` : '';

  return `
You are an expert copywriter and SEO specialist. Generate exactly ${count} compelling, SEO-optimized blog post titles about the topic: "${topic}".

Requirements:
- ${templateContext}
- ${keywordContext}
- ${seoContext}
- Each title must be unique with a distinct angle or approach
- Optimize title length for SEO (50-60 characters ideal, 30-70 acceptable)
- Use power words and emotional triggers
- Include numbers when appropriate (listicles, year references)
- Make titles actionable and benefit-focused
- Ensure titles are clickable and shareable

${abTestContext}

${contextSection}

For each title, provide:
1. title: The complete title text (optimized length)
2. template: The template type used (how-to, listicle, question, comparison, ultimate, beginner, advanced, trends, mistakes, case-study)
3. hook: The primary hook type (question, how-to, listicle, urgency, benefit, curiosity)
4. keywords: Array of 2-4 relevant keywords naturally included
5. seoScore: Estimated SEO score (0-100) based on length, keywords, and optimization
6. characterCount: Exact character count of the title

Format your response as a JSON array where each title is an object with the above properties. Ensure valid JSON syntax.

Example structure:
[
  {
    "title": "How to Master Digital Marketing in 2025: 5 Proven Strategies",
    "template": "how-to",
    "hook": "how-to",
    "keywords": ["digital marketing", "2025", "strategies"],
    "seoScore": 85,
    "characterCount": 58
  }
]

IMPORTANT: Return ONLY the JSON array, no additional text or formatting. Generate exactly ${count} unique, high-quality titles for "${topic}".
  `.trim();
}

/**
 * Build prompt for single title regeneration
 */
function buildSingleTitlePrompt({ topic, context, template, keywords, seoTarget }) {
  const keywordContext = keywords.length > 0 ?
    `Incorporate these keywords: ${keywords.join(', ')}.` :
    'Use SEO-friendly keywords.';

  const templateExamples = {
    'how-to': 'How to [Action] [Topic]: [Benefit/Number]',
    'listicle': '[Number] [Topic] [Tips/Ways/Secrets] for [Benefit]',
    'question': 'What is [Topic]? [Complete/Ultimate] Guide',
    'comparison': '[Topic A] vs [Topic B]: Which is Better?',
    'ultimate': 'The Ultimate Guide to [Topic] in [Year]',
    'beginner': '[Topic] for Beginners: [Complete/Easy] Guide',
    'advanced': 'Advanced [Topic] Techniques for [Professionals/Experts]',
    'trends': '[Topic] Trends to Watch in [Year]',
    'mistakes': '[Number] [Topic] Mistakes That Are Killing Your [Results]',
    'case-study': 'How [We/Company] Increased [Topic] by [Percentage]'
  };

  const templateExample = templateExamples[template] || 'Creative approach to the topic';
  
  const contextSection = context ? 
    `\nAdditional Context: ${context}` : '';

  return `
Generate ONE compelling blog post title about "${topic}" using the "${template}" template.

Template pattern: ${templateExample}
Requirements:
- ${keywordContext}
- Optimize for ${seoTarget === 'organic' ? 'search engines' : seoTarget === 'social' ? 'social media' : 'balanced SEO and social'}
- Length: 50-60 characters ideal (30-70 acceptable)
- Use power words and emotional triggers
- Make it clickable and actionable

${contextSection}

Provide the result as JSON with:
{
  "title": "the complete title",
  "template": "${template}",
  "hook": "primary hook type",
  "keywords": ["keyword1", "keyword2"],
  "seoScore": 85,
  "characterCount": 58
}

Return ONLY the JSON object, no additional text.
  `.trim();
}

/**
 * Parse and format the AI-generated titles
 */
function parseGeneratedTitles(rawContent, topic, templates, keywords, requestedCount) {
  try {
    let titles = [];
    
    if (typeof rawContent === 'string') {
      // Clean the content and look for JSON
      const cleanContent = rawContent.trim();
      
      // Look for JSON array pattern
      const jsonMatch = cleanContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          titles = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.log('[Title Generation API] JSON parse failed, trying text parsing');
          titles = parseStructuredTitleText(cleanContent, topic, templates);
        }
      } else {
        titles = parseStructuredTitleText(cleanContent, topic, templates);
      }
    } else if (Array.isArray(rawContent)) {
      titles = rawContent;
    } else {
      throw new Error('Invalid content format');
    }

    // Ensure we have an array
    if (!Array.isArray(titles)) {
      titles = [titles];
    }

    // Format and validate each title
    const formattedTitles = titles.map((title, index) => {
      const titleText = title.title || `${topic} - Title ${index + 1}`;
      const characterCount = titleText.length;
      
      return {
        title: titleText.substring(0, 100), // Limit length
        template: templates.includes(title.template) ? title.template : templates[index % templates.length] || 'general',
        hook: ['question', 'how-to', 'listicle', 'urgency', 'benefit', 'curiosity'].includes(title.hook) ? 
          title.hook : 'benefit',
        keywords: Array.isArray(title.keywords) ? title.keywords.slice(0, 5) : extractKeywords(titleText, keywords),
        seoScore: typeof title.seoScore === 'number' ? 
          Math.min(100, Math.max(0, title.seoScore)) : 
          calculateSEOScore(titleText, keywords),
        characterCount: characterCount
      };
    }).filter(title => title.title && title.title.length > 0);

    // Ensure we have at least some titles, pad if necessary
    while (formattedTitles.length < Math.min(requestedCount, 3)) {
      const fallbackTitle = generateSingleFallbackTitle(topic, templates[formattedTitles.length % templates.length] || 'general', keywords);
      formattedTitles.push({
        ...fallbackTitle,
        seoScore: fallbackTitle.seoScore || 70
      });
    }

    return formattedTitles.slice(0, requestedCount);

  } catch (error) {
    console.error('[Title Generation API] Error parsing titles:', error);
    return generateFallbackTitles(topic, templates, requestedCount);
  }
}

/**
 * Parse single generated title
 */
function parseSingleGeneratedTitle(rawContent, topic, template, keywords) {
  try {
    let title;
    
    if (typeof rawContent === 'string') {
      const cleanContent = rawContent.trim();
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        title = JSON.parse(jsonMatch[0]);
      } else {
        // Extract title from plain text
        const lines = cleanContent.split('\n').filter(line => line.trim());
        const titleText = lines[0] || `${topic} Guide`;
        title = {
          title: titleText,
          template: template,
          hook: 'benefit',
          keywords: extractKeywords(titleText, keywords),
          seoScore: calculateSEOScore(titleText, keywords),
          characterCount: titleText.length
        };
      }
    } else {
      title = rawContent;
    }

    return {
      title: (title.title || `${topic} Guide`).substring(0, 100),
      template: title.template || template,
      hook: title.hook || 'benefit',
      keywords: Array.isArray(title.keywords) ? title.keywords.slice(0, 5) : extractKeywords(title.title || '', keywords),
      seoScore: typeof title.seoScore === 'number' ? Math.min(100, Math.max(0, title.seoScore)) : calculateSEOScore(title.title || '', keywords),
      characterCount: (title.title || '').length
    };

  } catch (error) {
    console.error('[Title Generation API] Error parsing single title:', error);
    return generateSingleFallbackTitle(topic, template, keywords);
  }
}

/**
 * Parse structured text format as fallback
 */
function parseStructuredTitleText(content, topic, templates) {
  const titles = [];
  
  // Try to find titles in various formats
  const patterns = [
    /(?:^|\n)(?:\d+[\.\)]\s*)?(.+?)(?=\n|$)/g,
    /Title:\s*(.+?)(?=\n|$)/gi,
    /^(.+)$/gm
  ];

  for (const pattern of patterns) {
    const matches = [...content.matchAll(pattern)];
    
    if (matches.length > 1) {
      matches.forEach((match, index) => {
        const titleText = match[1]
          .replace(/^(Title:|Headline:|Blog:)\s*/i, '')
          .trim()
          .split('\n')[0]
          .substring(0, 100);
        
        if (titleText && titleText.length > 10) {
          titles.push({
            title: titleText,
            template: templates[index % templates.length] || 'general',
            hook: 'benefit',
            keywords: extractKeywords(titleText, []),
            seoScore: calculateSEOScore(titleText, []),
            characterCount: titleText.length
          });
        }
      });
      
      if (titles.length > 0) break;
    }
  }

  return titles.length > 0 ? titles : generateFallbackTitles(topic, templates, 3);
}

/**
 * Generate fallback titles when AI generation fails
 */
function generateFallbackTitles(topic, templates, count) {
  const fallbackTemplates = [
    {
      title: `Complete Guide to ${topic}`,
      template: 'ultimate',
      hook: 'benefit'
    },
    {
      title: `How to Master ${topic} in 2025`,
      template: 'how-to',
      hook: 'how-to'
    },
    {
      title: `10 Essential ${topic} Tips`,
      template: 'listicle',
      hook: 'listicle'
    },
    {
      title: `What is ${topic}? Complete Guide`,
      template: 'question',
      hook: 'question'
    },
    {
      title: `${topic}: Common Mistakes to Avoid`,
      template: 'mistakes',
      hook: 'urgency'
    },
    {
      title: `${topic} for Beginners: Start Here`,
      template: 'beginner',
      hook: 'benefit'
    },
    {
      title: `Advanced ${topic} Techniques`,
      template: 'advanced',
      hook: 'benefit'
    },
    {
      title: `${topic} Trends for 2025`,
      template: 'trends',
      hook: 'curiosity'
    }
  ];

  const titles = [];
  
  for (let i = 0; i < Math.min(count, fallbackTemplates.length); i++) {
    const template = fallbackTemplates[i];
    const titleText = template.title;
    
    titles.push({
      title: titleText,
      template: template.template,
      hook: template.hook,
      keywords: extractKeywords(titleText, []),
      seoScore: calculateSEOScore(titleText, []),
      characterCount: titleText.length
    });
  }

  // Fill remaining slots if needed
  while (titles.length < count) {
    const extraTemplate = fallbackTemplates[titles.length % fallbackTemplates.length];
    const titleText = `${extraTemplate.title} - ${titles.length + 1}`;
    
    titles.push({
      title: titleText,
      template: extraTemplate.template,
      hook: extraTemplate.hook,
      keywords: extractKeywords(titleText, []),
      seoScore: calculateSEOScore(titleText, []),
      characterCount: titleText.length
    });
  }

  return titles;
}

/**
 * Generate a single fallback title
 */
function generateSingleFallbackTitle(topic, template, keywords) {
  const templates = {
    'how-to': `How to Master ${topic}`,
    'listicle': `10 ${topic} Tips You Need to Know`,
    'question': `What is ${topic}? Complete Guide`,
    'comparison': `${topic} vs Alternatives: Which is Best?`,
    'ultimate': `The Ultimate ${topic} Guide`,
    'beginner': `${topic} for Beginners`,
    'advanced': `Advanced ${topic} Strategies`,
    'trends': `${topic} Trends for 2025`,
    'mistakes': `${topic} Mistakes to Avoid`,
    'case-study': `How We Improved Our ${topic} Results`
  };
  
  const titleText = templates[template] || `Complete Guide to ${topic}`;
  
  return {
    title: titleText,
    template: template,
    hook: template === 'question' ? 'question' : template === 'how-to' ? 'how-to' : template === 'listicle' ? 'listicle' : 'benefit',
    keywords: keywords.length > 0 ? keywords.slice(0, 3) : extractKeywords(titleText, []),
    seoScore: calculateSEOScore(titleText, keywords),
    characterCount: titleText.length
  };
}

/**
 * Extract keywords from title text
 */
function extractKeywords(text, existingKeywords) {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'from', 'they', 'have', 'will', 'been', 'were', 'said', 'each', 'what', 'when', 'where', 'their', 'there', 'these', 'those'].includes(word));

  const keywords = [...existingKeywords];
  
  words.forEach(word => {
    if (keywords.length < 5 && !keywords.includes(word)) {
      keywords.push(word);
    }
  });

  return keywords.slice(0, 5);
}

/**
 * Calculate SEO score for a title
 */
function calculateSEOScore(title, keywords) {
  let score = 50; // Base score
  
  // Length optimization (50-60 chars ideal)
  if (title.length >= 50 && title.length <= 60) {
    score += 20;
  } else if (title.length >= 40 && title.length <= 70) {
    score += 10;
  } else if (title.length < 30 || title.length > 80) {
    score -= 15;
  }
  
  // Keyword presence
  const lowerTitle = title.toLowerCase();
  keywords.forEach(keyword => {
    if (lowerTitle.includes(keyword.toLowerCase())) {
      score += 12;
    }
  });
  
  // Power words
  const powerWords = ['ultimate', 'complete', 'essential', 'proven', 'secret', 'amazing', 'incredible', 'best', 'top', 'perfect', 'exclusive', 'guaranteed'];
  powerWords.forEach(word => {
    if (lowerTitle.includes(word)) {
      score += 5;
    }
  });
  
  // Numbers (listicles perform well)
  if (/\d+/.test(title)) {
    score += 8;
  }
  
  // Year references
  if (/202[4-9]/.test(title)) {
    score += 6;
  }
  
  // Action words
  const actionWords = ['how', 'guide', 'tips', 'ways', 'steps', 'strategies'];
  actionWords.forEach(word => {
    if (lowerTitle.includes(word)) {
      score += 4;
    }
  });
  
  return Math.min(100, Math.max(0, score));
}