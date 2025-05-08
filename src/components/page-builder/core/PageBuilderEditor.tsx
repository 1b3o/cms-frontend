// src/components/page-builder/core/PageBuilderEditor.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { PageBuilderToolbar } from '../components/PageBuilderToolbar';
import { PageBuilderCanvas } from '../components/PageBuilderCanvas';
import { ComponentPanel } from '../components/ComponentPanel';
import { SettingsPanel } from '../components/SettingsPanel';
import { RowTemplates } from '../components/RowTemplates';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FrontendRenderer } from './FrontendRenderer';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ComponentRegistry } from '../registry/ComponentRegistry';
import { registerAllComponents } from '../registry/components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Schema Definitions
export interface PageBuilderSchema {
  sections: Section[];
}

export interface Section {
  id: string;
  type: string;
  settings: {
    backgroundColor?: string;
    padding?: string;
    margin?: string;
    [key: string]: any;
  };
  rows: Row[];
}

export interface Row {
  id: string;
  settings: {
    padding?: string;
    margin?: string;
    [key: string]: any;
  };
  columns: Column[];
}

export interface Column {
  id: string;
  size: number;
  settings: {
    padding?: string;
    [key: string]: any;
  };
  components: Component[];
}

export interface Component {
  id: string;
  type: string;
  props: {
    [key: string]: any;
  };
  settings: {
    margin?: string;
    padding?: string;
    [key: string]: any;
  };
}

interface PageBuilderEditorProps {
  initialValue?: PageBuilderSchema;
  onChange?: (value: PageBuilderSchema) => void;
  readOnly?: boolean;
}

