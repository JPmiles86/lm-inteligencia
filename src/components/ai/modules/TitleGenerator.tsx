// Title Generator Module - Generate and optimize blog post titles
// Features: Multiple variations, SEO scoring, A/B testing, templates

import React, { useState, useCallback, useEffect } from 'react';
import { useAIStore } from '../../../store/aiStore';
import { 
  Type, 
  Loader2, 
  RefreshCw,
  Star,
  Copy,
  Download,
  ArrowRight,
  BarChart3,
  Target,
  Settings,
  Filter,
  Search,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Hash,
  Clock
} from 'lucide-react';

interface TitleVariation {
  id: string;
  title: string;
  seoScore: number;
  characterCount: number;
  template: string;
  keywords: string[];
  hook: 'question' | 'how-to' | 'listicle' | 'urgency' | 'benefit' | 'curiosity';
  selected: boolean;
  edited: boolean;
  originalTitle?: string;
  createdAt: string;
  abTestGroup?: 'A' | 'B';
}

interface TitleGeneratorProps {
  topic?: string;
  context?: string;
  onTitleSelected?: (title: TitleVariation) => void;
  onMultipleTitlesSelected?: (titles: TitleVariation[]) => void;
  className?: string;
  mode?: 'standalone' | 'structured';
  existingTitles?: TitleVariation[];
}

