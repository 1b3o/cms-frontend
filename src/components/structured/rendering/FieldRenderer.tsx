// src/components/structured/rendering/FieldRenderer.tsx
import React from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

// Import specialized renderers
import RichTextRenderer from './RichTextRenderer';
import CodeRenderer from './CodeRenderer';

interface FieldRendererProps {
  fieldType: string;
  value: any;
  config?: Record<string, any>;
  className?: string;
}

export default function FieldRenderer({ 
  fieldType, 
  value, 
  config = {}, 
  className = '' 
}: FieldRendererProps) {
  // Safety check - if no value, render nothing
  if (value === null || value === undefined) {
    return null;
  }

  // Render based on field type
  switch (fieldType) {
    case 'text':
      return <p className={`text-base ${className}`}>{value}</p>;
      
    case 'longtext':
      return <div className={`whitespace-pre-wrap ${className}`}>{value}</div>;
      
    case 'richtext':
      return <RichTextRenderer content={value} className={className} />;
      
    case 'number':
      const prefix = config.prefix || '';
      const suffix = config.suffix || '';
      return (
        <span className={`font-mono ${className}`}>
          {prefix}{value}{suffix}
        </span>
      );
      
    case 'boolean':
      return (
        <span className={`inline-block px-3 py-1 rounded-full text-sm ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        } ${className}`}>
          {value ? 'Ja' : 'Nein'}
        </span>
      );
      
    case 'date':
      try {
        return (
          <time 
            dateTime={value} 
            className={className}
          >
            {format(new Date(value), 'PPP', { locale: de })}
          </time>
        );
      } catch (e) {
        return <span className={`text-red-500 ${className}`}>Ungültiges Datum: {value}</span>;
      }
      
    case 'datetime':
      try {
        return (
          <time 
            dateTime={value} 
            className={className}
          >
            {format(new Date(value), 'PPp', { locale: de })}
          </time>
        );
      } catch (e) {
        return <span className={`text-red-500 ${className}`}>Ungültiges Datum: {value}</span>;
      }
      
    case 'email':
      return (
        <a 
          href={`mailto:${value}`} 
          className={`text-blue-600 hover:underline ${className}`}
        >
          {value}
        </a>
      );
      
    case 'url':
      return (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`text-blue-600 hover:underline ${className}`}
        >
          {value}
        </a>
      );
      
    case 'select':
      return (
        <span className={`bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm ${className}`}>
          {value}
        </span>
      );
      
    case 'multiselect':
      if (!Array.isArray(value)) return <span className={className}>{String(value)}</span>;
      
      return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
          {value.map((item, index) => (
            <span 
              key={index} 
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              {item}
            </span>
          ))}
        </div>
      );
      
    case 'media':
      // Simple image preview - adjust as needed for other media types
      if (typeof value === 'string' && (
        value.endsWith('.jpg') || 
        value.endsWith('.jpeg') || 
        value.endsWith('.png') || 
        value.endsWith('.webp') || 
        value.endsWith('.gif')
      )) {
        return (
          <div className={`rounded overflow-hidden ${className}`}>
            <Image 
              src={value} 
              alt={config.alt || "Bild"} 
              width={config.width || 800}
              height={config.height || 600}
              className="max-w-full h-auto object-cover"
            />
          </div>
        );
      }
      
      // For other media types or if format not supported
      return (
        <a 
          href={value} 
          className={`text-blue-600 hover:underline ${className}`}
          target="_blank" 
          rel="noopener noreferrer"
        >
          {config.alt || value}
        </a>
      );
      
    case 'code':
      return (
        <CodeRenderer 
          code={value} 
          language={config.language || 'javascript'} 
          className={className}
        />
      );
      
    case 'json':
      // For JSON data, render based on type
      if (typeof value === 'string') {
        try {
          const parsedValue = JSON.parse(value);
          return renderJsonValue(parsedValue, className);
        } catch (e) {
          return <pre className={`bg-gray-100 p-4 rounded overflow-auto max-h-96 ${className}`}>{value}</pre>;
        }
      }
      return renderJsonValue(value, className);
      
    default:
      // Fallback for unknown types
      if (typeof value === 'object') {
        return (
          <pre className={`bg-gray-100 p-4 rounded overflow-auto max-h-96 ${className}`}>
            <code>{JSON.stringify(value, null, 2)}</code>
          </pre>
        );
      }
      
      return <span className={className}>{String(value)}</span>;
  }
}

// Helper function to render JSON values based on their structure
function renderJsonValue(value: any, className: string) {
  // For arrays
  if (Array.isArray(value)) {
    return (
      <ul className={`list-disc pl-5 space-y-2 ${className}`}>
        {value.map((item, index) => (
          <li key={index}>
            {typeof item === 'object' 
              ? renderJsonValue(item, '') 
              : String(item)}
          </li>
        ))}
      </ul>
    );
  }
  
  // For objects
  if (typeof value === 'object' && value !== null) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Object.entries(value).map(([key, val], index) => (
          <div key={index} className="border-b pb-2 last:border-b-0">
            <div className="font-medium text-gray-700">{key}</div>
            <div className="mt-1">
              {typeof val === 'object' 
                ? renderJsonValue(val, '') 
                : String(val)}
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // For primitives
  return <span className={className}>{String(value)}</span>;
}