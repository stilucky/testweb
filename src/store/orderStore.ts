"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "paid" | "pending" | "refunded";
export type PaymentMethod = "card" | "paypal" | "bank";

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  size: string;
  color: string;
  image?: string;
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  phone?: string;
  date: string;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: OrderStatus;
  payment: PaymentStatus;
  paymentMethod: PaymentMethod;
  shippingMethod: string;
  shippingAddress: string;
  couponCode?: string;
  userId?: string;
}

interface OrderStore {
  orders: Order[];
  addOrder: (data: Omit<Order, "id" | "date" | "createdAt">) => string;
  updateStatus: (id: string, status: OrderStatus) => void;
  updatePayment: (id: string, payment: PaymentStatus) => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (data) => {
        const id = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
        const now = new Date();
        const date = now.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const newOrder: Order = {
          ...data,
          id,
          date,
          createdAt: now.toISOString(),
        };
        set((s) => ({ orders: [newOrder, ...s.orders] }));
        return id;
      },

      updateStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),

      updatePayment: (id, payment) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, payment } : o)),
        })),
    }),
    { name: "teboutique-orders" }
  )
);
