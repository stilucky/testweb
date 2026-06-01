"use client";

import { useState } from "react";
import { Check, Loader2, Mail } from "lucide-react";
import { useSubscriberStore } from "@/store/subscriberStore";
import { useCouponStore } from "@/store/couponStore";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "duplicate" | "error";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [couponCode, setCouponCode] = useState("");

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

    // Register coupon — expires in 1 month
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

    // Send welcome email (fire-and-forget — don't block UI on failure)
    fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmed, couponCode: code, expiresAt: expiresAt.toISOString() }),
    }).catch(() => {});

    setCouponCode(code);
    setStatus("success");
    setEmail("");
  };


  return (
    <div className="border-b border-stone-700">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-20 text-center">

        {/* Label */}
        <p className="text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-4">
          Stay in touch
        </p>

        {/* Heading */}
        <h3
          className="text-3xl md:text-5xl mb-4 leading-tight"
          style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
        >
          Get 10% off your first order
        </h3>

        {/* Sub-description */}
        <p className="text-sm text-stone-400 leading-relaxed mb-2">
          Enter your email address below to join the Lunelle community.
        </p>
        <p className="text-sm text-white/80 mb-10">
          You&apos;ll instantly receive a{" "}
          <span className="border-b border-white/40 pb-px">
            personal discount code
          </span>{" "}
          valid on your first purchase.
        </p>

        {/* ── Success ── */}
        {status === "success" && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <div className="w-8 h-8 rounded-full border border-emerald-400 flex items-center justify-center shrink-0">
                <Check size={14} />
              </div>
              <p className="text-sm">You&apos;re in!</p>
            </div>
            <p className="text-sm text-stone-300">
              Your exclusive 10% off code has been sent to your inbox.
            </p>
            <p className="text-xs text-stone-500">
              Valid for 1 month · Single use · Apply at checkout.
            </p>
          </div>
        )}

        {/* ── Already subscribed ── */}
        {status === "duplicate" && (
          <div>
            <div className="border border-stone-600 px-5 py-4 flex items-start gap-3 text-left">
              <Mail size={16} className="text-stone-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-stone-200">This email is already subscribed.</p>
                <p className="text-xs text-stone-500 mt-1">
                  Check your inbox for your original welcome code, or contact us if you need help.
                </p>
              </div>
            </div>
            <button
              onClick={() => setStatus("idle")}
              className="mt-3 text-xs text-stone-500 hover:text-stone-300 transition-colors underline"
            >
              Try a different email
            </button>
          </div>
        )}

        {/* ── Form ── */}
        {(status === "idle" || status === "loading" || status === "error") && (
          <div className="space-y-3">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 border border-stone-600 focus-within:border-stone-400 transition-colors">
              <div className="flex-1 relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
                  placeholder="Your email address — get your discount code"
                  className={cn(
                    "w-full pl-11 pr-4 py-4 bg-transparent text-sm text-white placeholder:text-stone-500 focus:outline-none transition-colors",
                    status === "error" && "placeholder:text-red-400"
                  )}
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-10 py-4 bg-white text-stone-900 text-xs tracking-widest uppercase hover:bg-stone-100 transition-colors font-medium disabled:opacity-60 flex items-center justify-center gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-stone-600"
              >
                {status === "loading" ? (
                  <><Loader2 size={12} className="animate-spin" /> Sending...</>
                ) : (
                  "Get My Code"
                )}
              </button>
            </form>

            {status === "error" && (
              <p className="text-xs text-red-400 text-left">Please enter a valid email address.</p>
            )}

            {/* Reassurance line */}
            <p className="text-[10px] text-stone-600 tracking-wide">
              No spam, ever. Unsubscribe anytime. Code delivered instantly to your inbox.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
