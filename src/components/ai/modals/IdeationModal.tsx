// Ideation Modal - Generate and manage blog post ideas
// Provides interface for brainstorming, selecting, and converting ideas to blog posts

import React, { useState, useCallback, useEffect } from 'react';
import { useAIStore } from '../../../store/aiStore.js';
import { brainstormingService } from '../../../services/ai/BrainstormingService.js';
import { 
  X, 
  Lightbulb, 
  Loader2, 
  RefreshCw,
  Heart,
  Download,
  Bookmark,
  ArrowRight,
  Tag,
  Clock,
  BarChart3,
  Sparkles,
  Plus,
  Settings,
  Filter,
  Search
} from 'lucide-react';

interface IdeationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIdeas?: (ideas: any[]) => void;
}

interface BrainstormingIdea {
  id: string;
  title: string;
  angle: string;
  description: string;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedWordCount: number;
  isFavorited: boolean;
  createdAt: string;
  score: number;
  metadata?: {
    generatedFromTopic: string;
    generationIndex: number;
    fallback?: boolean;
  };
}

interface GenerationConfig {
  topic: string;
  count: number;
  vertical: string;
  tone: string;
  contentTypes: string[];
  customContext: string;
}

export const IdeationModal: React.FC<IdeationModalProps> = ({
  isOpen,
  onClose,
  onSelectIdeas
}) => {
  const {
    activeProvider,
    activeModel,
    addNotification,
    updateAnalytics,
    updateProviderUsage
  } = useAIStore();

  // State
  const [ideas, setIdeas] = useState<BrainstormingIdea[]>([]);
  const [selectedIdeas, setSelectedIdeas] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'title' | 'createdAt' | 'difficulty'>('score');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Generation configuration
  const [config, setConfig] = useState<GenerationConfig>({
    topic: '',
    count: 10,
    vertical: 'all',
    tone: 'professional',
    contentTypes: [],
    customContext: ''
  });

  // Available options
  const verticalOptions = [
    { value: 'all', label: 'All Verticals' },
    { value: 'hospitality', label: 'Hospitality' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'tech', label: 'Technology' },
    { value: 'athletics', label: 'Athletics' }
  ];

  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'authoritative', label: 'Authoritative' },
    { value: 'conversational', label: 'Conversational' }
  ];

  const contentTypeOptions = [
    { value: 'how-to', label: 'How-to Guides' },
    { value: 'listicle', label: 'Listicles' },
    { value: 'tutorial', label: 'Tutorials' },
    { value: 'comparison', label: 'Comparisons' },
    { value: 'case-study', label: 'Case Studies' },
    { value: 'guide', label: 'Comprehensive Guides' },
    { value: 'tips', label: 'Tips & Tricks' }
  ];

  const countOptions = [5, 10, 15, 20];

  // Generate ideas
  const handleGenerateIdeas = useCallback(async () => {
    if (!config.topic.trim()) {
      addNotification({
        type: 'warning',
        title: 'Missing Topic',
        message: 'Please enter a topic to generate ideas',
        duration: 3000
      });
      return;
    }

    setLoading(true);
    try {
      const result = await brainstormingService.generateIdeas({
        topic: config.topic,
        count: config.count,
        vertical: config.vertical,
        tone: config.tone,
        contentTypes: config.contentTypes,
        provider: activeProvider,
        model: activeModel,
        customContext: config.customContext
      });

      if (result.success) {
        setIdeas(result.ideas);
        setSelectedIdeas(new Set());

        // Update analytics
        updateAnalytics({
          tokens: result.tokensUsed,
          cost: result.cost,
          generations: 1
        });

        updateProviderUsage(activeProvider, result.tokensUsed || 0, result.cost || 0);

        addNotification({
          type: 'success',
          title: 'Ideas Generated',
          message: `Generated ${result.ideas.length} unique blog post ideas`,
          duration: 4000
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Generation Failed',
          message: result.error || 'Failed to generate ideas',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('[IdeationModal] Error generating ideas:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to generate ideas. Please try again.',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  }, [config, activeProvider, activeModel, addNotification, updateAnalytics, updateProviderUsage]);

  // Toggle idea selection
  const toggleIdeaSelection = useCallback((ideaId: string) => {
    const newSelected = new Set(selectedIdeas);
    if (newSelected.has(ideaId)) {
      newSelected.delete(ideaId);
    } else {
      newSelected.add(ideaId);
    }
    setSelectedIdeas(newSelected);
  }, [selectedIdeas]);

  // Toggle favorite
  const toggleFavorite = useCallback((ideaId: string) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === ideaId ? { ...idea, isFavorited: !idea.isFavorited } : idea
    ));
  }, []);

  // Filter and sort ideas
  const filteredAndSortedIdeas = React.useMemo(() => {
    let filtered = ideas;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(idea =>
        idea.title.toLowerCase().includes(term) ||
        idea.description.toLowerCase().includes(term) ||
        idea.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Tag filter
    if (filterTags.length > 0) {
      filtered = filtered.filter(idea =>
        filterTags.some(tag => idea.tags.includes(tag))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'difficulty':
          const difficultyOrder = { 'Beginner': 0, 'Intermediate': 1, 'Advanced': 2 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        default:
          return 0;
      }
    });

    return filtered;
  }, [ideas, searchTerm, filterTags, sortBy]);

  // Get unique tags from all ideas
  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    ideas.forEach(idea => idea.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [ideas]);

  // Handle content type toggle
  const toggleContentType = useCallback((type: string) => {
    setConfig(prev => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(type)
        ? prev.contentTypes.filter(t => t !== type)
        : [...prev.contentTypes, type]
    }));
  }, []);

  // Convert selected ideas to blog generation
  const handleConvertToBlogs = useCallback(() => {
    const selectedIdeasArray = ideas.filter(idea => selectedIdeas.has(idea.id));
    
    if (selectedIdeasArray.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Ideas Selected',
        message: 'Please select at least one idea to convert to blog generation',
        duration: 3000
      });
      return;
    }

    if (onSelectIdeas) {
      onSelectIdeas(selectedIdeasArray);
    }

    addNotification({
      type: 'success',
      title: 'Ideas Converted',
      message: `${selectedIdeasArray.length} ideas ready for blog generation`,
      duration: 4000
    });

    onClose();
  }, [ideas, selectedIdeas, onSelectIdeas, addNotification, onClose]);

  // Export ideas
  const handleExport = useCallback(async () => {
    const ideasToExport = ideas.filter(idea => selectedIdeas.has(idea.id));
    
    if (ideasToExport.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Ideas Selected',
        message: 'Please select ideas to export',
        duration: 3000
      });
      return;
    }

    const result = await brainstormingService.exportIdeas(ideasToExport, 'json');
    
    if (result.success) {
      addNotification({
        type: 'success',
        title: 'Export Complete',
        message: `Downloaded ${result.ideaCount} ideas as ${result.format?.toUpperCase() || 'file'}`,
        duration: 3000
      });
    } else {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: result.error || 'Failed to export ideas',
        duration: 5000
      });
    }
  }, [ideas, selectedIdeas, addNotification]);

  // Reset modal state when closed
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setFilterTags([]);
      setSelectedIdeas(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'text-green-600 bg-green-50';
      case 'Intermediate':
        return 'text-yellow-600 bg-yellow-50';
      case 'Advanced':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Lightbulb className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  AI Brainstorming Studio
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Generate creative blog post ideas with AI assistance
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleExport}
                disabled={selectedIdeas.size === 0}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export selected ideas"
              >
                <Download className="h-4 w-4" />
              </button>

              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Configuration Sidebar */}
            <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Topic Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Topic <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={config.topic}
                    onChange={(e) => setConfig(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., Digital Marketing, Content Strategy..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Count Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Ideas
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {countOptions.map(count => (
                      <button
                        key={count}
                        onClick={() => setConfig(prev => ({ ...prev, count }))}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          config.count === count
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vertical Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Industry/Vertical
                  </label>
                  <select
                    value={config.vertical}
                    onChange={(e) => setConfig(prev => ({ ...prev, vertical: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {verticalOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tone Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tone
                  </label>
                  <select
                    value={config.tone}
                    onChange={(e) => setConfig(prev => ({ ...prev, tone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {toneOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Advanced Options Toggle */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <Settings className="h-4 w-4" />
                  <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
                </button>

                {showAdvanced && (
                  <>
                    {/* Content Types */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Content Types (Optional)
                      </label>
                      <div className="space-y-1">
                        {contentTypeOptions.map(option => (
                          <label key={option.value} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={config.contentTypes.includes(option.value)}
                              onChange={() => toggleContentType(option.value)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Custom Context */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Additional Context
                      </label>
                      <textarea
                        value={config.customContext}
                        onChange={(e) => setConfig(prev => ({ ...prev, customContext: e.target.value }))}
                        placeholder="Any specific requirements, target audience, or context..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </>
                )}

                {/* Generate Button */}
                <button
                  onClick={handleGenerateIdeas}
                  disabled={!config.topic.trim() || loading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate Ideas
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Ideas Header */}
              {ideas.length > 0 && (
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Generated Ideas ({filteredAndSortedIdeas.length})
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedIdeas.size} selected
                      </p>
                    </div>
                    
                    {selectedIdeas.size > 0 && (
                      <button
                        onClick={handleConvertToBlogs}
                        className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Convert to Blogs
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </button>
                    )}
                  </div>

                  {/* Search and Filters */}
                  <div className="flex items-center space-x-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search ideas..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Sort */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="score">Sort by Score</option>
                      <option value="title">Sort by Title</option>
                      <option value="createdAt">Sort by Date</option>
                      <option value="difficulty">Sort by Difficulty</option>
                    </select>
                  </div>

                  {/* Tag Filters */}
                  {allTags.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Filter by tags:</span>
                        <div className="flex flex-wrap gap-2">
                          {allTags.slice(0, 8).map(tag => (
                            <button
                              key={tag}
                              onClick={() => {
                                setFilterTags(prev => 
                                  prev.includes(tag) 
                                    ? prev.filter(t => t !== tag)
                                    : [...prev, tag]
                                );
                              }}
                              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                                filterTags.includes(tag)
                                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Ideas List */}
              <div className="flex-1 overflow-y-auto p-6">
                {ideas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <Lightbulb className="h-16 w-16 mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">Ready to Brainstorm?</h3>
                    <p className="text-center max-w-md">
                      Enter a topic and configure your preferences to generate creative blog post ideas with AI assistance.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredAndSortedIdeas.map(idea => (
                      <div
                        key={idea.id}
                        className={`p-5 border rounded-lg transition-all cursor-pointer hover:shadow-md ${
                          selectedIdeas.has(idea.id)
                            ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => toggleIdeaSelection(idea.id)}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                              {idea.title}
                            </h4>
                            <div className="flex items-center mt-1 space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(idea.difficulty)}`}>
                                {idea.difficulty}
                              </span>
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <BarChart3 className="h-3 w-3 mr-1" />
                                Score: {idea.score}
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(idea.id);
                            }}
                            className={`p-1 rounded transition-colors ${
                              idea.isFavorited
                                ? 'text-red-500 hover:text-red-600'
                                : 'text-gray-400 hover:text-red-500'
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${idea.isFavorited ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        {/* Angle */}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
                          Angle: {idea.angle}
                        </p>

                        {/* Description */}
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                          {idea.description}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            {idea.tags.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                            {idea.tags.length > 3 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                +{idea.tags.length - 3} more
                              </span>
                            )}
                          </div>

                          {/* Word Count */}
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            ~{idea.estimatedWordCount} words
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};