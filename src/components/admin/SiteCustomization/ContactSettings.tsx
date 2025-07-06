// Contact Settings - Manage contact information and business details

import React, { useState, useEffect } from 'react';
import { customizationService, ContactSettings as ContactSettingsType } from '../../../services/customizationService';

interface ContactSettingsProps {
  onUpdate: () => void;
}

export const ContactSettings: React.FC<ContactSettingsProps> = ({ onUpdate }) => {
  const [settings, setSettings] = useState<ContactSettingsType>(
    customizationService.getCustomization().contact
  );
  const [activeTab, setActiveTab] = useState<'basic' | 'social' | 'hours'>('basic');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const daysOfWeek = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  useEffect(() => {
    const customization = customizationService.getCustomization();
    setSettings(customization.contact);
  }, []);

  const handleBasicChange = (field: keyof ContactSettingsType, value: ContactSettingsType[keyof ContactSettingsType]) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleAddressChange = (field: keyof ContactSettingsType['address'], value: string) => {
    setSettings(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleSocialMediaChange = (platform: keyof ContactSettingsType['socialMedia'], value: string) => {
    setSettings(prev => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [platform]: value }
    }));
    setHasChanges(true);
  };

  const handleBusinessHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setSettings(prev => {
      const currentDaySettings = prev.businessHours[day] || { open: '09:00', close: '17:00', closed: false };
      return {
        ...prev,
        businessHours: {
          ...prev.businessHours,
          [day]: { ...currentDaySettings, [field]: value } as { open: string; close: string; closed: boolean }
        }
      };
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      customizationService.updateContact(settings);
      setHasChanges(false);
      onUpdate();
    } catch (error) {
      console.error('Error saving contact settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset contact settings to defaults?')) {
      const defaultSettings = customizationService.getCustomization().contact;
      setSettings(defaultSettings);
      setHasChanges(true);
    }
  };

  const formatDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const validateUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const renderBasicTab = () => (
    <div className="space-y-6">
      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => handleBasicChange('email', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="info@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => handleBasicChange('phone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Address</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address
            </label>
            <input
              type="text"
              value={settings.address.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="123 Main Street"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={settings.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Los Angeles"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province
              </label>
              <input
                type="text"
                value={settings.address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="CA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP/Postal Code
              </label>
              <input
                type="text"
                value={settings.address.zipCode}
                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="90210"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              value={settings.address.country}
              onChange={(e) => handleAddressChange('country', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="United States"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Contact Information Preview</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{settings.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{settings.phone}</span>
          </div>
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <div>{settings.address.street}</div>
              <div>
                {settings.address.city}, {settings.address.state} {settings.address.zipCode}
              </div>
              <div>{settings.address.country}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSocialTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h3>
        <p className="text-gray-600 mb-6">
          Add your social media profiles to display in headers, footers, and contact pages.
        </p>
        
        <div className="space-y-4">
          {Object.entries(settings.socialMedia).map(([platform, url]) => {
            const icons: Record<string, string> = {
              facebook: 'https://www.facebook.com',
              twitter: 'https://www.twitter.com',
              linkedin: 'https://www.linkedin.com',
              instagram: 'https://www.instagram.com',
              youtube: 'https://www.youtube.com'
            };

            const _platformNames: Record<string, string> = {
              facebook: 'Facebook',
              twitter: 'Twitter',
              linkedin: 'LinkedIn',
              instagram: 'Instagram',
              youtube: 'YouTube'
            };

            const isValidUrl = validateUrl(url || '');

            return (
              <div key={platform}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {_platformNames[platform]}
                </label>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {platform.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <input
                    type="url"
                    value={url || ''}
                    onChange={(e) => handleSocialMediaChange(platform as keyof ContactSettingsType['socialMedia'], e.target.value)}
                    className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      url && !isValidUrl ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={`${icons[platform]}/${platform === 'youtube' ? 'c/' : ''}yourcompany`}
                  />
                  {url && (
                    <button
                      onClick={() => handleSocialMediaChange(platform as keyof ContactSettingsType['socialMedia'], '')}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {url && !isValidUrl && (
                  <p className="text-sm text-red-600 mt-1">Please enter a valid URL</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Social Media Preview */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Social Media Preview</h4>
        <div className="flex space-x-3">
          {Object.entries(settings.socialMedia).map(([platform, url]) => {
            if (!url) return null;

            return (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <span className="text-sm font-medium">
                  {platform.charAt(0).toUpperCase()}
                </span>
              </a>
            );
          })}
        </div>
        {Object.values(settings.socialMedia).every(url => !url) && (
          <p className="text-gray-500 text-sm">No social media links configured</p>
        )}
      </div>
    </div>
  );

  const renderHoursTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h3>
        <p className="text-gray-600 mb-6">
          Set your business operating hours to display on your contact page and local listings.
        </p>
        
        <div className="space-y-4">
          {daysOfWeek.map((day) => {
            const daySettings = settings.businessHours[day];
            
            return (
              <div key={day} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-24">
                  <span className="font-medium text-gray-900 capitalize">
                    {formatDayName(day)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={!daySettings?.closed}
                      onChange={(e) => handleBusinessHoursChange(day, 'closed', !e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Open</span>
                  </label>
                </div>
                
                {!daySettings?.closed && (
                  <>
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={daySettings?.open || '09:00'}
                        onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={daySettings?.close || '17:00'}
                        onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                )}
                
                {daySettings?.closed && (
                  <span className="text-gray-500 italic">Closed</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Business Hours Preview */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Business Hours Preview</h4>
        <div className="space-y-2 text-sm">
          {daysOfWeek.map((day) => {
            const daySettings = settings.businessHours[day];
            
            return (
              <div key={day} className="flex justify-between">
                <span className="capitalize font-medium">{formatDayName(day)}</span>
                <span className={daySettings?.closed ? 'text-gray-500' : 'text-gray-900'}>
                  {daySettings?.closed ? 'Closed' : `${daySettings?.open || '09:00'} - ${daySettings?.close || '17:00'}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Settings</h2>
          <p className="text-gray-600 mt-1">Manage your business contact information and hours</p>
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
            { id: 'basic', label: 'Contact Info', icon: '📧' },
            { id: 'social', label: 'Social Media', icon: '📱' },
            { id: 'hours', label: 'Business Hours', icon: '🕒' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'basic' | 'social' | 'hours')}
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
        {activeTab === 'basic' && renderBasicTab()}
        {activeTab === 'social' && renderSocialTab()}
        {activeTab === 'hours' && renderHoursTab()}
      </div>
    </div>
  );
};