// Provider Settings Main Component - Comprehensive AI Provider Management Interface
import React, { useState, useEffect } from 'react';
import { Shield, Loader2, Key, AlertCircle, Brain, RefreshCw, Settings as SettingsIcon } from 'lucide-react';
import { ProviderCard } from './ProviderCard';
import { FallbackConfiguration } from './FallbackConfiguration';
import { useProviderStore } from '../../stores/providerStore';

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
  models: string[];
  defaultModel?: string;
  description: string;
}

export const ProviderSettings: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'providers' | 'fallback'>('providers');
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const {
    loadProviders: storeLoadProviders,
    error: storeError
  } = useProviderStore();
  
  // Load providers on mount
  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await storeLoadProviders();
      
      // Transform the store data into our UI format
      const defaultProviders = [
        {
          id: 'openai',
          name: 'OpenAI',
          provider: 'openai' as const,
          description: 'Leading AI models including GPT-4, GPT-4 Turbo, and GPT-3.5',
          models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4', 'gpt-3.5-turbo'],
          defaultModel: 'gpt-4o',
          capabilities: {
            text: true,
            image: true,
            research: true
          },
          hasKey: false,
          active: false
        },
        {
          id: 'anthropic',
          name: 'Anthropic',
          provider: 'anthropic' as const,
          description: 'Claude models with advanced reasoning and safety features',
          models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
          defaultModel: 'claude-3-5-sonnet-20241022',
          capabilities: {
            text: true,
            image: false,
            research: true
          },
          hasKey: false,
          active: false
        },
        {
          id: 'google',
          name: 'Google AI',
          provider: 'google' as const,
          description: 'Gemini models with multimodal capabilities',
          models: ['gemini-1.5-pro-latest', 'gemini-1.5-flash-latest', 'gemini-1.0-pro'],
          defaultModel: 'gemini-1.5-pro-latest',
          capabilities: {
            text: true,
            image: true,
            research: true
          },
          hasKey: false,
          active: false
        },
        {
          id: 'perplexity',
          name: 'Perplexity',
          provider: 'perplexity' as const,
          description: 'Search-augmented AI for research and fact-checking',
          models: ['llama-3.1-sonar-large-128k-online', 'llama-3.1-sonar-small-128k-online'],
          defaultModel: 'llama-3.1-sonar-large-128k-online',
          capabilities: {
            text: true,
            image: false,
            research: true
          },
          hasKey: false,
          active: false
        }
      ];

      // Get configured providers from API
      try {
        const response = await fetch('/api/providers-simple');
        const data = await response.json();
        
        if (response.ok && data.providers) {
          // Merge configured status with default providers
          const mergedProviders = defaultProviders.map(defaultProvider => {
            const configured = data.providers.find((p: any) => p.provider === defaultProvider.provider);
            if (configured) {
              return {
                ...defaultProvider,
                hasKey: configured.hasApiKey || false,
                active: configured.active || false,
                lastTested: configured.lastTested,
                testSuccess: configured.testSuccess
              };
            }
            return defaultProvider;
          });
          setProviders(mergedProviders);
        } else {
          setProviders(defaultProviders);
        }
      } catch (apiError) {
        console.warn('Failed to load provider configurations from API, using defaults:', apiError);
        setProviders(defaultProviders);
      }
    } catch (error) {
      console.error('Failed to load providers:', error);
      setError(error instanceof Error ? error.message : 'Failed to load providers');
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProvider = async (provider: string, apiKey: string) => {
    try {
      const response = await fetch(`/api/provider-save-simple?provider=${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save API key');
      }

      // Reload providers to get updated status
      await loadProviders();
      showNotification('API key saved and encrypted successfully!', 'success');
    } catch (error) {
      console.error('Failed to update provider:', error);
      showNotification(error instanceof Error ? error.message : 'Failed to save API key', 'error');
      throw error;
    }
  };

  const handleTestProvider = async (provider: string) => {
    setTestingProvider(provider);
    
    try {
      const response = await fetch(`/api/provider-save-simple?provider=${provider}&test=true`, {
        method: 'GET'
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        showNotification(`${provider} connection test successful!`, 'success');
        await loadProviders(); // Reload to update test status
      } else {
        showNotification(`${provider} connection test failed: ${result.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Test failed:', error);
      showNotification(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setTestingProvider(null);
    }
  };

  const handleRemoveProvider = async (provider: string) => {
    if (!confirm(`Are you sure you want to remove the ${provider} configuration? This will delete the API key permanently.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/routes/provider/${provider}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to remove provider');
      }

      await loadProviders();
      showNotification(`${provider} configuration removed successfully!`, 'success');
    } catch (error) {
      console.error('Failed to remove provider:', error);
      showNotification(error instanceof Error ? error.message : 'Failed to remove provider', 'error');
      throw error;
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const icon = type === 'success' ? 
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>' :
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';

    notification.className = `fixed top-20 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 max-w-md`;
    notification.innerHTML = `
      <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        ${icon}
      </svg>
      <span class="text-sm">${message}</span>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
  };

  const getOverallStatus = () => {
    const configuredCount = providers.filter(p => p.hasKey).length;
    const connectedCount = providers.filter(p => p.testSuccess).length;
    
    return {
      configured: configuredCount,
      connected: connectedCount,
      total: providers.length
    };
  };

  const status = getOverallStatus();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
        <span className="text-gray-500">Loading provider configurations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Provider Settings</h2>
            <p className="text-gray-600">Manage API keys and configurations for AI providers</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={loadProviders}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('providers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'providers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4" />
              <span>API Keys</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('fallback')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'fallback'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <SettingsIcon className="w-4 h-4" />
              <span>Fallback Configuration</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Status Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="font-medium text-gray-900">Provider Status</h3>
              <p className="text-sm text-gray-600">
                {status.configured} of {status.total} providers configured, {status.connected} tested successfully
              </p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{status.configured}</div>
              <div className="text-xs text-gray-500">Configured</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{status.connected}</div>
              <div className="text-xs text-gray-500">Connected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {(error || storeError) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-800">{error || storeError}</span>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'providers' ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Available Providers</h3>
          
          {providers.length > 0 ? (
            <div className="space-y-4">
              {providers.map((provider) => (
                <ProviderCard
                  key={provider.provider}
                  provider={provider}
                  onUpdate={handleUpdateProvider}
                  onTest={handleTestProvider}
                  onRemove={handleRemoveProvider}
                  isTesting={testingProvider === provider.provider}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No providers available
            </div>
          )}
        </div>
      ) : (
        <FallbackConfiguration />
      )}

      {/* Important Notes */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Security & Important Notes</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• API keys are securely encrypted using AES-256-GCM before storage</li>
          <li>• Keys are never displayed in full or sent to the frontend in plain text</li>
          <li>• Test connections before saving to ensure your keys work correctly</li>
          <li>• Different providers offer different capabilities - configure multiple for best results</li>
          <li>• API usage and costs vary by provider - monitor your provider dashboards for billing</li>
          <li>• Fallback chains ensure system reliability when your preferred provider is unavailable</li>
        </ul>
      </div>

      {/* Last Refresh */}
      <div className="text-xs text-gray-400 text-center">
        Last refreshed: {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default ProviderSettings;