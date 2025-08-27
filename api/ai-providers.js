// Simplified AI Providers API - Direct database operations
// This handles provider configuration without complex dependencies

export default async function handler(req, res) {
  const { method, query, body } = req;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Import database dependencies
    const { Pool } = await import('pg');
    const crypto = await import('crypto');
    
    // Create database connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    // Simple encryption/decryption functions
    const encrypt = (text) => {
      // Simple base64 encoding for now (in production, use proper encryption)
      return Buffer.from(text).toString('base64');
    };

    const decrypt = (encrypted) => {
      // Simple base64 decoding
      try {
        return Buffer.from(encrypted, 'base64').toString('utf8');
      } catch {
        return encrypted; // Return as-is if decryption fails
      }
    };

    // Check if provider_settings table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'provider_settings'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      // Create table if it doesn't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS provider_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          provider VARCHAR(50) NOT NULL UNIQUE,
          api_key_encrypted TEXT,
          encryption_salt VARCHAR(255),
          default_model VARCHAR(100),
          fallback_model VARCHAR(100),
          task_defaults JSON,
          monthly_limit NUMERIC(10,2),
          current_usage NUMERIC(10,2) DEFAULT 0,
          last_reset_date TIMESTAMP DEFAULT NOW(),
          settings JSON,
          active BOOLEAN DEFAULT true,
          last_tested TIMESTAMP,
          test_success BOOLEAN,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      // Create indexes
      await pool.query('CREATE INDEX IF NOT EXISTS idx_provider_settings_provider ON provider_settings(provider);');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_provider_settings_active ON provider_settings(active);');
    }

    // Handle different actions
    const { action } = body || query || {};

    if (method === 'GET' || (method === 'POST' && action === 'list')) {
      // Get all providers
      const result = await pool.query('SELECT * FROM provider_settings ORDER BY provider');
      
      // Don't send actual API keys back to frontend
      const providers = result.rows.map(p => ({
        ...p,
        api_key_encrypted: undefined,
        apiKey: p.api_key_encrypted ? '[CONFIGURED]' : '[NOT CONFIGURED]',
        encryption_salt: undefined
      }));

      await pool.end();
      return res.status(200).json({
        success: true,
        data: providers
      });
    }

    if (method === 'POST') {
      if (action === 'test-connection') {
        // Test provider connection
        const { provider, apiKey, model } = body;
        
        if (!provider || !apiKey) {
          await pool.end();
          return res.status(400).json({ 
            success: false,
            error: 'Provider and API key are required' 
          });
        }

        // For testing, we'll just verify the API key format
        let isValid = false;
        let message = '';

        switch (provider) {
          case 'openai':
            isValid = apiKey.startsWith('sk-') && apiKey.length > 20;
            message = isValid ? 'OpenAI API key format is valid' : 'Invalid OpenAI API key format';
            break;
          case 'anthropic':
            isValid = apiKey.startsWith('sk-ant-') && apiKey.length > 20;
            message = isValid ? 'Anthropic API key format is valid' : 'Invalid Anthropic API key format';
            break;
          case 'google':
            isValid = apiKey.length > 20;
            message = isValid ? 'Google API key format is valid' : 'Invalid Google API key format';
            break;
          case 'perplexity':
            isValid = apiKey.startsWith('pplx-') && apiKey.length > 20;
            message = isValid ? 'Perplexity API key format is valid' : 'Invalid Perplexity API key format';
            break;
          default:
            isValid = false;
            message = 'Unknown provider';
        }

        await pool.end();
        return res.status(200).json({
          success: true,
          data: {
            success: isValid,
            message,
            provider,
            model: model || 'default'
          }
        });
      }

      if (action === 'configure') {
        // Save provider configuration
        const { provider, apiKey, defaultModel } = body;
        
        if (!provider || !apiKey) {
          await pool.end();
          return res.status(400).json({ 
            success: false,
            error: 'Provider and API key are required' 
          });
        }

        // Encrypt the API key
        const encryptedKey = encrypt(apiKey);
        
        // Check if provider already exists
        const existing = await pool.query(
          'SELECT id FROM provider_settings WHERE provider = $1',
          [provider]
        );

        let result;
        if (existing.rows.length > 0) {
          // Update existing
          result = await pool.query(
            `UPDATE provider_settings 
             SET api_key_encrypted = $1, 
                 default_model = $2,
                 updated_at = NOW(),
                 active = true
             WHERE provider = $3
             RETURNING *`,
            [encryptedKey, defaultModel, provider]
          );
        } else {
          // Insert new
          result = await pool.query(
            `INSERT INTO provider_settings 
             (provider, api_key_encrypted, default_model, active)
             VALUES ($1, $2, $3, true)
             RETURNING *`,
            [provider, encryptedKey, defaultModel]
          );
        }

        const savedProvider = result.rows[0];
        
        await pool.end();
        return res.status(200).json({
          success: true,
          data: {
            ...savedProvider,
            api_key_encrypted: undefined,
            apiKey: '[CONFIGURED]',
            encryption_salt: undefined
          }
        });
      }
    }

    if (method === 'PUT') {
      const { provider } = query;
      const { apiKey } = body;
      
      if (!provider || !apiKey) {
        await pool.end();
        return res.status(400).json({ 
          success: false,
          error: 'Provider and API key are required' 
        });
      }

      // Update API key
      const encryptedKey = encrypt(apiKey);
      
      const result = await pool.query(
        `UPDATE provider_settings 
         SET api_key_encrypted = $1, 
             updated_at = NOW()
         WHERE provider = $2
         RETURNING *`,
        [encryptedKey, provider]
      );

      if (result.rows.length === 0) {
        await pool.end();
        return res.status(404).json({ 
          success: false,
          error: 'Provider not found' 
        });
      }

      await pool.end();
      return res.status(200).json({
        success: true,
        message: 'API key updated successfully'
      });
    }

    if (method === 'DELETE') {
      const { provider } = query;
      
      if (!provider) {
        await pool.end();
        return res.status(400).json({ 
          success: false,
          error: 'Provider is required' 
        });
      }

      await pool.query(
        'DELETE FROM provider_settings WHERE provider = $1',
        [provider]
      );

      await pool.end();
      return res.status(200).json({
        success: true,
        message: 'Provider configuration deleted'
      });
    }

    await pool.end();
    return res.status(400).json({ 
      success: false,
      error: 'Invalid request' 
    });

  } catch (error) {
    console.error('AI Providers API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}