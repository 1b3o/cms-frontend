// src/components/page-builder/registry/components/basic/ImageComponent.ts
import React from 'react';

export const ImageComponent = {
  id: 'image',
  name: 'Bild',
  icon: <span className="w-4 h-4 rounded-sm border flex items-center justify-center text-[6px]">IMG</span>,
  defaultProps: {
    src: '/placeholder.jpg',
    alt: 'Platzhalterbild',
    width: 800,
    height: 400
  },
  render: (props: any, settings: any) => {
    const { src = '/placeholder.jpg', alt = 'Bild', width, height } = props;
    
    return (
      <div
        className="relative w-full"
        style={{
          margin: settings.margin || '0',
          padding: settings.padding || '0'
        }}
      >
        {src.startsWith('http') || src.startsWith('/') ? (
          <img 
            src={src}
            alt={alt || 'Bild'}
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              display: 'block',
              margin: '0 auto'
            }}
          />
        ) : (
          <div className="bg-gray-100 flex items-center justify-center" style={{ height: '200px' }}>
            <span className="text-gray-400">Kein gültiges Bild</span>
          </div>
        )}
      </div>
    );
  }
};