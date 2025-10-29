/**
 * Ultra-simplified Provider Save API endpoint
 * Saves API keys with basic encryption (no complex imports)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import pg from 'pg';
import OpenAI from 'openai';
import crypto from 'crypto';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Simple encryption for now (replace with better encryption later)
function simpleEncrypt(text: string): { encrypted: string; salt: string } {
  const algorithm = 'aes-256-cbc';
  const password = process.env.ENCRYPTION_PASSWORD || 'temp-encryption-key-change-me';
  const salt = crypto.randomBytes(32).toString('hex');
  const key = crypto.scryptSync(password, salt, 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted: iv.toString('hex') + ':' + encrypted,
    salt: salt
  };
}

// Test provider API key
async function testProviderKey(provider: string, apiKey: string): Promise<{ success: boolean; message: string }> {
  try {
    if (provider === 'openai') {
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5
      });
      return { success: true, message: 'OpenAI API key is valid' };
    }
    
    return { success: false, message: `Provider ${provider} test not implemented` };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || 'API key validation failed' 
    };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Provider save endpoint called:', req.method, req.query);
  
  // Allow POST for save and GET for test
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { provider, test } = req.query;
    
    if (!provider || typeof provider !== 'string') {
      return res.status(400).json({ error: 'Provider is required' });
    }

    // Handle test request
    if (test === 'true' && req.method === 'GET') {
      console.log('Testing provider:', provider);
      
      // For now, just return success if provider exists in DB
      const result = await pool.query(
        `SELECT provider
        FROM provider_settings
        WHERE provider = $1
        AND active = true
        LIMIT 1`,
        [provider]
      );

      if (result && result.rows.length > 0) {
        return res.status(200).json({
          success: true,
          message: 'Provider configuration exists',
          provider
        });
      } else {
        return res.status(404).json({ 
          error: 'Provider not configured',
          message: 'Please save API key first' 
        });
      }
    }

    // Handle save request
    if (req.method === 'POST') {
      const { apiKey } = req.body;
      
      console.log('Saving provider:', provider);
      console.log('API key starts with:', apiKey?.substring(0, 10));
      
      if (!apiKey) {
        return res.status(400).json({ error: 'API key is required' });
      }

      // Test the API key first
      const testResult = await testProviderKey(provider, apiKey);
      if (!testResult.success) {
        return res.status(400).json({ 
          error: 'Invalid API key',
          message: testResult.message 
        });
      }

      // Encrypt the API key
      const { encrypted, salt } = simpleEncrypt(apiKey);
      
      console.log('Encrypted key, checking if provider exists...');

      // Check if provider settings exist
      const existing = await pool.query(
        `SELECT id FROM provider_settings
        WHERE provider = $1
        LIMIT 1`,
        [provider]
      );

      if (existing && existing.rows.length > 0) {
        console.log('Updating existing provider settings...');
        // Update existing
        await pool.query(
          `UPDATE provider_settings
          SET
            api_key_encrypted = $1,
            encryption_salt = $2,
            active = true,
            last_tested = NOW(),
            test_success = true,
            updated_at = NOW()
          WHERE provider = $3`,
          [encrypted, salt, provider]
        );
      } else {
        console.log('Creating new provider settings...');
        // Insert new
        await pool.query(
          `INSERT INTO provider_settings (
            provider,
            api_key_encrypted,
            encryption_salt,
            active,
            last_tested,
            test_success,
            created_at,
            updated_at
          ) VALUES (
            $1,
            $2,
            $3,
            true,
            NOW(),
            true,
            NOW(),
            NOW()
          )`,
          [provider, encrypted, salt]
        );
      }

      console.log('Provider settings saved successfully');

      return res.status(200).json({
        success: true,
        message: `${provider} API key saved and encrypted successfully`,
        provider,
        tested: true
      });
    }

  } catch (error: any) {
    console.error('Provider save API error:', error);
    
    return res.status(500).json({
      error: 'Failed to save provider settings',
      message: error.message,
      stack: error.stack?.split('\n')[0], // Just first line of stack
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}