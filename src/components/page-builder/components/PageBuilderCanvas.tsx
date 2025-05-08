// src/components/page-builder/components/PageBuilderCanvas.tsx
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { PageBuilderSchema, Section, Row, Column, Component } from '../core/PageBuilderEditor';
import { ComponentRegistry } from '../registry/ComponentRegistry';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Pencil, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageBuilderCanvasProps {
  layout: PageBuilderSchema;
  selectedElement: {
    type: 'section' | 'row' | 'column' | 'component';
    id: string;
    sectionId?: string;
    rowId?: string;
    columnId?: string;
  } | null;
  onSelectElement: (element: {
    type: 'section' | 'row' | 'column' | 'component';
    id: string;
    sectionId?: string;
    rowId?: string;
    columnId?: string;
  } | null) => void;
  onChange: (layout: PageBuilderSchema) => void;
  onAddRowTemplate: (sectionId: string) => void;
  readOnly?: boolean;
}

export function PageBuilderCanvas({
  layout,
  selectedElement,
  onSelectElement,
  onChange,
  onAddRowTemplate,
  readOnly = false
}: PageBuilderCanvasProps) {
  return (
    <div className="space-y-8">
      {layout.sections.map((section) => (
        <SectionComponent
          key={section.id}
          section={section}
          isSelected={selectedElement?.type === 'section' && selectedElement.id === section.id}
          onSelect={() => onSelectElement({ type: 'section', id: section.id })}
          onChange={(updatedSection) => {
            const updatedSections = layout.sections.map((s) =>
              s.id === updatedSection.id ? updatedSection : s
            );
            onChange({ ...layout, sections: updatedSections });
          }}
          onDelete={() => {
            const updatedSections = layout.sections.filter((s) => s.id !== section.id);
            onChange({ ...layout, sections: updatedSections });
            if (selectedElement?.type === 'section' && selectedElement.id === section.id) {
              onSelectElement(null);
            }
          }}
          selectedElement={selectedElement}
          onSelectElement={onSelectElement}
          onAddRowTemplate={onAddRowTemplate}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}

interface SectionComponentProps {
  section: Section;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (section: Section) => void;
  onDelete: () => void;
  selectedElement: {
    type: 'section' | 'row' | 'column' | 'component';
    id: string;
    sectionId?: string;
    rowId?: string;
    columnId?: string;
  } | null;
  onSelectElement: (element: {
    type: 'section' | 'row' | 'column' | 'component';
    id: string;
    sectionId?: string;
    rowId?: string;
    columnId?: string;
  } | null) => void;
  onAddRowTemplate: (sectionId: string) => void;
  readOnly?: boolean;
}

function SectionComponent({
  section,
  isSelected,
  onSelect,
  onChange,
  onDelete,
  selectedElement,
  onSelectElement,
  onAddRowTemplate,
  readOnly = false
}: SectionComponentProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    disabled: readOnly,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
  };

  const bgColor = section.settings.backgroundColor || 'transparent';
  const padding = section.settings.padding || '1rem';
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative border ${isSelected ? 'border-primary' : 'border-dashed border-muted-foreground/20'} group rounded-md overflow-hidden`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {!readOnly && (
        <div className="absolute top-0 right-0 p-1 bg-background/90 rounded-bl-md flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button className="p-1 text-muted-foreground hover:text-foreground" {...attributes} {...listeners}>
            <GripVertical className="h-4 w-4" />
          </button>
          <button 
            className="p-1 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onAddRowTemplate(section.id);
            }}
            title="Zeile hinzufügen"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button 
            className="p-1 text-destructive/70 hover:text-destructive" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Abschnitt löschen"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      <div
        className="p-4 min-h-[100px] group"
        style={{ backgroundColor: bgColor, padding }}
      >
        {section.rows.length === 0 ? (
          <div className="flex items-center justify-center h-24 border-2 border-dashed border-muted-foreground/20 rounded-lg">
            {!readOnly ? (
              <button 
                className="text-muted-foreground hover:text-foreground p-4"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddRowTemplate(section.id);
                }}
              >
                <LayoutGrid className="h-8 w-8 mx-auto mb-2" />
                <span className="block">Spalten-Layout wählen</span>
              </button>
            ) : (
              <p className="text-muted-foreground">Leerer Abschnitt</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {section.rows.map((row) => (
              <RowComponent
                key={row.id}
                row={row}
                sectionId={section.id}
                isSelected={selectedElement?.type === 'row' && selectedElement.id === row.id}
                onSelect={() => onSelectElement({
                  type: 'row',
                  id: row.id,
                  sectionId: section.id
                })}
                onChange={(updatedRow) => {
                  const updatedRows = section.rows.map((r) =>
                    r.id === updatedRow.id ? updatedRow : r
                  );
                  onChange({
                    ...section,
                    rows: updatedRows
                  });
                }}
                onDelete={() => {
                  const updatedRows = section.rows.filter((r) => r.id !== row.id);
                  onChange({
                    ...section,
                    rows: updatedRows
                  });
                  
                  if (selectedElement?.type === 'row' && selectedElement.id === row.id) {
                    onSelectElement(null);
                  }
                }}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                readOnly={readOnly}
              />
            ))}
            
            {!readOnly && (
              <div className="flex justify-center pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddRowTemplate(section.id);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Zeile hinzufügen
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface RowComponentProps {
  row: Row;
  sectionId: string;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (row: Row) => void;
  onDelete: () => void;
  selectedElement: {
    type: 'section' | 'row' | 'column' | 'component';
    id: string;
    sectionId?: string;
    rowId?: string;
    columnId?: string;
  } | null;
  onSelectElement: (element: {
    type: 'section' | 'row' | 'column' | 'component';
    id: string;
    sectionId?: string;
    rowId?: string;
    columnId?: string;
  } | null) => void;
  readOnly?: boolean;
}

function RowComponent({
  row,
  sectionId,
  isSelected,
  onSelect,
  onChange,
  onDelete,
  selectedElement,
  onSelectElement,
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
      className={`relative ${isSelected ? 'outline outline-2 outline-primary' : 'border border-dashed border-muted-foreground/30'} p-4 rounded-md group transition-all hover:shadow-sm`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {!readOnly && (
        <div className="absolute top-2 right-2 p-1 bg-background/90 rounded-md z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button 
            className="p-1 text-muted-foreground hover:text-foreground" 
            {...attributes} 
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
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

      <div className="flex flex-wrap gap-3">
        {row.columns.map((column) => (
          <ColumnComponent
            key={column.id}
            column={column}
            sectionId={sectionId}
            rowId={row.id}
            isSelected={selectedElement?.type === 'column' && selectedElement.id === column.id}
            onSelect={() => onSelectElement({
              type: 'column',
              id: column.id,
              sectionId,
              rowId: row.id
            })}
            onChange={(updatedColumn) => {
              const updatedColumns = row.columns.map((c) =>
                c.id === updatedColumn.id ? updatedColumn : c
              );
              onChange({ ...row, columns: updatedColumns });
            }}
            onDelete={() => {
              // Delete column and adjust remaining column widths
              const remainingColumns = row.columns.filter((c) => c.id !== column.id);
              const updatedColumns = remainingColumns.map(c => ({
                ...c,
                size: 12 / (remainingColumns.length > 0 ? remainingColumns.length : 1)
              }));
              
              onChange({ ...row, columns: updatedColumns });
              
              if (selectedElement?.type === 'column' && selectedElement.id === column.id) {
                onSelectElement(null);
              }
            }}
            onResizeColumn={(newSize) => {
              // Adjust column width
              const updatedColumns = row.columns.map((c) =>
                c.id === column.id ? { ...c, size: newSize } : c
              );
              onChange({ ...row, columns: updatedColumns });
            }}
            selectedElement={selectedElement}
            onSelectElement={onSelectElement}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}

interface ColumnComponentProps {
  column: Column;
  sectionId: string;
  rowId: string;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (column: Column) => void;
  onDelete: () => void;
  onResizeColumn: (newSize: number) => void;
  selectedElement: {
    type: 'section' | 'row' | 'column' | 'component';
    id: string;
    sectionId?: string;
    rowId?: string;
    columnId?: string;
  } | null;
  onSelectElement: (element: {
    type: 'section' | 'row' | 'column' | 'component';
    id: string;
    sectionId?: string;
    rowId?: string;
    columnId?: string;
  } | null) => void;
  readOnly?: boolean;
}

function ColumnComponent({
  column,
  sectionId,
  rowId,
  isSelected,
  onSelect,
  onChange,
  onDelete,
  onResizeColumn,
  selectedElement,
  onSelectElement,
  readOnly = false
}: ColumnComponentProps) {
  // Make column droppable
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      sectionId,
      rowId,
      columnId: column.id
    }
  });
  
  // Calculate column width based on size
  const colWidth = `${(column.size / 12) * 100}%`;

  return (
    <div
      id={column.id} // Important! This ID is used for highlighting drop targets
      ref={setNodeRef}
      className={`relative ${isSelected ? 'outline outline-2 outline-primary' : ''} 
        ${isOver ? 'bg-primary/10' : ''} 
        border border-dashed border-gray-200 rounded-md p-3 group
        transition-colors duration-200`}
      style={{ 
        flexBasis: colWidth, 
        maxWidth: colWidth, 
        minHeight: '80px'
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {!readOnly && (
        <div className="absolute top-1 right-1 p-1 bg-background/90 rounded-md z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button 
            className="p-1 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              // Increase width by 1 (max 12)
              const newSize = Math.min(12, column.size + 1);
              onResizeColumn(newSize);
            }}
            title="Breiter"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button 
            className="p-1 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              // Decrease width by 1 (min 1)
              const newSize = Math.max(1, column.size - 1);
              onResizeColumn(newSize);
            }}
            title="Schmaler"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
          <button 
            className="p-1 text-destructive/70 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Spalte löschen"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}

      {column.components.length === 0 ? (
        <div className="flex items-center justify-center h-full min-h-[80px] w-full border border-dashed border-gray-200 rounded-md bg-gray-50/50">
          <p className="text-muted-foreground text-xs text-center p-4">
            Komponenten hier<br />hineinziehen
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {column.components.map((component) => (
            <ComponentItem
              key={component.id}
              component={component}
              sectionId={sectionId}
              rowId={rowId}
              columnId={column.id}
              isSelected={selectedElement?.type === 'component' && selectedElement.id === component.id}
              onSelect={() => onSelectElement({
                type: 'component',
                id: component.id,
                sectionId,
                rowId,
                columnId: column.id
              })}
              onChange={(updatedComponent) => {
                const updatedComponents = column.components.map((c) =>
                  c.id === updatedComponent.id ? updatedComponent : c
                );
                onChange({ ...column, components: updatedComponents });
              }}
              onDelete={() => {
                const updatedComponents = column.components.filter((c) => c.id !== component.id);
                onChange({ ...column, components: updatedComponents });
                
                if (selectedElement?.type === 'component' && selectedElement.id === component.id) {
                  onSelectElement(null);
                }
              }}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ComponentItemProps {
  component: Component;
  sectionId: string;
  rowId: string;
  columnId: string;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (component: Component) => void;
  onDelete: () => void;
  readOnly?: boolean;
}

function ComponentItem({
  component,
  sectionId,
  rowId,
  columnId,
  isSelected,
  onSelect,
  onChange,
  onDelete,
  readOnly = false
}: ComponentItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.id,
    data: {
      type: 'component',
      componentId: component.id,
      sectionId,
      rowId,
      columnId
    },
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
      className={`relative ${isSelected ? 'outline outline-2 outline-primary' : ''} 
        p-3 border border-gray-200 hover:border-gray-300 
        group rounded-md transition-all hover:shadow-sm bg-white`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {!readOnly && (
        <div className="absolute top-1 right-1 p-1 bg-background/90 rounded-md z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button 
            className="p-1 text-muted-foreground hover:text-foreground" 
            {...attributes} 
            {...listeners}
            title="Verschieben"
          >
            <GripVertical className="h-3 w-3" />
          </button>
          <button 
            className="p-1 text-muted-foreground hover:text-foreground" 
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            title="Bearbeiten"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button 
            className="p-1 text-destructive/70 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Löschen"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}
      
      <div className="pt-1">
        {/* Render the component using the registry */}
        {ComponentRegistry.renderComponent(
          component.type,
          component.props,
          component.settings
        )}
      </div>
    </div>
  );
}