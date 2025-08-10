// Site Customization - Main component for managing site appearance and settings

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandingPanel } from './BrandingPanel';
import { TypographyPanel } from './TypographyPanel';
import { ContactSettings } from './ContactSettings';
import { customizationService } from '../../../services/customizationService';

type CustomizationView = 'branding' | 'typography' | 'contact' | 'layout' | 'advanced';

export const SiteCustomization: React.FC = () => {
  const [currentView, setCurrentView] = useState<CustomizationView>('branding');

  // Apply current customization on component mount
  useEffect(() => {
    const customization = customizationService.getCustomization();
    customizationService.applyCustomization(customization);
  }, []);

  const handleUpdate = () => {
    // Force a re-render by updating the view
    const customization = customizationService.getCustomization();
    customizationService.applyCustomization(customization);
  };

  const handleExportSettings = () => {
    try {
      const settings = customizationService.exportSettings();
      const blob = new Blob([settings], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inteligencia_customization_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting settings:', error);
      alert('Failed to export settings');
    }
  };

  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            customizationService.importSettings(content);
            handleUpdate();
            alert('Settings imported successfully!');
          } catch (error) {
            console.error('Error importing settings:', error);
            alert('Failed to import settings. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  };

  const handleResetAll = () => {
    if (window.confirm('Are you sure you want to reset ALL customization settings to defaults? This cannot be undone.')) {
      customizationService.resetToDefaults();
      handleUpdate();
      alert('All settings have been reset to defaults.');
    }
  };

  const navigationItems = [
    {
      id: 'branding' as CustomizationView,
      label: 'Branding',
      icon: '🎨',
      description: 'Colors, logos, and brand identity'
    },
    {
      id: 'typography' as CustomizationView,
      label: 'Typography',
      icon: '📝',
      description: 'Fonts, sizes, and text styling'
    },
    {
      id: 'contact' as CustomizationView,
      label: 'Contact Info',
      icon: '📧',
      description: 'Business details and social media'
    },
    {
      id: 'layout' as CustomizationView,
      label: 'Layout',
      icon: '📐',
      description: 'Spacing, borders, and structure',
      disabled: true
    },
    {
      id: 'advanced' as CustomizationView,
      label: 'Advanced',
      icon: '⚙️',
      description: 'Custom CSS and code',
      disabled: true
    }
  ];

  const renderBreadcrumbs = () => {
    const currentItem = navigationItems.find(item => item.id === currentView);
    
    return (
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <span className="hover:text-gray-900">Site Customization</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-blue-600 font-medium">{currentItem?.label}</span>
      </nav>
    );
  };

  const renderSidebar = () => (
    <div className="w-80 bg-white border-r border-gray-200 p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Customization</h2>
        <p className="text-gray-600 text-sm">
          Personalize your site's appearance and settings
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 mb-8">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => !item.disabled && setCurrentView(item.id)}
            disabled={item.disabled}
            className={`w-full flex items-start space-x-3 p-3 rounded-lg text-left transition-all ${
              currentView === item.id
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : item.disabled
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{item.label}</span>
                {item.disabled && (
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                )}
              </div>
              <p className="text-sm opacity-75 mt-1">{item.description}</p>
            </div>
          </button>
        ))}
      </nav>

      {/* Quick Actions */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <button
            onClick={handleExportSettings}
            className="w-full flex items-center space-x-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export Settings</span>
          </button>
          
          <button
            onClick={handleImportSettings}
            className="w-full flex items-center space-x-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <span>Import Settings</span>
          </button>
          
          <button
            onClick={handleResetAll}
            className="w-full flex items-center space-x-2 p-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset All</span>
          </button>
        </div>
      </div>

      {/* Preview Mode Toggle */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Live Preview</h3>
            <p className="text-xs text-gray-600">Changes apply immediately</p>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'branding':
        return <BrandingPanel onUpdate={handleUpdate} />;
      case 'typography':
        return <TypographyPanel onUpdate={handleUpdate} />;
      case 'contact':
        return <ContactSettings onUpdate={handleUpdate} />;
      case 'layout':
        return (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-600">
              Layout customization features are currently in development.
            </p>
          </div>
        );
      case 'advanced':
        return (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-600">
              Advanced customization features including custom CSS are coming soon.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      {renderSidebar()}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {renderBreadcrumbs()}
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};