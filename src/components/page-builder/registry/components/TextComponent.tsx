// src/components/page-builder/registry/components/basic/TextComponent.ts
import React from 'react';

export const TextComponent = {
  id: 'text',
  name: 'Text',
  icon: <span className="text-xs">Abc</span>,
  defaultProps: {
    content: 'Neuer Textabschnitt',
    fontSize: 'base'
  },
  render: (props: any, settings: any) => {
    const { content = 'Text', fontSize = 'base' } = props;
    
    const fontSizeClasses = {
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl'
    };
    
    const fontSizeClass = fontSizeClasses[fontSize as keyof typeof fontSizeClasses] || fontSizeClasses.base;
    
    return (
      <p 
        className={fontSizeClass}
        style={{
          margin: settings.margin || '0',
          padding: settings.padding || '0',
          textAlign: settings.textAlign as React.CSSProperties['textAlign'] || 'left',
          color: settings.color || 'inherit',
          backgroundColor: settings.backgroundColor || 'transparent'
        }}
      >
        {content || 'Text'}
      </p>
    );
  }
};