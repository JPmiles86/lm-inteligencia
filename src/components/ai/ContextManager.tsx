// Context Manager - Handles context selection and management for AI generation
// Displays current context settings and provides quick access to modify them

import React, { useState, useEffect } from 'react';
import { useAIStore, PreviousBlog } from '../../store/aiStore';
import { aiGenerationService } from '../../services/ai/AIGenerationService';
import { 
  BookOpen, 
  FileText, 
  Settings, 
  Plus, 
  ChevronDown,
  ChevronRight,
  Layers,
  Type,
  User,
  Building,
  Lightbulb,
} from 'lucide-react';

interface ContextManagerProps {
  activeVertical?: string;
}

export const ContextManager: React.FC<ContextManagerProps> = ({
  activeVertical = 'hospitality',
}) => {
  const {
    selectedContext,
    styleGuides,
    // previousBlogs, // Unused - preserved for future use
    updateContext,
    setStyleGuides,
    setPreviousBlogs,
    addNotification,
  } = useAIStore();

  // Local state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['style-guides', 'previous-content'])
  );
  const [availableBlogs, setAvailableBlogs] = useState<PreviousBlog[]>([]);
  const [/* loading */, setLoading] = useState(false); // loading preserved for future use

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load style guides
        const stylesResponse = await aiGenerationService.getStyleGuides();
        if (stylesResponse.success && stylesResponse.data) {
          setStyleGuides(stylesResponse.data);
        }

        // Load previous blogs (simulated - would come from existing blog API)
        const mockBlogs = [
          {
            id: '1',
            title: 'Digital Marketing Trends for Hospitality',
            vertical: 'hospitality',
            publishedDate: '2024-01-15',
            excerpt: 'Exploring the latest digital marketing strategies...',
            category: 'Marketing',
            tags: ['digital marketing', 'hospitality', 'trends'],
          },
          {
            id: '2',
            title: 'Social Media Best Practices for Hotels',
            vertical: 'hospitality',
            publishedDate: '2024-01-10',
            excerpt: 'How hotels can leverage social media...',
            category: 'Social Media',
            tags: ['social media', 'hotels', 'best practices'],
          },
          {
            id: '3',
            title: 'Healthcare Marketing Compliance Guide',
            vertical: 'healthcare',
            publishedDate: '2024-01-08',
            excerpt: 'Navigating marketing compliance in healthcare...',
            category: 'Compliance',
            tags: ['healthcare', 'compliance', 'marketing'],
          },
        ];
        setAvailableBlogs(mockBlogs);
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

    loadData();
  }, [setStyleGuides, setPreviousBlogs, addNotification]);

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

  // Handle style guide selection
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
  };

  // Handle include elements toggle
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
  };

  // Get guide icon
  const getGuideIcon = (type: string) => {
    switch (type) {
      case 'brand':
        return Building;
      case 'vertical':
        return Layers;
      case 'writing_style':
        return Type;
      case 'persona':
        return User;
      default:
        return BookOpen;
    }
  };

  // Get guide color
  const getGuideColor = (type: string) => {
    switch (type) {
      case 'brand':
        return 'text-blue-600 bg-blue-50';
      case 'vertical':
        return 'text-green-600 bg-green-50';
      case 'writing_style':
        return 'text-purple-600 bg-purple-50';
      case 'persona':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Filter style guides by type
  const getStyleGuidesByType = (type: string) => {
    return styleGuides.filter(guide => guide.type === type && guide.active);
  };

  // Filter blogs by vertical
  const getFilteredBlogs = () => {
    if (selectedContext.previousContent.mode === 'all') {
      return availableBlogs;
    }
    if (selectedContext.previousContent.mode === 'vertical') {
      return availableBlogs.filter(blog => blog.vertical === activeVertical);
    }
    return availableBlogs;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Context Settings
        </h3>
        <button
          className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded"
          title="Refresh context"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Style Guides Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
        <button
          onClick={() => toggleSection('style-guides')}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
        >
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Style Guides
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
              {Object.values(selectedContext.styleGuides).flat().filter(Boolean).length}
            </span>
          </div>
          {expandedSections.has('style-guides') ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </button>

        {expandedSections.has('style-guides') && (
          <div className="p-3 pt-0 space-y-3">
            {/* Brand Guide */}
            <div>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedContext.styleGuides.brand || false}
                  onChange={() => handleStyleGuideToggle('brand', 'brand')}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <Building className="h-4 w-4 text-blue-600" />
                <span className="text-gray-900 dark:text-white">Brand Guide (Inteligencia)</span>
              </label>
            </div>

            {/* Other Style Guide Types */}
            {['vertical', 'writing_style', 'persona'].map((type) => {
              const guides = getStyleGuidesByType(type);
              const IconComponent = getGuideIcon(type);
              const colorClass = getGuideColor(type);
              const selectedGuides = Array.isArray(selectedContext.styleGuides[type as keyof typeof selectedContext.styleGuides]) 
                ? selectedContext.styleGuides[type as keyof typeof selectedContext.styleGuides] as string[]
                : [];

              if (guides.length === 0) return null;

              return (
                <div key={type}>
                  <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                    {type.replace('_', ' ')}
                  </h4>
                  <div className="space-y-1">
                    {guides.map((guide) => (
                      <label key={guide.id} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedGuides.includes(guide.id)}
                          onChange={() => handleStyleGuideToggle(guide.id, type as any)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <IconComponent className={`h-4 w-4 ${colorClass.split(' ')[0]}`} />
                        <span className="text-gray-900 dark:text-white flex-1">
                          {guide.name}
                        </span>
                        {guide.isDefault && (
                          <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Create New Guide */}
            <button className="w-full flex items-center justify-center space-x-1 p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500">
              <Plus className="h-4 w-4" />
              <span>Create Style Guide</span>
            </button>
          </div>
        )}
      </div>

      {/* Previous Content Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
        <button
          onClick={() => toggleSection('previous-content')}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
        >
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Previous Content
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
              {selectedContext.previousContent.items?.length || 0}
            </span>
          </div>
          {expandedSections.has('previous-content') ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </button>

        {expandedSections.has('previous-content') && (
          <div className="p-3 pt-0 space-y-3">
            {/* Content Mode */}
            <div>
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                Selection Mode
              </h4>
              <div className="space-y-1">
                {[
                  { value: 'none', label: 'None' },
                  { value: 'all', label: 'All from database' },
                  { value: 'vertical', label: `All from ${activeVertical}` },
                  { value: 'selected', label: 'Selected items' },
                ].map((mode) => (
                  <label key={mode.value} className="flex items-center space-x-2 text-sm">
                    <input
                      type="radio"
                      name="content-mode"
                      value={mode.value}
                      checked={selectedContext.previousContent.mode === mode.value}
                      onChange={(e) => updateContext({
                        previousContent: {
                          ...selectedContext.previousContent,
                          mode: e.target.value as any,
                        },
                      })}
                      className="border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-900 dark:text-white">{mode.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Blog Selection (when mode is 'selected') */}
            {selectedContext.previousContent.mode === 'selected' && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                  Select Blogs
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {getFilteredBlogs().map((blog) => (
                    <label key={blog.id} className="flex items-start space-x-2 text-sm p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                      <input
                        type="checkbox"
                        checked={selectedContext.previousContent.items?.includes(blog.id) || false}
                        onChange={() => handleBlogToggle(blog.id)}
                        className="mt-0.5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-white font-medium truncate">
                          {blog.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {blog.publishedDate} • {blog.category}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                          {blog.excerpt}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Include Elements */}
            <div>
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                Include Elements
              </h4>
              <div className="grid grid-cols-2 gap-2">
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
          </div>
        )}
      </div>

      {/* Custom Context Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
        <button
          onClick={() => toggleSection('custom-context')}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
        >
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Custom Instructions
            </span>
          </div>
          {expandedSections.has('custom-context') ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </button>

        {expandedSections.has('custom-context') && (
          <div className="p-3 pt-0">
            <textarea
              value={selectedContext.additionalContext || ''}
              onChange={(e) => updateContext({ additionalContext: e.target.value })}
              placeholder="Add specific instructions, context, or requirements for the AI generation..."
              className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
            />
          </div>
        )}
      </div>

      {/* Context Preview */}
      <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-3">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          Context Summary
        </h4>
        <div className="text-xs text-blue-700 dark:text-blue-200 space-y-1">
          <p>
            <strong>Style Guides:</strong> {Object.values(selectedContext.styleGuides).flat().filter(Boolean).length} selected
          </p>
          <p>
            <strong>Previous Content:</strong> {selectedContext.previousContent.mode} 
            {selectedContext.previousContent.items?.length ? ` (${selectedContext.previousContent.items.length} items)` : ''}
          </p>
          <p>
            <strong>Elements:</strong> {Object.entries(selectedContext.previousContent.includeElements)
              .filter(([_, checked]) => checked)
              .map(([element, _]) => element)
              .join(', ') || 'none'}
          </p>
          {selectedContext.additionalContext && (
            <p>
              <strong>Custom:</strong> {selectedContext.additionalContext.slice(0, 50)}
              {selectedContext.additionalContext.length > 50 ? '...' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};