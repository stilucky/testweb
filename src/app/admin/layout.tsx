import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import AdminNav from "./AdminNav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin — TeBoutique" },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-stone-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-stone-100 flex flex-col shrink-0 sticky top-0 h-screen">
        {/* Brand */}
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

        {/* Nav — client component for active states */}
        <AdminNav />

        {/* Bottom */}
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

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
