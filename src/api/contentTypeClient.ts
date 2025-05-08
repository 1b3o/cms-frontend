// src/api/contentTypeClient.ts
import axios from 'axios';

// Import the shared token management
import { api } from './client';

// Types remain the same
export interface ContentType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  is_system: boolean;
  supports_revisions: boolean;
  supports_comments: boolean;
  created_at: string;
  updated_at: string;
  fields?: ContentField[];
}

export interface ContentField {
  id: string;
  content_type_id: string;
  name: string;
  slug: string;
  field_type: string;
  description?: string;
  is_required: boolean;
  is_unique: boolean;
  validation_rules?: any;
  default_value?: any;
  ui_config?: any;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateContentTypeRequest {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  is_system?: boolean;
  supports_revisions?: boolean;
  supports_comments?: boolean;
}

export interface UpdateContentTypeRequest {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  is_system?: boolean;
  supports_revisions?: boolean;
  supports_comments?: boolean;
}

export interface CreateContentFieldRequest {
  content_type_id: string; // Added to match backend expectation
  name: string;
  slug: string;
  field_type: string;
  description?: string;
  is_required?: boolean;
  is_unique?: boolean;
  validation_rules?: any;
  default_value?: any;
  ui_config?: any;
  sort_order?: number;
}

export interface UpdateContentFieldRequest {
  name?: string;
  slug?: string;
  field_type?: string;
  description?: string;
  is_required?: boolean;
  is_unique?: boolean;
  validation_rules?: any;
  default_value?: any;
  ui_config?: any;
  sort_order?: number;
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

// Content Type API Methods
export const contentTypeApi = {
  // Content Types
  getAllContentTypes: async (): Promise<ContentType[]> => {
    const response = await apiClient.get<ContentType[]>('/admin/content-types');
    return response.data;
  },

  getContentType: async (id: string): Promise<ContentType> => {
    const response = await apiClient.get<ContentType>(`/admin/content-types/${id}`);
    return response.data;
  },

  getContentTypeBySlug: async (slug: string): Promise<ContentType> => {
    const response = await apiClient.get<ContentType>(`/admin/content-types/slug/${slug}`);
    return response.data;
  },

  createContentType: async (data: CreateContentTypeRequest): Promise<ContentType> => {
    const response = await apiClient.post<ContentType>('/admin/content-types', data);
    return response.data;
  },

  updateContentType: async (id: string, data: UpdateContentTypeRequest): Promise<ContentType> => {
    const response = await apiClient.put<ContentType>(`/admin/content-types/${id}`, data);
    return response.data;
  },

  deleteContentType: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/content-types/${id}`);
  },

  // Content Fields
  getContentTypeFields: async (contentTypeId: string): Promise<ContentField[]> => {
    const response = await apiClient.get<ContentField[]>(`/admin/content-types/${contentTypeId}/fields`);
    return response.data;
  },

  createContentField: async (contentTypeId: string, data: CreateContentFieldRequest): Promise<ContentField> => {
    const response = await apiClient.post<ContentField>(`/admin/content-types/${contentTypeId}/fields`, data);
    return response.data;
  },

  getContentField: async (contentTypeId: string, fieldId: string): Promise<ContentField> => {
    const response = await apiClient.get<ContentField>(`/admin/content-types/${contentTypeId}/fields/${fieldId}`);
    return response.data;
  },

  updateContentField: async (contentTypeId: string, fieldId: string, data: UpdateContentFieldRequest): Promise<ContentField> => {
    const response = await apiClient.put<ContentField>(`/admin/content-types/${contentTypeId}/fields/${fieldId}`, data);
    return response.data;
  },

  deleteContentField: async (contentTypeId: string, fieldId: string): Promise<void> => {
    await apiClient.delete(`/admin/content-types/${contentTypeId}/fields/${fieldId}`);
  },

  reorderContentFields: async (contentTypeId: string, fieldIds: string[]): Promise<void> => {
    await apiClient.post(`/admin/content-types/${contentTypeId}/fields/reorder`, fieldIds);
  }
};