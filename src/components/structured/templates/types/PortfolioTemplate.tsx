"use client"
import React, { useState } from 'react';
import { PublicContent } from '@/api/publicContentClient';
import FieldRenderer from '@/components/structured/rendering/FieldRenderer';
import Image from 'next/image';
import { Calendar, User, Link as LinkIcon, Tag } from 'lucide-react';

interface PortfolioTemplateProps {
  content: PublicContent;
}

export default function PortfolioTemplate({ content }: PortfolioTemplateProps) {
  // Extract common fields for portfolio items
  const featuredImage = content.content.featured_image;
  const gallery = content.content.gallery || [];
  const client = content.content.client;
  const projectDate = content.content.project_date;
  const description = content.content.description;
  const projectUrl = content.content.project_url;
  const skills = content.content.skills || [];
  const categories = content.content.categories || [];
  
  // State for gallery lightbox
  const [activeImage, setActiveImage] = useState<string | null>(null);
  
  // Function to open lightbox
  const openLightbox = (image: string) => {
    setActiveImage(image);
  };
  
  // Function to close lightbox
  const closeLightbox = () => {
    setActiveImage(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{content.title}</h1>
        
        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category: string, index: number) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {category}
              </span>
            ))}
          </div>
        )}
      </header>
      
      {/* Featured Image */}
      {featuredImage && (
        <div className="mb-8 rounded-lg overflow-hidden">
          <Image 
            src={featuredImage} 
            alt={content.title}
            width={1200}
            height={800}
            className="w-full h-auto object-cover"
            onClick={() => openLightbox(featuredImage)}
            style={{ cursor: 'pointer' }}
          />
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main Content */}
        <div className="w-full md:w-2/3">
          {/* Description */}
          {description && (
            <div className="prose prose-lg max-w-none mb-8">
              <FieldRenderer 
                fieldType="richtext" 
                value={description} 
              />
            </div>
          )}
          
          {/* Gallery */}
          {gallery.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Project Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map((image: string, index: number) => (
                  <div key={index} className="rounded-lg overflow-hidden">
                    <Image 
                      src={image} 
                      alt={`${content.title} - Image ${index + 1}`}
                      width={400}
                      height={300}
                      className="w-full h-64 object-cover transition-transform hover:scale-105"
                      onClick={() => openLightbox(image)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Additional fields */}
          <div className="mt-8">
            {content.fields.map(field => {
              // Skip fields we've already processed
              if ([
                'featured_image', 'gallery', 'client', 'project_date', 
                'description', 'project_url', 'skills', 'categories'
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
                    config={field.ui_config || {}} 
                  />
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="w-full md:w-1/3">
          <div className="bg-gray-50 rounded-lg p-6 border">
            <h2 className="text-xl font-bold mb-4">Project Details</h2>
            
            <div className="space-y-4">
              {client && (
                <div className="flex items-start">
                  <User className="w-5 h-5 mr-3 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Client</div>
                    <div>{client}</div>
                  </div>
                </div>
              )}
              
              {projectDate && (
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 mr-3 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Date</div>
                    <div>
                      {typeof projectDate === 'string' 
                        ? new Date(projectDate).toLocaleDateString('de-DE')
                        : projectDate
                      }
                    </div>
                  </div>
                </div>
              )}
              
              {projectUrl && (
                <div className="flex items-start">
                  <LinkIcon className="w-5 h-5 mr-3 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Project URL</div>
                    <div>
                      <a 
                        href={projectUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {projectUrl}
                      </a>
                    </div>
                  </div>
                </div>
              )}
              
              {skills.length > 0 && (
                <div className="flex items-start">
                  <Tag className="w-5 h-5 mr-3 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Skills</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skills.map((skill: string, index: number) => (
                        <span key={index} className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {projectUrl && (
              <div className="mt-6">
                <a 
                  href={projectUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full py-2 px-4 bg-blue-600 text-white text-center rounded hover:bg-blue-700 transition-colors"
                >
                  Visit Project
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Lightbox */}
      {activeImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-5xl max-h-full">
            <Image 
              src={activeImage} 
              alt="Enlarged view"
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button 
              className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
              onClick={closeLightbox}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}