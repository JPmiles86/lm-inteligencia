// Branding Panel - Manage logos, colors, and brand assets

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { customizationService, BrandingSettings } from '../../../services/customizationService';

interface BrandingPanelProps {
  onUpdate: () => void;
}

export const BrandingPanel: React.FC<BrandingPanelProps> = ({ onUpdate }) => {
  const [settings, setSettings] = useState<BrandingSettings>(
    customizationService.getCustomization().branding
  );
  const [activeTab, setActiveTab] = useState<'logo' | 'colors' | 'info'>('logo');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const colorPalettes = customizationService.getColorPalettes();

  useEffect(() => {
    const customization = customizationService.getCustomization();
    setSettings(customization.branding);
  }, []);

  const handleSettingChange = (field: keyof BrandingSettings, value: BrandingSettings[keyof BrandingSettings]) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleColorChange = (colorField: keyof BrandingSettings['colors'], value: string) => {
    setSettings(prev => ({
      ...prev,
      colors: { ...prev.colors, [colorField]: value }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      customizationService.updateBranding(settings);
      setHasChanges(false);
      onUpdate();
    } catch (error) {
      console.error('Error saving branding settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset branding settings to defaults?')) {
      const defaultSettings = customizationService.getCustomization().branding;
      setSettings(defaultSettings);
      setHasChanges(true);
    }
  };

  const applyColorPalette = (palette: BrandingSettings['colors']) => {
    setSettings(prev => ({ ...prev, colors: palette }));
    setHasChanges(true);
  };

  const previewColor = (color: string) => {
    return (
      <div
        className="w-8 h-8 rounded-lg border-2 border-gray-200 shadow-sm"
        style={{ backgroundColor: color }}
      />
    );
  };

  const renderLogoTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo & Brand Assets</h3>
        
        {/* Logo Upload */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo URL
            </label>
            <input
              type="url"
              value={settings.logoUrl}
              onChange={(e) => handleSettingChange('logoUrl', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/logo.png"
            />
            <p className="text-sm text-gray-500 mt-1">
              Recommended: PNG format, transparent background, 200x50px
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo Preview
            </label>
            <div className="w-full h-20 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt="Logo preview"
                  className="max-h-16 max-w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-gray-400 text-sm">No logo uploaded</span>
              )}
            </div>
          </div>
        </div>

        {/* Favicon */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favicon URL
            </label>
            <input
              type="url"
              value={settings.faviconUrl}
              onChange={(e) => handleSettingChange('faviconUrl', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/favicon.ico"
            />
            <p className="text-sm text-gray-500 mt-1">
              Recommended: ICO or PNG format, 16x16px or 32x32px
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favicon Preview
            </label>
            <div className="w-full h-20 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
              {settings.faviconUrl ? (
                <img
                  src={settings.faviconUrl}
                  alt="Favicon preview"
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-gray-400 text-sm">No favicon uploaded</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderColorsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Scheme</h3>
        
        {/* Color Palettes */}
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Color Palettes</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colorPalettes.map((palette, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => applyColorPalette(palette.colors)}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900">{palette.name}</span>
                  <div className="flex space-x-1">
                    {previewColor(palette.colors.primary)}
                    {previewColor(palette.colors.secondary)}
                  </div>
                </div>
                <div className="flex space-x-1">
                  {Object.values(palette.colors).slice(0, 4).map((color, i) => (
                    <div
                      key={i}
                      className="flex-1 h-3 rounded"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Individual Color Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Colors */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Primary Colors</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={settings.colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={settings.colors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.colors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accent Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={settings.colors.accent}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.colors.accent}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          {/* Background & Text Colors */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Background & Text</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={settings.colors.background}
                  onChange={(e) => handleColorChange('background', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.colors.background}
                  onChange={(e) => handleColorChange('background', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={settings.colors.text}
                  onChange={(e) => handleColorChange('text', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.colors.text}
                  onChange={(e) => handleColorChange('text', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Text Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={settings.colors.textSecondary}
                  onChange={(e) => handleColorChange('textSecondary', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.colors.textSecondary}
                  onChange={(e) => handleColorChange('textSecondary', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="#666666"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Color Preview */}
        <div className="mt-8 p-6 border border-gray-200 rounded-lg" style={{ backgroundColor: settings.colors.background }}>
          <h4 className="text-lg font-semibold mb-4" style={{ color: settings.colors.text }}>
            Color Preview
          </h4>
          <div className="space-y-3">
            <div
              className="inline-block px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: settings.colors.primary }}
            >
              Primary Button
            </div>
            <div
              className="inline-block px-4 py-2 rounded-lg text-white font-medium ml-3"
              style={{ backgroundColor: settings.colors.secondary }}
            >
              Secondary Button
            </div>
            <p style={{ color: settings.colors.text }}>
              This is primary text content that uses your selected text color.
            </p>
            <p style={{ color: settings.colors.textSecondary }}>
              This is secondary text content that's used for less important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInfoTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => handleSettingChange('companyName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your Company Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tagline
            </label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => handleSettingChange('tagline', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your company tagline or slogan"
            />
            <p className="text-sm text-gray-500 mt-1">
              This appears in headers, footers, and meta descriptions
            </p>
          </div>
        </div>

        {/* Brand Preview */}
        <div className="mt-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Brand Preview</h4>
          <div className="space-y-4">
            {/* Header Preview */}
            <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
              {settings.logoUrl && (
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  className="h-8 object-contain"
                />
              )}
              <div>
                <h3 className="font-bold text-lg" style={{ color: settings.colors.primary }}>
                  {settings.companyName}
                </h3>
                <p className="text-sm" style={{ color: settings.colors.textSecondary }}>
                  {settings.tagline}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Branding & Identity</h2>
          <p className="text-gray-600 mt-1">Customize your brand colors, logo, and visual identity</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'logo', label: 'Logo & Assets', icon: '🎨' },
            { id: 'colors', label: 'Colors', icon: '🌈' },
            { id: 'info', label: 'Company Info', icon: 'ℹ️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'logo' | 'colors' | 'info')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {activeTab === 'logo' && renderLogoTab()}
        {activeTab === 'colors' && renderColorsTab()}
        {activeTab === 'info' && renderInfoTab()}
      </div>
    </div>
  );
};