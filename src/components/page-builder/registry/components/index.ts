// src/components/page-builder/registry/components/index.ts
import { ComponentRegistry } from '../ComponentRegistry';

// Import component definitions
import { HeadingComponent } from './HeadingComponent';
import { TextComponent } from './TextComponent';
import { ButtonComponent } from './ButtonComponent';
import { ImageComponent } from './ImageComponent';
import { DividerComponent } from './DividerComponent';
import { SpacerComponent } from './SpacerComponent';
import { ContentListComponent } from './ContentListComponent';

// Define component categories
export const COMPONENT_CATEGORIES = {
  LAYOUT: 'layout',
  CONTENT: 'content',
  MEDIA: 'media',
  INTERACTIVE: 'interactive'
};

// Register all components
export function registerAllComponents() {
  // Layout components
  ComponentRegistry.register({
    ...DividerComponent,
    category: COMPONENT_CATEGORIES.LAYOUT
  });
  
  ComponentRegistry.register({
    ...SpacerComponent,
    category: COMPONENT_CATEGORIES.LAYOUT
  });
  
  // Content components
  ComponentRegistry.register({
    ...HeadingComponent,
    category: COMPONENT_CATEGORIES.CONTENT
  });
  
  ComponentRegistry.register({
    ...TextComponent,
    category: COMPONENT_CATEGORIES.CONTENT
  });
  
  ComponentRegistry.register({
    ...ButtonComponent,
    category: COMPONENT_CATEGORIES.INTERACTIVE
  });
  
  // Media components
  ComponentRegistry.register({
    ...ImageComponent,
    category: COMPONENT_CATEGORIES.MEDIA
  });
  
  // Dynamic components
  ComponentRegistry.register({
    ...ContentListComponent,
    category: COMPONENT_CATEGORIES.CONTENT
  });
  
  console.log('All components registered successfully');
}