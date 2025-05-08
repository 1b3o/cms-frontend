// src/components/page-builder/components/ComponentPanel.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Layout, Type, Image, BarChart3, Layers } from 'lucide-react';
import { ComponentRegistry } from '../registry/ComponentRegistry';
import { COMPONENT_CATEGORIES } from '../registry/components';

// Map categories to UI elements
const CATEGORY_UI = {
  [COMPONENT_CATEGORIES.LAYOUT]: {
    id: 'layout',
    name: 'Layout',
    icon: <Layout className="h-4 w-4" />
  },
  [COMPONENT_CATEGORIES.CONTENT]: { 
    id: 'content',
    name: 'Inhalt',
    icon: <Type className="h-4 w-4" />
  },
  [COMPONENT_CATEGORIES.MEDIA]: {
    id: 'media',
    name: 'Medien',
    icon: <Image className="h-4 w-4" />
  },
  [COMPONENT_CATEGORIES.INTERACTIVE]: {
    id: 'interactive',
    name: 'Interaktiv',
    icon: <BarChart3 className="h-4 w-4" />
  }
};

function DraggableComponentItem({ 
  component
}: { 
  component: {
    id: string;
    name: string;
    icon: React.ReactNode;
    category: string;
  }
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `component-type-${component.id}`,
    data: {
      type: 'component-type',
      componentType: component.id,
      componentName: component.name,
      category: component.category
    }
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 999,
    opacity: isDragging ? 0.8 : 1
  } : undefined;
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex flex-col items-center justify-center p-2 border rounded-md cursor-move hover:bg-muted transition-colors"
    >
      <div className="w-8 h-8 flex items-center justify-center text-muted-foreground mb-1">
        {component.icon}
      </div>
      <span className="text-xs text-center">{component.name}</span>
    </div>
  );
}

interface ComponentPanelProps {}

export function ComponentPanel({}: ComponentPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(COMPONENT_CATEGORIES.LAYOUT);
  const [componentsByCategory, setComponentsByCategory] = useState<Record<string, any[]>>({});
  
  // Initialize component categories
  useEffect(() => {
    const categorizedComponents: Record<string, any[]> = {};
    
    // Get all registered components from the registry
    const allComponents = ComponentRegistry.getAllComponents();
    
    // Group components by category
    allComponents.forEach(component => {
      if (!categorizedComponents[component.category]) {
        categorizedComponents[component.category] = [];
      }
      
      categorizedComponents[component.category].push({
        id: component.id,
        name: component.name,
        icon: component.icon,
        category: component.category
      });
    });
    
    setComponentsByCategory(categorizedComponents);
  }, []);
  
  // Filter components by search term
  const getFilteredComponents = (category: string) => {
    const components = componentsByCategory[category] || [];
    
    if (!searchTerm) return components;
    
    return components.filter(comp => 
      comp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-medium mb-2 flex items-center">
          <Layers className="h-4 w-4 mr-2" />
          Komponenten
        </h3>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Komponenten suchen..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs 
            defaultValue={activeCategory} 
            onValueChange={setActiveCategory}
          >
            <TabsList className="grid grid-cols-4 mb-4">
              {Object.entries(CATEGORY_UI).map(([category, { id, name, icon }]) => (
                <TabsTrigger 
                  key={category} 
                  value={category} 
                  className="flex flex-col items-center py-2 px-1"
                >
                  {icon}
                  <span className="text-[10px] mt-1">{name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {Object.keys(CATEGORY_UI).map((category) => (
              <TabsContent key={category} value={category} className="mt-0">
                <div className="grid grid-cols-2 gap-2">
                  {getFilteredComponents(category).map(component => (
                    <DraggableComponentItem
                      key={component.id}
                      component={component}
                    />
                  ))}
                </div>
                
                {getFilteredComponents(category).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    {searchTerm ? 
                      'Keine Komponenten gefunden' : 
                      'Keine Komponenten in dieser Kategorie'
                    }
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Komponenten per Drag & Drop in den Layout-Bereich ziehen
        </p>
      </div>
    </div>
  );
}