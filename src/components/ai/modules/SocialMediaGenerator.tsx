// Social Media Generator Module - Transform blog content to social media posts
// Provides tools for content transformation across multiple platforms

import React, { useState, useCallback, useEffect } from 'react';
import { useAIStore } from '../../../store/aiStore';
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
  Settings,
  Filter,
  Grid3X3,
  List,
  Edit,
  Trash2,
  Plus,
  AlertCircle,
  Sparkles,
  Eye,
  Target
} from 'lucide-react';

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

interface SocialMediaGeneratorProps {
  blogContent?: string;
  blogTitle?: string;
  blogSynopsis?: string;
  onPostsGenerated?: (posts: Record<string, SocialPost[]>) => void;
  className?: string;
}

export const SocialMediaGenerator: React.FC<SocialMediaGeneratorProps> = ({
  blogContent = '',
  blogTitle = '',
  blogSynopsis = '',
  onPostsGenerated,
  className = ''
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [customInstructions, setCustomInstructions] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copiedPosts, setCopiedPosts] = useState<Set<string>>(new Set());
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');

  // Input state for manual content entry
  const [manualTitle, setManualTitle] = useState(blogTitle);
  const [manualSynopsis, setManualSynopsis] = useState(blogSynopsis);
  const [manualContent, setManualContent] = useState(blogContent);

  // Platform configurations
  const platformConfigs = {
    twitter: {
      name: 'Twitter/X',
      icon: MessageSquare,
      color: 'text-blue-500 bg-blue-50',
      maxLength: 280,
      hashtagLimit: 5,
      description: 'Short, engaging tweets with threads'
    },
    linkedin: {
      name: 'LinkedIn',
      icon: Users,
      color: 'text-blue-700 bg-blue-50',
      maxLength: 3000,
      hashtagLimit: 5,
      description: 'Professional content with insights'
    },
    facebook: {
      name: 'Facebook',
      icon: Share2,
      color: 'text-blue-600 bg-blue-50',
      maxLength: 1000,
      hashtagLimit: 10,
      description: 'Engaging stories and discussions'
    },
    instagram: {
      name: 'Instagram',
      icon: Camera,
      color: 'text-pink-500 bg-pink-50',
      maxLength: 2200,
      hashtagLimit: 30,
      description: 'Visual captions with hashtags'
    }
  };

  // Generate posts for all selected platforms
  const generatePosts = useCallback(async () => {
    if (!manualTitle.trim()) {
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
          blogContent: manualContent,
          title: manualTitle,
          synopsis: manualSynopsis,
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
  }, [manualTitle, manualSynopsis, manualContent, selectedPlatforms, activeProvider, activeModel, customInstructions, addNotification, updateAnalytics, updateProviderUsage, onPostsGenerated]);

  // Generate variations for a specific platform
  const generateVariations = useCallback(async (platform: string) => {
    if (!manualContent && !manualTitle) {
      addNotification({
        type: 'error',
        title: 'Content Required',
        message: 'Please provide content to generate variations'
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
          action: 'generate-variations',
          baseContent: manualContent || manualTitle,
          platform,
          count: 3,
          style: 'engaging',
          provider: activeProvider,
          model: activeModel
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPosts(prev => ({
          ...prev,
          [platform]: [...(prev[platform] || []), ...data.variations]
        }));

        addNotification({
          type: 'success',
          title: 'Variations Generated',
          message: `Added ${data.count} new variations for ${platformConfigs[platform as keyof typeof platformConfigs]?.name}`
        });
      } else {
        throw new Error(data.error || 'Failed to generate variations');
      }
    } catch (error) {
      console.error('Variation generation error:', error);
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: error instanceof Error ? error.message : 'Failed to generate variations'
      });
    } finally {
      setLoading(false);
    }
  }, [manualContent, manualTitle, activeProvider, activeModel, addNotification]);

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
      title: manualTitle,
      synopsis: manualSynopsis,
      platforms: selectedPlatforms,
      posts: posts,
      generatedAt: new Date().toISOString(),
      totalPosts: allPosts.length
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social-posts-${manualTitle.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addNotification({
      type: 'success',
      title: 'Posts Exported',
      message: 'Social media posts downloaded as JSON file'
    });
  }, [posts, manualTitle, manualSynopsis, selectedPlatforms, addNotification]);

  // Get platform icon component
  const getPlatformIcon = (platform: string) => {
    const config = platformConfigs[platform as keyof typeof platformConfigs];
    return config ? config.icon : Share2;
  };

  // Get platform color classes
  const getPlatformColor = (platform: string) => {
    const config = platformConfigs[platform as keyof typeof platformConfigs];
    return config ? config.color : 'text-gray-500 bg-gray-50';
  };

  // Count total posts
  const totalPosts = Object.values(posts).reduce((sum, platformPosts) => sum + platformPosts.length, 0);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-pink-100 rounded-lg">
            <Share2 className="h-6 w-6 text-pink-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Social Media Generator</h2>
            <p className="text-sm text-gray-600">Transform your content for social platforms</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <BarChart3 className="h-4 w-4" />
            <span>{totalPosts} posts</span>
          </div>
          
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
        {/* Content Input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Content Input</h3>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <Settings className="h-4 w-4" />
              <span>{showAdvanced ? 'Hide' : 'Show'} Advanced</span>
            </button>
          </div>
          
          <div className="grid gap-4">
            <div>
              <label htmlFor="manual-title" className="block text-sm font-medium text-gray-700 mb-2">
                Blog Title *
              </label>
              <input
                id="manual-title"
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="Enter your blog post title..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="manual-synopsis" className="block text-sm font-medium text-gray-700 mb-2">
                Synopsis/Summary
              </label>
              <textarea
                id="manual-synopsis"
                value={manualSynopsis}
                onChange={(e) => setManualSynopsis(e.target.value)}
                placeholder="Brief summary of your blog post..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            
            {showAdvanced && (
              <>
                <div>
                  <label htmlFor="manual-content" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Content (Optional)
                  </label>
                  <textarea
                    id="manual-content"
                    value={manualContent}
                    onChange={(e) => setManualContent(e.target.value)}
                    placeholder="Paste your full blog content for better context..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                
                <div>
                  <label htmlFor="custom-instructions" className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Instructions
                  </label>
                  <textarea
                    id="custom-instructions"
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="Any specific instructions for the social media posts..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Platform Selection */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Select Platforms</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                  className={`p-4 rounded-lg border-2 transition-colors text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                    <span className="font-medium">{config.name}</span>
                  </div>
                  <p className="text-xs text-gray-600">{config.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
          </div>
          
          <div className="flex items-center space-x-3">
            {totalPosts > 0 && (
              <>
                <button
                  onClick={exportPosts}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </>
            )}
            
            <button
              onClick={generatePosts}
              disabled={loading || !manualTitle.trim() || selectedPlatforms.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
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
          </div>
        </div>
      </div>

      {/* Generated Posts */}
      {totalPosts > 0 && (
        <div className="space-y-6">
          {Object.entries(posts).map(([platform, platformPosts]) => {
            if (platformPosts.length === 0) return null;
            
            const Icon = getPlatformIcon(platform);
            const config = platformConfigs[platform as keyof typeof platformConfigs];
            
            return (
              <div key={platform} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {/* Platform Header */}
                <div className={`px-6 py-4 border-b border-gray-200 ${getPlatformColor(platform)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <div>
                        <h3 className="font-medium">{config?.name}</h3>
                        <p className="text-sm opacity-75">{platformPosts.length} post{platformPosts.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => generateVariations(platform)}
                      disabled={loading}
                      className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center space-x-1"
                      title="Generate more variations"
                    >
                      <Plus className="h-3 w-3" />
                      <span>More</span>
                    </button>
                  </div>
                </div>

                {/* Posts List */}
                <div className="p-6">
                  <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2' : 'space-y-6'}>
                    {platformPosts.map((post) => (
                      <div key={post.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                        {/* Post Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{post.variation}</span>
                            {post.isFallback && (
                              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                                Fallback
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {editingPost === post.id ? (
                              <>
                                <button
                                  onClick={saveEdit}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                  title="Save changes"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                                  title="Cancel editing"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditing(post)}
                                  className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                                  title="Edit post"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => copyToClipboard(post)}
                                  className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                                  title="Copy to clipboard"
                                >
                                  {copiedPosts.has(post.id) ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => deletePost(post.id)}
                                  className="p-1 text-gray-600 hover:bg-gray-50 hover:text-red-600 rounded"
                                  title="Delete post"
                                >
                                  <Trash2 className="h-4 w-4" />
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
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              rows={4}
                            />
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
                            </div>
                          )}
                          
                          {post.hashtags && post.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {post.hashtags.map((hashtag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                                >
                                  <Hash className="h-3 w-3 mr-1" />
                                  {hashtag.replace('#', '')}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Post Stats */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className={`flex items-center space-x-1 ${post.isWithinLimits ? 'text-green-600' : 'text-red-600'}`}>
                              <Target className="h-3 w-3" />
                              <span>{post.characterCount}/{post.platformLimits.maxLength}</span>
                            </span>
                            
                            <span className="flex items-center space-x-1">
                              <Hash className="h-3 w-3" />
                              <span>{post.hashtags?.length || 0}/{post.platformLimits.hashtagLimit}</span>
                            </span>
                          </div>
                          
                          {!post.isWithinLimits && (
                            <div className="flex items-center space-x-1 text-red-600 text-sm">
                              <AlertCircle className="h-3 w-3" />
                              <span>Over limit</span>
                            </div>
                          )}
                        </div>

                        {/* Thread Support (Twitter only) */}
                        {post.thread && post.thread.length > 0 && (
                          <div className="space-y-2 pt-3 border-t border-gray-200">
                            <div className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                              <MessageSquare className="h-4 w-4" />
                              <span>Thread ({post.thread.length} tweets)</span>
                            </div>
                            
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {post.thread.map((tweet, index) => (
                                <div key={tweet.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                                  <div className="flex items-start space-x-2">
                                    <span className="text-xs text-gray-500 mt-1">{index + 1}/</span>
                                    <p className="flex-1">{tweet.content}</p>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-2">
                                    {tweet.characterCount}/280 chars
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {totalPosts === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No social posts yet</h3>
          <p className="text-gray-600 mb-4">
            Enter your blog title and select platforms to generate social media posts
          </p>
        </div>
      )}
    </div>
  );
};

export default SocialMediaGenerator;