import React, { useState, useEffect } from 'react';
import { Save, Users, BookOpen, LogOut, Eye, EyeOff, PenTool, Layout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminSettings {
  showStaffSection: boolean;
  showBlog: boolean;
}

export const AdminPanel: React.FC = () => {
  console.log('[AdminPanel] AdminPanel component mounting/rendering');
  const navigate = useNavigate();
  
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-purple-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Welcome to Your Command Center 🚀
              </h1>
              <p className="text-gray-600 mt-2">Where marketing dreams become reality, you magnificent bastard!</p>
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
            
            {/* Blog Management Section */}
            <div className="mt-8 border-t pt-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Blog Management 📝
              </h2>
              <p className="text-gray-600 mb-6">
                Create and manage blog posts with our powerful editors
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <PenTool className="w-8 h-8 text-purple-600" />
                    <div>
                      <h3 className="font-bold text-lg">Rich Text Editor</h3>
                      <p className="text-sm text-gray-600">Traditional WYSIWYG editing</p>
                    </div>
                  </div>
                  <ul className="text-sm text-gray-600 mb-4 space-y-1">
                    <li>✓ Familiar Word-like interface</li>
                    <li>✓ Formatting toolbar</li>
                    <li>✓ Drag & drop images</li>
                    <li>✓ Auto-save every 30s</li>
                  </ul>
                  <button
                    onClick={() => {
                      window.history.pushState({}, '', '/admin/blog/new?editor=rich');
                      window.location.reload(); // Force reload to update AdminRoutes
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all transform hover:scale-105"
                  >
                    Open Rich Text Editor
                  </button>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Layout className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="font-bold text-lg">Block Editor</h3>
                      <p className="text-sm text-gray-600">Modern Gutenberg-style</p>
                    </div>
                  </div>
                  <ul className="text-sm text-gray-600 mb-4 space-y-1">
                    <li>✓ Drag & drop blocks</li>
                    <li>✓ 13+ block types</li>
                    <li>✓ Slash commands</li>
                    <li>✓ Block templates</li>
                  </ul>
                  <button
                    onClick={() => {
                      window.history.pushState({}, '', '/admin/blog/new?editor=block');
                      window.location.reload(); // Force reload to update AdminRoutes
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all transform hover:scale-105"
                  >
                    Open Block Editor
                  </button>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    window.history.pushState({}, '', '/admin/blog');
                    window.location.reload(); // Force reload to update AdminRoutes
                  }}
                  className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                >
                  <BookOpen className="w-5 h-5" />
                  View All Blog Posts
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};