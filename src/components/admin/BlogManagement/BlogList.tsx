// Blog List Component - Displays and manages all blog posts and drafts

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { blogService } from '../../../services/blogService';
import { BlogPost } from '../../../data/blogData';

interface BlogListProps {
  onEditPost: (post: BlogPost) => void;
  onCreateNew: () => void;
  refreshTrigger: number; // To force refresh when needed
}

export const BlogList: React.FC<BlogListProps> = ({
  onEditPost,
  onCreateNew,
  refreshTrigger
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'published' | 'drafts' | 'all'>('published');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'category'>('newest');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);

  // Get data from service - Re-calculate when refreshTrigger changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const publishedPosts = useMemo(() => blogService.getAllPosts(), [refreshTrigger]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const draftPosts = useMemo(() => blogService.getAllDrafts(), [refreshTrigger]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats = useMemo(() => blogService.getStats(), [refreshTrigger]);
  const categories = useMemo(() => blogService.getCategories(), []);

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    let allPosts: BlogPost[] = [];
    
    switch (viewMode) {
      case 'published':
        allPosts = publishedPosts;
        break;
      case 'drafts':
        allPosts = draftPosts;
        break;
      case 'all':
        allPosts = [...publishedPosts, ...draftPosts];
        break;
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      allPosts = allPosts.filter(post => post.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      allPosts = allPosts.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort posts
    const sorted = [...allPosts].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.publishedDate || '9999-12-31').getTime() - 
                 new Date(a.publishedDate || '9999-12-31').getTime();
        case 'oldest':
          return new Date(a.publishedDate || '0000-01-01').getTime() - 
                 new Date(b.publishedDate || '0000-01-01').getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return sorted;
  }, [publishedPosts, draftPosts, viewMode, selectedCategory, searchQuery, sortBy]);

  const handleDeletePost = (id: string) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      blogService.deletePost(id);
      // Force refresh by updating parent component
      window.location.reload(); // Simple approach, could be improved with state management
    }
  };

  const handlePublishDraft = (id: string) => {
    const publishedPost = blogService.publishDraft(id);
    if (publishedPost) {
      alert('Draft published successfully!');
      window.location.reload(); // Force refresh
    } else {
      alert('Failed to publish draft.');
    }
  };

  const handleBulkAction = (action: 'delete' | 'publish') => {
    if (selectedPosts.length === 0) {
      alert('Please select posts to perform this action.');
      return;
    }

    const confirmMessage = action === 'delete' 
      ? `Are you sure you want to delete ${selectedPosts.length} post(s)?`
      : `Are you sure you want to publish ${selectedPosts.length} draft(s)?`;

    if (window.confirm(confirmMessage)) {
      selectedPosts.forEach(id => {
        if (action === 'delete') {
          blogService.deletePost(id);
        } else if (action === 'publish') {
          blogService.publishDraft(id);
        }
      });
      setSelectedPosts([]);
      window.location.reload(); // Force refresh
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Draft';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (post: BlogPost) => {
    if (!post.publishedDate) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Draft</span>;
    }
    
    const publishDate = new Date(post.publishedDate);
    const now = new Date();
    
    if (publishDate > now) {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Scheduled</span>;
    }
    
    return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Published</span>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.publishedPosts}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.draftPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Featured</p>
              <p className="text-2xl font-bold text-gray-900">{stats.featuredPosts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Blog Posts</h2>
            <p className="text-gray-600 mt-1">Manage your blog content and publications</p>
          </div>
          
          <button
            onClick={onCreateNew}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Post</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* View Mode */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { id: 'published', label: 'Published', count: stats.publishedPosts },
                { id: 'drafts', label: 'Drafts', count: stats.draftPosts },
                { id: 'all', label: 'All', count: stats.totalPosts }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as 'published' | 'drafts' | 'all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === mode.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode.label} ({mode.count})
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 items-center">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title' | 'category')}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedPosts.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedPosts.length} post(s) selected
              </span>
              <div className="flex gap-2">
                {viewMode === 'drafts' && (
                  <button
                    onClick={() => handleBulkAction('publish')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Publish Selected
                  </button>
                )}
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedPosts([])}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts List */}
        {filteredAndSortedPosts.length > 0 ? (
          <div className="space-y-4">
            {filteredAndSortedPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedPosts.includes(post.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPosts([...selectedPosts, post.id]);
                      } else {
                        setSelectedPosts(selectedPosts.filter(id => id !== post.id));
                      }
                    }}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />

                  {/* Featured Image */}
                  <div className="w-24 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {post.category}
                          </span>
                          <span>{formatDate(post.publishedDate)}</span>
                          <span>{post.readTime} min read</span>
                          {post.featured && (
                            <span className="text-yellow-600 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {getStatusBadge(post)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onEditPost(post)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    
                    {!post.publishedDate && (
                      <button
                        onClick={() => handlePublishDraft(post.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        Publish
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory !== 'All' 
                ? 'Try adjusting your search criteria'
                : 'Create your first blog post to get started'
              }
            </p>
            {!searchQuery && selectedCategory === 'All' && (
              <button
                onClick={onCreateNew}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create First Post
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};