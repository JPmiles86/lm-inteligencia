// Provider Store - Zustand state management for AI providers
import { create } from 'zustand';

interface Provider {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'perplexity';
  hasKey: boolean;
  active: boolean;
  lastTested?: string;
  testSuccess?: boolean;
  capabilities: {
    text: boolean;
    image: boolean;
    research: boolean;
  };
  models?: string[];
  defaultModel?: string;
  description?: string;
}

interface ProviderState {
  providers: Map<string, Provider>;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadProviders: () => Promise<void>;
  updateProvider: (provider: string, apiKey: string) => Promise<void>;
  testProvider: (provider: string) => Promise<boolean>;
  removeProvider: (provider: string) => Promise<void>;
  getAvailableProviders: (capability: 'text' | 'image' | 'research') => Provider[];
  selectProvider: (task: string, preferred?: string) => Provider | null;
}

export const useProviderStore = create<ProviderState>((set, get) => ({
  providers: new Map(),
  loading: false,
  error: null,
  
  loadProviders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/routes/provider');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const providerMap = new Map();
      
      // Define default provider info
      const defaultProviders = [
        {
          id: 'openai',
          name: 'OpenAI',
          provider: 'openai' as const,
          description: 'Leading AI models including GPT-4 and GPT-3.5',
          models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4', 'gpt-3.5-turbo'],
          defaultModel: 'gpt-4o',
          capabilities: { text: true, image: true, research: true },
          hasKey: false,
          active: false
        },
        {
          id: 'anthropic',
          name: 'Anthropic',
          provider: 'anthropic' as const,
          description: 'Claude models with advanced reasoning',
          models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
          defaultModel: 'claude-3-5-sonnet-20241022',
          capabilities: { text: true, image: false, research: true },
          hasKey: false,
          active: false
        },
        {
          id: 'google',
          name: 'Google AI',
          provider: 'google' as const,
          description: 'Gemini models with multimodal capabilities',
          models: ['gemini-1.5-pro-latest', 'gemini-1.5-flash-latest'],
          defaultModel: 'gemini-1.5-pro-latest',
          capabilities: { text: true, image: true, research: true },
          hasKey: false,
          active: false
        },
        {
          id: 'perplexity',
          name: 'Perplexity',
          provider: 'perplexity' as const,
          description: 'Search-augmented AI for research',
          models: ['llama-3.1-sonar-large-128k-online', 'llama-3.1-sonar-small-128k-online'],
          defaultModel: 'llama-3.1-sonar-large-128k-online',
          capabilities: { text: true, image: false, research: true },
          hasKey: false,
          active: false
        }
      ];

      // Merge with API data
      defaultProviders.forEach(defaultProvider => {
        const apiProvider = data.providers?.find((p: any) => p.provider === defaultProvider.provider);
        
        const provider: Provider = {
          ...defaultProvider,
          hasKey: apiProvider?.hasApiKey || false,
          active: apiProvider?.active || false,
          lastTested: apiProvider?.lastTested,
          testSuccess: apiProvider?.testSuccess
        };
        
        providerMap.set(provider.provider, provider);
      });
      
      set({ providers: providerMap, loading: false });
    } catch (error) {
      console.error('[ProviderStore] Error loading providers:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load providers',
        loading: false 
      });
    }
  },
  
  updateProvider: async (provider, apiKey) => {
    try {
      const response = await fetch(`/api/routes/provider/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update provider');
      }
      
      // Reload providers to get updated status
      await get().loadProviders();
    } catch (error) {
      console.error('[ProviderStore] Error updating provider:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update provider' });
      throw error;
    }
  },
  
  testProvider: async (provider) => {
    try {
      const response = await fetch(`/api/routes/provider/${provider}/test`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      // Update provider test status in store
      const providers = get().providers;
      const providerData = providers.get(provider);
      if (providerData) {
        providerData.lastTested = new Date().toISOString();
        providerData.testSuccess = result.success;
        set({ providers: new Map(providers) });
      }
      
      return result.success;
    } catch (error) {
      console.error('[ProviderStore] Error testing provider:', error);
      return false;
    }
  },
  
  removeProvider: async (provider) => {
    try {
      const response = await fetch(`/api/routes/provider/${provider}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to remove provider');
      }
      
      // Reload providers to get updated status
      await get().loadProviders();
    } catch (error) {
      console.error('[ProviderStore] Error removing provider:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to remove provider' });
      throw error;
    }
  },
  
  getAvailableProviders: (capability) => {
    const providers = Array.from(get().providers.values());
    return providers.filter(p => 
      p.hasKey && 
      p.active && 
      p.capabilities[capability]
    );
  },
  
  selectProvider: (task, preferred) => {
    const providers = get().providers;
    
    // Try preferred first
    if (preferred && providers.has(preferred)) {
      const provider = providers.get(preferred);
      if (provider?.hasKey && provider.active) {
        return provider;
      }
    }
    
    // Use fallback chain based on task type
    const fallbackChains = {
      research: ['perplexity', 'anthropic', 'google', 'openai'],
      writing: ['anthropic', 'openai', 'google'],
      image: ['google', 'openai'],
      creative: ['openai', 'anthropic', 'google'],
      technical: ['anthropic', 'openai', 'google'],
      analysis: ['anthropic', 'google', 'openai']
    };
    
    const chain = fallbackChains[task as keyof typeof fallbackChains] || fallbackChains.writing;
    
    for (const providerName of chain) {
      const provider = providers.get(providerName);
      if (provider?.hasKey && provider.active) {
        return provider;
      }
    }
    
    return null;
  }
}));