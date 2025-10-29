import api from '@/lib/api';

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  sort_order?: number;
  is_active?: boolean;
}

export const getCategories = async (): Promise<{ categories: Category[] }> => {
  const response = await api.get('/categories');
  return response.data;
};

export const getCategory = async (id: string): Promise<Category> => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

export const createCategory = async (categoryData: CreateCategoryData): Promise<Category> => {
  const response = await api.post('/categories', categoryData);
  return response.data;
};

export const updateCategory = async (id: string, categoryData: UpdateCategoryData): Promise<Category> => {
  const response = await api.put(`/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/categories/${id}`);
};

export const getCategoryProducts = async (id: string, page = 1, limit = 20) => {
  const response = await api.get(`/categories/${id}/products?page=${page}&limit=${limit}`);
  return response.data;
};
