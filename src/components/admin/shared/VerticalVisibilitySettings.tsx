import React, { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, Users, BookOpen, Star, FileText, Gift, ChevronDown, ChevronUp, RefreshCw, AlertCircle } from 'lucide-react';

export interface VerticalSettings {
  showStaffSection: boolean;
  showBlog: boolean;
  showTestimonials: boolean;
  showCaseStudies: boolean;
  showOptionalAddOns: boolean;
}

export interface AllVerticalSettings {
  hospitality: VerticalSettings;
  healthcare: VerticalSettings;
  tech: VerticalSettings;
  athletics: VerticalSettings;
}

const defaultSettings: VerticalSettings = {
  showStaffSection: true,
  showBlog: true,
  showTestimonials: true,
  showCaseStudies: true,
  showOptionalAddOns: true,
};

const defaultAllSettings: AllVerticalSettings = {
  hospitality: { ...defaultSettings },
  healthcare: { 
    ...defaultSettings,
    showTestimonials: false, // Hidden by default for healthcare
    showCaseStudies: false,  // Hidden by default for healthcare
    showOptionalAddOns: false, // Hidden by default for healthcare
  },
  tech: { ...defaultSettings },
  athletics: { ...defaultSettings },
};

interface VerticalVisibilitySettingsProps {
  onSave?: (settings: AllVerticalSettings) => void;
  className?: string;
}

const verticalInfo = {
  hospitality: { 
    name: 'Hospitality & Lifestyle', 
    color: 'purple',
    description: 'Hotels, Restaurants, Travel & Tourism'
  },
  healthcare: { 
    name: 'Health & Wellness', 
    color: 'green',
    description: 'Healthcare, Dental, Wellness, Fitness'
  },
  tech: { 
    name: 'Tech & AI', 
    color: 'blue',
    description: 'SaaS, AI Startups, MarTech, Platforms'
  },
  athletics: { 
    name: 'Sport & Media', 
    color: 'orange',
    description: 'Pickleball, Events, Tournaments, Media'
  },
};

const sectionInfo = [
  { 
    key: 'showStaffSection' as keyof VerticalSettings, 
    label: 'Staff Section', 
    description: 'Team members on About page',
    icon: Users 
  },
  { 
    key: 'showBlog' as keyof VerticalSettings, 
    label: 'Blog', 
    description: 'Blog pages and navigation',
    icon: BookOpen 
  },
  { 
    key: 'showTestimonials' as keyof VerticalSettings, 
    label: 'Testimonials', 
    description: 'Client testimonials section',
    icon: Star 
  },
  { 
    key: 'showCaseStudies' as keyof VerticalSettings, 
    label: 'Case Studies', 
    description: 'Case studies page and navigation',
    icon: FileText 
  },
  { 
    key: 'showOptionalAddOns' as keyof VerticalSettings, 
    label: 'Optional Add-Ons', 
    description: 'A la carte services on pricing page',
    icon: Gift 
  },
];

