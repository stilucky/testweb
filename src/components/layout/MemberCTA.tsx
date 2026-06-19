"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "lunelle-member-cta-v1";

export default function MemberCTA() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      const t = setTimeout(() => {
        setMounted(true);
        requestAnimationFrame(() => setVisible(true));
      }, 3000);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
    setTimeout(() => setMounted(false), 400);
  };

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-[150] w-72 bg-stone-900 text-white shadow-2xl",
        "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6 pointer-events-none"
      )}
    >
      {/* Close */}
      <button
        onClick={close}
        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-stone-500 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X size={13} />
      </button>

      <div className="px-5 py-5 pr-8">
        {/* Label */}
        <p className="text-[8px] tracking-[0.25em] uppercase text-stone-500 mb-2">
          Members Only
        </p>

        {/* Headline */}
        <p className="text-sm font-light text-white leading-snug mb-1">
          Get <span className="text-white font-medium">10% off</span> your first order
        </p>
        <p className="text-[11px] text-stone-400 leading-relaxed mb-4">
          Create a free account for early access to Pre-Fall collections and exclusive member benefits.
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          <Link
            href="/auth?tab=register"
            onClick={close}
            className="flex items-center justify-center py-2.5 bg-white text-stone-900 text-[10px] tracking-[0.18em] uppercase hover:bg-stone-100 transition-colors"
          >
            Create Account
          </Link>
          <Link
            href="/auth"
            onClick={close}
            className="flex items-center justify-center py-2.5 border border-stone-700 text-stone-300 text-[10px] tracking-[0.18em] uppercase hover:border-stone-500 hover:text-white transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
