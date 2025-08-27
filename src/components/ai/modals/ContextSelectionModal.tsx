// Context Selection Modal - Comprehensive context selection and configuration
// Allows users to select style guides, previous content, and additional context

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAIStore } from '../../../store/aiStore';
import { aiGenerationService } from '../../../services/ai/AIGenerationService';
import { 
  X, 
  BookOpen, 
  FileText, 
  Search, 
  Filter,
  Check,
  Plus,
  Loader2,
  Building,
  Layers,
  Type,
  User,
  Calendar,
  Tag,
  Eye,
  ChevronRight,
  ChevronDown,
  Info,
  Lightbulb,
  Sparkles,
} from 'lucide-react';

interface ContextSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeVertical?: string;
}

export const ContextSelectionModal: React.FC<ContextSelectionModalProps> = ({
  isOpen,
  onClose,
  activeVertical = 'hospitality',
}) => {
  const {
    selectedContext,
    styleGuides,
    previousBlogs,
    updateContext,
    setStyleGuides,
    setPreviousBlogs,
    addNotification,
  } = useAIStore();

  // Local state
  const [activeTab, setActiveTab] = useState<'guides' | 'content' | 'custom'>('guides');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [blogFilter, setBlogFilter] = useState('all');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['brand', 'vertical']));
  const [previewContext, setPreviewContext] = useState<string>('');
  const [customContextValue, setCustomContextValue] = useState(selectedContext.additionalContext || '');
  
  // Use ref to store timeout for debouncing
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load data on open
  useEffect(() => {
    if (isOpen) {
      loadContextData();
      buildPreview();
      // Sync local state with context when modal opens
      setCustomContextValue(selectedContext.additionalContext || '');
    }
  }, [isOpen, selectedContext.additionalContext]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, []);

  // Load context data
  const loadContextData = async () => {
    setLoading(true);
    try {
      // Load style guides
      const stylesResponse = await aiGenerationService.getStyleGuides();
      if (stylesResponse.success && stylesResponse.data) {
        setStyleGuides(stylesResponse.data);
      }

      // Mock blogs data (in real app, this would come from existing blog API)
      const mockBlogs = [
        {
          id: '1',
          title: 'Digital Marketing Trends for Hotels in 2024',
          vertical: 'hospitality',
          publishedDate: '2024-01-15T10:00:00Z',
          excerpt: 'Exploring the latest digital marketing strategies that are reshaping how hotels connect with guests...',
          category: 'Marketing Trends',
          tags: ['digital marketing', 'hotels', 'trends', '2024'],
          readTime: 8,
          wordCount: 1200,
        },
        {
          id: '2',
          title: 'Social Media Best Practices for Restaurants',
          vertical: 'hospitality',
          publishedDate: '2024-01-10T14:30:00Z',
          excerpt: 'How restaurants can leverage social media platforms to increase visibility and drive reservations...',
          category: 'Social Media',
          tags: ['social media', 'restaurants', 'best practices'],
          readTime: 6,
          wordCount: 900,
        },
        {
          id: '3',
          title: 'Healthcare Digital Marketing Compliance Guide',
          vertical: 'healthcare',
          publishedDate: '2024-01-08T09:15:00Z',
          excerpt: 'Navigating HIPAA and other compliance requirements while building effective marketing campaigns...',
          category: 'Compliance',
          tags: ['healthcare', 'compliance', 'HIPAA', 'marketing'],
          readTime: 12,
          wordCount: 1800,
        },
        {
          id: '4',
          title: 'AI-Powered Marketing for SaaS Companies',
          vertical: 'tech',
          publishedDate: '2024-01-05T16:45:00Z',
          excerpt: 'How technology companies can leverage artificial intelligence to optimize their marketing efforts...',
          category: 'AI & Technology',
          tags: ['AI', 'SaaS', 'marketing automation', 'technology'],
          readTime: 10,
          wordCount: 1500,
        },
        {
          id: '5',
          title: 'Sports Marketing in the Digital Age',
          vertical: 'athletics',
          publishedDate: '2024-01-03T11:20:00Z',
          excerpt: 'Modern strategies for marketing sports teams, events, and facilities in today\'s digital landscape...',
          category: 'Sports Marketing',
          tags: ['sports marketing', 'digital', 'athletics', 'events'],
          readTime: 7,
          wordCount: 1050,
        },
      ];
      setPreviousBlogs(mockBlogs);
    } catch (error) {
      console.error('Error loading context data:', error);
      addNotification({
        type: 'error',
        title: 'Loading Error',
        message: 'Failed to load context data',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Build context preview
  const buildPreview = async () => {
    try {
      const response = await aiGenerationService.buildContext(selectedContext);
      if (response.success && response.data) {
        setPreviewContext(response.data);
      }
    } catch (error) {
      console.error('Error building context preview:', error);
    }
  };

  // Handle style guide toggle
  const handleStyleGuideToggle = (guideId: string, type: keyof typeof selectedContext.styleGuides) => {
    const current = selectedContext.styleGuides[type];
    let updated: string[] | boolean;

    if (type === 'brand') {
      updated = !current;
    } else {
      const currentArray = Array.isArray(current) ? current : [];
      updated = currentArray.includes(guideId)
        ? currentArray.filter(id => id !== guideId)
        : [...currentArray, guideId];
    }

    updateContext({
      styleGuides: {
        ...selectedContext.styleGuides,
        [type]: updated,
      },
    });

    buildPreview();
  };

  // Handle blog selection
  const handleBlogToggle = (blogId: string) => {
    const currentItems = selectedContext.previousContent.items || [];
    const updated = currentItems.includes(blogId)
      ? currentItems.filter(id => id !== blogId)
      : [...currentItems, blogId];

    updateContext({
      previousContent: {
        ...selectedContext.previousContent,
        mode: 'selected',
        items: updated,
      },
    });

    buildPreview();
  };

  // Handle content mode change
  const handleContentModeChange = (mode: 'none' | 'all' | 'vertical' | 'selected') => {
    updateContext({
      previousContent: {
        ...selectedContext.previousContent,
        mode,
        verticalFilter: mode === 'vertical' ? activeVertical : undefined,
        items: mode === 'selected' ? (selectedContext.previousContent.items || []) : [],
      },
    });

    buildPreview();
  };

  // Handle elements toggle
  const handleElementToggle = (element: keyof typeof selectedContext.previousContent.includeElements) => {
    updateContext({
      previousContent: {
        ...selectedContext.previousContent,
        includeElements: {
          ...selectedContext.previousContent.includeElements,
          [element]: !selectedContext.previousContent.includeElements[element],
        },
      },
    });

    buildPreview();
  };

  // Handle custom context change
  const handleCustomContextChange = (value: string) => {
    // Update local state immediately for smooth typing
    setCustomContextValue(value);
    
    // Debounce the store update and preview
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
    
    previewTimeoutRef.current = setTimeout(() => {
      updateContext({ additionalContext: value });
      buildPreview();
    }, 500); // Wait 500ms after user stops typing
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Filter functions
  const getStyleGuidesByType = (type: string) => {
    return styleGuides.filter(guide => 
      guide.type === type && 
      guide.active &&
      (!searchTerm || guide.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const getFilteredBlogs = () => {
    let filtered = previousBlogs;

    // Filter by vertical
    if (blogFilter === 'vertical') {
      filtered = filtered.filter(blog => blog.vertical === activeVertical);
    } else if (blogFilter !== 'all') {
      filtered = filtered.filter(blog => blog.category === blogFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  };

  // Get guide icon and color
  const getGuideIcon = (type: string) => {
    const icons = {
      brand: Building,
      vertical: Layers,
      writing_style: Type,
      persona: User,
    };
    return icons[type as keyof typeof icons] || BookOpen;
  };

  const getGuideColor = (type: string) => {
    const colors = {
      brand: 'text-blue-600 bg-blue-50 border-blue-200',
      vertical: 'text-green-600 bg-green-50 border-green-200',
      writing_style: 'text-purple-600 bg-purple-50 border-purple-200',
      persona: 'text-orange-600 bg-orange-50 border-orange-200',
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'guides', label: 'Style Guides', icon: BookOpen },
    { id: 'content', label: 'Previous Content', icon: FileText },
    { id: 'custom', label: 'Custom Context', icon: Lightbulb },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Context Selection
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Configure the context and knowledge base for AI generation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Content */}
          <div className="flex-1 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search and Filter Bar */}
            {(activeTab === 'guides' || activeTab === 'content') && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Search ${activeTab === 'guides' ? 'style guides' : 'content'}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  {activeTab === 'content' && (
                    <select
                      value={blogFilter}
                      onChange={(e) => setBlogFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Content</option>
                      <option value="vertical">Current Vertical</option>
                      <option value="Marketing Trends">Marketing Trends</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Compliance">Compliance</option>
                      <option value="AI & Technology">AI & Technology</option>
                    </select>
                  )}
                </div>
              </div>
            )}

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600 dark:text-gray-400">Loading context data...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Style Guides Tab */}
                  {activeTab === 'guides' && (
                    <div className="space-y-6">
                      {/* Brand Guide */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                            <Building className="h-5 w-5 text-blue-600" />
                            <span>Brand Guide</span>
                          </h3>
                        </div>
                        
                        <label className="flex items-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedContext.styleGuides.brand || false}
                            onChange={() => handleStyleGuideToggle('brand', 'brand')}
                            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Inteligencia Brand Guidelines
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              Core brand voice, tone, and messaging guidelines
                            </p>
                          </div>
                          {selectedContext.styleGuides.brand && (
                            <Check className="h-5 w-5 text-blue-600" />
                          )}
                        </label>
                      </div>

                      {/* Other Style Guide Types */}
                      {['vertical', 'writing_style', 'persona'].map((type) => {
                        const guides = getStyleGuidesByType(type);
                        if (guides.length === 0) return null;

                        const IconComponent = getGuideIcon(type);
                        const colorClass = getGuideColor(type);
                        const selectedGuides = Array.isArray(selectedContext.styleGuides[type as keyof typeof selectedContext.styleGuides])
                          ? selectedContext.styleGuides[type as keyof typeof selectedContext.styleGuides] as string[]
                          : [];

                        return (
                          <div key={type}>
                            <button
                              onClick={() => toggleSection(type)}
                              className="w-full flex items-center justify-between mb-4"
                            >
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                                <IconComponent className={`h-5 w-5 ${colorClass.split(' ')[0]}`} />
                                <span className="capitalize">{type.replace('_', ' ')} Guides</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                  {selectedGuides.length}/{guides.length}
                                </span>
                              </h3>
                              {expandedSections.has(type) ? (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              )}
                            </button>

                            {expandedSections.has(type) && (
                              <div className="grid gap-3">
                                {guides.map((guide) => (
                                  <label
                                    key={guide.id}
                                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                                      selectedGuides.includes(guide.id)
                                        ? `${colorClass} border-2`
                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedGuides.includes(guide.id)}
                                      onChange={() => handleStyleGuideToggle(guide.id, type as any)}
                                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="ml-3 flex-1">
                                      <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                          {guide.name}
                                        </p>
                                        <div className="flex items-center space-x-2">
                                          {guide.isDefault && (
                                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-0.5 rounded">
                                              Default
                                            </span>
                                          )}
                                          {guide.vertical && (
                                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded capitalize">
                                              {guide.vertical}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {guide.description && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                          {guide.description}
                                        </p>
                                      )}
                                    </div>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Previous Content Tab */}
                  {activeTab === 'content' && (
                    <div className="space-y-6">
                      {/* Content Selection Mode */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                          Content Selection Mode
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            { value: 'none', label: 'No Previous Content', desc: 'Generate without context' },
                            { value: 'all', label: 'All Content', desc: 'Include all published blogs' },
                            { value: 'vertical', label: `${activeVertical} Content`, desc: 'Include current vertical only' },
                            { value: 'selected', label: 'Selected Items', desc: 'Choose specific blogs below' },
                          ].map((mode) => (
                            <label
                              key={mode.value}
                              className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedContext.previousContent.mode === mode.value
                                  ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                              }`}
                            >
                              <input
                                type="radio"
                                name="content-mode"
                                value={mode.value}
                                checked={selectedContext.previousContent.mode === mode.value}
                                onChange={(e) => handleContentModeChange(e.target.value as any)}
                                className="mt-1 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {mode.label}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                  {mode.desc}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Include Elements */}
                      <div>
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                          Include Elements
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(selectedContext.previousContent.includeElements).map(([element, checked]) => (
                            <label key={element} className="flex items-center space-x-2 text-sm">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleElementToggle(element as any)}
                                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-gray-900 dark:text-white capitalize">
                                {element.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Blog Selection */}
                      {selectedContext.previousContent.mode === 'selected' && (
                        <div>
                          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                            Select Blogs ({selectedContext.previousContent.items?.length || 0} selected)
                          </h4>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {getFilteredBlogs().map((blog) => (
                              <label
                                key={blog.id}
                                className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                                  selectedContext.previousContent.items?.includes(blog.id)
                                    ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedContext.previousContent.items?.includes(blog.id) || false}
                                  onChange={() => handleBlogToggle(blog.id)}
                                  className="mt-1 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="ml-3 flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <h5 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {blog.title}
                                    </h5>
                                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded ml-2 capitalize">
                                      {blog.vertical}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                    {blog.excerpt}
                                  </p>
                                  <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>{new Date(blog.publishedDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <FileText className="h-3 w-3" />
                                      <span>{blog.readTime} min</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Tag className="h-3 w-3" />
                                      <span>{blog.category}</span>
                                    </div>
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Custom Context Tab */}
                  {activeTab === 'custom' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Additional Instructions
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Add specific instructions, requirements, or context that should be considered during generation.
                        </p>
                        
                        <textarea
                          value={customContextValue}
                          onChange={(e) => handleCustomContextChange(e.target.value)}
                          placeholder="Enter specific instructions, target audience details, key topics to cover, tone adjustments, or any other context that will help generate better content..."
                          className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                        
                        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                          <p><strong>Examples:</strong></p>
                          <ul className="mt-1 list-disc list-inside space-y-1">
                            <li>"Focus on actionable tips that hotel managers can implement immediately"</li>
                            <li>"Include statistical data and case studies where possible"</li>
                            <li>"Write for C-level executives in the healthcare industry"</li>
                            <li>"Emphasize cost-effectiveness and ROI in all recommendations"</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-md font-medium text-gray-900 dark:text-white">
                  Context Preview
                </h3>
              </div>
            </div>
            
            <div className="p-4 h-full overflow-y-auto">
              {/* Context Summary */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Selected Context
                  </h4>
                  <div className="space-y-2">
                    {/* Style Guides Summary */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Style Guides:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {Object.values(selectedContext.styleGuides).flat().filter(Boolean).length}
                      </span>
                    </div>
                    
                    {/* Content Summary */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Previous Content:</span>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {selectedContext.previousContent.mode}
                        {selectedContext.previousContent.items?.length 
                          ? ` (${selectedContext.previousContent.items.length})`
                          : ''}
                      </span>
                    </div>
                    
                    {/* Custom Context */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Custom Instructions:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedContext.additionalContext ? 'Yes' : 'None'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Context Preview Text */}
                {previewContext && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Generated Context
                    </h4>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-3 text-xs text-gray-700 dark:text-gray-300 max-h-64 overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-mono">
                        {previewContext.slice(0, 500)}
                        {previewContext.length > 500 && '...'}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="bg-blue-50 dark:bg-blue-900 rounded p-3">
                  <div className="flex items-center space-x-1 mb-2">
                    <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Context Quality
                    </h4>
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-200 space-y-1">
                    <div className="flex justify-between">
                      <span>Richness:</span>
                      <span className="font-medium">
                        {Object.values(selectedContext.styleGuides).flat().filter(Boolean).length > 0 ||
                         selectedContext.previousContent.mode !== 'none' ||
                         selectedContext.additionalContext
                          ? 'High' : 'Basic'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated tokens:</span>
                      <span className="font-medium">
                        ~{Math.ceil((previewContext?.length || 0) / 4)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <Info className="inline h-4 w-4 mr-1" />
            Context will be included with all AI generations
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                addNotification({
                  type: 'success',
                  title: 'Context Updated',
                  message: 'Context selection saved successfully',
                  duration: 3000,
                });
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Apply Context
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};