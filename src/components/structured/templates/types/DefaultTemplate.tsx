// src/components/structured/templates/types/DefaultTemplate.tsx
import React from 'react';
import { PublicContent } from '@/api/publicContentClient';
import FieldRenderer from '@/components/structured/rendering/FieldRenderer';

interface DefaultTemplateProps {
  content: PublicContent;
}

export default function DefaultTemplate({ content }: DefaultTemplateProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{content.title}</h1>
        {content.published_at && (
          <p className="text-gray-500">
            Veröffentlicht am: {new Date(content.published_at).toLocaleDateString('de-DE')}
          </p>
        )}
      </header>

      <div className="content-body space-y-8">
        {/* Render all fields of the content */}
        {content.fields.map(field => {
          const fieldValue = content.content[field.slug];
          if (fieldValue === undefined || fieldValue === null) return null;
          
          return (
            <div key={field.id} className="mb-6">
              <h2 className="text-xl font-semibold mb-2">{field.name}</h2>
              <FieldRenderer 
                fieldType={field.field_type} 
                value={fieldValue} 
                config={field.ui_config || {}} 
              />
            </div>
          );
        })}
      </div>
      
      {/* Metadata section (optional) */}
      {content.metadata && Object.keys(content.metadata).length > 0 && (
        <div className="mt-12 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Zusätzliche Informationen</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(content.metadata).map(([key, value]) => (
              value && (
                <div key={key} className="mb-2">
                  <dt className="font-medium text-gray-700">{key}</dt>
                  <dd className="text-gray-600">
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </dd>
                </div>
              )
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}