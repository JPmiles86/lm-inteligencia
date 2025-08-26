// Blog Management - Main component that orchestrates blog management functionality

import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BlogList } from './BlogList';
import { EnhancedBlogEditor } from './EnhancedBlogEditor';
import { MediaUploader } from './MediaUploader';
import { BlogPost } from '../../../data/blogData';

type BlogManagementView = 'list' | 'editor' | 'media';

export const BlogManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Determine current view based on URL using useMemo for better performance
  const currentView = useMemo<BlogManagementView>(() => {
    const path = location.pathname;
    console.log('[BlogManagement] URL PATH PARSING:', {
      path: path,
      id: id,
      includes_new: path.includes('/new'),
      includes_edit: path.includes('/edit/'),
      timestamp: new Date().toISOString()
    });
    
    if (path.includes('/new')) {
      console.log('[BlogManagement] View determined: EDITOR (new post)');
      return 'editor';
    } else if (path.includes('/edit/') && id) {
      console.log('[BlogManagement] View determined: EDITOR (edit post)', id);
      return 'editor';
    } else {
      console.log('[BlogManagement] View determined: LIST');
      return 'list';
    }
  }, [location.pathname, id]);

  // Derived state for editing post ID
  const editingPostId = useMemo(() => {
    return currentView === 'editor' && id ? parseInt(id) : undefined;
  }, [currentView, id]);

  const handleCreateNew = () => {
    console.log('[BlogManagement] Creating new post');
    navigate('/admin/blog/new');
  };

  const handleEditPost = (post: BlogPost) => {
    console.log('[BlogManagement] Editing post:', post.id);
    navigate(`/admin/blog/edit/${post.id}`);
  };

  const handleSavePost = () => {
    console.log('[BlogManagement] Post saved, returning to list');
    // Trigger refresh of the blog list
    setRefreshTrigger(prev => prev + 1);
    navigate('/admin/blog');
  };

  const handleCancelEdit = () => {
    console.log('[BlogManagement] Edit cancelled, returning to list');
    navigate('/admin/blog');
  };

  const handleSelectImage = () => {
    // This would be used in the editor to insert images
    setShowMediaUploader(false);
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
            <EnhancedBlogEditor
              key={editingPostId || 'new'} // Force re-mount when ID changes
              postId={editingPostId}
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