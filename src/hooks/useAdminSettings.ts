import { useState, useEffect } from 'react';

interface AdminSettings {
  showStaffSection: boolean;
  showBlog: boolean;
}

export const useAdminSettings = () => {
  const [settings, setSettings] = useState<AdminSettings>({
    showStaffSection: true,
    showBlog: false  // Default to false to hide blog
  });

  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('admin_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    };

    // Load on mount
    loadSettings();

    // Listen for storage changes (in case admin updates in another tab)
    window.addEventListener('storage', loadSettings);
    
    // Also listen for custom event for same-tab updates
    window.addEventListener('adminSettingsUpdated', loadSettings);

    return () => {
      window.removeEventListener('storage', loadSettings);
      window.removeEventListener('adminSettingsUpdated', loadSettings);
    };
  }, []);

  return settings;
};