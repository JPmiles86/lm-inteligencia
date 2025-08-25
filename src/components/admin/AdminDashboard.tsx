// Enhanced Admin Dashboard Component with Professional Layout

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AdminLayout, AdminSection } from './AdminLayout';
import { CSVImporter } from './CSVImporter';
import { ContentEditor } from './ContentEditor';
import { BlogManagement } from './BlogManagement';
import { AdminPanel } from './AdminPanel';
import { Settings } from './Settings';
import { ContentVisibilitySettings } from './shared/ContentVisibilitySettings';
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

  // Component to show recent blog posts
  const RecentBlogPosts: React.FC<{ 
    onEditPost: (post: any) => void;
    onDeletePost?: (postId: number) => void;
  }> = ({ onEditPost, onDeletePost }) => {
    const [recentPosts, setRecentPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    React.useEffect(() => {
      const fetchRecentPosts = async () => {
        try {
          const response = await blogService.getAllPosts({ 
            limit: 3, 
            sortBy: 'publishedAt', 
            sortOrder: 'desc' 
          });
          setRecentPosts(response.posts || []);
        } catch (error) {
          console.error('Error fetching recent posts:', error);
          setRecentPosts([]);
        } finally {
          setLoading(false);
        }
      };

      fetchRecentPosts();
    }, []);

    const handleDeletePost = async (postId: number, postTitle: string, e: React.MouseEvent) => {
      e.stopPropagation();
      
      if (!confirm(`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`)) {
        return;
      }

      setDeletingId(postId);
      try {
        await blogService.deletePost(postId);
        setRecentPosts(prev => prev.filter(post => post.id !== postId));
        if (onDeletePost) {
          onDeletePost(postId);
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      } finally {
        setDeletingId(null);
      }
    };

    const formatDate = (dateString: string | null) => {
      if (!dateString) return 'Not published';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    if (loading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="flex gap-2 mt-3">
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="w-20 h-20 bg-gray-200 rounded-lg ml-4"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (recentPosts.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No blog posts yet</h3>
          <p className="text-gray-600 mb-6">Create your first blog post to get started</p>
          <button
            onClick={() => setCurrentSection('blog')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-colors"
          >
            Create Your First Post
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {recentPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:border-purple-300 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {post.excerpt || 'No excerpt available...'}
                </p>
                
                <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                  <span className="flex items-center gap-1">
                    📅 {formatDate(post.publishedDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    👤 {post.author?.name || 'Unknown Author'}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditPost(post);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  
                  <button
                    onClick={(e) => handleDeletePost(post.id, post.title, e)}
                    disabled={deletingId === post.id}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === post.id ? '⏳' : '🗑️'} Delete
                  </button>
                </div>
              </div>
              
              {post.featuredImage && (
                <div className="ml-6">
                  <img 
                    src={post.featuredImage} 
                    alt={post.title} 
                    className="w-20 h-20 object-cover rounded-lg shadow-sm" 
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDashboard = (): JSX.Element => {
    const analytics = getAnalyticsData();
    
    return (
      <div className="p-6 space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome to Inteligencia Admin</h1>
          <p className="text-purple-100 text-lg">
            Manage your content, customize your site, and track your performance all in one place.
          </p>
        </div>

        {/* Latest Blog Posts - Moved to top */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Latest Blog Posts</h2>
            <button
              onClick={() => setCurrentSection('blog')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
            >
              📝 Create New Blog Post
            </button>
          </div>
          <RecentBlogPosts 
            onEditPost={(post) => {
              setCurrentSection('blog');
              // The BlogManagement component will handle the edit functionality
            }}
            onDeletePost={(postId) => {
              // Post deleted, analytics will be refreshed on next render
              console.log(`Post ${postId} deleted from dashboard`);
            }}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          {/* Content Visibility Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <ContentVisibilitySettings 
              showSaveButton={true}
              showTitle={true}
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
              >
                <div className="text-2xl mb-2">👁️</div>
                <div className="font-medium text-gray-900">View Live Site</div>
                <div className="text-sm text-gray-600">See your changes</div>
              </button>
              
              <button
                onClick={() => setCurrentSection('blog')}
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
              >
                <div className="text-2xl mb-2">📝</div>
                <div className="font-medium text-gray-900">Manage Blogs</div>
                <div className="text-sm text-gray-600">View and edit all blog posts</div>
              </button>
            </div>
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
        return <Settings />;
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