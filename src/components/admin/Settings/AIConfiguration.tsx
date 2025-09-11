// AI Configuration Component - Main interface for managing AI providers
import React, { useState, useEffect } from 'react';
import { Brain, RefreshCw, AlertCircle, Settings as SettingsIcon } from 'lucide-react';
import { ProviderKeyManager } from './ProviderKeyManager.js';
import { aiProviderService, ProviderInfo, TestConnectionResult } from '../../../services/aiProviderService.js';

export const AIConfiguration: React.FC = () => {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load providers on component mount
  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get configured providers from API
      const configuredProviders = await aiProviderService.getProviders();
      
      // Get default provider info for any that aren't configured
      const defaultProviders = aiProviderService.getDefaultProviders();
      
      // Merge configured and default providers
      const mergedProviders = defaultProviders.map(defaultProvider => {
        const configured = configuredProviders.find(p => p.provider === defaultProvider.provider);
        return configured ? { ...defaultProvider, ...configured } : defaultProvider;
      });
      
      setProviders(mergedProviders);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('[AIConfiguration] Error loading providers:', error);
      setError('Failed to load AI provider configurations. Using defaults.');
      
      // Fallback to default providers if API fails
      setProviders(aiProviderService.getDefaultProviders());
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProvider = async (providerName: string, apiKey: string) => {
    try {
      await aiProviderService.configureProvider({
        provider: providerName,
        apiKey,
        defaultModel: providers.find(p => p.provider === providerName)?.defaultModel
      });
      
      // Reload providers to get updated status
      await loadProviders();
      
      // Show success notification
      showNotification('API key saved successfully!', 'success');
    } catch (error) {
      console.error('[AIConfiguration] Error saving provider:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save API key';
      throw new Error(errorMessage);
    }
  };

  const handleTestConnection = async (
    providerName: string, 
    apiKey: string, 
    model?: string
  ): Promise<TestConnectionResult> => {
    try {
      return await aiProviderService.testConnection(providerName, apiKey, model);
    } catch (error) {
      console.error('[AIConfiguration] Error testing connection:', error);
      throw error;
    }
  };

  const handleDeleteProvider = async (providerName: string) => {
    try {
      await aiProviderService.deleteProvider(providerName);
      
      // Reload providers to get updated status
      await loadProviders();
      
      // Show success notification
      showNotification('Provider configuration deleted successfully!', 'success');
    } catch (error) {
      console.error('[AIConfiguration] Error deleting provider:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete provider configuration';
      throw new Error(errorMessage);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const icon = type === 'success' ? 
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>' :
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';

    notification.className = `fixed top-20 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2`;
    notification.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        ${icon}
      </svg>
      ${message}
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
  };

  const getOverallStatus = () => {
    const configuredCount = providers.filter(p => p.apiKey === '[CONFIGURED]').length;
    const connectedCount = providers.filter(p => p.testSuccess).length;
    
    return {
      configured: configuredCount,
      connected: connectedCount,
      total: providers.length
    };
  };

  const status = getOverallStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading AI configurations...</span>
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
            <h2 className="text-2xl font-bold text-gray-900">AI Configuration</h2>
            <p className="text-gray-600">Manage API keys and settings for AI providers</p>
          </div>
        </div>
        
        <button
          onClick={loadProviders}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Status Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <SettingsIcon className="w-6 h-6 text-blue-600" />
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
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-800">{error}</span>
          </div>
        </div>
      )}

      {/* Provider List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Available Providers</h3>
        
        {providers.map((provider) => (
          <ProviderKeyManager
            key={provider.provider}
            provider={provider}
            onSave={handleSaveProvider}
            onTest={handleTestConnection}
            onDelete={handleDeleteProvider}
          />
        ))}
      </div>

      {/* Important Notes */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Important Notes</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• API keys are securely encrypted before storage</li>
          <li>• Keys are only used for AI generation requests and are never displayed in full</li>
          <li>• Test connections before saving to ensure your keys work correctly</li>
          <li>• Different providers offer different capabilities - configure multiple for best results</li>
          <li>• API usage and costs vary by provider - check your provider dashboards for billing</li>
        </ul>
      </div>

      {/* Last Refresh */}
      <div className="text-xs text-gray-400 text-center">
        Last refreshed: {lastRefresh.toLocaleString()}
      </div>
    </div>
  );
};

export default AIConfiguration;