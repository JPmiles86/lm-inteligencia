import pg from 'pg';
import crypto from 'crypto';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export type Provider = 'openai' | 'anthropic' | 'google' | 'perplexity';

export interface ProviderConfig {
  apiKey: string;
  defaultModel?: string;
  settings?: Record<string, any>;
  active: boolean;
}

/**
 * Simple decryption for stored API keys
 */
function simpleDecrypt(encryptedData: string, salt: string): string {
  const algorithm = 'aes-256-cbc';
  const password = process.env.ENCRYPTION_PASSWORD || 'temp-encryption-key-change-me';
  const key = crypto.scryptSync(password, salt, 32);

  const [ivHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Fetches and decrypts API key for a provider from the database
 * @param provider The AI provider name
 * @returns Decrypted provider configuration
 */
export async function getProviderConfig(provider: Provider): Promise<ProviderConfig> {
  try {
    // Query the provider_settings table
    const result = await pool.query(
      `SELECT
        api_key_encrypted,
        encryption_salt,
        default_model,
        settings,
        active
      FROM provider_settings
      WHERE provider = $1
      AND active = true
      LIMIT 1`,
      [provider]
    );

    if (!result || result.rows.length === 0) {
      throw new Error(`No active configuration found for provider: ${provider}`);
    }

    const config = result.rows[0];

    if (!config.api_key_encrypted) {
      throw new Error(`API key not configured for provider: ${provider}`);
    }

    // Decrypt the API key
    const decryptedKey = simpleDecrypt(
      config.api_key_encrypted,
      config.encryption_salt
    );

    return {
      apiKey: decryptedKey,
      defaultModel: config.default_model,
      settings: config.settings,
      active: config.active
    };
  } catch (error) {
    console.error(`Error fetching provider config for ${provider}:`, error);
    throw error;
  }
}

/**
 * Gets OpenAI configuration from database only
 * @returns OpenAI API key from user configuration
 */
export async function getOpenAIKey(): Promise<string> {
  const config = await getProviderConfig('openai');
  if (!config.apiKey) {
    throw new Error('OpenAI API key not configured. Please add your API key in Admin Settings.');
  }
  return config.apiKey;
}

/**
 * Test if a provider is configured and active
 * @param provider The AI provider name
 * @returns Boolean indicating if provider is available
 */
export async function isProviderAvailable(provider: Provider): Promise<boolean> {
  try {
    const config = await getProviderConfig(provider);
    return config.active && !!config.apiKey;
  } catch (error) {
    return false;
  }
}