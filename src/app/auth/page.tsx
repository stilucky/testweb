"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register";
type RegisterStep = "form" | "otp";

export default function AuthPage() {
  const router = useRouter();
  const { login, register } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>("login");
  const [registerStep, setRegisterStep] = useState<RegisterStep>("form");
  const [pendingEmail, setPendingEmail] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setError("");
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const sendVerifyOTP = async (email: string, name?: string) => {
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, purpose: "verify", name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to send code");
    if (data.devOTP) {
      setError(`[Dev mode] Your code is: ${data.devOTP}`);
    }
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 400));

    if (mode === "login") {
      const result = login(form.email, form.password);
      if (result.success) {
        setSuccess("Welcome back! Redirecting...");
        setTimeout(() => router.push("/account"), 1000);
      } else {
        setError(result.error ?? "Login failed");
      }
      setLoading(false);
      return;
    }

    // Register flow — send OTP first, create account only after verify
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    // Check email not already taken before sending OTP
    const { emailExists } = useAuthStore.getState();
    if (emailExists(form.email)) {
      setError("An account with this email already exists");
      setLoading(false);
      return;
    }

    setPendingEmail(form.email);
    try {
      await sendVerifyOTP(form.email, form.firstName);
      startResendCooldown();
      setRegisterStep("otp");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send verification code");
    }
    setLoading(false);
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
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
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
      // 1. Verify OTP
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, code, purpose: "verify" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid code");

      // 2. Create account now that email is verified
      const result = register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });

      if (!result.success) throw new Error(result.error ?? "Registration failed");

      // 3. Send welcome email (fire-and-forget)
      fetch("/api/auth/welcome-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          name: form.firstName,
          couponCode: result.user?.personalCode,
        }),
      }).catch(() => {});

      setSuccess("Account created! Redirecting...");
      setTimeout(() => router.push("/account"), 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setOtpDigits(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setLoading(true);
    try {
      await sendVerifyOTP(pendingEmail, form.firstName);
      startResendCooldown();
      setOtpDigits(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setRegisterStep("form");
    setError("");
    setSuccess("");
    setOtpDigits(["", "", "", "", "", ""]);
    setForm({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
  };

  // OTP verification step after register
  if (mode === "register" && registerStep === "otp") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
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

          <div className="mb-8">
            <h1 className="text-2xl font-light tracking-wide mb-2">Verify Your Email</h1>
            <p className="text-sm text-stone-400 leading-relaxed">
              We sent a 6-digit code to{" "}
              <span className="text-stone-700 font-medium">{pendingEmail}</span>.
              Enter it below to activate your account.
            </p>
          </div>

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
          {success && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 mb-5 text-sm">
              <CheckCircle2 size={15} className="shrink-0" />
              {success}
            </div>
          )}

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
              {loading ? "Verifying..." : "Activate Account"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-xs text-stone-400">Didn't receive the code? </span>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendCooldown > 0 || loading}
              className="text-xs text-stone-700 underline disabled:text-stone-400 disabled:no-underline"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <p className="text-stone-400 text-sm mt-2">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex border border-stone-200 mb-8">
          <button
            onClick={() => switchMode("login")}
            className={cn(
              "flex-1 py-3 text-xs tracking-widest uppercase transition-colors",
              mode === "login" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-50"
            )}
          >
            Sign In
          </button>
          <button
            onClick={() => switchMode("register")}
            className={cn(
              "flex-1 py-3 text-xs tracking-widest uppercase transition-colors",
              mode === "register" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-50"
            )}
          >
            Create Account
          </button>
        </div>

        {/* Alert */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-5 text-sm">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 mb-5 text-sm">
            <CheckCircle2 size={15} className="shrink-0" />
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First name"
                required
                value={form.firstName}
                onChange={update("firstName")}
                className="px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
              />
              <input
                type="text"
                placeholder="Last name"
                required
                value={form.lastName}
                onChange={update("lastName")}
                className="px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
              />
            </div>
          )}

          <input
            type="email"
            placeholder="Email address"
            required
            value={form.email}
            onChange={update("email")}
            className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={form.password}
              onChange={update("password")}
              className="w-full px-4 py-3 pr-11 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {mode === "register" && (
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm password"
              required
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
            />
          )}

          {mode === "login" && (
            <div className="text-right">
              <Link
                href="/auth/forgot-password"
                className="text-xs text-stone-400 hover:text-stone-700 transition-colors underline"
              >
                Forgot password?
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors font-medium disabled:opacity-60 mt-2"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-stone-400 mt-8">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-stone-700">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline hover:text-stone-700">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
