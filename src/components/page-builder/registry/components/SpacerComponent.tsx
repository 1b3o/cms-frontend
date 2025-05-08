// src/components/page-builder/registry/components/basic/SpacerComponent.ts
import React from 'react';

export const SpacerComponent = {
  id: 'spacer',
  name: 'Abstand',
  icon: <div className="w-4 h-4 flex items-center justify-center">·</div>,
  defaultProps: {
    height: '2rem'
  },
  render: (props: any, settings: any) => {
    const { height = '2rem' } = props;
    
    return (
      <div
        style={{
          height,
          width: '100%',
          margin: settings.margin || '0',
          padding: settings.padding || '0'
        }}
        aria-hidden="true"
      />
    );
  }
};