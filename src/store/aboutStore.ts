import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AboutKey = "origin" | "universe" | "angels" | "mantra";

export interface AboutSection {
  key: AboutKey;
  label: string;
  subtitle: string;
  heroImage: string;
  heroImagePosition?: string;
}

export interface AboutPost {
  id: string;
  sectionKey: AboutKey;
  title: string;
  subtitle: string;
  body: string;
  image: string;
  imagePosition?: string;
  image2?: string;
  image2Position?: string;
  status: "published" | "draft";
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type AboutSettings = {
  sections: AboutSection[];
  posts: AboutPost[];
};

interface AboutStore {
  sections: AboutSection[];
  posts: AboutPost[];
  setAboutSettings: (settings: Partial<AboutSettings>) => void;
  loadAboutSettings: () => Promise<void>;
  updateSection: (key: AboutKey, data: Partial<Omit<AboutSection, "key">>) => void;
  addPost: (post: Omit<AboutPost, "id" | "createdAt" | "updatedAt">) => void;
  updatePost: (id: string, data: Partial<Omit<AboutPost, "id" | "sectionKey" | "createdAt">>) => void;
  deletePost: (id: string) => void;
}

export const defaultSections: AboutSection[] = [
  {
    key: "origin",
    label: "Origin",
    subtitle: "Why Lunelle exists.",
    heroImage: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1600&q=90",
    heroImagePosition: "50% 30%",
  },
  {
    key: "universe",
    label: "Universe",
    subtitle: "The world we are building.",
    heroImage: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&q=90",
    heroImagePosition: "50% 50%",
  },
  {
    key: "angels",
    label: "Angels",
    subtitle: "The souls we design for.",
    heroImage: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=90",
    heroImagePosition: "50% 20%",
  },
  {
    key: "mantra",
    label: "Mantra",
    subtitle: "The words we live by.",
    heroImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=90",
    heroImagePosition: "50% 50%",
  },
];

export const defaultPosts: AboutPost[] = [
  // Origin posts
  {
    id: "post-1",
    sectionKey: "origin",
    title: "Where It Began",
    subtitle: "A small atelier with a singular vision",
    body: "Lunelle was born from a passion for fashion that transcends trends — pieces that carry meaning, crafted with intention. Founded in 2020, we set out to create a curated destination for women who appreciate the artistry behind every stitch.\n\nEach piece in our collection is thoughtfully selected for its quality, its ability to make a woman feel confident and beautiful, and its versatility across life's most memorable moments — from intimate celebrations to grand occasions.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=90",
    imagePosition: "50% 40%",
    image2: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=90",
    image2Position: "50% 50%",
    status: "published",
    order: 0,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
  },
  {
    id: "post-2",
    sectionKey: "origin",
    title: "The Art of Curation",
    subtitle: "Fewer pieces, greater meaning",
    body: "We believe that exceptional fashion should feel personal. That's why we work with skilled artisans who share our commitment to craftsmanship, ensuring every piece meets our exacting standards before it reaches your wardrobe.\n\nWe curate with purpose — fewer, better pieces that stand the test of time and serve as anchors in your wardrobe.",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=90",
    imagePosition: "50% 50%",
    status: "published",
    order: 1,
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  },
  // Universe posts
  {
    id: "post-3",
    sectionKey: "universe",
    title: "Crafted with Provenance",
    subtitle: "Fashion with purpose and permanence",
    body: "Lunelle exists at the intersection of artisan heritage and contemporary vision. Our world is one of considered choices — where the weight of a fabric, the curve of a seam, and the fall of a silhouette all matter deeply.\n\nWe collaborate with ateliers across Europe and Canada who bring generations of craft to every piece. This is fashion with provenance, with purpose, and with permanence.",
    image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=1200&q=90",
    imagePosition: "50% 30%",
    status: "published",
    order: 0,
    createdAt: "2026-01-20T00:00:00.000Z",
    updatedAt: "2026-01-20T00:00:00.000Z",
  },
  // Angels posts
  {
    id: "post-4",
    sectionKey: "angels",
    title: "She Moves With Intention",
    subtitle: "Quiet confidence in every step",
    body: "The Lunelle girl moves through the world with quiet confidence. She doesn't follow trends — she observes them, selects what resonates, and wears it as if it were always hers.\n\nShe is multi-dimensional: professional and playful, romantic and practical, private yet magnetic. Her wardrobe is not a performance — it is an extension of who she is, on every kind of day.",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=90",
    imagePosition: "50% 20%",
    status: "published",
    order: 0,
    createdAt: "2026-01-25T00:00:00.000Z",
    updatedAt: "2026-01-25T00:00:00.000Z",
  },
  // Mantra posts
  {
    id: "post-5",
    sectionKey: "mantra",
    title: "Buy Less, Choose Well",
    subtitle: "The philosophy behind every piece",
    body: "We believe that how you dress is how you greet the world — a daily ritual of self-definition that deserves intention.\n\nOur mantra is simple: buy less, choose well, make it last. We curate so that you don't have to choose between beauty and integrity, between trend and timelessness.\n\nEvery season, every collection, every piece exists to serve one purpose: to make you feel extraordinary in the most ordinary moments of your life.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=90",
    imagePosition: "50% 50%",
    status: "published",
    order: 0,
    createdAt: "2026-02-05T00:00:00.000Z",
    updatedAt: "2026-02-05T00:00:00.000Z",
  },
];

const legacyKeyMap: Record<string, AboutKey> = {
  "our-story": "origin",
  "our-world": "universe",
  "lunelle-girl": "angels",
  "our-mantra": "mantra",
  origin: "origin",
  universe: "universe",
  angels: "angels",
  mantra: "mantra",
};

const sectionCopy: Record<AboutKey, Pick<AboutSection, "label" | "subtitle">> = {
  origin: { label: "Origin", subtitle: "Why Lunelle exists." },
  universe: { label: "Universe", subtitle: "The world we are building." },
  angels: { label: "Angels", subtitle: "The souls we design for." },
  mantra: { label: "Mantra", subtitle: "The words we live by." },
};

function normalizeAboutState(state: Partial<AboutStore>): Partial<AboutStore> {
  const sections = Array.isArray(state.sections)
    ? state.sections
        .map((section) => {
          const key = legacyKeyMap[section.key];
          if (!key) return null;
          return {
            ...section,
            key,
            ...sectionCopy[key],
          };
        })
        .filter(Boolean) as AboutSection[]
    : defaultSections;

  const posts = Array.isArray(state.posts)
    ? state.posts
        .map((post) => {
          const sectionKey = legacyKeyMap[post.sectionKey];
          if (!sectionKey) return null;
          return { ...post, sectionKey };
        })
        .filter(Boolean) as AboutPost[]
    : defaultPosts;

  return { ...state, sections, posts };
}

function saveAboutSettings(settings: AboutSettings) {
  if (typeof window === "undefined") return;

  fetch("/api/about", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  }).catch((err) => console.warn("[aboutStore] Failed to save about settings", err));
}

