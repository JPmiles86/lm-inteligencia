// Block Editor Component - Main block-based content editor

import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Block, BlockEditorState } from './types';
import { createBlock, cloneBlock } from './utils/blockHelpers';
import { BlockInserter } from './BlockInserter';
import { DraggableBlock } from './DraggableBlock';
import { BlockSettingsPanel } from './BlockSettingsPanel';
import { SlashCommands } from './SlashCommands';
import { BlockTemplates } from './BlockTemplates';
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

interface BlockEditorProps {
  initialBlocks?: Block[];
  onChange?: (blocks: Block[]) => void;
  onSave?: (blocks: Block[]) => void;
  className?: string;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  initialBlocks = [],
  onChange,
  onSave,
  className = ''
}) => {
  const [state, setState] = useState<BlockEditorState>({
    blocks: initialBlocks.length > 0 ? initialBlocks : [createBlock('paragraph')],
    selectedBlockId: undefined,
    isInserterOpen: false,
    isSettingsPanelOpen: false,
    isSlashCommandsOpen: false,
    slashCommandsPosition: { x: 0, y: 0 },
    slashCommandsQuery: '',
    isTemplatesOpen: false,
    history: [initialBlocks.length > 0 ? initialBlocks : [createBlock('paragraph')]],
    historyIndex: 0
  });

  const [inserterPosition, setInserterPosition] = useState({ x: 0, y: 0 });

  // Auto-save functionality
  useEffect(() => {
    if (onChange) {
      onChange(state.blocks);
    }
  }, [state.blocks, onChange]);

  // Undo/Redo functionality
  const saveToHistory = useCallback((blocks: Block[]) => {
    setState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push([...blocks]);
      
      return {
        ...prev,
        blocks,
        history: newHistory.slice(-50), // Keep last 50 states
        historyIndex: Math.min(newHistory.length - 1, 49)
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex > 0) {
        const newIndex = prev.historyIndex - 1;
        return {
          ...prev,
          blocks: [...prev.history[newIndex]],
          historyIndex: newIndex
        };
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex < prev.history.length - 1) {
        const newIndex = prev.historyIndex + 1;
        return {
          ...prev,
          blocks: [...prev.history[newIndex]],
          historyIndex: newIndex
        };
      }
      return prev;
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 's':
            e.preventDefault();
            if (onSave) {
              onSave(state.blocks);
            }
            break;
          case '/':
            e.preventDefault();
            // Open slash commands at cursor position
            const rect = (e.target as HTMLElement).getBoundingClientRect?.();
            const position = rect ? 
              { x: rect.left, y: rect.bottom + 5 } : 
              { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            openSlashCommands(position);
            break;
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        // Navigate between blocks with Tab/Shift+Tab
        const currentIndex = state.selectedBlockId ? 
          state.blocks.findIndex(b => b.id === state.selectedBlockId) : -1;
        
        if (currentIndex !== -1) {
          const nextIndex = e.shiftKey ? 
            (currentIndex > 0 ? currentIndex - 1 : state.blocks.length - 1) :
            (currentIndex < state.blocks.length - 1 ? currentIndex + 1 : 0);
          
          selectBlock(state.blocks[nextIndex].id);
        }
      } else if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
        // Insert new paragraph block after current block
        if (state.selectedBlockId) {
          const currentIndex = state.blocks.findIndex(b => b.id === state.selectedBlockId);
          if (currentIndex !== -1) {
            e.preventDefault();
            const newBlock = createBlock('paragraph');
            insertBlock(newBlock, currentIndex + 1);
          }
        }
      } else if (e.key === 'Backspace') {
        // Delete empty blocks on backspace
        if (state.selectedBlockId) {
          const currentBlock = state.blocks.find(b => b.id === state.selectedBlockId);
          if (currentBlock && state.blocks.length > 1) {
            // Check if block is empty
            const isEmpty = 
              (currentBlock.type === 'paragraph' && !currentBlock.data.text?.trim()) ||
              (currentBlock.type === 'heading' && !currentBlock.data.text?.trim()) ||
              (currentBlock.type === 'list' && (!currentBlock.data.items || currentBlock.data.items.every(item => !item.trim())));
            
            if (isEmpty) {
              e.preventDefault();
              deleteBlock(state.selectedBlockId);
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, onSave, state.blocks, state.selectedBlockId]);

  // Block operations
  const updateBlock = useCallback((blockId: string, updatedBlock: Block) => {
    const newBlocks = state.blocks.map(block => 
      block.id === blockId ? updatedBlock : block
    );
    saveToHistory(newBlocks);
  }, [state.blocks, saveToHistory]);

  const insertBlock = useCallback((block: Block, index?: number) => {
    setState(prev => {
      const insertIndex = index !== undefined ? index : prev.blocks.length;
      const newBlocks = [...prev.blocks];
      newBlocks.splice(insertIndex, 0, block);
      saveToHistory(newBlocks);
      return {
        ...prev,
        blocks: newBlocks,
        selectedBlockId: block.id,
        isInserterOpen: false
      };
    });
  }, [saveToHistory]);

  const deleteBlock = useCallback((blockId: string) => {
    setState(prev => {
      if (prev.blocks.length === 1) {
        // Don't delete the last block, just clear it
        const clearedBlock = createBlock('paragraph');
        saveToHistory([clearedBlock]);
        return {
          ...prev,
          blocks: [clearedBlock],
          selectedBlockId: clearedBlock.id
        };
      }
      
      const newBlocks = prev.blocks.filter(block => block.id !== blockId);
      saveToHistory(newBlocks);
      return {
        ...prev,
        blocks: newBlocks,
        selectedBlockId: newBlocks[0]?.id
      };
    });
  }, [saveToHistory]);

  const duplicateBlock = useCallback((blockId: string) => {
    setState(prev => {
      const blockIndex = prev.blocks.findIndex(block => block.id === blockId);
      if (blockIndex !== -1) {
        const originalBlock = prev.blocks[blockIndex];
        const duplicatedBlock = cloneBlock(originalBlock);
        const newBlocks = [...prev.blocks];
        newBlocks.splice(blockIndex + 1, 0, duplicatedBlock);
        saveToHistory(newBlocks);
        return {
          ...prev,
          blocks: newBlocks,
          selectedBlockId: duplicatedBlock.id
        };
      }
      return prev;
    });
  }, [saveToHistory]);

  const moveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
    setState(prev => {
      const blockIndex = prev.blocks.findIndex(block => block.id === blockId);
      if (blockIndex === -1) return prev;
      
      const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
      if (newIndex < 0 || newIndex >= prev.blocks.length) return prev;
      
      const newBlocks = [...prev.blocks];
      [newBlocks[blockIndex], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[blockIndex]];
      
      saveToHistory(newBlocks);
      return {
        ...prev,
        blocks: newBlocks
      };
    });
  }, [saveToHistory]);

  const moveBlockByIndex = useCallback((dragIndex: number, hoverIndex: number) => {
    setState(prev => {
      const newBlocks = [...prev.blocks];
      const draggedBlock = newBlocks[dragIndex];
      
      // Remove the dragged block from its original position
      newBlocks.splice(dragIndex, 1);
      
      // Insert it at the new position
      newBlocks.splice(hoverIndex, 0, draggedBlock);
      
      // Save to history for undo/redo
      saveToHistory(newBlocks);
      
      return {
        ...prev,
        blocks: newBlocks
      };
    });
  }, [saveToHistory]);

  const selectBlock = useCallback((blockId: string) => {
    setState(prev => ({
      ...prev,
      selectedBlockId: blockId
    }));
  }, []);

  const openInserter = useCallback((e?: KeyboardEvent | React.MouseEvent) => {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    
    if (e && 'clientX' in e) {
      x = e.clientX;
      y = e.clientY;
    }
    
    setInserterPosition({ x, y });
    setState(prev => ({
      ...prev,
      isInserterOpen: true
    }));
  }, []);

  const closeInserter = useCallback(() => {
    setState(prev => ({
      ...prev,
      isInserterOpen: false
    }));
  }, []);

  const toggleSettingsPanel = useCallback(() => {
    setState(prev => ({
      ...prev,
      isSettingsPanelOpen: !prev.isSettingsPanelOpen
    }));
  }, []);

  const closeSettingsPanel = useCallback(() => {
    setState(prev => ({
      ...prev,
      isSettingsPanelOpen: false
    }));
  }, []);

  const openSlashCommands = useCallback((position: { x: number; y: number }, query: string = '') => {
    setState(prev => ({
      ...prev,
      isSlashCommandsOpen: true,
      slashCommandsPosition: position,
      slashCommandsQuery: query
    }));
  }, []);

  const closeSlashCommands = useCallback(() => {
    setState(prev => ({
      ...prev,
      isSlashCommandsOpen: false,
      slashCommandsQuery: ''
    }));
  }, []);


  const openTemplates = useCallback(() => {
    setState(prev => ({
      ...prev,
      isTemplatesOpen: true
    }));
  }, []);

  const closeTemplates = useCallback(() => {
    setState(prev => ({
      ...prev,
      isTemplatesOpen: false
    }));
  }, []);

  const insertTemplate = useCallback((blocks: Block[]) => {
    setState(prev => {
      const newBlocks = [...prev.blocks, ...blocks];
      saveToHistory(newBlocks);
      return {
        ...prev,
        blocks: newBlocks,
        isTemplatesOpen: false
      };
    });
  }, [saveToHistory]);

  // Render block based on type
  const renderBlock = useCallback((block: Block, index: number) => {
    const commonProps = {
      block,
      isSelected: state.selectedBlockId === block.id,
      onUpdate: (updatedBlock: Block) => updateBlock(block.id, updatedBlock),
      onSelect: () => selectBlock(block.id),
      onDelete: () => deleteBlock(block.id),
      onDuplicate: () => duplicateBlock(block.id),
      onMoveUp: index > 0 ? () => moveBlock(block.id, 'up') : undefined,
      onMoveDown: index < state.blocks.length - 1 ? () => moveBlock(block.id, 'down') : undefined
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
  }, [state.selectedBlockId, updateBlock, selectBlock, deleteBlock, duplicateBlock, moveBlock]);

  // Add block inserter between blocks
  const handleAddBlockAt = (index: number) => {
    openInserter();
  };

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  return (
    <DndProvider backend={HTML5Backend}>
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
            
            <button
              onClick={openTemplates}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <span className="text-lg">📋</span>
              Templates
            </button>
            
            <div className="h-6 w-px bg-gray-300"></div>
            
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`p-2 rounded-lg transition-colors ${
                canUndo
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              ↶
            </button>
            
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`p-2 rounded-lg transition-colors ${
                canRedo
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Y)"
            >
              ↷
            </button>
            
            <div className="h-6 w-px bg-gray-300"></div>
            
            <button
              onClick={toggleSettingsPanel}
              className={`p-2 rounded-lg transition-colors ${
                state.isSettingsPanelOpen
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title="Block Settings"
            >
              ⚙️
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {state.blocks.length} block{state.blocks.length !== 1 ? 's' : ''}
            </span>
            
            {onSave && (
              <button
                onClick={() => onSave(state.blocks)}
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
          {state.blocks.map((block, index) => (
            <div key={block.id} className="relative">
              {/* Block Inserter Above */}
              {index === 0 && (
                <div className="flex justify-center mb-4">
                  <button
                    onClick={() => handleAddBlockAt(0)}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <span>+</span> Add block
                  </button>
                </div>
              )}
              
              {/* The Draggable Block */}
              <DraggableBlock
                block={block}
                index={index}
                onMoveBlock={moveBlockByIndex}
                className="group"
              >
                {renderBlock(block, index)}
              </DraggableBlock>
              
              {/* Block Inserter Below */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => handleAddBlockAt(index + 1)}
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
        isOpen={state.isInserterOpen}
        onClose={closeInserter}
        onInsertBlock={(block) => insertBlock(block)}
        position={inserterPosition}
      />

      {/* Block Settings Panel */}
      <BlockSettingsPanel
        isOpen={state.isSettingsPanelOpen}
        selectedBlock={state.selectedBlockId ? state.blocks.find(b => b.id === state.selectedBlockId) || null : null}
        onUpdateBlock={(updatedBlock) => updateBlock(updatedBlock.id, updatedBlock)}
        onClose={closeSettingsPanel}
      />

      {/* Slash Commands */}
      <SlashCommands
        isOpen={state.isSlashCommandsOpen}
        onClose={closeSlashCommands}
        onInsertBlock={(block) => insertBlock(block)}
        position={state.slashCommandsPosition}
        searchQuery={state.slashCommandsQuery}
      />

      {/* Block Templates */}
      <BlockTemplates
        isOpen={state.isTemplatesOpen}
        onClose={closeTemplates}
        onInsertTemplate={insertTemplate}
      />
      </div>
    </DndProvider>
  );
};