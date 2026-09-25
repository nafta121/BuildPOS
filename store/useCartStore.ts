// store/useCartStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types/database';

/**
 * Helper to round to 2 decimal places using Number.EPSILON
 * Eliminates JavaScript floating-point representation quirks.
 */
export const round2 = (val: number): number => {
  return Math.round((val + Number.EPSILON) * 100) / 100;
};

/**
 * Calculates item subtotal = quantity * sellingPrice with 2-decimal precision
 */
export const calcSubtotal = (qty: number, price: number): number => {
  return Math.round((qty * price + Number.EPSILON) * 100) / 100;
};

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
  getTotalQuantity: () => number;
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
        // Enforce positive decimal quantity with 2-decimal precision
        const cleanQty = Math.max(0.01, round2(quantity));

        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.id === product.id);

          if (existingIndex > -1) {
            const existing = state.items[existingIndex];
            const newQty = round2(existing.cart_quantity + cleanQty);
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...existing,
              cart_quantity: newQty,
              subtotal: calcSubtotal(newQty, existing.selling_price),
            };

            return {
              selectedProductId: product.id,
              items: updatedItems,
            };
          }

          // New cart item
          const newCartItem: CartItem = {
            ...product,
            cart_quantity: cleanQty,
            subtotal: calcSubtotal(cleanQty, product.selling_price),
          };

          return {
            selectedProductId: product.id,
            items: [...state.items, newCartItem],
          };
        });
      },

      updateQuantity: (productId, quantity) => {
        const cleanQty = round2(quantity);

        set((state) => {
          // If quantity is zero or negative, remove from cart
          if (cleanQty <= 0) {
            return {
              items: state.items.filter((item) => item.id !== productId),
              selectedProductId:
                state.selectedProductId === productId ? null : state.selectedProductId,
            };
          }

          return {
            items: state.items.map((item) =>
              item.id === productId
                ? {
                    ...item,
                    cart_quantity: cleanQty,
                    subtotal: calcSubtotal(cleanQty, item.selling_price),
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

          const newQty = round2(item.cart_quantity + delta);
          if (newQty <= 0) {
            return {
              items: state.items.filter((i) => i.id !== productId),
              selectedProductId:
                state.selectedProductId === productId ? null : state.selectedProductId,
            };
          }

          return {
            items: state.items.map((i) =>
              i.id === productId
                ? {
                    ...i,
                    cart_quantity: newQty,
                    subtotal: calcSubtotal(newQty, i.selling_price),
                  }
                : i
            ),
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
          selectedProductId:
            state.selectedProductId === productId ? null : state.selectedProductId,
        }));
      },

      clearCart: () => set({ items: [], selectedProductId: null }),

      // Total amount calculation using integer cents accumulation to prevent float drift
      getTotalAmount: () => {
        const totalCents = get().items.reduce((accum, item) => {
          return accum + Math.round(item.subtotal * 100);
        }, 0);
        return totalCents / 100;
      },

      // Sum of all decimal quantities (e.g. 1.5 + 2.5 = 4)
      getTotalQuantity: () => {
        const totalQty = get().items.reduce((accum, item) => accum + item.cart_quantity, 0);
        return round2(totalQty);
      },

      getTotalItemsCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'buildpos-cart-storage',
    }
  )
);
