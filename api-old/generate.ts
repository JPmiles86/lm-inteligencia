/**
 * Main AI Generation API endpoint
 * Handles comprehensive blog post generation using OpenAI
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
      mode = 'structured',
      vertical = 'all',
      task = 'blog',
      prompt,
      context,
      provider = 'openai',
      model = 'gpt-4o',
      outputCount = 1,
      temperature = 0.7,
      maxTokens = 2000
    } = req.body;

    console.log('[API] Generate content request:', {
      mode,
      task,
      provider,
      model,
      promptLength: prompt?.length
    });

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
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
    const startTime = Date.now();

    // Build the system prompt based on task type
    const systemPrompt = buildSystemPrompt(task, mode, vertical);

    // Build the enhanced user prompt
    const enhancedPrompt = buildEnhancedPrompt(prompt, context, task);

    console.log('[API] Sending request to OpenAI...');

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: model as any,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: enhancedPrompt
        }
      ],
      temperature: temperature,
      max_tokens: maxTokens,
      n: outputCount
    });

    const endTime = Date.now();
    const durationMs = endTime - startTime;

    const generatedContent = completion.choices[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('No content generated');
    }

    // Calculate tokens and cost
    const tokensUsed = completion.usage?.total_tokens || 0;
    const cost = calculateCost(model, tokensUsed);

    console.log('[API] Generated content, tokens:', tokensUsed, 'duration:', durationMs);

    // Structure the response as a GenerationNode
    const generation = {
      id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: task === 'blog' ? 'idea' : task,
      mode: mode,
      content: generatedContent,
      metadata: {
        title: extractTitle(generatedContent),
        wordCount: generatedContent.split(/\s+/).length,
        readingTime: Math.ceil(generatedContent.split(/\s+/).length / 200),
        seoScore: calculateSEOScore(generatedContent),
        format: 'markdown'
      },
      vertical: vertical,
      provider: provider,
      model: model,
      status: 'completed',
      selected: false,
      visible: true,
      deleted: false,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      generation,
      tokensUsed,
      cost,
      durationMs,
      provider,
      model
    });

  } catch (error: any) {
    console.error('[API] Generate content error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate content',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Build system prompt based on task type
 */
function buildSystemPrompt(task: string, mode: string, vertical: string): string {
  const basePrompt = 'You are an expert content writer with deep knowledge across multiple industries.';

  const taskPrompts: any = {
    blog: `${basePrompt} You specialize in creating comprehensive, engaging blog posts that are well-structured, SEO-optimized, and valuable to readers. Format your response in markdown with proper headings, paragraphs, and formatting.`,
    article: `${basePrompt} You create professional articles with journalistic quality, proper citations, and authoritative tone.`,
    social: `${basePrompt} You craft engaging social media content optimized for various platforms.`,
    email: `${basePrompt} You write compelling email content that drives engagement and conversions.`,
    landing: `${basePrompt} You create persuasive landing page copy that converts visitors into customers.`
  };

  let prompt = taskPrompts[task] || taskPrompts.blog;

  if (vertical && vertical !== 'all') {
    const verticalContext: any = {
      technology: 'Focus on technical accuracy, innovation, and industry trends.',
      healthcare: 'Emphasize medical accuracy, patient care, and regulatory compliance.',
      finance: 'Include financial insights, market analysis, and regulatory considerations.',
      education: 'Focus on learning outcomes, pedagogical approaches, and student engagement.',
      ecommerce: 'Emphasize conversion optimization, user experience, and product benefits.',
      hospitality: 'Focus on customer experience, service excellence, and destination appeal.',
      realestate: 'Include market insights, property features, and investment potential.',
      automotive: 'Cover technical specifications, performance, and driving experience.'
    };

    if (verticalContext[vertical]) {
      prompt += ` ${verticalContext[vertical]}`;
    }
  }

  if (mode === 'structured') {
    prompt += ' Follow the provided outline and structure exactly as specified.';
  }

  return prompt;
}

/**
 * Build enhanced prompt with context
 */
function buildEnhancedPrompt(prompt: string, context: any, task: string): string {
  let enhancedPrompt = prompt;

  // Add style guide context if provided
  if (context?.styleGuides?.writingStyle?.length > 0) {
    enhancedPrompt += '\n\nWriting Style Guidelines:\n';
    context.styleGuides.writingStyle.forEach((guide: any) => {
      enhancedPrompt += `- ${guide.name}: ${guide.description}\n`;
    });
  }

  // Add additional context if provided
  if (context?.additionalContext) {
    enhancedPrompt += `\n\nAdditional Context:\n${context.additionalContext}`;
  }

  // Add formatting instructions based on task
  if (task === 'blog') {
    enhancedPrompt += `\n\nFormatting Requirements:
- Use markdown formatting
- Include a compelling title (# heading)
- Use proper heading hierarchy (##, ###)
- Include an engaging introduction
- Break content into logical sections
- Add a strong conclusion
- Aim for comprehensive coverage while maintaining readability
- Include relevant examples and explanations
- Ensure smooth transitions between sections`;
  }

  return enhancedPrompt;
}

/**
 * Extract title from generated content
 */
function extractTitle(content: string): string {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1] : 'Untitled';
}

/**
 * Calculate basic SEO score
 */
function calculateSEOScore(content: string): number {
  let score = 5; // Base score

  // Check for headings
  const headings = content.match(/^#{1,3}\s+.+$/gm);
  if (headings && headings.length > 3) score += 2;

  // Check content length
  const wordCount = content.split(/\s+/).length;
  if (wordCount > 1000) score += 2;
  else if (wordCount > 500) score += 1;

  // Check for lists
  if (content.includes('- ') || content.includes('1. ')) score += 1;

  return Math.min(10, score);
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