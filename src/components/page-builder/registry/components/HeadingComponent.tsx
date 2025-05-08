// src/components/page-builder/registry/components/basic/HeadingComponent.ts
import React from 'react';

export const HeadingComponent = {
  id: 'heading',
  name: 'Überschrift',
  icon: <span className="font-bold text-xs">Aa</span>,
  defaultProps: {
    text: 'Neue Überschrift',
    level: 'h2'
  },
  render: (props: any, settings: any) => {
    const { text = 'Überschrift', level = 'h2' } = props;
    const { textAlign = 'left' } = settings;
    
    const headingStyles = {
      h1: 'text-4xl font-bold',
      h2: 'text-3xl font-bold',
      h3: 'text-2xl font-bold',
      h4: 'text-xl font-bold',
      h5: 'text-lg font-bold',
      h6: 'text-base font-bold'
    };
    
    // Use React.createElement instead of JSX for dynamic elements
    return React.createElement(
      level, // h1, h2, etc.
      {
        className: `${headingStyles[level as keyof typeof headingStyles]}`,
        style: {
          textAlign: textAlign as React.CSSProperties['textAlign'],
          margin: settings.margin || '0',
          padding: settings.padding || '0',
          color: settings.color || 'inherit',
          backgroundColor: settings.backgroundColor || 'transparent'
        }
      },
      text
    );
  }
};