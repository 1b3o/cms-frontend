// src/components/templates/TemplateRegistry.tsx
import React from 'react';
import { PublicContent } from '@/api/publicContentClient';

// Import template components
import DefaultTemplate from './types/DefaultTemplate';
import ArticleTemplate from './types/ArticleTemplate';
import PageTemplate from './types/PageTemplate';
import ProductTemplate from './types/ProductTemplate';

// Template map: Defines which template to use for each content type
const TEMPLATE_MAP: Record<string, React.ComponentType<{ content: PublicContent }>> = {
  // Default template for all content types
  default: DefaultTemplate,
  
  // Specific templates for different content types
  article: ArticleTemplate,
  page: PageTemplate,
  product: ProductTemplate,
};

// Function to get the correct template for a specific content
export function getTemplateForContent(content: PublicContent): React.ComponentType<{ content: PublicContent }> {
  let templateId = 'default';
  
  // First check if the content type has a specified template in UI config
  if (content.content_type_ui_config?.template) {
    templateId = content.content_type_ui_config.template;
  } 
  // Otherwise use the content type slug as template ID
  else {
    templateId = content.content_type_slug;
  }
  
  // Try to find a specific template
  const template = TEMPLATE_MAP[templateId];
  
  // If no specific template found, use the default template
  if (!template) {
    console.warn(`No template found for template ID '${templateId}', using default template.`);
    return TEMPLATE_MAP.default;
  }
  
  return template;
}

// ContentRenderer component for easy template rendering
interface ContentRendererProps {
  content: PublicContent;
}

export function ContentRenderer({ content }: ContentRendererProps) {
  // Get the appropriate template component
  const Template = getTemplateForContent(content);
  
  // Render the template with the content
  return <Template content={content} />;
}