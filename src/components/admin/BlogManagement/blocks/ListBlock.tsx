// List Block Component

import React, { useState, useRef, useEffect } from 'react';
import { Block } from '../types';

interface ListBlockProps {
  block: Block;
  isSelected: boolean;
  onUpdate: (block: Block) => void;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const ListBlock: React.FC<ListBlockProps> = ({
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
  const [localItems, setLocalItems] = useState(block.data.items || ['']);
  const [localOrdered, setLocalOrdered] = useState(block.data.ordered || false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setLocalItems(block.data.items || ['']);
    setLocalOrdered(block.data.ordered || false);
  }, [block.data.items, block.data.ordered]);

  const handleSave = () => {
    // Filter out empty items
    const cleanItems = localItems.filter(item => item.trim());
    onUpdate({
      ...block,
      data: { 
        ...block.data, 
        items: cleanItems.length > 0 ? cleanItems : [''], 
        ordered: localOrdered 
      }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalItems(block.data.items || ['']);
    setLocalOrdered(block.data.ordered || false);
    setIsEditing(false);
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...localItems];
    newItems[index] = value;
    setLocalItems(newItems);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Add new item
      const newItems = [...localItems];
      newItems.splice(index + 1, 0, '');
      setLocalItems(newItems);
      
      // Focus next input after a short delay
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 0);
    } else if (e.key === 'Backspace' && localItems[index] === '' && localItems.length > 1) {
      e.preventDefault();
      // Remove empty item and focus previous
      const newItems = localItems.filter((_, i) => i !== index);
      setLocalItems(newItems);
      
      setTimeout(() => {
        const prevIndex = Math.max(0, index - 1);
        inputRefs.current[prevIndex]?.focus();
      }, 0);
    } else if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  };

  const handleAddItem = () => {
    setLocalItems([...localItems, '']);
  };

  const handleRemoveItem = (index: number) => {
    if (localItems.length > 1) {
      const newItems = localItems.filter((_, i) => i !== index);
      setLocalItems(newItems);
    }
  };

  const toggleListType = () => {
    setLocalOrdered(!localOrdered);
    // Auto-save the list type change
    onUpdate({
      ...block,
      data: { ...block.data, ordered: !localOrdered }
    });
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const hasItems = block.data.items && block.data.items.some(item => item.trim());
  const isOrdered = block.data.ordered;

  return (
    <div
      className={`block-container group relative p-4 rounded-lg transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50' 
          : 'hover:ring-1 hover:ring-gray-300 hover:bg-gray-50'
      } ${!hasItems ? 'min-h-[80px] border-2 border-dashed border-gray-300' : ''}`}
      onClick={onSelect}
    >
      {/* Block Toolbar */}
      <div className={`absolute -top-10 left-0 flex items-center gap-1 bg-white rounded shadow-lg border px-2 py-1 transition-opacity ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <span className="text-xs text-gray-500 font-medium">
          {isOrdered ? 'Numbered List' : 'Bulleted List'}
        </span>
        <div className="h-4 w-px bg-gray-300 mx-1"></div>
        
        <button
          onClick={(e) => { e.stopPropagation(); toggleListType(); }}
          className={`px-2 py-1 text-xs rounded ${
            isOrdered ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
          }`}
          title="Toggle list type"
        >
          {isOrdered ? '1.' : '•'}
        </button>
        
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
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localOrdered}
                onChange={(e) => setLocalOrdered(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Numbered list</span>
            </label>
          </div>
          
          <div className="space-y-2">
            {localItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-gray-400 text-sm min-w-[20px]">
                  {localOrdered ? `${index + 1}.` : '•'}
                </span>
                <input
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  value={item}
                  onChange={(e) => handleItemChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="List item..."
                />
                {localItems.length > 1 && (
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="p-1 text-red-500 hover:bg-red-100 rounded"
                    title="Remove item"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <button
            onClick={handleAddItem}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            + Add item
          </button>
          
          <div className="flex items-center gap-2 pt-2">
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
              Enter for new item, Ctrl+Enter to save, Esc to cancel
            </span>
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
          {!hasItems ? (
            <div className="flex items-center justify-center py-4 text-gray-400">
              <div className="text-center">
                <div className="text-2xl mb-2">{isOrdered ? '📝' : '📋'}</div>
                <p>Double-click to add list items...</p>
              </div>
            </div>
          ) : (
            <div className={`${isOrdered ? 'list-decimal' : 'list-disc'} ml-6 space-y-1`}>
              {(block.data.items || []).map((item, index) => (
                <li key={index} className="text-gray-900">
                  {item || <span className="text-gray-400 italic">Empty item</span>}
                </li>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};