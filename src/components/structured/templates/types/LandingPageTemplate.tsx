"use client"
import React from 'react';
import { PublicContent } from '@/api/publicContentClient';
import FieldRenderer from '@/components/structured/rendering/FieldRenderer';
import Image from 'next/image';

interface LandingPageTemplateProps {
  content: PublicContent;
}

interface Feature {
  title: string;
  description: string;
  icon?: string;
  image?: string;
}

interface Testimonial {
  quote: string;
  author: string;
  position?: string;
  company?: string;
  image?: string;
}

export default function LandingPageTemplate({ content }: LandingPageTemplateProps) {
  // Extract common fields for landing pages
  const heroTitle = content.content.hero_title || content.title;
  const heroSubtitle = content.content.hero_subtitle;
  const heroImage = content.content.hero_image;
  const features = content.content.features || [];
  const testimonials = content.content.testimonials || [];
  const ctaTitle = content.content.cta_title;
  const ctaDescription = content.content.cta_description;
  const ctaButtonText = content.content.cta_button_text || 'Get Started';
  const ctaButtonLink = content.content.cta_button_link || '#';

  return (
    <div className="font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{heroTitle}</h1>
              
              {heroSubtitle && (
                <p className="text-xl md:text-2xl mb-8 text-blue-100">
                  {heroSubtitle}
                </p>
              )}
              
              {ctaButtonLink && ctaButtonText && (
                <a 
                  href={ctaButtonLink} 
                  className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-lg shadow-lg hover:bg-gray-100 transition-colors text-lg"
                >
                  {ctaButtonText}
                </a>
              )}
            </div>
            
            {heroImage && (
              <div className="w-full md:w-1/2">
                <div className="rounded-lg shadow-2xl overflow-hidden">
                  <Image 
                    src={heroImage} 
                    alt="Hero image"
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      {features.length > 0 && (
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature: Feature, index: number) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  {feature.icon && (
                    <div className="text-blue-600 mb-4">
                      <span className="text-3xl">{feature.icon}</span>
                    </div>
                  )}
                  
                  {feature.image && (
                    <div className="mb-4">
                      <Image 
                        src={feature.image} 
                        alt={feature.title}
                        width={300}
                        height={200}
                        className="w-full h-auto rounded-md"
                      />
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What People Say</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((testimonial: Testimonial, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-start mb-4">
                    <div className="text-4xl text-gray-300 mr-4">"</div>
                    <p className="text-lg italic text-gray-700">{testimonial.quote}</p>
                  </div>
                  
                  <div className="flex items-center mt-4">
                    {testimonial.image && (
                      <div className="mr-4">
                        <Image 
                          src={testimonial.image} 
                          alt={testimonial.author}
                          width={60}
                          height={60}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div>
                      <p className="font-bold">{testimonial.author}</p>
                      {(testimonial.position || testimonial.company) && (
                        <p className="text-sm text-gray-600">
                          {testimonial.position}
                          {testimonial.position && testimonial.company && ' at '}
                          {testimonial.company}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* CTA Section */}
      {(ctaTitle || ctaDescription) && (
        <section className="py-16 md:py-24 bg-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            {ctaTitle && (
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{ctaTitle}</h2>
            )}
            
            {ctaDescription && (
              <p className="text-xl mb-8 max-w-3xl mx-auto text-blue-100">
                {ctaDescription}
              </p>
            )}
            
            {ctaButtonLink && ctaButtonText && (
              <a 
                href={ctaButtonLink} 
                className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-lg shadow-lg hover:bg-gray-100 transition-colors text-lg"
              >
                {ctaButtonText}
              </a>
            )}
          </div>
        </section>
      )}
      
      {/* Additional Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {content.fields.map(field => {
            // Skip fields we've already processed
            if ([
              'hero_title', 'hero_subtitle', 'hero_image', 'features', 'testimonials',
              'cta_title', 'cta_description', 'cta_button_text', 'cta_button_link', 'layout'
            ].includes(field.slug)) {
              return null;
            }
            
            const fieldValue = content.content[field.slug];
            if (fieldValue === undefined || fieldValue === null) return null;
            
            return (
              <div key={field.id} className="mb-12">
                <h3 className="text-2xl font-bold mb-4">{field.name}</h3>
                <FieldRenderer 
                  fieldType={field.field_type} 
                  value={fieldValue} 
                  config={field.ui_config || {}} 
                />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}