export function PageBuilderEditor({ 
  initialValue = { sections: [] }, 
  onChange,
  readOnly = false
}: PageBuilderEditorProps) {
  const [layout, setLayout] = useState<PageBuilderSchema>(initialValue);
  const [selectedElement, setSelectedElement] = useState<{
    type: 'section' | 'row' | 'column' | 'component';
    id: string;
    sectionId?: string;
    rowId?: string;
    columnId?: string;
  } | null>(null);
  const [activePanel, setActivePanel] = useState<'components' | 'settings'>('components');
  const [activeComponentId, setActiveComponentId] = useState<string | null>(null);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showRowTemplates, setShowRowTemplates] = useState<boolean>(false);
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'editor' | 'preview'>('editor');
  
  // Reference to the editor container for proper positioning
  const editorRef = useRef<HTMLDivElement>(null);

  // Register all components on initialization
  useEffect(() => {
    registerAllComponents();
  }, []);

  // Configure sensors for Drag & Drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleChange = (newLayout: PageBuilderSchema) => {
    setLayout(newLayout);
    onChange?.(newLayout);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveComponentId(active.id as string);
    
    // Add a visual indicator that dragging has started
    document.body.classList.add('dragging');
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    // Visual feedback for when dragging components
    if (active.data?.current?.type === 'component-type' && over.data?.current?.type === 'column') {
      // Remove highlight from all columns
      document.querySelectorAll('.drop-target-active').forEach(el => {
        el.classList.remove('drop-target-active');
      });
      
      // Highlight the current target column
      const targetEl = document.getElementById(over.id.toString());
      if (targetEl) {
        targetEl.classList.add('drop-target-active');
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveComponentId(null);
    
    // Remove dragging class
    document.body.classList.remove('dragging');
    
    // Remove visual feedback classes
    document.querySelectorAll('.drop-target-active').forEach(el => {
      el.classList.remove('drop-target-active');
    });
    
    if (!over) return;
    
    // Handle dropping a component from panel to column
    if (active.data?.current?.type === 'component-type' && over.data?.current?.type === 'column') {
      const componentType = active.data.current.componentType;
      const { sectionId, rowId, columnId } = over.data.current;
      
      // Add new component to column
      addComponentToColumn(componentType, sectionId, rowId, columnId);
    }
  };

  // Add a component to a column
  const addComponentToColumn = (componentType: string, sectionId: string, rowId: string, columnId: string) => {
    // Create a copy of the current layout
    const updatedLayout = JSON.parse(JSON.stringify(layout));
    
    // Get default props from the registry
    const defaultProps = ComponentRegistry.getDefaultProps(componentType);
    
    // Create new component
    const newComponent = {
      id: `component-${Date.now()}`,
      type: componentType,
      props: defaultProps,
      settings: {}
    };
    
    // Find the target column and add the component
    const section = updatedLayout.sections.find((s: Section) => s.id === sectionId);
    if (section) {
      const row = section.rows.find((r: Row) => r.id === rowId);
      if (row) {
        const column = row.columns.find((c: Column) => c.id === columnId);
        if (column) {
          column.components.push(newComponent);
          
          // Update layout
          handleChange(updatedLayout);
          
          // Select the new component
          setSelectedElement({
            type: 'component',
            id: newComponent.id,
            sectionId,
            rowId,
            columnId
          });
          
          // Show settings panel
          setActivePanel('settings');
        }
      }
    }
  };

  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      type: 'container',
      settings: {},
      rows: [],
    };

    const newLayout = {
      ...layout,
      sections: [...layout.sections, newSection],
    };
    
    handleChange(newLayout);
    setSelectedElement({
      type: 'section',
      id: newSection.id,
    });
    
    // Open row templates dialog for the new section
    setTargetSectionId(newSection.id);
    setShowRowTemplates(true);
  };
  
  // Handle adding a row from template
  const handleAddRowTemplate = (rowTemplate: Row) => {
    if (!targetSectionId) return;
    
    const updatedLayout = JSON.parse(JSON.stringify(layout));
    const section = updatedLayout.sections.find(s => s.id === targetSectionId);
    
    if (section) {
      section.rows.push(rowTemplate);
      handleChange(updatedLayout);
      
      // Select the new row
      setSelectedElement({
        type: 'row',
        id: rowTemplate.id,
        sectionId: targetSectionId
      });
    }
    
    // Close the dialog
    setShowRowTemplates(false);
    setTargetSectionId(null);
  };
  
  // Show row templates for a specific section
  const showRowTemplatesFor = (sectionId: string) => {
    setTargetSectionId(sectionId);
    setShowRowTemplates(true);
  };

  return (
    <div className="flex flex-col h-full" ref={editorRef}>
      <PageBuilderToolbar 
        onAddSection={addSection}
        activePanel={activePanel}
        onChangePanelView={(panel) => setActivePanel(panel)}
        deviceView={deviceView}
        onChangeDeviceView={setDeviceView}
        readOnly={readOnly}
        editMode={editMode}
        onChangeEditMode={setEditMode}
      />

      <Tabs 
        value={editMode} 
        className="flex-1 overflow-hidden"
        onValueChange={(value) => setEditMode(value as 'editor' | 'preview')}
      >
        <TabsList className="px-4 pt-2 bg-background border-b">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="flex flex-1 overflow-hidden m-0">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className={`flex-1 overflow-auto p-4 bg-muted/40 ${
              deviceView === 'desktop' ? 'max-w-full' : 
              deviceView === 'tablet' ? 'max-w-[768px] mx-auto' : 
              'max-w-[375px] mx-auto'
            }`}>
              {layout.sections.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                  <p className="text-muted-foreground mb-4">Keine Abschnitte vorhanden</p>
                  {!readOnly && (
                    <Button 
                      onClick={addSection}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                    >
                      Abschnitt hinzufügen
                    </Button>
                  )}
                </div>
              ) : (
                <PageBuilderCanvas 
                  layout={layout}
                  selectedElement={selectedElement}
                  onSelectElement={setSelectedElement}
                  onChange={handleChange}
                  onAddRowTemplate={showRowTemplatesFor}
                  readOnly={readOnly}
                />
              )}
            </div>

            <div className="w-80 border-l overflow-auto">
              {activePanel === 'components' ? (
                <ComponentPanel />
              ) : (
                <SettingsPanel 
                  selectedElement={selectedElement}
                  layout={layout}
                  onChange={handleChange}
                />
              )}
            </div>
          </DndContext>
        </TabsContent>
        
        <TabsContent value="preview" className="flex-1 overflow-auto m-0">
          <div className={`w-full mx-auto ${
            deviceView === 'desktop' ? 'max-w-full' : 
            deviceView === 'tablet' ? 'max-w-[768px]' : 
            'max-w-[375px]'
          }`}>
            <div className={deviceView === 'mobile' ? 'border-x border-gray-200 min-h-screen' : ''}>
              <FrontendRenderer layout={layout} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Row Templates Dialog */}
      <Dialog open={showRowTemplates} onOpenChange={setShowRowTemplates}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Zeilenlayout wählen</DialogTitle>
            <DialogDescription>
              Wählen Sie ein vorgefertigtes Spaltenlayout für Ihre neue Zeile
            </DialogDescription>
          </DialogHeader>
          
          <RowTemplates onSelectTemplate={handleAddRowTemplate} />
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowRowTemplates(false)}>
              Abbrechen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Add global styles for drag indicators */}
      <style jsx global>{`
        body.dragging {
          cursor: grabbing !important;
        }
        
        .drop-target-active {
          background-color: rgba(59, 130, 246, 0.1);
          border: 2px dashed rgb(59, 130, 246) !important;
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}