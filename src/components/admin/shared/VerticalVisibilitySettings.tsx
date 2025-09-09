import React, { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, Users, BookOpen, Star, FileText, Gift, ChevronDown, ChevronUp } from 'lucide-react';

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

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('vertical_visibility_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleToggle = (vertical: keyof AllVerticalSettings, key: keyof VerticalSettings) => {
    const newSettings = {
      ...settings,
      [vertical]: {
        ...settings[vertical],
        [key]: !settings[vertical][key]
      }
    };
    setSettings(newSettings);
  };

  const handleSave = () => {
    localStorage.setItem('vertical_visibility_settings', JSON.stringify(settings));
    
    // Also update the legacy admin_settings for backward compatibility
    const adminSettings = {
      showStaffSection: settings.hospitality.showStaffSection,
      showBlog: settings.hospitality.showBlog,
    };
    localStorage.setItem('admin_settings', JSON.stringify(adminSettings));
    
    if (onSave) {
      onSave(settings);
    }
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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

  return (
    <div className={`${className}`}>
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
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggle(vertical, section.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                              isVisible
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                          >
                            {isVisible ? (
                              <>
                                <EyeOff className="w-4 h-4" />
                                Hide
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4" />
                                Show
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

      {/* Save Button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save All Settings'}
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> These settings control which sections are visible on the public website for each vertical. 
          Changes will take effect immediately after saving.
        </p>
      </div>
    </div>
  );
};