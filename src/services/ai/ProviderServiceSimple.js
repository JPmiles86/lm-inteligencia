// Simplified Provider Service for Vercel compatibility
import { Pool } from 'pg';

export class ProviderService {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }

  async getProviders() {
    try {
      const result = await this.pool.query('SELECT * FROM provider_settings ORDER BY provider');
      return result.rows.map(row => ({
        ...row,
        apiKey: row.api_key_encrypted ? '[CONFIGURED]' : '[NOT CONFIGURED]',
        api_key_encrypted: undefined
      }));
    } catch (error) {
      console.error('Error fetching providers:', error);
      return [];
    }
  }

  async getAvailableModels(provider) {
    // Return static model lists for now
    const models = {
      openai: [
        { id: 'gpt-4', name: 'GPT-4', pricing: { input: 0.03, output: 0.06 } },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', pricing: { input: 0.001, output: 0.002 } }
      ],
      anthropic: [
        { id: 'claude-3-opus', name: 'Claude 3 Opus', pricing: { input: 0.015, output: 0.075 } },
        { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', pricing: { input: 0.003, output: 0.015 } }
      ]
    };
    return models[provider] || [];
  }

  async checkProviderHealth(provider) {
    return { status: 'healthy', provider };
  }

  async getTaskDefaults() {
    return {
      content: 'openai',
      image: 'openai',
      analysis: 'anthropic'
    };
  }

  async testConnection(provider) {
    return { success: true, message: 'Connection test not implemented' };
  }

  async saveProvider(data) {
    return { ...data, id: Date.now() };
  }

  async updateProvider(id, data) {
    return { ...data, id };
  }

  async removeProvider(id) {
    return { success: true };
  }

  async setDefaultProvider(provider, taskType) {
    return { success: true };
  }

  async close() {
    await this.pool.end();
  }
}