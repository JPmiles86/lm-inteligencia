// Blog Management - Main component that orchestrates blog management functionality

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlogList } from './BlogList';
import { EnhancedBlogEditor } from './EnhancedBlogEditor';
import { MediaUploader } from './MediaUploader';
import { BlogPost } from '../../../data/blogData';

type BlogManagementView = 'list' | 'editor' | 'media';

export const BlogManagement: React.FC = () => {
  const [currentView, setCurrentView] = useState<BlogManagementView>('list');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setEditingPost(null);
    setCurrentView('editor');
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setCurrentView('editor');
  };

  const handleSavePost = () => {
    // Trigger refresh of the blog list
    setRefreshTrigger(prev => prev + 1);
    setCurrentView('list');
    setEditingPost(null);
  };

  const handleCancelEdit = () => {
    setCurrentView('list');
    setEditingPost(null);
  };

  const handleSelectImage = () => {
    // This would be used in the editor to insert images
    setShowMediaUploader(false);
  };

  const renderBreadcrumbs = () => {
    // Only show breadcrumbs on editor view, not on list view
    if (currentView !== 'editor') {
      return null;
    }

    return (
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <button
          onClick={() => setCurrentView('list')}
          className="hover:text-purple-600 transition-colors"
        >
          Blog Management
        </button>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-purple-600 font-medium">
          {editingPost ? 'Edit Post' : 'New Post'}
        </span>
      </nav>
    );
  };

  return (
    <div className="h-full overflow-hidden">
      <AnimatePresence mode="wait">
        {currentView === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-auto"
          >
            <BlogList
              onEditPost={handleEditPost}
              onCreateNew={handleCreateNew}
              refreshTrigger={refreshTrigger}
            />
          </motion.div>
        )}

        {currentView === 'editor' && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-auto"
          >
            {renderBreadcrumbs()}
            <EnhancedBlogEditor
              post={editingPost}
              onSave={handleSavePost}
              onCancel={handleCancelEdit}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Uploader Modal */}
      <AnimatePresence>
        {showMediaUploader && (
          <MediaUploader
            onSelectImage={handleSelectImage}
            onClose={() => setShowMediaUploader(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Action Button for Quick Actions */}
      {currentView === 'list' && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <div className="relative">
            {/* Main FAB */}
            <button
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white w-14 h-14 rounded-full shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-110 flex items-center justify-center group"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
                Create New Post
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success/Error Notifications */}
      <AnimatePresence>
        {/* This would be enhanced with a proper notification system */}
      </AnimatePresence>
    </div>
  );
};