"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persist = useAuthStore.persist;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const markHydrated = () => {
      if (!cancelled) setHydrated(true);
    };

    if (!persist) {
      timer = setTimeout(markHydrated, 0);
      return () => {
        cancelled = true;
        if (timer) clearTimeout(timer);
      };
    }

    if (persist.hasHydrated()) {
      timer = setTimeout(markHydrated, 0);
      return () => {
        cancelled = true;
        if (timer) clearTimeout(timer);
      };
    }

    const unsub = persist.onFinishHydration(markHydrated);

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  useEffect(() => {
    if (hydrated && !currentUser) {
      router.push("/auth");
    }
  }, [currentUser, hydrated, router]);

  if (!hydrated || !currentUser) {
    return null;
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
