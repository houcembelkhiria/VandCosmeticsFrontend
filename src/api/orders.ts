/**
 * Orders API Layer
 * 
 * Currently stores orders in localStorage, but provides interface
 * for backend integration. To connect to real API:
 * 
 * 1. Replace localStorage with axios/fetch calls
 * 2. Add authentication token to headers
 * 3. Handle server-side order ID generation
 * 
 * Example: const response = await axios.post('/api/orders', orderData);
 */

import { Order, orders as initialOrders } from '@/data/dummyData';

const STORAGE_KEY = 'vanda_orders';

const getStoredOrders = (): Order[] => {
  if (typeof window === 'undefined') return initialOrders;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialOrders));
    return initialOrders;
  }
  return JSON.parse(stored);
};

const saveOrders = (orders: Order[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }
};

const generateOrderId = (): string => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `VANDA-${date}-${random}`;
};

export const createOrder = async (orderData: Omit<Order, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
  // TODO: Replace with: const response = await axios.post('/api/orders', orderData);
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newOrder: Order = {
    ...orderData,
    id: generateOrderId(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const orders = getStoredOrders();
  orders.push(newOrder);
  saveOrders(orders);
  
  return newOrder;
};

export const getOrder = async (id: string): Promise<Order | null> => {
  // TODO: Replace with: const response = await axios.get(`/api/orders/${id}`);
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const orders = getStoredOrders();
  return orders.find(o => o.id === id) || null;
};

export const getOrders = async (userId?: string): Promise<Order[]> => {
  // TODO: Replace with: const response = await axios.get('/api/orders', { params: { userId } });
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const orders = getStoredOrders();
  
  if (userId) {
    return orders.filter(o => o.userId === userId);
  }
  
  return orders;
};
