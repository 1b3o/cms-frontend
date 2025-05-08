"use client"
import React, { useState } from 'react';
import { PublicContent } from '@/api/publicContentClient';
import FieldRenderer from '@/components/structured/rendering/FieldRenderer';
import Image from 'next/image';
import { X } from 'lucide-react';

interface GalleryTemplateProps {
  content: PublicContent;
}

interface GalleryImage {
  src: string;
  caption?: string;
  alt?: string;
}

export default function GalleryTemplate({ content }: GalleryTemplateProps) {
  // Extract common fields for galleries
  const galleryType = content.content.gallery_type || 'grid';
  const description = content.content.description;
  const images: GalleryImage[] = content.content.images || [];
  const categories = content.content.categories || [];
  const options = content.content.options || {};
  
  // State for lightbox
  const [activeImage, setActiveImage] = useState<number | null>(null);
  
  // Function to open lightbox
  const openLightbox = (index: number) => {
    setActiveImage(index);
  };
  
  // Function to close lightbox
  const closeLightbox = () => {
    setActiveImage(null);
  };
  
  // Function to go to next/previous image in lightbox
  const navigateImage = (direction: 'next' | 'prev') => {
    if (activeImage === null || !images.length) return;
    
    if (direction === 'next') {
      setActiveImage((activeImage + 1) % images.length);
    } else {
      setActiveImage((activeImage - 1 + images.length) % images.length);
    }
  };
  
  // Render gallery based on gallery type
  const renderGallery = () => {
    switch (galleryType) {
      case 'grid':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div 
                key={index} 
                className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                <Image 
                  src={image.src} 
                  alt={image.alt || `Gallery image ${index + 1}`}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                {image.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                    {image.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      
      case 'masonry':
        // A simple masonry-like layout
        return (
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {images.map((image, index) => (
              <div 
                key={index} 
                className="break-inside-avoid relative overflow-hidden rounded-lg cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                <Image 
                  src={image.src} 
                  alt={image.alt || `Gallery image ${index + 1}`}
                  width={400}
                  height={Math.floor(Math.random() * 300) + 200} // Random height for masonry effect
                  className="w-full h-auto object-cover"
                />
                {image.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                    {image.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      
      case 'slider':
        // Simple carousel/slider
        return (
          <div className="relative overflow-hidden rounded-lg">
            <div className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide">
              {images.map((image, index) => (
                <div 
                  key={index} 
                  className="snap-center flex-shrink-0 w-full relative cursor-pointer"
                  onClick={() => openLightbox(index)}
                >
                  <div className="aspect-video relative">
                    <Image 
                      src={image.src} 
                      alt={image.alt || `Gallery image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {image.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white p-2">
                      {image.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <style jsx>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>
          </div>
        );
      
      case 'lightbox':
        // A gallery that opens directly in lightbox mode
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div 
                key={index} 
                className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                <Image 
                  src={image.src} 
                  alt={image.alt || `Gallery image ${index + 1}`}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/80 rounded-full p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-maximize">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                      <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
                      <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
                      <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <div className="text-gray-500">
            Unknown gallery type: {galleryType}
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{content.title}</h1>
      
      {description && (
        <div className="prose max-w-none mb-6">
          <FieldRenderer 
            fieldType="richtext" 
            value={description} 
          />
        </div>
      )}
      
      {/* Categories */}
      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category: string, index: number) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {category}
            </span>
          ))}
        </div>
      )}
      
      {/* Gallery */}
      <div className="mb-8">
        {renderGallery()}
      </div>
      
      {/* Additional fields */}
      <div className="mt-8">
        {content.fields.map(field => {
          // Skip fields we've already processed
          if ([
            'gallery_type', 'description', 'images', 'categories', 'options'
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
      
      {/* Lightbox */}
      {activeImage !== null && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div 
            className="relative max-w-5xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Current image */}
            <div className="relative">
              <Image 
                src={images[activeImage].src} 
                alt={images[activeImage].alt || `Gallery image ${activeImage + 1}`}
                width={1200}
                height={800}
                className="max-w-full max-h-[85vh] object-contain"
              />
              
              {/* Caption */}
              {images[activeImage].caption && (
                <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white p-3">
                  {images[activeImage].caption}
                </div>
              )}
            </div>
            
            {/* Close button */}
            <button 
              className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Navigation arrows */}
            <div className="absolute inset-y-0 left-0 flex items-center">
              <button 
                className="bg-black/50 text-white rounded-full p-2 ml-4 hover:bg-black/70"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('prev');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
                  <path d="m15 18-6-6 6-6"></path>
                </svg>
              </button>
            </div>
            
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button 
                className="bg-black/50 text-white rounded-full p-2 mr-4 hover:bg-black/70"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('next');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
                  <path d="m9 18 6-6-6-6"></path>
                </svg>
              </button>
            </div>
            
            {/* Image counter */}
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {activeImage + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}