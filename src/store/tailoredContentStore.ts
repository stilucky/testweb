import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TailoredImageKey =
  | "overviewMadeToOrder"
  | "overviewCustomizedFit"
  | "overviewClosing"
  | "madeToOrderHero"
  | "customizedFitHero";

export interface TailoredImage {
  key: TailoredImageKey;
  title: string;
  image: string;
  imagePosition: string;
}

interface TailoredContentStore {
  images: TailoredImage[];
  setImages: (images: TailoredImage[]) => void;
  updateImage: (key: TailoredImageKey, updates: Partial<Omit<TailoredImage, "key">>) => void;
}

export const defaultTailoredImages: TailoredImage[] = [
  {
    key: "overviewMadeToOrder",
    title: "Made to Order",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1200&q=80",
    imagePosition: "50% 0%",
  },
  {
    key: "overviewCustomizedFit",
    title: "Customized Fit",
    image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1200&q=80",
    imagePosition: "50% 0%",
  },
  {
    key: "overviewClosing",
    title: "Tailored Closing",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80",
    imagePosition: "50% 50%",
  },
  {
    key: "madeToOrderHero",
    title: "Made to Order Hero",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80",
    imagePosition: "50% 0%",
  },
  {
    key: "customizedFitHero",
    title: "Customized Fit Hero",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1600&q=80",
    imagePosition: "50% 0%",
  },
];

function mergeTailoredImages(images: TailoredImage[] | undefined) {
  return defaultTailoredImages.map((fallback) => ({
    ...fallback,
    ...(images?.find((image) => image.key === fallback.key) ?? {}),
  }));
}

export const useTailoredContentStore = create<TailoredContentStore>()(
  persist(
    (set, get) => ({
      images: defaultTailoredImages,
      setImages: (images) => set({ images: mergeTailoredImages(images) }),
      updateImage: (key, updates) => {
        set((state) => ({
          images: mergeTailoredImages(
            state.images.map((image) => (image.key === key ? { ...image, ...updates } : image))
          ),
        }));

        if (typeof window !== "undefined") {
          fetch("/api/tailored", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ images: get().images }),
          }).catch((err) => console.warn("[tailoredContentStore] Failed to save tailored settings", err));
        }
      },
    }),
    {
      name: "lunelle-tailored-content",
      version: 1,
      migrate: (persisted) => {
        const state = persisted as Partial<TailoredContentStore>;
        return {
          ...state,
          images: mergeTailoredImages(state.images),
        };
      },
      skipHydration: true,
    }
  )
);

export function tailoredImageByKey(images: TailoredImage[], key: TailoredImageKey) {
  return images.find((image) => image.key === key) ?? defaultTailoredImages.find((image) => image.key === key)!;
}
