import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BrandVideo {
  url: string;
  type: "youtube" | "native"; // youtube = embed, native = <video> tag
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}

interface VideoStore {
  brandVideo: BrandVideo | null;
  enabled: boolean;
  setBrandVideo: (video: BrandVideo) => void;
  setEnabled: (enabled: boolean) => void;
  clearBrandVideo: () => void;
}

export const useVideoStore = create<VideoStore>()(
  persist(
    (set) => ({
      brandVideo: {
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        type: "youtube",
        title: "The Lunelle Film",
        subtitle: "Resort 2025 — A story of light, texture, and quiet luxury",
        ctaLabel: "Watch Now",
        ctaHref: "#video",
      },
      enabled: true,

      setBrandVideo: (video) => set({ brandVideo: video }),
      setEnabled: (enabled) => set({ enabled }),
      clearBrandVideo: () => set({ brandVideo: null }),
    }),
    { name: "lunelle-video" }
  )
);
