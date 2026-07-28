import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DiscountType = "percent" | "fixed";
export type UsageLimit = "once" | "limited" | "unlimited";

export interface Coupon {
  id: string;
  code: string;
  label: string;
  type: DiscountType;
  value: number;
  usageLimit: UsageLimit;
  maxUses: number | null;    // null = unlimited
  usedCount: number;
  expiresAt: string | null;  // ISO date string or null
  minOrderAmount: number | null;
  isActive: boolean;
  createdAt: string;
}

interface CouponState {
  coupons: Coupon[];
  setCoupons: (coupons: Coupon[]) => void;
  loadCoupons: () => Promise<void>;
  addCoupon: (data: Omit<Coupon, "id" | "usedCount" | "createdAt">) => void;
  updateCoupon: (id: string, data: Partial<Omit<Coupon, "id" | "createdAt">>) => void;
  deleteCoupon: (id: string) => void;
  validateCoupon: (code: string, orderAmount: number) => { valid: true; coupon: Coupon } | { valid: false; error: string };
  useCoupon: (code: string) => void;
}

export const defaultCoupons: Coupon[] = [
  {
    id: "c1",
    code: "WELCOME10",
    label: "10% off your order",
    type: "percent",
    value: 10,
    usageLimit: "unlimited",
    maxUses: null,
    usedCount: 0,
    expiresAt: null,
    minOrderAmount: null,
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "c2",
    code: "SUMMER20",
    label: "20% off — limited use",
    type: "percent",
    value: 20,
    usageLimit: "limited",
    maxUses: 50,
    usedCount: 12,
    expiresAt: "2026-08-31T23:59:59Z",
    minOrderAmount: 100,
    isActive: true,
    createdAt: "2026-05-01T00:00:00Z",
  },
  {
    id: "c3",
    code: "VIP50",
    label: "$50 off orders over $300",
    type: "fixed",
    value: 50,
    usageLimit: "once",
    maxUses: 1,
    usedCount: 0,
    expiresAt: null,
    minOrderAmount: 300,
    isActive: true,
    createdAt: "2026-05-10T00:00:00Z",
  },
];

function saveCoupons(coupons: Coupon[]) {
  if (typeof window === "undefined") return;

  fetch("/api/coupons", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ coupons }),
  }).catch((err) => console.warn("[couponStore] Failed to save coupons", err));
}

function hasCustomCouponData(coupons: Coupon[]) {
  const defaults = new Map(defaultCoupons.map((coupon) => [coupon.id, coupon]));
  return coupons.some((coupon) => {
    const fallback = defaults.get(coupon.id);
    return !fallback || JSON.stringify(fallback) !== JSON.stringify(coupon);
  });
}

export const useCouponStore = create<CouponState>()(
  persist(
    (set, get) => ({
      coupons: defaultCoupons,

      setCoupons: (coupons) => set({ coupons }),

      loadCoupons: async () => {
        const localCoupons = get().coupons;
        try {
          const res = await fetch("/api/coupons", { cache: "no-store" });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json() as { coupons?: Coupon[]; initialized?: boolean };
          if (data.initialized === false) {
            if (hasCustomCouponData(localCoupons)) saveCoupons(localCoupons);
            return;
          }
          if (Array.isArray(data.coupons)) set({ coupons: data.coupons });
        } catch (err) {
          console.warn("[couponStore] Failed to load coupons", err);
        }
      },

      addCoupon: (data) => {
        const coupon: Coupon = {
          ...data,
          id: `c${Date.now()}`,
          usedCount: 0,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ coupons: [...s.coupons, coupon] }));
        saveCoupons(get().coupons);
      },

      updateCoupon: (id, data) => {
        set((s) => ({
          coupons: s.coupons.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }));
        saveCoupons(get().coupons);
      },

      deleteCoupon: (id) => {
        set((s) => ({ coupons: s.coupons.filter((c) => c.id !== id) }));
        saveCoupons(get().coupons);
      },

      validateCoupon: (code, orderAmount) => {
        const coupon = get().coupons.find(
          (c) => c.code.toUpperCase() === code.toUpperCase()
        );
        if (!coupon) return { valid: false, error: "Invalid promo code." };
        if (!coupon.isActive) return { valid: false, error: "This promo code is inactive." };

        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
          return { valid: false, error: "This promo code has expired." };
        }

        if (coupon.usageLimit === "once" && coupon.usedCount >= 1) {
          return { valid: false, error: "This promo code has already been used." };
        }

        if (
          coupon.usageLimit === "limited" &&
          coupon.maxUses !== null &&
          coupon.usedCount >= coupon.maxUses
        ) {
          return { valid: false, error: "This promo code has reached its usage limit." };
        }

        if (coupon.minOrderAmount !== null && orderAmount < coupon.minOrderAmount) {
          return {
            valid: false,
            error: `Minimum order of $${coupon.minOrderAmount} required for this code.`,
          };
        }

        return { valid: true, coupon };
      },

      useCoupon: (code) => {
        set((s) => ({
          coupons: s.coupons.map((c) =>
            c.code.toUpperCase() === code.toUpperCase()
              ? { ...c, usedCount: c.usedCount + 1 }
            : c
          ),
        }));
        saveCoupons(get().coupons);
      },
    }),
    { name: "Lunelle-coupons", version: 1 }
  )
);
