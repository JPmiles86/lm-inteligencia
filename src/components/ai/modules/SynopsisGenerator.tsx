// Synopsis Generator Module - Generate and optimize blog post synopsis/summaries
// Features: Multiple variations, length control, tone adjustment, hook emphasis

import React, { useState, useCallback, useEffect } from 'react';
import { useAIStore } from '../../../store/aiStore';
import { 
  FileText, 
  Loader2, 
  RefreshCw,
  Copy,
  Download,
  ArrowRight,
  BarChart3,
  Target,
  Settings,
  Filter,
  Search,
  Edit2,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Heart,
  Trash2,
  Eye,
  TrendingUp
} from 'lucide-react';

interface SynopsisVariation {
  id: string;
  synopsis: string;
  wordCount: number;
  characterCount: number;
  tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'conversational' | 'urgent';
  hook: 'problem' | 'benefit' | 'curiosity' | 'statistic' | 'story' | 'question';
  readabilityScore: number;
  engagementScore: number;
  selected: boolean;
  edited: boolean;
  originalSynopsis?: string;
  createdAt: string;
  lengthTarget: 'short' | 'medium' | 'long';
}

interface SynopsisGeneratorProps {
  topic?: string;
  title?: string;
  context?: string;
  targetAudience?: string;
  onSynopsisSelected?: (synopsis: SynopsisVariation) => void;
  onMultipleSynopsisSelected?: (synopses: SynopsisVariation[]) => void;
  className?: string;
  mode?: 'standalone' | 'structured';
  existingSynopses?: SynopsisVariation[];
}

