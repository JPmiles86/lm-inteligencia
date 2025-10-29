/**
 * Generate Outline API endpoint
 * Handles AI-powered outline generation using OpenAI
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { getOpenAIKey } from '../lib/api-keys.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      action,
      topic = '',
      title = '',
      synopsis = '',
      context = '',
      count = 2,
      structure = 'hierarchical',
      sectionCount = 5,
      targetWordCount = 1500,
      includeIntroConclusion = true,
      includeSubsections = true,
      includeKeywords = [],
      optimizeForSEO = true,
      provider = 'openai',
      model = 'gpt-4o'
    } = req.body;

    console.log('[API] Generate outline request:', {
      action,
      topic,
      title,
      count,
      provider,
      model
    });

    if (!topic && !title) {
      return res.status(400).json({
        success: false,
        error: 'Either topic or title is required'
      });
    }

    // Get API key from database
    let apiKey: string;
    try {
      apiKey = await getOpenAIKey();
    } catch (error: any) {
      console.error('[API] Failed to get OpenAI key:', error);
      return res.status(500).json({
        success: false,
        error: 'OpenAI not configured',
        message: 'Please add your OpenAI API key in Admin Settings'
      });
    }

    const openai = new OpenAI({ apiKey });

    // Build the prompt
    const prompt = buildOutlinePrompt({
      topic,
      title,
      synopsis,
      context,
      count,
      structure,
      sectionCount,
      targetWordCount,
      includeIntroConclusion,
      includeSubsections,
      includeKeywords,
      optimizeForSEO
    });

    console.log('[API] Sending request to OpenAI...');

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: model as any,
      messages: [
        {
          role: 'system',
          content: 'You are an expert content strategist specializing in creating comprehensive, well-structured content outlines that guide writers to produce high-quality articles.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated');
    }

    // Parse the response
    const result = JSON.parse(content);
    const outlines = result.outlines || [];

    // Calculate tokens and cost
    const tokensUsed = completion.usage?.total_tokens || 0;
    const cost = calculateCost(model, tokensUsed);

    console.log('[API] Generated', outlines.length, 'outlines, tokens:', tokensUsed);

    return res.status(200).json({
      success: true,
      outlines: outlines.map((outline: any) => ({
        title: outline.title || title || 'Blog Post Outline',
        structure: outline.structure || structure,
        sections: outline.sections || [],
        wordCountEstimate: outline.wordCountEstimate || targetWordCount,
        seoOptimized: outline.seoOptimized !== undefined ? outline.seoOptimized : optimizeForSEO,
        completeness: outline.completeness || 9,
        depth: outline.depth || 8
      })),
      tokensUsed,
      cost,
      provider,
      model
    });

  } catch (error: any) {
    console.error('[API] Generate outline error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate outline',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Build the outline generation prompt
 */
function buildOutlinePrompt(options: any): string {
  const {
    topic,
    title,
    synopsis,
    context,
    count,
    structure,
    sectionCount,
    targetWordCount,
    includeIntroConclusion,
    includeSubsections,
    includeKeywords,
    optimizeForSEO
  } = options;

  let prompt = `Generate ${count} comprehensive outline(s) for `;

  if (title) {
    prompt += `the blog post titled: "${title}"`;
    if (topic) {
      prompt += ` about "${topic}"`;
    }
  } else {
    prompt += `a blog post about: "${topic}"`;
  }

  prompt += '\n\n';

  if (synopsis) {
    prompt += `Synopsis: ${synopsis}\n\n`;
  }

  if (context) {
    prompt += `Additional context: ${context}\n\n`;
  }

  prompt += `Structure type: ${structure}\n`;
  prompt += `Target sections: ${sectionCount}\n`;
  prompt += `Target word count: ${targetWordCount} words\n`;

  if (includeIntroConclusion) {
    prompt += `Include: Introduction and Conclusion sections\n`;
  }

  if (includeSubsections) {
    prompt += `Include: Subsections for main sections\n`;
  }

  if (includeKeywords && includeKeywords.length > 0) {
    prompt += `Keywords to incorporate: ${includeKeywords.join(', ')}\n`;
  }

  if (optimizeForSEO) {
    prompt += `Optimize for SEO with keyword-rich headings\n`;
  }

  prompt += `\nReturn the outline(s) in JSON format with this structure:
{
  "outlines": [
    {
      "title": "The blog post title",
      "structure": "The structure type (hierarchical, linear, etc.)",
      "sections": [
        {
          "heading": "Section heading",
          "level": 1 or 2 (1 for main sections, 2 for subsections),
          "description": "Brief description of what this section covers",
          "wordCountEstimate": estimated word count for this section,
          "keyPoints": ["Key point 1", "Key point 2"],
          "subsections": [
            {
              "heading": "Subsection heading",
              "level": 2,
              "description": "Brief description",
              "wordCountEstimate": estimated word count
            }
          ]
        }
      ],
      "wordCountEstimate": total estimated word count,
      "seoOptimized": true/false,
      "completeness": 1-10 rating for outline completeness,
      "depth": 1-10 rating for content depth
    }
  ]
}

Create outlines that:
- Provide a clear, logical flow
- Cover the topic comprehensively
- Include specific, actionable headings
- Balance depth with readability
- Guide the writer to create valuable content`;

  if (count > 1) {
    prompt += `\n\nCreate ${count} different outline variations with different approaches and structures.`;
  }

  return prompt;
}

/**
 * Calculate cost based on model and tokens
 */
function calculateCost(model: string, tokens: number): number {
  const pricing: any = {
    'gpt-4o': 0.00002,
    'gpt-4o-mini': 0.00002,
    'gpt-4-turbo': 0.00003,
    'gpt-3.5-turbo': 0.000002
  };

  const rate = pricing[model] || 0.00002;
  return (tokens / 1000) * rate;
}