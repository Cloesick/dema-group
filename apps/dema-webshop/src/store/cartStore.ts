import { create } from 'zustand';
import { Product } from '@/types/product';

interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  itemCount: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  
  addToCart: (product) =>
    set((state) => {
      const existingItem = state.items.find((item) => item.sku === product.sku);
      
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.sku === product.sku
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      
      return {
        items: [...state.items, { ...product, quantity: 1 }],
      };
    }),
  
  removeFromCart: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.sku !== productId),
    })),
  
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.sku === productId ? { ...item, quantity } : item
      ),
    })),
  
  clearCart: () => set({ items: [] }),
  
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  
  itemCount: () => get().items.reduce((total, item) => total + item.quantity, 0),
  
  totalPrice: () =>
    get().items.reduce(
      (total, item) => total + (item.sku.length * 10) * item.quantity,
      0
    ),
}));
