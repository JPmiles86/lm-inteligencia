import React, { useState, useEffect } from 'react';
import { LogOut, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ContentVisibilitySettings, AdminSettings } from './shared/ContentVisibilitySettings';

export const AdminPanel: React.FC = () => {
  console.log('[AdminPanel] AdminPanel component mounting/rendering');
  const navigate = useNavigate();

  const handleSettingsSave = (newSettings: AdminSettings) => {
    localStorage.setItem('admin_settings', JSON.stringify(newSettings));
    console.log('Settings saved:', newSettings);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
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
            {/* Content Visibility Settings */}
            <ContentVisibilitySettings 
              onSave={handleSettingsSave}
              showSaveButton={true}
              showTitle={true}
            />
            
            {/* Quick Actions for Blog Management */}
            <div className="mt-8 border-t pt-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                Blog Management 📝
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    window.history.pushState({}, '', '/admin/blog/new');
                    window.location.reload(); // Force reload to update AdminRoutes
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-8 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
                >
                  📝 Create New Blog Post
                </button>
                
                <button
                  onClick={() => {
                    window.history.pushState({}, '', '/admin/blog');
                    window.location.reload(); // Force reload to update AdminRoutes
                  }}
                  className="inline-flex items-center justify-center gap-2 bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 py-3 px-8 rounded-lg font-medium transition-all"
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