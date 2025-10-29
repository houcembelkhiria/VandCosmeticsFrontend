import api from '@/lib/api';

export interface Parameter {
  id: string;
  key: string;
  value: string;
  description?: string;
  type: 'text' | 'decimal' | 'integer' | 'boolean' | 'json';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateParameterData {
  key: string;
  value: string;
  description?: string;
  type?: 'text' | 'decimal' | 'integer' | 'boolean' | 'json';
  is_active?: boolean;
}

export interface UpdateParameterData {
  key?: string;
  value?: string;
  description?: string;
  type?: 'text' | 'decimal' | 'integer' | 'boolean' | 'json';
  is_active?: boolean;
}

export const getParameters = async (): Promise<{ parameters: Parameter[] }> => {
  const response = await api.get('/parameters');
  return response.data;
};

export const getParameter = async (id: string): Promise<Parameter> => {
  const response = await api.get(`/parameters/${id}`);
  return response.data;
};

export const getParameterByKey = async (key: string): Promise<Parameter> => {
  const response = await api.get(`/parameters/key/${key}`);
  return response.data;
};

export const createParameter = async (parameterData: CreateParameterData): Promise<Parameter> => {
  const response = await api.post('/parameters', parameterData);
  return response.data;
};

export const updateParameter = async (id: string, parameterData: UpdateParameterData): Promise<Parameter> => {
  const response = await api.put(`/parameters/${id}`, parameterData);
  return response.data;
};

export const deleteParameter = async (id: string): Promise<void> => {
  await api.delete(`/parameters/${id}`);
};