function hasCustomAboutSettings(settings: AboutSettings) {
  return (
    JSON.stringify(settings.sections) !== JSON.stringify(defaultSections) ||
    JSON.stringify(settings.posts) !== JSON.stringify(defaultPosts)
  );
}

export const useAboutStore = create<AboutStore>()(
  persist(
    (set, get) => ({
      sections: defaultSections,
      posts: defaultPosts,

      setAboutSettings: (settings) =>
        set((s) => ({
          sections: settings.sections ?? s.sections,
          posts: settings.posts ?? s.posts,
        })),

      loadAboutSettings: async () => {
        const localSettings = {
          sections: get().sections,
          posts: get().posts,
        };

        try {
          const res = await fetch("/api/about", { cache: "no-store" });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json() as Partial<AboutSettings> & { initialized?: boolean };

          if (data.initialized === false) {
            if (hasCustomAboutSettings(localSettings)) saveAboutSettings(localSettings);
            return;
          }

          if (Array.isArray(data.sections) && Array.isArray(data.posts)) {
            set({ sections: data.sections, posts: data.posts });
          }
        } catch (err) {
          console.warn("[aboutStore] Failed to load about settings", err);
        }
      },

      updateSection: (key, data) => {
        set((s) => ({
          sections: s.sections.map((sec) =>
            sec.key === key ? { ...sec, ...data } : sec
          ),
        }));
        saveAboutSettings({ sections: get().sections, posts: get().posts });
      },

      addPost: (post) => {
        const now = new Date().toISOString();
        const newPost: AboutPost = {
          ...post,
          id: `post-${Date.now()}`,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ posts: [...s.posts, newPost] }));
        saveAboutSettings({ sections: get().sections, posts: get().posts });
      },

      updatePost: (id, data) => {
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
          ),
        }));
        saveAboutSettings({ sections: get().sections, posts: get().posts });
      },

      deletePost: (id) => {
        set((s) => ({ posts: s.posts.filter((p) => p.id !== id) }));
        saveAboutSettings({ sections: get().sections, posts: get().posts });
      },
    }),
    {
      name: "lunelle-about-v2",
      version: 3,
      migrate: (persisted) => normalizeAboutState(persisted as Partial<AboutStore>),
    }
  )
);
