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

export function Toast({ id, type, message, onClose, duration = 3000 }: ToastProps) {
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(duration / 1000));
  const [barWidth, setBarWidth] = useState(100);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (type === "loading") return;

    // Trigger bar shrink on next paint so the CSS transition runs
    rafRef.current = requestAnimationFrame(() => setBarWidth(0));

    // Countdown seconds
    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    // Auto-close
    const timeout = setTimeout(() => onClose(id), duration);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [id, type, duration, onClose]);

  const accent =
    type === "success" ? "border-emerald-200 text-emerald-800"
    : type === "error"  ? "border-red-200 text-red-700"
    :                     "border-stone-200 text-stone-600";

  const barColor =
    type === "success" ? "#10b981"
    : type === "error"  ? "#ef4444"
    :                     "transparent";

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 px-4 py-3 bg-white shadow-lg border text-sm max-w-[calc(100vw-32px)] md:max-w-sm pointer-events-auto overflow-hidden",
        accent
      )}
    >
      {/* Icon */}
      {type === "success" && <CheckCircle size={15} className="text-emerald-500 shrink-0" />}
      {type === "error"   && <AlertCircle size={15} className="text-red-500 shrink-0" />}
      {type === "loading" && <Loader2 size={15} className="animate-spin text-stone-400 shrink-0" />}

      {/* Message */}
      <span className="flex-1 leading-snug">{message}</span>

      {/* Countdown + close */}
      {type !== "loading" && (
        <div className="flex items-center gap-2 shrink-0 ml-1">
          <span
            className={cn(
              "text-[11px] tabular-nums font-medium w-4 text-right",
              type === "success" ? "text-emerald-400" : "text-red-400"
            )}
          >
            {secondsLeft}
          </span>
          <button
            onClick={() => onClose(id)}
            className="text-stone-300 hover:text-stone-600 transition-colors"
            aria-label="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Countdown progress bar */}
      {type !== "loading" && (
        <div
          className="absolute bottom-0 left-0 h-[2px]"
          style={{
            width: `${barWidth}%`,
            backgroundColor: barColor,
            transition: `width ${duration}ms linear`,
          }}
        />
      )}
    </div>
  );
}

export function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: ToastItem[];
  onClose: (id: number) => void;
}) {
  return (
    <div className="fixed top-4 right-4 md:top-6 md:right-6 z-[100] hidden md:flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={onClose} duration={t.type === "loading" ? undefined : 3000} />
      ))}
    </div>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useToast(durationMs = 3000) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const durationRef = useRef(durationMs);
  durationRef.current = durationMs;

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string): number => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    if (type !== "loading") {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), durationRef.current);
    }
    return id;
  }, []);

  return { toasts, addToast, removeToast };
}
