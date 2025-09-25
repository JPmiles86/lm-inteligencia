/**
 * Social Media Content - Migrated from SocialMediaModal
 * Responsive content component for social media generation within unified modal
 * Transform blog content to social media posts with platform-specific features
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useAIStore } from '../../../../store/aiStore';
import {
  Share2,
  Loader2,
  RefreshCw,
  Copy,
  Download,
  Check,
  ExternalLink,
  Hash,
  MessageSquare,
  Users,
  Camera,
  BarChart3,
  Sparkles,
  Plus,
  Settings,
  Edit,
  Trash2,
  AlertCircle,
  Target,
  Eye,
  Filter,
  X
} from 'lucide-react';

interface SocialMediaContentProps {
  activeVertical?: string;
  onClose?: () => void;
  isMobile?: boolean;
  blogContent?: string;
  blogTitle?: string;
  blogSynopsis?: string;
  onPostsGenerated?: (posts: Record<string, SocialPost[]>) => void;
}

interface SocialPost {
  id: string;
  platform: string;
  content: string;
  hashtags: string[];
  characterCount: number;
  hook: string;
  cta: string;
  variation: string;
  createdAt: string;
  isWithinLimits: boolean;
  platformLimits: {
    maxLength: number;
    hashtagLimit: number;
  };
  thread?: {
    id: string;
    content: string;
    characterCount: number;
    isWithinLimits: boolean;
  }[];
  isFallback?: boolean;
}

export const SocialMediaContent: React.FC<SocialMediaContentProps> = ({
  activeVertical,
  onClose,
  isMobile = false,
  blogContent = '',
  blogTitle = '',
  blogSynopsis = '',
  onPostsGenerated
}) => {
  const {
    activeProvider,
    activeModel,
    addNotification,
    updateAnalytics,
    updateProviderUsage
  } = useAIStore();

  // State
  const [posts, setPosts] = useState<Record<string, SocialPost[]>>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter', 'linkedin']);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [customInstructions, setCustomInstructions] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copiedPosts, setCopiedPosts] = useState<Set<string>>(new Set());
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');

  // Input state for modal content
  const [modalTitle, setModalTitle] = useState(blogTitle);
  const [modalSynopsis, setModalSynopsis] = useState(blogSynopsis);
  const [modalContent, setModalContent] = useState(blogContent);

  // Platform configurations
  const platformConfigs = {
    twitter: {
      name: 'Twitter/X',
      icon: MessageSquare,
      color: 'text-blue-500 bg-blue-50 border-blue-200',
      hoverColor: 'hover:bg-blue-100',
      maxLength: 280,
      hashtagLimit: 5,
      description: 'Short, engaging tweets with threads'
    },
    linkedin: {
      name: 'LinkedIn',
      icon: Users,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
      hoverColor: 'hover:bg-blue-100',
      maxLength: 3000,
      hashtagLimit: 5,
      description: 'Professional content with insights'
    },
    facebook: {
      name: 'Facebook',
      icon: Share2,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      hoverColor: 'hover:bg-blue-100',
      maxLength: 1000,
      hashtagLimit: 10,
      description: 'Engaging stories and discussions'
    },
    instagram: {
      name: 'Instagram',
      icon: Camera,
      color: 'text-pink-500 bg-pink-50 border-pink-200',
      hoverColor: 'hover:bg-pink-100',
      maxLength: 2200,
      hashtagLimit: 30,
      description: 'Visual captions with hashtags'
    }
  };

  // Reset modal state when props change
  useEffect(() => {
    setModalTitle(blogTitle);
    setModalSynopsis(blogSynopsis);
    setModalContent(blogContent);
  }, [blogTitle, blogSynopsis, blogContent]);

  // Generate posts for all selected platforms
  const generatePosts = useCallback(async () => {
    if (!modalTitle.trim()) {
      addNotification({
        type: 'error',
        title: 'Title Required',
        message: 'Please provide a blog title to generate social posts'
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      addNotification({
        type: 'error',
        title: 'No Platforms Selected',
        message: 'Please select at least one platform'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/ai/social-transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'transform-all',
          blogContent: modalContent,
          title: modalTitle,
          synopsis: modalSynopsis,
          platforms: selectedPlatforms,
          provider: activeProvider,
          model: activeModel,
          customInstructions
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPosts(data.results);

        // Update analytics
        updateAnalytics({
          tokens: data.tokensUsed || 0,
          cost: data.totalCost || 0,
          generations: 1
        });

        // Update provider usage
        if (data.totalCost) {
          updateProviderUsage(activeProvider, data.tokensUsed || 0, data.totalCost);
        }

        addNotification({
          type: 'success',
          title: 'Social Posts Generated',
          message: `Created ${data.totalPosts} posts across ${selectedPlatforms.length} platforms`
        });

        // Callback to parent component
        if (onPostsGenerated) {
          onPostsGenerated(data.results);
        }
      } else {
        throw new Error(data.error || 'Failed to generate social posts');
      }
    } catch (error) {
      console.error('Social media generation error:', error);
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: error instanceof Error ? error.message : 'Failed to generate social posts'
      });
    } finally {
      setLoading(false);
    }
  }, [modalTitle, modalSynopsis, modalContent, selectedPlatforms, activeProvider, activeModel, customInstructions, addNotification, updateAnalytics, updateProviderUsage, onPostsGenerated]);

  // Copy post content to clipboard
  const copyToClipboard = useCallback(async (post: SocialPost) => {
    try {
      let textToCopy = post.content;

      // Add hashtags if they exist
      if (post.hashtags && post.hashtags.length > 0) {
        textToCopy += '\n\n' + post.hashtags.join(' ');
      }

      await navigator.clipboard.writeText(textToCopy);

      setCopiedPosts(prev => new Set([...prev, post.id]));

      // Remove the copied state after 2 seconds
      setTimeout(() => {
        setCopiedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(post.id);
          return newSet;
        });
      }, 2000);

      addNotification({
        type: 'success',
        title: 'Copied!',
        message: `${platformConfigs[post.platform as keyof typeof platformConfigs]?.name} post copied to clipboard`,
        duration: 2000
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy to clipboard'
      });
    }
  }, [addNotification]);

  // Start editing a post
  const startEditing = useCallback((post: SocialPost) => {
    setEditingPost(post.id);
    setEditedContent(post.content);
  }, []);

  // Save edited post
  const saveEdit = useCallback(() => {
    if (!editingPost) return;

    setPosts(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(platform => {
        updated[platform] = updated[platform].map(post =>
          post.id === editingPost
            ? {
                ...post,
                content: editedContent,
                characterCount: editedContent.length,
                isWithinLimits: editedContent.length <= post.platformLimits.maxLength
              }
            : post
        );
      });
      return updated;
    });

    setEditingPost(null);
    setEditedContent('');

    addNotification({
      type: 'success',
      title: 'Post Updated',
      message: 'Your edits have been saved'
    });
  }, [editingPost, editedContent, addNotification]);

  // Cancel editing
  const cancelEdit = useCallback(() => {
    setEditingPost(null);
    setEditedContent('');
  }, []);

  // Delete a post
  const deletePost = useCallback((postId: string) => {
    setPosts(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(platform => {
        updated[platform] = updated[platform].filter(post => post.id !== postId);
      });
      return updated;
    });

    addNotification({
      type: 'info',
      title: 'Post Deleted',
      message: 'Post removed from your collection'
    });
  }, [addNotification]);

  // Export all posts
  const exportPosts = useCallback(() => {
    const allPosts: SocialPost[] = Object.values(posts).flat();

    if (allPosts.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Posts to Export',
        message: 'Generate some posts first'
      });
      return;
    }

    const exportData = {
      title: modalTitle,
      synopsis: modalSynopsis,
      platforms: selectedPlatforms,
      posts: posts,
      generatedAt: new Date().toISOString(),
      totalPosts: allPosts.length
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social-posts-${modalTitle.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addNotification({
      type: 'success',
      title: 'Posts Exported',
      message: 'Social media posts downloaded as JSON file'
    });
  }, [posts, modalTitle, modalSynopsis, selectedPlatforms, addNotification]);

  // Get filtered posts based on active tab
  const getFilteredPosts = useCallback(() => {
    if (activeTab === 'all') {
      return posts;
    }

    return { [activeTab]: posts[activeTab] || [] };
  }, [posts, activeTab]);

  // Count total posts
  const totalPosts = Object.values(posts).reduce((sum, platformPosts) => sum + platformPosts.length, 0);

  // Available platforms (tabs)
  const availablePlatforms = Object.keys(posts);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-lg">
            <Share2 className="h-6 w-6 text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Social Media Generator</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Transform your content for social platforms</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {totalPosts > 0 && (
            <>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {totalPosts} posts
              </div>
              <button
                onClick={exportPosts}
                className={`px-3 py-1 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-1 ${
                  isMobile ? 'min-h-[44px]' : ''
                }`}
              >
                <Download className="h-3 w-3" />
                <span>Export</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Configuration Sidebar */}
        <div className={`${isMobile ? 'w-full' : 'w-80'} border-r border-gray-200 dark:border-gray-700 p-6 space-y-6 overflow-y-auto`}>
          {/* Content Input */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 dark:text-white">Content Input</h3>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center space-x-1"
              >
                <Settings className="h-3 w-3" />
                <span>{showAdvanced ? 'Basic' : 'Advanced'}</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="modal-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Blog Title *
                </label>
                <input
                  id="modal-title"
                  type="text"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  placeholder="Enter your blog post title..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="modal-synopsis" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Synopsis/Summary
                </label>
                <textarea
                  id="modal-synopsis"
                  value={modalSynopsis}
                  onChange={(e) => setModalSynopsis(e.target.value)}
                  placeholder="Brief summary..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {showAdvanced && (
                <>
                  <div>
                    <label htmlFor="modal-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Content
                    </label>
                    <textarea
                      id="modal-content"
                      value={modalContent}
                      onChange={(e) => setModalContent(e.target.value)}
                      placeholder="Full blog content..."
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="custom-instructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Custom Instructions
                    </label>
                    <textarea
                      id="custom-instructions"
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder="Specific instructions..."
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Platform Selection */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Select Platforms</h3>
            <div className="space-y-2">
              {Object.entries(platformConfigs).map(([platform, config]) => {
                const Icon = config.icon;
                const isSelected = selectedPlatforms.includes(platform);

                return (
                  <button
                    key={platform}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedPlatforms(prev => prev.filter(p => p !== platform));
                      } else {
                        setSelectedPlatforms(prev => [...prev, platform]);
                      }
                    }}
                    className={`w-full p-3 rounded-lg border-2 transition-colors text-left ${
                      isSelected
                        ? `border-blue-500 ${config.color} dark:bg-opacity-20`
                        : `border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 ${config.hoverColor} dark:hover:bg-gray-700`
                    } ${isMobile ? 'min-h-[44px]' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
                      <div>
                        <div className="font-medium text-sm">{config.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{config.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Button */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={generatePosts}
              disabled={loading || !modalTitle.trim() || selectedPlatforms.length === 0}
              className={`w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 ${
                isMobile ? 'min-h-[44px]' : ''
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Posts</span>
                </>
              )}
            </button>

            {selectedPlatforms.length > 0 && (
              <div className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2">
                {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>
        </div>

        {/* Posts Display */}
        {!isMobile && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {totalPosts > 0 ? (
              <>
                {/* Platform Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                  <div className="flex space-x-1 overflow-x-auto">
                    <button
                      onClick={() => setActiveTab('all')}
                      className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === 'all'
                          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      All Platforms ({totalPosts})
                    </button>

                    {availablePlatforms.map(platform => {
                      const config = platformConfigs[platform as keyof typeof platformConfigs];
                      const count = posts[platform]?.length || 0;

                      if (count === 0) return null;

                      return (
                        <button
                          key={platform}
                          onClick={() => setActiveTab(platform)}
                          className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-2 ${
                            activeTab === platform
                              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <config.icon className="h-3 w-3" />
                          <span>{config.name} ({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Posts Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    {Object.entries(getFilteredPosts()).map(([platform, platformPosts]) => {
                      if (!platformPosts || platformPosts.length === 0) return null;

                      const config = platformConfigs[platform as keyof typeof platformConfigs];

                      return (
                        <div key={platform} className="space-y-4">
                          {activeTab === 'all' && (
                            <div className={`flex items-center space-x-3 pb-3 border-b ${config.color} dark:border-opacity-20`}>
                              <config.icon className="h-5 w-5" />
                              <h3 className="font-medium">{config.name}</h3>
                              <span className="text-sm opacity-75">({platformPosts.length} posts)</span>
                            </div>
                          )}

                          <div className="grid gap-4 md:grid-cols-2">
                            {platformPosts.map((post) => (
                              <div key={post.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-4">
                                {/* Post Header */}
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{post.variation}</span>
                                    {post.isFallback && (
                                      <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded">
                                        Fallback
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-1">
                                    {editingPost === post.id ? (
                                      <>
                                        <button
                                          onClick={saveEdit}
                                          className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                                          title="Save changes"
                                        >
                                          <Check className="h-3 w-3" />
                                        </button>
                                        <button
                                          onClick={cancelEdit}
                                          className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                                          title="Cancel editing"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => startEditing(post)}
                                          className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                                          title="Edit post"
                                        >
                                          <Edit className="h-3 w-3" />
                                        </button>
                                        <button
                                          onClick={() => copyToClipboard(post)}
                                          className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                                          title="Copy to clipboard"
                                        >
                                          {copiedPosts.has(post.id) ? (
                                            <Check className="h-3 w-3 text-green-600" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </button>
                                        <button
                                          onClick={() => deletePost(post.id)}
                                          className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 rounded"
                                          title="Delete post"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Post Content */}
                                <div className="space-y-3">
                                  {editingPost === post.id ? (
                                    <textarea
                                      value={editedContent}
                                      onChange={(e) => setEditedContent(e.target.value)}
                                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                                      rows={4}
                                    />
                                  ) : (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                      <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap text-sm">{post.content}</p>
                                    </div>
                                  )}

                                  {post.hashtags && post.hashtags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {post.hashtags.slice(0, 5).map((hashtag, index) => (
                                        <span
                                          key={index}
                                          className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded-full"
                                        >
                                          <Hash className="h-2 w-2 mr-1" />
                                          {hashtag.replace('#', '')}
                                        </span>
                                      ))}
                                      {post.hashtags.length > 5 && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                                          +{post.hashtags.length - 5} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Post Stats */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center space-x-3">
                                    <span className={`flex items-center space-x-1 ${post.isWithinLimits ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                      <Target className="h-3 w-3" />
                                      <span>{post.characterCount}/{post.platformLimits.maxLength}</span>
                                    </span>

                                    <span className="flex items-center space-x-1">
                                      <Hash className="h-3 w-3" />
                                      <span>{post.hashtags?.length || 0}/{post.platformLimits.hashtagLimit}</span>
                                    </span>
                                  </div>

                                  {!post.isWithinLimits && (
                                    <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                                      <AlertCircle className="h-3 w-3" />
                                      <span>Over limit</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="flex-1 flex items-center justify-center p-12">
                <div className="text-center">
                  <Share2 className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Ready to generate social posts</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Enter your content details and select platforms to get started
                  </p>
                  {!modalTitle.trim() && (
                    <p className="text-sm text-red-600 dark:text-red-400">Blog title is required</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};