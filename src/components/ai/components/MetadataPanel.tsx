// Metadata Panel - Display and edit metadata for generation nodes
// Shows generation details, SEO data, and content analytics

import React, { useState } from 'react';
import { useAIStore, GenerationNode } from '../../../store/aiStore';
import { 
  Info, 
  Tag, 
  Clock, 
  DollarSign, 
  Hash, 
  BarChart3,
  Eye,
  Target,
  FileText,
  Image,
  Share2,
  Edit,
  Save,
  X,
  TrendingUp,
  Users,
  Globe,
  Zap,
  Layers,
} from 'lucide-react';

interface MetadataPanelProps {
  node: GenerationNode | null;
}

export const MetadataPanel: React.FC<MetadataPanelProps> = ({ node }) => {
  const { updateGenerationNode, addNotification } = useAIStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedMetadata, setEditedMetadata] = useState<any>({});

  // Handle metadata editing
  const startEditing = () => {
    setIsEditing(true);
    setEditedMetadata(node?.structuredContent?.metadata || {});
  };

  const saveChanges = () => {
    if (node) {
      updateGenerationNode(node.id, {
        structuredContent: {
          ...node.structuredContent,
          metadata: editedMetadata,
        },
      });
      
      addNotification({
        type: 'success',
        title: 'Metadata Updated',
        message: 'Node metadata saved successfully',
        duration: 3000,
      });
    }
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedMetadata({});
  };

  // Calculate content statistics
  const getContentStats = (content: string) => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    const words = text.split(/\s+/).filter(word => word.length > 0).length;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    const readingTime = Math.ceil(words / 200);
    
    return {
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingTime,
    };
  };

  if (!node) {
    return (
      <div className="h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <Info className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No Selection</p>
            <p className="text-sm">
              Select a generation node to view its metadata and analytics
            </p>
          </div>
        </div>
      </div>
    );
  }

  const contentStats = node.content ? getContentStats(node.content) : null;
  const imagePrompts = node.structuredContent?.imagePrompts || [];

  return (
    <div className="h-full bg-white dark:bg-gray-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Info className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            Node Details
          </h3>
        </div>
        
        <div className="flex items-center space-x-1">
          {isEditing ? (
            <>
              <button
                onClick={saveChanges}
                className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 rounded"
                title="Save changes"
              >
                <Save className="h-4 w-4" />
              </button>
              <button
                onClick={cancelEditing}
                className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                title="Cancel editing"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              onClick={startEditing}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Edit metadata"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Information */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-1">
            <FileText className="h-4 w-4" />
            <span>Basic Info</span>
          </h4>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Type
                </label>
                <span className="capitalize px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-xs">
                  {node.type}
                </span>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Status
                </label>
                <span className={`capitalize px-2 py-1 rounded text-xs ${
                  node.status === 'completed' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200' :
                  node.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' :
                  node.status === 'failed' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  {node.status}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Created
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {new Date(node.createdAt).toLocaleString()}
              </p>
            </div>
            
            {node.completedAt && (
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Completed
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(node.completedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Generation Details */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-1">
            <Zap className="h-4 w-4" />
            <span>Generation</span>
          </h4>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Provider
                </label>
                <span className="capitalize px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded text-xs">
                  {node.provider}
                </span>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Model
                </label>
                <p className="text-sm text-gray-900 dark:text-white truncate">
                  {node.model}
                </p>
              </div>
            </div>
            
            {node.vertical && (
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Vertical
                </label>
                <span className="capitalize px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded text-xs">
                  {node.vertical}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Usage & Cost */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-1">
            <BarChart3 className="h-4 w-4" />
            <span>Usage</span>
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <Hash className="h-5 w-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
              <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {(node.tokensInput + node.tokensOutput).toLocaleString()}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Tokens Used
              </p>
            </div>
            
            <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
              <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                ${node.cost.toFixed(4)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Cost
              </p>
            </div>
          </div>
          
          {node.durationMs && (
            <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span>Generated in {(node.durationMs / 1000).toFixed(1)}s</span>
            </div>
          )}
        </div>

        {/* Content Statistics */}
        {contentStats && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-1">
              <TrendingUp className="h-4 w-4" />
              <span>Content Stats</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Words:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {contentStats.words.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Characters:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {contentStats.characters.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Sentences:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {contentStats.sentences}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Paragraphs:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {contentStats.paragraphs}
                </span>
              </div>
            </div>
            
            <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded flex items-center space-x-2">
              <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ~{contentStats.readingTime} min read time
              </span>
            </div>
          </div>
        )}

        {/* Image Prompts */}
        {imagePrompts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-1">
              <Image className="h-4 w-4" />
              <span>Image Prompts ({imagePrompts.length})</span>
            </h4>
            
            <div className="space-y-2">
              {imagePrompts.map((prompt, index) => (
                <div key={prompt.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Prompt {index + 1} • {prompt.type}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      prompt.generated 
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                        : 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200'
                    }`}>
                      {prompt.generated ? 'Generated' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {prompt.originalText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Structured Content Metadata */}
        {node.structuredContent && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-1">
              <Layers className="h-4 w-4" />
              <span>Structured Data</span>
            </h4>
            
            <div className="space-y-3">
              {node.structuredContent.title && (
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Title
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {node.structuredContent.title}
                  </p>
                </div>
              )}
              
              {node.structuredContent.synopsis && (
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Synopsis
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {node.structuredContent.synopsis}
                  </p>
                </div>
              )}
              
              {node.structuredContent.tags && node.structuredContent.tags.length > 0 && (
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {node.structuredContent.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Custom Metadata (Editable) */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-1">
            <Tag className="h-4 w-4" />
            <span>Custom Metadata</span>
          </h4>
          
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={editedMetadata.seoTitle || ''}
                  onChange={(e) => setEditedMetadata({
                    ...editedMetadata,
                    seoTitle: e.target.value,
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="SEO optimized title"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Meta Description
                </label>
                <textarea
                  value={editedMetadata.metaDescription || ''}
                  onChange={(e) => setEditedMetadata({
                    ...editedMetadata,
                    metaDescription: e.target.value,
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  rows={2}
                  placeholder="Meta description for search engines"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Keywords
                </label>
                <input
                  type="text"
                  value={editedMetadata.keywords || ''}
                  onChange={(e) => setEditedMetadata({
                    ...editedMetadata,
                    keywords: e.target.value,
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Comma-separated keywords"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {node.structuredContent?.metadata?.seoTitle ? (
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    SEO Title
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {String(node.structuredContent.metadata.seoTitle)}
                  </p>
                </div>
              ) : null}
              
              {node.structuredContent?.metadata?.metaDescription ? (
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Meta Description
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {String(node.structuredContent.metadata.metaDescription)}
                  </p>
                </div>
              ) : null}
              
              {node.structuredContent?.metadata?.keywords ? (
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Keywords
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {String(node.structuredContent.metadata.keywords)}
                  </p>
                </div>
              ) : null}
              
              {(!node.structuredContent?.metadata?.seoTitle && 
                !node.structuredContent?.metadata?.metaDescription && 
                !node.structuredContent?.metadata?.keywords) && (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No custom metadata set. Click edit to add SEO data.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};