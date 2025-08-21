// Quote Block Component

import React, { useState, useRef, useEffect } from 'react';
import { Block } from '../types';

interface QuoteBlockProps {
  block: Block;
  isSelected: boolean;
  onUpdate: (block: Block) => void;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const QuoteBlock: React.FC<QuoteBlockProps> = ({
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
  const [localQuote, setLocalQuote] = useState(block.data.quote || '');
  const [localCite, setLocalCite] = useState(block.data.cite || '');
  const quoteTextareaRef = useRef<HTMLTextAreaElement>(null);
  const citeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalQuote(block.data.quote || '');
    setLocalCite(block.data.cite || '');
  }, [block.data.quote, block.data.cite]);

  useEffect(() => {
    if (isEditing && quoteTextareaRef.current) {
      quoteTextareaRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onUpdate({
      ...block,
      data: { 
        ...block.data, 
        quote: localQuote,
        cite: localCite
      }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalQuote(block.data.quote || '');
    setLocalCite(block.data.cite || '');
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

  const isEmpty = !block.data.quote?.trim();

  return (
    <div
      className={`block-container group relative p-4 rounded-lg transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50' 
          : 'hover:ring-1 hover:ring-gray-300 hover:bg-gray-50'
      } ${isEmpty ? 'min-h-[100px] border-2 border-dashed border-gray-300' : ''}`}
      onClick={onSelect}
    >
      {/* Block Toolbar */}
      <div className={`absolute -top-10 left-0 flex items-center gap-1 bg-white rounded shadow-lg border px-2 py-1 transition-opacity ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <span className="text-xs text-gray-500 font-medium">Quote</span>
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
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quote Text *
            </label>
            <textarea
              ref={quoteTextareaRef}
              value={localQuote}
              onChange={(e) => setLocalQuote(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-3 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={Math.max(3, localQuote.split('\n').length)}
              placeholder="Enter your quote text here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Citation (optional)
            </label>
            <input
              ref={citeInputRef}
              type="text"
              value={localCite}
              onChange={(e) => setLocalCite(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Author name, source, etc..."
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
            <span className="text-xs text-gray-500">Ctrl+Enter to save, Esc to cancel</span>
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
            <div className="flex items-center justify-center py-8 text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">💬</div>
                <p className="text-lg font-medium mb-1">Add a Quote</p>
                <p className="text-sm">Double-click to add inspirational text</p>
              </div>
            </div>
          ) : (
            <blockquote className="border-l-4 border-blue-500 pl-6 py-2 bg-gray-50 rounded-r">
              <div className="relative">
                <div className="text-2xl text-blue-500 absolute -top-2 -left-2">"</div>
                <p className="text-lg italic text-gray-700 leading-relaxed mb-3">
                  {block.data.quote?.split('\n').map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      {index < (block.data.quote?.split('\n').length || 0) - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
                {block.data.cite && (
                  <footer className="text-sm text-gray-600">
                    <cite>— {block.data.cite}</cite>
                  </footer>
                )}
              </div>
            </blockquote>
          )}
        </div>
      )}
    </div>
  );
};