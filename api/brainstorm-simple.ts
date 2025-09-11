/**
 * Simplified Brainstorm API endpoint
 * Direct implementation without complex imports
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

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

    // Use environment variable for API key
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        message: 'Please set OPENAI_API_KEY environment variable in Vercel'
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