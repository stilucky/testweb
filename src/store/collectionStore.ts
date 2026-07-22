import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultCollections, type Collection } from "@/lib/collections";

export { defaultCollections } from "@/lib/collections";
export type { Collection } from "@/lib/collections";

interface CollectionStore {
  collections: Collection[];
  serverHydrated: boolean;
  serverInitialized: boolean;
  setCollections: (collections: Collection[]) => void;
  loadCollections: () => Promise<void>;
  syncCollections: () => Promise<void>;
  addCollection: (c: Omit<Collection, "id" | "createdAt">) => void;
  updateCollection: (id: string, data: Partial<Collection>) => void;
  removeCollection: (id: string) => void;
}

function mergeWithDefaultCollections(collections: Collection[]) {
  const merged = [...collections];
  const ids = new Set(collections.map((collection) => collection.id));
  defaultCollections.forEach((collection) => {
    if (!ids.has(collection.id)) merged.push(collection);
  });
  return merged;
}

export const useCollectionStore = create<CollectionStore>()(
  persist(
    (set, get) => ({
      collections: defaultCollections,
      serverHydrated: false,
      serverInitialized: false,

      setCollections: (collections) => set({ collections }),

      loadCollections: async () => {
        try {
          const res = await fetch("/api/collections", { cache: "no-store" });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json() as { collections?: Collection[]; initialized?: boolean };
          const serverCollections = Array.isArray(data.collections) ? data.collections : [];

          set((state) => ({
            collections: data.initialized
              ? serverCollections
              : mergeWithDefaultCollections(state.collections),
            serverHydrated: true,
            serverInitialized: data.initialized === true,
          }));
        } catch (err) {
          console.warn("[collections] Failed to load shared collections", err);
          set((state) => ({
            collections: mergeWithDefaultCollections(state.collections),
            serverHydrated: true,
          }));
        }
      },

      syncCollections: async () => {
        try {
          const res = await fetch("/api/collections", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ collections: get().collections }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          set({ serverInitialized: true, serverHydrated: true });
        } catch (err) {
          console.warn("[collections] Failed to save shared collections", err);
        }
      },

      addCollection: (data) => {
        const newCollection: Collection = {
          ...data,
          id: `col-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ collections: [newCollection, ...s.collections] }));
        queueMicrotask(() => void get().syncCollections());
      },

      updateCollection: (id, data) => {
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        }));
        queueMicrotask(() => void get().syncCollections());
      },

      removeCollection: (id) => {
        set((s) => ({
          collections: s.collections.filter((c) => c.id !== id),
        }));
        queueMicrotask(() => void get().syncCollections());
      },
    }),
    {
      name: "lunelle-collections",
      version: 2,
      partialize: (state) => ({ collections: state.collections }),
      migrate: (persisted, version) => {
        const saved = persisted as Partial<CollectionStore>;
        return {
          collections: version < 2
            ? mergeWithDefaultCollections(
                Array.isArray(saved.collections) ? saved.collections : []
              )
            : (Array.isArray(saved.collections) ? saved.collections : defaultCollections),
        };
      },
      merge: (persisted, current) => {
        const saved = persisted as Partial<CollectionStore>;
        return {
          ...current,
          collections: Array.isArray(saved.collections)
            ? saved.collections
            : current.collections,
          serverHydrated: false,
          serverInitialized: false,
        };
      },
    }
  )
);
