// Frontend service for AI provider management API calls
export interface ProviderInfo {
  provider: 'openai' | 'anthropic' | 'google' | 'perplexity';
  name: string;
  description: string;
  models: string[];
  defaultModel?: string;
  apiKey?: string;
  active?: boolean;
  lastTested?: string;
  testSuccess?: boolean;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  provider: string;
  model: string;
  latency?: number;
  error?: string;
}

export interface ProviderUsage {
  provider: string;
  currentUsage: number;
  monthlyLimit?: number;
  usagePercent: number;
  resetDate: string;
}

class AIProviderService {
  private baseURL = '/api/ai/providers';

  // Get all configured providers
  async getProviders(): Promise<ProviderInfo[]> {
    try {
      const response = await fetch(`${this.baseURL}?action=list`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch providers');
      }

      return data.data;
    } catch (error) {
      console.error('[AIProviderService] Error fetching providers:', error);
      throw error;
    }
  }

  // Configure a new provider
  async configureProvider(config: {
    provider: string;
    apiKey: string;
    defaultModel?: string;
    taskDefaults?: Record<string, unknown>;
    limits?: { monthly?: number };
  }): Promise<ProviderInfo> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'configure',
          ...config
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to configure provider');
      }

      return data.data;
    } catch (error) {
      console.error('[AIProviderService] Error configuring provider:', error);
      throw error;
    }
  }

  // Test provider connection
  async testConnection(
    provider: string, 
    apiKey: string, 
    model?: string
  ): Promise<TestConnectionResult> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test-connection',
          provider,
          apiKey,
          model
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Connection test failed');
      }

      return data.data;
    } catch (error) {
      console.error('[AIProviderService] Error testing connection:', error);
      throw error;
    }
  }

  // Update API key for a provider
  async updateApiKey(provider: string, apiKey: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}?provider=${provider}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'api-key',
          apiKey
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update API key');
      }
    } catch (error) {
      console.error('[AIProviderService] Error updating API key:', error);
      throw error;
    }
  }

  // Delete provider configuration
  async deleteProvider(provider: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}?provider=${provider}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete provider');
      }
    } catch (error) {
      console.error('[AIProviderService] Error deleting provider:', error);
      throw error;
    }
  }

  // Get available models for a provider
  async getAvailableModels(provider: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}?action=models&provider=${provider}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch models');
      }

      return data.data;
    } catch (error) {
      console.error('[AIProviderService] Error fetching models:', error);
      throw error;
    }
  }

  // Get provider usage statistics
  async getProviderUsage(provider: string, timeframe: string = 'month'): Promise<ProviderUsage> {
    try {
      const response = await fetch(`${this.baseURL}?action=usage&provider=${provider}&timeframe=${timeframe}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch usage');
      }

      return data.data;
    } catch (error) {
      console.error('[AIProviderService] Error fetching usage:', error);
      throw error;
    }
  }

  // Check provider health
  async checkProviderHealth(provider: string): Promise<{ status: string; message?: string }> {
    try {
      const response = await fetch(`${this.baseURL}?action=health&provider=${provider}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Health check failed');
      }

      return data.data;
    } catch (error) {
      console.error('[AIProviderService] Error checking health:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { status: 'error', message: errorMessage };
    }
  }

  // Get default provider configurations
  getDefaultProviders(): ProviderInfo[] {
    return [
      {
        provider: 'openai',
        name: 'OpenAI',
        description: 'Leading AI models including GPT-4, GPT-4 Turbo, and GPT-3.5',
        models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
        defaultModel: 'gpt-4'
      },
      {
        provider: 'anthropic',
        name: 'Anthropic',
        description: 'Claude models with advanced reasoning and safety features',
        models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
        defaultModel: 'claude-3-5-sonnet-20241022'
      },
      {
        provider: 'google',
        name: 'Google AI',
        description: 'Gemini models with multimodal capabilities',
        models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
        defaultModel: 'gemini-1.5-pro'
      },
      {
        provider: 'perplexity',
        name: 'Perplexity',
        description: 'Search-augmented AI for research and fact-checking',
        models: ['llama-3.1-sonar-large-128k-online', 'llama-3.1-sonar-small-128k-online'],
        defaultModel: 'llama-3.1-sonar-large-128k-online'
      }
    ];
  }
}

export const aiProviderService = new AIProviderService();
export default aiProviderService;