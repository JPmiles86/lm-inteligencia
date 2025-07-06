// Typography Panel - Manage fonts, sizes, and text styling

import React, { useState, useEffect } from 'react';
import { customizationService, TypographySettings } from '../../../services/customizationService';

interface TypographyPanelProps {
  onUpdate: () => void;
}

export const TypographyPanel: React.FC<TypographyPanelProps> = ({ onUpdate }) => {
  const [settings, setSettings] = useState<TypographySettings>(
    customizationService.getCustomization().typography
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const availableFonts = customizationService.getAvailableFonts();

  useEffect(() => {
    const customization = customizationService.getCustomization();
    setSettings(customization.typography);
  }, []);

  const handleSettingChange = (field: keyof TypographySettings, value: TypographySettings[keyof TypographySettings]) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleFontSizeChange = (level: keyof TypographySettings['fontSizes'], value: string) => {
    setSettings(prev => ({
      ...prev,
      fontSizes: { ...prev.fontSizes, [level]: value }
    }));
    setHasChanges(true);
  };

  const handleFontWeightChange = (weight: keyof TypographySettings['fontWeights'], value: number) => {
    setSettings(prev => ({
      ...prev,
      fontWeights: { ...prev.fontWeights, [weight]: value }
    }));
    setHasChanges(true);
  };

  const handleLineHeightChange = (type: keyof TypographySettings['lineHeight'], value: number) => {
    setSettings(prev => ({
      ...prev,
      lineHeight: { ...prev.lineHeight, [type]: value }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      customizationService.updateTypography(settings);
      setHasChanges(false);
      onUpdate();
    } catch (error) {
      console.error('Error saving typography settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset typography settings to defaults?')) {
      const defaultSettings = customizationService.getCustomization().typography;
      setSettings(defaultSettings);
      setHasChanges(true);
    }
  };

  const getFontWeightOptions = () => [
    { value: 100, label: '100 - Thin' },
    { value: 200, label: '200 - Extra Light' },
    { value: 300, label: '300 - Light' },
    { value: 400, label: '400 - Regular' },
    { value: 500, label: '500 - Medium' },
    { value: 600, label: '600 - Semi Bold' },
    { value: 700, label: '700 - Bold' },
    { value: 800, label: '800 - Extra Bold' },
    { value: 900, label: '900 - Black' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Typography</h2>
          <p className="text-gray-600 mt-1">Customize fonts, sizes, and text styling</p>
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Settings Panel */}
        <div className="space-y-8">
          {/* Font Families */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Font Families</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Font
                </label>
                <select
                  value={settings.primaryFont}
                  onChange={(e) => handleSettingChange('primaryFont', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {availableFonts.map((font) => (
                    <option key={font.family} value={font.family}>
                      {font.name}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Used for headings and primary text elements
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Font
                </label>
                <select
                  value={settings.secondaryFont}
                  onChange={(e) => handleSettingChange('secondaryFont', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {availableFonts.map((font) => (
                    <option key={font.family} value={font.family}>
                      {font.name}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Used for body text and secondary elements
                </p>
              </div>
            </div>
          </div>

          {/* Font Sizes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Font Sizes</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(settings.fontSizes).map(([level, size]) => (
                <div key={level}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {level === 'body' ? 'Body Text' : level}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={size}
                      onChange={(e) => handleFontSizeChange(level as keyof TypographySettings['fontSizes'], e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      placeholder="1rem"
                    />
                    <div className="text-xs text-gray-500 w-16">
                      ({level === 'h1' ? '60px' : level === 'h2' ? '48px' : level === 'h3' ? '36px' : 
                        level === 'h4' ? '30px' : level === 'h5' ? '24px' : level === 'h6' ? '20px' :
                        level === 'body' ? '16px' : '14px'})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Font Weights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Font Weights</h3>
            
            <div className="space-y-4">
              {Object.entries(settings.fontWeights).map(([weight, value]) => (
                <div key={weight}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {weight}
                  </label>
                  <select
                    value={value}
                    onChange={(e) => handleFontWeightChange(weight as keyof TypographySettings['fontWeights'], parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {getFontWeightOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Line Heights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Line Heights</h3>
            
            <div className="space-y-4">
              {Object.entries(settings.lineHeight).map(([type, value]) => (
                <div key={type}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {type}
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.05"
                      value={value}
                      onChange={(e) => handleLineHeightChange(type as keyof TypographySettings['lineHeight'], parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono w-12 text-right">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography Preview</h3>
          
          <div className="space-y-6">
            {/* Headings Preview */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Headings</h4>
              <div className="space-y-3">
                {Object.entries(settings.fontSizes).filter(([level]) => level.startsWith('h')).map(([level, size]) => {
                  const Element = level as keyof JSX.IntrinsicElements;
                  return (
                    <Element
                      key={level}
                      style={{
                        fontFamily: settings.primaryFont,
                        fontSize: size,
                        fontWeight: settings.fontWeights.bold,
                        lineHeight: settings.lineHeight.tight,
                        margin: 0
                      }}
                    >
                      {level.toUpperCase()} - The quick brown fox jumps
                    </Element>
                  );
                })}
              </div>
            </div>

            {/* Body Text Preview */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Body Text</h4>
              <div className="space-y-4">
                <p
                  style={{
                    fontFamily: settings.secondaryFont,
                    fontSize: settings.fontSizes.body,
                    fontWeight: settings.fontWeights.regular,
                    lineHeight: settings.lineHeight.normal,
                    margin: 0
                  }}
                >
                  This is regular body text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim 
                  veniam, quis nostrud exercitation ullamco laboris.
                </p>
                
                <p
                  style={{
                    fontFamily: settings.secondaryFont,
                    fontSize: settings.fontSizes.body,
                    fontWeight: settings.fontWeights.medium,
                    lineHeight: settings.lineHeight.normal,
                    margin: 0
                  }}
                >
                  This is medium weight text for emphasis and important information.
                </p>
                
                <p
                  style={{
                    fontFamily: settings.secondaryFont,
                    fontSize: settings.fontSizes.small,
                    fontWeight: settings.fontWeights.regular,
                    lineHeight: settings.lineHeight.normal,
                    margin: 0,
                    color: '#6b7280'
                  }}
                >
                  This is small text used for captions, footnotes, and secondary information.
                </p>
              </div>
            </div>

            {/* Interactive Elements Preview */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Interactive Elements</h4>
              <div className="space-y-3">
                <button
                  style={{
                    fontFamily: settings.primaryFont,
                    fontSize: settings.fontSizes.body,
                    fontWeight: settings.fontWeights.semibold,
                    lineHeight: settings.lineHeight.normal,
                    padding: '12px 24px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Primary Button
                </button>
                
                <a
                  href="#"
                  style={{
                    fontFamily: settings.secondaryFont,
                    fontSize: settings.fontSizes.body,
                    fontWeight: settings.fontWeights.medium,
                    color: '#3b82f6',
                    textDecoration: 'none',
                    display: 'inline-block',
                    marginLeft: '16px'
                  }}
                >
                  Sample Link Text
                </a>
              </div>
            </div>

            {/* Font Pairing Analysis */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Font Pairing Analysis</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Primary:</strong> {settings.primaryFont.split(',')[0]}</p>
                <p><strong>Secondary:</strong> {settings.secondaryFont.split(',')[0]}</p>
                <p><strong>Contrast:</strong> {settings.primaryFont === settings.secondaryFont ? 'Monochromatic' : 'Contrasting'}</p>
                <p><strong>Recommendation:</strong> {
                  settings.primaryFont === settings.secondaryFont 
                    ? 'Clean and consistent look' 
                    : 'Good for visual hierarchy'
                }</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};