import React, { useState } from 'react';
import { Copy, Trash2, Scissors } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onDuplicate,
  onDelete,
  onClose,
}) => {
  return (
    <>
      {/* Backdrop to close menu */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Context Menu */}
      <div
        className="fixed z-50 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 min-w-[160px]"
        style={{ left: `${x}px`, top: `${y}px` }}
      >
        <button
          onClick={() => {
            onDuplicate();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700 flex items-center gap-2 transition-colors"
        >
          <Copy className="w-4 h-4" />
          Duplicate
        </button>

        <div className="h-px bg-gray-700 my-1" />

        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </>
  );
};
