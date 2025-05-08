// src/components/structured/templates/types/EventTemplate.tsx
import React from 'react';
import { PublicContent } from '@/api/publicContentClient';
import FieldRenderer from '@/components/structured/rendering/FieldRenderer';
import Image from 'next/image';
import { Calendar, MapPin, Clock, User, DollarSign, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface EventTemplateProps {
  content: PublicContent;
}

export default function EventTemplate({ content }: EventTemplateProps) {
  // Extract common fields for events
  const eventImage = content.content.event_image;
  const startDate = content.content.start_date;
  const endDate = content.content.end_date;
  const location = content.content.location;
  const virtualUrl = content.content.virtual_url;
  const description = content.content.description;
  const organizer = content.content.organizer;
  const price = content.content.price;
  const registrationUrl = content.content.registration_url;
  const categories = content.content.categories;

  // Format date and time
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPpp', { locale: de });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{content.title}</h1>
        
        {eventImage && (
          <div className="mb-6 rounded-lg overflow-hidden">
            <Image 
              src={eventImage} 
              alt={`Event: ${content.title}`}
              width={1200}
              height={600}
              className="w-full h-auto object-cover"
            />
          </div>
        )}
        
        <div className="bg-gray-50 border rounded-lg p-6 space-y-4">
          {startDate && (
            <div className="flex items-start">
              <Calendar className="w-5 h-5 mr-3 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Date & Time</div>
                <div>
                  {formatDateTime(startDate)}
                  {endDate && ` - ${formatDateTime(endDate)}`}
                </div>
              </div>
            </div>
          )}
          
          {location && (
            <div className="flex items-start">
              <MapPin className="w-5 h-5 mr-3 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Location</div>
                <div>{location}</div>
              </div>
            </div>
          )}
          
          {virtualUrl && (
            <div className="flex items-start">
              <ExternalLink className="w-5 h-5 mr-3 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Virtual Event</div>
                <a href={virtualUrl} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  Join Online
                </a>
              </div>
            </div>
          )}
          
          {organizer && (
            <div className="flex items-start">
              <User className="w-5 h-5 mr-3 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Organizer</div>
                <div>{organizer}</div>
              </div>
            </div>
          )}
          
          {price !== undefined && price !== null && (
            <div className="flex items-start">
              <DollarSign className="w-5 h-5 mr-3 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Price</div>
                <div>
                  {typeof price === 'number' 
                    ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price)
                    : price === 0 || price === '0' ? 'Free' : price
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Event Description */}
      <div className="prose prose-lg max-w-none mb-12">
        {description && (
          <FieldRenderer 
            fieldType="richtext" 
            value={description} 
          />
        )}
      </div>
      
      {/* Categories */}
      {categories && Array.isArray(categories) && categories.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-2">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category: string, index: number) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {category}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Registration Button */}
      {registrationUrl && (
        <div className="mt-8 text-center">
          <a 
            href={registrationUrl} 
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Register Now
          </a>
        </div>
      )}
      
      {/* Render additional fields that weren't explicitly handled */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        {content.fields.map(field => {
          // Skip fields that we've already processed
          if ([
            'event_image', 'start_date', 'end_date', 'location', 'virtual_url',
            'description', 'organizer', 'price', 'registration_url', 'categories'
          ].includes(field.slug)) {
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
                config={field.ui_config} 
              />
            </div>
          );
        })}
      </div>
    </article>
  );
}