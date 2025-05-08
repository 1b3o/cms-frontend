// src/components/page-builder/core/FrontendRenderer.tsx
'use client';

import React, { JSX } from 'react';
import { PageBuilderSchema, Section, Row, Column, Component } from './PageBuilderEditor';
import { ComponentRegistry } from '../registry/ComponentRegistry';
import { registerAllComponents } from '../registry/components';

interface FrontendRendererProps {
  layout: PageBuilderSchema;
  className?: string;
}

// Simple components for server-side rendering when ComponentRegistry isn't available
const SimpleComponents = {
  heading: (props: any, settings: any) => {
    const { text = 'Heading', level = 'h2' } = props;
    const Tag = level as keyof JSX.IntrinsicElements;
    const headingClasses = {
      h1: 'text-4xl font-bold',
      h2: 'text-3xl font-bold',
      h3: 'text-2xl font-bold',
      h4: 'text-xl font-bold',
      h5: 'text-lg font-bold',
      h6: 'text-base font-bold'
    };
    
    return React.createElement(
      level,
      { 
        className: headingClasses[level as keyof typeof headingClasses],
        style: {
          margin: settings.margin || '0',
          padding: settings.padding || '0',
          textAlign: settings.textAlign as React.CSSProperties['textAlign'] || 'left',
        }
      },
      text
    );
  },
  
  text: (props: any, settings: any) => {
    const { content = 'Text', fontSize = 'base' } = props;
    const fontSizeClasses = {
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl'
    };
    
    return (
      <p 
        className={fontSizeClasses[fontSize as keyof typeof fontSizeClasses] || 'text-base'}
        style={{
          margin: settings.margin || '0',
          padding: settings.padding || '0',
          textAlign: settings.textAlign as React.CSSProperties['textAlign'] || 'left'
        }}
      >
        {content}
      </p>
    );
  },
  
  image: (props: any, settings: any) => {
    const { src = '/placeholder.jpg', alt = 'Image' } = props;
    
    return (
      <div style={{
        margin: settings.margin || '0',
        padding: settings.padding || '0'
      }}>
        <img 
          src={src} 
          alt={alt}
          style={{
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
            margin: '0 auto'
          }}
        />
      </div>
    );
  },
  
  button: (props: any, settings: any) => {
    const { text = 'Button', link = '#', variant = 'primary', size = 'default' } = props;
    const variantClasses = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground'
    };
    
    const sizeClasses = {
      sm: 'h-8 px-3 text-xs',
      default: 'h-10 px-4 py-2',
      lg: 'h-12 px-6 text-lg'
    };
    
    return (
      <div style={{
        margin: settings.margin || '0',
        padding: settings.padding || '0',
        textAlign: settings.textAlign as React.CSSProperties['textAlign'] || 'left'
      }}>
        <a 
          href={link}
          className={`inline-flex items-center justify-center rounded-md font-medium transition-colors ${
            variantClasses[variant as keyof typeof variantClasses] || variantClasses.primary
          } ${
            sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.default
          }`}
        >
          {text}
        </a>
      </div>
    );
  },
  
  divider: (props: any, settings: any) => {
    const { thickness = '1px', style = 'solid', color = '#e2e8f0' } = props;
    
    return (
      <hr style={{
        borderTop: `${thickness} ${style} ${color}`,
        margin: settings.margin || '1rem 0',
        padding: settings.padding || '0'
      }} />
    );
  },
  
  spacer: (props: any, settings: any) => {
    const { height = '2rem' } = props;
    
    return (
      <div style={{
        height,
        width: '100%',
        margin: settings.margin || '0',
        padding: settings.padding || '0'
      }} aria-hidden="true" />
    );
  },
  
  'content-list': (props: any, settings: any) => {
    return (
      <div style={{
        margin: settings.margin || '0',
        padding: settings.padding || '0'
      }}>
        <div className="p-4 border rounded-md">
          <h3 className="text-lg font-medium mb-2">Inhaltsliste</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Zeigt aktuelle Inhalte an
          </p>
        </div>
      </div>
    );
  }
};

// Force registration of components on client-side
let componentsRegistered = false;

export function FrontendRenderer({ layout, className = '' }: FrontendRendererProps) {
  // Register components if we're on the client side and haven't registered them yet
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !componentsRegistered) {
      registerAllComponents();
      componentsRegistered = true;
    }
  }, []);

  if (!layout || !layout.sections || layout.sections.length === 0) {
    return null;
  }

  return (
    <div className={`page-content ${className}`}>
      {layout.sections.map((section) => (
        <RenderSection key={section.id} section={section} />
      ))}
    </div>
  );
}

function RenderSection({ section }: { section: Section }) {
  const sectionClass = section.type === 'full-width' ? 'w-full' : 'container mx-auto';
  
  const sectionStyle = {
    backgroundColor: section.settings.backgroundColor || 'transparent',
    padding: section.settings.padding || '0',
    margin: section.settings.margin || '0'
  };

  return (
    <section className={sectionClass} style={sectionStyle}>
      {section.rows.map((row) => (
        <RenderRow key={row.id} row={row} />
      ))}
    </section>
  );
}

function RenderRow({ row }: { row: Row }) {
  const rowStyle = {
    padding: row.settings.padding || '0',
    margin: row.settings.margin || '0',
    backgroundColor: row.settings.backgroundColor || 'transparent'
  };

  return (
    <div className="flex flex-wrap gap-4" style={rowStyle}>
      {row.columns.map((column) => (
        <RenderColumn key={column.id} column={column} />
      ))}
    </div>
  );
}

function RenderColumn({ column }: { column: Column }) {
  const colWidth = `${(column.size / 12) * 100}%`;
  
  const columnStyle = {
    padding: column.settings.padding || '0',
    backgroundColor: column.settings.backgroundColor || 'transparent',
    flexBasis: colWidth,
    maxWidth: colWidth
  };

  return (
    <div className="column-wrapper" style={columnStyle}>
      {column.components.map((component) => (
        <RenderComponent key={component.id} component={component} />
      ))}
    </div>
  );
}

function RenderComponent({ component }: { component: Component }) {
  const containerStyle = {
    margin: component.settings.margin || '0.5rem 0',
    padding: component.settings.padding || '0'
  };

  // Try to use ComponentRegistry if available (client-side)
  if (typeof window !== 'undefined') {
    try {
      const content = ComponentRegistry.renderComponent(
        component.type,
        component.props,
        component.settings
      );
      
      if (content) {
        return <div style={containerStyle}>{content}</div>;
      }
    } catch (e) {
      // Fall back to simple components if registry fails
    }
  }
  
  // Use simple component fallbacks (works server-side)
  const SimpleComponent = SimpleComponents[component.type as keyof typeof SimpleComponents];
  if (SimpleComponent) {
    return (
      <div style={containerStyle}>
        {SimpleComponent(component.props, component.settings)}
      </div>
    );
  }
  
  // Fallback for unknown components
  return (
    <div style={containerStyle} className="p-2 border border-gray-200 rounded">
      <div className="text-sm bg-gray-100 p-2 rounded">
        Component: {component.type}
      </div>
    </div>
  );
}