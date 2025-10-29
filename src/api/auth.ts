/**
 * Authentication API Layer
 * 
 * Connected to backend API with Supabase integration
 */

import api from '@/lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const getProfile = async (): Promise<User> => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const updateProfile = async (name: string): Promise<User> => {
  const response = await api.put('/auth/profile', { name });
  return response.data;
};
