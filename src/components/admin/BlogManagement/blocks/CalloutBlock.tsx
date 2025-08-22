// Callout Block Component

import React, { useState, useRef, useEffect } from 'react';
import { Block } from '../types';

interface CalloutBlockProps {
  block: Block;
  isSelected: boolean;
  onUpdate: (block: Block) => void;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const CalloutBlock: React.FC<CalloutBlockProps> = ({
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
  const [localTitle, setLocalTitle] = useState(block.data.title || '');
  const [localText, setLocalText] = useState(block.data.text || '');
  const [localType, setLocalType] = useState(block.data.calloutType || 'info');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const textTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalTitle(block.data.title || '');
    setLocalText(block.data.text || '');
    setLocalType(block.data.calloutType || 'info');
  }, [block.data.title, block.data.text, block.data.calloutType]);

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onUpdate({
      ...block,
      data: { 
        ...block.data, 
        title: localTitle,
        text: localText,
        calloutType: localType as 'info' | 'warning' | 'error' | 'success'
      }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalTitle(block.data.title || '');
    setLocalText(block.data.text || '');
    setLocalType(block.data.calloutType || 'info');
    setIsEditing(false);
  };

  const handleTypeChange = (newType: 'info' | 'warning' | 'error' | 'success') => {
    setLocalType(newType);
    // Auto-save type change
    onUpdate({
      ...block,
      data: { 
        ...block.data, 
        calloutType: newType
      }
    });
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

  const isEmpty = !block.data.title?.trim() && !block.data.text?.trim();

  const getCalloutConfig = (type: string) => {
    switch (type) {
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          icon: '⚠️',
          name: 'Warning'
        };
      case 'error':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          icon: '❌',
          name: 'Error'
        };
      case 'success':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          icon: '✅',
          name: 'Success'
        };
      default: // info
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          icon: 'ℹ️',
          name: 'Info'
        };
    }
  };

  const config = getCalloutConfig(block.data.calloutType || 'info');

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
        <span className="text-xs text-gray-500 font-medium">Callout - {config.name}</span>
        <div className="h-4 w-px bg-gray-300 mx-1"></div>
        
        {/* Type Selector */}
        <div className="flex items-center gap-1">
          {['info', 'warning', 'error', 'success'].map(type => {
            const typeConfig = getCalloutConfig(type);
            return (
              <button
                key={type}
                onClick={(e) => { e.stopPropagation(); handleTypeChange(type as 'info' | 'warning' | 'error' | 'success'); }}
                className={`px-2 py-1 text-xs rounded ${
                  (block.data.calloutType || 'info') === type
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100'
                }`}
                title={typeConfig.name}
              >
                {typeConfig.icon}
              </button>
            );
          })}
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
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <label className="text-sm font-medium text-gray-700">Type:</label>
            <select
              value={localType}
              onChange={(e) => setLocalType(e.target.value as 'info' | 'warning' | 'error' | 'success')}
              className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="success">Success</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (optional)
            </label>
            <input
              ref={titleInputRef}
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Callout title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              ref={textTextareaRef}
              value={localText}
              onChange={(e) => setLocalText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-3 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={Math.max(3, localText.split('\n').length)}
              placeholder="Enter your callout content here..."
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
            textAlign: block.settings.alignment || 'left'
          }}
        >
          {isEmpty ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">⚠️</div>
                <p className="text-lg font-medium mb-1">Add a Callout</p>
                <p className="text-sm">Double-click to add attention-grabbing content</p>
              </div>
            </div>
          ) : (
            <div className={`callout ${config.bgColor} ${config.borderColor} ${config.textColor} border rounded-lg p-4`}>
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">{config.icon}</span>
                <div className="flex-1">
                  {block.data.title && (
                    <h4 className="font-semibold mb-2 text-lg">
                      {block.data.title}
                    </h4>
                  )}
                  {block.data.text && (
                    <div className="leading-relaxed">
                      {block.data.text.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          {index < (block.data.text?.split('\n').length || 0) - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};