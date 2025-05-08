// src/components/fields/RichTextRenderer.tsx
import React from 'react';
import { parseHTML } from 'linkedom';
import DOMPurify from 'dompurify';

interface RichTextRendererProps {
  content: string;
}

export default function RichTextRenderer({ content }: RichTextRendererProps) {
  // Wenn kein Inhalt vorhanden ist
  if (!content) {
    return null;
  }

  // Sicherstellen, dass der Inhalt ein String ist
  const htmlContent = typeof content === 'string' ? content : String(content);

  // HTML sicher bereinigen, um XSS-Angriffe zu verhindern
  const sanitizedContent = DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'b', 'i', 'strong', 'em',
      'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'hr', 'table', 'tr',
      'th', 'td', 'caption', 'span', 'div', 'img', 'figure', 'figcaption'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'class', 'id', 'style', 'width', 'height'
    ],
    ALLOW_UNKNOWN_PROTOCOLS: false,
    FORCE_BODY: true,
    RETURN_DOM: false,
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allowfullscreen', 'frameborder', 'width', 'height'],
  });

  // Content als HTML rendern (mit Vorsicht)
  return (
    <div 
      className="rich-text-content"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}