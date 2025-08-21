// Spacer Block Component

import React, { useState } from 'react';
import { Block } from '../types';

interface SpacerBlockProps {
  block: Block;
  isSelected: boolean;
  onUpdate: (block: Block) => void;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const SPACER_SIZES = [
  { value: 'small', label: 'Small', height: 32 },
  { value: 'medium', label: 'Medium', height: 64 },
  { value: 'large', label: 'Large', height: 96 },
  { value: 'xlarge', label: 'Extra Large', height: 128 }
];

const DIVIDER_STYLES = [
  { value: 'none', label: 'No Line' },
  { value: 'solid', label: 'Solid Line' },
  { value: 'dashed', label: 'Dashed Line' },
  { value: 'dotted', label: 'Dotted Line' },
  { value: 'stars', label: '⭐ ⭐ ⭐' },
  { value: 'dots', label: '• • •' }
];

export const SpacerBlock: React.FC<SpacerBlockProps> = ({
  block,
  isSelected,
  onUpdate,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown
}) => {
  const [spacerSize, setSpacerSize] = useState(block.data.spacerSize || 'medium');
  const [dividerStyle, setDividerStyle] = useState(block.data.dividerStyle || 'none');

  const handleSizeChange = (size: string) => {
    setSpacerSize(size);
    onUpdate({
      ...block,
      data: { ...block.data, spacerSize: size }
    });
  };

  const handleStyleChange = (style: string) => {
    setDividerStyle(style);
    onUpdate({
      ...block,
      data: { ...block.data, dividerStyle: style }
    });
  };

  const getCurrentHeight = () => {
    const sizeObj = SPACER_SIZES.find(s => s.value === spacerSize);
    return sizeObj?.height || 64;
  };

  const renderDivider = () => {
    const style = dividerStyle || 'none';
    
    switch (style) {
      case 'solid':
        return <hr className="border-gray-300 border-t-2" />;
      case 'dashed':
        return <hr className="border-gray-300 border-t-2 border-dashed" />;
      case 'dotted':
        return <hr className="border-gray-300 border-t-2 border-dotted" />;
      case 'stars':
        return (
          <div className="text-center text-gray-400 text-2xl">
            ⭐ ⭐ ⭐
          </div>
        );
      case 'dots':
        return (
          <div className="text-center text-gray-400 text-2xl">
            • • •
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`block-container group relative rounded-lg transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50' 
          : 'hover:ring-1 hover:ring-gray-300 hover:bg-gray-50'
      }`}
      onClick={onSelect}
      style={{ 
        height: getCurrentHeight(),
        minHeight: getCurrentHeight()
      }}
    >
      {/* Block Toolbar */}
      <div className={`absolute -top-10 left-0 flex items-center gap-1 bg-white rounded shadow-lg border px-2 py-1 transition-opacity ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <span className="text-xs text-gray-500 font-medium">Spacer</span>
        <div className="h-4 w-px bg-gray-300 mx-1"></div>
        
        {/* Size Selector */}
        <select
          value={spacerSize}
          onChange={(e) => handleSizeChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="text-xs border-none bg-transparent focus:outline-none"
        >
          {SPACER_SIZES.map(size => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>
        
        <div className="h-4 w-px bg-gray-300 mx-1"></div>
        
        {/* Divider Style Selector */}
        <select
          value={dividerStyle}
          onChange={(e) => handleStyleChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="text-xs border-none bg-transparent focus:outline-none"
        >
          {DIVIDER_STYLES.map(style => (
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
      <div 
        className="h-full flex items-center justify-center relative"
        style={{ minHeight: getCurrentHeight() }}
      >
        {/* Background pattern for spacer visualization */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, #ccc 8px, #ccc 16px)',
              backgroundSize: '16px 16px'
            }}
          />
        </div>
        
        {/* Divider content */}
        <div className="relative z-10 w-full flex items-center justify-center">
          {renderDivider()}
        </div>
        
        {/* Size indicator when selected */}
        {isSelected && (
          <div className="absolute bottom-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
            {getCurrentHeight()}px
          </div>
        )}
      </div>
    </div>
  );
};