export const TitleGenerator: React.FC<TitleGeneratorProps> = ({
  topic: initialTopic = '',
  context = '',
  onTitleSelected,
  onMultipleTitlesSelected,
  className = '',
  mode = 'standalone',
  existingTitles = []
}) => {
  const {
    activeProvider,
    activeModel,
    addNotification,
    updateAnalytics,
    updateProviderUsage
  } = useAIStore();

  // State
  const [titles, setTitles] = useState<TitleVariation[]>(existingTitles);
  const [selectedTitles, setSelectedTitles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTemplate, setFilterTemplate] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'seoScore' | 'characterCount' | 'createdAt' | 'template'>('seoScore');
  
  // Configuration state
  const [topic, setTopic] = useState(initialTopic);
  const [count, setCount] = useState(8);
  const [includeTemplates, setIncludeTemplates] = useState<string[]>(['how-to', 'listicle', 'question']);
  const [targetKeywords, setTargetKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [seoTarget, setSeoTarget] = useState<'organic' | 'social' | 'balanced'>('balanced');
  const [abTestMode, setAbTestMode] = useState(false);

  // Template options
  const titleTemplates = [
    { value: 'how-to', label: 'How-to Guides', example: 'How to Master [Topic] in 2025' },
    { value: 'listicle', label: 'List Articles', example: '10 Essential [Topic] Tips' },
    { value: 'question', label: 'Questions', example: 'What is [Topic]? Complete Guide' },
    { value: 'comparison', label: 'Comparisons', example: '[Topic] vs [Alternative]: Which is Better?' },
    { value: 'ultimate', label: 'Ultimate Guides', example: 'The Ultimate Guide to [Topic]' },
    { value: 'beginner', label: 'Beginner Guides', example: '[Topic] for Beginners: Start Here' },
    { value: 'advanced', label: 'Advanced Tips', example: 'Advanced [Topic] Techniques' },
    { value: 'trends', label: 'Trends & Future', example: '[Topic] Trends to Watch in 2025' },
    { value: 'mistakes', label: 'Common Mistakes', example: '5 [Topic] Mistakes to Avoid' },
    { value: 'case-study', label: 'Case Studies', example: 'How We Improved [Topic] by 300%' }
  ];

  // Generate titles
  const handleGenerateTitles = useCallback(async () => {
    if (!topic.trim()) {
      addNotification({
        type: 'warning',
        title: 'Missing Topic',
        message: 'Please enter a topic to generate titles',
        duration: 3000
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate-titles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate-titles',
          topic: topic,
          context: context,
          count: count,
          templates: includeTemplates,
          keywords: targetKeywords,
          seoTarget: seoTarget,
          abTestMode: abTestMode,
          provider: activeProvider,
          model: activeModel
        }),
      });

      const result = await response.json();

      if (result.success) {
        const newTitles = result.titles.map((title: any) => ({
          ...title,
          id: `title_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          selected: false,
          edited: false,
          createdAt: new Date().toISOString(),
          abTestGroup: abTestMode && Math.random() > 0.5 ? 'B' : 'A'
        }));

        setTitles(prev => [...prev, ...newTitles]);
        setSelectedTitles(new Set());

        // Update analytics
        updateAnalytics({
          tokens: result.tokensUsed,
          cost: result.cost,
          generations: 1
        });

        updateProviderUsage(activeProvider, result.tokensUsed || 0, result.cost || 0);

        addNotification({
          type: 'success',
          title: 'Titles Generated',
          message: `Generated ${result.titles.length} title variations`,
          duration: 4000
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Generation Failed',
          message: result.error || 'Failed to generate titles',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('[TitleGenerator] Error generating titles:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to generate titles. Please try again.',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  }, [topic, context, count, includeTemplates, targetKeywords, seoTarget, abTestMode, activeProvider, activeModel, addNotification, updateAnalytics, updateProviderUsage]);

  // Toggle title selection
  const toggleTitleSelection = useCallback((titleId: string) => {
    const newSelected = new Set(selectedTitles);
    if (newSelected.has(titleId)) {
      newSelected.delete(titleId);
    } else {
      newSelected.add(titleId);
    }
    setSelectedTitles(newSelected);
    
    // Update titles state
    setTitles(prev => prev.map(title => 
      title.id === titleId ? { ...title, selected: !title.selected } : title
    ));
  }, [selectedTitles]);

  // Start editing title
  const startEditing = useCallback((titleId: string, currentText: string) => {
    setEditingId(titleId);
    setEditingText(currentText);
  }, []);

  // Save edited title
  const saveEdit = useCallback((titleId: string) => {
    if (editingText.trim()) {
      setTitles(prev => prev.map(title => 
        title.id === titleId ? { 
          ...title, 
          title: editingText.trim(),
          edited: true,
          originalTitle: title.originalTitle || title.title,
          characterCount: editingText.trim().length,
          seoScore: calculateSEOScore(editingText.trim(), targetKeywords)
        } : title
      ));
    }
    setEditingId(null);
    setEditingText('');
  }, [editingText, targetKeywords]);

  // Delete title
  const deleteTitle = useCallback((titleId: string) => {
    setTitles(prev => prev.filter(title => title.id !== titleId));
    setSelectedTitles(prev => {
      const newSelected = new Set(prev);
      newSelected.delete(titleId);
      return newSelected;
    });
  }, []);

  // Copy title to clipboard
  const copyTitle = useCallback(async (title: string) => {
    try {
      await navigator.clipboard.writeText(title);
      addNotification({
        type: 'success',
        title: 'Copied',
        message: 'Title copied to clipboard',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      addNotification({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy title to clipboard',
        duration: 3000
      });
    }
  }, [addNotification]);

  // Regenerate specific title
  const regenerateTitle = useCallback(async (titleId: string) => {
    const title = titles.find(t => t.id === titleId);
    if (!title || !topic) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate-titles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'regenerate-single',
          topic: topic,
          context: context,
          template: title.template,
          keywords: targetKeywords,
          seoTarget: seoTarget,
          provider: activeProvider,
          model: activeModel
        }),
      });

      const result = await response.json();

      if (result.success && result.title) {
        const newTitle = {
          ...result.title,
          id: titleId,
          selected: title.selected,
          edited: false,
          createdAt: new Date().toISOString(),
          abTestGroup: title.abTestGroup
        };

        setTitles(prev => prev.map(t => t.id === titleId ? newTitle : t));

        addNotification({
          type: 'success',
          title: 'Title Regenerated',
          message: 'New title variation generated',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('[TitleGenerator] Error regenerating title:', error);
      addNotification({
        type: 'error',
        title: 'Regeneration Failed',
        message: 'Failed to regenerate title',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  }, [titles, topic, context, targetKeywords, seoTarget, activeProvider, activeModel, addNotification]);

  // Add keyword
  const addKeyword = useCallback(() => {
    if (keywordInput.trim() && !targetKeywords.includes(keywordInput.trim())) {
      setTargetKeywords(prev => [...prev, keywordInput.trim()]);
      setKeywordInput('');
    }
  }, [keywordInput, targetKeywords]);

  // Remove keyword
  const removeKeyword = useCallback((keyword: string) => {
    setTargetKeywords(prev => prev.filter(k => k !== keyword));
  }, []);

  // Template toggle
  const toggleTemplate = useCallback((template: string) => {
    setIncludeTemplates(prev => 
      prev.includes(template)
        ? prev.filter(t => t !== template)
        : [...prev, template]
    );
  }, []);

  // Handle selection for external use
  const handleUseSelected = useCallback(() => {
    const selectedTitlesList = titles.filter(title => selectedTitles.has(title.id));
    
    if (selectedTitlesList.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Titles Selected',
        message: 'Please select at least one title to use',
        duration: 3000
      });
      return;
    }

    if (selectedTitlesList.length === 1) {
      onTitleSelected?.(selectedTitlesList[0]);
    } else {
      onMultipleTitlesSelected?.(selectedTitlesList);
    }

    addNotification({
      type: 'success',
      title: 'Titles Selected',
      message: `${selectedTitlesList.length} title(s) ready for use`,
      duration: 3000
    });
  }, [titles, selectedTitles, onTitleSelected, onMultipleTitlesSelected, addNotification]);

  // Filter and sort titles
  const filteredAndSortedTitles = React.useMemo(() => {
    let filtered = titles;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(title =>
        title.title.toLowerCase().includes(term) ||
        title.template.toLowerCase().includes(term) ||
        title.keywords.some(k => k.toLowerCase().includes(term))
      );
    }

    // Template filter
    if (filterTemplate !== 'all') {
      filtered = filtered.filter(title => title.template === filterTemplate);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'seoScore':
          return b.seoScore - a.seoScore;
        case 'characterCount':
          return a.characterCount - b.characterCount;
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'template':
          return a.template.localeCompare(b.template);
        default:
          return 0;
      }
    });

    return filtered;
  }, [titles, searchTerm, filterTemplate, sortBy]);

  // Calculate SEO Score
  const calculateSEOScore = useCallback((title: string, keywords: string[]) => {
    let score = 50; // Base score
    
    // Length optimization (50-60 chars ideal)
    if (title.length >= 50 && title.length <= 60) {
      score += 20;
    } else if (title.length >= 40 && title.length <= 70) {
      score += 10;
    } else if (title.length < 30 || title.length > 80) {
      score -= 10;
    }
    
    // Keyword presence
    const lowerTitle = title.toLowerCase();
    keywords.forEach(keyword => {
      if (lowerTitle.includes(keyword.toLowerCase())) {
        score += 15;
      }
    });
    
    // Power words
    const powerWords = ['ultimate', 'complete', 'essential', 'proven', 'secret', 'amazing', 'incredible', 'best', 'top', 'perfect'];
    powerWords.forEach(word => {
      if (lowerTitle.includes(word)) {
        score += 5;
      }
    });
    
    // Numbers (listicles perform well)
    if (/\d+/.test(title)) {
      score += 10;
    }
    
    return Math.min(100, Math.max(0, score));
  }, []);

  const getSEOScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getTemplateIcon = (template: string) => {
    const icons: Record<string, React.ReactNode> = {
      'how-to': <Target className="h-4 w-4" />,
      'listicle': <Hash className="h-4 w-4" />,
      'question': <AlertCircle className="h-4 w-4" />,
      'comparison': <BarChart3 className="h-4 w-4" />,
      'ultimate': <Star className="h-4 w-4" />,
      'beginner': <Plus className="h-4 w-4" />,
      'advanced': <TrendingUp className="h-4 w-4" />,
      'trends': <Clock className="h-4 w-4" />,
      'mistakes': <AlertCircle className="h-4 w-4" />,
      'case-study': <CheckCircle className="h-4 w-4" />
    };
    return icons[template] || <Type className="h-4 w-4" />;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Type className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Title Generator
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Generate SEO-optimized blog post titles with A/B testing support
            </p>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="space-y-4">
          {/* Topic Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Blog Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Digital Marketing Strategies for 2025"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Quick Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Count */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Title Count</label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {[5, 8, 10, 15].map(option => (
                  <option key={option} value={option}>{option} titles</option>
                ))}
              </select>
            </div>

            {/* SEO Target */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">SEO Target</label>
              <select
                value={seoTarget}
                onChange={(e) => setSeoTarget(e.target.value as any)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="organic">Organic Search</option>
                <option value="social">Social Media</option>
                <option value="balanced">Balanced</option>
              </select>
            </div>

            {/* A/B Test Toggle */}
            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={abTestMode}
                  onChange={(e) => setAbTestMode(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">A/B Test Mode</span>
              </label>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Keywords (Optional)
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                placeholder="Enter keyword and press Enter"
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <button
                onClick={addKeyword}
                className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Add
              </button>
            </div>
            {targetKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {targetKeywords.map(keyword => (
                  <span
                    key={keyword}
                    className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full"
                  >
                    {keyword}
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="ml-1 text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Templates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Include Templates
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {titleTemplates.map(template => (
                <button
                  key={template.value}
                  onClick={() => toggleTemplate(template.value)}
                  className={`px-3 py-2 text-sm rounded transition-colors ${
                    includeTemplates.includes(template.value)
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div>
            <button
              onClick={handleGenerateTitles}
              disabled={!topic.trim() || loading}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Titles...
                </>
              ) : (
                <>
                  <Type className="h-4 w-4 mr-2" />
                  Generate Titles
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Titles Section */}
      {titles.length > 0 && (
        <>
          {/* Titles Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Generated Titles ({filteredAndSortedTitles.length})
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedTitles.size} selected
                </p>
              </div>
              
              {selectedTitles.size > 0 && (
                <button
                  onClick={handleUseSelected}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Use Selected Titles
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
                  placeholder="Search titles..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Template Filter */}
              <select
                value={filterTemplate}
                onChange={(e) => setFilterTemplate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Templates</option>
                {titleTemplates.map(template => (
                  <option key={template.value} value={template.value}>
                    {template.label}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="seoScore">Sort by SEO Score</option>
                <option value="characterCount">Sort by Length</option>
                <option value="createdAt">Sort by Date</option>
                <option value="template">Sort by Template</option>
              </select>
            </div>
          </div>

          {/* Titles List */}
          <div className="p-6">
            <div className="space-y-4">
              {filteredAndSortedTitles.map(title => (
                <TitleCard
                  key={title.id}
                  title={title}
                  isEditing={editingId === title.id}
                  editingText={editingText}
                  onEditingTextChange={setEditingText}
                  onToggleSelection={() => toggleTitleSelection(title.id)}
                  onStartEditing={() => startEditing(title.id, title.title)}
                  onSaveEdit={() => saveEdit(title.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onCopy={() => copyTitle(title.title)}
                  onRegenerate={() => regenerateTitle(title.id)}
                  onDelete={() => deleteTitle(title.id)}
                  getSEOScoreColor={getSEOScoreColor}
                  getTemplateIcon={getTemplateIcon}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {titles.length === 0 && (
        <div className="p-12">
          <div className="text-center">
            <Type className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Ready to Generate Titles?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Enter your blog topic above and configure your preferences to generate SEO-optimized titles with various templates and hooks.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Title Card Component
interface TitleCardProps {
  title: TitleVariation;
  isEditing: boolean;
  editingText: string;
  onEditingTextChange: (text: string) => void;
  onToggleSelection: () => void;
  onStartEditing: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onCopy: () => void;
  onRegenerate: () => void;
  onDelete: () => void;
  getSEOScoreColor: (score: number) => string;
  getTemplateIcon: (template: string) => React.ReactNode;
}

const TitleCard: React.FC<TitleCardProps> = ({
  title,
  isEditing,
  editingText,
  onEditingTextChange,
  onToggleSelection,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onCopy,
  onRegenerate,
  onDelete,
  getSEOScoreColor,
  getTemplateIcon
}) => {
  return (
    <div
      className={`p-4 border rounded-lg transition-all ${
        title.selected
          ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Selection Checkbox */}
        <input
          type="checkbox"
          checked={title.selected}
          onChange={onToggleSelection}
          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />

        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="mb-3">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => onEditingTextChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  autoFocus
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onSaveEdit}
                    className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={onCancelEdit}
                    className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <h4 className="text-lg font-medium text-gray-900 dark:text-white leading-tight">
                {title.title}
                {title.edited && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">
                    Edited
                  </span>
                )}
                {title.abTestGroup && (
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded ${
                    title.abTestGroup === 'A' ? 'bg-purple-100 text-purple-700' : 'bg-pink-100 text-pink-700'
                  }`}>
                    Group {title.abTestGroup}
                  </span>
                )}
              </h4>
            )}
          </div>

          {/* Metrics */}
          <div className="flex items-center space-x-4 mb-3">
            {/* SEO Score */}
            <div className={`px-2 py-1 text-xs font-medium rounded-full ${getSEOScoreColor(title.seoScore)}`}>
              SEO: {title.seoScore}/100
            </div>

            {/* Character Count */}
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Type className="h-3 w-3 mr-1" />
              {title.characterCount} chars
            </div>

            {/* Template */}
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              {getTemplateIcon(title.template)}
              <span className="ml-1 capitalize">{title.template.replace('-', ' ')}</span>
            </div>
          </div>

          {/* Keywords */}
          {title.keywords.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {title.keywords.map(keyword => (
                  <span
                    key={keyword}
                    className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onCopy}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
            title="Copy title"
          >
            <Copy className="h-4 w-4" />
          </button>
          
          <button
            onClick={onStartEditing}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
            title="Edit title"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          
          <button
            onClick={onRegenerate}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
            title="Regenerate title"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
            title="Delete title"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};