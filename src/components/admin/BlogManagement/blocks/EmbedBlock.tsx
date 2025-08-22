// Embed Block Component

import React, { useState, useRef, useEffect } from 'react';
import { Block } from '../types';

interface EmbedBlockProps {
  block: Block;
  isSelected: boolean;
  onUpdate: (block: Block) => void;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const EMBED_TYPES = [
  { value: 'youtube', label: 'YouTube', icon: '🎥', pattern: /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/ },
  { value: 'vimeo', label: 'Vimeo', icon: '🎬', pattern: /vimeo\.com\/(\d+)/ },
  { value: 'twitter', label: 'Twitter/X', icon: '🐦', pattern: /(?:twitter|x)\.com\/\w+\/status\/(\d+)/ },
  { value: 'instagram', label: 'Instagram', icon: '📷', pattern: /instagram\.com\/p\/([A-Za-z0-9_-]+)/ },
  { value: 'codepen', label: 'CodePen', icon: '💻', pattern: /codepen\.io\/[\w-]+\/pen\/([\w-]+)/ },
  { value: 'custom', label: 'Custom HTML', icon: '🔧', pattern: null }
];

export const EmbedBlock: React.FC<EmbedBlockProps> = ({
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
  const [localData, setLocalData] = useState({
    embedUrl: block.data.embedUrl || '',
    embedType: block.data.embedType || 'youtube',
    embedCode: block.data.embedCode || ''
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalData({
      embedUrl: block.data.embedUrl || '',
      embedType: block.data.embedType || 'youtube',
      embedCode: block.data.embedCode || ''
    });
  }, [block.data]);

  useEffect(() => {
    if (isEditing) {
      if (localData.embedType === 'custom' && textareaRef.current) {
        textareaRef.current.focus();
      } else if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isEditing, localData.embedType]);

  const detectEmbedType = (url: string): 'youtube' | 'vimeo' | 'twitter' | 'instagram' | 'codepen' | 'custom' => {
    for (const type of EMBED_TYPES) {
      if (type.pattern && type.pattern.test(url)) {
        return type.value as 'youtube' | 'vimeo' | 'twitter' | 'instagram' | 'codepen' | 'custom';
      }
    }
    return 'custom';
  };

  const generateEmbedCode = (url: string, type: string): string => {
    switch (type) {
      case 'youtube':
        const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
        if (youtubeMatch) {
          return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${youtubeMatch[1]}" frameborder="0" allowfullscreen></iframe>`;
        }
        break;
      
      case 'vimeo':
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) {
          return `<iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`;
        }
        break;
      
      case 'twitter':
        return `<blockquote class="twitter-tweet"><a href="${url}"></a></blockquote><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`;
      
      case 'instagram':
        return `<blockquote class="instagram-media" data-instgrm-permalink="${url}"><a href="${url}"></a></blockquote><script async src="//www.instagram.com/embed.js"></script>`;
      
      case 'codepen':
        const codepenMatch = url.match(/codepen\.io\/([\w-]+)\/pen\/([\w-]+)/);
        if (codepenMatch) {
          return `<iframe height="300" style="width: 100%;" scrolling="no" title="CodePen Embed" src="https://codepen.io/${codepenMatch[1]}/embed/${codepenMatch[2]}?default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true"></iframe>`;
        }
        break;
    }
    return '';
  };

  const handleSave = () => {
    let finalEmbedCode = localData.embedCode;
    
    if (localData.embedType !== 'custom' && localData.embedUrl) {
      finalEmbedCode = generateEmbedCode(localData.embedUrl, localData.embedType);
    }

    onUpdate({
      ...block,
      data: { 
        ...block.data, 
        ...localData,
        embedCode: finalEmbedCode
      }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalData({
      embedUrl: block.data.embedUrl || '',
      embedType: block.data.embedType || 'youtube',
      embedCode: block.data.embedCode || ''
    });
    setIsEditing(false);
  };

  const handleUrlChange = (url: string) => {
    const detectedType = detectEmbedType(url);
    setLocalData({
      embedUrl: url,
      embedType: detectedType,
      embedCode: detectedType !== 'custom' ? generateEmbedCode(url, detectedType) : localData.embedCode
    });
  };

  const handleTypeChange = (type: string) => {
    setLocalData(prev => ({
      ...prev,
      embedType: type as typeof prev.embedType,
      embedCode: type !== 'custom' && prev.embedUrl ? generateEmbedCode(prev.embedUrl, type as typeof prev.embedType) : prev.embedCode
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const renderEmbed = () => {
    if (!block.data.embedCode && !block.data.embedUrl) {
      return (
        <div className="text-gray-400 italic flex items-center justify-center min-h-[120px] border-2 border-dashed border-gray-300 rounded">
          <div className="text-center">
            <div className="text-4xl mb-2">🎥</div>
            <p>Double-click to add embed...</p>
          </div>
        </div>
      );
    }

    if (block.data.embedCode) {
      return (
        <div className="embed-container">
          <div 
            dangerouslySetInnerHTML={{ __html: block.data.embedCode }}
            className="w-full"
          />
        </div>
      );
    }

    return (
      <div className="bg-gray-100 p-4 rounded border-2 border-dashed border-gray-300 text-center text-gray-600">
        <p>Embed URL: {block.data.embedUrl}</p>
        <p className="text-sm">Double-click to configure embed</p>
      </div>
    );
  };

  const getCurrentType = () => {
    return EMBED_TYPES.find(type => type.value === localData.embedType) || EMBED_TYPES[0];
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
          {getCurrentType().icon} Embed ({getCurrentType().label})
        </span>
        <div className="h-4 w-px bg-gray-300 mx-1"></div>
        
        {/* Type Selector */}
        <select
          value={localData.embedType}
          onChange={(e) => handleTypeChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="text-xs border-none bg-transparent focus:outline-none"
        >
          {EMBED_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Embed Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {EMBED_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => handleTypeChange(type.value)}
                  className={`p-2 text-sm rounded border ${
                    localData.embedType === type.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {type.icon} {type.label}
                </button>
              ))}
            </div>
          </div>

          {localData.embedType === 'custom' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Embed Code
              </label>
              <textarea
                ref={textareaRef}
                value={localData.embedCode}
                onChange={(e) => setLocalData(prev => ({ ...prev, embedCode: e.target.value }))}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                rows={6}
                placeholder="Paste your embed code here..."
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getCurrentType().label} URL
              </label>
              <input
                ref={inputRef}
                type="url"
                value={localData.embedUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Enter ${getCurrentType().label} URL...`}
              />
              <p className="text-xs text-gray-500 mt-1">
                The embed code will be generated automatically
              </p>
            </div>
          )}

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
              Ctrl+Enter to save, Esc to cancel
            </span>
          </div>
        </div>
      ) : (
        <div onDoubleClick={handleDoubleClick} className="cursor-pointer">
          {renderEmbed()}
          
          {(block.data.embedCode || block.data.embedUrl) && (
            <div className="text-center text-gray-500 text-sm mt-2">
              Double-click to edit embed
            </div>
          )}
        </div>
      )}
    </div>
  );
};