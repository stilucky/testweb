"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);

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
              TeBoutique
            </span>
          </Link>
          <p className="text-stone-400 text-sm mt-2">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex border border-stone-200 mb-8">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-3 text-xs tracking-widest uppercase transition-colors ${
              mode === "login" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-50"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-3 text-xs tracking-widest uppercase transition-colors ${
              mode === "register" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-50"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {mode === "register" && (
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First name"
                required
                className="px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
              />
              <input
                type="text"
                placeholder="Last name"
                required
                className="px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
              />
            </div>
          )}
          <input
            type="email"
            placeholder="Email address"
            required
            className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              className="w-full px-4 py-3 pr-10 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {mode === "login" && (
            <div className="text-right">
              <Link href="/auth/forgot-password" className="text-xs text-stone-400 hover:text-stone-700 transition-colors underline">
                Forgot password?
              </Link>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors font-medium mt-2"
          >
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-xs text-stone-400">or</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        {/* Social login */}
        <div className="space-y-3">
          <button className="w-full py-3 border border-stone-200 text-sm hover:bg-stone-50 transition-colors flex items-center justify-center gap-3">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

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
