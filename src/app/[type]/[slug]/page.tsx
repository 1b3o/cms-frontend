// src/app/[type]/[slug]/page.tsx
import { notFound } from "next/navigation";
import { publicContentApi } from '@/api/publicContentClient';
import { PublicFrontendRenderer } from '@/components/page-builder/core/PublicFrontendRenderer';
import { ContentRenderer } from '@/components/structured/templates/TemplateRegistry';
import { Metadata } from 'next';

interface ContentPageProps {
  params: {
    type: string;
    slug: string;
  };
}

export async function generateMetadata({ params }: ContentPageProps): Promise<Metadata> {
  try {
    const content = await publicContentApi.getContent(params.type, params.slug);
    
    // Extract SEO metadata
    const metaTitle = content.metadata?.meta_title || content.title;
    const metaDescription = content.metadata?.meta_description;
    const metaKeywords = content.metadata?.meta_keywords;
    const ogTitle = content.metadata?.og_title || metaTitle;
    const ogDescription = content.metadata?.og_description || metaDescription;
    
    return {
      title: metaTitle,
      description: metaDescription,
      keywords: metaKeywords,
      openGraph: {
        title: ogTitle,
        description: ogDescription as string,
        type: 'website',
      },
    };
  } catch (error) {
    return {
      title: 'Content Not Found',
      description: 'The requested content could not be found.',
    };
  }
}

export default async function ContentPage({ params }: ContentPageProps) {
  try {
    // Fetch content from API
    const content = await publicContentApi.getContent(params.type, params.slug);
    
    // If content has a page builder layout, use the PublicFrontendRenderer
    if (content.content?.layout) {
      return <PublicFrontendRenderer layout={content.content.layout} />;
    }
    
    // Otherwise use the template system with ContentRenderer
    return <ContentRenderer content={content} />;
    
  } catch (error) {
    console.error("Error in ContentPage:", error);
    return notFound();
  }
}