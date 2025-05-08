// src/components/structured/templates/types/TestimonialTemplate.tsx
import React from 'react';
import { PublicContent } from '@/api/publicContentClient';
import FieldRenderer from '@/components/structured/rendering/FieldRenderer';
import Image from 'next/image';
import { Star, StarHalf } from 'lucide-react';

interface TestimonialTemplateProps {
  content: PublicContent;
}

export default function TestimonialTemplate({ content }: TestimonialTemplateProps) {
  // Extract common fields for testimonials
  const clientPhoto = content.content.client_photo;
  const clientName = content.content.client_name || content.title;
  const clientPosition = content.content.client_position;
  const company = content.content.company;
  const quote = content.content.quote;
  const rating = content.content.rating;
  const featured = content.content.featured;

  // Function to render stars based on rating
  const renderRating = (rating: number) => {
    if (!rating) return null;
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const stars = [];
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-5 w-5 text-yellow-400 fill-current" />);
    }
    
    // Half star if needed
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-5 w-5 text-yellow-400 fill-current" />);
    }
    
    return (
      <div className="flex space-x-1">
        {stars}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className={`bg-white rounded-lg shadow-md overflow-hidden ${featured ? 'border-2 border-blue-500' : ''}`}>
        <div className="p-6 md:p-8">
          {/* Testimonial quote */}
          <div className="mb-6">
            <div className="text-4xl text-gray-300 font-serif">"</div>
            <div className="mt-2 text-lg md:text-xl text-gray-700 italic">
              {quote}
            </div>
            <div className="text-4xl text-gray-300 font-serif text-right">"</div>
          </div>
          
          {/* Client details */}
          <div className="flex items-center mt-6">
            {clientPhoto ? (
              <div className="flex-shrink-0 mr-4">
                <Image 
                  src={clientPhoto} 
                  alt={clientName}
                  width={80}
                  height={80}
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>
            ) : null}
            
            <div>
              <div className="font-bold text-gray-900">{clientName}</div>
              {clientPosition && (
                <div className="text-gray-600">
                  {clientPosition}
                  {company && ` at ${company}`}
                </div>
              )}
              
              {/* Rating */}
              {rating && (
                <div className="mt-1">
                  {renderRating(Number(rating))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional fields */}
      <div className="mt-8">
        {content.fields.map(field => {
          // Skip fields we've already processed
          if (['client_photo', 'client_name', 'client_position', 'company', 'quote', 'rating', 'featured'].includes(field.slug)) {
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