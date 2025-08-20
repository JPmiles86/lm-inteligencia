import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Save, Users, BookOpen, LogOut } from 'lucide-react';

interface AdminSettings {
  showStaffSection: boolean;
  showBlog: boolean;
}

export const AdminPanel: React.FC = () => {
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
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Visibility Controls */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Visibility Settings</h2>
            
            {/* Staff Section Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Staff Section</p>
                  <p className="text-sm text-gray-600">Show/hide the team section on the About page</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('showStaffSection')}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings.showStaffSection ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.showStaffSection ? 'translate-x-7' : ''
                  }`}
                />
                {settings.showStaffSection ? (
                  <Eye className="w-3 h-3 absolute right-2 top-2 text-white" />
                ) : (
                  <EyeOff className="w-3 h-3 absolute left-2 top-2 text-gray-600" />
                )}
              </button>
            </div>

            {/* Blog Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Blog</p>
                  <p className="text-sm text-gray-600">Show/hide the blog section and all blog pages</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('showBlog')}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings.showBlog ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.showBlog ? 'translate-x-7' : ''
                  }`}
                />
                {settings.showBlog ? (
                  <Eye className="w-3 h-3 absolute right-2 top-2 text-white" />
                ) : (
                  <EyeOff className="w-3 h-3 absolute left-2 top-2 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                saved 
                  ? 'bg-green-600 text-white' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Save className="w-4 h-4" />
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>

          {/* Coming Soon: Blog Editor */}
          <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Coming Soon: Blog Editor</h3>
            <p className="text-blue-700">
              Full blog management system with rich text editing, image uploads, scheduling, and drafts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};