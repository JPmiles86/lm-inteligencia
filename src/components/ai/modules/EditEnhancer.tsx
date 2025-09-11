// EditEnhancer - AI-powered content editing and enhancement module
// Provides suggestions, track changes, grammar checking, and tone adjustment

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useAIStore } from '../../../store/aiStore.js';
import {
  Edit,
  Wand2,
  CheckCircle,
  XCircle,
  RotateCcw,
  RotateCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Target,
  Loader2,
  Sparkles,
  FileText,
  TrendingUp,
  Zap,
  BookOpen,
  Eye,
  Calendar,
  Settings,
  User,
  Globe,
} from 'lucide-react';

interface EditEnhancerProps {
  content: string;
  onChange: (content: string) => void;
  mode?: 'suggestions' | 'grammar' | 'tone' | 'optimization';
  onClose?: () => void;
}

interface Enhancement {
  id: string;
  type: 'grammar' | 'clarity' | 'tone' | 'length' | 'seo' | 'engagement' | 'readability';
  originalText: string;
  suggestedText: string;
  reason: string;
  confidence: number;
  position: { start: number; end: number };
  applied: boolean;
  category: string;
  impact: 'low' | 'medium' | 'high';
}

interface EditingPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  action: string;
  color: string;
}

interface ContentMetrics {
  readabilityScore: number;
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  seoScore: number;
  engagementScore: number;
  toneAnalysis: string;
  improvedAreas: string[];
}

