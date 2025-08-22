// Simple Block Editor Component - Simplified version for initial testing

import React, { useState } from 'react';
import { Block } from './types';
import { createBlock } from './utils/blockHelpers';
import { BlockInserter } from './BlockInserter';
import { ParagraphBlock } from './blocks/ParagraphBlock';
import { HeadingBlock } from './blocks/HeadingBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { ListBlock } from './blocks/ListBlock';
import { QuoteBlock } from './blocks/QuoteBlock';
import { CalloutBlock } from './blocks/CalloutBlock';
import { CodeBlock } from './blocks/CodeBlock';
import { ButtonBlock } from './blocks/ButtonBlock';
import { SpacerBlock } from './blocks/SpacerBlock';
import { TableBlock } from './blocks/TableBlock';
import { GalleryBlock } from './blocks/GalleryBlock';
import { EmbedBlock } from './blocks/EmbedBlock';
import { ColumnsBlock } from './blocks/ColumnsBlock';

interface SimpleBlockEditorProps {
  initialBlocks?: Block[];
  onChange?: (blocks: Block[]) => void;
  onSave?: (blocks: Block[]) => void;
  className?: string;
}

export const SimpleBlockEditor: React.FC<SimpleBlockEditorProps> = ({
  initialBlocks = [],
  onChange,
  onSave,
  className = ''
}) => {
  const [blocks, setBlocks] = useState<Block[]>(
    initialBlocks.length > 0 ? initialBlocks : [createBlock('paragraph')]
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | undefined>();
  const [isInserterOpen, setIsInserterOpen] = useState(false);

  // Auto-save functionality
  React.useEffect(() => {
    if (onChange) {
      onChange(blocks);
    }
  }, [blocks, onChange]);

  const updateBlock = (blockId: string, updatedBlock: Block) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId ? updatedBlock : block
    ));
  };

  const insertBlock = (block: Block, index?: number) => {
    const insertIndex = index !== undefined ? index : blocks.length;
    const newBlocks = [...blocks];
    newBlocks.splice(insertIndex, 0, block);
    setBlocks(newBlocks);
    setSelectedBlockId(block.id);
    setIsInserterOpen(false);
  };

  const deleteBlock = (blockId: string) => {
    if (blocks.length === 1) {
      // Don't delete the last block, just clear it
      const clearedBlock = createBlock('paragraph');
      setBlocks([clearedBlock]);
      setSelectedBlockId(clearedBlock.id);
    } else {
      const newBlocks = blocks.filter(block => block.id !== blockId);
      setBlocks(newBlocks);
      setSelectedBlockId(newBlocks[0]?.id);
    }
  };

  const duplicateBlock = (blockId: string) => {
    const blockIndex = blocks.findIndex(block => block.id === blockId);
    if (blockIndex !== -1) {
      const originalBlock = blocks[blockIndex];
      const duplicatedBlock = {
        ...originalBlock,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      };
      const newBlocks = [...blocks];
      newBlocks.splice(blockIndex + 1, 0, duplicatedBlock);
      setBlocks(newBlocks);
      setSelectedBlockId(duplicatedBlock.id);
    }
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const blockIndex = blocks.findIndex(block => block.id === blockId);
    if (blockIndex === -1) return;
    
    const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    
    const newBlocks = [...blocks];
    [newBlocks[blockIndex], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[blockIndex]];
    setBlocks(newBlocks);
  };

  const selectBlock = (blockId: string) => {
    setSelectedBlockId(blockId);
  };

  const openInserter = () => {
    setIsInserterOpen(true);
  };

  const closeInserter = () => {
    setIsInserterOpen(false);
  };

  // Render block based on type
  const renderBlock = (block: Block, index: number) => {
    const commonProps = {
      block,
      isSelected: selectedBlockId === block.id,
      onUpdate: (updatedBlock: Block) => updateBlock(block.id, updatedBlock),
      onSelect: () => selectBlock(block.id),
      onDelete: () => deleteBlock(block.id),
      onDuplicate: () => duplicateBlock(block.id),
      onMoveUp: index > 0 ? () => moveBlock(block.id, 'up') : undefined,
      onMoveDown: index < blocks.length - 1 ? () => moveBlock(block.id, 'down') : undefined
    };

    switch (block.type) {
      case 'paragraph':
        return <ParagraphBlock key={block.id} {...commonProps} />;
      case 'heading':
        return <HeadingBlock key={block.id} {...commonProps} />;
      case 'image':
        return <ImageBlock key={block.id} {...commonProps} />;
      case 'list':
        return <ListBlock key={block.id} {...commonProps} />;
      case 'quote':
        return <QuoteBlock key={block.id} {...commonProps} />;
      case 'callout':
        return <CalloutBlock key={block.id} {...commonProps} />;
      case 'code':
        return <CodeBlock key={block.id} {...commonProps} />;
      case 'button':
        return <ButtonBlock key={block.id} {...commonProps} />;
      case 'spacer':
        return <SpacerBlock key={block.id} {...commonProps} />;
      case 'table':
        return <TableBlock key={block.id} {...commonProps} />;
      case 'gallery':
        return <GalleryBlock key={block.id} {...commonProps} />;
      case 'embed':
        return <EmbedBlock key={block.id} {...commonProps} />;
      case 'columns':
        return <ColumnsBlock key={block.id} {...commonProps} />;
      default:
        // Fallback for unimplemented block types
        return (
          <div key={block.id} className="p-4 border border-red-300 rounded-lg bg-red-50">
            <p className="text-red-600">
              Block type "{block.type}" not implemented yet.
            </p>
          </div>
        );
    }
  };

  const handleAddBlockAt = () => {
    openInserter();
  };

  return (
    <div className={`block-editor ${className}`}>
      {/* Editor Toolbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={openInserter}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="text-lg">+</span>
              Add Block
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {blocks.length} block{blocks.length !== 1 ? 's' : ''}
            </span>
            
            {onSave && (
              <button
                onClick={() => onSave(blocks)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {blocks.map((block, index) => (
            <div key={block.id} className="relative">
              {/* Block Inserter Above */}
              {index === 0 && (
                <div className="flex justify-center mb-4">
                  <button
                    onClick={() => handleAddBlockAt()}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <span>+</span> Add block
                  </button>
                </div>
              )}
              
              {/* The Block */}
              {renderBlock(block, index)}
              
              {/* Block Inserter Below */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => handleAddBlockAt()}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <span>+</span> Add block
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Block Inserter Modal */}
      <BlockInserter
        isOpen={isInserterOpen}
        onClose={closeInserter}
        onInsertBlock={(block) => insertBlock(block)}
        position={{ x: window.innerWidth / 2, y: window.innerHeight / 2 }}
      />
    </div>
  );
};