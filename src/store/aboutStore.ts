import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AboutKey = "our-story" | "our-world" | "lunelle-girl" | "our-mantra";

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

interface AboutStore {
  sections: AboutSection[];
  posts: AboutPost[];
  updateSection: (key: AboutKey, data: Partial<Omit<AboutSection, "key">>) => void;
  addPost: (post: Omit<AboutPost, "id" | "createdAt" | "updatedAt">) => void;
  updatePost: (id: string, data: Partial<Omit<AboutPost, "id" | "sectionKey" | "createdAt">>) => void;
  deletePost: (id: string) => void;
}

const defaultSections: AboutSection[] = [
  {
    key: "our-story",
    label: "Our Story",
    subtitle: "Born from a love of quiet luxury",
    heroImage: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1600&q=90",
    heroImagePosition: "50% 30%",
  },
  {
    key: "our-world",
    label: "Our World",
    subtitle: "A universe of refined detail",
    heroImage: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&q=90",
    heroImagePosition: "50% 50%",
  },
  {
    key: "lunelle-girl",
    label: "Lunelle Girl",
    subtitle: "She knows exactly who she is",
    heroImage: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=90",
    heroImagePosition: "50% 20%",
  },
  {
    key: "our-mantra",
    label: "Our Mantra",
    subtitle: "Dress the life you imagine",
    heroImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=90",
    heroImagePosition: "50% 50%",
  },
];

const defaultPosts: AboutPost[] = [
  // Our Story posts
  {
    id: "post-1",
    sectionKey: "our-story",
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
    sectionKey: "our-story",
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
  // Our World posts
  {
    id: "post-3",
    sectionKey: "our-world",
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
  // Lunelle Girl posts
  {
    id: "post-4",
    sectionKey: "lunelle-girl",
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
  // Our Mantra posts
  {
    id: "post-5",
    sectionKey: "our-mantra",
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

export const useAboutStore = create<AboutStore>()(
  persist(
    (set) => ({
      sections: defaultSections,
      posts: defaultPosts,

      updateSection: (key, data) =>
        set((s) => ({
          sections: s.sections.map((sec) =>
            sec.key === key ? { ...sec, ...data } : sec
          ),
        })),

      addPost: (post) => {
        const now = new Date().toISOString();
        const newPost: AboutPost = {
          ...post,
          id: `post-${Date.now()}`,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ posts: [...s.posts, newPost] }));
      },

      updatePost: (id, data) => {
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      deletePost: (id) =>
        set((s) => ({ posts: s.posts.filter((p) => p.id !== id) })),
    }),
    { name: "lunelle-about-v2" }
  )
);
