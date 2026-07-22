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
  setProductCollections: (productId: string, collectionIds: string[]) => void;
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

function upgradeLegacyCollections(collections: Collection[]) {
  return mergeWithDefaultCollections(collections).map((collection) => {
    // Atelier Edit shipped as a draft placeholder. It is now a public collection.
    if (collection.id === "col-3" && collection.slug === "atelier-edit") {
      return { ...collection, status: "active" as const };
    }
    return collection;
  });
}

function hasLocalCollectionData(collections: Collection[]) {
  const defaultIds = new Set(defaultCollections.map((collection) => collection.id));
  return collections.some((collection) =>
    collection.productIds.length > 0 || !defaultIds.has(collection.id)
  );
}

async function saveCollections(collections: Collection[]) {
  const res = await fetch("/api/collections", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collections }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export const useCollectionStore = create<CollectionStore>()(
  persist(
    (set, get) => ({
      collections: defaultCollections,
      serverHydrated: false,
      serverInitialized: false,

      setCollections: (collections) => set({ collections }),

      loadCollections: async () => {
        const localCollections = mergeWithDefaultCollections(get().collections);
        try {
          const res = await fetch("/api/collections", { cache: "no-store" });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json() as { collections?: Collection[]; initialized?: boolean };
          const serverCollections = Array.isArray(data.collections) ? data.collections : [];

          const nextCollections = data.initialized
            ? mergeWithDefaultCollections(serverCollections)
            : localCollections;

          set({
            collections: nextCollections,
            serverHydrated: true,
            serverInitialized: data.initialized === true,
          });

          // Before shared storage existed, collection assignments lived only in
          // this browser. Seed the server automatically from a browser that has
          // real assignments; a fresh device with defaults must never overwrite it.
          if (!data.initialized && hasLocalCollectionData(localCollections)) {
            await saveCollections(localCollections);
            set({ serverInitialized: true });
          }
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
          await saveCollections(get().collections);
          set({ serverInitialized: true, serverHydrated: true });
        } catch (err) {
          console.warn("[collections] Failed to save shared collections", err);
        }
      },

      setProductCollections: (productId, collectionIds) => {
        const selectedIds = new Set(collectionIds);
        set((state) => ({
          collections: state.collections.map((collection) => {
            const productIds = collection.productIds.filter((id) => id !== productId);
            return selectedIds.has(collection.id)
              ? { ...collection, productIds: [...productIds, productId] }
              : { ...collection, productIds };
          }),
        }));
        queueMicrotask(() => void get().syncCollections());
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
      version: 3,
      partialize: (state) => ({ collections: state.collections }),
      migrate: (persisted, version) => {
        const saved = persisted as Partial<CollectionStore>;
        const savedCollections = Array.isArray(saved.collections)
          ? saved.collections
          : defaultCollections;
        return {
          collections: version < 3
            ? upgradeLegacyCollections(savedCollections)
            : mergeWithDefaultCollections(savedCollections),
        };
      },
      merge: (persisted, current) => {
        const saved = persisted as Partial<CollectionStore>;
        return {
          ...current,
          collections: Array.isArray(saved.collections)
            ? mergeWithDefaultCollections(saved.collections)
            : current.collections,
          serverHydrated: false,
          serverInitialized: false,
        };
      },
    }
  )
);
