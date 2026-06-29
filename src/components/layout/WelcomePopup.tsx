"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { usePathname } from "next/navigation";

export default function WelcomePopup() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const pathname = usePathname();

  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Only show on homepage, desktop, and when not logged in
    if (currentUser || pathname !== "/") return;

    // Completely off on mobile / tablet small
    if (window.innerWidth < 768) return;

    // Show popup immediately
    setMounted(true);

    requestAnimationFrame(() => {
      setVisible(true);
    });

    // Auto close popup after 2 seconds
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);

      unmountTimerRef.current = setTimeout(() => {
        setMounted(false);
      }, 400);
    }, 3000);

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      if (unmountTimerRef.current) {
        clearTimeout(unmountTimerRef.current);
        unmountTimerRef.current = null;
      }
    };
  }, [currentUser, pathname]);

  const close = () => {
    setVisible(false);

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (unmountTimerRef.current) {
      clearTimeout(unmountTimerRef.current);
      unmountTimerRef.current = null;
    }

    unmountTimerRef.current = setTimeout(() => {
      setMounted(false);
    }, 400);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop — use button so iOS touch fires correctly */}
      <button
        onClick={close}
        aria-label="Close"
        className={cn(
          "fixed inset-0 w-full h-full bg-black/60 z-[200] backdrop-blur-sm transition-opacity duration-400 cursor-default",
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed inset-0 z-[201] flex items-center justify-center p-4 md:p-8",
          "transition-all duration-500",
          visible
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <div className="relative bg-white w-full max-w-[820px] overflow-hidden shadow-2xl">
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white text-stone-600 hover:text-stone-900 shadow-sm transition-all"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          <div className="grid md:grid-cols-[1fr_1fr]">
            {/* Left: editorial image */}
            <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[500px] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=90"
                alt="Lunelle"
                fill
                sizes="(max-width: 768px) 100vw, 410px"
                className="object-cover object-top"
                priority
              />

              {/* Overlay text on image */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <p className="text-white/50 text-[9px] tracking-[0.25em] uppercase mb-1">
                  Lunelle Atelier
                </p>
                <p className="text-white text-sm font-light tracking-wide">
                  Pre-Fall 2026
                </p>
              </div>
            </div>

            {/* Right: content */}
            <div className="flex flex-col justify-center px-8 py-10 md:px-10 md:py-12">
              {/* Logo */}
              <p
                className="text-stone-900 mb-8 tracking-[0.22em] uppercase text-sm font-light"
                style={{ fontFamily: "var(--font-didot), serif" }}
              >
                Lunelle
              </p>

              <p className="text-[9px] tracking-[0.25em] uppercase text-stone-400 mb-3">
                Members Only
              </p>

              <h2 className="text-2xl md:text-3xl font-light text-stone-900 mb-4 leading-snug">
                Unlock exclusive
                <br className="hidden md:block" /> member benefits
              </h2>

              <ul className="space-y-2 mb-8">
                {[
                  "10% discount on your first order as a member",
                  "Early access to Pre-Fall collections",
                  "Exclusive atelier stories & editorials",
                  "Priority service for tailored orders",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs text-stone-500 leading-relaxed"
                  >
                    <span className="mt-1 w-1 h-1 rounded-full bg-stone-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-2.5">
                <Link
                  href="/auth?tab=register"
                  onClick={close}
                  className="flex items-center justify-center py-3.5 bg-stone-900 text-white text-[10px] tracking-[0.2em] uppercase hover:bg-stone-700 transition-colors"
                >
                  Create Account — It's Free
                </Link>

                <Link
                  href="/auth"
                  onClick={close}
                  className="flex items-center justify-center py-3.5 border border-stone-200 text-stone-700 text-[10px] tracking-[0.2em] uppercase hover:border-stone-800 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}