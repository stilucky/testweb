"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persist = useAuthStore.persist;
    let cancelled = false;

    const markHydrated = () => {
      if (!cancelled) setHydrated(true);
    };

    const timer = setTimeout(markHydrated, 500);

    if (!persist) {
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }

    if (persist.hasHydrated()) {
      setTimeout(markHydrated, 0);
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }

    const unsub = persist.onFinishHydration(markHydrated);
    void Promise.resolve(persist.rehydrate()).finally(markHydrated);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      unsub();
    };
  }, []);

  useEffect(() => {
    if (hydrated && !currentUser) {
      router.push("/auth");
    }
  }, [currentUser, hydrated, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
        <div className="flex items-center gap-3 text-stone-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-xs tracking-widest uppercase">Loading admin</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
        <div className="text-center max-w-sm">
          <h1
            className="text-3xl mb-3"
            style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
          >
            Admin Sign In Required
          </h1>
          <p className="text-stone-500 text-sm mb-8">
            Please sign in with an admin account to access the dashboard.
          </p>
          <Link
            href="/auth"
            className="inline-flex px-6 py-3 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (currentUser.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={28} className="text-red-500" />
          </div>
          <h1
            className="text-3xl mb-3"
            style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
          >
            Access Denied
          </h1>
          <p className="text-stone-500 text-sm mb-8">
            You do not have permission to access the admin dashboard.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 border border-stone-200 text-xs tracking-widest uppercase hover:bg-stone-50 transition-colors"
            >
              Go Home
            </Link>
            <Link
              href="/auth"
              className="px-6 py-3 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors"
            >
              Sign In as Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
