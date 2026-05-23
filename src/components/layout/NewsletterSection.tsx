"use client";

import { useState } from "react";
import { Check, Loader2, Copy, Mail } from "lucide-react";
import { useSubscriberStore } from "@/store/subscriberStore";
import { useCouponStore } from "@/store/couponStore";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "duplicate" | "error";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [couponCode, setCouponCode] = useState("");
  const [copied, setCopied] = useState(false);

  const { subscribe } = useSubscriberStore();
  const { addCoupon } = useCouponStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    setTimeout(() => {
      const result = subscribe(trimmed);

      if (!result.success) {
        setStatus(result.error === "already_subscribed" ? "duplicate" : "error");
        return;
      }

      const code = result.couponCode;

      // Register the coupon in coupon store — expires in 1 month
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

      setCouponCode(code);
      setStatus("success");
      setEmail("");
    }, 700);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-b border-stone-700">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-16 text-center">
        <p className="text-xs tracking-widest uppercase text-stone-400 mb-3">
          Join the world of TeBoutique
        </p>
        <h3
          className="text-3xl md:text-4xl mb-8"
          style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
        >
          Subscribe &amp; receive 10% off your first order
        </h3>

        {/* ── Success state ── */}
        {status === "success" && (
          <div className="max-w-md mx-auto space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <div className="w-8 h-8 rounded-full border border-emerald-400 flex items-center justify-center">
                <Check size={14} />
              </div>
              <p className="text-sm">You&apos;re in! Here&apos;s your exclusive code:</p>
            </div>

            <div className="border border-stone-600 bg-stone-800/60 px-5 py-4 flex items-center justify-between gap-4">
              <div className="text-left">
                <p className="font-mono text-xl tracking-[0.25em] text-white font-medium">
                  {couponCode}
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  10% off your first order · Single use · Valid for 1 month
                </p>
              </div>
              <button
                onClick={handleCopy}
                className={cn(
                  "flex items-center gap-1.5 text-xs px-3 py-2 border transition-colors shrink-0",
                  copied
                    ? "border-emerald-400 text-emerald-400"
                    : "border-stone-500 text-stone-400 hover:border-white hover:text-white"
                )}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Apply this code at checkout. Check your inbox for a confirmation email.
            </p>
          </div>
        )}

        {/* ── Already subscribed ── */}
        {status === "duplicate" && (
          <div className="max-w-md mx-auto">
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

        {/* ── Form (idle / loading / error) ── */}
        {(status === "idle" || status === "loading" || status === "error") && (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
                placeholder="Enter your email address"
                className={cn(
                  "w-full px-4 py-3 bg-transparent border text-sm placeholder:text-stone-500 focus:outline-none transition-colors",
                  status === "error" ? "border-red-500 placeholder:text-red-400" : "border-stone-600 focus:border-white"
                )}
              />
              {status === "error" && (
                <p className="text-xs text-red-400 mt-1 text-left">Please enter a valid email address.</p>
              )}
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-8 py-3 bg-white text-stone-900 text-xs tracking-widest uppercase hover:bg-stone-100 transition-colors font-medium disabled:opacity-60 flex items-center justify-center gap-2 shrink-0"
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Subscribing...
                </>
              ) : (
                "Subscribe"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