export const SynopsisGenerator: React.FC<SynopsisGeneratorProps> = ({
  topic: initialTopic = '',
  title = '',
  context = '',
  targetAudience = '',
  onSynopsisSelected,
  onMultipleSynopsisSelected,
  className = '',
  mode = 'standalone',
  existingSynopses = []
}) => {
  const {
    activeProvider,
    activeModel,
    addNotification,
    updateAnalytics,
    updateProviderUsage
  } = useAIStore();

  // State
  const [synopses, setSynopses] = useState<SynopsisVariation[]>(existingSynopses);
  const [selectedSynopses, setSelectedSynopses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTone, setFilterTone] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'engagementScore' | 'readabilityScore' | 'wordCount' | 'createdAt'>('engagementScore');
  
  // Configuration state
  const [topic, setTopic] = useState(initialTopic);
  const [blogTitle, setBlogTitle] = useState(title);
  const [count, setCount] = useState(3);
  const [lengthTarget, setLengthTarget] = useState<'short' | 'medium' | 'long'>('medium');
  const [tonePreferences, setTonePreferences] = useState<string[]>(['professional', 'friendly']);
  const [hookEmphasis, setHookEmphasis] = useState<string[]>(['benefit', 'curiosity']);
  const [includeKeywords, setIncludeKeywords] = useState(true);
  const [optimizeForSocial, setOptimizeForSocial] = useState(false);

  // Configuration options
  const lengthTargets = [
    { value: 'short', label: 'Short (50-100 words)', wordRange: '50-100' },
    { value: 'medium', label: 'Medium (100-150 words)', wordRange: '100-150' },
    { value: 'long', label: 'Long (150-200 words)', wordRange: '150-200' }
  ];

  const toneOptions = [
    { value: 'professional', label: 'Professional', description: 'Formal, authoritative tone' },
    { value: 'casual', label: 'Casual', description: 'Relaxed, informal approach' },
    { value: 'friendly', label: 'Friendly', description: 'Warm, approachable style' },
    { value: 'authoritative', label: 'Authoritative', description: 'Expert, confident voice' },
    { value: 'conversational', label: 'Conversational', description: 'Natural, dialogue-like' },
    { value: 'urgent', label: 'Urgent', description: 'Action-oriented, immediate' }
  ];

  const hookOptions = [
    { value: 'problem', label: 'Problem-focused', description: 'Highlight pain points' },
    { value: 'benefit', label: 'Benefit-driven', description: 'Focus on outcomes' },
    { value: 'curiosity', label: 'Curiosity gap', description: 'Create intrigue' },
    { value: 'statistic', label: 'Data-driven', description: 'Lead with numbers' },
    { value: 'story', label: 'Story-based', description: 'Narrative approach' },
    { value: 'question', label: 'Question hook', description: 'Start with a question' }
  ];

  // Generate synopses
  const handleGenerateSynopses = useCallback(async () => {
    if (!topic.trim() && !blogTitle.trim()) {
      addNotification({
        type: 'warning',
        title: 'Missing Information',
        message: 'Please enter either a topic or blog title to generate synopses',
        duration: 3000
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate-synopsis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate-synopses',
          topic: topic,
          title: blogTitle,
          context: context,
          targetAudience: targetAudience,
          count: count,
          lengthTarget: lengthTarget,
          tones: tonePreferences,
          hooks: hookEmphasis,
          includeKeywords: includeKeywords,
          optimizeForSocial: optimizeForSocial,
          provider: activeProvider,
          model: activeModel
        }),
      });

      const result = await response.json();

      if (result.success) {
        const newSynopses = result.synopses.map((synopsis: any) => ({
          ...synopsis,
          id: `synopsis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          selected: false,
          edited: false,
          createdAt: new Date().toISOString()
        }));

        setSynopses(prev => [...prev, ...newSynopses]);
        setSelectedSynopses(new Set());

        // Update analytics
        updateAnalytics({
          tokens: result.tokensUsed,
          cost: result.cost,
          generations: 1
        });

        updateProviderUsage(activeProvider, result.tokensUsed || 0, result.cost || 0);

        addNotification({
          type: 'success',
          title: 'Synopses Generated',
          message: `Generated ${result.synopses.length} synopsis variations`,
          duration: 4000
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Generation Failed',
          message: result.error || 'Failed to generate synopses',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('[SynopsisGenerator] Error generating synopses:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to generate synopses. Please try again.',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  }, [topic, blogTitle, context, targetAudience, count, lengthTarget, tonePreferences, hookEmphasis, includeKeywords, optimizeForSocial, activeProvider, activeModel, addNotification, updateAnalytics, updateProviderUsage]);

  // Toggle synopsis selection
  const toggleSynopsisSelection = useCallback((synopsisId: string) => {
    const newSelected = new Set(selectedSynopses);
    if (newSelected.has(synopsisId)) {
      newSelected.delete(synopsisId);
    } else {
      newSelected.add(synopsisId);
    }
    setSelectedSynopses(newSelected);
    
    // Update synopses state
    setSynopses(prev => prev.map(synopsis => 
      synopsis.id === synopsisId ? { ...synopsis, selected: !synopsis.selected } : synopsis
    ));
  }, [selectedSynopses]);

  // Start editing synopsis
  const startEditing = useCallback((synopsisId: string, currentText: string) => {
    setEditingId(synopsisId);
    setEditingText(currentText);
  }, []);

  // Save edited synopsis
  const saveEdit = useCallback((synopsisId: string) => {
    if (editingText.trim()) {
      setSynopses(prev => prev.map(synopsis => 
        synopsis.id === synopsisId ? { 
          ...synopsis, 
          synopsis: editingText.trim(),
          edited: true,
          originalSynopsis: synopsis.originalSynopsis || synopsis.synopsis,
          wordCount: editingText.trim().split(/\s+/).length,
          characterCount: editingText.trim().length,
          readabilityScore: calculateReadabilityScore(editingText.trim()),
          engagementScore: calculateEngagementScore(editingText.trim())
        } : synopsis
      ));
    }
    setEditingId(null);
    setEditingText('');
  }, [editingText]);

  // Delete synopsis
  const deleteSynopsis = useCallback((synopsisId: string) => {
    setSynopses(prev => prev.filter(synopsis => synopsis.id !== synopsisId));
    setSelectedSynopses(prev => {
      const newSelected = new Set(prev);
      newSelected.delete(synopsisId);
      return newSelected;
    });
  }, []);

  // Copy synopsis to clipboard
  const copySynopsis = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addNotification({
        type: 'success',
        title: 'Copied',
        message: 'Synopsis copied to clipboard',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      addNotification({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy synopsis to clipboard',
        duration: 3000
      });
    }
  }, [addNotification]);

  // Regenerate specific synopsis
  const regenerateSynopsis = useCallback(async (synopsisId: string) => {
    const synopsis = synopses.find(s => s.id === synopsisId);
    if (!synopsis) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate-synopsis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'regenerate-single',
          topic: topic,
          title: blogTitle,
          context: context,
          lengthTarget: synopsis.lengthTarget,
          tone: synopsis.tone,
          hook: synopsis.hook,
          provider: activeProvider,
          model: activeModel
        }),
      });

      const result = await response.json();

      if (result.success && result.synopsis) {
        const newSynopsis = {
          ...result.synopsis,
          id: synopsisId,
          selected: synopsis.selected,
          edited: false,
          createdAt: new Date().toISOString()
        };

        setSynopses(prev => prev.map(s => s.id === synopsisId ? newSynopsis : s));

        addNotification({
          type: 'success',
          title: 'Synopsis Regenerated',
          message: 'New synopsis variation generated',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('[SynopsisGenerator] Error regenerating synopsis:', error);
      addNotification({
        type: 'error',
        title: 'Regeneration Failed',
        message: 'Failed to regenerate synopsis',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  }, [synopses, topic, blogTitle, context, activeProvider, activeModel, addNotification]);

  // Toggle configuration options
  const toggleTonePreference = useCallback((tone: string) => {
    setTonePreferences(prev => 
      prev.includes(tone)
        ? prev.filter(t => t !== tone)
        : [...prev, tone]
    );
  }, []);

  const toggleHookEmphasis = useCallback((hook: string) => {
    setHookEmphasis(prev => 
      prev.includes(hook)
        ? prev.filter(h => h !== hook)
        : [...prev, hook]
    );
  }, []);

  // Handle selection for external use
  const handleUseSelected = useCallback(() => {
    const selectedSynopsesList = synopses.filter(synopsis => selectedSynopses.has(synopsis.id));
    
    if (selectedSynopsesList.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Synopses Selected',
        message: 'Please select at least one synopsis to use',
        duration: 3000
      });
      return;
    }

    if (selectedSynopsesList.length === 1) {
      onSynopsisSelected?.(selectedSynopsesList[0]);
    } else {
      onMultipleSynopsisSelected?.(selectedSynopsesList);
    }

    addNotification({
      type: 'success',
      title: 'Synopses Selected',
      message: `${selectedSynopsesList.length} synopsis(es) ready for use`,
      duration: 3000
    });
  }, [synopses, selectedSynopses, onSynopsisSelected, onMultipleSynopsisSelected, addNotification]);

  // Filter and sort synopses
  const filteredAndSortedSynopses = React.useMemo(() => {
    let filtered = synopses;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(synopsis =>
        synopsis.synopsis.toLowerCase().includes(term) ||
        synopsis.tone.toLowerCase().includes(term) ||
        synopsis.hook.toLowerCase().includes(term)
      );
    }

    // Tone filter
    if (filterTone !== 'all') {
      filtered = filtered.filter(synopsis => synopsis.tone === filterTone);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'engagementScore':
          return b.engagementScore - a.engagementScore;
        case 'readabilityScore':
          return b.readabilityScore - a.readabilityScore;
        case 'wordCount':
          return a.wordCount - b.wordCount;
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [synopses, searchTerm, filterTone, sortBy]);

  // Calculate scores
  const calculateReadabilityScore = useCallback((text: string) => {
    let score = 50; // Base score
    
    const words = text.split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Average words per sentence (lower is better)
    const avgWordsPerSentence = words.length / sentences.length;
    if (avgWordsPerSentence <= 15) score += 20;
    else if (avgWordsPerSentence <= 20) score += 10;
    else if (avgWordsPerSentence > 25) score -= 10;
    
    // Avoid complex words (basic heuristic)
    const complexWords = words.filter(word => word.length > 7).length;
    const complexRatio = complexWords / words.length;
    if (complexRatio < 0.2) score += 15;
    else if (complexRatio > 0.4) score -= 15;
    
    // Active voice indicators
    const passiveIndicators = ['was', 'were', 'been', 'being'];
    const passiveCount = words.filter(word => 
      passiveIndicators.some(indicator => word.toLowerCase().includes(indicator))
    ).length;
    if (passiveCount / words.length < 0.1) score += 15;
    
    return Math.min(100, Math.max(0, score));
  }, []);

  const calculateEngagementScore = useCallback((text: string) => {
    let score = 50; // Base score
    
    // Power words
    const powerWords = ['amazing', 'incredible', 'essential', 'proven', 'secret', 'ultimate', 'perfect', 'exclusive', 'guaranteed', 'revolutionary'];
    powerWords.forEach(word => {
      if (text.toLowerCase().includes(word)) score += 8;
    });
    
    // Emotional words
    const emotionalWords = ['love', 'hate', 'fear', 'surprise', 'joy', 'anger', 'trust', 'anticipation'];
    emotionalWords.forEach(word => {
      if (text.toLowerCase().includes(word)) score += 5;
    });
    
    // Action words
    const actionWords = ['discover', 'learn', 'master', 'achieve', 'transform', 'improve', 'boost', 'maximize'];
    actionWords.forEach(word => {
      if (text.toLowerCase().includes(word)) score += 6;
    });
    
    // Questions and curiosity
    if (text.includes('?')) score += 10;
    if (text.toLowerCase().includes('why') || text.toLowerCase().includes('how')) score += 8;
    
    // Numbers and statistics
    if (/\d+/.test(text)) score += 10;
    
    return Math.min(100, Math.max(0, score));
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getToneIcon = (tone: string) => {
    const icons: Record<string, React.ReactNode> = {
      'professional': <Target className="h-4 w-4" />,
      'casual': <Heart className="h-4 w-4" />,
      'friendly': <Heart className="h-4 w-4" />,
      'authoritative': <CheckCircle className="h-4 w-4" />,
      'conversational': <Heart className="h-4 w-4" />,
      'urgent': <Zap className="h-4 w-4" />
    };
    return icons[tone] || <FileText className="h-4 w-4" />;
  };

  const getHookIcon = (hook: string) => {
    const icons: Record<string, React.ReactNode> = {
      'problem': <AlertCircle className="h-4 w-4" />,
      'benefit': <TrendingUp className="h-4 w-4" />,
      'curiosity': <Eye className="h-4 w-4" />,
      'statistic': <BarChart3 className="h-4 w-4" />,
      'story': <FileText className="h-4 w-4" />,
      'question': <AlertCircle className="h-4 w-4" />
    };
    return icons[hook] || <FileText className="h-4 w-4" />;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Synopsis Generator
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Generate engaging synopsis variations with tone and length control
            </p>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="space-y-4">
          {/* Topic and Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Blog Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Content Marketing Strategies"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Blog Title (Optional)
              </label>
              <input
                type="text"
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                placeholder="e.g., The Complete Guide to Content Marketing"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Quick Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Count */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Variations</label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {[2, 3, 4, 5].map(option => (
                  <option key={option} value={option}>{option} synopses</option>
                ))}
              </select>
            </div>

            {/* Length Target */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Length</label>
              <select
                value={lengthTarget}
                onChange={(e) => setLengthTarget(e.target.value as any)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {lengthTargets.map(target => (
                  <option key={target.value} value={target.value}>
                    {target.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Optimization Options */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeKeywords}
                  onChange={(e) => setIncludeKeywords(e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Include Keywords</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={optimizeForSocial}
                  onChange={(e) => setOptimizeForSocial(e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Social Media Ready</span>
              </label>
            </div>
          </div>

          {/* Tone Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tone Preferences
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {toneOptions.map(tone => (
                <button
                  key={tone.value}
                  onClick={() => toggleTonePreference(tone.value)}
                  className={`px-3 py-2 text-sm rounded transition-colors ${
                    tonePreferences.includes(tone.value)
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title={tone.description}
                >
                  {tone.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hook Emphasis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hook Emphasis
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {hookOptions.map(hook => (
                <button
                  key={hook.value}
                  onClick={() => toggleHookEmphasis(hook.value)}
                  className={`px-3 py-2 text-sm rounded transition-colors ${
                    hookEmphasis.includes(hook.value)
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title={hook.description}
                >
                  {hook.label}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Context */}
          {mode === 'standalone' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Context (Optional)
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Any specific requirements, target audience details, or key points to emphasize..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          )}

          {/* Generate Button */}
          <div>
            <button
              onClick={handleGenerateSynopses}
              disabled={(!topic.trim() && !blogTitle.trim()) || loading}
              className="w-full flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Synopses...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Synopses
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Synopses Section */}
      {synopses.length > 0 && (
        <>
          {/* Synopses Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Generated Synopses ({filteredAndSortedSynopses.length})
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedSynopses.size} selected
                </p>
              </div>
              
              {selectedSynopses.size > 0 && (
                <button
                  onClick={handleUseSelected}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Use Selected Synopses
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
                  placeholder="Search synopses..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Tone Filter */}
              <select
                value={filterTone}
                onChange={(e) => setFilterTone(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Tones</option>
                {toneOptions.map(tone => (
                  <option key={tone.value} value={tone.value}>
                    {tone.label}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="engagementScore">Sort by Engagement</option>
                <option value="readabilityScore">Sort by Readability</option>
                <option value="wordCount">Sort by Length</option>
                <option value="createdAt">Sort by Date</option>
              </select>
            </div>
          </div>

          {/* Synopses List */}
          <div className="p-6">
            <div className="space-y-4">
              {filteredAndSortedSynopses.map(synopsis => (
                <SynopsisCard
                  key={synopsis.id}
                  synopsis={synopsis}
                  isEditing={editingId === synopsis.id}
                  editingText={editingText}
                  onEditingTextChange={setEditingText}
                  onToggleSelection={() => toggleSynopsisSelection(synopsis.id)}
                  onStartEditing={() => startEditing(synopsis.id, synopsis.synopsis)}
                  onSaveEdit={() => saveEdit(synopsis.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onCopy={() => copySynopsis(synopsis.synopsis)}
                  onRegenerate={() => regenerateSynopsis(synopsis.id)}
                  onDelete={() => deleteSynopsis(synopsis.id)}
                  getScoreColor={getScoreColor}
                  getToneIcon={getToneIcon}
                  getHookIcon={getHookIcon}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {synopses.length === 0 && (
        <div className="p-12">
          <div className="text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Ready to Generate Synopses?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Enter your blog topic or title above and configure your preferences to generate compelling synopsis variations with different tones and hooks.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Synopsis Card Component
interface SynopsisCardProps {
  synopsis: SynopsisVariation;
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
  getScoreColor: (score: number) => string;
  getToneIcon: (tone: string) => React.ReactNode;
  getHookIcon: (hook: string) => React.ReactNode;
}

const SynopsisCard: React.FC<SynopsisCardProps> = ({
  synopsis,
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
  getScoreColor,
  getToneIcon,
  getHookIcon
}) => {
  return (
    <div
      className={`p-5 border rounded-lg transition-all ${
        synopsis.selected
          ? 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Selection Checkbox */}
        <input
          type="checkbox"
          checked={synopsis.selected}
          onChange={onToggleSelection}
          className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />

        <div className="flex-1 min-w-0">
          {/* Synopsis Content */}
          <div className="mb-4">
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editingText}
                  onChange={(e) => onEditingTextChange(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
              <div>
                <p className="text-gray-900 dark:text-white leading-relaxed">
                  {synopsis.synopsis}
                </p>
                {synopsis.edited && (
                  <span className="mt-2 inline-block px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">
                    Edited
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Metrics */}
          <div className="flex items-center space-x-4 mb-3">
            {/* Engagement Score */}
            <div className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(synopsis.engagementScore)}`}>
              Engagement: {synopsis.engagementScore}/100
            </div>

            {/* Readability Score */}
            <div className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(synopsis.readabilityScore)}`}>
              Readability: {synopsis.readabilityScore}/100
            </div>

            {/* Word Count */}
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3 mr-1" />
              {synopsis.wordCount} words
            </div>

            {/* Character Count */}
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <FileText className="h-3 w-3 mr-1" />
              {synopsis.characterCount} chars
            </div>
          </div>

          {/* Attributes */}
          <div className="flex items-center space-x-4">
            {/* Tone */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              {getToneIcon(synopsis.tone)}
              <span className="ml-1 capitalize">{synopsis.tone}</span>
            </div>

            {/* Hook */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              {getHookIcon(synopsis.hook)}
              <span className="ml-1 capitalize">{synopsis.hook.replace('-', ' ')}</span>
            </div>

            {/* Length Target */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <BarChart3 className="h-3 w-3 mr-1" />
              <span className="capitalize">{synopsis.lengthTarget}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onCopy}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
            title="Copy synopsis"
          >
            <Copy className="h-4 w-4" />
          </button>
          
          <button
            onClick={onStartEditing}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
            title="Edit synopsis"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          
          <button
            onClick={onRegenerate}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
            title="Regenerate synopsis"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
            title="Delete synopsis"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};