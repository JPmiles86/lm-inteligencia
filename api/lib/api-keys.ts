import { neon } from '@neondatabase/serverless';
import { decrypt } from '../../server/utils/encryption';

const sql = neon(process.env.DATABASE_URL!);

export type Provider = 'openai' | 'anthropic' | 'google' | 'perplexity';

export interface ProviderConfig {
  apiKey: string;
  defaultModel?: string;
  settings?: Record<string, any>;
  active: boolean;
}

/**
 * Fetches and decrypts API key for a provider from the database
 * @param provider The AI provider name
 * @returns Decrypted provider configuration
 */
export async function getProviderConfig(provider: Provider): Promise<ProviderConfig> {
  try {
    // Query the provider_settings table
    const result = await sql`
      SELECT 
        api_key_encrypted,
        encryption_salt,
        default_model,
        settings,
        active
      FROM provider_settings
      WHERE provider = ${provider}
      AND active = true
      LIMIT 1
    `;

    if (!result || result.length === 0) {
      throw new Error(`No active configuration found for provider: ${provider}`);
    }

    const config = result[0];
    
    if (!config.api_key_encrypted) {
      throw new Error(`API key not configured for provider: ${provider}`);
    }

    // Decrypt the API key
    const decryptedKey = await decrypt(
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