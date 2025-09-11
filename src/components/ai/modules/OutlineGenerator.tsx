// Outline Generator Module - Create and manage blog post outlines
// Features: Section management, AI-generated outlines, drag-and-drop reordering

import React, { useState, useCallback, useEffect } from 'react';
import { useAIStore } from '../../../store/aiStore.js';
import { 
  List, 
  Loader2, 
  RefreshCw,
  Copy,
  Download,
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  CheckCircle,
  AlertCircle,
  Clock,
  Hash,
  FileText,
  Target,
  Settings,
  Search,
  Filter,
  BarChart3
} from 'lucide-react';

interface OutlineSection {
  id: string;
  title: string;
  description?: string;
  subsections?: OutlineSection[];
  estimatedWords: number;
  priority: 'high' | 'medium' | 'low';
  type: 'introduction' | 'main' | 'conclusion' | 'custom';
  content?: string;
  keywords?: string[];
  order: number;
  selected: boolean;
  edited: boolean;
  originalTitle?: string;
}

interface BlogOutline {
  id: string;
  title: string;
  totalSections: number;
  estimatedWords: number;
  structure: 'linear' | 'hierarchical' | 'modular';
  sections: OutlineSection[];
  created: boolean;
  selected: boolean;
  createdAt: string;
}

interface OutlineGeneratorProps {
  topic?: string;
  title?: string;
  synopsis?: string;
  context?: string;
  targetWordCount?: number;
  onOutlineSelected?: (outline: BlogOutline) => void;
  onMultipleOutlinesSelected?: (outlines: BlogOutline[]) => void;
  className?: string;
  mode?: 'standalone' | 'structured';
  existingOutlines?: BlogOutline[];
}

