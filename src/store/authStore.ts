"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useCouponStore } from "./couponStore";

const SESSION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface Address {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  line1: string;
  city: string;
  postal: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
  createdAt: string;
  passwordChangedAt?: string;
  personalCode?: string; // 10% welcome discount, generated on registration
  googleId?: string;
  avatar?: string;
}

interface StoredUser extends User {
  password?: string; // undefined for Google-only accounts
}

interface AuthStore {
  currentUser: User | null;
  loginAt: number | null;       // ms timestamp of last login — used for session expiry
  users: StoredUser[];
  userAddresses: Record<string, Address[]>;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => { success: boolean; error?: string; user?: User };
  logout: () => void;
  checkSessionExpiry: () => void;
  updateProfile: (data: Partial<Pick<User, "firstName" | "lastName" | "email" | "phone">>) => void;
  resetPassword: (email: string, newPassword: string) => { success: boolean; error?: string };
  emailExists: (email: string) => boolean;
  deleteUser: (id: string) => { success: boolean; error?: string };
  getAddresses: () => Address[];
  addAddress: (address: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

const defaultUsers: StoredUser[] = [
  {
    id: "admin1",
    firstName: "Admin",
    lastName: "Lunelle",
    email: "admin@lunellestory.ca",
    password: "R748Mc7SeY~8#\\=",
    role: "admin",
    createdAt: "2024-01-01",
  },
];

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      loginAt: null,
      users: defaultUsers,
      userAddresses: {},

      login: (email, password) => {
        const found = get().users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (!found || !found.password || found.password !== password) {
          return { success: false, error: "Email or password is incorrect" };
        }
        const { password: _pw, ...user } = found;
        set({ currentUser: user, loginAt: Date.now() });
        return { success: true };
      },

      register: ({ firstName, lastName, email, password }) => {
        const exists = get().users.some(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (exists) {
          return { success: false, error: "An account with this email already exists" };
        }

        /* Generate unique personal 10% discount code */
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        const suffix = Array.from({ length: 6 }, () =>
          chars[Math.floor(Math.random() * chars.length)]
        ).join("");
        const personalCode = `LNL${suffix}`;

        /* Register the coupon in the coupon store (once-use, 10% off) */
        useCouponStore.getState().addCoupon({
          code: personalCode,
          label: "10% welcome discount",
          type: "percent",
          value: 10,
          usageLimit: "once",
          maxUses: 1,
          expiresAt: null,
          minOrderAmount: null,
          isActive: true,
        });

        const newUser: StoredUser = {
          id: `u${Date.now()}`,
          firstName,
          lastName,
          email,
          password,
          role: "customer",
          createdAt: new Date().toISOString().split("T")[0],
          personalCode,
        };
        const { password: _pw, ...user } = newUser;
        set((s) => ({ users: [...s.users, newUser], currentUser: user, loginAt: Date.now() }));
        return { success: true, user };
      },

      logout: () => set({ currentUser: null, loginAt: null }),

      checkSessionExpiry: () => {
        const { currentUser, loginAt } = get();
        if (!currentUser) return;
        // loginAt null = grandfathered session (pre-v4), no expiry applied
        if (loginAt !== null && Date.now() - loginAt > SESSION_MS) {
          set({ currentUser: null, loginAt: null });
        }
      },

      updateProfile: (data) =>
        set((s) => ({
          currentUser: s.currentUser ? { ...s.currentUser, ...data } : null,
          users: s.users.map((u) =>
            u.id === s.currentUser?.id ? { ...u, ...data } : u
          ),
        })),

      resetPassword: (email, newPassword) => {
        const exists = get().users.some(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (!exists) {
          return { success: false, error: "No account found with this email" };
        }
        const changedAt = new Date().toISOString();
        set((s) => ({
          users: s.users.map((u) =>
            u.email.toLowerCase() === email.toLowerCase()
              ? { ...u, password: newPassword, passwordChangedAt: changedAt }
              : u
          ),
          currentUser:
            s.currentUser?.email.toLowerCase() === email.toLowerCase()
              ? { ...s.currentUser, passwordChangedAt: changedAt }
              : s.currentUser,
        }));
        return { success: true };
      },

      deleteUser: (id) => {
        const target = get().users.find((u) => u.id === id);
        if (!target) return { success: false, error: "User not found" };
        if (target.role === "admin") return { success: false, error: "Cannot delete admin accounts" };
        if (get().currentUser?.id === id) return { success: false, error: "Cannot delete your own account" };
        set((s) => ({
          users: s.users.filter((u) => u.id !== id),
          userAddresses: Object.fromEntries(
            Object.entries(s.userAddresses).filter(([uid]) => uid !== id)
          ),
        }));
        return { success: true };
      },

      emailExists: (email) =>
        get().users.some((u) => u.email.toLowerCase() === email.toLowerCase()),

      getAddresses: () => {
        const uid = get().currentUser?.id;
        if (!uid) return [];
        return get().userAddresses[uid] ?? [];
      },

      addAddress: (address) => {
        const uid = get().currentUser?.id;
        if (!uid) return;
        const newAddr: Address = { ...address, id: `addr-${Date.now()}` };
        set((s) => {
          const existing = s.userAddresses[uid] ?? [];
          const updated = address.isDefault
            ? existing.map((a) => ({ ...a, isDefault: false }))
            : existing;
          return {
            userAddresses: {
              ...s.userAddresses,
              [uid]: [...updated, newAddr],
            },
          };
        });
      },

      removeAddress: (id) => {
        const uid = get().currentUser?.id;
        if (!uid) return;
        set((s) => ({
          userAddresses: {
            ...s.userAddresses,
            [uid]: (s.userAddresses[uid] ?? []).filter((a) => a.id !== id),
          },
        }));
      },

      setDefaultAddress: (id) => {
        const uid = get().currentUser?.id;
        if (!uid) return;
        set((s) => ({
          userAddresses: {
            ...s.userAddresses,
            [uid]: (s.userAddresses[uid] ?? []).map((a) => ({
              ...a,
              isDefault: a.id === id,
            })),
          },
        }));
      },
    }),
    {
      name: "Lunelle-auth",
      version: 5,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as {
          users?: StoredUser[];
          currentUser?: unknown;
          userAddresses?: unknown;
          loginAt?: number | null;
        };
        if (version < 4) {
          state.loginAt = null;
        }
        if (version < 5) {
          // Reset all accounts — only the new admin account remains
          state.users = defaultUsers;
          state.currentUser = null;
          state.userAddresses = {};
          state.loginAt = null;
        }
        return state;
      },
    }
  )
);
