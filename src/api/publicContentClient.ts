// src/api/publicContentClient.ts
import axios from 'axios';

// Types
export interface PublicContent {
  id: string;
  content_type_id: string;
  content_type_slug: string;
  content_type_ui_config?: {
    template?: string;
    [key: string]: any;
  };
  title: string;
  slug: string;
  content: any;
  metadata: any;
  published_at?: string;
  fields: PublicFieldInfo[];
}

export interface PublicFieldInfo {
  id: string;
  name: string;
  slug: string;
  field_type: string;
  ui_config?: any;
}

export interface PublicContentListItem {
  id: string;
  title: string;
  slug: string;
  content: any;
  metadata: any;
  published_at?: string;
}

export interface PublicContentListResponse {
  items: PublicContentListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Create an axios instance - no auth token needed for public routes
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8585/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Public Content API Methods
export const publicContentApi = {
  // Get single content by type slug and content slug
  getContent: async (typeSlug: string, contentSlug: string): Promise<PublicContent> => {
    try {
      const response = await apiClient.get<PublicContent>(`/public/content/${typeSlug}/${contentSlug}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching content ${typeSlug}/${contentSlug}:`, error);
      throw error;
    }
  },

  // List contents by type slug
  listContents: async (typeSlug: string, page: number = 1, pageSize: number = 10): Promise<PublicContentListResponse> => {
    try {
      const response = await apiClient.get<PublicContentListResponse>(
        `/public/content/${typeSlug}?page=${page}&page_size=${pageSize}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching content list for ${typeSlug}:`, error);
      throw error;
    }
  }
};