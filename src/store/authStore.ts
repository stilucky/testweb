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
  password?: string; // legacy only; migrated to passwordHash
  passwordHash?: string; // undefined for Google-only accounts
  passwordSalt?: string;
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
    passwordHash: "0f05e05d1f372583",
    passwordSalt: "admin1",
    role: "admin",
    createdAt: "2024-01-01",
  },
];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function passwordDigest(password: string, salt: string) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  const input = `${salt}:${password}`;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `${(h2 >>> 0).toString(16).padStart(8, "0")}${(h1 >>> 0).toString(16).padStart(8, "0")}`;
}

function passwordSalt(userId: string) {
  return `${userId}-${Math.random().toString(36).slice(2, 10)}`;
}

function withPasswordHash<T extends StoredUser>(user: T, password: string): T {
  const salt = user.passwordSalt ?? passwordSalt(user.id);
  const cleanUser = { ...user };
  delete cleanUser.password;
  return {
    ...cleanUser,
    passwordSalt: salt,
    passwordHash: passwordDigest(password, salt),
  } as T;
}

function verifyPassword(user: StoredUser, password: string) {
  if (user.passwordHash && user.passwordSalt) {
    return passwordDigest(password, user.passwordSalt) === user.passwordHash;
  }
  return !!user.password && user.password === password;
}

function migrateUsersToPasswordHash(users: StoredUser[] = defaultUsers) {
  return users.map((user) => {
    if (user.password && (!user.passwordHash || !user.passwordSalt)) {
      return withPasswordHash(user, user.password);
    }
    const cleanUser = { ...user };
    delete cleanUser.password;
    return cleanUser;
  }) as StoredUser[];
}

function publicUser(user: StoredUser): User {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
    passwordChangedAt: user.passwordChangedAt,
    personalCode: user.personalCode,
    googleId: user.googleId,
    avatar: user.avatar,
  };
}

function isStrongPassword(password: string) {
  return password.length >= 10 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      loginAt: null,
      users: defaultUsers,
      userAddresses: {},

      login: (email, password) => {
        const found = get().users.find(
          (u) => normalizeEmail(u.email) === normalizeEmail(email)
        );
        if (!found || !verifyPassword(found, password)) {
          return { success: false, error: "Email or password is incorrect" };
        }
        const upgraded = found.password ? withPasswordHash(found, password) : found;
        const user = publicUser(upgraded);
        set((s) => ({
          users: s.users.map((u) => (u.id === upgraded.id ? upgraded : u)),
          currentUser: user,
          loginAt: Date.now(),
        }));
        return { success: true };
      },

      register: ({ firstName, lastName, email, password }) => {
        const exists = get().users.some(
          (u) => normalizeEmail(u.email) === normalizeEmail(email)
        );
        if (exists) {
          return { success: false, error: "An account with this email already exists" };
        }
        if (!isStrongPassword(password)) {
          return { success: false, error: "Password must be at least 10 characters and include uppercase, lowercase, and a number" };
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

        const userId = `u${Date.now()}`;
        const newUser: StoredUser = withPasswordHash({
          id: userId,
          firstName,
          lastName,
          email: email.trim(),
          role: "customer",
          createdAt: new Date().toISOString().split("T")[0],
          personalCode,
        }, password);
        const user = publicUser(newUser);
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
          (u) => normalizeEmail(u.email) === normalizeEmail(email)
        );
        if (!exists) {
          return { success: false, error: "No account found with this email" };
        }
        if (!isStrongPassword(newPassword)) {
          return { success: false, error: "Password must be at least 10 characters and include uppercase, lowercase, and a number" };
        }
        const changedAt = new Date().toISOString();
        set((s) => ({
          users: s.users.map((u) =>
            normalizeEmail(u.email) === normalizeEmail(email)
              ? { ...withPasswordHash(u, newPassword), passwordChangedAt: changedAt }
              : u
          ),
          currentUser:
            s.currentUser && normalizeEmail(s.currentUser.email) === normalizeEmail(email)
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
        get().users.some((u) => normalizeEmail(u.email) === normalizeEmail(email)),

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
      version: 6,
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
        if (version < 6) {
          state.users = migrateUsersToPasswordHash(state.users ?? defaultUsers);
          state.currentUser = state.currentUser ?? null;
        }
        state.users = migrateUsersToPasswordHash(state.users ?? defaultUsers);
        return state;
      },
    }
  )
);
