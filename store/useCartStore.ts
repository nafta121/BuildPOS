import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types/database';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { 
                      ...item, 
                      cart_quantity: Number((item.cart_quantity + quantity).toFixed(2)),
                      subtotal: Number(((item.cart_quantity + quantity) * item.selling_price).toFixed(2))
                    }
                  : item
              ),
            };
          }
          return {
            items: [...state.items, { ...product, cart_quantity: quantity, subtotal: Number((quantity * product.selling_price).toFixed(2)) }],
          };
        });
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId
              ? { 
                  ...item, 
                  cart_quantity: Number(quantity.toFixed(2)),
                  subtotal: Number((quantity * item.selling_price).toFixed(2))
                }
              : item
          ),
        }));
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalAmount: () => {
        return get().items.reduce((total, item) => total + item.subtotal, 0);
      },
    }),
    {
      name: 'buildpos-cart-storage', // Saves cart to localStorage
    }
  )
);
