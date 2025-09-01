import React, { useState } from 'react';
import { Image, Edit2, RefreshCw, Check, X, Sparkles } from 'lucide-react';
import { ImagePrompt } from '@/services/ai/ImagePromptExtractor';
import { promptEnhancer } from '@/services/ai/PromptEnhancer';

interface ImagePromptCardProps {
  prompt: ImagePrompt;
  onGenerate: (prompt: ImagePrompt) => Promise<void>;
  onUpdate: (prompt: ImagePrompt) => void;
  onDelete: (promptId: string) => void;
  imageUrl?: string;
  loading?: boolean;
}

export const ImagePromptCard: React.FC<ImagePromptCardProps> = ({
  prompt,
  onGenerate,
  onUpdate,
  onDelete,
  imageUrl,
  loading = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(prompt.enhancedPrompt || prompt.originalPrompt);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  const handleEnhance = async () => {
    setIsEnhancing(true);
    try {
      const enhanced = promptEnhancer.enhancePrompt(editedPrompt, {
        style: prompt.suggestedStyle,
        quality: prompt.metadata?.importance === 'primary' ? 'ultra' : 'high'
      });
      
      setEditedPrompt(enhanced);
      onUpdate({
        ...prompt,
        enhancedPrompt: enhanced
      });
    } finally {
      setIsEnhancing(false);
    }
  };
  
  const handleSave = () => {
    onUpdate({
      ...prompt,
      enhancedPrompt: editedPrompt
    });
    setIsEditing(false);
  };
  
  const handleGenerate = async () => {
    await onGenerate({
      ...prompt,
      enhancedPrompt: editedPrompt
    });
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Image className="h-5 w-5 text-blue-500" />
          <span className="text-sm font-medium">
            Image {prompt.metadata?.importance === 'primary' ? '(Hero)' : `#${prompt.id.split('_')[2]}`}
          </span>
        </div>
        <button
          onClick={() => onDelete(prompt.id)}
          className="text-gray-400 hover:text-red-500 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* Image Preview or Placeholder */}
      <div className="mb-3">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Generated"
            className="w-full h-48 object-cover rounded-md"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
            {loading ? (
              <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
            ) : (
              <Image className="h-8 w-8 text-gray-400" />
            )}
          </div>
        )}
      </div>
      
      {/* Prompt Text */}
      <div className="mb-3">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              className="w-full p-2 border rounded-md resize-none"
              rows={3}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleEnhance}
                disabled={isEnhancing}
                className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>Enhance</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
                <span>Save</span>
              </button>
              <button
                onClick={() => {
                  setEditedPrompt(prompt.enhancedPrompt || prompt.originalPrompt);
                  setIsEditing(false);
                }}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded-md text-sm hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {prompt.enhancedPrompt || prompt.originalPrompt}
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
            >
              <Edit2 className="h-4 w-4" />
              <span>Edit Prompt</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Metadata */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
          {prompt.suggestedSize}
        </span>
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
          {prompt.suggestedStyle}
        </span>
        {prompt.metadata?.sectionTitle && (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
            {prompt.metadata.sectionTitle}
          </span>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Image className="h-4 w-4" />
              <span>{imageUrl ? 'Regenerate' : 'Generate'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};