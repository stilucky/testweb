"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types";

interface WishlistStore {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
  itemCount: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        if (!get().isWishlisted(product.id)) {
          set((state) => ({ items: [...state.items, product] }));
        }
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((p) => p.id !== productId),
        }));
      },

      toggleItem: (product) => {
        if (get().isWishlisted(product.id)) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },

      isWishlisted: (productId) =>
        get().items.some((p) => p.id === productId),

      clearWishlist: () => set({ items: [] }),

      itemCount: () => get().items.length,
    }),
    { name: "Lunelle-wishlist" }
  )
);
