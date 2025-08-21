// Button Block Component

import React, { useState, useRef, useEffect } from 'react';
import { Block } from '../types';

interface ButtonBlockProps {
  block: Block;
  isSelected: boolean;
  onUpdate: (block: Block) => void;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const BUTTON_STYLES = [
  { value: 'primary', label: 'Primary', class: 'bg-blue-600 text-white hover:bg-blue-700' },
  { value: 'secondary', label: 'Secondary', class: 'bg-gray-600 text-white hover:bg-gray-700' },
  { value: 'outline', label: 'Outline', class: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white' },
  { value: 'success', label: 'Success', class: 'bg-green-600 text-white hover:bg-green-700' },
  { value: 'warning', label: 'Warning', class: 'bg-yellow-600 text-white hover:bg-yellow-700' },
  { value: 'danger', label: 'Danger', class: 'bg-red-600 text-white hover:bg-red-700' }
];

export const ButtonBlock: React.FC<ButtonBlockProps> = ({
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
    buttonText: block.data.buttonText || 'Click me',
    buttonUrl: block.data.buttonUrl || '',
    buttonStyle: block.data.buttonStyle || 'primary'
  });
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalData({
      buttonText: block.data.buttonText || 'Click me',
      buttonUrl: block.data.buttonUrl || '',
      buttonStyle: block.data.buttonStyle || 'primary'
    });
  }, [block.data]);

  useEffect(() => {
    if (isEditing && textInputRef.current) {
      textInputRef.current.focus();
      textInputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    onUpdate({
      ...block,
      data: { ...block.data, ...localData }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalData({
      buttonText: block.data.buttonText || 'Click me',
      buttonUrl: block.data.buttonUrl || '',
      buttonStyle: block.data.buttonStyle || 'primary'
    });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleStyleChange = (style: string) => {
    const newData = { ...localData, buttonStyle: style as 'primary' | 'secondary' | 'outline' };
    setLocalData(newData);
    onUpdate({
      ...block,
      data: { ...block.data, ...newData }
    });
  };

  const getButtonClasses = (style: string): string => {
    const styleObj = BUTTON_STYLES.find(s => s.value === style);
    return styleObj?.class || BUTTON_STYLES[0].class;
  };

  const isEmpty = !block.data.buttonText?.trim();

  return (
    <div
      className={`block-container group relative p-4 rounded-lg transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50' 
          : 'hover:ring-1 hover:ring-gray-300 hover:bg-gray-50'
      } ${isEmpty ? 'min-h-[80px] border-2 border-dashed border-gray-300' : ''}`}
      onClick={onSelect}
    >
      {/* Block Toolbar */}
      <div className={`absolute -top-10 left-0 flex items-center gap-1 bg-white rounded shadow-lg border px-2 py-1 transition-opacity ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <span className="text-xs text-gray-500 font-medium">Button</span>
        <div className="h-4 w-px bg-gray-300 mx-1"></div>
        
        {/* Style Selector */}
        <select
          value={localData.buttonStyle}
          onChange={(e) => handleStyleChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="text-xs border-none bg-transparent focus:outline-none"
        >
          {BUTTON_STYLES.map(style => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>
        
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
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Button Text
            </label>
            <input
              ref={textInputRef}
              type="text"
              value={localData.buttonText}
              onChange={(e) => setLocalData(prev => ({ ...prev, buttonText: e.target.value }))}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter button text..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Button URL
            </label>
            <input
              type="url"
              value={localData.buttonUrl}
              onChange={(e) => setLocalData(prev => ({ ...prev, buttonUrl: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com"
            />
          </div>
          
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
            <span className="text-xs text-gray-500">Enter to save, Esc to cancel</span>
          </div>
        </div>
      ) : (
        <div
          onDoubleClick={handleDoubleClick}
          className="cursor-text"
          style={{
            textAlign: block.settings.alignment || 'left'
          }}
        >
          {isEmpty ? (
            <div className="text-gray-400 italic flex items-center justify-center min-h-[60px] border-2 border-dashed border-gray-300 rounded">
              <div className="text-center">
                <div className="text-2xl mb-2">🔘</div>
                <p>Double-click to add button...</p>
              </div>
            </div>
          ) : (
            <div className="inline-block">
              {block.data.buttonUrl ? (
                <a
                  href={block.data.buttonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-block px-6 py-3 rounded-lg font-medium transition-colors ${getButtonClasses(block.data.buttonStyle || 'primary')}`}
                  onClick={(e) => e.preventDefault()} // Prevent navigation in editor
                >
                  {block.data.buttonText}
                </a>
              ) : (
                <button
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${getButtonClasses(block.data.buttonStyle || 'primary')}`}
                  onClick={(e) => e.preventDefault()}
                >
                  {block.data.buttonText}
                </button>
              )}
              {!block.data.buttonUrl && (
                <div className="text-xs text-gray-500 mt-1">
                  No URL set - add one to make this functional
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};