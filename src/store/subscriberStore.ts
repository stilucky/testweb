import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Subscriber {
  id: string;
  email: string;
  couponCode: string;
  subscribedAt: string;
  couponUsed: boolean;
}

export interface EmailCampaign {
  id: string;
  type: "new_product" | "custom";
  subject: string;
  // Multi-product support
  productIds?: string[];
  productNames?: string[];
  productImage?: string;      // thumbnail of first product
  // Recipient tracking
  recipientSource: "subscribers" | "customers" | "all" | "custom";
  sentAt: string;
  recipientCount: number;
  successCount: number;
  status: "sent" | "partial" | "failed";
}

interface SubscriberState {
  subscribers: Subscriber[];
  emailCampaigns: EmailCampaign[];
  subscribe: (email: string) => { success: true; couponCode: string } | { success: false; error: string };
  markCouponUsed: (email: string) => void;
  deleteSubscriber: (id: string) => void;
  addCampaign: (campaign: Omit<EmailCampaign, "id">) => void;
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
      emailCampaigns: [],

      addCampaign: (campaign) => {
        const newCampaign: EmailCampaign = {
          ...campaign,
          id: `campaign_${Date.now()}`,
        };
        set((s) => ({ emailCampaigns: [newCampaign, ...s.emailCampaigns] }));
      },

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
    {
      name: "Lunelle-subscribers",
      version: 3,
      migrate: (old: unknown, version: number) => {
        const state = old as Partial<SubscriberState> & {
          emailCampaigns?: Array<EmailCampaign & { productId?: string; productName?: string }>;
        };
        if (version < 2) {
          state.emailCampaigns = [];
        }
        if (version < 3) {
          // Migrate old campaigns to new shape
          state.emailCampaigns = (state.emailCampaigns ?? []).map((c) => {
            const old = c as unknown as Record<string, unknown>;
            return {
              ...c,
              productIds:    old["productId"]   ? [old["productId"] as string]   : undefined,
              productNames:  old["productName"] ? [old["productName"] as string] : undefined,
              recipientSource: "subscribers" as const,
            };
          });
        }
        return state;
      },
    }
  )
);
