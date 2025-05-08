// components/page-builder/components/Row.tsx
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Row, Column } from '../core/PageBuilderEditor';

interface RowComponentProps {
  row: Row;
  sectionId: string;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (row: Row) => void;
  onDelete: () => void;
  onAddColumn: () => void;
  readOnly?: boolean;
}

export function RowComponent({
  row,
  sectionId,
  isSelected,
  onSelect,
  onChange,
  onDelete,
  onAddColumn,
  readOnly = false
}: RowComponentProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
    disabled: readOnly,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative border ${isSelected ? 'border-primary' : 'border-dashed border-muted-foreground/30'} p-4 my-4 group`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {!readOnly && (
        <div className="absolute top-0 right-0 p-2 bg-background/80 rounded-bl-md z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <button 
            className="p-1 text-muted-foreground hover:text-foreground" 
            {...attributes} 
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <button 
            className="p-1 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onAddColumn();
            }}
          >
            <Plus className="h-4 w-4" />
          </button>
          <button 
            className="p-1 text-destructive/70 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        {row.columns.map((column) => (
          <ColumnComponent
            key={column.id}
            column={column}
            sectionId={sectionId}
            rowId={row.id}
            onChange={(updatedColumn) => {
              const updatedColumns = row.columns.map((c) =>
                c.id === updatedColumn.id ? updatedColumn : c
              );
              onChange({ ...row, columns: updatedColumns });
            }}
            onDelete={() => {
              // Delete column logic
              const updatedColumns = row.columns.filter((c) => c.id !== column.id);
              onChange({ ...row, columns: updatedColumns });
            }}
            readOnly={readOnly}
          />
        ))}

        {row.columns.length === 0 && (
          <div className="flex items-center justify-center h-24 w-full border-2 border-dashed border-muted-foreground/20 rounded-lg">
            <p className="text-muted-foreground">Leere Zeile - Fügen Sie Spalten hinzu</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface ColumnComponentProps {
  column: Column;
  sectionId: string;
  rowId: string;
  onChange: (column: Column) => void;
  onDelete: () => void;
  readOnly?: boolean;
}

export function ColumnComponent({
  column,
  sectionId,
  rowId,
  onChange,
  onDelete,
  readOnly = false
}: ColumnComponentProps) {
  // Calculate column width based on size (out of 12-column grid)
  const colWidth = `${(column.size / 12) * 100}%`;

  return (
    <div
      className="relative border border-dashed border-muted-foreground/30 rounded p-2 group"
      style={{ flexBasis: colWidth, minHeight: '100px' }}
      onClick={(e) => e.stopPropagation()}
    >
      {!readOnly && (
        <div className="absolute top-0 right-0 p-1 bg-background/80 rounded-bl-md z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            className="p-1 text-destructive/70 hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}

      {column.components.length === 0 ? (
        <div className="flex items-center justify-center h-full w-full border-2 border-dashed border-muted-foreground/20 rounded-lg">
          <p className="text-muted-foreground text-xs">Leere Spalte</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Components would be rendered here */}
          <p className="text-xs text-muted-foreground">{column.components.length} Komponenten</p>
        </div>
      )}
    </div>
  );
}