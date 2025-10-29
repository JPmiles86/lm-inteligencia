/**
 * Generate Titles API endpoint
 * Handles AI-powered title generation using OpenAI
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
      topic,
      context = '',
      count = 5,
      templates = [],
      keywords = [],
      seoTarget = 'moderate',
      abTestMode = false,
      provider = 'openai',
      model = 'gpt-4o'
    } = req.body;

    console.log('[API] Generate titles request:', {
      action,
      topic,
      count,
      provider,
      model
    });

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
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
    const prompt = buildTitlePrompt({
      topic,
      context,
      count,
      templates,
      keywords,
      seoTarget,
      abTestMode
    });

    console.log('[API] Sending request to OpenAI...');

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: model as any,
      messages: [
        {
          role: 'system',
          content: 'You are an expert content strategist specializing in creating compelling, SEO-optimized titles.'
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
    const titles = result.titles || [];

    // Calculate tokens and cost
    const tokensUsed = completion.usage?.total_tokens || 0;
    const cost = calculateCost(model, tokensUsed);

    console.log('[API] Generated', titles.length, 'titles, tokens:', tokensUsed);

    return res.status(200).json({
      success: true,
      titles: titles.map((title: any) => ({
        title: title.title || title.text || title,
        template: title.template || 'custom',
        seoScore: title.seoScore || calculateSEOScore(title.title || title, keywords),
        characterCount: (title.title || title).length,
        clickAppeal: title.clickAppeal || 7,
        readability: title.readability || 8
      })),
      tokensUsed,
      cost,
      provider,
      model
    });

  } catch (error: any) {
    console.error('[API] Generate titles error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate titles',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Build the title generation prompt
 */
function buildTitlePrompt(options: any): string {
  const {
    topic,
    context,
    count,
    templates,
    keywords,
    seoTarget,
    abTestMode
  } = options;

  let prompt = `Generate ${count} compelling blog post titles for the topic: "${topic}"\n\n`;

  if (context) {
    prompt += `Additional context: ${context}\n\n`;
  }

  if (templates && templates.length > 0) {
    prompt += `Use these title templates/styles as inspiration:\n`;
    templates.forEach((template: string) => {
      prompt += `- ${template}\n`;
    });
    prompt += '\n';
  }

  if (keywords && keywords.length > 0) {
    prompt += `Include these keywords when relevant: ${keywords.join(', ')}\n\n`;
  }

  if (seoTarget) {
    const seoGuidance: any = {
      aggressive: 'Optimize heavily for SEO with keyword-rich titles (60-70 chars)',
      moderate: 'Balance SEO optimization with readability (50-60 chars)',
      minimal: 'Focus on creativity and engagement over SEO (40-60 chars)'
    };
    prompt += `SEO approach: ${seoGuidance[seoTarget] || seoGuidance.moderate}\n\n`;
  }

  if (abTestMode) {
    prompt += `Create variations suitable for A/B testing with different angles and approaches.\n\n`;
  }

  prompt += `Return the titles in JSON format with this structure:
{
  "titles": [
    {
      "title": "The actual title text",
      "template": "Template type used (e.g., how-to, listicle, question)",
      "seoScore": 1-10 rating for SEO potential,
      "clickAppeal": 1-10 rating for click-through appeal,
      "readability": 1-10 rating for readability
    }
  ]
}

Make the titles engaging, clear, and optimized for the target audience. Vary the style and approach across the different titles.`;

  return prompt;
}

/**
 * Calculate SEO score for a title
 */
function calculateSEOScore(title: string, keywords: string[]): number {
  let score = 5; // Base score

  // Check title length (optimal: 50-60 chars)
  if (title.length >= 50 && title.length <= 60) {
    score += 2;
  } else if (title.length >= 40 && title.length <= 70) {
    score += 1;
  }

  // Check for keywords
  keywords.forEach(keyword => {
    if (title.toLowerCase().includes(keyword.toLowerCase())) {
      score += 1;
    }
  });

  // Check for power words
  const powerWords = ['how', 'why', 'best', 'guide', 'tips', 'secrets', 'proven', 'essential'];
  powerWords.forEach(word => {
    if (title.toLowerCase().includes(word)) {
      score += 0.5;
    }
  });

  return Math.min(10, Math.round(score));
}

/**
 * Calculate cost based on model and tokens
 */
function calculateCost(model: string, tokens: number): number {
  const pricing: any = {
    'gpt-4o': 0.00002, // $0.02 per 1K tokens
    'gpt-4o-mini': 0.00002,
    'gpt-4-turbo': 0.00003,
    'gpt-3.5-turbo': 0.000002
  };

  const rate = pricing[model] || 0.00002;
  return (tokens / 1000) * rate;
}