"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
  createdAt: string;
}

interface StoredUser extends User {
  password: string;
}

interface AuthStore {
  currentUser: User | null;
  users: StoredUser[];
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (data: Partial<Pick<User, "firstName" | "lastName" | "email" | "phone">>) => void;
}

const defaultUsers: StoredUser[] = [
  {
    id: "u1",
    firstName: "Sophie",
    lastName: "Laurent",
    email: "sophie@example.com",
    password: "password123",
    phone: "+1 604 555 0198",
    role: "customer",
    createdAt: "2024-01-15",
  },
  {
    id: "admin1",
    firstName: "Admin",
    lastName: "TeBoutique",
    email: "admin@teboutique.com",
    password: "admin123",
    role: "admin",
    createdAt: "2024-01-01",
  },
];

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: defaultUsers,

      login: (email, password) => {
        const found = get().users.find(
          (u) =>
            u.email.toLowerCase() === email.toLowerCase() &&
            u.password === password
        );
        if (!found) {
          return { success: false, error: "Email or password is incorrect" };
        }
        const { password: _pw, ...user } = found;
        set({ currentUser: user });
        return { success: true };
      },

      register: ({ firstName, lastName, email, password }) => {
        const exists = get().users.some(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (exists) {
          return { success: false, error: "An account with this email already exists" };
        }
        const newUser: StoredUser = {
          id: `u${Date.now()}`,
          firstName,
          lastName,
          email,
          password,
          role: "customer",
          createdAt: new Date().toISOString().split("T")[0],
        };
        const { password: _pw, ...user } = newUser;
        set((s) => ({ users: [...s.users, newUser], currentUser: user }));
        return { success: true };
      },

      logout: () => set({ currentUser: null }),

      updateProfile: (data) =>
        set((s) => ({
          currentUser: s.currentUser ? { ...s.currentUser, ...data } : null,
          users: s.users.map((u) =>
            u.id === s.currentUser?.id ? { ...u, ...data } : u
          ),
        })),
    }),
    { name: "teboutique-auth" }
  )
);
