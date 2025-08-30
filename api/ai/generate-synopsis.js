/**
 * Synopsis Generation API Endpoint - Generate engaging blog post synopses
 * Features: Multiple variations, length control, tone adjustment, hook emphasis
 */

// Import the generation service to leverage existing provider infrastructure
let GenerationService;

try {
  const genModule = await import('../../src/services/ai/GenerationServiceReal.js');
  GenerationService = genModule.GenerationService;
} catch (error) {
  console.log('[Synopsis Generation API] Using stub generation service:', error.message);
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
      action = 'generate-synopses',
      topic = '',
      title = '',
      context = '',
      targetAudience = '',
      count = 3,
      lengthTarget = 'medium',
      tones = ['professional', 'friendly'],
      hooks = ['benefit', 'curiosity'],
      includeKeywords = true,
      optimizeForSocial = false,
      tone, // For regenerate-single action
      hook, // For regenerate-single action
      provider = 'openai',
      model = 'gpt-4o'
    } = req.body;

    console.log('[Synopsis Generation API] Request received:', {
      action,
      topic,
      title,
      count,
      lengthTarget,
      tones,
      hooks,
      provider,
      model
    });

    // Validate required fields
    if ((!topic || topic.trim().length === 0) && (!title || title.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'Either topic or title is required and cannot be empty'
      });
    }

    if (count < 1 || count > 10) {
      return res.status(400).json({
        success: false,
        error: 'Count must be between 1 and 10'
      });
    }

    // Handle different actions
    switch (action) {
      case 'generate-synopses':
        return await handleGenerateSynopses(req, res, {
          topic,
          title,
          context,
          targetAudience,
          count,
          lengthTarget,
          tones,
          hooks,
          includeKeywords,
          optimizeForSocial,
          provider,
          model
        });
      
      case 'regenerate-single':
        return await handleRegenerateSingle(req, res, {
          topic,
          title,
          context,
          lengthTarget,
          tone: tone || tones[0],
          hook: hook || hooks[0],
          includeKeywords,
          optimizeForSocial,
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
    console.error('[Synopsis Generation API] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Generate multiple synopsis variations
 */
async function handleGenerateSynopses(req, res, params) {
  const {
    topic,
    title,
    context,
    targetAudience,
    count,
    lengthTarget,
    tones,
    hooks,
    includeKeywords,
    optimizeForSocial,
    provider,
    model
  } = params;

  try {
    const startTime = Date.now();

    // Build the synopsis generation prompt
    const prompt = buildSynopsisGenerationPrompt({
      topic,
      title,
      context,
      targetAudience,
      count,
      lengthTarget,
      tones,
      hooks,
      includeKeywords,
      optimizeForSocial
    });

    console.log('[Synopsis Generation API] Using prompt length:', prompt.length);

    // Generate synopses using the existing generation service
    const generationConfig = {
      mode: 'direct',
      task: 'synopsis-generation',
      prompt: prompt,
      provider: provider,
      model: model,
      temperature: 0.7, // Balanced creativity and consistency
      maxTokens: 1500,
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
        additionalContext: `Synopsis generation for: ${title || topic}`
      }
    };

    const result = await generationService.generateContent(generationConfig);
    
    if (!result.success) {
      console.error('[Synopsis Generation API] Generation failed:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate synopses',
        fallback: true
      });
    }

    const endTime = Date.now();
    const durationMs = endTime - startTime;

    // Parse the generated content into structured synopses
    const synopses = parseGeneratedSynopses(result.generation, topic, title, lengthTarget, tones, hooks, count);

    console.log('[Synopsis Generation API] Generated synopses count:', synopses.length);

    return res.json({
      success: true,
      synopses: synopses,
      tokensUsed: result.tokensUsed || 0,
      cost: result.cost || 0,
      durationMs: durationMs,
      metadata: {
        topic,
        title,
        count: synopses.length,
        requestedCount: count,
        lengthTarget,
        tones,
        hooks,
        includeKeywords,
        optimizeForSocial,
        provider,
        model,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Synopsis Generation API] Error in handleGenerateSynopses:', error);
    
    // Provide fallback synopses if generation completely fails
    const fallbackSynopses = generateFallbackSynopses(topic, title, lengthTarget, tones, count);
    
    return res.status(200).json({
      success: true,
      synopses: fallbackSynopses,
      tokensUsed: 0,
      cost: 0,
      durationMs: 0,
      fallback: true,
      error: `Generation failed, provided fallback synopses: ${error.message}`,
      metadata: {
        topic,
        title,
        count: fallbackSynopses.length,
        requestedCount: count,
        lengthTarget,
        tones,
        fallback: true,
        generatedAt: new Date().toISOString()
      }
    });
  }
}

/**
 * Regenerate a single synopsis with specific parameters
 */
async function handleRegenerateSingle(req, res, params) {
  const {
    topic,
    title,
    context,
    lengthTarget,
    tone,
    hook,
    includeKeywords,
    optimizeForSocial,
    provider,
    model
  } = params;

  try {
    const startTime = Date.now();

    // Build prompt for single synopsis generation
    const prompt = buildSingleSynopsisPrompt({
      topic,
      title,
      context,
      lengthTarget,
      tone,
      hook,
      includeKeywords,
      optimizeForSocial
    });

    const generationConfig = {
      mode: 'direct',
      task: 'synopsis-generation',
      prompt: prompt,
      provider: provider,
      model: model,
      temperature: 0.8, // Higher temperature for variation
      maxTokens: 800,
      vertical: 'all',
      context: {
        styleGuides: { brand: false },
        previousContent: { mode: 'none', includeElements: {} },
        additionalContext: `Single synopsis regeneration for: ${title || topic}`
      }
    };

    const result = await generationService.generateContent(generationConfig);
    
    if (!result.success) {
      console.error('[Synopsis Generation API] Single regeneration failed:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to regenerate synopsis'
      });
    }

    const endTime = Date.now();
    const durationMs = endTime - startTime;

    // Parse single synopsis
    const synopsis = parseSingleGeneratedSynopsis(result.generation, topic, title, lengthTarget, tone, hook);

    return res.json({
      success: true,
      synopsis: synopsis,
      tokensUsed: result.tokensUsed || 0,
      cost: result.cost || 0,
      durationMs: durationMs
    });

  } catch (error) {
    console.error('[Synopsis Generation API] Error in handleRegenerateSingle:', error);
    
    // Provide fallback single synopsis
    const fallbackSynopsis = generateSingleFallbackSynopsis(topic, title, lengthTarget, tone, hook);
    
    return res.status(200).json({
      success: true,
      synopsis: fallbackSynopsis,
      tokensUsed: 0,
      cost: 0,
      durationMs: 0,
      fallback: true,
      error: `Regeneration failed, provided fallback: ${error.message}`
    });
  }
}

/**
 * Build the main synopsis generation prompt
 */
function buildSynopsisGenerationPrompt({ topic, title, context, targetAudience, count, lengthTarget, tones, hooks, includeKeywords, optimizeForSocial }) {
  const lengthRanges = {
    'short': '50-100 words',
    'medium': '100-150 words', 
    'long': '150-200 words'
  };

  const lengthContext = `Target length: ${lengthRanges[lengthTarget]}`;
  
  const toneContext = tones.length > 0 ? 
    `Use these tones across variations: ${tones.join(', ')}.` : 
    'Use a professional and engaging tone.';

  const hookContext = hooks.length > 0 ?
    `Focus on these hook types: ${hooks.join(', ')}.` :
    'Use compelling hooks to engage readers.';

  const keywordContext = includeKeywords ?
    'Include relevant keywords naturally for SEO.' :
    'Focus on readability over keyword optimization.';

  const socialContext = optimizeForSocial ?
    'Optimize for social media sharing with emotional appeal and curiosity.' :
    'Optimize for readability and information clarity.';

  const audienceContext = targetAudience ? 
    `Target audience: ${targetAudience}` : 
    'Target a general audience interested in the topic.';

  const contextSection = context ? 
    `\nAdditional Context: ${context}` : '';

  const contentSource = title ? 
    `blog post titled "${title}"` : 
    `the topic "${topic}"`;

  return `
You are an expert content writer and marketing copywriter. Generate exactly ${count} compelling, engaging synopsis/summary variations for a ${contentSource}.

Requirements:
- ${lengthContext}
- ${toneContext}
- ${hookContext}
- ${keywordContext}
- ${socialContext}
- ${audienceContext}
- Each synopsis must be unique with different approaches and emphasis
- Make synopses scannable and engaging
- Include clear value propositions
- Use active voice and action-oriented language
- Create curiosity while delivering value

Hook Types Explained:
- problem: Start by highlighting pain points or challenges
- benefit: Focus on outcomes and value delivered
- curiosity: Create intrigue and knowledge gaps
- statistic: Lead with compelling numbers or data
- story: Use narrative elements and scenarios
- question: Start with thought-provoking questions

Tone Guidelines:
- professional: Formal, authoritative, expert voice
- casual: Relaxed, conversational, approachable
- friendly: Warm, personal, welcoming
- authoritative: Confident, definitive, expert
- conversational: Natural, dialogue-like, relatable  
- urgent: Action-oriented, time-sensitive, immediate

${contextSection}

For each synopsis, provide:
1. synopsis: The complete synopsis text (within word limit)
2. wordCount: Exact word count
3. characterCount: Exact character count  
4. tone: Primary tone used (from the list above)
5. hook: Primary hook type used (from the list above)
6. readabilityScore: Estimated readability score (0-100)
7. engagementScore: Estimated engagement potential (0-100)
8. lengthTarget: The target length category ("${lengthTarget}")

Format your response as a JSON array where each synopsis is an object with the above properties. Ensure valid JSON syntax.

Example structure:
[
  {
    "synopsis": "Marketing automation can transform your business, but only if implemented correctly. This comprehensive guide reveals the proven strategies top companies use to increase conversions by 40% while reducing manual work. Discover the exact tools, workflows, and optimization techniques that deliver real ROI. Learn how to avoid common pitfalls and create automated systems that actually work for your specific business model.",
    "wordCount": 58,
    "characterCount": 342,
    "tone": "professional",
    "hook": "benefit",
    "readabilityScore": 85,
    "engagementScore": 78,
    "lengthTarget": "medium"
  }
]

IMPORTANT: Return ONLY the JSON array, no additional text or formatting. Generate exactly ${count} unique, high-quality synopses for ${contentSource}.
  `.trim();
}

/**
 * Build prompt for single synopsis regeneration
 */
function buildSingleSynopsisPrompt({ topic, title, context, lengthTarget, tone, hook, includeKeywords, optimizeForSocial }) {
  const lengthRanges = {
    'short': '50-100 words',
    'medium': '100-150 words',
    'long': '150-200 words'
  };

  const hookDescriptions = {
    'problem': 'Start by highlighting pain points or challenges readers face',
    'benefit': 'Focus on outcomes and value the content will deliver',
    'curiosity': 'Create intrigue and knowledge gaps that compel reading',
    'statistic': 'Lead with compelling numbers or data points',
    'story': 'Use narrative elements and relatable scenarios',
    'question': 'Start with thought-provoking questions'
  };

  const toneDescriptions = {
    'professional': 'Formal, authoritative, expert voice',
    'casual': 'Relaxed, conversational, approachable style',
    'friendly': 'Warm, personal, welcoming approach',
    'authoritative': 'Confident, definitive, expert positioning',
    'conversational': 'Natural, dialogue-like, relatable tone',
    'urgent': 'Action-oriented, time-sensitive, immediate'
  };

  const contextSection = context ? 
    `\nAdditional Context: ${context}` : '';

  const contentSource = title ? 
    `blog post titled "${title}"` : 
    `the topic "${topic}"`;

  return `
Generate ONE compelling synopsis for a ${contentSource}.

Requirements:
- Length: ${lengthRanges[lengthTarget]}
- Tone: ${tone} (${toneDescriptions[tone]})
- Hook: ${hook} (${hookDescriptions[hook]})
- ${includeKeywords ? 'Include relevant keywords naturally' : 'Focus on readability'}
- ${optimizeForSocial ? 'Optimize for social sharing' : 'Optimize for information clarity'}

${contextSection}

Provide the result as JSON with:
{
  "synopsis": "the complete synopsis text",
  "wordCount": 125,
  "characterCount": 750,
  "tone": "${tone}",
  "hook": "${hook}",
  "readabilityScore": 85,
  "engagementScore": 78,
  "lengthTarget": "${lengthTarget}"
}

Return ONLY the JSON object, no additional text.
  `.trim();
}

/**
 * Parse and format the AI-generated synopses
 */
function parseGeneratedSynopses(rawContent, topic, title, lengthTarget, tones, hooks, requestedCount) {
  try {
    let synopses = [];
    
    if (typeof rawContent === 'string') {
      // Clean the content and look for JSON
      const cleanContent = rawContent.trim();
      
      // Look for JSON array pattern
      const jsonMatch = cleanContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          synopses = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.log('[Synopsis Generation API] JSON parse failed, trying text parsing');
          synopses = parseStructuredSynopsisText(cleanContent, topic, title, lengthTarget, tones);
        }
      } else {
        synopses = parseStructuredSynopsisText(cleanContent, topic, title, lengthTarget, tones);
      }
    } else if (Array.isArray(rawContent)) {
      synopses = rawContent;
    } else {
      throw new Error('Invalid content format');
    }

    // Ensure we have an array
    if (!Array.isArray(synopses)) {
      synopses = [synopses];
    }

    // Format and validate each synopsis
    const formattedSynopses = synopses.map((synopsis, index) => {
      const synopsisText = synopsis.synopsis || `A comprehensive guide to ${title || topic} that covers essential concepts and practical applications.`;
      const words = synopsisText.split(/\s+/);
      const wordCount = words.length;
      const characterCount = synopsisText.length;
      
      return {
        synopsis: synopsisText,
        wordCount: wordCount,
        characterCount: characterCount,
        tone: tones.includes(synopsis.tone) ? synopsis.tone : tones[index % tones.length] || 'professional',
        hook: hooks.includes(synopsis.hook) ? synopsis.hook : hooks[index % hooks.length] || 'benefit',
        readabilityScore: typeof synopsis.readabilityScore === 'number' ? 
          Math.min(100, Math.max(0, synopsis.readabilityScore)) : 
          calculateReadabilityScore(synopsisText),
        engagementScore: typeof synopsis.engagementScore === 'number' ? 
          Math.min(100, Math.max(0, synopsis.engagementScore)) : 
          calculateEngagementScore(synopsisText),
        lengthTarget: synopsis.lengthTarget || lengthTarget
      };
    }).filter(synopsis => synopsis.synopsis && synopsis.synopsis.length > 20);

    // Ensure we have at least some synopses, pad if necessary
    while (formattedSynopses.length < Math.min(requestedCount, 2)) {
      const fallbackSynopsis = generateSingleFallbackSynopsis(topic, title, lengthTarget, tones[0] || 'professional', hooks[0] || 'benefit');
      formattedSynopses.push(fallbackSynopsis);
    }

    return formattedSynopses.slice(0, requestedCount);

  } catch (error) {
    console.error('[Synopsis Generation API] Error parsing synopses:', error);
    return generateFallbackSynopses(topic, title, lengthTarget, tones, requestedCount);
  }
}

/**
 * Parse single generated synopsis
 */
function parseSingleGeneratedSynopsis(rawContent, topic, title, lengthTarget, tone, hook) {
  try {
    let synopsis;
    
    if (typeof rawContent === 'string') {
      const cleanContent = rawContent.trim();
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        synopsis = JSON.parse(jsonMatch[0]);
      } else {
        // Extract synopsis from plain text
        const synopsisText = cleanContent.split('\n').filter(line => line.trim()).join(' ').substring(0, 500);
        const words = synopsisText.split(/\s+/);
        
        synopsis = {
          synopsis: synopsisText,
          wordCount: words.length,
          characterCount: synopsisText.length,
          tone: tone,
          hook: hook,
          readabilityScore: calculateReadabilityScore(synopsisText),
          engagementScore: calculateEngagementScore(synopsisText),
          lengthTarget: lengthTarget
        };
      }
    } else {
      synopsis = rawContent;
    }

    const synopsisText = synopsis.synopsis || `A comprehensive guide to ${title || topic}.`;
    const words = synopsisText.split(/\s+/);

    return {
      synopsis: synopsisText,
      wordCount: words.length,
      characterCount: synopsisText.length,
      tone: synopsis.tone || tone,
      hook: synopsis.hook || hook,
      readabilityScore: typeof synopsis.readabilityScore === 'number' ? Math.min(100, Math.max(0, synopsis.readabilityScore)) : calculateReadabilityScore(synopsisText),
      engagementScore: typeof synopsis.engagementScore === 'number' ? Math.min(100, Math.max(0, synopsis.engagementScore)) : calculateEngagementScore(synopsisText),
      lengthTarget: synopsis.lengthTarget || lengthTarget
    };

  } catch (error) {
    console.error('[Synopsis Generation API] Error parsing single synopsis:', error);
    return generateSingleFallbackSynopsis(topic, title, lengthTarget, tone, hook);
  }
}

