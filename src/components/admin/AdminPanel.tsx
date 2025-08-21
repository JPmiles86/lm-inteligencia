import React, { useState, useEffect } from 'react';
import { Save, Users, BookOpen, LogOut } from 'lucide-react';

interface AdminSettings {
  showStaffSection: boolean;
  showBlog: boolean;
}

export const AdminPanel: React.FC = () => {
  console.log('[AdminPanel] AdminPanel component mounting/rendering');
  
  const [settings, setSettings] = useState<AdminSettings>({
    showStaffSection: true,
    showBlog: true
  });
  const [saved, setSaved] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('admin_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleToggle = (key: keyof AdminSettings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key]
    };
    setSettings(newSettings);
  };

  const handleSave = () => {
    localStorage.setItem('admin_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🎉 Admin Panel Working!</h1>
              <p className="text-green-600 font-medium">✅ Admin route successfully loaded - 404 issue resolved!</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Content Visibility Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Staff Section</p>
                      <p className="text-sm text-gray-600">Show team members on About page</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('showStaffSection')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.showStaffSection ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.showStaffSection ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Blog</p>
                      <p className="text-sm text-gray-600">Show blog section and navigation</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle('showBlog')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.showBlog ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.showBlog ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  saved 
                    ? 'bg-green-600 text-white' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Save className="w-4 h-4" />
                {saved ? 'Saved!' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};