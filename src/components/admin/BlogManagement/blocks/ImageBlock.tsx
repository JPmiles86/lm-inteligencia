// Image Block Component

import React, { useState, useRef, useCallback } from 'react';
import { Block } from '../types';

interface ImageBlockProps {
  block: Block;
  isSelected: boolean;
  onUpdate: (block: Block) => void;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({
  block,
  isSelected,
  onUpdate,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localData, setLocalData] = useState({
    url: block.data.url || '',
    alt: block.data.alt || '',
    caption: block.data.caption || ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasImage = !!block.data.url;

  const handleSave = () => {
    onUpdate({
      ...block,
      data: { ...block.data, ...localData }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalData({
      url: block.data.url || '',
      alt: block.data.alt || '',
      caption: block.data.caption || ''
    });
    setIsEditing(false);
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Convert to base64 for localStorage compatibility
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setLocalData(prev => ({
          ...prev,
          url: result,
          alt: prev.alt || file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div
      className={`block-container group relative p-4 rounded-lg transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50' 
          : 'hover:ring-1 hover:ring-gray-300 hover:bg-gray-50'
      } ${!hasImage ? 'min-h-[200px] border-2 border-dashed border-gray-300' : ''}`}
      onClick={onSelect}
    >
      {/* Block Toolbar */}
      <div className={`absolute -top-10 left-0 flex items-center gap-1 bg-white rounded shadow-lg border px-2 py-1 transition-opacity z-10 ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <span className="text-xs text-gray-500 font-medium">Image</span>
        <div className="h-4 w-px bg-gray-300 mx-1"></div>
        <button
          onClick={(e) => { e.stopPropagation(); handleEdit(); }}
          className="p-1 hover:bg-gray-100 rounded text-xs"
          title="Edit image"
        >
          ✏️
        </button>
        {onMoveUp && (
          <button
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            className="p-1 hover:bg-gray-100 rounded text-xs"
            title="Move up"
          >
            ↑
          </button>
        )}
        {onMoveDown && (
          <button
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            className="p-1 hover:bg-gray-100 rounded text-xs"
            title="Move down"
          >
            ↓
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          className="p-1 hover:bg-gray-100 rounded text-xs"
          title="Duplicate"
        >
          ⧉
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 hover:bg-red-100 rounded text-xs text-red-600"
          title="Delete"
        >
          🗑
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Block Content */}
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image
            </label>
            <div className="space-y-2">
              <input
                type="url"
                value={localData.url}
                onChange={(e) => setLocalData(prev => ({ ...prev, url: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter image URL or upload file..."
              />
              <button
                onClick={handleUploadClick}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded hover:border-blue-500 text-gray-600 hover:text-blue-600 transition-colors"
              >
                📁 Upload Image File
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alt Text
            </label>
            <input
              type="text"
              value={localData.alt}
              onChange={(e) => setLocalData(prev => ({ ...prev, alt: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the image for accessibility..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caption (optional)
            </label>
            <input
              type="text"
              value={localData.caption}
              onChange={(e) => setLocalData(prev => ({ ...prev, caption: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add a caption..."
            />
          </div>

          {localData.url && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <img
                src={localData.url}
                alt={localData.alt}
                className="max-w-full h-auto rounded border"
                style={{ maxHeight: '300px' }}
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          className="cursor-pointer"
          style={{
            textAlign: block.settings.alignment || 'left'
          }}
        >
          {!hasImage ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="text-4xl mb-4">🖼️</div>
              <p className="text-lg font-medium mb-2">Add an Image</p>
              <p className="text-sm">Click to upload or add an image URL</p>
            </div>
          ) : (
            <figure className="space-y-2">
              <img
                src={block.data.url}
                alt={block.data.alt || ''}
                className="max-w-full h-auto rounded shadow-sm"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="%23f3f4f6"/><text x="200" y="100" font-family="Arial" font-size="16" text-anchor="middle" fill="%23374151">Image not found</text></svg>';
                }}
              />
              {block.data.caption && (
                <figcaption className="text-sm text-gray-600 italic text-center">
                  {block.data.caption}
                </figcaption>
              )}
            </figure>
          )}
        </div>
      )}
    </div>
  );
};