export const VerticalVisibilitySettings: React.FC<VerticalVisibilitySettingsProps> = ({
  onSave,
  className = '',
}) => {
  const [settings, setSettings] = useState<AllVerticalSettings>(defaultAllSettings);
  const [expandedVertical, setExpandedVertical] = useState<string | null>('healthcare');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings from API on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/vertical-visibility');
      
      if (!response.ok) {
        throw new Error('Failed to load settings');
      }
      
      const result = await response.json();
      
      if (result.data) {
        setSettings(result.data);
      }
    } catch (error: any) {
      console.error('Failed to load vertical visibility settings:', error);
      setError(error.message || 'Failed to load settings');
      
      // Fallback to localStorage for backward compatibility
      const savedSettings = localStorage.getItem('vertical_visibility_settings');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch {
          // If localStorage is also corrupted, use defaults
          setSettings(defaultAllSettings);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (vertical: keyof AllVerticalSettings, key: keyof VerticalSettings) => {
    const newSettings = {
      ...settings,
      [vertical]: {
        ...settings[vertical],
        [key]: !settings[vertical][key]
      }
    };
    setSettings(newSettings);
    
    // Save to database
    await saveSettings(vertical, newSettings[vertical]);
    
    // Also update localStorage for backward compatibility
    localStorage.setItem('vertical_visibility_settings', JSON.stringify(newSettings));
    
    // Also update the legacy admin_settings for backward compatibility if it's hospitality
    if (vertical === 'hospitality') {
      const adminSettings = {
        showStaffSection: newSettings.hospitality.showStaffSection,
        showBlog: newSettings.hospitality.showBlog,
      };
      localStorage.setItem('admin_settings', JSON.stringify(adminSettings));
    }
    
    if (onSave) {
      onSave(newSettings);
    }
  };

  const saveSettings = async (vertical: keyof AllVerticalSettings, verticalSettings: VerticalSettings) => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch('/api/vertical-visibility', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_TOKEN || 'inteligencia-admin-2025'}`
        },
        body: JSON.stringify({
          vertical,
          ...verticalSettings
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      // Show saved indicator briefly
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      
    } catch (error: any) {
      console.error('Failed to save vertical visibility settings:', error);
      setError(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };


  const toggleVertical = (vertical: string) => {
    setExpandedVertical(expandedVertical === vertical ? null : vertical);
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; border: string; text: string }> = {
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' },
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600' },
    };
    return colorMap[color] || colorMap.purple;
  };

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center py-12`}>
        <div className="flex items-center gap-3 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Loading visibility settings...
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-4 h-4" />
            <strong>Error:</strong> {error}
          </div>
          <button
            onClick={loadSettings}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try loading again
          </button>
        </div>
      )}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vertical-Specific Visibility Settings</h2>
        <p className="text-gray-600">Control which sections appear for each industry vertical</p>
      </div>

      <div className="space-y-4">
        {Object.entries(verticalInfo).map(([verticalKey, info]) => {
          const vertical = verticalKey as keyof AllVerticalSettings;
          const colors = getColorClasses(info.color);
          const isExpanded = expandedVertical === vertical;
          
          return (
            <div key={vertical} className={`border rounded-lg overflow-hidden ${colors.border}`}>
              <button
                onClick={() => toggleVertical(vertical)}
                className={`w-full px-6 py-4 flex items-center justify-between ${colors.bg} hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-8 rounded ${colors.text} bg-current`} />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{info.name}</h3>
                    <p className="text-sm text-gray-600">{info.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Quick status indicators */}
                  <div className="flex gap-2">
                    {sectionInfo.map(section => (
                      <div
                        key={section.key}
                        className={`w-2 h-2 rounded-full ${
                          settings[vertical][section.key] ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        title={`${section.label}: ${settings[vertical][section.key] ? 'Visible' : 'Hidden'}`}
                      />
                    ))}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="p-6 bg-white border-t">
                  <div className="space-y-3">
                    {sectionInfo.map(section => {
                      const Icon = section.icon;
                      const isVisible = settings[vertical][section.key];
                      
                      return (
                        <div
                          key={section.key}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${colors.text}`} />
                            <div>
                              <p className="font-medium text-gray-900">{section.label}</p>
                              <p className="text-sm text-gray-600">{section.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-medium">Status:</span>
                                <span className={`text-xs font-semibold ${isVisible ? 'text-green-600' : 'text-red-600'}`}>
                                  {isVisible ? '✓ Visible' : '✗ Hidden'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggle(vertical, section.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                              isVisible
                                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {isVisible ? (
                              <>
                                <EyeOff className="w-4 h-4" />
                                Hide Section
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4" />
                                Show Section
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Auto-Save Indicator */}
      {(saved || saving) && (
        <div className="flex justify-end mt-8">
          <div className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium ${
            saving ? 'bg-blue-600' : 'bg-green-600'
          } text-white`}>
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Saved!'}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> These settings control which sections are visible on the public website for each vertical. 
          Changes are saved automatically to the database and take effect immediately for all visitors.
        </p>
      </div>
    </div>
  );
};