/**
 * Orders API Layer
 * 
 * Connected to backend API with Supabase integration
 */

import api from '@/lib/api';
import { Order } from '@/data/dummyData';

export interface OrderFilters {
  status?: string;
  page?: number;
  limit?: number;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateOrderData {
  customerEmail: string;
  customerName: string;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
    title: string;
    image?: string;
  }>;
  shipping: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    deliveryFee?: number;
    isFreeDelivery?: boolean;
  };
  subtotal: number;
  discount: number;
  total: number;
}

export const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getOrder = async (id: string): Promise<Order> => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const getOrders = async (filters?: OrderFilters): Promise<OrdersResponse> => {
  const response = await api.get('/orders', { params: filters });
  return response.data;
};

export const updateOrderStatus = async (id: string, status: string): Promise<Order> => {
  const response = await api.put(`/orders/${id}/status`, { status });
  return response.data;
};

export const getOrderAnalytics = async () => {
  const response = await api.get('/orders/admin/analytics');
  return response.data;
};

export const deleteOrder = async (id: string): Promise<void> => {
  await api.delete(`/orders/${id}`);
};
