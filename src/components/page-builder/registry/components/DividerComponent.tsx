// src/components/page-builder/registry/components/basic/DividerComponent.ts
import React from 'react';

export const DividerComponent = {
  id: 'divider',
  name: 'Trennlinie',
  icon: <div className="w-4 h-0.5 bg-muted-foreground"></div>,
  defaultProps: {
    thickness: '1px',
    style: 'solid',
    color: '#e2e8f0'
  },
  render: (props: any, settings: any) => {
    const { 
      thickness = '1px', 
      style = 'solid',
      color = '#e2e8f0'
    } = props;
    
    return (
      <hr
        style={{
          height: 0,
          borderTop: `${thickness} ${style} ${color}`,
          margin: settings.margin || '1rem 0',
          padding: settings.padding || '0'
        }}
      />
    );
  }
};