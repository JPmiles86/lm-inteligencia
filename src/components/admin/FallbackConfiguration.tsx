// Fallback Configuration Component - Provider fallback chain management
import React, { useState } from 'react';
import { Settings, ArrowRight, Info, Shield, Brain, Zap, Search } from 'lucide-react';

interface FallbackConfig {
  task: string;
  chain: string[];
  description: string;
}

export const FallbackConfiguration: React.FC = () => {
  const [configs] = useState<FallbackConfig[]>([
    { 
      task: 'research', 
      chain: ['perplexity', 'anthropic', 'google', 'openai'],
      description: 'For research, fact-checking, and information gathering tasks'
    },
    { 
      task: 'writing', 
      chain: ['anthropic', 'openai', 'google'],
      description: 'For content creation, blog posts, and creative writing'
    },
    { 
      task: 'image', 
      chain: ['google', 'openai'],
      description: 'For image generation and visual content creation'
    },
    { 
      task: 'creative', 
      chain: ['openai', 'anthropic', 'google'],
      description: 'For creative ideation, brainstorming, and innovation'
    },
    { 
      task: 'technical', 
      chain: ['anthropic', 'openai', 'google'],
      description: 'For technical documentation and code-related tasks'
    },
    { 
      task: 'analysis', 
      chain: ['anthropic', 'google', 'openai'],
      description: 'For data analysis and detailed reasoning tasks'
    }
  ]);

  const getProviderInfo = (provider: string) => {
    const providerMap = {
      openai: { name: 'OpenAI', icon: Brain, color: 'green' },
      anthropic: { name: 'Anthropic', icon: Shield, color: 'purple' },
      google: { name: 'Google AI', icon: Zap, color: 'blue' },
      perplexity: { name: 'Perplexity', icon: Search, color: 'orange' }
    };
    
    return providerMap[provider as keyof typeof providerMap] || { 
      name: provider, 
      icon: Brain, 
      color: 'gray' 
    };
  };

  const getColorClass = (color: string, type: 'bg' | 'text' | 'border') => {
    const colorMap = {
      green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
      gray: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
    };
    
    return colorMap[color as keyof typeof colorMap]?.[type] || colorMap.gray[type];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Settings className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Fallback Configuration</h3>
          <p className="text-sm text-gray-600">
            Configure the order in which providers are tried when your preferred provider is unavailable
          </p>
        </div>
      </div>

      {/* Information Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-blue-800 font-medium mb-1">How Fallback Chains Work</p>
            <p className="text-blue-700">
              When a task is requested, the system will try providers in order from left to right. 
              If the first provider is unavailable or fails, it automatically tries the next one 
              in the chain until it finds a working provider.
            </p>
          </div>
        </div>
      </div>

      {/* Fallback Chains */}
      <div className="space-y-4">
        {configs.map((config) => (
          <div key={config.task} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="mb-4">
              <h4 className="text-lg font-medium text-gray-900 capitalize mb-1">
                {config.task} Tasks
              </h4>
              <p className="text-sm text-gray-600">{config.description}</p>
            </div>
            
            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
              {config.chain.map((provider, index) => {
                const providerInfo = getProviderInfo(provider);
                const IconComponent = providerInfo.icon;
                
                return (
                  <React.Fragment key={provider}>
                    {/* Provider Card */}
                    <div className={`
                      flex items-center space-x-2 px-3 py-2 rounded-lg border
                      ${getColorClass(providerInfo.color, 'bg')}
                      ${getColorClass(providerInfo.color, 'text')}
                      ${getColorClass(providerInfo.color, 'border')}
                    `}>
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm font-medium">{providerInfo.name}</span>
                      <span className="text-xs opacity-75">#{index + 1}</span>
                    </div>
                    
                    {/* Arrow */}
                    {index < config.chain.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            
            {/* Priority explanation */}
            <div className="mt-3 text-xs text-gray-500">
              <span className="font-medium">Priority Order:</span> Higher priority providers are tried first. 
              If they're unavailable, the system automatically falls back to the next available provider.
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Notes */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-amber-800 font-medium mb-2">Configuration Notes</p>
            <ul className="text-amber-700 space-y-1">
              <li>• Fallback chains are automatically managed by the system</li>
              <li>• Only providers with valid API keys will be used in fallback chains</li>
              <li>• The system will skip providers that are disabled or have failed recent tests</li>
              <li>• Different task types use different fallback priorities based on provider strengths</li>
              <li>• Configure at least one provider in each chain to ensure system reliability</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Provider Capabilities Matrix */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Provider Capabilities Matrix</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-4 font-medium text-gray-900">Provider</th>
                <th className="text-center py-2 px-4 font-medium text-gray-900">Text</th>
                <th className="text-center py-2 px-4 font-medium text-gray-900">Images</th>
                <th className="text-center py-2 px-4 font-medium text-gray-900">Research</th>
                <th className="text-left py-2 px-4 font-medium text-gray-900">Best For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-green-600" />
                    <span className="font-medium">OpenAI</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">Creative writing, general tasks</td>
              </tr>
              <tr>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">Anthropic</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-block w-2 h-2 bg-gray-300 rounded-full"></span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">Analysis, reasoning, safety</td>
              </tr>
              <tr>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Google AI</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">Multimodal, fast processing</td>
              </tr>
              <tr>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-orange-600" />
                    <span className="font-medium">Perplexity</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-block w-2 h-2 bg-gray-300 rounded-full"></span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">Research, real-time data</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Supported</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 bg-gray-300 rounded-full"></span>
            <span>Not Available</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FallbackConfiguration;