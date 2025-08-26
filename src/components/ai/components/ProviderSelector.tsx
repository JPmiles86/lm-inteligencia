// Provider Selector Component - Dropdown for selecting AI providers and models
// Displays current usage, model options, and provider status

import React, { useState } from 'react';
import { useAIStore } from '../../../store/aiStore';
import { 
  ChevronDown, 
  Check, 
  AlertTriangle, 
  Zap, 
  Activity,
  Settings,
  ExternalLink,
} from 'lucide-react';

export const ProviderSelector: React.FC = () => {
  const {
    providers,
    activeProvider,
    activeModel,
    setActiveProvider,
    setActiveModel,
    // addNotification, // Unused - preserved for future use
  } = useAIStore();

  const [isOpen, setIsOpen] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);

  // Get current provider data
  const currentProvider = providers[activeProvider];
  const currentModel = currentProvider?.models?.find(m => m.id === activeModel);

  // Handle provider change
  const handleProviderChange = (providerName: string) => {
    setActiveProvider(providerName);
    const provider = providers[providerName];
    if (provider?.defaultModel) {
      setActiveModel(provider.defaultModel);
    } else if (provider?.models?.[0]) {
      setActiveModel(provider.models[0].id);
    }
    
    addNotification({
      type: 'info',
      title: 'Provider Changed',
      message: `Switched to ${providerName}`,
      duration: 2000,
    });
    
    setIsOpen(false);
  };

  // Handle model change
  const handleModelChange = (modelId: string) => {
    setActiveModel(modelId);
    const model = currentProvider?.models?.find(m => m.id === modelId);
    
    addNotification({
      type: 'info',
      title: 'Model Changed',
      message: `Switched to ${model?.name || modelId}`,
      duration: 2000,
    });
    
    setShowModelSelector(false);
  };

  // Get provider icon
  const getProviderIcon = (providerName: string) => {
    switch (providerName) {
      case 'openai':
        return '🤖';
      case 'anthropic':
        return '🧠';
      case 'google':
        return '🌟';
      case 'perplexity':
        return '🔍';
      default:
        return '⚡';
    }
  };

  // Get provider color
  const getProviderColor = (providerName: string) => {
    switch (providerName) {
      case 'openai':
        return 'text-green-600 bg-green-50';
      case 'anthropic':
        return 'text-purple-600 bg-purple-50';
      case 'google':
        return 'text-blue-600 bg-blue-50';
      case 'perplexity':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Calculate usage percentage
  const getUsagePercentage = (provider: any) => {
    if (!provider.usageLimit) return 0;
    return Math.min((provider.currentUsage / provider.usageLimit) * 100, 100);
  };

  // Get usage color
  const getUsageColor = (percentage: number) => {
    if (percentage > 90) return 'text-red-500';
    if (percentage > 75) return 'text-orange-500';
    if (percentage > 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="relative">
      {/* Main Provider Selector */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="text-lg">{getProviderIcon(activeProvider)}</span>
          <div className="text-left min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white capitalize truncate">
              {activeProvider}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {currentModel?.name || activeModel}
            </p>
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Usage Indicator */}
        {currentProvider?.usageLimit && (
          <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b">
            <div
              className={`h-full rounded-b transition-all ${
                getUsagePercentage(currentProvider) > 90
                  ? 'bg-red-500'
                  : getUsagePercentage(currentProvider) > 75
                  ? 'bg-orange-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${getUsagePercentage(currentProvider)}%` }}
            />
          </div>
        )}
      </div>

      {/* Provider Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                AI Providers
              </h3>
              <div className="space-y-1">
                {Object.entries(providers).map(([name, provider]) => (
                  <button
                    key={name}
                    onClick={() => handleProviderChange(name)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      activeProvider === name ? 'bg-blue-50 dark:bg-blue-900' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getProviderIcon(name)}</span>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {provider.models?.length || 0} models
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Usage indicator */}
                      {provider.usageLimit && (
                        <div className="flex items-center space-x-1">
                          <Activity className={`h-3 w-3 ${getUsageColor(getUsagePercentage(provider))}`} />
                          <span className={`text-xs ${getUsageColor(getUsagePercentage(provider))}`}>
                            {getUsagePercentage(provider).toFixed(0)}%
                          </span>
                        </div>
                      )}
                      
                      {/* Status indicator */}
                      {provider.active ? (
                        <Zap className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                      )}
                      
                      {/* Selected indicator */}
                      {activeProvider === name && (
                        <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Provider Details */}
            {currentProvider && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Current: {activeProvider}
                  </h4>
                  <button
                    onClick={() => setShowModelSelector(true)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Change Model
                  </button>
                </div>
                
                {/* Usage Details */}
                {currentProvider.usageLimit && (
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Usage</span>
                      <span>
                        ${currentProvider.currentUsage.toFixed(2)} / ${currentProvider.usageLimit.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          getUsagePercentage(currentProvider) > 90
                            ? 'bg-red-500'
                            : getUsagePercentage(currentProvider) > 75
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${getUsagePercentage(currentProvider)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Current Model */}
                {currentModel && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <p><strong>Model:</strong> {currentModel.name}</p>
                    <p><strong>Context:</strong> {currentModel.contextWindow.toLocaleString()} tokens</p>
                    <p><strong>Pricing:</strong> ${(currentModel.pricing.input * 1000).toFixed(3)}/1K input, ${(currentModel.pricing.output * 1000).toFixed(3)}/1K output</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // TODO: Open settings modal
                }}
                className="w-full flex items-center justify-center space-x-1 p-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Settings className="h-3 w-3" />
                <span>Manage Providers</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Model Selector Modal */}
      {showModelSelector && currentProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Select Model - {activeProvider}
              </h3>
            </div>
            
            <div className="p-4 space-y-2">
              {currentProvider.models?.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelChange(model.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    activeModel === model.id
                      ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {model.name}
                    </h4>
                    {activeModel === model.id && (
                      <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {model.contextWindow.toLocaleString()} tokens • ${(model.pricing.input * 1000).toFixed(3)}/1K in • ${(model.pricing.output * 1000).toFixed(3)}/1K out
                  </p>
                  
                  {model.bestFor.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {model.bestFor.slice(0, 3).map((use) => (
                        <span
                          key={use}
                          className="inline-block px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                        >
                          {use}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowModelSelector(false)}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};