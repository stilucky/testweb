import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Subscriber {
  id: string;
  email: string;
  couponCode: string;
  subscribedAt: string;
  couponUsed: boolean;
}

interface SubscriberState {
  subscribers: Subscriber[];
  subscribe: (email: string) => { success: true; couponCode: string } | { success: false; error: string };
  markCouponUsed: (email: string) => void;
  deleteSubscriber: (id: string) => void;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "WELCOME";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const useSubscriberStore = create<SubscriberState>()(
  persist(
    (set, get) => ({
      subscribers: [],

      subscribe: (email) => {
        const normalized = email.trim().toLowerCase();
        if (!normalized) return { success: false, error: "Please enter a valid email." };

        const already = get().subscribers.find(
          (s) => s.email.toLowerCase() === normalized
        );
        if (already) {
          return { success: false, error: "already_subscribed" };
        }

        const couponCode = generateCode();
        const sub: Subscriber = {
          id: `sub_${Date.now()}`,
          email: normalized,
          couponCode,
          subscribedAt: new Date().toISOString(),
          couponUsed: false,
        };
        set((s) => ({ subscribers: [...s.subscribers, sub] }));
        return { success: true, couponCode };
      },

      markCouponUsed: (email) => {
        set((s) => ({
          subscribers: s.subscribers.map((sub) =>
            sub.email.toLowerCase() === email.toLowerCase()
              ? { ...sub, couponUsed: true }
              : sub
          ),
        }));
      },

      deleteSubscriber: (id) => {
        set((s) => ({ subscribers: s.subscribers.filter((sub) => sub.id !== id) }));
      },
    }),
    { name: "teboutique-subscribers", version: 1 }
  )
);
