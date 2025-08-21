// Table Block Component

import React, { useState, useRef, useEffect } from 'react';
import { Block } from '../types';

interface TableBlockProps {
  block: Block;
  isSelected: boolean;
  onUpdate: (block: Block) => void;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const TableBlock: React.FC<TableBlockProps> = ({
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
    rows: block.data.rows || [['Cell 1', 'Cell 2'], ['Cell 3', 'Cell 4']],
    headers: block.data.headers || ['Header 1', 'Header 2'],
    hasHeader: block.data.hasHeader !== undefined ? block.data.hasHeader : true
  });
  const [editingCell, setEditingCell] = useState<{row: number, col: number} | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalData({
      rows: block.data.rows || [['Cell 1', 'Cell 2'], ['Cell 3', 'Cell 4']],
      headers: block.data.headers || ['Header 1', 'Header 2'],
      hasHeader: block.data.hasHeader !== undefined ? block.data.hasHeader : true
    });
  }, [block.data]);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const handleSave = () => {
    onUpdate({
      ...block,
      data: { ...block.data, ...localData }
    });
    setIsEditing(false);
    setEditingCell(null);
  };

  const handleCancel = () => {
    setLocalData({
      rows: block.data.rows || [['Cell 1', 'Cell 2'], ['Cell 3', 'Cell 4']],
      headers: block.data.headers || ['Header 1', 'Header 2'],
      hasHeader: block.data.hasHeader !== undefined ? block.data.hasHeader : true
    });
    setIsEditing(false);
    setEditingCell(null);
  };

  const handleCellEdit = (rowIndex: number, colIndex: number, value: string) => {
    if (rowIndex === -1) {
      // Editing header
      const newHeaders = [...localData.headers];
      newHeaders[colIndex] = value;
      setLocalData(prev => ({ ...prev, headers: newHeaders }));
    } else {
      // Editing body cell
      const newRows = [...localData.rows];
      newRows[rowIndex][colIndex] = value;
      setLocalData(prev => ({ ...prev, rows: newRows }));
    }
  };

  const addRow = () => {
    const newRow = new Array(localData.rows[0]?.length || 2).fill('');
    setLocalData(prev => ({
      ...prev,
      rows: [...prev.rows, newRow]
    }));
  };

  const addColumn = () => {
    const newHeaders = [...localData.headers, `Header ${localData.headers.length + 1}`];
    const newRows = localData.rows.map(row => [...row, '']);
    setLocalData(prev => ({
      ...prev,
      headers: newHeaders,
      rows: newRows
    }));
  };

  const removeRow = (index: number) => {
    if (localData.rows.length > 1) {
      const newRows = localData.rows.filter((_, i) => i !== index);
      setLocalData(prev => ({ ...prev, rows: newRows }));
    }
  };

  const removeColumn = (index: number) => {
    if (localData.headers.length > 1) {
      const newHeaders = localData.headers.filter((_, i) => i !== index);
      const newRows = localData.rows.map(row => row.filter((_, i) => i !== index));
      setLocalData(prev => ({
        ...prev,
        headers: newHeaders,
        rows: newRows
      }));
    }
  };

  const toggleHeader = () => {
    const newHasHeader = !localData.hasHeader;
    setLocalData(prev => ({ ...prev, hasHeader: newHasHeader }));
    onUpdate({
      ...block,
      data: { ...block.data, hasHeader: newHasHeader }
    });
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const renderCell = (content: string, rowIndex: number, colIndex: number, isHeader: boolean = false) => {
    const isCurrentlyEditing = editingCell && editingCell.row === rowIndex && editingCell.col === colIndex;
    
    if (isEditing && isCurrentlyEditing) {
      return (
        <input
          ref={inputRef}
          type="text"
          value={content}
          onChange={(e) => handleCellEdit(rowIndex, colIndex, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setEditingCell(null);
            } else if (e.key === 'Escape') {
              setEditingCell(null);
            }
          }}
          onBlur={() => setEditingCell(null)}
          className="w-full px-2 py-1 border-none focus:outline-none bg-transparent"
        />
      );
    }

    return (
      <div
        onClick={(e) => {
          if (isEditing) {
            e.stopPropagation();
            setEditingCell({ row: rowIndex, col: colIndex });
          }
        }}
        className={`px-3 py-2 ${isEditing ? 'cursor-text hover:bg-blue-50' : ''}`}
      >
        {content || (isEditing ? 'Click to edit' : '')}
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
          Table ({localData.rows.length}×{localData.headers.length})
        </span>
        <div className="h-4 w-px bg-gray-300 mx-1"></div>
        
        <button
          onClick={(e) => { e.stopPropagation(); toggleHeader(); }}
          className={`px-2 py-1 text-xs rounded ${
            localData.hasHeader ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
          }`}
          title="Toggle header"
        >
          Header
        </button>
        
        {isEditing && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); addRow(); }}
              className="px-2 py-1 text-xs hover:bg-gray-100 rounded"
              title="Add row"
            >
              +Row
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); addColumn(); }}
              className="px-2 py-1 text-xs hover:bg-gray-100 rounded"
              title="Add column"
            >
              +Col
            </button>
          </>
        )}
        
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
      <div onDoubleClick={handleDoubleClick} className="cursor-pointer">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            {localData.hasHeader && (
              <thead>
                <tr className="bg-gray-100">
                  {localData.headers.map((header, colIndex) => (
                    <th 
                      key={colIndex}
                      className="border border-gray-300 font-bold text-left relative group"
                    >
                      {renderCell(header, -1, colIndex, true)}
                      {isEditing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeColumn(colIndex);
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center"
                          title="Remove column"
                        >
                          ×
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {localData.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="group hover:bg-gray-50">
                  {row.map((cell, colIndex) => (
                    <td 
                      key={colIndex}
                      className="border border-gray-300 relative group"
                    >
                      {renderCell(cell, rowIndex, colIndex)}
                    </td>
                  ))}
                  {isEditing && (
                    <td className="border border-gray-300 w-8 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRow(rowIndex);
                        }}
                        className="text-red-500 hover:bg-red-100 rounded px-1"
                        title="Remove row"
                      >
                        ×
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isEditing && (
          <div className="flex items-center gap-2 mt-4">
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
              Click cells to edit, double-click table to exit editing
            </span>
          </div>
        )}

        {!isEditing && (
          <div className="text-center text-gray-500 text-sm mt-2">
            Double-click to edit table
          </div>
        )}
      </div>
    </div>
  );
};