/**
 * Parse structured text format as fallback
 */
function parseStructuredSynopsisText(content, topic, title, lengthTarget, tones) {
  const synopses = [];
  
  // Try to find synopsis sections
  const sections = content.split(/(?:\n\s*\n|\n\d+[\.\):])/);
  
  sections.forEach((section, index) => {
    const text = section.trim();
    if (text.length > 50) {
      const words = text.split(/\s+/);
      synopses.push({
        synopsis: text,
        wordCount: words.length,
        characterCount: text.length,
        tone: tones[index % tones.length] || 'professional',
        hook: ['benefit', 'curiosity', 'problem'][index % 3],
        readabilityScore: calculateReadabilityScore(text),
        engagementScore: calculateEngagementScore(text),
        lengthTarget: lengthTarget
      });
    }
  });

  return synopses.length > 0 ? synopses : generateFallbackSynopses(topic, title, lengthTarget, tones, 2);
}

/**
 * Generate fallback synopses when AI generation fails
 */
function generateFallbackSynopses(topic, title, lengthTarget, tones, count) {
  const contentName = title || topic;
  const fallbackTemplates = [
    {
      template: `Discover everything you need to know about ${contentName}. This comprehensive guide covers essential concepts, practical applications, and proven strategies that deliver real results. Learn from expert insights and actionable advice that you can implement immediately.`,
      tone: 'professional',
      hook: 'benefit'
    },
    {
      template: `Are you struggling with ${contentName}? You're not alone. This detailed guide addresses common challenges and provides step-by-step solutions that actually work. Get the clarity and confidence you need to succeed.`,
      tone: 'friendly',
      hook: 'problem'
    },
    {
      template: `What if you could master ${contentName} faster than you ever thought possible? This guide reveals the insider secrets and advanced techniques that top professionals use. Transform your approach and see immediate improvements.`,
      tone: 'conversational',
      hook: 'curiosity'
    }
  ];

  const synopses = [];
  
  for (let i = 0; i < Math.min(count, fallbackTemplates.length); i++) {
    const template = fallbackTemplates[i];
    const synopsisText = template.template;
    const words = synopsisText.split(/\s+/);
    
    synopses.push({
      synopsis: synopsisText,
      wordCount: words.length,
      characterCount: synopsisText.length,
      tone: tones.includes(template.tone) ? template.tone : tones[0] || 'professional',
      hook: template.hook,
      readabilityScore: calculateReadabilityScore(synopsisText),
      engagementScore: calculateEngagementScore(synopsisText),
      lengthTarget: lengthTarget
    });
  }

  // Fill remaining slots if needed
  while (synopses.length < count) {
    const extraSynopsis = generateSingleFallbackSynopsis(topic, title, lengthTarget, tones[synopses.length % tones.length] || 'professional', 'benefit');
    synopses.push(extraSynopsis);
  }

  return synopses;
}

