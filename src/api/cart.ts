/**
 * Cart API Layer
 * 
 * Handles cart operations for authenticated users
 */

import api from '@/lib/api';

export interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  products: {
    id: string;
    title: string;
    price: number;
    images: string[];
    stock: number;
  };
}

export interface AddToCartData {
  productId: string;
  variantId?: string;
  quantity?: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

export const getCart = async (): Promise<{ items: CartItem[] }> => {
  const response = await api.get('/cart');
  return response.data;
};

export const addToCart = async (data: AddToCartData): Promise<CartItem> => {
  const response = await api.post('/cart', data);
  return response.data;
};

export const updateCartItem = async (itemId: string, data: UpdateCartItemData): Promise<CartItem> => {
  const response = await api.put(`/cart/${itemId}`, data);
  return response.data;
};

export const removeFromCart = async (itemId: string): Promise<void> => {
  await api.delete(`/cart/${itemId}`);
};

export const clearCart = async (): Promise<void> => {
  await api.delete('/cart');
};
