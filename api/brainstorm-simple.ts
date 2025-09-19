/**
 * Simplified Brainstorm API endpoint
 * Uses user-configured API keys from database only
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { getOpenAIKey } from './lib/api-keys.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, count = 5, prompt } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    // Get API key from database only - no env fallback
    let apiKey: string;
    try {
      apiKey = await getOpenAIKey();
    } catch (error: any) {
      return res.status(500).json({ 
        error: 'OpenAI not configured',
        message: 'Please add your OpenAI API key in Admin Settings',
        details: error.message
      });
    }

    const openai = new OpenAI({ apiKey });

    const systemPrompt = `You are an expert content strategist. Generate exactly ${count} unique, compelling blog post ideas about: "${topic}".
    
    Return your response as a JSON array of objects with these fields:
    - title: A compelling headline (60-80 characters)
    - description: Brief overview (2-3 sentences)
    - tags: Array of 3-5 relevant tags`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt || `Generate ${count} blog ideas about: ${topic}` }
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content generated');
    }

    const result = JSON.parse(content);

    return res.status(200).json({
      success: true,
      data: result.ideas || result,
      metadata: {
        topic,
        count,
        model: 'gpt-3.5-turbo',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Brainstorm API error:', error);
    
    return res.status(500).json({
      error: 'Failed to generate ideas',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}