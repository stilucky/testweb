import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  season: string;
  status: "active" | "draft";
  featured: boolean;
  productIds: string[];
  createdAt: string;
}

interface CollectionStore {
  collections: Collection[];
  addCollection: (c: Omit<Collection, "id" | "createdAt">) => void;
  updateCollection: (id: string, data: Partial<Collection>) => void;
  removeCollection: (id: string) => void;
}

const defaultCollections: Collection[] = [
  {
    id: "col-1",
    name: "Pre-Fall 2026",
    slug: "pre-fall-2026",
    description: "A refined transition into the cooler season — understated layers, warm neutrals, and quiet confidence.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    season: "Fall/Winter 2026",
    status: "active",
    featured: true,
    productIds: [],
    createdAt: "2026-01-15T00:00:00.000Z",
  },
  {
    id: "col-2",
    name: "Clair de Lune",
    slug: "claire-de-lune",
    description: "Luminous, moonlit pieces for evenings and occasions that deserve a second look.",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80",
    season: "Spring/Summer 2026",
    status: "active",
    featured: true,
    productIds: [],
    createdAt: "2026-02-10T00:00:00.000Z",
  },
  {
    id: "col-3",
    name: "Atelier Edit",
    slug: "atelier-edit",
    description: "A curated selection from our atelier — timeless investment pieces crafted to last a lifetime.",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80",
    season: "Year-Round",
    status: "draft",
    featured: false,
    productIds: [],
    createdAt: "2026-03-01T00:00:00.000Z",
  },
];

export const useCollectionStore = create<CollectionStore>()(
  persist(
    (set, get) => ({
      collections: defaultCollections,

      addCollection: (data) => {
        const newCollection: Collection = {
          ...data,
          id: `col-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ collections: [newCollection, ...s.collections] }));
      },

      updateCollection: (id, data) => {
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        }));
      },

      removeCollection: (id) => {
        set((s) => ({
          collections: s.collections.filter((c) => c.id !== id),
        }));
      },
    }),
    { name: "lunelle-collections" }
  )
);
