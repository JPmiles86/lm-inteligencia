// Simplified Settings Page Component - Content Visibility and AI Configuration
import React, { useState } from 'react';
import { VerticalVisibilitySettings } from './shared/VerticalVisibilitySettings';
import { ProviderSettings } from './ProviderSettings';
import { APIKeySetup } from '../setup/APIKeySetup';
import { Settings as SettingsIcon, Brain, Key, Layers } from 'lucide-react';

type SettingsTab = 'verticals' | 'ai' | 'apikeys';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('apikeys');
  
  const tabs = [
    {
      id: 'apikeys' as SettingsTab,
      label: 'API Keys',
      icon: Key,
      description: 'Add and manage your AI provider API keys'
    },
    {
      id: 'ai' as SettingsTab,
      label: 'Provider Settings',
      icon: Brain,
      description: 'Configure AI provider preferences and fallback'
    },
    {
      id: 'verticals' as SettingsTab,
      label: 'Vertical Visibility',
      icon: Layers,
      description: 'Control section visibility for each industry vertical'
    }
  ];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <SettingsIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your application settings and configuration</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          {activeTab === 'apikeys' && (
            <div className="p-6">
              <APIKeySetup />
            </div>
          )}
          
          {activeTab === 'verticals' && (
            <div className="p-6">
              <VerticalVisibilitySettings />
            </div>
          )}
          
          {activeTab === 'ai' && (
            <div className="p-6">
              <ProviderSettings />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;