/**
 * Simple test endpoint for OpenAI API
 * Tests the API key without any database or encryption
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow POST only
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ 
        error: 'API key is required',
        message: 'Please provide an apiKey in the request body'
      });
    }

    // Log for debugging (remove in production)
    console.log('Testing API key that starts with:', apiKey.substring(0, 10) + '...');

    // Create OpenAI client
    const openai = new OpenAI({ 
      apiKey: apiKey,
      maxRetries: 1,
      timeout: 10000 // 10 second timeout
    });

    // Test with a simple completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a test assistant.' },
        { role: 'user', content: 'Reply with exactly: API test successful' }
      ],
      max_tokens: 10,
      temperature: 0
    });

    const response = completion.choices[0]?.message?.content || 'No response';

    return res.status(200).json({
      success: true,
      message: 'OpenAI API key is valid',
      response: response,
      model: completion.model,
      usage: completion.usage
    });

  } catch (error: any) {
    console.error('OpenAI test error:', error);
    
    // Detailed error response
    if (error.code === 'invalid_api_key') {
      return res.status(400).json({
        success: false,
        error: 'Invalid API key',
        message: 'The provided OpenAI API key is invalid',
        code: error.code
      });
    }
    
    if (error.code === 'insufficient_quota') {
      return res.status(400).json({
        success: false,
        error: 'Insufficient quota',
        message: 'Your OpenAI account has insufficient quota',
        code: error.code
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Test failed',
      message: error.message || 'Unknown error',
      code: error.code,
      type: error.type,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}