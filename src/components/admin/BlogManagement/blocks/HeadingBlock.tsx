// Heading Block Component

import React, { useState, useRef, useEffect } from 'react';
import { Block } from '../types';

interface HeadingBlockProps {
  block: Block;
  isSelected: boolean;
  onUpdate: (block: Block) => void;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({
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
  const [localText, setLocalText] = useState(block.data.text || '');
  const [localLevel, setLocalLevel] = useState(block.data.level || 2);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalText(block.data.text || '');
    setLocalLevel(block.data.level || 2);
  }, [block.data.text, block.data.level]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(localText.length, localText.length);
    }
  }, [isEditing, localText.length]);

  const handleSave = () => {
    onUpdate({
      ...block,
      data: { ...block.data, text: localText, level: localLevel }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalText(block.data.text || '');
    setLocalLevel(block.data.level || 2);
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

  const handleLevelChange = (level: number) => {
    setLocalLevel(level as 1 | 2 | 3 | 4 | 5 | 6);
    // Auto-save level change
    onUpdate({
      ...block,
      data: { ...block.data, level: level as 1 | 2 | 3 | 4 | 5 | 6 }
    });
  };

  const isEmpty = !block.data.text?.trim();
  const currentLevel = block.data.level || 2;

  const getHeadingSize = (level: number): string => {
    switch (level) {
      case 1: return 'text-4xl';
      case 2: return 'text-3xl';
      case 3: return 'text-2xl';
      case 4: return 'text-xl';
      case 5: return 'text-lg';
      case 6: return 'text-base';
      default: return 'text-2xl';
    }
  };

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
        <span className="text-xs text-gray-500 font-medium">Heading H{currentLevel}</span>
        <div className="h-4 w-px bg-gray-300 mx-1"></div>
        
        {/* Level Selector */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5, 6].map(level => (
            <button
              key={level}
              onClick={(e) => { e.stopPropagation(); handleLevelChange(level); }}
              className={`px-2 py-1 text-xs rounded ${
                currentLevel === level
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100'
              }`}
              title={`Heading ${level}`}
            >
              H{level}
            </button>
          ))}
        </div>
        
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
        <div className="space-y-2">
          <input
            ref={inputRef}
            type="text"
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold ${getHeadingSize(localLevel)}`}
            placeholder="Enter heading text..."
          />
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
            textAlign: block.settings.alignment || 'left',
            color: block.settings.textColor || undefined
          }}
        >
          {isEmpty ? (
            <div className={`font-bold ${getHeadingSize(currentLevel)} text-gray-400 italic`}>
              Double-click to add heading...
            </div>
          ) : (
            <div className={`font-bold ${getHeadingSize(currentLevel)} mb-2`}>
              {block.data.text}
            </div>
          )}
        </div>
      )}
    </div>
  );
};