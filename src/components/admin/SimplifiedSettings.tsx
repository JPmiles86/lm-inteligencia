// Simplified Settings Page Component - Content Visibility Only
import React from 'react';
import { ContentVisibilitySettings, AdminSettings } from './shared/ContentVisibilitySettings';

export const Settings: React.FC = () => {
  const handleSettingsSave = (newSettings: AdminSettings) => {
    localStorage.setItem('admin_settings', JSON.stringify(newSettings));
    console.log('[Settings] Settings saved:', newSettings);
    
    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
    notification.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      Settings saved successfully!
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Content Visibility Settings */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <ContentVisibilitySettings 
            onSave={handleSettingsSave}
            showSaveButton={true}
            showTitle={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;