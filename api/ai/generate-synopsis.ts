/**
 * Generate Synopsis API endpoint
 * Handles AI-powered synopsis generation using OpenAI
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
      context = '',
      targetAudience = 'general',
      count = 3,
      lengthTarget = 'medium',
      tones = [],
      hooks = [],
      includeKeywords = [],
      optimizeForSocial = false,
      provider = 'openai',
      model = 'gpt-4o'
    } = req.body;

    console.log('[API] Generate synopsis request:', {
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
    const prompt = buildSynopsisPrompt({
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

    console.log('[API] Sending request to OpenAI...');

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: model as any,
      messages: [
        {
          role: 'system',
          content: 'You are an expert content writer specializing in creating compelling synopses that capture the essence of content while engaging readers.'
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
    const synopses = result.synopses || [];

    // Calculate tokens and cost
    const tokensUsed = completion.usage?.total_tokens || 0;
    const cost = calculateCost(model, tokensUsed);

    console.log('[API] Generated', synopses.length, 'synopses, tokens:', tokensUsed);

    return res.status(200).json({
      success: true,
      synopses: synopses.map((synopsis: any) => ({
        synopsis: synopsis.text || synopsis.synopsis || synopsis,
        tone: synopsis.tone || 'professional',
        hook: synopsis.hook || 'informative',
        wordCount: (synopsis.text || synopsis.synopsis || synopsis).split(' ').length,
        readabilityScore: synopsis.readabilityScore || 8,
        engagement: synopsis.engagement || 7,
        socialOptimized: synopsis.socialOptimized || optimizeForSocial
      })),
      tokensUsed,
      cost,
      provider,
      model
    });

  } catch (error: any) {
    console.error('[API] Generate synopsis error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate synopsis',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Build the synopsis generation prompt
 */
function buildSynopsisPrompt(options: any): string {
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
    optimizeForSocial
  } = options;

  const lengthGuide: any = {
    short: '50-75 words',
    medium: '100-150 words',
    long: '200-250 words'
  };

  let prompt = `Generate ${count} compelling synopses for `;

  if (title) {
    prompt += `the blog post titled: "${title}"`;
    if (topic) {
      prompt += ` about "${topic}"`;
    }
  } else {
    prompt += `a blog post about: "${topic}"`;
  }

  prompt += '\n\n';

  if (context) {
    prompt += `Additional context: ${context}\n\n`;
  }

  prompt += `Target audience: ${targetAudience}\n`;
  prompt += `Length target: ${lengthGuide[lengthTarget] || lengthGuide.medium}\n\n`;

  if (tones && tones.length > 0) {
    prompt += `Use these tones across the different synopses: ${tones.join(', ')}\n`;
  }

  if (hooks && hooks.length > 0) {
    prompt += `Incorporate these hook types: ${hooks.join(', ')}\n`;
  }

  if (includeKeywords && includeKeywords.length > 0) {
    prompt += `Include these keywords naturally: ${includeKeywords.join(', ')}\n`;
  }

  if (optimizeForSocial) {
    prompt += `Optimize for social media sharing with attention-grabbing openings.\n`;
  }

  prompt += `\nReturn the synopses in JSON format with this structure:
{
  "synopses": [
    {
      "text": "The actual synopsis text",
      "tone": "The tone used (e.g., professional, casual, authoritative)",
      "hook": "The hook type used (e.g., question, statistic, story)",
      "readabilityScore": 1-10 rating for readability,
      "engagement": 1-10 rating for engagement potential,
      "socialOptimized": true/false
    }
  ]
}

Create synopses that:
- Capture the essence of the content
- Engage the reader from the first sentence
- Clearly communicate the value proposition
- Create curiosity and encourage reading
- Vary in approach and style`;

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