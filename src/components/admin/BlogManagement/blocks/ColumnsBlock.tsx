// Columns Block Component

import React, { useState } from 'react';
import { Block } from '../types';

interface ColumnsBlockProps {
  block: Block;
  isSelected: boolean;
  onUpdate: (block: Block) => void;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const COLUMN_LAYOUTS = [
  { value: 2, label: '2 Columns', icon: '▌▌', widths: ['50%', '50%'] },
  { value: 3, label: '3 Columns', icon: '▌▌▌', widths: ['33.33%', '33.33%', '33.33%'] },
  { value: 4, label: '4 Columns', icon: '▌▌▌▌', widths: ['25%', '25%', '25%', '25%'] },
];

export const ColumnsBlock: React.FC<ColumnsBlockProps> = ({
  block,
  isSelected,
  onUpdate,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown
}) => {
  const [localData, setLocalData] = useState({
    columnCount: block.data.columnCount || 2,
    columnContent: block.data.columnContent || [[], []]
  });

  const handleColumnCountChange = (count: number) => {
    // Create new column content array
    const newColumnContent = Array.from({ length: count }, (_, index) => {
      if (index < localData.columnContent.length) {
        return localData.columnContent[index] || [];
      }
      return [];
    });

    const newData = {
      ...localData,
      columnCount: count,
      columnContent: newColumnContent
    };

    setLocalData(newData);
    onUpdate({
      ...block,
      data: { ...block.data, ...newData }
    });
  };

  const addContentToColumn = (columnIndex: number) => {
    const newContent = {
      id: `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'paragraph',
      data: { text: `Content for column ${columnIndex + 1}` },
      settings: {}
    };

    const newColumnContent = [...localData.columnContent];
    newColumnContent[columnIndex] = [...(newColumnContent[columnIndex] || []), newContent];

    const newData = {
      ...localData,
      columnContent: newColumnContent
    };

    setLocalData(newData);
    onUpdate({
      ...block,
      data: { ...block.data, ...newData }
    });
  };

  const removeContentFromColumn = (columnIndex: number, contentIndex: number) => {
    const newColumnContent = [...localData.columnContent];
    newColumnContent[columnIndex] = newColumnContent[columnIndex].filter((_, i) => i !== contentIndex);

    const newData = {
      ...localData,
      columnContent: newColumnContent
    };

    setLocalData(newData);
    onUpdate({
      ...block,
      data: { ...block.data, ...newData }
    });
  };

  const updateColumnContent = (columnIndex: number, contentIndex: number, newText: string) => {
    const newColumnContent = [...localData.columnContent];
    newColumnContent[columnIndex][contentIndex] = {
      ...newColumnContent[columnIndex][contentIndex],
      data: { ...newColumnContent[columnIndex][contentIndex].data, text: newText }
    };

    const newData = {
      ...localData,
      columnContent: newColumnContent
    };

    setLocalData(newData);
    onUpdate({
      ...block,
      data: { ...block.data, ...newData }
    });
  };

  const getCurrentLayout = () => {
    return COLUMN_LAYOUTS.find(layout => layout.value === localData.columnCount) || COLUMN_LAYOUTS[0];
  };

  const renderColumn = (columnIndex: number) => {
    const columnContent = localData.columnContent[columnIndex] || [];
    
    return (
      <div key={columnIndex} className="border border-gray-200 rounded-lg p-4 min-h-[120px] bg-white">
        <div className="text-xs text-gray-500 mb-2 font-medium">
          Column {columnIndex + 1}
        </div>
        
        {columnContent.length === 0 ? (
          <div className="text-gray-400 text-center py-8 border-2 border-dashed border-gray-300 rounded">
            <p className="text-sm">Empty column</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                addContentToColumn(columnIndex);
              }}
              className="mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
            >
              Add Content
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {columnContent.map((content, contentIndex) => (
              <div key={content.id} className="group relative">
                <textarea
                  value={content.data.text || ''}
                  onChange={(e) => updateColumnContent(columnIndex, contentIndex, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full p-2 text-sm border border-gray-300 rounded resize-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter content..."
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeContentFromColumn(columnIndex, contentIndex);
                  }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center"
                  title="Remove content"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={(e) => {
                e.stopPropagation();
                addContentToColumn(columnIndex);
              }}
              className="w-full text-xs bg-gray-100 text-gray-600 py-2 rounded border-2 border-dashed border-gray-300 hover:bg-gray-200"
            >
              + Add Content
            </button>
          </div>
        )}
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
          Columns ({getCurrentLayout().label})
        </span>
        <div className="h-4 w-px bg-gray-300 mx-1"></div>
        
        {/* Column Layout Buttons */}
        <div className="flex gap-1">
          {COLUMN_LAYOUTS.map(layout => (
            <button
              key={layout.value}
              onClick={(e) => {
                e.stopPropagation();
                handleColumnCountChange(layout.value);
              }}
              className={`px-2 py-1 text-xs rounded ${
                localData.columnCount === layout.value
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100'
              }`}
              title={layout.label}
            >
              {layout.icon}
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
      <div className="space-y-4">
        <div className="text-sm text-gray-600 text-center">
          📄 {getCurrentLayout().label} Layout
        </div>
        
        <div 
          className="grid gap-4"
          style={{
            gridTemplateColumns: getCurrentLayout().widths.join(' ')
          }}
        >
          {Array.from({ length: localData.columnCount }, (_, index) => renderColumn(index))}
        </div>
        
        <div className="text-center text-gray-500 text-xs">
          Click in columns to edit content. Use toolbar to change layout.
        </div>
      </div>
    </div>
  );
};