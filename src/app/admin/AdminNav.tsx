"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart2,
  Tag,
  Mail,
  Settings,
  Layers,
  Scissors,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/admin",               label: "Dashboard",       icon: LayoutDashboard, exact: true },
  { href: "/admin/products",      label: "Products",        icon: Package,         exact: false },
  { href: "/admin/collections",   label: "Collections",     icon: Layers,          exact: false },
  { href: "/admin/tailored-orders", label: "Tailored Orders", icon: Scissors,      exact: false },
  { href: "/admin/orders",        label: "Orders",          icon: ShoppingCart,    exact: false },
  { href: "/admin/customers",     label: "Customers",       icon: Users,           exact: false },
  { href: "/admin/analytics",     label: "Analytics",       icon: BarChart2,       exact: false },
  { href: "/admin/coupons",       label: "Coupons",         icon: Tag,             exact: false },
  { href: "/admin/subscribers",   label: "Subscribers",     icon: Mail,            exact: false },
  { href: "/admin/settings",      label: "Settings",        icon: Settings,        exact: false },
];

export default function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto">
      {navLinks.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-xs tracking-widest uppercase transition-colors rounded-sm",
              isActive
                ? "bg-stone-900 text-white"
                : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
            )}
          >
            <Icon size={14} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
