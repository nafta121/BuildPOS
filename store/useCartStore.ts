// store/useCartStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types/database';

interface CartState {
  items: CartItem[];
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  incrementQuantity: (productId: string, delta: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItemsCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedProductId: null,

      setSelectedProductId: (id: string | null) => {
        set({ selectedProductId: id });
      },
      
      addItem: (product, quantity = 1) => {
        const cleanQty = Math.max(0.01, Number(quantity.toFixed(2)));
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);
          if (existingItem) {
            const newQty = Number((existingItem.cart_quantity + cleanQty).toFixed(2));
            return {
              selectedProductId: product.id,
              items: state.items.map((item) =>
                item.id === product.id
                  ? { 
                      ...item, 
                      cart_quantity: newQty,
                      subtotal: Number((newQty * item.selling_price).toFixed(2))
                    }
                  : item
              ),
            };
          }
          return {
            selectedProductId: product.id,
            items: [
              ...state.items, 
              { 
                ...product, 
                cart_quantity: cleanQty, 
                subtotal: Number((cleanQty * product.selling_price).toFixed(2)) 
              }
            ],
          };
        });
      },

      updateQuantity: (productId, quantity) => {
        const cleanQty = Math.max(0, Number(quantity.toFixed(2)));
        set((state) => {
          if (cleanQty <= 0) {
            return {
              items: state.items.filter((item) => item.id !== productId),
              selectedProductId: state.selectedProductId === productId ? null : state.selectedProductId,
            };
          }
          return {
            items: state.items.map((item) =>
              item.id === productId
                ? { 
                    ...item, 
                    cart_quantity: cleanQty, 
                    subtotal: Number((cleanQty * item.selling_price).toFixed(2))
                  }
                : item
            ),
          };
        });
      },

      incrementQuantity: (productId, delta) => {
        set((state) => {
          const item = state.items.find((i) => i.id === productId);
          if (!item) return state;
          const newQty = Math.max(0.1, Number((item.cart_quantity + delta).toFixed(2)));
          return {
            items: state.items.map((i) =>
              i.id === productId
                ? {
                    ...i,
                    cart_quantity: newQty,
                    subtotal: Number((newQty * i.selling_price).toFixed(2)),
                  }
                : i
            ),
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
          selectedProductId: state.selectedProductId === productId ? null : state.selectedProductId,
        }));
      },

      clearCart: () => set({ items: [], selectedProductId: null }),

      getTotalAmount: () => {
        return get().items.reduce((total, item) => total + item.subtotal, 0);
      },

      getTotalItemsCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'buildpos-cart-storage', // Saves cart to localStorage
    }
  )
);
