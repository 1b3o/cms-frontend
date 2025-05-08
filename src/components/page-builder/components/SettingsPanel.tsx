// components/page-builder/SettingsPanel.tsx
'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageBuilderSchema, Component } from '../core/PageBuilderEditor';
import { Settings, Palette, Layout } from 'lucide-react';

interface SettingsPanelProps {
  selectedElement: {
    type: 'section' | 'row' | 'column' | 'component';
    id: string;
    sectionId?: string;
    rowId?: string;
    columnId?: string;
  } | null;
  layout: PageBuilderSchema;
  onChange: (layout: PageBuilderSchema) => void;
}

export function SettingsPanel({ selectedElement, layout, onChange }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = React.useState('content');
  
  if (!selectedElement) {
    return (
      <div className="h-full flex items-center justify-center p-4 text-center">
        <p className="text-muted-foreground">Wählen Sie ein Element aus, um dessen Einstellungen zu bearbeiten</p>
      </div>
    );
  }

  // Element finden
  let element: any = null;
  let elementType = '';
  let parentSection = null;
  let parentRow = null;
  let parentColumn = null;

  if (selectedElement.type === 'section') {
    element = layout.sections.find(s => s.id === selectedElement.id);
    elementType = 'Abschnitt';
  } else if (selectedElement.type === 'row') {
    parentSection = layout.sections.find(s => s.id === selectedElement.sectionId);
    if (parentSection) {
      element = parentSection.rows.find(r => r.id === selectedElement.id);
      elementType = 'Zeile';
    }
  } else if (selectedElement.type === 'column') {
    parentSection = layout.sections.find(s => s.id === selectedElement.sectionId);
    if (parentSection) {
      parentRow = parentSection.rows.find(r => r.id === selectedElement.rowId);
      if (parentRow) {
        element = parentRow.columns.find(c => c.id === selectedElement.id);
        elementType = 'Spalte';
      }
    }
  } else if (selectedElement.type === 'component') {
    parentSection = layout.sections.find(s => s.id === selectedElement.sectionId);
    if (parentSection) {
      parentRow = parentSection.rows.find(r => r.id === selectedElement.rowId);
      if (parentRow) {
        parentColumn = parentRow.columns.find(c => c.id === selectedElement.columnId);
        if (parentColumn) {
          element = parentColumn.components.find(c => c.id === selectedElement.id);
          if (element) {
            elementType = getComponentDisplayName(element.type);
          }
        }
      }
    }
  }

  if (!element) {
    return (
      <div className="h-full flex items-center justify-center p-4 text-center">
        <p className="text-muted-foreground">Element nicht gefunden</p>
      </div>
    );
  }

  // Einstellungen aktualisieren
  const updateElementSettings = (key: string, value: any) => {
    if (selectedElement.type === 'section') {
      const updatedSections = layout.sections.map(section => {
        if (section.id === selectedElement.id) {
          return {
            ...section,
            settings: {
              ...section.settings,
              [key]: value
            }
          };
        }
        return section;
      });
      
      onChange({
        ...layout,
        sections: updatedSections
      });
    } else if (selectedElement.type === 'row' && parentSection) {
      const updatedRows = parentSection.rows.map(row => {
        if (row.id === selectedElement.id) {
          return {
            ...row,
            settings: {
              ...row.settings,
              [key]: value
            }
          };
        }
        return row;
      });
      
      const updatedSections = layout.sections.map(section => {
        if (section.id === selectedElement.sectionId) {
          return {
            ...section,
            rows: updatedRows
          };
        }
        return section;
      });
      
      onChange({
        ...layout,
        sections: updatedSections
      });
    } else if (selectedElement.type === 'column' && parentSection && parentRow) {
      const updatedColumns = parentRow.columns.map(column => {
        if (column.id === selectedElement.id) {
          return {
            ...column,
            settings: {
              ...column.settings,
              [key]: value
            }
          };
        }
        return column;
      });
      
      const updatedRows = parentSection.rows.map(row => {
        if (row.id === selectedElement.rowId) {
          return {
            ...row,
            columns: updatedColumns
          };
        }
        return row;
      });
      
      const updatedSections = layout.sections.map(section => {
        if (section.id === selectedElement.sectionId) {
          return {
            ...section,
            rows: updatedRows
          };
        }
        return section;
      });
      
      onChange({
        ...layout,
        sections: updatedSections
      });
    } else if (selectedElement.type === 'component' && parentSection && parentRow && parentColumn) {
      const updatedComponents = parentColumn.components.map(component => {
        if (component.id === selectedElement.id) {
          return {
            ...component,
            settings: {
              ...component.settings,
              [key]: value
            }
          };
        }
        return component;
      });
      
      const updatedColumns = parentRow.columns.map(column => {
        if (column.id === selectedElement.columnId) {
          return {
            ...column,
            components: updatedComponents
          };
        }
        return column;
      });
      
      const updatedRows = parentSection.rows.map(row => {
        if (row.id === selectedElement.rowId) {
          return {
            ...row,
            columns: updatedColumns
          };
        }
        return row;
      });
      
      const updatedSections = layout.sections.map(section => {
        if (section.id === selectedElement.sectionId) {
          return {
            ...section,
            rows: updatedRows
          };
        }
        return section;
      });
      
      onChange({
        ...layout,
        sections: updatedSections
      });
    }
  };

  // Komponentenprops aktualisieren
  const updateComponentProps = (key: string, value: any) => {
    if (selectedElement.type === 'component' && parentSection && parentRow && parentColumn) {
      const updatedComponents = parentColumn.components.map(component => {
        if (component.id === selectedElement.id) {
          return {
            ...component,
            props: {
              ...component.props,
              [key]: value
            }
          };
        }
        return component;
      });
      
      const updatedColumns = parentRow.columns.map(column => {
        if (column.id === selectedElement.columnId) {
          return {
            ...column,
            components: updatedComponents
          };
        }
        return column;
      });
      
      const updatedRows = parentSection.rows.map(row => {
        if (row.id === selectedElement.rowId) {
          return {
            ...row,
            columns: updatedColumns
          };
        }
        return row;
      });
      
      const updatedSections = layout.sections.map(section => {
        if (section.id === selectedElement.sectionId) {
          return {
            ...section,
            rows: updatedRows
          };
        }
        return section;
      });
      
      onChange({
        ...layout,
        sections: updatedSections
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-medium flex items-center">
          <Settings className="h-4 w-4 mr-2" />
          {elementType} Einstellungen
        </h3>
      </div>
      
      <ScrollArea className="flex-1">
        {selectedElement.type === 'component' && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-4 pt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Inhalt</TabsTrigger>
                <TabsTrigger value="style">Stil</TabsTrigger>
                <TabsTrigger value="advanced">Erweitert</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="content" className="p-4 space-y-4">
              {renderComponentContentSettings(element as Component, updateComponentProps)}
            </TabsContent>
            
            <TabsContent value="style" className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="margin">Außenabstand</Label>
                <Input
                  id="margin"
                  value={element.settings.margin || '0px'}
                  onChange={(e) => updateElementSettings('margin', e.target.value)}
                  placeholder="z.B. 10px oder 1rem"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="padding">Innenabstand</Label>
                <Input
                  id="padding"
                  value={element.settings.padding || '0px'}
                  onChange={(e) => updateElementSettings('padding', e.target.value)}
                  placeholder="z.B. 10px oder 1rem"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Hintergrundfarbe</Label>
                <div className="flex gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={element.settings.backgroundColor || '#ffffff'}
                    onChange={(e) => updateElementSettings('backgroundColor', e.target.value)}
                    className="w-12 p-0"
                  />
                  <Input
                    value={element.settings.backgroundColor || '#ffffff'}
                    onChange={(e) => updateElementSettings('backgroundColor', e.target.value)}
                    placeholder="#ffffff"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="textAlign">Textausrichtung</Label>
                <Select
                  value={element.settings.textAlign || 'left'}
                  onValueChange={(value) => updateElementSettings('textAlign', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ausrichtung wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Links</SelectItem>
                    <SelectItem value="center">Zentriert</SelectItem>
                    <SelectItem value="right">Rechts</SelectItem>
                    <SelectItem value="justify">Blocksatz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customClasses">Benutzerdefinierte CSS-Klassen</Label>
                <Input
                  id="customClasses"
                  value={element.settings.customClasses || ''}
                  onChange={(e) => updateElementSettings('customClasses', e.target.value)}
                  placeholder="z.B. my-class another-class"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customId">Benutzerdefinierte ID</Label>
                <Input
                  id="customId"
                  value={element.settings.customId || ''}
                  onChange={(e) => updateElementSettings('customId', e.target.value)}
                  placeholder="z.B. my-element-id"
                />
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        {selectedElement.type === 'section' && (
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sectionType">Abschnittstyp</Label>
              <Select
                value={element.type || 'container'}
                onValueChange={(value) => {
                  const updatedSections = layout.sections.map(section => {
                    if (section.id === selectedElement.id) {
                      return {
                        ...section,
                        type: value
                      };
                    }
                    return section;
                  });
                  
                  onChange({
                    ...layout,
                    sections: updatedSections
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Typ wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="container">Container</SelectItem>
                  <SelectItem value="full-width">Volle Breite</SelectItem>
                  <SelectItem value="hero">Hero</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Hintergrundfarbe</Label>
              <div className="flex gap-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={element.settings.backgroundColor || '#ffffff'}
                  onChange={(e) => updateElementSettings('backgroundColor', e.target.value)}
                  className="w-12 p-0"
                />
                <Input
                  value={element.settings.backgroundColor || '#ffffff'}
                  onChange={(e) => updateElementSettings('backgroundColor', e.target.value)}
                  placeholder="#ffffff"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="padding">Innenabstand</Label>
              <Input
                id="padding"
                value={element.settings.padding || '1rem'}
                onChange={(e) => updateElementSettings('padding', e.target.value)}
                placeholder="z.B. 10px oder 1rem"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="margin">Außenabstand</Label>
              <Input
                id="margin"
                value={element.settings.margin || '0px'}
                onChange={(e) => updateElementSettings('margin', e.target.value)}
                placeholder="z.B. 10px oder 1rem"
              />
            </div>
          </div>
        )}
        
        {selectedElement.type === 'row' && (
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="padding">Innenabstand</Label>
              <Input
                id="padding"
                value={element.settings.padding || '0px'}
                onChange={(e) => updateElementSettings('padding', e.target.value)}
                placeholder="z.B. 10px oder 1rem"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="margin">Außenabstand</Label>
              <Input
                id="margin"
                value={element.settings.margin || '0px'}
                onChange={(e) => updateElementSettings('margin', e.target.value)}
                placeholder="z.B. 10px oder 1rem"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Hintergrundfarbe</Label>
              <div className="flex gap-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={element.settings.backgroundColor || '#ffffff'}
                  onChange={(e) => updateElementSettings('backgroundColor', e.target.value)}
                  className="w-12 p-0"
                />
                <Input
                  value={element.settings.backgroundColor || '#ffffff'}
                  onChange={(e) => updateElementSettings('backgroundColor', e.target.value)}
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>
        )}
        
        {selectedElement.type === 'column' && (
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="columnSize">Spaltenbreite</Label>
              <div className="flex items-center gap-2">
                <Slider
                  id="columnSize"
                  value={[element.size]}
                  min={1}
                  max={12}
                  step={1}
                  onValueChange={([value]) => {
                    const updatedColumns = parentRow?.columns.map(column => {
                      if (column.id === selectedElement.id) {
                        return {
                          ...column,
                          size: value
                        };
                      }
                      return column;
                    });
                    
                    if (parentRow && parentSection) {
                      const updatedRows = parentSection.rows.map(row => {
                        if (row.id === selectedElement.rowId) {
                          return {
                            ...row,
                            columns: updatedColumns || []
                          };
                        }
                        return row;
                      });
                      
                      const updatedSections = layout.sections.map(section => {
                        if (section.id === selectedElement.sectionId) {
                          return {
                            ...section,
                            rows: updatedRows
                          };
                        }
                        return section;
                      });
                      
                      onChange({
                        ...layout,
                        sections: updatedSections
                      });
                    }
                  }}
                  className="flex-1"
                />
                <span className="w-8 text-center">{element.size}/12</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="padding">Innenabstand</Label>
              <Input
                id="padding"
                value={element.settings.padding || '0px'}
                onChange={(e) => updateElementSettings('padding', e.target.value)}
                placeholder="z.B. 10px oder 1rem"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Hintergrundfarbe</Label>
              <div className="flex gap-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={element.settings.backgroundColor || '#ffffff'}
                  onChange={(e) => updateElementSettings('backgroundColor', e.target.value)}
                  className="w-12 p-0"
                />
                <Input
                  value={element.settings.backgroundColor || '#ffffff'}
                  onChange={(e) => updateElementSettings('backgroundColor', e.target.value)}
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// Hilfsfunktion zur Anzeige des Komponententyps
function getComponentDisplayName(type: string): string {
  switch (type) {
    case 'heading': return 'Überschrift';
    case 'text': return 'Text';
    case 'image': return 'Bild';
    case 'button': return 'Button';
    case 'divider': return 'Trennlinie';
    case 'spacer': return 'Abstand';
    case 'gallery': return 'Galerie';
    case 'video': return 'Video';
    case 'accordion': return 'Akkordeon';
    case 'tabs': return 'Tabs';
    case 'form': return 'Formular';
    default: return type;
  }
}

// Inhaltssettings für verschiedene Komponententypen
function renderComponentContentSettings(component: Component, updateProps: (key: string, value: any) => void) {
  switch (component.type) {
    case 'heading':
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="headingText">Überschriftentext</Label>
            <Input
              id="headingText"
              value={component.props.text || 'Überschrift'}
              onChange={(e) => updateProps('text', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="headingLevel">Überschriftenebene</Label>
            <Select
              value={component.props.level || 'h2'}
              onValueChange={(value) => updateProps('level', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ebene wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="h1">H1</SelectItem>
                <SelectItem value="h2">H2</SelectItem>
                <SelectItem value="h3">H3</SelectItem>
                <SelectItem value="h4">H4</SelectItem>
                <SelectItem value="h5">H5</SelectItem>
                <SelectItem value="h6">H6</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      );
    case 'text':
      return (
        <div className="space-y-2">
          <Label htmlFor="textContent">Text</Label>
          <textarea
            id="textContent"
            value={component.props.content || 'Text'}
            onChange={(e) => updateProps('content', e.target.value)}
            className="w-full h-32 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      );
    case 'image':
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="imageSrc">Bildquelle (URL)</Label>
            <Input
              id="imageSrc"
              value={component.props.src || '/placeholder.jpg'}
              onChange={(e) => updateProps('src', e.target.value)}
              placeholder="z.B. https://example.com/image.jpg"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="imageAlt">Alternativer Text</Label>
            <Input
              id="imageAlt"
              value={component.props.alt || 'Bild'}
              onChange={(e) => updateProps('alt', e.target.value)}
              placeholder="Bildbeschreibung für Screenreader"
            />
          </div>
        </>
      );
    case 'button':
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="buttonText">Button-Text</Label>
            <Input
              id="buttonText"
              value={component.props.text || 'Button'}
              onChange={(e) => updateProps('text', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="buttonLink">Link URL</Label>
            <Input
              id="buttonLink"
              value={component.props.link || '#'}
              onChange={(e) => updateProps('link', e.target.value)}
              placeholder="z.B. https://example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="buttonVariant">Button-Stil</Label>
            <Select
              value={component.props.variant || 'primary'}
              onValueChange={(value) => updateProps('variant', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Stil wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primär</SelectItem>
                <SelectItem value="secondary">Sekundär</SelectItem>
                <SelectItem value="outline">Umriss</SelectItem>
                <SelectItem value="ghost">Transparent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="buttonSize">Button-Größe</Label>
            <Select
              value={component.props.size || 'default'}
              onValueChange={(value) => updateProps('size', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Größe wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Klein</SelectItem>
                <SelectItem value="default">Standard</SelectItem>
                <SelectItem value="lg">Groß</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      );
    // Weitere Komponenteneinstellungen...
    default:
      return (
        <div className="p-4 text-center text-muted-foreground">
          Keine Einstellungen für diesen Komponententyp verfügbar
        </div>
      );
  }
}