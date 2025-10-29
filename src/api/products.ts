/**
 * Product API Layer
 * 
 * Connected to backend API with Supabase integration
 */

import api from '@/lib/api';
import { Product } from '@/data/dummyData';

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const getProducts = async (filters?: ProductFilters): Promise<ProductsResponse> => {
  const response = await api.get('/products', { params: filters });
  return response.data;
};

export const getProduct = async (id: string): Promise<Product> => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
  const response = await api.post('/products', product);
  return response.data;
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
  const response = await api.put(`/products/${id}`, updates);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};

export const getCategories = async (): Promise<{ categories: string[] }> => {
  const response = await api.get('/products/categories');
  return response.data;
};

export const uploadProductImages = async (files: File[]): Promise<{ urls: string[] }> => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });
  
  const response = await api.post('/products/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};
