// Gallery Block Component

import React, { useState, useRef } from 'react';
import { Block } from '../types';

interface GalleryBlockProps {
  block: Block;
  isSelected: boolean;
  onUpdate: (block: Block) => void;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

interface GalleryImage {
  url: string;
  alt: string;
  caption?: string;
}

const LAYOUT_OPTIONS = [
  { value: 'grid', label: 'Grid', icon: '⚏' },
  { value: 'carousel', label: 'Carousel', icon: '⚭' },
  { value: 'masonry', label: 'Masonry', icon: '⚏' }
];

const COLUMN_OPTIONS = [
  { value: 2, label: '2 Columns' },
  { value: 3, label: '3 Columns' },
  { value: 4, label: '4 Columns' }
];

export const GalleryBlock: React.FC<GalleryBlockProps> = ({
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
    images: block.data.images || [] as GalleryImage[],
    layout: block.data.layout || 'grid',
    columns: block.data.columns || 3
  });
  const [editingImage, setEditingImage] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onUpdate({
      ...block,
      data: { ...block.data, ...localData }
    });
    setIsEditing(false);
    setEditingImage(null);
  };

  const handleCancel = () => {
    setLocalData({
      images: block.data.images || [],
      layout: block.data.layout || 'grid',
      columns: block.data.columns || 3
    });
    setIsEditing(false);
    setEditingImage(null);
  };

  const handleLayoutChange = (layout: string) => {
    const newData = { ...localData, layout };
    setLocalData(newData);
    onUpdate({
      ...block,
      data: { ...block.data, ...newData }
    });
  };

  const handleColumnsChange = (columns: number) => {
    const newData = { ...localData, columns };
    setLocalData(newData);
    onUpdate({
      ...block,
      data: { ...block.data, ...newData }
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage: GalleryImage = {
            url: e.target?.result as string,
            alt: file.name.replace(/\.[^/.]+$/, ''),
            caption: ''
          };
          setLocalData(prev => ({
            ...prev,
            images: [...prev.images, newImage]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const addImageFromUrl = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      const newImage: GalleryImage = {
        url,
        alt: 'Gallery image',
        caption: ''
      };
      setLocalData(prev => ({
        ...prev,
        images: [...prev.images, newImage]
      }));
    }
  };

  const removeImage = (index: number) => {
    setLocalData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const updateImage = (index: number, updates: Partial<GalleryImage>) => {
    setLocalData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, ...updates } : img
      )
    }));
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const renderGallery = () => {
    if (localData.images.length === 0) {
      return (
        <div className="text-gray-400 italic flex items-center justify-center min-h-[120px] border-2 border-dashed border-gray-300 rounded">
          <div className="text-center">
            <div className="text-4xl mb-2">🖼️</div>
            <p>Double-click to add images...</p>
          </div>
        </div>
      );
    }

    const getGridClasses = () => {
      switch (localData.layout) {
        case 'grid':
          return `grid grid-cols-${localData.columns} gap-4`;
        case 'carousel':
          return 'flex overflow-x-auto gap-4 pb-2';
        case 'masonry':
          return `columns-${localData.columns} gap-4`;
        default:
          return `grid grid-cols-${localData.columns} gap-4`;
      }
    };

    return (
      <div className={getGridClasses()}>
        {localData.images.map((image, index) => (
          <div 
            key={index}
            className={`relative group ${
              localData.layout === 'carousel' ? 'flex-shrink-0 w-64' : 
              localData.layout === 'masonry' ? 'break-inside-avoid mb-4' : ''
            }`}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-auto rounded-lg object-cover"
              style={{
                maxHeight: localData.layout === 'carousel' ? '200px' : 'none'
              }}
            />
            
            {isEditing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingImage(index);
                    }}
                    className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
            
            {image.caption && (
              <p className="text-sm text-gray-600 mt-2 text-center italic">
                {image.caption}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`block-container group relative p-4 rounded-lg transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50' 
          : 'hover:ring-1 hover:ring-gray-300 hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      {/* Block Toolbar */}
      <div className={`absolute -top-10 left-0 flex items-center gap-1 bg-white rounded shadow-lg border px-2 py-1 transition-opacity ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <span className="text-xs text-gray-500 font-medium">
          Gallery ({localData.images.length} images)
        </span>
        <div className="h-4 w-px bg-gray-300 mx-1"></div>
        
        {/* Layout Selector */}
        <select
          value={localData.layout}
          onChange={(e) => handleLayoutChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="text-xs border-none bg-transparent focus:outline-none"
        >
          {LAYOUT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {(localData.layout === 'grid' || localData.layout === 'masonry') && (
          <>
            <div className="h-4 w-px bg-gray-300 mx-1"></div>
            <select
              value={localData.columns}
              onChange={(e) => handleColumnsChange(Number(e.target.value))}
              onClick={(e) => e.stopPropagation()}
              className="text-xs border-none bg-transparent focus:outline-none"
            >
              {COLUMN_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </>
        )}
        
        <div className="h-4 w-px bg-gray-300 mx-1"></div>
        
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

      {/* Block Content */}
      <div onDoubleClick={handleDoubleClick} className="cursor-pointer">
        {renderGallery()}

        {isEditing && (
          <div className="mt-4 space-y-4">
            {/* Add Images */}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Upload Images
              </button>
              <button
                onClick={addImageFromUrl}
                className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                Add from URL
              </button>
            </div>

            {/* Actions */}
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
              <span className="text-xs text-gray-500">
                Double-click to exit editing
              </span>
            </div>
          </div>
        )}

        {!isEditing && localData.images.length > 0 && (
          <div className="text-center text-gray-500 text-sm mt-2">
            Double-click to edit gallery
          </div>
        )}
      </div>

      {/* Image Edit Modal */}
      {editingImage !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Edit Image</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={localData.images[editingImage]?.alt || ''}
                  onChange={(e) => updateImage(editingImage, { alt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the image..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caption (optional)
                </label>
                <input
                  type="text"
                  value={localData.images[editingImage]?.caption || ''}
                  onChange={(e) => updateImage(editingImage, { caption: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Image caption..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingImage(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};