// src/components/page-builder/components/PageBuilderToolbar.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Settings, 
  Layers, 
  Eye, 
  Save, 
  Undo, 
  Redo, 
  Smartphone, 
  Tablet, 
  Monitor,
  Copy,
  Trash,
  Edit2,
} from 'lucide-react';

interface PageBuilderToolbarProps {
  onAddSection: () => void;
  activePanel: 'components' | 'settings';
  onChangePanelView: (panel: 'components' | 'settings') => void;
  deviceView: 'desktop' | 'tablet' | 'mobile';
  onChangeDeviceView: (view: 'desktop' | 'tablet' | 'mobile') => void;
  editMode: 'editor' | 'preview';
  onChangeEditMode: (mode: 'editor' | 'preview') => void;
  readOnly?: boolean;
}

export function PageBuilderToolbar({ 
  onAddSection, 
  activePanel, 
  onChangePanelView,
  deviceView,
  onChangeDeviceView,
  editMode,
  onChangeEditMode,
  readOnly = false
}: PageBuilderToolbarProps) {
  return (
    <div className="flex items-center justify-between p-2 border-b bg-background">
      <div className="flex items-center space-x-2">
        {!readOnly && (
          <Button variant="outline" size="sm" onClick={onAddSection}>
            <Plus className="h-4 w-4 mr-2" />
            Abschnitt
          </Button>
        )}
        
        <div className="border-l h-6 mx-2" />
        
        <Button 
          variant={activePanel === 'components' ? "default" : "outline"} 
          size="sm"
          onClick={() => onChangePanelView('components')}
          disabled={editMode === 'preview'}
        >
          <Layers className="h-4 w-4 mr-2" />
          Komponenten
        </Button>
        
        <Button 
          variant={activePanel === 'settings' ? "default" : "outline"} 
          size="sm"
          onClick={() => onChangePanelView('settings')}
          disabled={editMode === 'preview'}
        >
          <Settings className="h-4 w-4 mr-2" />
          Einstellungen
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex border rounded-md">
          <Button 
            variant={deviceView === 'mobile' ? "default" : "ghost"} 
            size="sm" 
            className="px-2"
            onClick={() => onChangeDeviceView('mobile')}
            title="Mobil-Ansicht"
          >
            <Smartphone className="h-4 w-4" />
          </Button>
          <Button 
            variant={deviceView === 'tablet' ? "default" : "ghost"} 
            size="sm" 
            className="px-2"
            onClick={() => onChangeDeviceView('tablet')}
            title="Tablet-Ansicht"
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button 
            variant={deviceView === 'desktop' ? "default" : "ghost"} 
            size="sm" 
            className="px-2"
            onClick={() => onChangeDeviceView('desktop')}
            title="Desktop-Ansicht"
          >
            <Monitor className="h-4 w-4" />
          </Button>
        </div>
        
        <Button 
          variant={editMode === 'preview' ? "default" : "outline"} 
          size="sm" 
          title="Vorschau"
          onClick={() => onChangeEditMode(editMode === 'preview' ? 'editor' : 'preview')}
        >
          {editMode === 'preview' ? (
            <>
              <Edit2 className="h-4 w-4 mr-2" />
              Editor
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Vorschau
            </>
          )}
        </Button>
        
        {!readOnly && editMode !== 'preview' && (
          <>
            <div className="border-l h-6 mx-2" />
            
            <Button variant="outline" size="sm" title="Rückgängig">
              <Undo className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" title="Wiederholen">
              <Redo className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" title="Duplizieren">
              <Copy className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" title="Löschen" className="text-destructive">
              <Trash className="h-4 w-4" />
            </Button>
            
            <Button variant="default" size="sm" title="Speichern">
              <Save className="h-4 w-4 mr-2" />
              Speichern
            </Button>
          </>
        )}
      </div>
    </div>
  );
}