import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface HeroSlide {
  id: string;
  image: string;           // background image (empty string OK for pure video slides)
  videoUrl?: string;       // YouTube URL or native video base64/URL
  videoType?: "youtube" | "native";
  tag: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  align: "left" | "center" | "right";
}

interface HeroStore {
  slides: HeroSlide[];
  maxSlides: number;
  autoplayInterval: number; // seconds
  addSlide: (slide: Omit<HeroSlide, "id">) => void;
  removeSlide: (id: string) => void;
  updateSlide: (id: string, updates: Partial<Omit<HeroSlide, "id">>) => void;
  moveSlide: (id: string, direction: "up" | "down") => void;
  setMaxSlides: (max: number) => void;
  setAutoplayInterval: (secs: number) => void;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=85",
    tag: "New Collection",
    title: "Solstice\nFever",
    subtitle: "Ethereal pieces for every occasion",
    cta: "Explore Collection",
    href: "/products?filter=new",
    align: "center",
  },
  {
    id: "slide-2",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1600&q=85",
    tag: "Occasion Wear",
    title: "Dressed\nFor Every\nMoment",
    subtitle: "From pre-wedding to gala nights",
    cta: "Shop Occasions",
    href: "/products?filter=occasion",
    align: "left",
  },
  {
    id: "slide-3",
    image: "https://images.unsplash.com/photo-1519657337289-077653f724ed?w=1600&q=85",
    tag: "Best Sellers",
    title: "Timeless\nElegance",
    subtitle: "Our most-loved pieces, reimagined",
    cta: "Shop Best Sellers",
    href: "/products?filter=bestseller",
    align: "right",
  },
];

export const useHeroStore = create<HeroStore>()(
  persist(
    (set, get) => ({
      slides: DEFAULT_SLIDES,
      maxSlides: 5,
      autoplayInterval: 5,

      addSlide: (slideData) => {
        const { slides, maxSlides } = get();
        if (slides.length >= maxSlides) return;
        const newSlide: HeroSlide = {
          ...slideData,
          id: `slide-${Date.now()}`,
        };
        set({ slides: [...slides, newSlide] });
      },

      removeSlide: (id) =>
        set((s) => ({ slides: s.slides.filter((sl) => sl.id !== id) })),

      updateSlide: (id, updates) =>
        set((s) => ({
          slides: s.slides.map((sl) => (sl.id === id ? { ...sl, ...updates } : sl)),
        })),

      moveSlide: (id, direction) => {
        const { slides } = get();
        const idx = slides.findIndex((sl) => sl.id === id);
        if (idx === -1) return;
        const newSlides = [...slides];
        if (direction === "up" && idx > 0) {
          [newSlides[idx - 1], newSlides[idx]] = [newSlides[idx], newSlides[idx - 1]];
        } else if (direction === "down" && idx < slides.length - 1) {
          [newSlides[idx], newSlides[idx + 1]] = [newSlides[idx + 1], newSlides[idx]];
        }
        set({ slides: newSlides });
      },

      setMaxSlides: (max) => set({ maxSlides: Math.min(Math.max(max, 1), 10) }),
      setAutoplayInterval: (secs) => set({ autoplayInterval: Math.min(Math.max(secs, 2), 30) }),
    }),
    { name: "lunelle-hero" }
  )
);
