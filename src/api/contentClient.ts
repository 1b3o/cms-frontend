// src/api/contentClient.ts
import axios from 'axios';

// Import the shared token management
import { api } from './client';

// Types
export interface Content {
  id: string;
  content_type_id: string;
  content_type_name?: string;
  content_type_slug?: string;
  title: string;
  slug: string;
  author_id: string;
  author_name?: string;
  status: string;
  published_at?: string;
  content: any;
  metadata: any;
  path?: string;
  created_at: string;
  updated_at: string;
  revision_count?: number;
}

export interface Revision {
  id: string;
  content_id: string;
  title: string;
  content: any;
  metadata: any;
  created_by: string;
  author_name?: string;
  created_at: string;
  comment?: string;
}

export interface ContentListResponse {
  items: Content[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CreateContentRequest {
  content_type_id: string;
  title: string;
  slug?: string;
  status?: string;
  published_at?: string;
  content: any;
  metadata?: any;
  parent_id?: string;
}

export interface UpdateContentRequest {
  title?: string;
  slug?: string;
  status?: string;
  published_at?: string;
  content?: any;
  metadata?: any;
  parent_id?: string;
}

export interface CreateRevisionRequest {
  comment?: string;
}

export interface ContentListParams {
  content_type_id?: string;
  content_type_slug?: string;
  status?: string;
  author_id?: string;
  search?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: string;
}

// Create an axios instance with the same baseURL
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8585/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Content API Methods
export const contentApi = {
  // Content
  listContents: async (params: ContentListParams): Promise<ContentListResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.content_type_id) queryParams.append('content_type_id', params.content_type_id);
    if (params.content_type_slug) queryParams.append('content_type_slug', params.content_type_slug);
    if (params.status) queryParams.append('status', params.status);
    if (params.author_id) queryParams.append('author_id', params.author_id);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);
    
    const response = await apiClient.get<ContentListResponse>(`/admin/content?${queryParams.toString()}`);
    return response.data;
  },

  getContent: async (id: string): Promise<Content> => {
    const response = await apiClient.get<Content>(`/admin/content/${id}`);
    return response.data;
  },

  getContentBySlug: async (contentTypeId: string, slug: string): Promise<Content> => {
    const response = await apiClient.get<Content>(`/admin/content/type/${contentTypeId}/slug/${slug}`);
    return response.data;
  },

  createContent: async (data: CreateContentRequest): Promise<Content> => {
    const response = await apiClient.post<Content>('/admin/content', data);
    return response.data;
  },

  updateContent: async (id: string, data: UpdateContentRequest): Promise<Content> => {
    const response = await apiClient.put<Content>(`/admin/content/${id}`, data);
    return response.data;
  },

  deleteContent: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/content/${id}`);
  },

  // Revisions
  getRevisions: async (contentId: string): Promise<Revision[]> => {
    const response = await apiClient.get<Revision[]>(`/admin/content/${contentId}/revisions`);
    return response.data;
  },

  getRevision: async (id: string): Promise<Revision> => {
    const response = await apiClient.get<Revision>(`/admin/content/revisions/${id}`);
    return response.data;
  },

  createRevision: async (contentId: string, data: CreateRevisionRequest): Promise<Revision> => {
    const response = await apiClient.post<Revision>(`/admin/content/${contentId}/revisions`, data);
    return response.data;
  },

  restoreRevision: async (id: string): Promise<Content> => {
    const response = await apiClient.post<Content>(`/admin/content/revisions/${id}/restore`);
    return response.data;
  }
};