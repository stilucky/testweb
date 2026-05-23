import type { Metadata } from "next";
import AdminGuard from "./AdminGuard";
import AdminSidebar from "./AdminSidebar";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin — TeBoutique" },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen flex bg-stone-50">
        <AdminSidebar />
        {/* pt-14 on mobile to clear fixed top bar */}
        <main className="flex-1 min-w-0 overflow-auto pt-14 md:pt-0">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
