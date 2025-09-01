// Provider Card Component - Individual provider management interface
import React, { useState } from 'react';
import { 
  Shield, CheckCircle, XCircle, Eye, EyeOff, Key, TestTube, 
  Loader2, AlertCircle, Brain, Zap, Search, Camera 
} from 'lucide-react';

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
  description: string;
}

interface ProviderCardProps {
  provider: Provider;
  onUpdate: (provider: string, apiKey: string) => Promise<void>;
  onTest: (provider: string) => Promise<void>;
  onRemove: (provider: string) => Promise<void>;
  isTesting?: boolean;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onUpdate,
  onTest,
  onRemove,
  isTesting = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProviderIcon = (provider: string) => {
    const iconClass = "w-8 h-8";
    
    switch (provider) {
      case 'openai':
        return <div className={`${iconClass} bg-green-100 rounded-lg flex items-center justify-center`}>
          <Brain className="w-5 h-5 text-green-600" />
        </div>;
      case 'anthropic':
        return <div className={`${iconClass} bg-purple-100 rounded-lg flex items-center justify-center`}>
          <Shield className="w-5 h-5 text-purple-600" />
        </div>;
      case 'google':
        return <div className={`${iconClass} bg-blue-100 rounded-lg flex items-center justify-center`}>
          <Zap className="w-5 h-5 text-blue-600" />
        </div>;
      case 'perplexity':
        return <div className={`${iconClass} bg-orange-100 rounded-lg flex items-center justify-center`}>
          <Search className="w-5 h-5 text-orange-600" />
        </div>;
      default:
        return <div className={`${iconClass} bg-gray-100 rounded-lg flex items-center justify-center`}>
          <Key className="w-5 h-5 text-gray-600" />
        </div>;
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onUpdate(provider.provider, apiKey.trim());
      setApiKey('');
      setIsEditing(false);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save API key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setApiKey('');
    setError(null);
    setShowKey(false);
  };

  const handleTest = async () => {
    setError(null);
    try {
      await onTest(provider.provider);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Test failed');
    }
  };

  const handleRemove = async () => {
    setError(null);
    try {
      await onRemove(provider.provider);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to remove provider');
    }
  };

  const getStatusIndicator = () => {
    if (provider.lastTested && provider.testSuccess) {
      return (
        <div title="Connection verified">
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>
      );
    } else if (provider.lastTested && !provider.testSuccess) {
      return (
        <div title="Connection failed">
          <XCircle className="h-5 w-5 text-red-500" />
        </div>
      );
    } else if (provider.hasKey) {
      return (
        <div title="Not tested">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
        </div>
      );
    }
    return (
      <div title="Not configured">
        <XCircle className="h-5 w-5 text-gray-400" />
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Provider Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getProviderIcon(provider.provider)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
              <p className="text-sm text-gray-500">{provider.description}</p>
            </div>
          </div>
          {getStatusIndicator()}
        </div>
        
        {/* Capabilities badges */}
        <div className="flex gap-2 mb-4">
          {provider.capabilities.text && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
              <Brain className="w-3 h-3 inline mr-1" />
              Text Generation
            </span>
          )}
          {provider.capabilities.image && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
              <Camera className="w-3 h-3 inline mr-1" />
              Image Generation
            </span>
          )}
          {provider.capabilities.research && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
              <Search className="w-3 h-3 inline mr-1" />
              Research
            </span>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center space-x-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-800">{error}</span>
            </div>
          </div>
        )}
        
        {/* API Key input/display */}
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter API key..."
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {provider.hasKey && (
                <p className="mt-1 text-xs text-gray-500">
                  Current key is configured. Enter a new key to update.
                </p>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={!apiKey.trim() || isLoading}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Key className="w-4 h-4" />
                )}
                <span>{isLoading ? 'Saving...' : 'Save Key'}</span>
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              {provider.hasKey ? (
                <>
                  <button
                    onClick={handleTest}
                    disabled={isTesting}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {isTesting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4" />
                    )}
                    <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                  >
                    <Key className="w-4 h-4" />
                    <span>Update Key</span>
                  </button>
                  <button
                    onClick={handleRemove}
                    className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Remove</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  <Key className="w-4 h-4" />
                  <span>Add API Key</span>
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Test results */}
        {provider.lastTested && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm">
              <span className="text-gray-500">Last tested: </span>
              <span className="text-gray-700">
                {new Date(provider.lastTested).toLocaleString()}
              </span>
              {provider.testSuccess ? (
                <span className="text-green-600 ml-2 font-medium">✓ Success</span>
              ) : (
                <span className="text-red-600 ml-2 font-medium">✗ Failed</span>
              )}
            </div>
          </div>
        )}

        {/* Model Information */}
        {provider.models && provider.models.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm">
              <span className="text-gray-500">Available Models: </span>
              <span className="text-gray-700">
                {provider.models.slice(0, 3).join(', ')}
                {provider.models.length > 3 && ` +${provider.models.length - 3} more`}
              </span>
              {provider.defaultModel && (
                <div className="mt-1">
                  <span className="text-gray-500">Default: </span>
                  <span className="text-blue-600 font-medium">{provider.defaultModel}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderCard;