// Provider Key Manager Component - Secure API key management interface
import React, { useState } from 'react';
import { Eye, EyeOff, Key, TestTube, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import { ProviderInfo, TestConnectionResult } from '../../../services/aiProviderService.js';

interface ProviderKeyManagerProps {
  provider: ProviderInfo;
  onSave: (provider: string, apiKey: string) => Promise<void>;
  onTest: (provider: string, apiKey: string, model?: string) => Promise<TestConnectionResult>;
  onDelete: (provider: string) => Promise<void>;
}

export const ProviderKeyManager: React.FC<ProviderKeyManagerProps> = ({
  provider,
  onSave,
  onTest,
  onDelete
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState(provider.defaultModel || provider.models[0] || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestConnectionResult | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isConfigured = provider.apiKey === '[CONFIGURED]';
  const hasKey = apiKey.trim().length > 0;

  const handleSave = async () => {
    if (!hasKey) {
      setSaveError('API key is required');
      return;
    }

    setIsLoading(true);
    setSaveError(null);

    try {
      await onSave(provider.provider, apiKey);
      setApiKey('');
      setIsExpanded(false);
      setTestResult(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save API key';
      setSaveError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!hasKey) {
      setSaveError('API key is required for testing');
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    setSaveError(null);

    try {
      const result = await onTest(provider.provider, apiKey, selectedModel);
      setTestResult(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection test failed';
      setTestResult({
        success: false,
        message: errorMessage,
        provider: provider.provider,
        model: selectedModel,
        error: errorMessage
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the ${provider.name} configuration? This action cannot be undone.`)) {
      setIsLoading(true);
      try {
        await onDelete(provider.provider);
        setApiKey('');
        setIsExpanded(false);
        setTestResult(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete provider';
        setSaveError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getStatusIcon = () => {
    if (provider.lastTested && provider.testSuccess) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (provider.lastTested && !provider.testSuccess) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    } else if (isConfigured) {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
    return <Key className="w-5 h-5 text-gray-400" />;
  };

  const getStatusText = () => {
    if (provider.lastTested && provider.testSuccess) {
      return 'Connected';
    } else if (provider.lastTested && !provider.testSuccess) {
      return 'Connection Failed';
    } else if (isConfigured) {
      return 'Configured (Not Tested)';
    }
    return 'Not Configured';
  };

  const getStatusColor = () => {
    if (provider.lastTested && provider.testSuccess) {
      return 'text-green-600';
    } else if (provider.lastTested && !provider.testSuccess) {
      return 'text-red-600';
    } else if (isConfigured) {
      return 'text-yellow-600';
    }
    return 'text-gray-500';
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Provider Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h3 className="text-lg font-medium text-gray-900">{provider.name}</h3>
              <p className="text-sm text-gray-600">{provider.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none"
            >
              {isExpanded ? 'Collapse' : 'Configure'}
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      {isExpanded && (
        <div className="p-4 bg-white">
          <div className="space-y-4">
            {/* API Key Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={isConfigured ? 'Enter new API key to update...' : 'Enter your API key...'}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isConfigured && (
                <p className="mt-1 text-xs text-gray-500">
                  Current key is configured. Enter a new key to update.
                </p>
              )}
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {provider.models.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            {/* Test Result */}
            {testResult && (
              <div className={`p-3 rounded-md ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center space-x-2">
                  {testResult.success ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {testResult.message}
                  </span>
                </div>
                {testResult.latency && (
                  <p className="text-xs text-green-600 mt-1">
                    Response time: {testResult.latency}ms
                  </p>
                )}
              </div>
            )}

            {/* Error Display */}
            {saveError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-800">{saveError}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  onClick={handleTest}
                  disabled={!hasKey || isTesting || isLoading}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed focus:outline-none"
                >
                  {isTesting ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <TestTube className="w-4 h-4" />
                  )}
                  <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                </button>

                <button
                  onClick={handleSave}
                  disabled={!hasKey || isLoading || isTesting}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4" />
                  )}
                  <span>{isLoading ? 'Saving...' : 'Save Configuration'}</span>
                </button>
              </div>

              {isConfigured && (
                <button
                  onClick={handleDelete}
                  disabled={isLoading || isTesting}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed focus:outline-none"
                >
                  Delete Configuration
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderKeyManager;