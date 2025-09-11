// Enhanced Style Guide Modal with Markdown Rendering, Rich Text Editor, and AI Enhancement
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAIStore } from '../../../store/aiStore';
import { aiGenerationService } from '../../../services/ai/AIGenerationService';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  X, Plus, Edit3, Trash2, Save, Search, Check, Loader2,
  Building, Layers, Type, User, BookOpen, Eye, EyeOff,
  ChevronLeft, Copy, FileText, ToggleLeft, ToggleRight,
  Sparkles, History, MessageSquare
} from 'lucide-react';

interface StyleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StyleGuide {
  id: string;
  type: 'brand' | 'vertical' | 'writing_style' | 'persona';
  name: string;
  content: string;
  description?: string;
  active: boolean;
  vertical?: string;
  is_default?: boolean;
  version?: number;
  parent_id?: string;
}

// Convert markdown to HTML for Quill editor
const markdownToHtml = (markdown: string): string => {
  // Basic conversion - in production, use a proper markdown parser
  let html = markdown;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // Lists
  html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  // Line breaks
  html = html.replace(/\n/g, '<br>');
  
  return html;
};

// Convert HTML from Quill back to markdown
const htmlToMarkdown = (html: string): string => {
  let markdown = html;
  
  // Remove Quill's extra tags
  markdown = markdown.replace(/<p>/g, '');
  markdown = markdown.replace(/<\/p>/g, '\n\n');
  
  // Headers
  markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '# $1\n');
  markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, '## $1\n');
  markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, '### $1\n');
  
  // Bold
  markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
  markdown = markdown.replace(/<b>(.*?)<\/b>/g, '**$1**');
  
  // Italic
  markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
  markdown = markdown.replace(/<i>(.*?)<\/i>/g, '*$1*');
  
  // Lists
  markdown = markdown.replace(/<ul>/g, '');
  markdown = markdown.replace(/<\/ul>/g, '\n');
  markdown = markdown.replace(/<li>(.*?)<\/li>/g, '* $1\n');
  
  // Break tags
  markdown = markdown.replace(/<br\s*\/?>/g, '\n');
  
  // Clean up extra spaces and newlines
  markdown = markdown.replace(/\n\n\n+/g, '\n\n');
  
  return markdown.trim();
};

