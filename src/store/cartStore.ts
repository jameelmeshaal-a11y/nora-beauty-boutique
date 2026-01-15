import { create } from "zustand";
import { Product } from "@/data/products";

export interface CartItem {
  product: Product;
  quantity: number;
  isSample?: boolean;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  
  addItem: (product: Product) => {
    const { items } = get();
    const existingItem = items.find((item) => item.product.id === product.id && !item.isSample);
    
    if (existingItem) {
      set({
        items: items.map((item) =>
          item.product.id === product.id && !item.isSample
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      const newItems = [...items, { product, quantity: 1 }];
      
      // Add free sample if product has one
      if (product.hasSample) {
        const sampleExists = items.some(
          (item) => item.isSample && item.product.id === `sample-${product.id}`
        );
        
        if (!sampleExists) {
          const sampleProduct: Product = {
            id: `sample-${product.id}`,
            name: `عينة ${product.name}`,
            nameEn: `${product.nameEn} Sample`,
            price: 0,
            image: product.image,
            description: "عينة مجانية",
            rating: product.rating,
            reviews: 0,
            inStock: true,
            shades: 0,
            category: product.category,
          };
          newItems.push({ product: sampleProduct, quantity: 1, isSample: true });
        }
      }
      
      set({ items: newItems });
    }
  },
  
  removeItem: (productId: string) => {
    set({ items: get().items.filter((item) => item.product.id !== productId) });
  },
  
  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    });
  },
  
  clearCart: () => set({ items: [] }),
  
  toggleCart: () => set({ isOpen: !get().isOpen }),
  
  total: () => {
    return get().items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  },
  
  itemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