export const EditEnhancer: React.FC<EditEnhancerProps> = ({
  content,
  onChange,
  mode = 'suggestions',
  onClose,
}) => {
  const { 
    loading, 
    setLoading, 
    addNotification, 
    addError,
    activeProvider,
    activeModel,
  } = useAIStore();

  // State
  const [enhancements, setEnhancements] = useState<Enhancement[]>([]);
  const [enhancementMode, setEnhancementMode] = useState(mode);
  const [showPreview, setShowPreview] = useState(false);
  const [enhancingWithPreset, setEnhancingWithPreset] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedEnhancement, setExpandedEnhancement] = useState<string | null>(null);

  // Content with enhancements applied
  const [previewContent, setPreviewContent] = useState(content);

  // Editing presets
  const editingPresets: EditingPreset[] = [
    {
      id: 'concise',
      name: 'Make More Concise',
      description: 'Reduce wordiness and improve clarity',
      icon: Target,
      action: 'make-concise',
      color: 'blue',
    },
    {
      id: 'engaging',
      name: 'Make More Engaging',
      description: 'Add hooks, stories, and compelling language',
      icon: Sparkles,
      action: 'make-engaging',
      color: 'purple',
    },
    {
      id: 'seo',
      name: 'Improve SEO',
      description: 'Optimize for search engines and keywords',
      icon: TrendingUp,
      action: 'improve-seo',
      color: 'green',
    },
    {
      id: 'simplify',
      name: 'Simplify Language',
      description: 'Make content more accessible and easy to read',
      icon: BookOpen,
      action: 'simplify-language',
      color: 'orange',
    },
    {
      id: 'grammar',
      name: 'Fix Grammar',
      description: 'Correct grammar, punctuation, and spelling',
      icon: CheckCircle,
      action: 'fix-grammar',
      color: 'red',
    },
    {
      id: 'readability',
      name: 'Enhance Readability',
      description: 'Improve sentence structure and flow',
      icon: Eye,
      action: 'enhance-readability',
      color: 'indigo',
    },
  ];

  // Calculate content metrics
  const contentMetrics: ContentMetrics = useMemo(() => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Basic readability score (Flesch Reading Ease approximation)
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    const avgSyllablesPerWord = words.reduce((acc, word) => acc + countSyllables(word), 0) / Math.max(words.length, 1);
    const readabilityScore = Math.max(0, Math.min(100, 
      206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
    ));

    // Simple SEO score based on content length and structure
    const seoScore = Math.min(100, 
      (words.length >= 300 ? 40 : words.length / 300 * 40) +
      (sentences.length >= 5 ? 20 : sentences.length / 5 * 20) +
      (text.includes('?') ? 10 : 0) +
      (text.includes('!') ? 10 : 0) +
      (avgWordsPerSentence <= 20 ? 20 : 0)
    );

    // Engagement score based on various factors
    const engagementScore = Math.min(100,
      (text.includes('you') || text.includes('your') ? 20 : 0) +
      (text.includes('?') ? 15 : 0) +
      (text.includes('!') ? 10 : 0) +
      (words.length >= 500 ? 25 : words.length / 500 * 25) +
      (avgWordsPerSentence <= 15 ? 20 : 0) +
      (sentences.length >= 10 ? 10 : sentences.length / 10 * 10)
    );

    const improvedAreas = [];
    if (readabilityScore < 60) improvedAreas.push('Readability');
    if (seoScore < 70) improvedAreas.push('SEO');
    if (engagementScore < 60) improvedAreas.push('Engagement');
    if (avgWordsPerSentence > 20) improvedAreas.push('Sentence Length');

    return {
      readabilityScore: Math.round(readabilityScore),
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      seoScore: Math.round(seoScore),
      engagementScore: Math.round(engagementScore),
      toneAnalysis: analyzeTone(text),
      improvedAreas,
    };
  }, [content]);

  // Helper function to count syllables (approximate)
  function countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  // Helper function to analyze tone
  function analyzeTone(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('should') || lowerText.includes('must') || lowerText.includes('need to')) {
      return 'Authoritative';
    } else if (lowerText.includes('you') || lowerText.includes('your') || lowerText.includes('?')) {
      return 'Conversational';
    } else if (lowerText.includes('research') || lowerText.includes('study') || lowerText.includes('analysis')) {
      return 'Academic';
    } else if (lowerText.includes('!') || lowerText.includes('amazing') || lowerText.includes('incredible')) {
      return 'Enthusiastic';
    } else {
      return 'Professional';
    }
  }

  // Generate AI enhancements
  const generateEnhancements = useCallback(async (targetMode?: string) => {
    if (!content || content.trim().length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Content',
        message: 'Please add some content to enhance.',
        duration: 3000,
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/ai/enhance-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          mode: targetMode || enhancementMode,
          provider: activeProvider,
          model: activeModel,
          metrics: contentMetrics,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Enhancement failed');
      }

      if (data.success && data.enhancements) {
        setEnhancements(data.enhancements);
        addNotification({
          type: 'success',
          title: 'Enhancements Generated',
          message: `Found ${data.enhancements.length} suggestions for improvement`,
          duration: 4000,
        });
      } else {
        throw new Error(data.error || 'No enhancements generated');
      }
    } catch (error) {
      console.error('Enhancement error:', error);
      addError(error instanceof Error ? error.message : 'Enhancement failed');
      
      // Generate mock enhancements as fallback
      generateMockEnhancements();
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, enhancementMode, activeProvider, activeModel, contentMetrics, addNotification, addError]);

  // Generate mock enhancements for development/fallback
  const generateMockEnhancements = useCallback(() => {
    const mockEnhancements: Enhancement[] = [
      {
        id: 'enhance_1',
        type: 'clarity',
        originalText: 'This is a sentence that could be improved.',
        suggestedText: 'This sentence needs improvement.',
        reason: 'Simpler wording improves clarity',
        confidence: 85,
        position: { start: 0, end: 42 },
        applied: false,
        category: 'Clarity',
        impact: 'medium',
      },
      {
        id: 'enhance_2',
        type: 'engagement',
        originalText: 'The solution works well.',
        suggestedText: 'The solution works exceptionally well.',
        reason: 'Adding emphasis increases engagement',
        confidence: 75,
        position: { start: 50, end: 73 },
        applied: false,
        category: 'Engagement',
        impact: 'low',
      },
      {
        id: 'enhance_3',
        type: 'seo',
        originalText: 'ways to improve',
        suggestedText: 'proven strategies to improve',
        reason: 'More descriptive keywords improve SEO',
        confidence: 90,
        position: { start: 100, end: 115 },
        applied: false,
        category: 'SEO',
        impact: 'high',
      },
    ];
    
    setEnhancements(mockEnhancements);
    addNotification({
      type: 'info',
      title: 'Demo Enhancements',
      message: 'Showing sample enhancements (development mode)',
      duration: 4000,
    });
  }, [addNotification]);

  // Apply enhancement
  const applyEnhancement = useCallback((enhancementId: string) => {
    const enhancement = enhancements.find(e => e.id === enhancementId);
    if (!enhancement) return;

    // Add current state to undo stack
    setUndoStack(prev => [...prev, content]);
    setRedoStack([]);

    // Apply the enhancement
    const newContent = content.replace(enhancement.originalText, enhancement.suggestedText);
    onChange(newContent);
    
    // Mark enhancement as applied
    setEnhancements(prev => prev.map(e => 
      e.id === enhancementId ? { ...e, applied: true } : e
    ));

    addNotification({
      type: 'success',
      title: 'Enhancement Applied',
      message: `Applied ${enhancement.category.toLowerCase()} improvement`,
      duration: 2000,
    });
  }, [enhancements, content, onChange, addNotification]);

  // Reject enhancement
  const rejectEnhancement = useCallback((enhancementId: string) => {
    setEnhancements(prev => prev.filter(e => e.id !== enhancementId));
  }, []);

  // Apply editing preset
  const applyEditingPreset = useCallback(async (preset: EditingPreset) => {
    if (!content || content.trim().length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Content',
        message: 'Please add some content to enhance.',
        duration: 3000,
      });
      return;
    }

    setEnhancingWithPreset(preset.id);
    
    try {
      const response = await fetch('/api/ai/enhance-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          action: preset.action,
          provider: activeProvider,
          model: activeModel,
          preset: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Preset enhancement failed');
      }

      if (data.success && data.enhancedContent) {
        // Add current state to undo stack
        setUndoStack(prev => [...prev, content]);
        setRedoStack([]);
        
        onChange(data.enhancedContent);
        
        addNotification({
          type: 'success',
          title: 'Preset Applied',
          message: `Successfully applied "${preset.name}" enhancement`,
          duration: 4000,
        });
      } else {
        throw new Error(data.error || 'No enhanced content received');
      }
    } catch (error) {
      console.error('Preset enhancement error:', error);
      addError(error instanceof Error ? error.message : 'Preset enhancement failed');
    } finally {
      setEnhancingWithPreset(null);
    }
  }, [content, activeProvider, activeModel, onChange, addNotification, addError]);

  // Undo action
  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    const previousContent = undoStack[undoStack.length - 1];
    setRedoStack(prev => [content, ...prev]);
    setUndoStack(prev => prev.slice(0, -1));
    onChange(previousContent);
  }, [undoStack, content, onChange]);

  // Redo action
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const nextContent = redoStack[0];
    setUndoStack(prev => [...prev, content]);
    setRedoStack(prev => prev.slice(1));
    onChange(nextContent);
  }, [redoStack, content, onChange]);

  // Update preview content when enhancements change
  useEffect(() => {
    let preview = content;
    
    // Apply all accepted enhancements to preview
    enhancements.forEach(enhancement => {
      if (enhancement.applied) {
        preview = preview.replace(enhancement.originalText, enhancement.suggestedText);
      }
    });
    
    setPreviewContent(preview);
  }, [content, enhancements]);

  // Initialize with analysis if content exists
  useEffect(() => {
    if (content && content.trim().length > 0) {
      generateEnhancements();
    }
  }, []); // Only run once on mount

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Wand2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Edit Mode
          </h3>
          {isAnalyzing && (
            <Loader2 className="h-4 w-4 text-purple-600 dark:text-purple-400 animate-spin" />
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Undo/Redo */}
          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Undo"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Redo"
          >
            <RotateCw className="h-4 w-4" />
          </button>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

          {/* Preview Toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              showPreview
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Eye className="h-4 w-4" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left Panel - Enhancements and Controls */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Content Metrics */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Content Analysis
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">Readability</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {contentMetrics.readabilityScore}/100
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">SEO Score</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {contentMetrics.seoScore}/100
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">Words</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {contentMetrics.wordCount}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">Tone</div>
                <div className="font-semibold text-gray-900 dark:text-white text-xs">
                  {contentMetrics.toneAnalysis}
                </div>
              </div>
            </div>

            {contentMetrics.improvedAreas.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-amber-600 dark:text-amber-400 mb-1">
                  Suggested improvements:
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {contentMetrics.improvedAreas.join(', ')}
                </div>
              </div>
            )}
          </div>

          {/* Quick Presets */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Quick Enhancements
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              {editingPresets.map((preset) => {
                const Icon = preset.icon;
                const isLoading = enhancingWithPreset === preset.id;
                
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyEditingPreset(preset)}
                    disabled={isLoading || loading}
                    className={`p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-${preset.color}-300 dark:hover:border-${preset.color}-600 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Icon className={`h-4 w-4 text-${preset.color}-600 dark:text-${preset.color}-400`} />
                      )}
                      <span className="text-xs font-medium text-gray-900 dark:text-white">
                        {preset.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Enhancement Suggestions */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Suggestions ({enhancements.length})
                </h4>
                
                <button
                  onClick={() => generateEnhancements()}
                  disabled={isAnalyzing}
                  className="px-2 py-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200 rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Refresh'}
                </button>
              </div>

              {enhancements.length === 0 ? (
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 mx-auto mb-4 opacity-30 text-gray-400 dark:text-gray-600" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    No suggestions yet
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Click "Refresh" to analyze your content
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {enhancements.map((enhancement) => (
                    <div
                      key={enhancement.id}
                      className={`border rounded-lg p-3 ${
                        enhancement.applied
                          ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${
                            enhancement.impact === 'high' ? 'bg-red-500' :
                            enhancement.impact === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`} />
                          <span className="text-xs font-medium text-gray-900 dark:text-white">
                            {enhancement.category}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {enhancement.confidence}% confidence
                          </span>
                        </div>
                        
                        <button
                          onClick={() => setExpandedEnhancement(
                            expandedEnhancement === enhancement.id ? null : enhancement.id
                          )}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {expandedEnhancement === enhancement.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        {enhancement.reason}
                      </div>

                      {expandedEnhancement === enhancement.id && (
                        <div className="mb-3 space-y-2">
                          <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-xs">
                            <div className="text-red-700 dark:text-red-300 font-medium mb-1">Original:</div>
                            <div className="text-red-600 dark:text-red-400">
                              "{enhancement.originalText}"
                            </div>
                          </div>
                          
                          <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded text-xs">
                            <div className="text-green-700 dark:text-green-300 font-medium mb-1">Suggested:</div>
                            <div className="text-green-600 dark:text-green-400">
                              "{enhancement.suggestedText}"
                            </div>
                          </div>
                        </div>
                      )}

                      {!enhancement.applied && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => applyEnhancement(enhancement.id)}
                            className="flex-1 px-3 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                          >
                            <CheckCircle className="h-3 w-3 inline mr-1" />
                            Apply
                          </button>
                          
                          <button
                            onClick={() => rejectEnhancement(enhancement.id)}
                            className="flex-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            <XCircle className="h-3 w-3 inline mr-1" />
                            Reject
                          </button>
                        </div>
                      )}

                      {enhancement.applied && (
                        <div className="text-xs text-green-600 dark:text-green-400 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Applied
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Content Preview/Editor */}
        <div className="flex-1 flex flex-col">
          {showPreview ? (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Enhanced Content Preview
                </h4>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="prose dark:prose-invert max-w-none">
                  {previewContent ? (
                    <div dangerouslySetInnerHTML={{ __html: previewContent }} />
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No content to preview</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Content Editor
                </h4>
              </div>
              
              <div className="flex-1 p-4">
                <textarea
                  value={content}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-full h-full resize-none border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-sm font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                  placeholder="Paste your content here to start enhancing it with AI..."
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};