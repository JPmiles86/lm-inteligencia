// Enhanced Admin Dashboard Component with Professional Layout

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AdminLayout, AdminSection } from './AdminLayout';
import { CSVImporter } from './CSVImporter';
import { ContentEditor } from './ContentEditor';
import { BlogManagement } from './BlogManagement';
import { AdminPanel } from './AdminPanel';
import type { IndustryType } from '../../types/Industry';
import type { CSVImportResult } from '../../types/Content';
import { ContentService } from '../../services/contentService';
import { blogService } from '../../services/blogService';
import { customizationService } from '../../services/customizationService';

interface AdminDashboardProps {
  tenantId: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ tenantId }) => {
  const [currentSection, setCurrentSection] = useState<AdminSection>('dashboard');
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType>('hospitality');
  const [lastImport, setLastImport] = useState<CSVImportResult | null>(null);

  const handleImportComplete = (result: CSVImportResult): void => {
    setLastImport(result);
    if (result.success) {
      // Stay on dashboard but show success feedback
      setTimeout(() => {
        alert('Import completed successfully!');
      }, 1000);
    }
  };

  const handleExportConfigs = async (): Promise<void> => {
    try {
      const configs = await ContentService.exportAllConfigs(tenantId);
      const dataStr = JSON.stringify(configs, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inteligencia_configs_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export configs:', error);
      alert('Failed to export configurations');
    }
  };


  // Get analytics data for dashboard
  const getAnalyticsData = () => {
    const activityLogs = ContentService.getActivityLogs(tenantId);
    const blogStats = blogService.getStats();
    const customization = customizationService.getCustomization();
    
    return {
      totalActivities: activityLogs.length,
      csvImports: activityLogs.filter(log => log.action === 'csv_import').length,
      totalBlogs: blogStats.totalPosts,
      publishedBlogs: blogStats.publishedPosts,
      draftBlogs: blogStats.draftPosts,
      lastUpdated: customization.lastUpdated,
      activityLogs: activityLogs.slice(-5).reverse()
    };
  };

  const renderDashboard = (): JSX.Element => {
    const analytics = getAnalyticsData();
    
    return (
      <div className="p-6 space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome to Inteligencia Admin</h1>
          <p className="text-blue-100 text-lg">
            Manage your content, customize your site, and track your performance all in one place.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Blog Posts</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalBlogs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.publishedBlogs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.draftBlogs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Activities</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalActivities}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setCurrentSection('blog')}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="text-2xl mb-2">📝</div>
                <div className="font-medium text-gray-900">New Blog Post</div>
                <div className="text-sm text-gray-600">Create and publish content</div>
              </button>
              
              <button
                onClick={() => setCurrentSection('settings')}
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
              >
                <div className="text-2xl mb-2">⚙️</div>
                <div className="font-medium text-gray-900">Settings</div>
                <div className="text-sm text-gray-600">Content visibility & configuration</div>
              </button>
              
              <button
                onClick={handleExportConfigs}
                className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left"
              >
                <div className="text-2xl mb-2">📥</div>
                <div className="font-medium text-gray-900">Export Data</div>
                <div className="text-sm text-gray-600">Download configurations</div>
              </button>
              
              <button
                onClick={() => window.open('/', '_blank')}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="text-2xl mb-2">👁️</div>
                <div className="font-medium text-gray-900">View Live Site</div>
                <div className="text-sm text-gray-600">See your changes</div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            {analytics.activityLogs.length > 0 ? (
              <div className="space-y-4">
                {analytics.activityLogs.map((log, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {log.action === 'csv_import' ? 'CSV Import Completed' : log.action}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* CSV Import Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Content Management</h2>
          <CSVImporter 
            tenantId={tenantId} 
            onImportComplete={handleImportComplete}
          />
          
          {lastImport && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-gray-50 rounded-lg"
            >
              <h3 className="font-medium text-gray-900 mb-2">Last Import Results</h3>
              <div className="text-sm text-gray-600">
                <div>Status: {lastImport.success ? '✅ Success' : '❌ Failed'}</div>
                <div>Rows Processed: {lastImport.processedRows} / {lastImport.totalRows}</div>
                {lastImport.errors.length > 0 && (
                  <div>Errors: {lastImport.errors.length}</div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = (): JSX.Element => {
    switch (currentSection) {
      case 'dashboard':
        return renderDashboard();
      case 'blog':
        return <BlogManagement />;
      case 'analytics':
        return (
          <div className="p-6">
            <ContentEditor
              tenantId={tenantId}
              selectedIndustry={selectedIndustry}
              onIndustryChange={setSelectedIndustry}
            />
          </div>
        );
      case 'settings':
        return <AdminPanel />;
      default:
        return renderDashboard();
    }
  };

  return (
    <AdminLayout
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
      tenantId={tenantId}
    >
      {renderContent()}
    </AdminLayout>
  );
};