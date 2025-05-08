// src/components/structured/rendering/RichTextRenderer.tsx
import React from 'react';

interface RichTextRendererProps {
  content: string;
  className?: string;
}

export default function RichTextRenderer({ content, className = '' }: RichTextRendererProps) {
  // Safety check - if no content, render nothing
  if (!content) {
    return null;
  }
  
  return (
    <div 
      className={`prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}