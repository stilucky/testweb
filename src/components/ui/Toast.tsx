"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle, AlertCircle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "loading";

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastProps extends ToastItem {
  onClose: (id: number) => void;
  duration?: number;
}

// ── Single toast ────────────────────────────────────────────────────────────────
export function Toast({ id, type, message, onClose, duration = 3000 }: ToastProps) {
  const [progress, setProgress] = useState(100);
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(duration / 1000));
  // Keep onClose stable so we don't re-trigger effects when parent re-renders
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (type === "loading") return;

    const startMs = Date.now();

    // Smooth progress bar + countdown via interval (50ms ticks)
    const interval = setInterval(() => {
      const elapsed = Date.now() - startMs;
      const remaining = Math.max(0, duration - elapsed);
      setProgress((remaining / duration) * 100);
      setSecondsLeft(Math.ceil(remaining / 1000));
      if (remaining === 0) clearInterval(interval);
    }, 50);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, type, duration]); // onClose intentionally excluded — use ref

  const borderClass =
    type === "success" ? "border-emerald-200"
    : type === "error" ? "border-red-200"
    :                    "border-stone-200";

  const barColor =
    type === "success" ? "#10b981"
    : type === "error" ? "#ef4444"
    :                    "transparent";

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 px-4 py-3 bg-white shadow-lg border text-sm max-w-sm pointer-events-auto overflow-hidden",
        borderClass
      )}
    >
      {type === "success" && <CheckCircle size={15} className="text-emerald-500 shrink-0" />}
      {type === "error"   && <AlertCircle size={15} className="text-red-500 shrink-0" />}
      {type === "loading" && <Loader2 size={15} className="animate-spin text-stone-400 shrink-0" />}

      <span className="flex-1 leading-snug text-stone-800">{message}</span>

      {type !== "loading" && (
        <div className="flex items-center gap-2 shrink-0 ml-1">
          <span className={cn(
            "text-[11px] tabular-nums font-medium w-4 text-right",
            type === "success" ? "text-emerald-400" : "text-red-400"
          )}>
            {secondsLeft}
          </span>
          <button
            onClick={() => onCloseRef.current(id)}
            className="text-stone-300 hover:text-stone-600 transition-colors"
            aria-label="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Progress bar — width decreases from 100% to 0% over `duration` ms */}
      {type !== "loading" && (
        <div
          className="absolute bottom-0 left-0 h-[2px]"
          style={{ width: `${progress}%`, backgroundColor: barColor }}
        />
      )}
    </div>
  );
}

// ── Container — desktop only (hidden on mobile via JS, not CSS) ─────────────────
export function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: ToastItem[];
  onClose: (id: number) => void;
}) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Render nothing on mobile — no toast popups on small screens
  if (!isDesktop) return null;

  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          {...t}
          onClose={onClose}
          duration={t.type === "loading" ? undefined : 3000}
        />
      ))}
    </div>
  );
}

// ── Hook ────────────────────────────────────────────────────────────────────────
let _nextToastId = 1;

export function useToast(durationMs = 3000) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const durationMsRef = useRef(durationMs);
  durationMsRef.current = durationMs;

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string): number => {
    const id = _nextToastId++;
    setToasts((prev) => [...prev, { id, type, message }]);
    // Auto-remove after durationMs — single source of truth, no timer in Toast component
    if (type !== "loading") {
      const delay = durationMsRef.current;
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, delay);
    }
    return id;
  }, []); // Stable — reads durationMsRef.current at call time

  return { toasts, addToast, removeToast };
}
