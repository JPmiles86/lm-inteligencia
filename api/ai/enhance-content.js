/**
 * Content Enhancement API Endpoint - AI-powered content editing and improvement
 * Provides suggestions, grammar checking, tone adjustment, and style optimization
 */

// Import the generation service to leverage existing provider infrastructure
let GenerationService;

try {
  const genModule = await import('../../src/services/ai/GenerationServiceReal.js');
  GenerationService = genModule.GenerationService;
} catch (error) {
  console.log('[Enhance Content API] Using stub generation service:', error.message);
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
      content,
      mode = 'suggestions',
      action,
      preset = false,
      provider = 'openai',
      model = 'gpt-4o',
      metrics,
      context = {}
    } = req.body;

    console.log('[Enhance Content API] Request received:', {
      mode,
      action,
      preset,
      provider,
      model,
      contentLength: content?.length || 0
    });

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Content is required and cannot be empty'
      });
    }

    if (content.length > 50000) {
      return res.status(400).json({
        success: false,
        error: 'Content is too long. Maximum 50,000 characters allowed.'
      });
    }

    // Handle different enhancement types
    if (preset && action) {
      // Apply editing preset
      return await handleEditingPreset(req, res, {
        content,
        action,
        provider,
        model,
        context
      });
    } else {
      // Generate enhancement suggestions
      return await handleGenerateEnhancements(req, res, {
        content,
        mode,
        provider,
        model,
        metrics,
        context
      });
    }

  } catch (error) {
    console.error('[Enhance Content API] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Apply an editing preset to transform content
 */
async function handleEditingPreset(req, res, params) {
  const { content, action, provider, model, context } = params;

  try {
    const startTime = Date.now();

    // Build the preset enhancement prompt
    const prompt = buildPresetPrompt({ content, action, context });
    
    console.log('[Enhance Content API] Applying preset:', action);

    // Generate enhanced content using the existing generation service
    const generationConfig = {
      mode: 'direct',
      task: 'content-enhancement',
      prompt: prompt,
      provider: provider,
      model: model,
      vertical: 'general',
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
        additionalContext: `Content enhancement using preset: ${action}`
      }
    };

    const result = await generationService.generateContent(generationConfig);
    
    if (!result.success) {
      console.error('[Enhance Content API] Enhancement failed:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to enhance content',
        fallback: true
      });
    }

    const endTime = Date.now();
    const durationMs = endTime - startTime;

    // Extract enhanced content from the result
    const enhancedContent = extractEnhancedContent(result.generation, content);

    console.log('[Enhance Content API] Preset applied successfully');

    return res.json({
      success: true,
      enhancedContent: enhancedContent,
      originalContent: content,
      preset: action,
      tokensUsed: result.tokensUsed || 0,
      cost: result.cost || 0,
      durationMs: durationMs,
      metadata: {
        action,
        provider,
        model,
        enhancedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Enhance Content API] Error in handleEditingPreset:', error);
    
    return res.status(500).json({
      success: false,
      error: `Preset enhancement failed: ${error.message}`,
      fallback: true
    });
  }
}

/**
 * Generate enhancement suggestions for content
 */
async function handleGenerateEnhancements(req, res, params) {
  const { content, mode, provider, model, metrics, context } = params;

  try {
    const startTime = Date.now();

    // Build the enhancement analysis prompt
    const prompt = buildEnhancementPrompt({ content, mode, metrics, context });
    
    console.log('[Enhance Content API] Generating enhancements for mode:', mode);

    // Generate enhancement suggestions using the existing generation service
    const generationConfig = {
      mode: 'direct',
      task: 'content-analysis',
      prompt: prompt,
      provider: provider,
      model: model,
      vertical: 'general',
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
        additionalContext: `Content enhancement analysis mode: ${mode}`
      }
    };

    const result = await generationService.generateContent(generationConfig);
    
    if (!result.success) {
      console.error('[Enhance Content API] Enhancement analysis failed:', result.error);
      
      // Provide fallback suggestions
      const fallbackEnhancements = generateFallbackEnhancements(content, mode);
      
      return res.json({
        success: true,
        enhancements: fallbackEnhancements,
        tokensUsed: 0,
        cost: 0,
        durationMs: 0,
        fallback: true,
        error: `Analysis failed, provided fallback suggestions: ${result.error}`,
        metadata: {
          mode,
          provider,
          model,
          fallback: true,
          analyzedAt: new Date().toISOString()
        }
      });
    }

    const endTime = Date.now();
    const durationMs = endTime - startTime;

    // Parse the generated enhancement suggestions
    const enhancements = parseEnhancementSuggestions(result.generation, content, mode);

    console.log('[Enhance Content API] Generated enhancements count:', enhancements.length);

    return res.json({
      success: true,
      enhancements: enhancements,
      tokensUsed: result.tokensUsed || 0,
      cost: result.cost || 0,
      durationMs: durationMs,
      metadata: {
        mode,
        provider,
        model,
        suggestionsCount: enhancements.length,
        analyzedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Enhance Content API] Error in handleGenerateEnhancements:', error);
    
    // Provide fallback enhancements if generation completely fails
    const fallbackEnhancements = generateFallbackEnhancements(content, mode);
    
    return res.status(200).json({
      success: true,
      enhancements: fallbackEnhancements,
      tokensUsed: 0,
      cost: 0,
      durationMs: 0,
      fallback: true,
      error: `Enhancement analysis failed, provided fallback suggestions: ${error.message}`,
      metadata: {
        mode,
        fallback: true,
        analyzedAt: new Date().toISOString()
      }
    });
  }
}

/**
 * Build preset enhancement prompt based on action
 */
function buildPresetPrompt({ content, action, context }) {
  const actionInstructions = {
    'make-concise': {
      instruction: 'Make the content more concise and eliminate unnecessary words',
      guidelines: [
        'Remove redundant phrases and filler words',
        'Combine related sentences where appropriate',
        'Use active voice instead of passive voice',
        'Replace wordy expressions with simpler alternatives',
        'Maintain the core message and key points'
      ]
    },
    'make-engaging': {
      instruction: 'Make the content more engaging and compelling for readers',
      guidelines: [
        'Add compelling hooks and attention-grabbing openings',
        'Use more vivid and descriptive language',
        'Include rhetorical questions to engage readers',
        'Add examples, anecdotes, or stories where appropriate',
        'Use varied sentence structure and rhythm'
      ]
    },
    'improve-seo': {
      instruction: 'Optimize the content for search engines and keyword relevance',
      guidelines: [
        'Naturally integrate relevant keywords without stuffing',
        'Improve headings and subheadings for better structure',
        'Add semantic keywords and related terms',
        'Optimize for featured snippet formats',
        'Improve content hierarchy and organization'
      ]
    },
    'simplify-language': {
      instruction: 'Simplify the language to make it more accessible and easier to read',
      guidelines: [
        'Replace complex words with simpler alternatives',
        'Break down long, complex sentences',
        'Use everyday language and avoid jargon',
        'Explain technical terms when necessary',
        'Improve readability and comprehension'
      ]
    },
    'fix-grammar': {
      instruction: 'Correct grammar, punctuation, spelling, and style errors',
      guidelines: [
        'Fix grammatical errors and typos',
        'Correct punctuation and capitalization',
        'Ensure consistent verb tense usage',
        'Fix subject-verb agreement issues',
        'Improve sentence structure and clarity'
      ]
    },
    'enhance-readability': {
      instruction: 'Improve the overall readability and flow of the content',
      guidelines: [
        'Improve sentence flow and transitions',
        'Vary sentence length and structure',
        'Add appropriate paragraph breaks',
        'Improve logical organization of ideas',
        'Enhance clarity and coherence'
      ]
    }
  };

  const actionConfig = actionInstructions[action] || actionInstructions['make-concise'];
  const customContext = context?.additionalContext || '';

  return `
You are an expert content editor and writing assistant. Your task is to ${actionConfig.instruction}.

Original Content:
"""
${content}
"""

Guidelines:
${actionConfig.guidelines.map(guideline => `- ${guideline}`).join('\n')}

${customContext ? `\nAdditional Context: ${customContext}` : ''}

Instructions:
1. Apply the above guidelines to improve the content
2. Maintain the original meaning and intent
3. Preserve important information and key messages
4. Return ONLY the enhanced content without any additional commentary
5. Do not add explanations or notes about changes made

Enhanced Content:
  `.trim();
}

/**
 * Build enhancement analysis prompt
 */
function buildEnhancementPrompt({ content, mode, metrics, context }) {
  const modeInstructions = {
    'suggestions': 'Analyze the content and provide specific improvement suggestions',
    'grammar': 'Focus on identifying grammar, spelling, and punctuation errors',
    'tone': 'Analyze the tone and suggest improvements for consistency and appropriateness',
    'optimization': 'Focus on SEO, readability, and engagement optimization'
  };

  const instruction = modeInstructions[mode] || modeInstructions['suggestions'];
  const metricsContext = metrics ? 
    `Current Metrics:
- Readability Score: ${metrics.readabilityScore}/100
- SEO Score: ${metrics.seoScore}/100
- Word Count: ${metrics.wordCount}
- Average Words per Sentence: ${metrics.avgWordsPerSentence}
- Tone: ${metrics.toneAnalysis}
${metrics.improvedAreas.length > 0 ? `- Areas needing improvement: ${metrics.improvedAreas.join(', ')}` : ''}
` : '';

  const customContext = context?.additionalContext || '';

  return `
You are an expert content editor and writing assistant. Your task is to ${instruction}.

${metricsContext}

Content to Analyze:
"""
${content}
"""

${customContext ? `\nAdditional Context: ${customContext}` : ''}

Please provide your analysis as a JSON array of enhancement objects. Each enhancement should have:
- id: unique identifier
- type: one of "grammar", "clarity", "tone", "length", "seo", "engagement", "readability"
- originalText: the text that should be changed
- suggestedText: the improved version
- reason: explanation of why this change improves the content
- confidence: percentage (0-100) of how confident you are in this suggestion
- position: approximate character position {start: number, end: number}
- category: human-readable category name
- impact: "low", "medium", or "high" impact of this change

Example format:
[
  {
    "id": "enhance_1",
    "type": "clarity",
    "originalText": "This is something that could be better",
    "suggestedText": "This needs improvement",
    "reason": "Simpler, more direct language improves clarity",
    "confidence": 85,
    "position": {"start": 0, "end": 37},
    "category": "Clarity",
    "impact": "medium"
  }
]

Focus on the most impactful improvements and limit to 10-15 suggestions maximum. Return ONLY the JSON array, no additional text or formatting.
  `.trim();
}

/**
 * Extract enhanced content from AI response
 */
function extractEnhancedContent(rawResponse, originalContent) {
  if (!rawResponse) return originalContent;

  let enhancedContent = rawResponse;

  // If response is a string, try to extract the main content
  if (typeof rawResponse === 'string') {
    const lines = rawResponse.split('\n');
    
    // Remove common AI response prefixes
    const filteredLines = lines.filter(line => 
      !line.match(/^(Here's|Here is|The enhanced|Enhanced|Improved|Below is)/i) &&
      !line.match(/^(Content:|Enhanced Content:|Improved Content:)/i) &&
      line.trim().length > 0
    );

    if (filteredLines.length > 0) {
      enhancedContent = filteredLines.join('\n').trim();
    }
  }

  // If the enhanced content seems too similar or too short, return original
  if (enhancedContent.length < originalContent.length * 0.5 || 
      enhancedContent.length < 50) {
    return originalContent;
  }

  return enhancedContent;
}

/**
 * Parse enhancement suggestions from AI response
 */
function parseEnhancementSuggestions(rawResponse, content, mode) {
  try {
    let suggestions = [];
    
    if (typeof rawResponse === 'string') {
      // Clean the response and look for JSON
      const cleanResponse = rawResponse.trim();
      
      // Look for JSON array pattern
      const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          suggestions = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.log('[Enhance Content API] JSON parse failed, trying structured text parsing');
          suggestions = parseStructuredEnhancements(cleanResponse, content, mode);
        }
      } else {
        suggestions = parseStructuredEnhancements(cleanResponse, content, mode);
      }
    } else if (Array.isArray(rawResponse)) {
      suggestions = rawResponse;
    } else {
      throw new Error('Invalid response format');
    }

    // Ensure we have an array
    if (!Array.isArray(suggestions)) {
      suggestions = [suggestions];
    }

    // Format and validate each suggestion
    const formattedSuggestions = suggestions.map((suggestion, index) => {
      const id = suggestion.id || `enhance_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`;
      
      return {
        id,
        type: ['grammar', 'clarity', 'tone', 'length', 'seo', 'engagement', 'readability'].includes(suggestion.type) 
          ? suggestion.type : 'clarity',
        originalText: (suggestion.originalText || 'Sample text').substring(0, 200),
        suggestedText: (suggestion.suggestedText || 'Improved text').substring(0, 200),
        reason: (suggestion.reason || 'General improvement').substring(0, 300),
        confidence: typeof suggestion.confidence === 'number' && suggestion.confidence >= 0 && suggestion.confidence <= 100 
          ? suggestion.confidence : 75,
        position: suggestion.position || { start: index * 10, end: (index * 10) + 20 },
        applied: false,
        category: suggestion.category || 'General',
        impact: ['low', 'medium', 'high'].includes(suggestion.impact) ? suggestion.impact : 'medium'
      };
    }).filter(suggestion => 
      suggestion.originalText && 
      suggestion.suggestedText && 
      suggestion.originalText !== suggestion.suggestedText
    );

    return formattedSuggestions.slice(0, 15); // Limit to 15 suggestions

  } catch (error) {
    console.error('[Enhance Content API] Error parsing suggestions:', error);
    return generateFallbackEnhancements(content, mode);
  }
}

/**
 * Parse structured text format as fallback
 */
function parseStructuredEnhancements(responseText, content, mode) {
  const suggestions = [];
  
  // Try to find enhancement patterns in the text
  const lines = responseText.split('\n').filter(line => line.trim());
  
  let currentSuggestion = {};
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.match(/^\d+[\.\)]/)) {
      // Save previous suggestion
      if (currentSuggestion.originalText && currentSuggestion.suggestedText) {
        suggestions.push(currentSuggestion);
      }
      
      // Start new suggestion
      currentSuggestion = {
        originalText: trimmedLine.replace(/^\d+[\.\)]\s*/, '').split(' -> ')[0] || 'Sample text',
        suggestedText: trimmedLine.split(' -> ')[1] || 'Improved text',
        reason: 'General improvement',
        confidence: 75,
        type: 'clarity',
        category: 'General',
        impact: 'medium'
      };
    } else if (trimmedLine.includes(' -> ') || trimmedLine.includes(' → ')) {
      const parts = trimmedLine.split(/ -> | → /);
      if (parts.length >= 2) {
        suggestions.push({
          originalText: parts[0].trim(),
          suggestedText: parts[1].trim(),
          reason: 'Improvement suggested by AI',
          confidence: 80,
          type: mode === 'grammar' ? 'grammar' : 'clarity',
          category: mode === 'grammar' ? 'Grammar' : 'Clarity',
          impact: 'medium'
        });
      }
    }
  }
  
  // Save last suggestion
  if (currentSuggestion.originalText && currentSuggestion.suggestedText) {
    suggestions.push(currentSuggestion);
  }

  return suggestions.length > 0 ? suggestions : generateFallbackEnhancements(content, mode);
}

