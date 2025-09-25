/**
 * Multi-Vertical Content - Migrated from MultiVerticalModal
 * Responsive content component for multi-industry generation within unified modal
 * Generate content for multiple industries simultaneously with vertical-specific customizations
 */

import React, { useState, useEffect } from 'react';
import { useAIStore } from '../../../../store/aiStore';
import { aiGenerationService } from '../../../../services/ai/AIGenerationService';
import {
  Play,
  Pause,
  RotateCcw,
  Check,
  Loader2,
  Building,
  Stethoscope,
  Laptop,
  Dumbbell,
  GraduationCap,
  ShoppingBag,
  Car,
  Home,
  Utensils,
  Briefcase,
  Settings,
  Eye,
  Download,
  Copy,
  ChevronDown,
  ChevronRight,
  Info,
  Zap,
  Globe,
  Users,
  Target,
  Lightbulb,
  X
} from 'lucide-react';

interface MultiVerticalContentProps {
  activeVertical?: string;
  onClose?: () => void;
  isMobile?: boolean;
}

interface VerticalConfig {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  selected: boolean;
  customPrompt?: string;
  targetAudience?: string;
  keyFocus?: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  result?: {
    title: string;
    content: string | null;
    generatedAt: string;
  };
}

export const MultiVerticalContent: React.FC<MultiVerticalContentProps> = ({
  activeVertical,
  onClose,
  isMobile = false,
}) => {
  const {
    currentGeneration,
    loading,
    addNotification,
    startGeneration,
    completeGeneration,
  } = useAIStore();

  // Local state
  const [basePrompt, setBasePrompt] = useState('');
  const [contentType, setContentType] = useState('blog_post');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedVerticals, setExpandedVerticals] = useState<Set<string>>(new Set());
  const [verticals, setVerticals] = useState<VerticalConfig[]>([
    {
      id: 'hospitality',
      name: 'Hospitality & Travel',
      icon: Building,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      selected: true,
      targetAudience: 'Hotel managers, restaurant owners, travel agents',
      keyFocus: 'Guest experience, service quality, booking optimization',
      status: 'pending',
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      icon: Stethoscope,
      color: 'text-green-600 bg-green-50 border-green-200',
      selected: true,
      targetAudience: 'Healthcare professionals, clinic administrators',
      keyFocus: 'Patient care, compliance, digital health solutions',
      status: 'pending',
    },
    {
      id: 'technology',
      name: 'Technology & SaaS',
      icon: Laptop,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      selected: true,
      targetAudience: 'Tech leaders, developers, product managers',
      keyFocus: 'Innovation, scalability, technical solutions',
      status: 'pending',
    },
    {
      id: 'fitness',
      name: 'Fitness & Wellness',
      icon: Dumbbell,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      selected: false,
      targetAudience: 'Gym owners, personal trainers, wellness coaches',
      keyFocus: 'Health optimization, fitness trends, member engagement',
      status: 'pending',
    },
    {
      id: 'education',
      name: 'Education',
      icon: GraduationCap,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      selected: false,
      targetAudience: 'Educators, administrators, ed-tech professionals',
      keyFocus: 'Learning outcomes, technology integration, student success',
      status: 'pending',
    },
    {
      id: 'ecommerce',
      name: 'E-commerce',
      icon: ShoppingBag,
      color: 'text-pink-600 bg-pink-50 border-pink-200',
      selected: false,
      targetAudience: 'Online retailers, e-commerce managers, marketers',
      keyFocus: 'Conversion optimization, customer experience, sales growth',
      status: 'pending',
    },
    {
      id: 'automotive',
      name: 'Automotive',
      icon: Car,
      color: 'text-red-600 bg-red-50 border-red-200',
      selected: false,
      targetAudience: 'Dealership owners, automotive professionals',
      keyFocus: 'Sales processes, customer service, industry trends',
      status: 'pending',
    },
    {
      id: 'realestate',
      name: 'Real Estate',
      icon: Home,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
      selected: false,
      targetAudience: 'Real estate agents, property managers, developers',
      keyFocus: 'Property marketing, client relationships, market trends',
      status: 'pending',
    },
  ]);

  // Handle vertical selection
  const handleVerticalToggle = (verticalId: string) => {
    setVerticals(prev =>
      prev.map(vertical =>
        vertical.id === verticalId
          ? { ...vertical, selected: !vertical.selected }
          : vertical
      )
    );
  };

  // Handle custom prompt change
  const handleCustomPromptChange = (verticalId: string, prompt: string) => {
    setVerticals(prev =>
      prev.map(vertical =>
        vertical.id === verticalId
          ? { ...vertical, customPrompt: prompt }
          : vertical
      )
    );
  };

  // Toggle expanded state
  const toggleExpanded = (verticalId: string) => {
    const newExpanded = new Set(expandedVerticals);
    if (newExpanded.has(verticalId)) {
      newExpanded.delete(verticalId);
    } else {
      newExpanded.add(verticalId);
    }
    setExpandedVerticals(newExpanded);
  };

  // Start multi-vertical generation
  const handleStartGeneration = async () => {
    const selectedVerticals = verticals.filter(v => v.selected);

    if (!basePrompt.trim()) {
      addNotification({
        type: 'error',
        title: 'Missing Base Prompt',
        message: 'Please enter a base prompt for content generation',
        duration: 5000,
      });
      return;
    }

    if (selectedVerticals.length === 0) {
      addNotification({
        type: 'error',
        title: 'No Verticals Selected',
        message: 'Please select at least one vertical for generation',
        duration: 5000,
      });
      return;
    }

    setIsGenerating(true);

    // Reset all vertical statuses
    setVerticals(prev =>
      prev.map(vertical => ({ ...vertical, status: vertical.selected ? 'pending' : vertical.status }))
    );

    try {
      // Process each vertical sequentially
      for (const vertical of selectedVerticals) {
        // Update status to generating
        setVerticals(prev =>
          prev.map(v =>
            v.id === vertical.id ? { ...v, status: 'generating' } : v
          )
        );

        // Build vertical-specific prompt
        const verticalPrompt = `${basePrompt}

Industry Focus: ${vertical.name}
Target Audience: ${vertical.targetAudience}
Key Focus Areas: ${vertical.keyFocus}

${vertical.customPrompt ? `Additional Requirements: ${vertical.customPrompt}` : ''}

Please adapt the content specifically for the ${vertical.name} industry, using relevant examples, terminology, and addressing specific challenges faced by ${vertical.targetAudience}.`;

        try {
          // Generate content for this vertical
          const response = await aiGenerationService.generateContent({
            prompt: verticalPrompt,
            mode: 'multi_vertical' as const,
            task: contentType,
            vertical: vertical.id as 'hospitality' | 'healthcare' | 'tech' | 'athletics' | 'all',
            provider: 'openai' as const,
            model: 'gpt-4o',
            context: {
              styleGuides: { brand: true },
              previousContent: {
                mode: 'none' as const,
                includeElements: {
                  titles: false,
                  synopsis: false,
                  content: false,
                  tags: false,
                  metadata: false,
                  images: false
                }
              },
              referenceImages: {},
              additionalContext: `Multi-vertical generation: ${basePrompt}\nVertical: ${vertical.name}`,
            },
          });

          if (response.success && response.data) {
            // Update with successful result
            setVerticals(prev =>
              prev.map(v =>
                v.id === vertical.id
                  ? {
                      ...v,
                      status: 'completed',
                      result: {
                        title: `${vertical.name} Content`,
                        content: response.data?.content || '',
                        generatedAt: new Date().toISOString(),
                      },
                    }
                  : v
              )
            );
          } else {
            throw new Error(response.error || 'Generation failed');
          }
        } catch (error) {
          console.error(`Error generating for ${vertical.name}:`, error);

          // Update with error status
          setVerticals(prev =>
            prev.map(v =>
              v.id === vertical.id ? { ...v, status: 'error' } : v
            )
          );

          addNotification({
            type: 'error',
            title: `${vertical.name} Generation Failed`,
            message: error instanceof Error ? error.message : 'Generation failed',
            duration: 5000,
          });
        }
      }

      const completedCount = verticals.filter(v => v.status === 'completed').length;
      const errorCount = verticals.filter(v => v.status === 'error').length;

      addNotification({
        type: completedCount > 0 ? 'success' : 'warning',
        title: 'Multi-Vertical Generation Complete',
        message: `Generated content for ${completedCount} verticals${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        duration: 5000,
      });

    } catch (error) {
      console.error('Multi-vertical generation error:', error);
      addNotification({
        type: 'error',
        title: 'Generation Error',
        message: 'Failed to complete multi-vertical generation',
        duration: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Reset all verticals
  const handleReset = () => {
    setVerticals(prev =>
      prev.map(vertical => ({
        ...vertical,
        status: 'pending',
        result: undefined,
        customPrompt: '',
      }))
    );
    setIsGenerating(false);
  };

  // Copy content to clipboard
  const handleCopyContent = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      addNotification({
        type: 'success',
        title: 'Copied',
        message: 'Content copied to clipboard',
        duration: 2000,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy content to clipboard',
        duration: 3000,
      });
    }
  };

  // Get status icon and color
  const getStatusDisplay = (status: VerticalConfig['status']) => {
    switch (status) {
      case 'generating':
        return { icon: Loader2, className: 'animate-spin text-blue-600 dark:text-blue-400', label: 'Generating...' };
      case 'completed':
        return { icon: Check, className: 'text-green-600 dark:text-green-400', label: 'Completed' };
      case 'error':
        return { icon: X, className: 'text-red-600 dark:text-red-400', label: 'Error' };
      default:
        return { icon: Globe, className: 'text-gray-400 dark:text-gray-500', label: 'Pending' };
    }
  };

  const selectedCount = verticals.filter(v => v.selected).length;
  const completedCount = verticals.filter(v => v.status === 'completed').length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Multi-Vertical Content Generation
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Generate tailored content for multiple industries simultaneously
          </p>
        </div>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>

      <div className={`flex flex-1 overflow-hidden ${isMobile ? 'flex-col' : ''}`}>
        {/* Left Panel - Configuration */}
        <div className={`${isMobile ? 'w-full border-b' : 'w-1/2 border-r'} border-gray-200 dark:border-gray-700 flex flex-col`}>
          {/* Base Prompt */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Base Content Prompt
            </label>
            <textarea
              value={basePrompt}
              onChange={(e) => setBasePrompt(e.target.value)}
              placeholder="Enter the core content idea that will be adapted for each industry..."
              className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />

            <div className="flex items-center justify-between mt-2">
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="blog_post">Blog Post</option>
                <option value="article">Article</option>
                <option value="social_post">Social Media</option>
                <option value="email">Email Campaign</option>
                <option value="case_study">Case Study</option>
              </select>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                {selectedCount} verticals selected
              </div>
            </div>
          </div>

          {/* Vertical Selection */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {verticals.map((vertical) => {
                const IconComponent = vertical.icon;
                const statusDisplay = getStatusDisplay(vertical.status);
                const StatusIcon = statusDisplay.icon;
                const isExpanded = expandedVerticals.has(vertical.id);

                return (
                  <div
                    key={vertical.id}
                    className={`border-2 rounded-lg transition-colors ${
                      vertical.selected
                        ? `${vertical.color} border-2 dark:bg-opacity-20`
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                    }`}
                  >
                    {/* Header */}
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={vertical.selected}
                            onChange={() => handleVerticalToggle(vertical.id)}
                            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                          <IconComponent className={`h-5 w-5 ${vertical.color.split(' ')[0]} dark:opacity-80`} />
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {vertical.name}
                            </span>
                            <div className="flex items-center space-x-2 mt-1">
                              <StatusIcon className={`h-3 w-3 ${statusDisplay.className}`} />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {statusDisplay.label}
                              </span>
                            </div>
                          </div>
                        </label>

                        <div className="flex items-center space-x-2">
                          {vertical.result && (
                            <button
                              onClick={() => handleCopyContent(vertical.result!.content || '')}
                              className={`p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded ${
                                isMobile ? 'min-h-[44px] min-w-[44px]' : ''
                              }`}
                              title="Copy content"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          )}
                          {vertical.selected && (
                            <button
                              onClick={() => toggleExpanded(vertical.id)}
                              className={`p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded ${
                                isMobile ? 'min-h-[44px] min-w-[44px]' : ''
                              }`}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {vertical.selected && (
                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{vertical.targetAudience}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <Target className="h-3 w-3" />
                            <span>{vertical.keyFocus}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expanded Content */}
                    {vertical.selected && isExpanded && (
                      <div className="border-t border-gray-200 dark:border-gray-600 p-4">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Custom Instructions (Optional)
                        </label>
                        <textarea
                          value={vertical.customPrompt || ''}
                          onChange={(e) => handleCustomPromptChange(vertical.id, e.target.value)}
                          placeholder={`Additional requirements specific to ${vertical.name}...`}
                          className="w-full h-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <button
                onClick={handleReset}
                className={`flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${
                  isMobile ? 'min-h-[44px]' : ''
                }`}
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>

              <button
                onClick={handleStartGeneration}
                disabled={isGenerating || !basePrompt.trim() || selectedCount === 0}
                className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors ${
                  isMobile ? 'min-h-[44px]' : ''
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Generate All</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Results */}
        {!isMobile && (
          <div className="w-1/2 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Generation Results
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {completedCount}/{selectedCount} completed
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {verticals.filter(v => v.selected).length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Globe className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Select verticals to see results here
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {verticals
                    .filter(v => v.selected)
                    .map((vertical) => {
                      const IconComponent = vertical.icon;
                      const statusDisplay = getStatusDisplay(vertical.status);
                      const StatusIcon = statusDisplay.icon;

                      return (
                        <div
                          key={vertical.id}
                          className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <IconComponent className={`h-4 w-4 ${vertical.color.split(' ')[0]} dark:opacity-80`} />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {vertical.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <StatusIcon className={`h-4 w-4 ${statusDisplay.className}`} />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {statusDisplay.label}
                              </span>
                            </div>
                          </div>

                          {vertical.status === 'generating' && (
                            <div className="flex items-center justify-center py-8">
                              <div className="text-center">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Generating content...
                                </p>
                              </div>
                            </div>
                          )}

                          {vertical.status === 'error' && (
                            <div className="flex items-center justify-center py-8">
                              <div className="text-center">
                                <X className="h-6 w-6 mx-auto mb-2 text-red-600 dark:text-red-400" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Generation failed
                                </p>
                              </div>
                            </div>
                          )}

                          {vertical.result && (
                            <div className="space-y-3">
                              {vertical.result.title && (
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {vertical.result.title}
                                </h4>
                              )}
                              <div className="bg-gray-50 dark:bg-gray-900 rounded p-3">
                                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-6">
                                  {vertical.result.content}
                                </p>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>
                                  Generated {new Date(vertical.result.generatedAt).toLocaleTimeString()}
                                </span>
                                <button
                                  onClick={() => handleCopyContent(vertical.result!.content || '')}
                                  className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                  <Copy className="h-3 w-3" />
                                  <span>Copy</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};