// Block Settings Panel Component

import React, { useState, useEffect } from 'react';
import { Block, BlockSettings } from './types';

interface BlockSettingsPanelProps {
  isOpen: boolean;
  selectedBlock: Block | null;
  onUpdateBlock: (block: Block) => void;
  onClose: () => void;
}

const FONT_SIZES = [
  { value: 'small', label: 'Small' },
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Large' },
  { value: 'huge', label: 'Huge' }
];

const ALIGNMENTS = [
  { value: 'left', label: 'Left', icon: '⇤' },
  { value: 'center', label: 'Center', icon: '⇔' },
  { value: 'right', label: 'Right', icon: '⇥' }
];

const PRESET_COLORS = [
  { name: 'Default', bg: '', text: '' },
  { name: 'Primary', bg: '#3B82F6', text: '#FFFFFF' },
  { name: 'Secondary', bg: '#6B7280', text: '#FFFFFF' },
  { name: 'Success', bg: '#10B981', text: '#FFFFFF' },
  { name: 'Warning', bg: '#F59E0B', text: '#FFFFFF' },
  { name: 'Danger', bg: '#EF4444', text: '#FFFFFF' },
  { name: 'Light', bg: '#F9FAFB', text: '#111827' },
  { name: 'Dark', bg: '#111827', text: '#F9FAFB' }
];

export const BlockSettingsPanel: React.FC<BlockSettingsPanelProps> = ({
  isOpen,
  selectedBlock,
  onUpdateBlock,
  onClose
}) => {
  const [localSettings, setLocalSettings] = useState<BlockSettings>({});

  useEffect(() => {
    if (selectedBlock) {
      setLocalSettings(selectedBlock.settings || {});
    }
  }, [selectedBlock]);

  const handleSettingChange = (key: keyof BlockSettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    
    if (selectedBlock) {
      onUpdateBlock({
        ...selectedBlock,
        settings: newSettings
      });
    }
  };

  const applyColorPreset = (preset: typeof PRESET_COLORS[0]) => {
    const newSettings = { 
      ...localSettings, 
      backgroundColor: preset.bg, 
      textColor: preset.text 
    };
    setLocalSettings(newSettings);
    
    if (selectedBlock) {
      onUpdateBlock({
        ...selectedBlock,
        settings: newSettings
      });
    }
  };

  const resetSettings = () => {
    const defaultSettings: BlockSettings = {
      className: '',
      anchor: '',
      alignment: 'left',
      backgroundColor: '',
      textColor: '',
      fontSize: 'normal',
      marginTop: 0,
      marginBottom: 16,
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      paddingRight: 0
    };
    setLocalSettings(defaultSettings);
    
    if (selectedBlock) {
      onUpdateBlock({
        ...selectedBlock,
        settings: defaultSettings
      });
    }
  };

  if (!isOpen || !selectedBlock) {
    return null;
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg z-40 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Block Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {selectedBlock.type.charAt(0).toUpperCase() + selectedBlock.type.slice(1)} Block
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Alignment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alignment
          </label>
          <div className="flex gap-1">
            {ALIGNMENTS.map(alignment => (
              <button
                key={alignment.value}
                onClick={() => handleSettingChange('alignment', alignment.value)}
                className={`flex-1 px-3 py-2 text-sm border rounded ${
                  localSettings.alignment === alignment.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                title={alignment.label}
              >
                {alignment.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Size
          </label>
          <select
            value={localSettings.fontSize || 'normal'}
            onChange={(e) => handleSettingChange('fontSize', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {FONT_SIZES.map(size => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </div>

        {/* Color Presets */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color Presets
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_COLORS.map(preset => (
              <button
                key={preset.name}
                onClick={() => applyColorPreset(preset)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                <div 
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ 
                    backgroundColor: preset.bg || '#ffffff',
                    border: preset.bg ? 'none' : '1px solid #d1d5db'
                  }}
                />
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localSettings.backgroundColor || '#ffffff'}
                onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded"
              />
              <input
                type="text"
                value={localSettings.backgroundColor || ''}
                onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                placeholder="#ffffff"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localSettings.textColor || '#000000'}
                onChange={(e) => handleSettingChange('textColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded"
              />
              <input
                type="text"
                value={localSettings.textColor || ''}
                onChange={(e) => handleSettingChange('textColor', e.target.value)}
                placeholder="#000000"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Spacing */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Spacing (pixels)
          </label>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Margin Top</label>
                <input
                  type="number"
                  value={localSettings.marginTop || 0}
                  onChange={(e) => handleSettingChange('marginTop', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Margin Bottom</label>
                <input
                  type="number"
                  value={localSettings.marginBottom || 16}
                  onChange={(e) => handleSettingChange('marginBottom', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Pad Top</label>
                <input
                  type="number"
                  value={localSettings.paddingTop || 0}
                  onChange={(e) => handleSettingChange('paddingTop', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Pad Right</label>
                <input
                  type="number"
                  value={localSettings.paddingRight || 0}
                  onChange={(e) => handleSettingChange('paddingRight', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Pad Bottom</label>
                <input
                  type="number"
                  value={localSettings.paddingBottom || 0}
                  onChange={(e) => handleSettingChange('paddingBottom', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Pad Left</label>
                <input
                  type="number"
                  value={localSettings.paddingLeft || 0}
                  onChange={(e) => handleSettingChange('paddingLeft', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Advanced */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Advanced
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">CSS Class</label>
              <input
                type="text"
                value={localSettings.className || ''}
                onChange={(e) => handleSettingChange('className', e.target.value)}
                placeholder="custom-class"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Anchor ID</label>
              <input
                type="text"
                value={localSettings.anchor || ''}
                onChange={(e) => handleSettingChange('anchor', e.target.value)}
                placeholder="section-id"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={resetSettings}
            className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};