export const StyleGuideModalEnhanced: React.FC<StyleGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { styleGuides, setStyleGuides, addNotification, activeProvider, activeModel } = useAIStore();
  
  const [activeTab, setActiveTab] = useState<'brand' | 'vertical' | 'writing_style' | 'persona'>('brand');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<StyleGuide | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [viewMode, setViewMode] = useState<'preview' | 'markdown'>('preview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAIEnhancement, setShowAIEnhancement] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [newGuide, setNewGuide] = useState({
    name: '',
    description: '',
    content: '',
    type: activeTab as string,
    vertical: null as string | null,
    aiPrompt: '', // For AI generation
  });

  // Quill modules configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote'],
      ['link'],
      ['clean']
    ],
  };

  // Load style guides on mount
  useEffect(() => {
    if (isOpen) {
      loadStyleGuides();
    }
  }, [isOpen]);

  const loadStyleGuides = async () => {
    setLoading(true);
    try {
      const response = await aiGenerationService.getStyleGuides();
      if (response.success && response.data) {
        setStyleGuides(response.data);
      }
    } catch (error) {
      console.error('Error loading style guides:', error);
      addNotification({
        type: 'error',
        title: 'Failed to load style guides',
        message: 'Please try again later',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (guide: StyleGuide) => {
    setSelectedGuide(guide);
    setEditContent(guide.content);
    setEditName(guide.name);
    setEditDescription(guide.description || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedGuide) return;
    
    setLoading(true);
    try {
      // Convert HTML back to markdown if in editor mode
      const contentToSave = isEditing ? htmlToMarkdown(editContent) : selectedGuide.content;
      
      const response = await aiGenerationService.updateStyleGuide(selectedGuide.id, {
        ...selectedGuide,
        name: editName,
        description: editDescription,
        content: contentToSave,
      });
      
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Style guide updated',
          message: 'Your changes have been saved',
        });
        setIsEditing(false);
        loadStyleGuides();
      }
    } catch (error) {
      console.error('Error saving style guide:', error);
      addNotification({
        type: 'error',
        title: 'Failed to save',
        message: 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      // If AI prompt is provided, generate content with AI first
      let finalContent = newGuide.content;
      
      if (newGuide.aiPrompt && newGuide.aiPrompt.trim()) {
        setAiGenerating(true);
        
        // Generate style guide using AI
        const prompt = `Create a ${newGuide.type.replace('_', ' ')} style guide for "${newGuide.name}".
        
        ${newGuide.description ? `Description: ${newGuide.description}` : ''}
        
        User requirements: ${newGuide.aiPrompt}
        
        Please create a comprehensive style guide in markdown format with appropriate sections.`;
        
        const aiResponse = await aiGenerationService.generateContent({
          mode: 'direct',
          vertical: 'all',
          task: 'style_guide_creation',
          prompt,
          context: {
            styleGuides: {
              brand: true,
              vertical: [],
              writingStyle: [],
              persona: [],
            },
            previousContent: {
              mode: 'none',
              includeElements: {
                titles: false,
                synopsis: false,
                content: false,
                tags: false,
                metadata: false,
                images: false
              }
            },
            referenceImages: {
              style: [],
              logo: [],
              persona: []
            },
            additionalContext: `Creating ${newGuide.type} style guide`,
          },
          provider: activeProvider as 'openai' | 'anthropic' | 'google' | 'perplexity',
          model: activeModel,
        });
        
        if (aiResponse.success && aiResponse.data?.content) {
          finalContent = aiResponse.data.content;
        }
        setAiGenerating(false);
      }
      
      const response = await aiGenerationService.createStyleGuide({
        ...newGuide,
        content: finalContent,
        type: activeTab,
        active: true,
        version: 1,
        isDefault: false,
        voiceCharacteristics: [],
        vertical: newGuide.vertical || undefined,
      });
      
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Style guide created',
          message: 'New style guide has been added',
        });
        setShowCreateForm(false);
        setNewGuide({ name: '', description: '', content: '', type: activeTab, vertical: null, aiPrompt: '' });
        loadStyleGuides();
      }
    } catch (error) {
      console.error('Error creating style guide:', error);
      addNotification({
        type: 'error',
        title: 'Failed to create',
        message: 'Please try again',
      });
      setAiGenerating(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAIEnhance = async () => {
    if (!selectedGuide || !aiPrompt.trim()) return;
    
    setAiGenerating(true);
    try {
      const prompt = `Enhance and update this ${selectedGuide.type.replace('_', ' ')} style guide based on the following feedback:
      
      Current style guide:
      ${selectedGuide.content}
      
      Feedback/Instructions:
      ${aiPrompt}
      
      Please provide an improved version of the style guide maintaining the same format and structure but incorporating the requested changes.`;
      
      const response = await aiGenerationService.generateContent({
        mode: 'direct',
        vertical: 'all',
        task: 'style_guide_enhancement',
        prompt,
        context: {
          styleGuides: {
            brand: true,
            vertical: [],
            writingStyle: [],
            persona: [],
          },
          previousContent: {
            mode: 'none',
            includeElements: {
              titles: false,
              synopsis: false,
              content: false,
              tags: false,
              metadata: false,
              images: false
            }
          },
          referenceImages: {
            style: [],
            logo: [],
            persona: []
          },
          additionalContext: `Enhancing ${selectedGuide.type} style guide (ID: ${selectedGuide.id})`,
        },
        provider: activeProvider as 'openai' | 'anthropic' | 'google' | 'perplexity',
        model: activeModel,
      });
      
      if (response.success && response.data?.content) {
        // Create a new version of the style guide
        const updateResponse = await aiGenerationService.updateStyleGuide(selectedGuide.id, {
          ...selectedGuide,
          content: response.data.content,
          version: (selectedGuide.version || 1) + 1,
        });
        
        if (updateResponse.success) {
          addNotification({
            type: 'success',
            title: 'Style guide enhanced',
            message: 'AI has updated your style guide',
          });
          setShowAIEnhancement(false);
          setAiPrompt('');
          loadStyleGuides();
        }
      }
    } catch (error) {
      console.error('Error enhancing with AI:', error);
      addNotification({
        type: 'error',
        title: 'AI enhancement failed',
        message: 'Please try again',
      });
    } finally {
      setAiGenerating(false);
    }
  };

  const handleToggleActive = async (guide: StyleGuide) => {
    try {
      const response = await aiGenerationService.updateStyleGuide(guide.id, {
        ...guide,
        active: !guide.active,
      });
      
      if (response.success) {
        loadStyleGuides();
      }
    } catch (error) {
      console.error('Error toggling guide:', error);
    }
  };

  const getFilteredGuides = () => {
    const typeMap = {
      'brand': 'brand',
      'vertical': 'vertical',
      'writing': 'writing_style',
      'persona': 'persona'
    };
    
    const targetType = typeMap[activeTab as keyof typeof typeMap];
    
    return styleGuides.filter(guide => {
      const matchesType = guide.type === targetType;
      const matchesSearch = !searchTerm || 
        guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (guide.description && guide.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesType && matchesSearch;
    });
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'brand': return Building;
      case 'vertical': return Layers;
      case 'writing': return Type;
      case 'persona': return User;
      default: return BookOpen;
    }
  };

  const getTabCount = (tab: string) => {
    const typeMap = {
      'brand': 'brand',
      'vertical': 'vertical',
      'writing': 'writing_style',
      'persona': 'persona'
    };
    const targetType = typeMap[tab as keyof typeof typeMap];
    return styleGuides.filter(g => g.type === targetType).length;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Style Guide Manager
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Create and manage style guides for consistent AI content generation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 px-6 pt-4 border-b border-gray-200 dark:border-gray-700">
          {(['brand', 'vertical', 'writing', 'persona'] as const).map((tab) => {
            const Icon = getTabIcon(tab);
            const count = getTabCount(tab);
            const label = tab === 'writing' ? 'Writing' : tab.charAt(0).toUpperCase() + tab.slice(1);
            
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab as any);
                  setSelectedGuide(null);
                  setIsEditing(false);
                  setShowCreateForm(false);
                  setShowAIEnhancement(false);
                }}
                className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - List */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search style guides..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Guide List */}
            <div className="p-4 space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <>
                  {getFilteredGuides().length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400">
                        No style guides found
                      </p>
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Create Style Guide</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center space-x-2 mb-4"
                      >
                        <Plus className="h-4 w-4" />
                        <span>New Guide</span>
                      </button>
                      
                      {getFilteredGuides().map((guide) => (
                        <div
                          key={guide.id}
                          onClick={() => {
                            setSelectedGuide(guide);
                            setIsEditing(false);
                            setShowCreateForm(false);
                            setShowAIEnhancement(false);
                          }}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedGuide?.id === guide.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {guide.name}
                              </h4>
                              {guide.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                  {guide.description}
                                </p>
                              )}
                              {guide.version && guide.version > 1 && (
                                <span className="inline-block mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  Version {guide.version}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleActive(guide);
                              }}
                              className="ml-2"
                            >
                              {guide.active ? (
                                <ToggleRight className="h-5 w-5 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                          </div>
                          {guide.active && (
                            <span className="inline-block mt-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                              Active
                            </span>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Panel - Detail/Editor */}
          <div className="flex-1 overflow-y-auto">
            {showCreateForm ? (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Create New Style Guide
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newGuide.name}
                      onChange={(e) => setNewGuide({ ...newGuide, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newGuide.description}
                      onChange={(e) => setNewGuide({ ...newGuide, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      AI Generation Prompt (Optional)
                    </label>
                    <textarea
                      value={newGuide.aiPrompt}
                      onChange={(e) => setNewGuide({ ...newGuide, aiPrompt: e.target.value })}
                      placeholder="Describe what you want the AI to create for this style guide..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-24"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      If provided, AI will generate the initial content based on your description
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Content {newGuide.aiPrompt ? '(Will be generated by AI)' : ''}
                    </label>
                    {!newGuide.aiPrompt && (
                      <ReactQuill
                        value={newGuide.content}
                        onChange={(value) => setNewGuide({ ...newGuide, content: htmlToMarkdown(value) })}
                        modules={quillModules}
                        className="bg-white dark:bg-gray-800 rounded-lg"
                        theme="snow"
                      />
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewGuide({ name: '', description: '', content: '', type: activeTab, vertical: null, aiPrompt: '' });
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={!newGuide.name || (!newGuide.content && !newGuide.aiPrompt) || loading || aiGenerating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors inline-flex items-center space-x-2"
                    >
                      {loading || aiGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : newGuide.aiPrompt ? (
                        <Sparkles className="h-4 w-4" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span>{aiGenerating ? 'Generating...' : newGuide.aiPrompt ? 'Create with AI' : 'Create'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : showAIEnhancement ? (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Enhance Style Guide with AI
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Guide:</p>
                  <h4 className="font-medium text-gray-900 dark:text-white">{selectedGuide?.name}</h4>
                  {selectedGuide?.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedGuide.description}</p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Enhancement Instructions
                    </label>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Describe how you'd like to improve or modify this style guide..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-32"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      AI will update the style guide based on your feedback while preserving the overall structure
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowAIEnhancement(false);
                        setAiPrompt('');
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAIEnhance}
                      disabled={!aiPrompt.trim() || aiGenerating}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors inline-flex items-center space-x-2"
                    >
                      {aiGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      <span>{aiGenerating ? 'Enhancing...' : 'Enhance with AI'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedGuide ? (
              <div className="p-6">
                {/* Guide Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {selectedGuide.name}
                        </h3>
                        {selectedGuide.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {selectedGuide.description}
                          </p>
                        )}
                        {selectedGuide.version && selectedGuide.version > 1 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Version {selectedGuide.version}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {!isEditing && (
                      <>
                        <button
                          onClick={() => setShowAIEnhancement(true)}
                          className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                          title="Enhance with AI"
                        >
                          <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </button>
                        <button
                          onClick={() => setViewMode(viewMode === 'preview' ? 'markdown' : 'preview')}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title={viewMode === 'preview' ? 'Show Markdown' : 'Show Preview'}
                        >
                          {viewMode === 'preview' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(selectedGuide)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Content Area */}
                <div className="prose dark:prose-invert max-w-none">
                  {isEditing ? (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Content
                      </label>
                      <ReactQuill
                        value={markdownToHtml(editContent)}
                        onChange={setEditContent}
                        modules={quillModules}
                        className="bg-white dark:bg-gray-800 rounded-lg min-h-[300px]"
                        theme="snow"
                      />
                      <div className="flex justify-end space-x-3 mt-4">
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditContent('');
                            setEditName('');
                            setEditDescription('');
                          }}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors inline-flex items-center space-x-2"
                        >
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </div>
                  ) : viewMode === 'preview' ? (
                    <div className="prose-spacing">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                          h1: ({children}) => <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>,
                          h2: ({children}) => <h2 className="text-xl font-semibold mb-3 mt-5">{children}</h2>,
                          h3: ({children}) => <h3 className="text-lg font-medium mb-2 mt-4">{children}</h3>,
                          p: ({children}) => <p className="mb-4">{children}</p>,
                          ul: ({children}) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>,
                          li: ({children}) => <li className="mb-1">{children}</li>,
                          blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">{children}</blockquote>,
                        }}
                      >
                        {selectedGuide.content}
                      </ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                        {selectedGuide.content}
                      </code>
                    </pre>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Select a style guide to view or edit
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};