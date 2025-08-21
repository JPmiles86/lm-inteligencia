// Draggable Block Wrapper Component

import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Block } from './types';

interface DraggableBlockProps {
  block: Block;
  index: number;
  children: React.ReactNode;
  onMoveBlock: (dragIndex: number, hoverIndex: number) => void;
  className?: string;
}

const ITEM_TYPE = 'BLOCK';

interface DragItem {
  id: string;
  index: number;
  type: string;
}

export const DraggableBlock: React.FC<DraggableBlockProps> = ({
  block,
  index,
  children,
  onMoveBlock,
  className = ''
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id: block.id, index, type: ITEM_TYPE },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (item: DragItem, monitor) => {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) {
        return;
      }

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      onMoveBlock(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Connect drag and drop refs
  drag(drop(ref));

  const opacity = isDragging ? 0.5 : 1;
  
  // Visual feedback for drop zones
  let dropIndicator = '';
  if (isOver && canDrop) {
    dropIndicator = 'ring-2 ring-blue-400 ring-offset-2';
  }

  return (
    <div
      ref={ref}
      className={`draggable-block transition-all duration-200 ${className} ${dropIndicator}`}
      style={{ opacity }}
      data-block-id={block.id}
    >
      {/* Drag handle - visible on hover */}
      <div className="group-hover:opacity-100 opacity-0 absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2 transition-opacity">
        <div 
          className="cursor-grab active:cursor-grabbing bg-gray-300 hover:bg-gray-400 rounded p-1 text-gray-600"
          title="Drag to reorder"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="3" cy="3" r="1"/>
            <circle cx="9" cy="3" r="1"/>
            <circle cx="3" cy="6" r="1"/>
            <circle cx="9" cy="6" r="1"/>
            <circle cx="3" cy="9" r="1"/>
            <circle cx="9" cy="9" r="1"/>
          </svg>
        </div>
      </div>

      {/* The actual block content */}
      {children}

      {/* Drop indicator lines */}
      {isOver && canDrop && (
        <>
          <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded"></div>
          <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 rounded"></div>
        </>
      )}
    </div>
  );
};