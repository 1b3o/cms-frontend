// src/components/templates/ArticleTemplate.tsx
import React from 'react';
import { PublicContent } from '@/api/publicContentClient';
import FieldRenderer from '@/components/fields/FieldRenderer';
import Image from 'next/image';

interface ArticleTemplateProps {
  content: PublicContent;
}

export default function ArticleTemplate({ content }: ArticleTemplateProps) {
  // Extrahiere häufig verwendete Felder
  const featuredImage = content.content.featured_image;
  const summary = content.content.summary;
  const bodyContent = content.content.body;
  const author = content.content.author;
  const categories = content.content.categories;
  const tags = content.content.tags;

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
        
        {summary && (
          <div className="text-xl text-gray-600 mb-6">
            {summary}
          </div>
        )}
        
        <div className="flex items-center text-gray-500 mb-6">
          {author && <span className="mr-4">Von {author}</span>}
          {content.published_at && (
            <time dateTime={content.published_at}>
              {new Date(content.published_at).toLocaleDateString('de-DE', {
                year: 'numeric', 
                month: 'long', 
                day: 'numeric'
              })}
            </time>
          )}
        </div>
        
        {featuredImage && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <Image 
              src={featuredImage} 
              alt={`Titelbild: ${content.title}`}
              width={900}
              height={500}
              className="w-full object-cover"
            />
          </div>
        )}
      </header>

      {/* Hauptinhalt */}
      <div className="prose prose-lg max-w-none mb-12">
        {bodyContent && (
          <FieldRenderer 
            fieldType="richtext" 
            value={bodyContent} 
            config={{}} 
          />
        )}
        
        {/* Rendere alle anderen Felder, die noch nicht explizit verarbeitet wurden */}
        {content.fields.map(field => {
          // Überspringe Felder, die wir bereits verarbeitet haben
          if (['featured_image', 'summary', 'body', 'author', 'categories', 'tags'].includes(field.slug)) {
            return null;
          }
          
          const fieldValue = content.content[field.slug];
          if (fieldValue === undefined || fieldValue === null) return null;
          
          return (
            <div key={field.id} className="mb-6">
              <h3 className="text-xl font-semibold mb-2">{field.name}</h3>
              <FieldRenderer 
                fieldType={field.field_type} 
                value={fieldValue} 
                config={field.ui_config || {}} 
              />
            </div>
          );
        })}
      </div>
      
      {/* Kategorien und Tags */}
      <footer className="mt-8 pt-6 border-t border-gray-200">
        {categories && Array.isArray(categories) && categories.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Kategorien:</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category: string, index: number) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {tags && Array.isArray(tags) && tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string, index: number) => (
                <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </footer>
    </article>
  );
}