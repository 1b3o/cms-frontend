// src/components/page-builder/registry/ComponentRegistry.tsx
'use client';

import React from 'react';

/**
 * Interface for component definitions
 */
export interface ComponentDefinition {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  defaultProps: Record<string, any>;
  render: (props: Record<string, any>, settings: Record<string, any>) => React.ReactNode;
}

/**
 * Registry for all available page builder components
 */
class ComponentRegistryClass {
  private components: Map<string, ComponentDefinition> = new Map();
  
  /**
   * Register a component in the registry
   */
  register(component: ComponentDefinition): void {
    if (this.components.has(component.id)) {
      console.warn(`Component with ID "${component.id}" already exists and will be overwritten.`);
    }
    this.components.set(component.id, component);
  }
  
  /**
   * Get a component by its ID
   */
  getComponent(id: string): ComponentDefinition | undefined {
    return this.components.get(id);
  }
  
  /**
   * Get all registered components
   */
  getAllComponents(): ComponentDefinition[] {
    return Array.from(this.components.values());
  }
  
  /**
   * Get components by category
   */
  getComponentsByCategory(category: string): ComponentDefinition[] {
    return this.getAllComponents().filter(component => component.category === category);
  }
  
  /**
   * Get the default props for a component type
   */
  getDefaultProps(componentType: string): Record<string, any> {
    const component = this.getComponent(componentType);
    return component ? { ...component.defaultProps } : {};
  }
  
  /**
   * Render a component with the given props and settings
   */
  renderComponent(type: string, props: Record<string, any> = {}, settings: Record<string, any> = {}): React.ReactNode {
    const component = this.getComponent(type);
    if (!component) {
      return <div className="p-2 text-muted-foreground">Unknown component: {type}</div>;
    }
    
    return component.render({ ...props }, { ...settings });
  }
}

// Singleton instance
export const ComponentRegistry = new ComponentRegistryClass();