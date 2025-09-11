import React, { useState, useEffect } from 'react';
import { Check, X, Loader2, Eye, EyeOff, TestTube, Save } from 'lucide-react';
import { generationService } from '../../services/api/generation.service.js';

interface ProviderSetup {
  name: string;
  displayName: string;
  configured: boolean;
  apiKey: string;
  showKey: boolean;
  testing: boolean;
  testResult: boolean | null;
  placeholder: string;
  helpUrl: string;
  required: boolean;
}

export const APIKeySetup: React.FC = () => {
  const [providers, setProviders] = useState<ProviderSetup[]>([
    {
      name: 'openai',
      displayName: 'OpenAI',
      configured: false,
      apiKey: '',
      showKey: false,
      testing: false,
      testResult: null,
      placeholder: 'sk-...',
      helpUrl: 'https://platform.openai.com/api-keys',
      required: true,
    },
    {
      name: 'anthropic',
      displayName: 'Anthropic (Claude)',
      configured: false,
      apiKey: '',
      showKey: false,
      testing: false,
      testResult: null,
      placeholder: 'sk-ant-...',
      helpUrl: 'https://console.anthropic.com/account/keys',
      required: false,
    },
    {
      name: 'google',
      displayName: 'Google AI (Gemini)',
      configured: false,
      apiKey: '',
      showKey: false,
      testing: false,
      testResult: null,
      placeholder: 'AIza...',
      helpUrl: 'https://makersuite.google.com/app/apikey',
      required: false,
    },
    {
      name: 'perplexity',
      displayName: 'Perplexity',
      configured: false,
      apiKey: '',
      showKey: false,
      testing: false,
      testResult: null,
      placeholder: 'pplx-...',
      helpUrl: 'https://docs.perplexity.ai/docs/getting-started',
      required: false,
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadExistingProviders();
  }, []);

  const loadExistingProviders = async () => {
    const result = await generationService.getProviders();
    if (result.success && result.providers) {
      setProviders(prev => prev.map(p => {
        const existing = result.providers?.find(ep => ep.name === p.name);
        return {
          ...p,
          configured: !!existing,
        };
      }));
    }
  };

  const updateProvider = (name: string, field: keyof ProviderSetup, value: any) => {
    setProviders(prev => prev.map(p => 
      p.name === name ? { ...p, [field]: value } : p
    ));
  };

  const testProvider = async (name: string) => {
    const provider = providers.find(p => p.name === name);
    if (!provider || !provider.apiKey) return;

    updateProvider(name, 'testing', true);
    updateProvider(name, 'testResult', null);

    // First save the key
    const configResult = await generationService.configureProvider({
      provider: name,
      apiKey: provider.apiKey,
    });

    if (configResult.success) {
      // Then test it
      const testResult = await generationService.testProvider(name);
      updateProvider(name, 'testResult', testResult.isValid);
      updateProvider(name, 'configured', testResult.isValid);
    } else {
      updateProvider(name, 'testResult', false);
    }

    updateProvider(name, 'testing', false);
  };

  const saveAllProviders = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const configuredProviders = providers.filter(p => p.apiKey);
      
      for (const provider of configuredProviders) {
        await generationService.configureProvider({
          provider: provider.name,
          apiKey: provider.apiKey,
        });
      }

      setMessage({ type: 'success', text: 'All API keys saved successfully!' });
      loadExistingProviders();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save API keys' });
    } finally {
      setSaving(false);
    }
  };

  const hasRequiredKeys = providers.filter(p => p.required).every(p => p.configured);
  const hasAnyKeys = providers.some(p => p.apiKey);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">API Key Setup</h2>
          <p className="mt-2 text-gray-600">
            Configure your AI provider API keys. Your keys are encrypted and stored securely.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {providers.map(provider => (
            <div key={provider.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {provider.displayName}
                  </h3>
                  {provider.required && (
                    <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded">
                      Required
                    </span>
                  )}
                  {provider.configured && (
                    <span className="px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded">
                      Configured
                    </span>
                  )}
                </div>
                <a
                  href={provider.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Get API Key →
                </a>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type={provider.showKey ? 'text' : 'password'}
                      value={provider.apiKey}
                      onChange={(e) => updateProvider(provider.name, 'apiKey', e.target.value)}
                      placeholder={provider.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => updateProvider(provider.name, 'showKey', !provider.showKey)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {provider.showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  <button
                    onClick={() => testProvider(provider.name)}
                    disabled={!provider.apiKey || provider.testing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {provider.testing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Testing...</span>
                      </>
                    ) : (
                      <>
                        <TestTube size={16} />
                        <span>Test</span>
                      </>
                    )}
                  </button>
                </div>

                {provider.testResult !== null && (
                  <div className={`flex items-center space-x-2 text-sm ${
                    provider.testResult ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {provider.testResult ? (
                      <>
                        <Check size={16} />
                        <span>API key is valid and working!</span>
                      </>
                    ) : (
                      <>
                        <X size={16} />
                        <span>API key test failed. Please check your key.</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {!hasRequiredKeys && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ OpenAI API key is required for basic functionality. Other providers are optional for fallback support.
              </p>
            </div>
          )}

          {message && (
            <div className={`p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={saveAllProviders}
              disabled={!hasAnyKeys || saving}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save All Keys</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t">
          <h4 className="font-semibold text-gray-900 mb-2">Security Note:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Your API keys are encrypted before storage</li>
            <li>• Keys are never exposed to the frontend after saving</li>
            <li>• All AI API calls are made from our secure backend</li>
            <li>• You can update or remove keys at any time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};