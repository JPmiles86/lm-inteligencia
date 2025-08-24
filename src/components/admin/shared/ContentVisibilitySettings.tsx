import React, { useState, useEffect } from 'react';
import { Save, Users, BookOpen, Eye, EyeOff } from 'lucide-react';

export interface AdminSettings {
  showStaffSection: boolean;
  showBlog: boolean;
}

export interface ContentVisibilitySettingsProps {
  /** Initial settings values */
  initialSettings?: AdminSettings;
  /** Callback when settings are saved */
  onSave?: (settings: AdminSettings) => void;
  /** Whether to show the save button */
  showSaveButton?: boolean;
  /** Custom class name for the container */
  className?: string;
  /** Whether to show the section title */
  showTitle?: boolean;
}

export const ContentVisibilitySettings: React.FC<ContentVisibilitySettingsProps> = ({
  initialSettings,
  onSave,
  showSaveButton = true,
  className = '',
  showTitle = true
}) => {
  const [settings, setSettings] = useState<AdminSettings>({
    showStaffSection: true,
    showBlog: true,
    ...initialSettings
  });
  const [saved, setSaved] = useState(false);

  // Load settings from localStorage on mount if no initial settings provided
  useEffect(() => {
    if (!initialSettings) {
      const savedSettings = localStorage.getItem('admin_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    }
  }, [initialSettings]);

  // Update settings if initialSettings prop changes
  useEffect(() => {
    if (initialSettings) {
      setSettings(prev => ({ ...prev, ...initialSettings }));
    }
  }, [initialSettings]);

  const handleToggle = (key: keyof AdminSettings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key]
    };
    setSettings(newSettings);
    
    // If there's no external save callback, save to localStorage immediately
    if (!onSave) {
      localStorage.setItem('admin_settings', JSON.stringify(newSettings));
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(settings);
    } else {
      localStorage.setItem('admin_settings', JSON.stringify(settings));
    }
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={`border rounded-lg p-6 ${className}`}>
      {showTitle && (
        <h2 className="text-xl font-semibold mb-4">Content Visibility Settings</h2>
      )}
      
      <div className="space-y-4">
        {/* Staff Section Toggle */}
        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">Staff Section</p>
              <p className="text-sm text-gray-600">Team members on About page</p>
              <p className="text-xs mt-1">
                <span className={`font-semibold ${settings.showStaffSection ? 'text-green-600' : 'text-gray-500'}`}>
                  Status: {settings.showStaffSection ? '✅ VISIBLE' : '🚫 HIDDEN'}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('showStaffSection')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              settings.showStaffSection 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {settings.showStaffSection ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Staff
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show Staff
              </>
            )}
          </button>
        </div>

        {/* Blog Section Toggle */}
        <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg border border-pink-200">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-pink-600" />
            <div>
              <p className="font-medium text-gray-900">Blog Section</p>
              <p className="text-sm text-gray-600">Blog pages and navigation</p>
              <p className="text-xs mt-1">
                <span className={`font-semibold ${settings.showBlog ? 'text-green-600' : 'text-gray-500'}`}>
                  Status: {settings.showBlog ? '✅ VISIBLE' : '🚫 HIDDEN'}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('showBlog')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              settings.showBlog 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {settings.showBlog ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Blog
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show Blog
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Button */}
      {showSaveButton && (
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              saved 
                ? 'bg-green-600 text-white' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
            }`}
          >
            <Save className="w-4 h-4" />
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  );
};