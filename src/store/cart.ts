import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItemData {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  quantity: number;
  babyName: string;
  birthDate: string;
  birthWeight: string;
  birthHeight: string;
  birthTime?: string;
  customNote?: string;
  /** Chosen poster design variant, e.g. "origin-1". Only set for poster items. */
  posterLayout?: string;
  /** Label of the chosen design for display, e.g. "Origin 1". */
  posterLayoutLabel?: string;
  /** Chosen variant label (e.g. "Digitális", "Nyomtatott", giftcard option). */
  variant?: string;
}

interface CartStore {
  items: CartItemData[];
  addItem: (item: Omit<CartItemData, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const id = crypto.randomUUID();
        set((state) => ({
          items: [...state.items, { ...item, id }],
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'nola-cart' }
  )
);
