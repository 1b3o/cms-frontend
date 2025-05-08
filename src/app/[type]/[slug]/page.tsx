// src/app/[type]/[slug]/page.tsx
import { notFound } from "next/navigation";
import { publicContentApi } from '@/api/publicContentClient';
import { PublicFrontendRenderer } from '@/components/page-builder/core/PublicFrontendRenderer';
import { ContentRenderer } from '@/components/templates/TemplateRegistry';

export default async function ContentPage({ params }: { params: { type: string, slug: string } }) {
  try {
    // Hole den Inhalt von der API
    const content = await publicContentApi.getContent(params.type, params.slug);
    
    // Wenn der Inhalt ein Page Builder Layout hat, verwende den PublicFrontendRenderer
    if (content.content?.layout) {
      return <PublicFrontendRenderer layout={content.content.layout} />;
    }
    
    // Andernfalls verwende den normalen ContentRenderer
    return <ContentRenderer content={content} />;
    
  } catch (error) {
    console.error("Error in ContentPage:", error);
    return notFound();
  }
}