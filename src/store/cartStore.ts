"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "@/types";
import { CAD_RATE } from "@/store/localeStore";

export function productCadPrice(product: Product): number {
  if (product.salePriceCAD !== undefined) return product.salePriceCAD;
  if (product.priceCAD !== undefined) return product.priceCAD;
  return Math.round((product.salePrice ?? product.price) * CAD_RATE * 100) / 100;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, size: string, color: string) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, qty: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, size, color) => {
        const existing = get().items.find(
          (i) => i.product.id === product.id && i.selectedSize === size && i.selectedColor === color
        );
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.product.id === product.id && i.selectedSize === size && i.selectedColor === color
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          }));
        } else {
          set((state) => ({
            items: [...state.items, { product, quantity: 1, selectedSize: size, selectedColor: color }],
          }));
        }
        get().openCart();
      },

      removeItem: (productId, size, color) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product.id === productId && i.selectedSize === size && i.selectedColor === color)
          ),
        }));
      },

      updateQuantity: (productId, size, color, qty) => {
        if (qty <= 0) {
          get().removeItem(productId, size, color);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId && i.selectedSize === size && i.selectedColor === color
              ? { ...i, quantity: qty }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      total: () =>
        get().items.reduce(
          (sum, item) => sum + productCadPrice(item.product) * item.quantity,
          0
        ),

      itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: "Lunelle-cart" }
  )
);
