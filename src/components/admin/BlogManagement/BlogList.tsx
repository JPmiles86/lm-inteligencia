// Blog List Component - Displays and manages all blog posts and drafts

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { blogService, BlogPostFilters, BlogPostsResponse } from '../../../services/blogService';
import { BlogPost } from '../../../data/blogData';

interface BlogListProps {
  onEditPost: (post: BlogPost) => void;
  onCreateNew: () => void;
  refreshTrigger: number;
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
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);
  
  // API state
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    featuredPosts: 0,
    categoryCounts: {} as Record<string, number>,
    tagCounts: {} as Record<string, number>,
    monthlyPublications: {} as Record<string, number>
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data when component mounts or dependencies change
  useEffect(() => {
    fetchPosts();
    fetchStats();
    fetchCategories();
  }, [refreshTrigger, currentPage, searchQuery, selectedCategory, viewMode, sortBy]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: BlogPostFilters = {
        page: currentPage,
        limit: postsPerPage,
        sortBy: sortBy === 'newest' ? 'publishedAt' : sortBy === 'oldest' ? 'publishedAt' : sortBy,
        sortOrder: sortBy === 'newest' ? 'desc' : 'asc'
      };
      
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }
      
      if (selectedCategory !== 'All') {
        filters.category = selectedCategory;
      }
      
      if (viewMode === 'published') {
        filters.published = true;
      } else if (viewMode === 'drafts') {
        filters.published = false;
      }
      // For 'all', don't set published filter
      
      const response: BlogPostsResponse = await blogService.getAllPosts(filters);
      setPosts(response.posts);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await blogService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesData = await blogService.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Handle search with debouncing
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on search
    
    // Debounce search
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      // Trigger fetch with new search query
    }, 500);
    
    setSearchTimeout(timeout);
  };

  const handleViewModeChange = (mode: 'published' | 'drafts' | 'all') => {
    setViewMode(mode);
    setCurrentPage(1);
    setSelectedPosts([]);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort as 'newest' | 'oldest' | 'title' | 'category');
    setCurrentPage(1);
  };

  const handleDeletePost = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        setLoading(true);
        await blogService.deletePost(id);
        await fetchPosts();
        await fetchStats();
        setSelectedPosts(prev => prev.filter(postId => postId !== id));
        
        // Show success message
        alert('Post deleted successfully!');
      } catch (err) {
        console.error('Error deleting post:', err);
        alert(err instanceof Error ? err.message : 'Failed to delete post');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePublishDraft = async (id: number) => {
    try {
      setLoading(true);
      const result = await blogService.togglePublished(id);
      if (result) {
        await fetchPosts();
        await fetchStats();
        alert('Post published successfully!');
      } else {
        alert('Failed to publish post.');
      }
    } catch (err) {
      console.error('Error publishing post:', err);
      alert(err instanceof Error ? err.message : 'Failed to publish post');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: 'delete' | 'publish') => {
    if (selectedPosts.length === 0) {
      alert('Please select posts to perform this action.');
      return;
    }

    const confirmMessage = action === 'delete' 
      ? `Are you sure you want to delete ${selectedPosts.length} post(s)?`
      : `Are you sure you want to publish ${selectedPosts.length} draft(s)?`;

    if (window.confirm(confirmMessage)) {
      try {
        setLoading(true);
        
        // Execute actions in parallel
        const promises = selectedPosts.map(id => {
          if (action === 'delete') {
            return blogService.deletePost(id);
          } else if (action === 'publish') {
            return blogService.togglePublished(id);
          }
          return Promise.resolve();
        });
        
        await Promise.all(promises);
        
        await fetchPosts();
        await fetchStats();
        setSelectedPosts([]);
        
        alert(`${action === 'delete' ? 'Deleted' : 'Published'} ${selectedPosts.length} post(s) successfully!`);
      } catch (err) {
        console.error(`Error performing bulk ${action}:`, err);
        alert(err instanceof Error ? err.message : `Failed to ${action} posts`);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Draft';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (post: BlogPost) => {
    if (!post.published || !post.publishedDate) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Draft</span>;
    }
    
    const publishDate = new Date(post.publishedDate);
    const now = new Date();
    
    if (publishDate > now) {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Scheduled</span>;
    }
    
    return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Published</span>;
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Showing {((currentPage - 1) * postsPerPage) + 1} to {Math.min(currentPage * postsPerPage, pagination.totalItems)} of {pagination.totalItems} posts
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || loading}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {pages.map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              disabled={loading}
              className={`px-3 py-1 border rounded-md text-sm font-medium disabled:cursor-not-allowed ${
                page === currentPage
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
            disabled={currentPage === pagination.totalPages || loading}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
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
                onChange={(e) => handleSearchChange(e.target.value)}
                disabled={loading}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
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
                  onClick={() => handleViewModeChange(mode.id as 'published' | 'drafts' | 'all')}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
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
              onChange={(e) => handleCategoryChange(e.target.value)}
              disabled={loading}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
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
              onChange={(e) => handleSortChange(e.target.value)}
              disabled={loading}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
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
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Publish Selected
                  </button>
                )}
                <button
                  onClick={() => handleBulkAction('delete')}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedPosts([])}
                  disabled={loading}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading posts...</span>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833-.23 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading posts</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={fetchPosts}
                  className="mt-2 text-sm text-red-800 underline hover:text-red-900"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Posts List */}
        {!loading && !error && posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
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
                    disabled={loading}
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
                          <span>{formatDate(post.publishedDate || null)}</span>
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
                      disabled={loading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      Edit
                    </button>
                    
                    {(!post.published || !post.publishedDate) && (
                      <button
                        onClick={() => handlePublishDraft(post.id)}
                        disabled={loading}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        Publish
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      disabled={loading}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Pagination */}
            {renderPagination()}
          </div>
        ) : !loading && !error ? (
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
        ) : null}
      </div>
    </div>
  );
};