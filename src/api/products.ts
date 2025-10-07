/**
 * Product API Layer
 * 
 * Currently reads from dummy data, but provides a clean interface
 * for future backend integration. To connect to a real API:
 * 
 * 1. Replace localStorage/dummy data access with fetch/axios calls
 * 2. Update the base URL in environment variables
 * 3. Add authentication headers as needed
 * 
 * Example backend integration:
 * const response = await axios.get(`${API_BASE_URL}/products`);
 * return response.data;
 */

import { products as initialProducts, Product } from '@/data/dummyData';

const STORAGE_KEY = 'vanda_products';

// Initialize localStorage with dummy data if empty
const getStoredProducts = (): Product[] => {
  if (typeof window === 'undefined') return initialProducts;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts));
    return initialProducts;
  }
  return JSON.parse(stored);
};

const saveProducts = (products: Product[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }
};

export const getProducts = async (filters?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}): Promise<Product[]> => {
  // TODO: Replace with: const response = await axios.get('/api/products', { params: filters });
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  
  let products = getStoredProducts();
  
  if (filters) {
    if (filters.category) {
      products = products.filter(p => p.category === filters.category);
    }
    if (filters.minPrice !== undefined) {
      products = products.filter(p => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      products = products.filter(p => p.price <= filters.maxPrice!);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }
  }
  
  return products;
};

export const getProduct = async (id: string): Promise<Product | null> => {
  // TODO: Replace with: const response = await axios.get(`/api/products/${id}`);
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const products = getStoredProducts();
  return products.find(p => p.id === id || p.slug === id) || null;
};

export const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
  // TODO: Replace with: const response = await axios.post('/api/products', product);
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const newProduct: Product = {
    ...product,
    id: `vanda-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const products = getStoredProducts();
  products.push(newProduct);
  saveProducts(products);
  
  return newProduct;
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
  // TODO: Replace with: const response = await axios.patch(`/api/products/${id}`, updates);
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const products = getStoredProducts();
  const index = products.findIndex(p => p.id === id);
  
  if (index === -1) {
    throw new Error(`Product with id ${id} not found`);
  }
  
  const updatedProduct = {
    ...products[index],
    ...updates,
    id: products[index].id, // Ensure ID doesn't change
    updatedAt: new Date().toISOString()
  };
  
  products[index] = updatedProduct;
  saveProducts(products);
  
  return updatedProduct;
};

export const deleteProduct = async (id: string): Promise<void> => {
  // TODO: Replace with: await axios.delete(`/api/products/${id}`);
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const products = getStoredProducts();
  const filtered = products.filter(p => p.id !== id);
  saveProducts(filtered);
};