/**
 * Generate a single fallback synopsis
 */
function generateSingleFallbackSynopsis(topic, title, lengthTarget, tone, hook) {
  const contentName = title || topic;
  
  const templates = {
    'problem': `Many people struggle with ${contentName}, but it doesn't have to be difficult. This comprehensive guide breaks down complex concepts into simple, actionable steps that anyone can follow. Get the practical knowledge you need to overcome common challenges and achieve your goals.`,
    'benefit': `Master ${contentName} with this comprehensive guide that delivers real results. Learn proven strategies, expert techniques, and practical applications that you can implement immediately. Transform your understanding and achieve the success you've been looking for.`,
    'curiosity': `What's the secret to succeeding with ${contentName}? This guide reveals the insider knowledge and advanced techniques that top experts use but rarely share. Discover the strategies that could change everything for you.`,
    'statistic': `Research shows that most people fail at ${contentName} because they lack the right approach. This guide provides the data-driven strategies and proven methodologies that successful professionals use to achieve exceptional results.`,
    'story': `Like many others, you might be wondering how to effectively approach ${contentName}. This guide shares real success stories and practical lessons learned from years of experience, giving you a clear roadmap to follow.`,
    'question': `How can you master ${contentName} quickly and effectively? This comprehensive guide answers that question with detailed explanations, practical examples, and step-by-step instructions that make complex topics simple to understand and implement.`
  };
  
  const synopsisText = templates[hook] || templates['benefit'];
  const words = synopsisText.split(/\s+/);
  
  return {
    synopsis: synopsisText,
    wordCount: words.length,
    characterCount: synopsisText.length,
    tone: tone,
    hook: hook,
    readabilityScore: calculateReadabilityScore(synopsisText),
    engagementScore: calculateEngagementScore(synopsisText),
    lengthTarget: lengthTarget
  };
}

