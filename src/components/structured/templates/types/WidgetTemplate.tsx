// src/components/structured/templates/types/WidgetTemplate.tsx
import React from 'react';
import { PublicContent } from '@/api/publicContentClient';
import FieldRenderer from '@/components/structured/rendering/FieldRenderer';

interface WidgetTemplateProps {
  content: PublicContent;
}

export default function WidgetTemplate({ content }: WidgetTemplateProps) {
  // Extract common fields for widgets
  const widgetType = content.content.widget_type;
  const title = content.content.title || content.title;
  const widgetContent = content.content.content;
  const itemCount = content.content.item_count;
  const customHtml = content.content.custom_html;
  const config = content.content.config || {};

  // Render widget based on type
  const renderWidgetContent = () => {
    switch (widgetType) {
      case 'text':
        return (
          <div className="prose prose-sm max-w-none">
            {widgetContent && (
              <FieldRenderer 
                fieldType="richtext" 
                value={widgetContent} 
              />
            )}
          </div>
        );

      case 'custom_html':
        return (
          <div dangerouslySetInnerHTML={{ __html: customHtml || '' }} />
        );

      case 'recent_posts':
        // This would normally fetch recent posts
        // For this template, we'll just show a placeholder
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Showing {itemCount || 5} recent posts
            </p>
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-center text-gray-400">Recent posts content would appear here</p>
            </div>
          </div>
        );

      case 'categories':
        // This would normally show categories
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Category list widget
            </p>
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-center text-gray-400">Categories would appear here</p>
            </div>
          </div>
        );

      case 'contact_form':
        // Placeholder for contact form
        return (
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-center text-gray-400">Contact form would appear here</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-gray-500">
            Widget type '{widgetType}' not recognized
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      {title && (
        <h3 className="text-lg font-medium mb-4 pb-2 border-b">{title}</h3>
      )}
      
      <div className="widget-content">
        {renderWidgetContent()}
      </div>
      
      {/* Additional fields */}
      <div className="mt-4">
        {content.fields.map(field => {
          // Skip fields we've already processed
          if (['widget_type', 'title', 'content', 'item_count', 'custom_html', 'config'].includes(field.slug)) {
            return null;
          }
          
          const fieldValue = content.content[field.slug];
          if (fieldValue === undefined || fieldValue === null) return null;
          
          return (
            <div key={field.id} className="mt-3">
              <div className="text-sm font-medium mb-1">{field.name}</div>
              <FieldRenderer 
                fieldType={field.field_type} 
                value={fieldValue} 
                config={field.ui_config || {}} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}