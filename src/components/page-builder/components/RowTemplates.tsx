// src/components/page-builder/components/RowTemplates.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Row } from '../core/PageBuilderEditor';

interface RowTemplatesProps {
  onSelectTemplate: (template: Row) => void;
}

// Predefined column layouts based on popular designs
const ROW_TEMPLATES = [
  {
    id: 'single-column',
    name: '1 Column',
    icon: (
      <div className="flex w-full h-6 gap-1">
        <div className="flex-1 bg-primary/20 rounded"></div>
      </div>
    ),
    columns: [{ size: 12 }]
  },
  {
    id: 'two-columns-equal',
    name: '2 Columns (Equal)',
    icon: (
      <div className="flex w-full h-6 gap-1">
        <div className="flex-1 bg-primary/20 rounded"></div>
        <div className="flex-1 bg-primary/20 rounded"></div>
      </div>
    ),
    columns: [{ size: 6 }, { size: 6 }]
  },
  {
    id: 'two-columns-wide-left',
    name: '2 Columns (Wide Left)',
    icon: (
      <div className="flex w-full h-6 gap-1">
        <div className="flex-[2] bg-primary/20 rounded"></div>
        <div className="flex-1 bg-primary/20 rounded"></div>
      </div>
    ),
    columns: [{ size: 8 }, { size: 4 }]
  },
  {
    id: 'two-columns-wide-right',
    name: '2 Columns (Wide Right)',
    icon: (
      <div className="flex w-full h-6 gap-1">
        <div className="flex-1 bg-primary/20 rounded"></div>
        <div className="flex-[2] bg-primary/20 rounded"></div>
      </div>
    ),
    columns: [{ size: 4 }, { size: 8 }]
  },
  {
    id: 'three-columns-equal',
    name: '3 Columns (Equal)',
    icon: (
      <div className="flex w-full h-6 gap-1">
        <div className="flex-1 bg-primary/20 rounded"></div>
        <div className="flex-1 bg-primary/20 rounded"></div>
        <div className="flex-1 bg-primary/20 rounded"></div>
      </div>
    ),
    columns: [{ size: 4 }, { size: 4 }, { size: 4 }]
  },
  {
    id: 'three-columns-wide-center',
    name: '3 Columns (Wide Center)',
    icon: (
      <div className="flex w-full h-6 gap-1">
        <div className="flex-1 bg-primary/20 rounded"></div>
        <div className="flex-[2] bg-primary/20 rounded"></div>
        <div className="flex-1 bg-primary/20 rounded"></div>
      </div>
    ),
    columns: [{ size: 3 }, { size: 6 }, { size: 3 }]
  },
  {
    id: 'four-columns-equal',
    name: '4 Columns (Equal)',
    icon: (
      <div className="flex w-full h-6 gap-1">
        <div className="flex-1 bg-primary/20 rounded"></div>
        <div className="flex-1 bg-primary/20 rounded"></div>
        <div className="flex-1 bg-primary/20 rounded"></div>
        <div className="flex-1 bg-primary/20 rounded"></div>
      </div>
    ),
    columns: [{ size: 3 }, { size: 3 }, { size: 3 }, { size: 3 }]
  },
  {
    id: 'five-columns-equal',
    name: '5 Columns (Equal)',
    icon: (
      <div className="flex w-full h-6 gap-[2px]">
        <div className="flex-1 bg-primary/20 rounded-sm"></div>
        <div className="flex-1 bg-primary/20 rounded-sm"></div>
        <div className="flex-1 bg-primary/20 rounded-sm"></div>
        <div className="flex-1 bg-primary/20 rounded-sm"></div>
        <div className="flex-1 bg-primary/20 rounded-sm"></div>
      </div>
    ),
    columns: [{ size: 2.4 }, { size: 2.4 }, { size: 2.4 }, { size: 2.4 }, { size: 2.4 }]
  },
  {
    id: 'six-columns-equal',
    name: '6 Columns (Equal)',
    icon: (
      <div className="flex w-full h-6 gap-[2px]">
        <div className="flex-1 bg-primary/20 rounded-sm"></div>
        <div className="flex-1 bg-primary/20 rounded-sm"></div>
        <div className="flex-1 bg-primary/20 rounded-sm"></div>
        <div className="flex-1 bg-primary/20 rounded-sm"></div>
        <div className="flex-1 bg-primary/20 rounded-sm"></div>
        <div className="flex-1 bg-primary/20 rounded-sm"></div>
      </div>
    ),
    columns: [{ size: 2 }, { size: 2 }, { size: 2 }, { size: 2 }, { size: 2 }, { size: 2 }]
  }
];

export function RowTemplates({ onSelectTemplate }: RowTemplatesProps) {
  const createRowFromTemplate = (templateId: string) => {
    const template = ROW_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    
    const newRow: Row = {
      id: `row-${Date.now()}`,
      settings: {},
      columns: template.columns.map((col, index) => ({
        id: `column-${Date.now()}-${index}`,
        size: col.size,
        settings: {},
        components: []
      }))
    };
    
    onSelectTemplate(newRow);
  };

  return (
    <div className="p-4 grid grid-cols-3 gap-3">
      <TooltipProvider>
        {ROW_TEMPLATES.map((template) => (
          <Tooltip key={template.id}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="h-16 flex flex-col items-center justify-center w-full p-2 hover:border-primary"
                onClick={() => createRowFromTemplate(template.id)}
              >
                <div className="w-full mb-2">{template.icon}</div>
                <span className="text-xs">{template.name}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{template.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}