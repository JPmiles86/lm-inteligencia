// Content Editor Component for Admin Interface

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { IndustryConfig, IndustryType } from '../../types/Industry';
import { ContentService } from '../../services/contentService';
import { IndustryNames } from '../../types/Industry';

interface ContentEditorProps {
  tenantId: string;
  selectedIndustry: IndustryType;
  onIndustryChange: (industry: IndustryType) => void;
}

interface EditableField {
  label: string;
  value: string;
  type: 'text' | 'textarea' | 'url';
  path: string[];
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  tenantId,
  selectedIndustry,
  onIndustryChange
}) => {
  const [config, setConfig] = useState<IndustryConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  useEffect(() => {
    loadConfig();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndustry]);

  const loadConfig = async (): Promise<void> => {
    setLoading(true);
    try {
      const industryConfig = await ContentService.getIndustryConfig(tenantId, selectedIndustry);
      setConfig(industryConfig);
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (): Promise<void> => {
    if (!config || !hasChanges) return;

    setSaving(true);
    try {
      await ContentService.updateIndustryConfig(tenantId, selectedIndustry, config);
      setHasChanges(false);
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('Failed to save configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateFieldValue = (path: string[], value: string): void => {
    if (!config) return;

    const updatedConfig = { ...config };
    // Cast through unknown to handle the type conversion properly
    let current: Record<string, unknown> = updatedConfig as unknown as Record<string, unknown>;

    // Navigate to the parent object
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (key && typeof current === 'object' && current !== null && !current[key]) {
        current[key] = {};
      }
      if (key && typeof current === 'object' && current !== null && key in current) {
        current = current[key] as Record<string, unknown>;
      }
    }

    // Update the field
    const finalKey = path[path.length - 1];
    if (finalKey) {
      current[finalKey] = value;
    }
    
    setConfig(updatedConfig as IndustryConfig);
    setHasChanges(true);
  };

  const getFieldValue = (path: string[]): string => {
    if (!config) return '';

    // Cast through unknown to handle the type conversion properly
    let current: Record<string, unknown> = config as unknown as Record<string, unknown>;
    for (const key of path) {
      if (typeof current === 'object' && current !== null && key in current) {
        current = current[key] as Record<string, unknown>;
      } else {
        return '';
      }
    }

    return String(current || '');
  };

  const renderHeroSection = (): JSX.Element => {
    const fields: EditableField[] = [
      { label: 'Main Title', value: getFieldValue(['content', 'hero', 'title']), type: 'text', path: ['content', 'hero', 'title'] },
      { label: 'Subtitle', value: getFieldValue(['content', 'hero', 'subtitle']), type: 'textarea', path: ['content', 'hero', 'subtitle'] },
      { label: 'Background Source', value: getFieldValue(['content', 'hero', 'backgroundSrc']), type: 'url', path: ['content', 'hero', 'backgroundSrc'] },
      { label: 'CTA Text', value: getFieldValue(['content', 'hero', 'ctaText']), type: 'text', path: ['content', 'hero', 'ctaText'] },
      { label: 'CTA Link', value: getFieldValue(['content', 'hero', 'ctaLink']), type: 'url', path: ['content', 'hero', 'ctaLink'] },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hero Section</h3>
        
        {fields.map((field, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                value={field.value}
                onChange={(e) => updateFieldValue(field.path, e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            ) : (
              <input
                type={field.type === 'url' ? 'url' : 'text'}
                value={field.value}
                onChange={(e) => updateFieldValue(field.path, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            )}
          </div>
        ))}

        {/* Hero Stats */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Statistics</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((statIndex) => (
              <div key={statIndex} className="border border-gray-200 rounded-lg p-4">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stat {statIndex + 1} Value
                  </label>
                  <input
                    type="text"
                    value={getFieldValue(['content', 'hero', 'stats', statIndex.toString(), 'value'])}
                    onChange={(e) => updateFieldValue(['content', 'hero', 'stats', statIndex.toString(), 'value'], e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="e.g., 40%"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stat {statIndex + 1} Label
                  </label>
                  <input
                    type="text"
                    value={getFieldValue(['content', 'hero', 'stats', statIndex.toString(), 'label'])}
                    onChange={(e) => updateFieldValue(['content', 'hero', 'stats', statIndex.toString(), 'label'], e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="e.g., Increase in Bookings"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderServicesSection = (): JSX.Element => {
    const services = config?.content?.services || [];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Section</h3>
        
        {services.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No services configured. Import content via CSV to populate services.
          </div>
        ) : (
          <div className="space-y-6">
            {services.map((service, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Service {index + 1}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Title
                    </label>
                    <input
                      type="text"
                      value={service.title}
                      onChange={(e) => updateFieldValue(['content', 'services', index.toString(), 'title'], e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Results Text
                    </label>
                    <input
                      type="text"
                      value={service.results || ''}
                      onChange={(e) => updateFieldValue(['content', 'services', index.toString(), 'results'], e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Description
                  </label>
                  <textarea
                    value={service.description}
                    onChange={(e) => updateFieldValue(['content', 'services', index.toString(), 'description'], e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Features
                  </label>
                  <div className="space-y-2">
                    {service.features?.map((feature, featureIndex) => (
                      <input
                        key={featureIndex}
                        type="text"
                        value={feature}
                        onChange={(e) => updateFieldValue(['content', 'services', index.toString(), 'features', featureIndex.toString()], e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        placeholder={`Feature ${featureIndex + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderContactSection = (): JSX.Element => {
    const contact = config?.content?.contact;

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Section</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Title
            </label>
            <input
              type="text"
              value={contact?.title || ''}
              onChange={(e) => updateFieldValue(['content', 'contact', 'title'], e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Contact section title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={contact?.email || ''}
              onChange={(e) => updateFieldValue(['content', 'contact', 'email'], e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="contact@example.com"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Subtitle
            </label>
            <textarea
              value={contact?.subtitle || ''}
              onChange={(e) => updateFieldValue(['content', 'contact', 'subtitle'], e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Contact section subtitle"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={contact?.phone || ''}
              onChange={(e) => updateFieldValue(['content', 'contact', 'phone'], e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
      </div>
    );
  };

  const sections = [
    { id: 'hero', label: 'Hero Section', component: renderHeroSection },
    { id: 'services', label: 'Services', component: renderServicesSection },
    { id: 'contact', label: 'Contact', component: renderContactSection },
  ];

  const industries: IndustryType[] = ['hospitality', 'healthcare', 'tech', 'athletics'];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="spinner mr-2"></div>
        <span>Loading configuration...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Content Editor</h2>
          
          {hasChanges && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={saveConfig}
              disabled={saving}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </motion.button>
          )}
        </div>

        {/* Industry Selector */}
        <div className="flex space-x-2">
          {industries.map((industry) => (
            <button
              key={industry}
              onClick={() => onIndustryChange(industry)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedIndustry === industry
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {IndustryNames[industry]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex">
        {/* Section Navigation */}
        <div className="w-64 border-r border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Sections</h3>
          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Section Content */}
        <div className="flex-1 p-6">
          {config ? (
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {sections.find(s => s.id === activeSection)?.component() || (
                <div className="text-center py-8 text-gray-500">
                  Section not found
                </div>
              )}
            </motion.div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                No configuration found for {IndustryNames[selectedIndustry]}
              </div>
              <p className="text-sm text-gray-400">
                Import content via CSV to start editing
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};