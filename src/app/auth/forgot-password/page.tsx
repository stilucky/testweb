"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

type Step = "email" | "otp" | "newPassword" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { emailExists, resetPassword } = useAuthStore();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const sendOTP = async (targetEmail: string) => {
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: targetEmail, purpose: "reset" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to send code");
    if (data.devOTP) {
      console.log("[DEV] Reset OTP:", data.devOTP);
      setError(`[Dev mode] Your code is: ${data.devOTP}`);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!emailExists(email)) {
      setError("No account found with this email address");
      return;
    }
    setLoading(true);
    try {
      await sendOTP(email);
      startResendCooldown();
      setStep("otp");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value.slice(-1);
    setOtpDigits(next);
    setError("");
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...otpDigits];
    pasted.split("").forEach((ch, i) => { if (i < 6) next[i] = ch; });
    setOtpDigits(next);
    const focusIndex = Math.min(pasted.length, 5);
    otpRefs.current[focusIndex]?.focus();
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const code = otpDigits.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, purpose: "reset" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid code");
      setStep("newPassword");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setOtpDigits(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setLoading(true);
    try {
      await sendOTP(email);
      startResendCooldown();
      setOtpDigits(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend");
    } finally {
      setLoading(false);
    }
  };

  const handleNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 10 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError("Password must be at least 10 characters and include uppercase, lowercase, and a number");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const result = resetPassword(email, newPassword);
    if (result.success) {
      setStep("done");
    } else {
      setError(result.error ?? "Failed to reset password");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/">
            <span
              className="text-3xl tracking-[0.15em] uppercase"
              style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 400 }}
            >
              Lunelle
            </span>
          </Link>
        </div>

        {step === "done" ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={28} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-light tracking-wide mb-3">Password Reset</h2>
            <p className="text-sm text-stone-500 mb-8 leading-relaxed">
              Your password has been updated successfully. You can now sign in with your new password.
            </p>
            <button
              onClick={() => router.push("/auth")}
              className="w-full py-4 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        ) : (
          <>
            {/* Back link */}
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 text-xs text-stone-400 hover:text-stone-700 transition-colors mb-8 tracking-wide"
            >
              <ArrowLeft size={14} />
              Back to Sign In
            </Link>

            {/* Step header */}
            <div className="mb-8">
              <h1 className="text-2xl font-light tracking-wide mb-2">
                {step === "email" && "Forgot Password"}
                {step === "otp" && "Check Your Email"}
                {step === "newPassword" && "Set New Password"}
              </h1>
              <p className="text-sm text-stone-400 leading-relaxed">
                {step === "email" && "Enter your email address and we'll send you a reset code."}
                {step === "otp" && (
                  <>We sent a 6-digit code to <span className="text-stone-700 font-medium">{email}</span></>
                )}
                {step === "newPassword" && "Choose a strong password for your account."}
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex gap-2 mb-8">
              {(["email", "otp", "newPassword"] as const).map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-1 flex-1 transition-colors duration-300",
                    step === s
                      ? "bg-stone-900"
                      : (["email", "otp", "newPassword"].indexOf(s) < ["email", "otp", "newPassword"].indexOf(step))
                      ? "bg-stone-400"
                      : "bg-stone-200"
                  )}
                />
              ))}
            </div>

            {/* Error */}
            {error && !error.startsWith("[Dev") && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-5 text-sm">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}
            {error && error.startsWith("[Dev") && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 mb-5 text-sm font-mono">
                {error}
              </div>
            )}

            {/* Step: Email */}
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email address"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send Reset Code"}
                </button>
              </form>
            )}

            {/* Step: OTP */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="flex gap-2 justify-between" onPaste={handleOTPPaste}>
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(i, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(i, e)}
                      className={cn(
                        "w-12 h-14 text-center text-xl font-light border transition-colors focus:outline-none",
                        digit ? "border-stone-800 bg-stone-50" : "border-stone-200",
                        "focus:border-stone-800"
                      )}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || otpDigits.join("").length < 6}
                  className="w-full py-4 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors disabled:opacity-60"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </button>

                <div className="text-center">
                  <span className="text-xs text-stone-400">Didn&apos;t receive the code? </span>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    className="text-xs text-stone-700 underline disabled:text-stone-400 disabled:no-underline transition-colors"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
                  </button>
                </div>
              </form>
            )}

            {/* Step: New Password */}
            {step === "newPassword" && (
              <form onSubmit={handleNewPassword} className="space-y-4">
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="New password"
                    required
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                    className="w-full px-4 py-3 pr-11 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Confirm new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
                />
                <p className="text-xs text-stone-400">Minimum 6 characters</p>
                <button
                  type="submit"
                  className="w-full py-4 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors"
                >
                  Reset Password
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
