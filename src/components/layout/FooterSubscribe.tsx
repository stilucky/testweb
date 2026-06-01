"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useSubscriberStore } from "@/store/subscriberStore";
import { useCouponStore } from "@/store/couponStore";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "duplicate" | "error";

export default function FooterSubscribe() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const { subscribe } = useSubscriberStore();
  const { addCoupon } = useCouponStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      return;
    }
    setStatus("loading");

    const result = subscribe(trimmed);
    if (!result.success) {
      setStatus(result.error === "already_subscribed" ? "duplicate" : "error");
      return;
    }

    const code = result.couponCode;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    addCoupon({
      code,
      label: `10% off — Welcome gift for ${trimmed}`,
      type: "percent",
      value: 10,
      usageLimit: "once",
      maxUses: 1,
      expiresAt: expiresAt.toISOString(),
      minOrderAmount: null,
      isActive: true,
    });

    fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmed, couponCode: code, expiresAt: expiresAt.toISOString() }),
    }).catch(() => {});

    setStatus("success");
    setEmail("");
  };

  if (status === "success") {
    return (
      <div className="flex items-start gap-3 border border-stone-700 px-4 py-4">
        <div className="w-6 h-6 rounded-full border border-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
          <Check size={11} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-xs text-white mb-1">You&apos;re in!</p>
          <p className="text-[11px] text-stone-400 leading-relaxed">
            Your 10% off code has been sent to your inbox.
          </p>
        </div>
      </div>
    );
  }

  if (status === "duplicate") {
    return (
      <div className="space-y-2">
        <p className="text-[11px] text-stone-400">This email is already subscribed.</p>
        <button
          onClick={() => setStatus("idle")}
          className="text-[11px] text-stone-500 hover:text-stone-300 underline transition-colors"
        >
          Try a different email
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Incentive text */}
      <div className="space-y-1.5">
        <p className="text-sm text-stone-200 leading-relaxed">
          Subscribe and receive a{" "}
          <span className="text-white font-medium border-b border-white/30 pb-px">
            10% discount code
          </span>
        </p>
        <p className="text-xs text-stone-500 leading-relaxed">
          Sent directly to your inbox. Valid on your first order.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Email input — full width, tall */}
        <div className={cn(
          "border transition-colors focus-within:border-stone-300",
          status === "error" ? "border-red-500" : "border-stone-600"
        )}>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
            placeholder="Your email address"
            className="w-full bg-transparent text-sm text-white placeholder-stone-500 px-5 py-4 focus:outline-none"
          />
        </div>

        {status === "error" && (
          <p className="text-xs text-red-400">Please enter a valid email address.</p>
        )}

        {/* Subscribe button — full width, prominent */}
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-white text-stone-900 text-xs tracking-[0.2em] uppercase font-medium py-4 hover:bg-stone-100 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {status === "loading" ? (
            <><Loader2 size={13} className="animate-spin" /> Sending...</>
          ) : (
            <>
              Get My Discount Code
              <svg viewBox="0 0 16 16" width="13" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 8h12M9 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>
      </form>

      <p className="text-[11px] text-stone-600">
        No spam · Unsubscribe anytime
      </p>
    </div>
  );
}
