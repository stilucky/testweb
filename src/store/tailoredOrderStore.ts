import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TailoredMeasurements {
  bust?: string;
  waist?: string;
  hips?: string;
  shoulder?: string;
  sleeve?: string;
  length?: string;
  height?: string;
}

export interface TailoredOrder {
  id: string;
  createdAt: string;
  status: "pending" | "confirmed" | "in_production" | "shipped" | "completed" | "cancelled";

  /* Design info */
  designId: string;
  designName: string;
  designImage: string;
  designCategory: string;
  color: string;

  /* Pricing */
  basePrice: number;
  basePriceCAD: number;
  tailoringFee: number;
  totalPrice: number;
  totalPriceCAD: number;
  currency: string;

  /* Measurements */
  measurements: TailoredMeasurements;
  notes: string;

  /* Customer (filled if logged in, else empty) */
  customerName: string;
  customerEmail: string;
}

interface TailoredOrderStore {
  orders: TailoredOrder[];
  addOrder: (order: Omit<TailoredOrder, "id" | "createdAt" | "status">) => TailoredOrder;
  updateStatus: (id: string, status: TailoredOrder["status"]) => void;
  removeOrder: (id: string) => void;
}

export const useTailoredOrderStore = create<TailoredOrderStore>()(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (data) => {
        const newOrder: TailoredOrder = {
          ...data,
          id: `tailored-${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: "pending",
        };
        set((s) => ({ orders: [newOrder, ...s.orders] }));
        return newOrder;
      },

      updateStatus: (id, status) => {
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        }));
      },

      removeOrder: (id) => {
        set((s) => ({ orders: s.orders.filter((o) => o.id !== id) }));
      },
    }),
    { name: "lunelle-tailored-orders" }
  )
);
