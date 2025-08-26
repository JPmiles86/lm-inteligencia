// Style Guide Modal - Manage writing style guides and brand guidelines
// Allows users to create, edit, and manage style guides for consistent AI generation

import React, { useState, useEffect } from 'react';
import { useAIStore } from '../../../store/aiStore';
import { aiGenerationService } from '../../../services/ai/AIGenerationService';
import { 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  Search, 
  Filter,
  Check,
  Loader2,
  Building,
  Layers,
  Type,
  User,
  BookOpen,
  Info,
  Lightbulb,
  Star,
  Globe,
  Users,
  FileText,
  Tag,
  AlertCircle,
} from 'lucide-react';

interface StyleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StyleGuideModal: React.FC<StyleGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    styleGuides,
    setStyleGuides,
    addNotification,
  } = useAIStore();

  // Local state
  const [activeTab, setActiveTab] = useState<'brand' | 'vertical' | 'writing' | 'persona'>('brand');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingGuide, setEditingGuide] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'brand' as 'brand' | 'vertical' | 'writing_style' | 'persona',
    description: '',
    content: '',
    vertical: '',
    tags: [] as string[],
    isDefault: false,
    active: true,
    version: 1,
    voiceCharacteristics: [] as string[],
  });

  // Load style guides on open
  useEffect(() => {
    if (isOpen) {
      loadStyleGuides();
    }
  }, [isOpen]);

  // Load style guides
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
        title: 'Loading Error',
        message: 'Failed to load style guides',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (editingGuide) {
        // Update existing guide
        response = await aiGenerationService.updateStyleGuide(editingGuide.id, formData);
      } else {
        // Create new guide
        response = await aiGenerationService.createStyleGuide(formData);
      }

      if (response.success) {
        addNotification({
          type: 'success',
          title: editingGuide ? 'Guide Updated' : 'Guide Created',
          message: `Style guide ${editingGuide ? 'updated' : 'created'} successfully`,
          duration: 3000,
        });
        
        // Reload guides and close form
        await loadStyleGuides();
        handleCloseForm();
      } else {
        throw new Error(response.error || 'Failed to save style guide');
      }
    } catch (error) {
      console.error('Error saving style guide:', error);
      addNotification({
        type: 'error',
        title: 'Save Error',
        message: error instanceof Error ? error.message : 'Failed to save style guide',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (guideId: string) => {
    if (!confirm('Are you sure you want to delete this style guide?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await aiGenerationService.deleteStyleGuide(guideId);
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Guide Deleted',
          message: 'Style guide deleted successfully',
          duration: 3000,
        });
        await loadStyleGuides();
      } else {
        throw new Error(response.error || 'Failed to delete style guide');
      }
    } catch (error) {
      console.error('Error deleting style guide:', error);
      addNotification({
        type: 'error',
        title: 'Delete Error',
        message: error instanceof Error ? error.message : 'Failed to delete style guide',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (guide: any) => {
    setEditingGuide(guide);
    setFormData({
      name: guide.name || '',
      type: guide.type || 'brand',
      description: guide.description || '',
      content: guide.content || '',
      vertical: guide.vertical || '',
      tags: guide.tags || [],
      isDefault: guide.isDefault || false,
      active: guide.active !== false,
      version: guide.version || 1,
      voiceCharacteristics: guide.voiceCharacteristics || [],
    });
    setShowForm(true);
  };

  // Handle close form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingGuide(null);
    setFormData({
      name: '',
      type: 'brand' as 'brand' | 'vertical' | 'writing_style' | 'persona',
      description: '',
      content: '',
      vertical: '',
      tags: [],
      isDefault: false,
      active: true,
      version: 1,
      voiceCharacteristics: [],
    });
  };

  // Filter guides
  const getFilteredGuides = () => {
    const filtered = styleGuides.filter(guide => 
      guide.type === activeTab &&
      (!searchTerm || guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       guide.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return filtered;
  };

  // Get tab icon and info
  const getTabInfo = (type: string) => {
    const info = {
      brand: { icon: Building, label: 'Brand Guidelines', color: 'text-blue-600' },
      vertical: { icon: Layers, label: 'Industry Specific', color: 'text-green-600' },
      writing: { icon: Type, label: 'Writing Styles', color: 'text-purple-600' },
      persona: { icon: User, label: 'Voice & Persona', color: 'text-orange-600' },
    };
    return info[type as keyof typeof info] || info.brand;
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'brand', label: 'Brand', icon: Building },
    { id: 'vertical', label: 'Industry', icon: Layers },
    { id: 'writing', label: 'Writing', icon: Type },
    { id: 'persona', label: 'Persona', icon: User },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[85vh] flex flex-col">
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

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const tabInfo = getTabInfo(tab.id);
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? `border-${tabInfo.color.replace('text-', '')} ${tabInfo.color}`
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{tab.label}</span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded text-xs">
                      {styleGuides.filter(g => g.type === tab.id).length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search and Actions */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search style guides..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <button
                  onClick={() => setShowForm(true)}
                  className="ml-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Guide</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600 dark:text-gray-400">Loading style guides...</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {getFilteredGuides().length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No style guides found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {searchTerm ? 'Try adjusting your search terms' : `Create your first ${getTabInfo(activeTab).label.toLowerCase()} style guide`}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={() => setShowForm(true)}
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Create Style Guide</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    getFilteredGuides().map((guide) => (
                      <div
                        key={guide.id}
                        className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {guide.name}
                              </h3>
                              {guide.isDefault && (
                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium">
                                  Default
                                </span>
                              )}
                              {!guide.active && (
                                <span className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200 px-2 py-1 rounded text-xs">
                                  Inactive
                                </span>
                              )}
                            </div>
                            {guide.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {guide.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              {guide.vertical && (
                                <div className="flex items-center space-x-1">
                                  <Globe className="h-3 w-3" />
                                  <span className="capitalize">{guide.vertical}</span>
                                </div>
                              )}
                              {guide.tags && guide.tags.length > 0 && (
                                <div className="flex items-center space-x-1">
                                  <Tag className="h-3 w-3" />
                                  <span>{guide.tags.join(', ')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(guide)}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                              title="Edit guide"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(guide.id)}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                              title="Delete guide"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {guide.content && (
                          <div className="bg-gray-50 dark:bg-gray-600 rounded p-3">
                            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                              {guide.content}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4">
              <form onSubmit={handleSubmit}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editingGuide ? 'Edit Style Guide' : 'Create New Style Guide'}
                  </h3>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Style guide name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'brand' | 'vertical' | 'writing_style' | 'persona' }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="brand">Brand Guidelines</option>
                      <option value="vertical">Industry Specific</option>
                      <option value="writing_style">Writing Style</option>
                      <option value="persona">Voice & Persona</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description of this style guide"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Content
                    </label>
                    <textarea
                      required
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Detailed style guide content, instructions, examples..."
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Default guide</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <Save className="h-4 w-4" />
                    <span>{editingGuide ? 'Update' : 'Create'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};