// src/api/taxonomyClient.ts
import axios from 'axios';

// Import the shared token management
import { api } from './client';

// Types
export interface Taxonomy {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_hierarchical: boolean;
  created_at: string;
  updated_at: string;
  terms?: TaxonomyTerm[];
}

export interface TaxonomyTerm {
  id: string;
  taxonomy_id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  path?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  children?: TaxonomyTerm[];
}

export interface CreateTaxonomyRequest {
  name: string;
  slug: string;
  description?: string;
  is_hierarchical?: boolean;
}

export interface UpdateTaxonomyRequest {
  name?: string;
  slug?: string;
  description?: string;
  is_hierarchical?: boolean;
}

export interface CreateTaxonomyTermRequest {
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  sort_order?: number;
}

export interface UpdateTaxonomyTermRequest {
  name?: string;
  slug?: string;
  description?: string;
  parent_id?: string;
  sort_order?: number;
}

export interface AssignTaxonomyTermsRequest {
  term_ids: string[];
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

// Taxonomy API Methods
export const taxonomyApi = {
  // Taxonomies
  getAllTaxonomies: async (): Promise<Taxonomy[]> => {
    const response = await apiClient.get<Taxonomy[]>('/admin/taxonomies');
    return response.data;
  },

  getTaxonomy: async (id: string): Promise<Taxonomy> => {
    const response = await apiClient.get<Taxonomy>(`/admin/taxonomies/${id}`);
    return response.data;
  },

  getTaxonomyBySlug: async (slug: string): Promise<Taxonomy> => {
    const response = await apiClient.get<Taxonomy>(`/admin/taxonomies/slug/${slug}`);
    return response.data;
  },

  createTaxonomy: async (data: CreateTaxonomyRequest): Promise<Taxonomy> => {
    const response = await apiClient.post<Taxonomy>('/admin/taxonomies', data);
    return response.data;
  },

  updateTaxonomy: async (id: string, data: UpdateTaxonomyRequest): Promise<Taxonomy> => {
    const response = await apiClient.put<Taxonomy>(`/admin/taxonomies/${id}`, data);
    return response.data;
  },

  deleteTaxonomy: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/taxonomies/${id}`);
  },

  // Taxonomy Terms
  getTaxonomyTerms: async (taxonomyId: string): Promise<TaxonomyTerm[]> => {
    const response = await apiClient.get<TaxonomyTerm[]>(`/admin/taxonomies/${taxonomyId}/terms`);
    return response.data;
  },

  createTaxonomyTerm: async (taxonomyId: string, data: CreateTaxonomyTermRequest): Promise<TaxonomyTerm> => {
    const response = await apiClient.post<TaxonomyTerm>(`/admin/taxonomies/${taxonomyId}/terms`, data);
    return response.data;
  },

  getTaxonomyTerm: async (taxonomyId: string, termId: string): Promise<TaxonomyTerm> => {
    const response = await apiClient.get<TaxonomyTerm>(`/admin/taxonomies/${taxonomyId}/terms/${termId}`);
    return response.data;
  },

  updateTaxonomyTerm: async (taxonomyId: string, termId: string, data: UpdateTaxonomyTermRequest): Promise<TaxonomyTerm> => {
    const response = await apiClient.put<TaxonomyTerm>(`/admin/taxonomies/${taxonomyId}/terms/${termId}`, data);
    return response.data;
  },

  deleteTaxonomyTerm: async (taxonomyId: string, termId: string): Promise<void> => {
    await apiClient.delete(`/admin/taxonomies/${taxonomyId}/terms/${termId}`);
  },

  reorderTaxonomyTerms: async (taxonomyId: string, termIds: string[]): Promise<void> => {
    await apiClient.post(`/admin/taxonomies/${taxonomyId}/terms/reorder`, termIds);
  },

  // Content-Term Relations
  assignTermsToContent: async (contentId: string, data: AssignTaxonomyTermsRequest): Promise<void> => {
    await apiClient.post(`/admin/taxonomies/content/${contentId}/terms`, data);
  },

  getContentTerms: async (contentId: string): Promise<TaxonomyTerm[]> => {
    const response = await apiClient.get<TaxonomyTerm[]>(`/admin/taxonomies/content/${contentId}/terms`);
    return response.data;
  }
};