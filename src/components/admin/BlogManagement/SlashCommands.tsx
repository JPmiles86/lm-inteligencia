// Slash Commands Component - Quick block insertion

import React, { useState, useRef, useEffect } from 'react';
import { BlockType, Block } from './types';
import { createBlock } from './utils/blockHelpers';

interface SlashCommandsProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertBlock: (block: Block) => void;
  position: { x: number; y: number };
  searchQuery?: string;
}

interface Command {
  type: BlockType;
  name: string;
  description: string;
  icon: string;
  keywords: string[];
  shortcut?: string;
}

const COMMANDS: Command[] = [
  {
    type: 'paragraph',
    name: 'Paragraph',
    description: 'Add a paragraph of text',
    icon: '📝',
    keywords: ['text', 'paragraph', 'p'],
    shortcut: 'p'
  },
  {
    type: 'heading',
    name: 'Heading 1',
    description: 'Large section heading',
    icon: '📏',
    keywords: ['heading', 'title', 'h1'],
    shortcut: 'h1'
  },
  {
    type: 'heading',
    name: 'Heading 2',
    description: 'Medium section heading',
    icon: '📐',
    keywords: ['heading', 'title', 'h2'],
    shortcut: 'h2'
  },
  {
    type: 'heading',
    name: 'Heading 3',
    description: 'Small section heading',
    icon: '📏',
    keywords: ['heading', 'title', 'h3'],
    shortcut: 'h3'
  },
  {
    type: 'list',
    name: 'Bulleted List',
    description: 'Create a bulleted list',
    icon: '• ',
    keywords: ['list', 'bullet', 'ul'],
    shortcut: 'ul'
  },
  {
    type: 'list',
    name: 'Numbered List',
    description: 'Create a numbered list',
    icon: '1.',
    keywords: ['list', 'numbered', 'ol'],
    shortcut: 'ol'
  },
  {
    type: 'quote',
    name: 'Quote',
    description: 'Add a quote or blockquote',
    icon: '💬',
    keywords: ['quote', 'blockquote', 'citation'],
    shortcut: 'quote'
  },
  {
    type: 'code',
    name: 'Code Block',
    description: 'Add a code block with syntax highlighting',
    icon: '💻',
    keywords: ['code', 'programming', 'syntax'],
    shortcut: 'code'
  },
  {
    type: 'image',
    name: 'Image',
    description: 'Add a single image',
    icon: '🖼️',
    keywords: ['image', 'photo', 'picture'],
    shortcut: 'img'
  },
  {
    type: 'gallery',
    name: 'Gallery',
    description: 'Create an image gallery',
    icon: '🖼️',
    keywords: ['gallery', 'images', 'photos'],
    shortcut: 'gallery'
  },
  {
    type: 'button',
    name: 'Button',
    description: 'Add a call-to-action button',
    icon: '🔘',
    keywords: ['button', 'cta', 'link'],
    shortcut: 'btn'
  },
  {
    type: 'table',
    name: 'Table',
    description: 'Create a data table',
    icon: '📊',
    keywords: ['table', 'data', 'spreadsheet'],
    shortcut: 'table'
  },
  {
    type: 'columns',
    name: 'Columns',
    description: 'Create a multi-column layout',
    icon: '📄',
    keywords: ['columns', 'layout', 'grid'],
    shortcut: 'cols'
  },
  {
    type: 'spacer',
    name: 'Spacer',
    description: 'Add vertical spacing',
    icon: '⬜',
    keywords: ['spacer', 'space', 'divider'],
    shortcut: 'spacer'
  },
  {
    type: 'embed',
    name: 'Embed',
    description: 'Embed videos or social media',
    icon: '🎥',
    keywords: ['embed', 'video', 'youtube'],
    shortcut: 'embed'
  },
  {
    type: 'callout',
    name: 'Callout',
    description: 'Add an attention-grabbing callout',
    icon: '⚠️',
    keywords: ['callout', 'alert', 'notice'],
    shortcut: 'callout'
  }
];

export const SlashCommands: React.FC<SlashCommandsProps> = ({
  isOpen,
  onClose,
  onInsertBlock,
  position,
  searchQuery = ''
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter commands based on search query
  const filteredCommands = COMMANDS.filter(command => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      command.name.toLowerCase().includes(query) ||
      command.description.toLowerCase().includes(query) ||
      command.keywords.some(keyword => keyword.includes(query)) ||
      (command.shortcut && command.shortcut.includes(query))
    );
  });

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            handleSelectCommand(filteredCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

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

  const handleSelectCommand = (command: Command) => {
    let newBlock: Block;
    
    // Special handling for different heading levels
    if (command.type === 'heading') {
      const level = command.shortcut === 'h1' ? 1 : command.shortcut === 'h2' ? 2 : 3;
      newBlock = createBlock('heading', { level });
    } 
    // Special handling for different list types
    else if (command.type === 'list') {
      const ordered = command.shortcut === 'ol';
      newBlock = createBlock('list', { ordered });
    } 
    else {
      newBlock = createBlock(command.type);
    }
    
    onInsertBlock(newBlock);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 max-h-64 w-80 overflow-y-auto"
      style={{
        left: Math.min(position.x, window.innerWidth - 320),
        top: Math.min(position.y, window.innerHeight - 256)
      }}
    >
      {/* Header */}
      <div className="p-2 border-b border-gray-100 bg-gray-50 rounded-t-lg">
        <div className="text-xs text-gray-600 font-medium">
          Slash Commands {searchQuery && `• "${searchQuery}"`}
        </div>
      </div>

      {/* Commands List */}
      <div className="py-1">
        {filteredCommands.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="text-2xl mb-2">🤷‍♂️</div>
            <p className="text-sm">No commands found</p>
            <p className="text-xs">Try a different search</p>
          </div>
        ) : (
          filteredCommands.map((command, index) => (
            <button
              key={`${command.type}-${command.shortcut || command.name}`}
              onClick={() => handleSelectCommand(command)}
              className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${
                index === selectedIndex
                  ? 'bg-blue-50 text-blue-900'
                  : 'hover:bg-gray-50 text-gray-900'
              }`}
            >
              <span className="text-lg">{command.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{command.name}</div>
                <div className="text-xs text-gray-600 truncate">
                  {command.description}
                </div>
              </div>
              {command.shortcut && (
                <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">
                  /{command.shortcut}
                </div>
              )}
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-100 bg-gray-50 rounded-b-lg">
        <div className="text-xs text-gray-500">
          ↑↓ navigate • Enter select • Esc close
        </div>
      </div>
    </div>
  );
};