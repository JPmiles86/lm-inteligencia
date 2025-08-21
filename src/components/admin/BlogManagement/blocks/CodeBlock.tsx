// Code Block Component

import React, { useState, useRef, useEffect } from 'react';
import { Block } from '../types';

interface CodeBlockProps {
  block: Block;
  isSelected: boolean;
  onUpdate: (block: Block) => void;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'bash', label: 'Bash' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'text', label: 'Plain Text' }
];

export const CodeBlock: React.FC<CodeBlockProps> = ({
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
  const [localCode, setLocalCode] = useState(block.data.code || '');
  const [localLanguage, setLocalLanguage] = useState(block.data.language || 'javascript');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalCode(block.data.code || '');
    setLocalLanguage(block.data.language || 'javascript');
  }, [block.data.code, block.data.language]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onUpdate({
      ...block,
      data: { ...block.data, code: localCode, language: localLanguage }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalCode(block.data.code || '');
    setLocalLanguage(block.data.language || 'javascript');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      
      setLocalCode(prev => prev.substring(0, start) + '  ' + prev.substring(end));
      
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    } else if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const isEmpty = !block.data.code?.trim();

  return (
    <div
      className={`block-container group relative p-4 rounded-lg transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50' 
          : 'hover:ring-1 hover:ring-gray-300 hover:bg-gray-50'
      } ${isEmpty ? 'min-h-[120px] border-2 border-dashed border-gray-300' : ''}`}
      onClick={onSelect}
    >
      {/* Block Toolbar */}
      <div className={`absolute -top-10 left-0 flex items-center gap-1 bg-white rounded shadow-lg border px-2 py-1 transition-opacity ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <span className="text-xs text-gray-500 font-medium">
          Code ({localLanguage})
        </span>
        <div className="h-4 w-px bg-gray-300 mx-1"></div>
        
        {/* Language Selector */}
        <select
          value={localLanguage}
          onChange={(e) => {
            setLocalLanguage(e.target.value);
            onUpdate({
              ...block,
              data: { ...block.data, language: e.target.value }
            });
          }}
          onClick={(e) => e.stopPropagation()}
          className="text-xs border-none bg-transparent focus:outline-none"
        >
          {LANGUAGE_OPTIONS.map(lang => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
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
        <div className="space-y-2">
          <textarea
            ref={textareaRef}
            value={localCode}
            onChange={(e) => setLocalCode(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-4 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm bg-gray-900 text-green-400"
            rows={Math.max(8, localCode.split('\n').length + 1)}
            placeholder="// Enter your code here..."
            style={{ tabSize: 2 }}
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
            <span className="text-xs text-gray-500">
              Tab for indent, Ctrl+Enter to save, Esc to cancel
            </span>
          </div>
        </div>
      ) : (
        <div
          onDoubleClick={handleDoubleClick}
          className="cursor-text"
        >
          {isEmpty ? (
            <div className="text-gray-400 italic flex items-center justify-center min-h-[80px] border-2 border-dashed border-gray-300 rounded">
              <div className="text-center">
                <div className="text-2xl mb-2">💻</div>
                <p>Double-click to add code...</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
              <div className="flex items-center justify-between mb-2 text-gray-500 text-xs">
                <span>{localLanguage}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(block.data.code || '');
                  }}
                  className="hover:text-white"
                  title="Copy code"
                >
                  📋
                </button>
              </div>
              <pre className="whitespace-pre-wrap">
                {block.data.code}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};