/**
 * Generate fallback enhancement suggestions
 */
function generateFallbackEnhancements(content, mode) {
  const fallbackSuggestions = [];
  const words = content.split(/\s+/);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Generate mode-specific fallback suggestions
  if (mode === 'grammar') {
    fallbackSuggestions.push({
      id: 'fallback_grammar_1',
      type: 'grammar',
      originalText: 'it\'s',
      suggestedText: 'it is',
      reason: 'Consider using the full form for formal writing',
      confidence: 70,
      position: { start: 0, end: 4 },
      applied: false,
      category: 'Grammar',
      impact: 'low'
    });
  }
  
  if (mode === 'tone') {
    fallbackSuggestions.push({
      id: 'fallback_tone_1',
      type: 'tone',
      originalText: 'you should',
      suggestedText: 'you might consider',
      reason: 'Softer tone makes the content less commanding',
      confidence: 75,
      position: { start: 10, end: 20 },
      applied: false,
      category: 'Tone',
      impact: 'medium'
    });
  }
  
  // General suggestions for any mode
  if (sentences.some(s => s.split(/\s+/).length > 25)) {
    fallbackSuggestions.push({
      id: 'fallback_length_1',
      type: 'readability',
      originalText: 'Long sentence that could be split',
      suggestedText: 'Shorter sentences. Better readability.',
      reason: 'Breaking long sentences improves readability',
      confidence: 85,
      position: { start: 50, end: 100 },
      applied: false,
      category: 'Readability',
      impact: 'high'
    });
  }
  
  if (words.length < 300) {
    fallbackSuggestions.push({
      id: 'fallback_seo_1',
      type: 'seo',
      originalText: 'content',
      suggestedText: 'comprehensive content',
      reason: 'More descriptive language can improve SEO',
      confidence: 65,
      position: { start: 20, end: 27 },
      applied: false,
      category: 'SEO',
      impact: 'medium'
    });
  }

  return fallbackSuggestions;
}