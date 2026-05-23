"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Menu, X } from "lucide-react";
import AdminNav from "./AdminNav";

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-stone-100 flex items-center justify-between px-4 h-14 shrink-0">
        <button onClick={() => setOpen(true)} className="p-2 -ml-2 text-stone-600" aria-label="Open menu">
          <Menu size={20} />
        </button>
        <Link href="/">
          <span
            className="text-xl tracking-[0.15em] uppercase"
            style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 400 }}
          >
            TeBoutique
          </span>
        </Link>
        <Link href="/" className="p-2 -mr-2 text-stone-400" aria-label="Back to store">
          <ArrowLeft size={18} />
        </Link>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 shrink-0">
              <div>
                <span
                  className="text-lg tracking-[0.15em] uppercase"
                  style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 400 }}
                >
                  TeBoutique
                </span>
                <p className="text-[10px] tracking-widest uppercase text-stone-400 mt-0.5">Admin Console</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 text-stone-400 hover:text-stone-900">
                <X size={18} />
              </button>
            </div>

            {/* Nav */}
            <AdminNav onNavigate={() => setOpen(false)} />

            {/* Footer */}
            <div className="px-3 pb-6 border-t border-stone-100 pt-4 shrink-0">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-xs text-stone-400 hover:text-stone-900 tracking-widest uppercase transition-colors"
              >
                <ArrowLeft size={14} />
                Back to Store
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-60 bg-white border-r border-stone-100 flex-col shrink-0 sticky top-0 h-screen">
        <div className="px-6 py-6 border-b border-stone-100">
          <Link href="/">
            <span
              className="text-xl tracking-[0.15em] uppercase"
              style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 400 }}
            >
              TeBoutique
            </span>
          </Link>
          <p className="text-[10px] tracking-widest uppercase text-stone-400 mt-0.5">Admin Console</p>
        </div>
        <AdminNav />
        <div className="px-3 pb-6 border-t border-stone-100 pt-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2.5 text-xs text-stone-400 hover:text-stone-900 tracking-widest uppercase transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Store
          </Link>
        </div>
      </aside>
    </>
  );
}
