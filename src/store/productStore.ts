import { create } from "zustand";
import { persist } from "zustand/middleware";
import { products as initialProducts } from "@/lib/data";
import type { Product } from "@/types";

interface ProductState {
  products: Product[];
  hydrated: boolean;
  setProducts: (list: Product[]) => void;
  addProduct: (p: Product) => void;
  updateProduct: (p: Product) => void;
  removeProduct: (id: string) => void;
  setHydrated: () => void;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      products: initialProducts,
      hydrated: false,

      setHydrated: () => set({ hydrated: true }),

      setProducts: (list) => set({ products: list }),

      addProduct: (p) =>
        set((s) => ({ products: [p, ...s.products] })),

      updateProduct: (p) =>
        set((s) => ({
          products: s.products.map((x) => (x.id === p.id ? p : x)),
        })),

      removeProduct: (id) =>
        set((s) => ({ products: s.products.filter((x) => x.id !== id) })),
    }),
    { name: "lunelle-products" }
  )
);