export const OutlineGenerator: React.FC<OutlineGeneratorProps> = ({
  topic: initialTopic = '',
  title = '',
  synopsis = '',
  context = '',
  targetWordCount = 1500,
  onOutlineSelected,
  onMultipleOutlinesSelected,
  className = '',
  mode = 'standalone',
  existingOutlines = []
}) => {
  const {
    activeProvider,
    activeModel,
    addNotification,
    updateAnalytics,
    updateProviderUsage
  } = useAIStore();

  // State
  const [outlines, setOutlines] = useState<BlogOutline[]>(existingOutlines);
  const [selectedOutlines, setSelectedOutlines] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStructure, setFilterStructure] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'estimatedWords' | 'totalSections' | 'createdAt' | 'title'>('estimatedWords');
  
  // Configuration state
  const [topic, setTopic] = useState(initialTopic);
  const [blogTitle, setBlogTitle] = useState(title);
  const [blogSynopsis, setBlogSynopsis] = useState(synopsis);
  const [localTargetWordCount, setLocalTargetWordCount] = useState(targetWordCount);
  const [count, setCount] = useState(2);
  const [outlineStructure, setOutlineStructure] = useState<'linear' | 'hierarchical' | 'modular'>('hierarchical');
  const [sectionCount, setSectionCount] = useState<'auto' | number>('auto');
  const [includeIntroConclusion, setIncludeIntroConclusion] = useState(true);
  const [includeSubsections, setIncludeSubsections] = useState(true);
  const [includeKeywords, setIncludeKeywords] = useState(true);
  const [optimizeForSEO, setOptimizeForSEO] = useState(true);

  // Configuration options
  const structureOptions = [
    { value: 'linear', label: 'Linear', description: 'Sequential flow from start to finish' },
    { value: 'hierarchical', label: 'Hierarchical', description: 'Main sections with subsections' },
    { value: 'modular', label: 'Modular', description: 'Independent, reorderable sections' }
  ];

  const sectionCountOptions = [
    { value: 'auto', label: 'Auto (AI decides)' },
    { value: 3, label: '3 sections' },
    { value: 5, label: '5 sections' },
    { value: 7, label: '7 sections' },
    { value: 10, label: '10 sections' }
  ];

  // Generate outlines
  const handleGenerateOutlines = useCallback(async () => {
    if (!topic.trim() && !blogTitle.trim()) {
      addNotification({
        type: 'warning',
        title: 'Missing Information',
        message: 'Please enter either a topic or blog title to generate outlines',
        duration: 3000
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate-outlines',
          topic: topic,
          title: blogTitle,
          synopsis: blogSynopsis,
          context: context,
          count: count,
          structure: outlineStructure,
          sectionCount: sectionCount,
          targetWordCount: localTargetWordCount,
          includeIntroConclusion: includeIntroConclusion,
          includeSubsections: includeSubsections,
          includeKeywords: includeKeywords,
          optimizeForSEO: optimizeForSEO,
          provider: activeProvider,
          model: activeModel
        }),
      });

      const result = await response.json();

      if (result.success) {
        const newOutlines = result.outlines.map((outline: any) => ({
          ...outline,
          id: `outline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          selected: false,
          created: true,
          createdAt: new Date().toISOString()
        }));

        setOutlines(prev => [...prev, ...newOutlines]);
        setSelectedOutlines(new Set());

        // Update analytics
        updateAnalytics({
          tokens: result.tokensUsed,
          cost: result.cost,
          generations: 1
        });

        updateProviderUsage(activeProvider, result.tokensUsed || 0, result.cost || 0);

        addNotification({
          type: 'success',
          title: 'Outlines Generated',
          message: `Generated ${result.outlines.length} outline variations`,
          duration: 4000
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Generation Failed',
          message: result.error || 'Failed to generate outlines',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('[OutlineGenerator] Error generating outlines:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to generate outlines. Please try again.',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  }, [topic, blogTitle, blogSynopsis, context, count, outlineStructure, sectionCount, localTargetWordCount, includeIntroConclusion, includeSubsections, includeKeywords, optimizeForSEO, activeProvider, activeModel, addNotification, updateAnalytics, updateProviderUsage]);

  // Toggle outline selection
  const toggleOutlineSelection = useCallback((outlineId: string) => {
    const newSelected = new Set(selectedOutlines);
    if (newSelected.has(outlineId)) {
      newSelected.delete(outlineId);
    } else {
      newSelected.add(outlineId);
    }
    setSelectedOutlines(newSelected);
    
    // Update outlines state
    setOutlines(prev => prev.map(outline => 
      outline.id === outlineId ? { ...outline, selected: !outline.selected } : outline
    ));
  }, [selectedOutlines]);

  // Start editing section
  const startEditingSection = useCallback((sectionId: string, currentText: string) => {
    setEditingId(sectionId);
    setEditingText(currentText);
  }, []);

  // Save edited section
  const saveEditSection = useCallback((outlineId: string, sectionId: string) => {
    if (editingText.trim()) {
      setOutlines(prev => prev.map(outline => 
        outline.id === outlineId ? {
          ...outline,
          sections: outline.sections.map(section =>
            section.id === sectionId ? {
              ...section,
              title: editingText.trim(),
              edited: true,
              originalTitle: section.originalTitle || section.title
            } : section
          )
        } : outline
      ));
    }
    setEditingId(null);
    setEditingText('');
  }, [editingText]);

  // Add new section to outline
  const addSectionToOutline = useCallback((outlineId: string) => {
    const outline = outlines.find(o => o.id === outlineId);
    if (!outline) return;

    const newSection: OutlineSection = {
      id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Section',
      estimatedWords: 200,
      priority: 'medium',
      type: 'main',
      order: outline.sections.length,
      selected: false,
      edited: false
    };

    setOutlines(prev => prev.map(o =>
      o.id === outlineId ? {
        ...o,
        sections: [...o.sections, newSection],
        totalSections: o.totalSections + 1,
        estimatedWords: o.estimatedWords + newSection.estimatedWords
      } : o
    ));
  }, [outlines]);

  // Delete section from outline
  const deleteSectionFromOutline = useCallback((outlineId: string, sectionId: string) => {
    setOutlines(prev => prev.map(outline =>
      outline.id === outlineId ? {
        ...outline,
        sections: outline.sections.filter(section => section.id !== sectionId),
        totalSections: outline.totalSections - 1
      } : outline
    ));
  }, []);

  // Delete outline
  const deleteOutline = useCallback((outlineId: string) => {
    setOutlines(prev => prev.filter(outline => outline.id !== outlineId));
    setSelectedOutlines(prev => {
      const newSelected = new Set(prev);
      newSelected.delete(outlineId);
      return newSelected;
    });
  }, []);

  // Copy outline to clipboard
  const copyOutline = useCallback(async (outline: BlogOutline) => {
    try {
      const outlineText = outline.sections
        .map((section, index) => {
          let text = `${index + 1}. ${section.title}`;
          if (section.description) {
            text += `\n   ${section.description}`;
          }
          if (section.subsections && section.subsections.length > 0) {
            section.subsections.forEach((sub, subIndex) => {
              text += `\n   ${index + 1}.${subIndex + 1} ${sub.title}`;
            });
          }
          return text;
        })
        .join('\n\n');

      await navigator.clipboard.writeText(`${outline.title}\n\n${outlineText}`);
      addNotification({
        type: 'success',
        title: 'Copied',
        message: 'Outline copied to clipboard',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      addNotification({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy outline to clipboard',
        duration: 3000
      });
    }
  }, [addNotification]);

  // Handle selection for external use
  const handleUseSelected = useCallback(() => {
    const selectedOutlinesList = outlines.filter(outline => selectedOutlines.has(outline.id));
    
    if (selectedOutlinesList.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Outlines Selected',
        message: 'Please select at least one outline to use',
        duration: 3000
      });
      return;
    }

    if (selectedOutlinesList.length === 1) {
      onOutlineSelected?.(selectedOutlinesList[0]);
    } else {
      onMultipleOutlinesSelected?.(selectedOutlinesList);
    }

    addNotification({
      type: 'success',
      title: 'Outlines Selected',
      message: `${selectedOutlinesList.length} outline(s) ready for use`,
      duration: 3000
    });
  }, [outlines, selectedOutlines, onOutlineSelected, onMultipleOutlinesSelected, addNotification]);

  // Filter and sort outlines
  const filteredAndSortedOutlines = React.useMemo(() => {
    let filtered = outlines;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(outline =>
        outline.title.toLowerCase().includes(term) ||
        outline.sections.some(section => 
          section.title.toLowerCase().includes(term) ||
          (section.description && section.description.toLowerCase().includes(term))
        )
      );
    }

    // Structure filter
    if (filterStructure !== 'all') {
      filtered = filtered.filter(outline => outline.structure === filterStructure);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'estimatedWords':
          return b.estimatedWords - a.estimatedWords;
        case 'totalSections':
          return b.totalSections - a.totalSections;
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [outlines, searchTerm, filterStructure, sortBy]);

  const getStructureIcon = (structure: string) => {
    const icons: Record<string, React.ReactNode> = {
      'linear': <BarChart3 className="h-4 w-4" />,
      'hierarchical': <List className="h-4 w-4" />,
      'modular': <Target className="h-4 w-4" />
    };
    return icons[structure] || <List className="h-4 w-4" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <List className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Outline Generator
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create structured outlines for your blog posts
            </p>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="space-y-4">
          {/* Topic, Title, Synopsis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Content Marketing"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title (Optional)
              </label>
              <input
                type="text"
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                placeholder="Blog title if available"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Words
              </label>
              <input
                type="number"
                value={localTargetWordCount}
                onChange={(e) => setLocalTargetWordCount(Number(e.target.value))}
                min="500"
                max="5000"
                step="100"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Synopsis */}
          {mode === 'standalone' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Synopsis (Optional)
              </label>
              <textarea
                value={blogSynopsis}
                onChange={(e) => setBlogSynopsis(e.target.value)}
                placeholder="Brief summary of what the blog should cover..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          )}

          {/* Configuration Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Count */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Variations</label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {[1, 2, 3, 4].map(option => (
                  <option key={option} value={option}>{option} outlines</option>
                ))}
              </select>
            </div>

            {/* Structure */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Structure</label>
              <select
                value={outlineStructure}
                onChange={(e) => setOutlineStructure(e.target.value as any)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {structureOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Count */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Sections</label>
              <select
                value={sectionCount}
                onChange={(e) => setSectionCount(e.target.value === 'auto' ? 'auto' : Number(e.target.value))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {sectionCountOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeIntroConclusion}
                onChange={(e) => setIncludeIntroConclusion(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Intro & Conclusion</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeSubsections}
                onChange={(e) => setIncludeSubsections(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Subsections</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeKeywords}
                onChange={(e) => setIncludeKeywords(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Keywords</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={optimizeForSEO}
                onChange={(e) => setOptimizeForSEO(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">SEO Optimize</span>
            </label>
          </div>

          {/* Generate Button */}
          <div>
            <button
              onClick={handleGenerateOutlines}
              disabled={(!topic.trim() && !blogTitle.trim()) || loading}
              className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Outlines...
                </>
              ) : (
                <>
                  <List className="h-4 w-4 mr-2" />
                  Generate Outlines
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Outlines Section */}
      {outlines.length > 0 && (
        <>
          {/* Outlines Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Generated Outlines ({filteredAndSortedOutlines.length})
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedOutlines.size} selected
                </p>
              </div>
              
              {selectedOutlines.size > 0 && (
                <button
                  onClick={handleUseSelected}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Use Selected Outlines
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
                  placeholder="Search outlines..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Structure Filter */}
              <select
                value={filterStructure}
                onChange={(e) => setFilterStructure(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Structures</option>
                {structureOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="estimatedWords">Sort by Word Count</option>
                <option value="totalSections">Sort by Sections</option>
                <option value="createdAt">Sort by Date</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>
          </div>

          {/* Outlines List */}
          <div className="p-6">
            <div className="space-y-6">
              {filteredAndSortedOutlines.map(outline => (
                <OutlineCard
                  key={outline.id}
                  outline={outline}
                  isEditing={editingId}
                  editingText={editingText}
                  onEditingTextChange={setEditingText}
                  onToggleSelection={() => toggleOutlineSelection(outline.id)}
                  onStartEditing={startEditingSection}
                  onSaveEdit={(sectionId) => saveEditSection(outline.id, sectionId)}
                  onCancelEdit={() => setEditingId(null)}
                  onCopy={() => copyOutline(outline)}
                  onAddSection={() => addSectionToOutline(outline.id)}
                  onDeleteSection={(sectionId) => deleteSectionFromOutline(outline.id, sectionId)}
                  onDelete={() => deleteOutline(outline.id)}
                  getStructureIcon={getStructureIcon}
                  getPriorityColor={getPriorityColor}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {outlines.length === 0 && (
        <div className="p-12">
          <div className="text-center">
            <List className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Ready to Create Outlines?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Enter your blog topic and configure your preferences to generate structured outlines for your content.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Outline Card Component
interface OutlineCardProps {
  outline: BlogOutline;
  isEditing: string | null;
  editingText: string;
  onEditingTextChange: (text: string) => void;
  onToggleSelection: () => void;
  onStartEditing: (sectionId: string, text: string) => void;
  onSaveEdit: (sectionId: string) => void;
  onCancelEdit: () => void;
  onCopy: () => void;
  onAddSection: () => void;
  onDeleteSection: (sectionId: string) => void;
  onDelete: () => void;
  getStructureIcon: (structure: string) => React.ReactNode;
  getPriorityColor: (priority: string) => string;
}

const OutlineCard: React.FC<OutlineCardProps> = ({
  outline,
  isEditing,
  editingText,
  onEditingTextChange,
  onToggleSelection,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onCopy,
  onAddSection,
  onDeleteSection,
  onDelete,
  getStructureIcon,
  getPriorityColor
}) => {
  return (
    <div
      className={`p-5 border rounded-lg transition-all ${
        outline.selected
          ? 'border-purple-300 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Selection Checkbox */}
        <input
          type="checkbox"
          checked={outline.selected}
          onChange={onToggleSelection}
          className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />

        <div className="flex-1 min-w-0">
          {/* Outline Header */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              {outline.title}
            </h4>
            
            <div className="flex items-center space-x-2">
              {/* Structure Icon */}
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                {getStructureIcon(outline.structure)}
                <span className="ml-1 capitalize">{outline.structure}</span>
              </div>
              
              {/* Metrics */}
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Hash className="h-4 w-4 mr-1" />
                {outline.totalSections} sections
              </div>
              
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <FileText className="h-4 w-4 mr-1" />
                ~{outline.estimatedWords} words
              </div>
            </div>
          </div>

          {/* Sections List */}
          <div className="space-y-2 mb-4">
            {outline.sections.map((section, index) => (
              <div
                key={section.id}
                className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded"
              >
                <div className="flex items-center">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500 ml-1">{index + 1}.</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  {isEditing === section.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => onEditingTextChange(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        autoFocus
                      />
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onSaveEdit(section.id)}
                          className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={onCancelEdit}
                          className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {section.title}
                        {section.edited && (
                          <span className="ml-2 px-1 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">
                            Edited
                          </span>
                        )}
                      </h5>
                      {section.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {section.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-3 mt-2">
                        <span className={`px-2 py-0.5 text-xs rounded ${getPriorityColor(section.priority)}`}>
                          {section.priority}
                        </span>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          ~{section.estimatedWords}w
                        </div>
                        {section.keywords && section.keywords.length > 0 && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Target className="h-3 w-3 mr-1" />
                            {section.keywords.slice(0, 2).join(', ')}
                            {section.keywords.length > 2 && ` +${section.keywords.length - 2}`}
                          </div>
                        )}
                      </div>
                      
                      {/* Subsections */}
                      {section.subsections && section.subsections.length > 0 && (
                        <div className="mt-2 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                          {section.subsections.map((subsection, subIndex) => (
                            <div key={subsection.id} className="text-sm text-gray-700 dark:text-gray-300 py-1">
                              {index + 1}.{subIndex + 1} {subsection.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Section Actions */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onStartEditing(section.id, section.title)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
                    title="Edit section"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  
                  <button
                    onClick={() => onDeleteSection(section.id)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                    title="Delete section"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Section Button */}
          <button
            onClick={onAddSection}
            className="flex items-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-4"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Section
          </button>
        </div>

        {/* Outline Actions */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onCopy}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
            title="Copy outline"
          >
            <Copy className="h-4 w-4" />
          </button>
          
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
            title="Delete outline"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};