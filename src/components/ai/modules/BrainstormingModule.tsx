// Brainstorming Module - Generate and manage blog post ideas
// Provides tools for creative ideation with AI assistance

import React, { useState, useCallback, useEffect } from 'react';
import { useAIStore } from '../../../store/aiStore';
import { brainstormingService } from '../../../services/ai/BrainstormingService';
import { 
  Lightbulb, 
  Loader2, 
  RefreshCw,
  Heart,
  Download,
  ArrowRight,
  Tag,
  Clock,
  BarChart3,
  Sparkles,
  Settings,
  Filter,
  Search,
  Plus,
  Bookmark,
  Grid3X3,
  List,
  Trash2
} from 'lucide-react';

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

interface BrainstormingModuleProps {
  onConvertToBlogs?: (ideas: BrainstormingIdea[]) => void;
  className?: string;
}

export const BrainstormingModule: React.FC<BrainstormingModuleProps> = ({
  onConvertToBlogs,
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
  const [ideas, setIdeas] = useState<BrainstormingIdea[]>([]);
  const [selectedIdeas, setSelectedIdeas] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'title' | 'createdAt' | 'difficulty'>('score');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Configuration state
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(10);
  const [vertical, setVertical] = useState('all');
  const [tone, setTone] = useState('professional');
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [customContext, setCustomContext] = useState('');

  // Options
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
    if (!topic.trim()) {
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
        topic: topic,
        count: count,
        vertical: vertical,
        tone: tone,
        contentTypes: contentTypes,
        provider: activeProvider,
        model: activeModel,
        customContext: customContext
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
      console.error('[BrainstormingModule] Error generating ideas:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to generate ideas. Please try again.',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  }, [topic, count, vertical, tone, contentTypes, customContext, activeProvider, activeModel, addNotification, updateAnalytics, updateProviderUsage]);

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

  // Select all ideas
  const toggleSelectAll = useCallback(() => {
    if (selectedIdeas.size === filteredAndSortedIdeas.length) {
      setSelectedIdeas(new Set());
    } else {
      setSelectedIdeas(new Set(filteredAndSortedIdeas.map(idea => idea.id)));
    }
  }, [selectedIdeas, ideas]);

  // Toggle favorite
  const toggleFavorite = useCallback((ideaId: string) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === ideaId ? { ...idea, isFavorited: !idea.isFavorited } : idea
    ));
  }, []);

  // Delete idea
  const deleteIdea = useCallback((ideaId: string) => {
    setIdeas(prev => prev.filter(idea => idea.id !== ideaId));
    setSelectedIdeas(prev => {
      const newSelected = new Set(prev);
      newSelected.delete(ideaId);
      return newSelected;
    });
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
    setContentTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
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

    if (onConvertToBlogs) {
      onConvertToBlogs(selectedIdeasArray);
    }

    addNotification({
      type: 'success',
      title: 'Ideas Converted',
      message: `${selectedIdeasArray.length} ideas ready for blog generation`,
      duration: 4000
    });
  }, [ideas, selectedIdeas, onConvertToBlogs, addNotification]);

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
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
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

        {/* Configuration Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Topic Input */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Digital Marketing, Content Strategy..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button
              onClick={handleGenerateIdeas}
              disabled={!topic.trim() || loading}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Ideas
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Configuration */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Count */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Count</label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {countOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Vertical */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Industry</label>
            <select
              value={vertical}
              onChange={(e) => setVertical(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {verticalOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tone */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {toneOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Advanced Toggle */}
          <div className="flex items-end">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-center px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            >
              <Settings className="h-4 w-4 mr-1" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </button>
          </div>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Content Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content Types (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {contentTypeOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => toggleContentType(option.value)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        contentTypes.includes(option.value)
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Context */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Context
                </label>
                <textarea
                  value={customContext}
                  onChange={(e) => setCustomContext(e.target.value)}
                  placeholder="Any specific requirements, target audience, or context..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ideas Section */}
      {ideas.length > 0 && (
        <>
          {/* Ideas Header */}
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
              
              <div className="flex items-center space-x-2">
                {/* View Toggle */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                {/* Actions */}
                {selectedIdeas.size > 0 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleExport}
                      className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </button>
                    
                    <button
                      onClick={handleConvertToBlogs}
                      className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                    >
                      Convert to Blogs
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                )}
              </div>
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

              {/* Select All */}
              <button
                onClick={toggleSelectAll}
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {selectedIdeas.size === filteredAndSortedIdeas.length ? 'Deselect All' : 'Select All'}
              </button>
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

          {/* Ideas List */}
          <div className="p-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedIdeas.map(idea => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    isSelected={selectedIdeas.has(idea.id)}
                    onToggleSelection={() => toggleIdeaSelection(idea.id)}
                    onToggleFavorite={() => toggleFavorite(idea.id)}
                    onDelete={() => deleteIdea(idea.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedIdeas.map(idea => (
                  <IdeaListItem
                    key={idea.id}
                    idea={idea}
                    isSelected={selectedIdeas.has(idea.id)}
                    onToggleSelection={() => toggleIdeaSelection(idea.id)}
                    onToggleFavorite={() => toggleFavorite(idea.id)}
                    onDelete={() => deleteIdea(idea.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty State */}
      {ideas.length === 0 && (
        <div className="p-12">
          <div className="text-center">
            <Lightbulb className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Ready to Brainstorm?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Enter a topic above and configure your preferences to generate creative blog post ideas with AI assistance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Idea Card Component
interface IdeaCardProps {
  idea: BrainstormingIdea;
  isSelected: boolean;
  onToggleSelection: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
}

const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  isSelected,
  onToggleSelection,
  onToggleFavorite,
  onDelete
}) => {
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
    <div
      className={`p-5 border rounded-lg transition-all cursor-pointer hover:shadow-md ${
        isSelected
          ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      onClick={onToggleSelection}
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
        
        <div className="flex items-center space-x-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`p-1 rounded transition-colors ${
              idea.isFavorited
                ? 'text-red-500 hover:text-red-600'
                : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart className={`h-4 w-4 ${idea.isFavorited ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
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
  );
};

// Idea List Item Component
const IdeaListItem: React.FC<IdeaCardProps> = ({
  idea,
  isSelected,
  onToggleSelection,
  onToggleFavorite,
  onDelete
}) => {
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
    <div
      className={`p-4 border rounded-lg transition-all cursor-pointer hover:shadow-sm ${
        isSelected
          ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      onClick={onToggleSelection}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
              {idea.title}
            </h4>
            
            <div className="flex items-center space-x-2 ml-4">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(idea.difficulty)}`}>
                {idea.difficulty}
              </span>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <BarChart3 className="h-3 w-3 mr-1" />
                {idea.score}
              </div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3 mr-1" />
                ~{idea.estimatedWordCount}w
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
            {idea.angle}
          </p>

          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            {idea.description}
          </p>

          <div className="flex flex-wrap gap-1">
            {idea.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-1 ml-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`p-1 rounded transition-colors ${
              idea.isFavorited
                ? 'text-red-500 hover:text-red-600'
                : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart className={`h-4 w-4 ${idea.isFavorited ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};