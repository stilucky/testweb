import type { Metadata } from "next";
import AdminGuard from "./AdminGuard";
import AdminSidebar from "./AdminSidebar";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin — Lunelle" },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="admin-shell h-dvh min-h-screen overflow-hidden flex bg-stone-50">
        <AdminSidebar />
        {/* pt-14 on mobile to clear fixed top bar */}
        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto pt-14 md:pt-0">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
