// src/components/structured/rendering/CodeRenderer.tsx
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeRendererProps {
  code: string;
  language: string;
  className?: string;
}

export default function CodeRenderer({ code, language, className = '' }: CodeRendererProps) {
  return (
    <div className={`rounded-md overflow-hidden ${className}`}>
      <SyntaxHighlighter
        language={language || 'javascript'}
        style={vscDarkPlus}
        customStyle={{ margin: 0 }}
        showLineNumbers={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}