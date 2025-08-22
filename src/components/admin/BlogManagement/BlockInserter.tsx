// Block Inserter Component - For adding new blocks to the editor

import React, { useState, useRef, useEffect } from 'react';
import { BlockType, Block } from './types';
import { createBlock } from './utils/blockHelpers';

interface BlockOption {
  type: BlockType;
  name: string;
  description: string;
  icon: string;
  category: string;
  keywords: string[];
}

interface BlockInserterProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertBlock: (block: Block) => void;
  position?: { x: number; y: number };
}

const BLOCK_OPTIONS: BlockOption[] = [
  // Text Blocks
  {
    type: 'paragraph',
    name: 'Paragraph',
    description: 'Add a paragraph of text',
    icon: '📝',
    category: 'Text',
    keywords: ['text', 'paragraph', 'content', 'writing']
  },
  {
    type: 'heading',
    name: 'Heading',
    description: 'Create a heading (H1-H6)',
    icon: '🔤',
    category: 'Text',
    keywords: ['heading', 'title', 'header', 'h1', 'h2', 'h3']
  },
  {
    type: 'list',
    name: 'List',
    description: 'Create a bulleted or numbered list',
    icon: '📋',
    category: 'Text',
    keywords: ['list', 'bullet', 'numbered', 'items', 'ul', 'ol']
  },
  {
    type: 'quote',
    name: 'Quote',
    description: 'Add a quote or blockquote',
    icon: '💬',
    category: 'Text',
    keywords: ['quote', 'blockquote', 'citation', 'testimonial']
  },
  {
    type: 'code',
    name: 'Code',
    description: 'Add a code block with syntax highlighting',
    icon: '💻',
    category: 'Text',
    keywords: ['code', 'programming', 'syntax', 'javascript', 'html', 'css']
  },

  // Media Blocks
  {
    type: 'image',
    name: 'Image',
    description: 'Add a single image with caption',
    icon: '🖼️',
    category: 'Media',
    keywords: ['image', 'photo', 'picture', 'visual', 'media']
  },
  {
    type: 'gallery',
    name: 'Gallery',
    description: 'Create an image gallery',
    icon: '🖼️',
    category: 'Media',
    keywords: ['gallery', 'images', 'photos', 'carousel', 'grid']
  },
  {
    type: 'embed',
    name: 'Embed',
    description: 'Embed videos, social media posts, or other content',
    icon: '🎥',
    category: 'Media',
    keywords: ['embed', 'video', 'youtube', 'vimeo', 'twitter', 'instagram']
  },

  // Layout Blocks
  {
    type: 'columns',
    name: 'Columns',
    description: 'Create a multi-column layout',
    icon: '📄',
    category: 'Layout',
    keywords: ['columns', 'layout', 'grid', 'responsive']
  },
  {
    type: 'spacer',
    name: 'Spacer',
    description: 'Add vertical spacing between blocks',
    icon: '⬜',
    category: 'Layout',
    keywords: ['spacer', 'space', 'margin', 'divider', 'gap']
  },
  {
    type: 'button',
    name: 'Button',
    description: 'Add a call-to-action button',
    icon: '🔘',
    category: 'Layout',
    keywords: ['button', 'cta', 'link', 'action', 'click']
  },

  // Advanced Blocks
  {
    type: 'table',
    name: 'Table',
    description: 'Create a data table',
    icon: '📊',
    category: 'Advanced',
    keywords: ['table', 'data', 'rows', 'columns', 'spreadsheet']
  },
  {
    type: 'callout',
    name: 'Callout',
    description: 'Add an attention-grabbing callout box',
    icon: '⚠️',
    category: 'Advanced',
    keywords: ['callout', 'alert', 'notice', 'info', 'warning', 'highlight']
  }
];

export const BlockInserter: React.FC<BlockInserterProps> = ({
  isOpen,
  onClose,
  onInsertBlock,
  position = { x: 0, y: 0 }
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const categories = ['All', 'Text', 'Media', 'Layout', 'Advanced'];

  // Filter blocks based on search query and category
  const filteredBlocks = BLOCK_OPTIONS.filter(block => {
    const matchesCategory = selectedCategory === 'All' || block.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      block.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedCategory('All');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredBlocks.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredBlocks[selectedIndex]) {
            handleInsertBlock(filteredBlocks[selectedIndex].type);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredBlocks, onClose]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleInsertBlock = (blockType: BlockType) => {
    const newBlock = createBlock(blockType);
    onInsertBlock(newBlock);
    onClose();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedIndex(0);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedIndex(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={containerRef}
        className="bg-white rounded-lg shadow-xl border max-w-md w-full mx-4 max-h-96 flex flex-col"
        style={{
          // Center the modal on screen, no longer using position props that cause off-screen issues
          position: 'relative',
          transform: 'none'
        }}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Add Block</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search blocks..."
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute left-2 top-2.5 text-gray-400">🔍</div>
          </div>
        </div>

        {/* Categories */}
        <div className="px-4 py-2 border-b">
          <div className="flex gap-1 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Block List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredBlocks.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <div className="text-4xl mb-2">🤷‍♂️</div>
              <p>No blocks found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredBlocks.map((block, index) => (
                <button
                  key={block.type}
                  onClick={() => handleInsertBlock(block.type)}
                  className={`w-full text-left p-3 rounded-md transition-colors ${
                    index === selectedIndex
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{block.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{block.name}</div>
                      <div className="text-sm text-gray-600">{block.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-500 rounded-b-lg">
          Use ↑↓ to navigate, Enter to select, Esc to close
        </div>
      </div>
    </div>
  );
};