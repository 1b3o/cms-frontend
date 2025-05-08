"use client"
import React, { useState } from 'react';
import { PublicContent } from '@/api/publicContentClient';
import FieldRenderer from '@/components/structured/rendering/FieldRenderer';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FaqTemplateProps {
  content: PublicContent;
}

export default function FaqTemplate({ content }: FaqTemplateProps) {
  // Extract common fields for FAQs
  const question = content.content.question || content.title;
  const answer = content.content.answer;
  const categories = content.content.categories || [];
  const order = content.content.order;
  
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-4">
        {/* Display categories if available */}
        {categories.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map((category: string, index: number) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {category}
              </span>
            ))}
          </div>
        )}

        {/* FAQ accordion */}
        <div className="border rounded-lg overflow-hidden">
          <button
            className="flex justify-between items-center w-full p-4 text-left bg-gray-50 hover:bg-gray-100 focus:outline-none"
            onClick={toggleAccordion}
          >
            <h2 className="text-xl font-semibold">{question}</h2>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {isOpen && (
            <div className="p-4 bg-white border-t">
              {answer && (
                <div className="prose prose-lg max-w-none">
                  <FieldRenderer 
                    fieldType="richtext" 
                    value={answer} 
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Additional fields */}
      <div className="mt-8">
        {content.fields.map(field => {
          // Skip fields we've already processed
          if (['question', 'answer', 'categories', 'order'].includes(field.slug)) {
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
    </div>
  );
}