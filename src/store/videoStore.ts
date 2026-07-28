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
  setVideoSettings: (settings: Partial<Pick<VideoStore, "brandVideo" | "enabled">>) => void;
  loadVideoSettings: () => Promise<void>;
  setBrandVideo: (video: BrandVideo) => void;
  setEnabled: (enabled: boolean) => void;
  clearBrandVideo: () => void;
}

export const defaultBrandVideo: BrandVideo = {
  url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  type: "youtube",
  title: "The Lunelle Film",
  subtitle: "Resort 2025 - A story of light, texture, and quiet luxury",
  ctaLabel: "Watch Now",
  ctaHref: "#video",
};

function saveVideoSettings(settings: Pick<VideoStore, "brandVideo" | "enabled">) {
  if (typeof window === "undefined") return;

  fetch("/api/video", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  }).catch((err) => console.warn("[videoStore] Failed to save video settings", err));
}

function hasCustomVideoSettings(settings: Pick<VideoStore, "brandVideo" | "enabled">) {
  return settings.enabled !== true || JSON.stringify(settings.brandVideo) !== JSON.stringify(defaultBrandVideo);
}

export const useVideoStore = create<VideoStore>()(
  persist(
    (set, get) => ({
      brandVideo: defaultBrandVideo,
      enabled: true,

      setVideoSettings: (settings) =>
        set((s) => ({
          brandVideo: settings.brandVideo !== undefined ? settings.brandVideo : s.brandVideo,
          enabled: settings.enabled ?? s.enabled,
        })),

      loadVideoSettings: async () => {
        const localSettings = {
          brandVideo: get().brandVideo,
          enabled: get().enabled,
        };
        try {
          const res = await fetch("/api/video", { cache: "no-store" });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json() as Partial<Pick<VideoStore, "brandVideo" | "enabled">> & {
            initialized?: boolean;
          };
          if (data.initialized === false) {
            if (hasCustomVideoSettings(localSettings)) saveVideoSettings(localSettings);
            return;
          }
          set((s) => ({
            brandVideo: data.brandVideo !== undefined ? data.brandVideo : s.brandVideo,
            enabled: data.enabled ?? s.enabled,
          }));
        } catch (err) {
          console.warn("[videoStore] Failed to load video settings", err);
        }
      },

      setBrandVideo: (video) => {
        set({ brandVideo: video });
        saveVideoSettings({ brandVideo: get().brandVideo, enabled: get().enabled });
      },

      setEnabled: (enabled) => {
        set({ enabled });
        saveVideoSettings({ brandVideo: get().brandVideo, enabled: get().enabled });
      },

      clearBrandVideo: () => {
        set({ brandVideo: null });
        saveVideoSettings({ brandVideo: get().brandVideo, enabled: get().enabled });
      },
    }),
    { name: "lunelle-video" }
  )
);
