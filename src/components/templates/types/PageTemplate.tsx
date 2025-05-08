// src/components/templates/PageTemplate.tsx
import React from 'react';
import { PublicContent } from '@/api/publicContentClient';
import FieldRenderer from '@/components/fields/FieldRenderer';
import Image from 'next/image';

interface PageTemplateProps {
  content: PublicContent;
}

export default function PageTemplate({ content }: PageTemplateProps) {
  // Extract common fields for pages
  const heroImage = content.content.hero_image;
  const subtitle = content.content.subtitle;
  const bodyContent = content.content.body;
  const sections = content.content.sections;

  return (
    <article className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-6">{content.title}</h1>
        
        {subtitle && (
          <div className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {subtitle}
          </div>
        )}
        
        {heroImage && (
          <div className="mt-8 rounded-lg overflow-hidden">
            <Image 
              src={heroImage} 
              alt={`Hero image for: ${content.title}`}
              width={1200}
              height={600}
              className="w-full object-cover"
            />
          </div>
        )}
      </header>

      {/* Main content */}
      <div className="prose prose-lg max-w-none mb-12">
        {bodyContent && (
          <FieldRenderer 
            fieldType="richtext" 
            value={bodyContent} 
            config={{}} 
          />
        )}
        
        {/* Render any sections if they exist */}
        {sections && Array.isArray(sections) && sections.map((section: any, index: number) => (
          <section key={index} className="my-16 py-8 border-t border-gray-100">
            {section.title && (
              <h2 className="text-3xl font-bold mb-6">{section.title}</h2>
            )}
            
            {section.content && (
              <FieldRenderer 
                fieldType="richtext" 
                value={section.content} 
                config={{}} 
              />
            )}
            
            {section.image && (
              <div className="my-8 rounded-lg overflow-hidden">
                <Image 
                  src={section.image} 
                  alt={section.title || `Section ${index + 1}`}
                  width={900}
                  height={500}
                  className="w-full object-cover"
                />
              </div>
            )}
          </section>
        ))}
        
        {/* Render all other fields that haven't been explicitly handled */}
        {content.fields.map(field => {
          // Skip fields that we've already processed
          if (['hero_image', 'subtitle', 'body', 'sections'].includes(field.slug)) {
            return null;
          }
          
          const fieldValue = content.content[field.slug];
          if (fieldValue === undefined || fieldValue === null) return null;
          
          return (
            <div key={field.id} className="mb-8">
              <h3 className="text-2xl font-semibold mb-4">{field.name}</h3>
              <FieldRenderer 
                fieldType={field.field_type} 
                value={fieldValue} 
                config={field.ui_config || {}} 
              />
            </div>
          );
        })}
      </div>
      
      {/* Footer area with additional info or calls to action */}
      {(content.content.cta_text && content.content.cta_link) && (
        <div className="mt-12 text-center">
          <a 
            href={content.content.cta_link} 
            className="inline-block px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {content.content.cta_text}
          </a>
        </div>
      )}
    </article>
  );
}