import { create } from "zustand";
import { persist } from "zustand/middleware";

export type HomeFeatureKey = "new-in" | "claire-de-lune";

export interface HomeFeature {
  key: HomeFeatureKey;
  title: string;
  href: string;
  image: string;
  imagePosition: string;
}

interface HomeFeatureStore {
  features: HomeFeature[];
  setFeatures: (features: HomeFeature[]) => void;
  updateFeature: (key: HomeFeatureKey, updates: Partial<Omit<HomeFeature, "key">>) => void;
}

export const defaultHomeFeatures: HomeFeature[] = [
  {
    key: "new-in",
    title: "New In",
    href: "/products?filter=new",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1600&q=90",
    imagePosition: "50% 35%",
  },
  {
    key: "claire-de-lune",
    title: "Claire de Lune",
    href: "/products?collection=claire-de-lune",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1600&q=90",
    imagePosition: "50% 30%",
  },
];

export const useHomeFeatureStore = create<HomeFeatureStore>()(
  persist(
    (set, get) => ({
      features: defaultHomeFeatures,
      setFeatures: (features) => set({ features }),
      updateFeature: (key, updates) => {
        set((state) => ({
          features: state.features.map((feature) =>
            feature.key === key ? { ...feature, ...updates } : feature
          ),
        }));

        if (typeof window !== "undefined") {
          fetch("/api/homepage", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ features: get().features }),
          }).catch((err) => console.warn("[homeFeatureStore] Failed to save homepage settings", err));
        }
      },
    }),
    {
      name: "lunelle-home-features",
      version: 2,
      migrate: (persisted) => persisted as HomeFeatureStore,
      skipHydration: true,
    }
  )
);
