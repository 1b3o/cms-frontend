// src/components/structured/templates/types/TeamMemberTemplate.tsx
import React from 'react';
import { PublicContent } from '@/api/publicContentClient';
import FieldRenderer from '@/components/structured/rendering/FieldRenderer';
import Image from 'next/image';
import { Mail, Phone, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react';

interface TeamMemberTemplateProps {
  content: PublicContent;
}

export default function TeamMemberTemplate({ content }: TeamMemberTemplateProps) {
  // Extract common fields for team members
  const photo = content.content.photo;
  const position = content.content.position;
  const email = content.content.email;
  const phone = content.content.phone;
  const bio = content.content.bio;
  const socialLinks = content.content.social_links || {};
  const department = content.content.department;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Photo */}
        <div className="w-full md:w-1/3">
          {photo ? (
            <div className="rounded-lg overflow-hidden">
              <Image 
                src={photo} 
                alt={content.title}
                width={400}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center">
              <span className="text-gray-400">Kein Foto verfügbar</span>
            </div>
          )}
          
          {/* Contact Information */}
          <div className="mt-6 space-y-3">
            {position && (
              <div className="font-medium text-lg">{position}</div>
            )}
            
            {department && (
              <div className="text-gray-600">{department}</div>
            )}
            
            {email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
                  {email}
                </a>
              </div>
            )}
            
            {phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                <a href={`tel:${phone}`} className="text-blue-600 hover:underline">
                  {phone}
                </a>
              </div>
            )}
          </div>
          
          {/* Social Links */}
          {Object.keys(socialLinks).length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-2 text-gray-600">Social Media</h3>
              <div className="flex space-x-2">
                {socialLinks.linkedin && (
                  <a 
                    href={socialLinks.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 rounded-full text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a 
                    href={socialLinks.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 rounded-full text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {socialLinks.facebook && (
                  <a 
                    href={socialLinks.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 rounded-full text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a 
                    href={socialLinks.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 rounded-full text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Bio and other content */}
        <div className="w-full md:w-2/3">
          <h1 className="text-3xl font-bold mb-4">{content.title}</h1>
          
          {bio && (
            <div className="prose prose-lg max-w-none mb-8">
              <FieldRenderer 
                fieldType="richtext" 
                value={bio} 
              />
            </div>
          )}
          
          {/* Render additional fields */}
          {content.fields.map(field => {
            // Skip fields that we've already processed
            if (['photo', 'position', 'email', 'phone', 'bio', 'social_links', 'department'].includes(field.slug)) {
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
    </div>
  );
}