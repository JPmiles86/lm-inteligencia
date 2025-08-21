// Paragraph Block Component

import React, { useState, useRef, useEffect } from 'react';
import { Block } from '../types';

interface ParagraphBlockProps {
  block: Block;
  isSelected: boolean;
  onUpdate: (block: Block) => void;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalText(block.data.text || '');
  }, [block.data.text]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(localText.length, localText.length);
    }
  }, [isEditing, localText.length]);

  const handleSave = () => {
    onUpdate({
      ...block,
      data: { ...block.data, text: localText }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalText(block.data.text || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const isEmpty = !block.data.text?.trim();

  return (
    <div
      ref={divRef}
      className={`block-container group relative p-4 rounded-lg transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50' 
          : 'hover:ring-1 hover:ring-gray-300 hover:bg-gray-50'
      } ${isEmpty ? 'min-h-[60px] border-2 border-dashed border-gray-300' : ''}`}
      onClick={onSelect}
    >
      {/* Block Toolbar */}
      <div className={`absolute -top-10 left-0 flex items-center gap-1 bg-white rounded shadow-lg border px-2 py-1 transition-opacity ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <span className="text-xs text-gray-500 font-medium">Paragraph</span>
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
          <textarea
            ref={textareaRef}
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-3 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={Math.max(3, localText.split('\n').length)}
            placeholder="Write your paragraph here..."
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
            <span className="text-xs text-gray-500">Ctrl+Enter to save, Esc to cancel</span>
          </div>
        </div>
      ) : (
        <div
          onDoubleClick={handleDoubleClick}
          className={`prose prose-lg max-w-none cursor-text ${
            isEmpty ? 'text-gray-400' : ''
          }`}
          style={{
            textAlign: block.settings.alignment || 'left',
            color: block.settings.textColor || undefined,
            fontSize: getFontSize(block.settings.fontSize || 'normal')
          }}
        >
          {isEmpty ? (
            <p className="italic">Double-click to add paragraph text...</p>
          ) : (
            <div dangerouslySetInnerHTML={{ 
              __html: (block.data.text || '').replace(/\n/g, '<br>') 
            }} />
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to get font size
const getFontSize = (size: string): string => {
  switch (size) {
    case 'small':
      return '0.875rem';
    case 'large':
      return '1.25rem';
    case 'huge':
      return '1.5rem';
    default:
      return '1rem';
  }
};