/**
 * Calculate readability score for synopsis text
 */
function calculateReadabilityScore(text) {
  let score = 50; // Base score
  
  const words = text.split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Average words per sentence (lower is better for readability)
  const avgWordsPerSentence = words.length / sentences.length;
  if (avgWordsPerSentence <= 15) {
    score += 20;
  } else if (avgWordsPerSentence <= 20) {
    score += 10;
  } else if (avgWordsPerSentence > 25) {
    score -= 15;
  }
  
  // Avoid overly complex words
  const complexWords = words.filter(word => word.length > 8).length;
  const complexRatio = complexWords / words.length;
  if (complexRatio < 0.15) {
    score += 15;
  } else if (complexRatio > 0.35) {
    score -= 15;
  }
  
  // Active voice indicators (passive voice reduces readability)
  const passiveIndicators = ['was', 'were', 'been', 'being'];
  const passiveCount = words.filter(word => 
    passiveIndicators.some(indicator => word.toLowerCase().includes(indicator))
  ).length;
  if (passiveCount / words.length < 0.1) {
    score += 10;
  }
  
  // Transition words improve readability
  const transitionWords = ['however', 'therefore', 'moreover', 'furthermore', 'additionally', 'consequently'];
  const transitionCount = words.filter(word => 
    transitionWords.some(transition => word.toLowerCase().includes(transition))
  ).length;
  if (transitionCount > 0) {
    score += 5;
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate engagement score for synopsis text
 */
function calculateEngagementScore(text) {
  let score = 50; // Base score
  
  const lowerText = text.toLowerCase();
  
  // Power words that increase engagement
  const powerWords = ['discover', 'secret', 'proven', 'ultimate', 'essential', 'exclusive', 'guaranteed', 'amazing', 'incredible', 'revolutionary'];
  powerWords.forEach(word => {
    if (lowerText.includes(word)) {
      score += 6;
    }
  });
  
  // Emotional words
  const emotionalWords = ['transform', 'succeed', 'master', 'achieve', 'overcome', 'improve', 'boost', 'maximize', 'optimize'];
  emotionalWords.forEach(word => {
    if (lowerText.includes(word)) {
      score += 5;
    }
  });
  
  // Action words
  const actionWords = ['learn', 'discover', 'find', 'get', 'create', 'build', 'develop', 'implement'];
  actionWords.forEach(word => {
    if (lowerText.includes(word)) {
      score += 4;
    }
  });
  
  // Questions create engagement
  if (text.includes('?')) {
    score += 10;
  }
  
  // Numbers and statistics
  if (/\d+/.test(text)) {
    score += 8;
  }
  
  // Benefit-focused language
  const benefitWords = ['results', 'success', 'solution', 'improve', 'better', 'effective', 'efficient'];
  benefitWords.forEach(word => {
    if (lowerText.includes(word)) {
      score += 3;
    }
  });
  
  // Personal pronouns create connection
  const personalWords = ['you', 'your', 'yourself'];
  let personalCount = 0;
  personalWords.forEach(word => {
    personalCount += (lowerText.match(new RegExp(word, 'g')) || []).length;
  });
  if (personalCount > 0) {
    score += Math.min(15, personalCount * 3);
  }
  
  return Math.min(100, Math.max(0, score));
}