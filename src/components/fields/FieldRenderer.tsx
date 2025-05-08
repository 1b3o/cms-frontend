// src/components/fields/FieldRenderer.tsx
import React from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

// Importiere Field-Komponenten
import RichTextRenderer from './RichTextRenderer';
import CodeRenderer from './CodeRenderer';

interface FieldRendererProps {
  fieldType: string;
  value: any;
  config: any;
}

export default function FieldRenderer({ fieldType, value, config }: FieldRendererProps) {
  // Stelle sicher, dass wir einen Wert haben
  if (value === null || value === undefined) {
    return null;
  }

  // Rendere je nach Feldtyp
  switch (fieldType) {
    case 'text':
      return <p className="text-base">{value}</p>;
      
    case 'longtext':
      return <div className="whitespace-pre-wrap">{value}</div>;
      
    case 'richtext':
      return <RichTextRenderer content={value} />;
      
    case 'number':
      return <span className="font-mono">{value}</span>;
      
    case 'boolean':
      return (
        <span className={`inline-block px-3 py-1 rounded-full text-sm ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Ja' : 'Nein'}
        </span>
      );
      
    case 'date':
      try {
        return <time dateTime={value}>{format(new Date(value), 'PPP', { locale: de })}</time>;
      } catch (e) {
        return <span className="text-red-500">Ungültiges Datum: {value}</span>;
      }
      
    case 'datetime':
      try {
        return <time dateTime={value}>{format(new Date(value), 'PPp', { locale: de })}</time>;
      } catch (e) {
        return <span className="text-red-500">Ungültiges Datum: {value}</span>;
      }
      
    case 'email':
      return <a href={`mailto:${value}`} className="text-blue-600 hover:underline">{value}</a>;
      
    case 'url':
      return (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:underline"
        >
          {value}
        </a>
      );
      
    case 'select':
      return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{value}</span>;
      
    case 'multiselect':
      if (!Array.isArray(value)) return <span>{String(value)}</span>;
      
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {item}
            </span>
          ))}
        </div>
      );
      
    case 'media':
      // Einfache Bild-Vorschau
      if (typeof value === 'string' && (value.endsWith('.jpg') || value.endsWith('.jpeg') || value.endsWith('.png') || value.endsWith('.webp') || value.endsWith('.gif'))) {
        return (
          <div className="rounded overflow-hidden">
            <Image 
              src={value} 
              alt="Bild" 
              width={500}
              height={300}
              className="max-w-full h-auto"
            />
          </div>
        );
      }
      
      // Für andere Medientypen oder wenn das Format nicht unterstützt wird
      return <a href={value} className="text-blue-600 hover:underline">{value}</a>;
      
    case 'code':
      return <CodeRenderer code={value} language={config.language || 'javascript'} />;
      
    case 'json':
      return (
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          <code>{JSON.stringify(value, null, 2)}</code>
        </pre>
      );
      
    default:
      // Fallback für unbekannte Typen
      if (typeof value === 'object') {
        return (
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            <code>{JSON.stringify(value, null, 2)}</code>
          </pre>
        );
      }
      
      return <span>{String(value)}</span>;
  }
}