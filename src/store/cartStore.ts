/**
 * Cart State Management with Zustand
 * Persists to localStorage for cross-session cart retention
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  variantId?: string;
  title: string;
  image: string;
  quantity: number;
  unitPrice: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  applyCoupon: (code: string) => { success: boolean; discount: number };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          );

          if (existingIndex !== -1) {
            // Item exists, update quantity
            const newItems = [...state.items];
            newItems[existingIndex].quantity += item.quantity || 1;
            return { items: newItems };
          } else {
            // New item
            return {
              items: [
                ...state.items,
                { ...item, quantity: item.quantity || 1 }
              ]
            };
          }
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          )
        }));
      },

      updateQuantity: (productId, quantity, variantId) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (i) => !(i.productId === productId && i.variantId === variantId)
              )
            };
          }

          const newItems = state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity }
              : i
          );
          return { items: newItems };
        });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.unitPrice * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      applyCoupon: (code) => {
        // Simple demo coupon logic
        const validCoupons: Record<string, number> = {
          'CODE10': 0.10,
          'SAVE15': 0.15,
          'WELCOME20': 0.20
        };

        const discountRate = validCoupons[code.toUpperCase()];
        if (discountRate) {
          const total = get().getTotal();
          return {
            success: true,
            discount: total * discountRate
          };
        }

        return { success: false, discount: 0 };
      }
    }),
    {
      name: 'vanda-cart-storage'
    }
  )
);
