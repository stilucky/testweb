import Link from "next/link";
import { TrendingUp, ShoppingCart, Package, Users, ArrowUpRight, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

const stats = [
  {
    label: "Revenue (May)",
    value: "$24,580",
    change: "+12.4%",
    up: true,
    icon: TrendingUp,
    sub: "vs last month",
  },
  {
    label: "Orders",
    value: "148",
    change: "+8.1%",
    up: true,
    icon: ShoppingCart,
    sub: "this month",
  },
  {
    label: "Active Products",
    value: "8",
    change: "0",
    up: true,
    icon: Package,
    sub: "in catalog",
  },
  {
    label: "Customers",
    value: "321",
    change: "+5.3%",
    up: true,
    icon: Users,
    sub: "registered",
  },
];

const recentOrders = [
  { id: "ORD-24051", customer: "Sophie Laurent", items: 2, total: 530, status: "delivered", date: "May 12" },
  { id: "ORD-24050", customer: "Claire Dubois", items: 1, total: 285, status: "shipped", date: "May 11" },
  { id: "ORD-24049", customer: "Emma Wilson", items: 3, total: 640, status: "processing", date: "May 11" },
  { id: "ORD-24048", customer: "Lena Park", items: 1, total: 195, status: "delivered", date: "May 10" },
  { id: "ORD-24047", customer: "Mia Chen", items: 2, total: 410, status: "shipped", date: "May 10" },
];

const topProducts = [
  { name: "Vivienne Blazer", category: "Outerwear", sold: 34, revenue: 8330 },
  { name: "Margot Slip Dress", category: "Dresses", sold: 28, revenue: 4340 },
  { name: "Celestine Lace Dress", category: "Dresses", sold: 21, revenue: 5985 },
  { name: "Solène Palazzo Pants", category: "Bottoms", sold: 19, revenue: 3325 },
];

const statusStyle: Record<string, string> = {
  delivered: "bg-emerald-50 text-emerald-600",
  shipped: "bg-blue-50 text-blue-600",
  processing: "bg-amber-50 text-amber-600",
  cancelled: "bg-red-50 text-red-500",
};

export default function AdminDashboard() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-1">Overview</p>
        <h1
          className="text-4xl text-stone-900"
          style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
        >
          Dashboard
        </h1>
        <p className="text-stone-400 text-sm mt-1">Thursday, May 22, 2026</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, change, up, icon: Icon, sub }) => (
          <div key={label} className="bg-white border border-stone-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs tracking-widest uppercase text-stone-400">{label}</p>
              <div className="p-2 bg-stone-50 rounded-sm">
                <Icon size={14} className="text-stone-600" />
              </div>
            </div>
            <p
              className="text-3xl mb-1"
              style={{ fontFamily: "var(--font-cormorant), serif" }}
            >
              {value}
            </p>
            <div className="flex items-center gap-2">
              {change !== "0" && (
                <span className={`text-xs font-medium flex items-center gap-0.5 ${up ? "text-emerald-600" : "text-red-500"}`}>
                  <ArrowUpRight size={11} className={up ? "" : "rotate-90"} />
                  {change}
                </span>
              )}
              <span className="text-xs text-stone-400">{sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-3 bg-white border border-stone-100">
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
            <h2 className="text-xs tracking-widest uppercase font-medium">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-900 transition-colors tracking-wide"
            >
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-stone-50">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-stone-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium">{order.id}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{order.customer}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <p className="text-xs text-stone-400 hidden md:block">{order.date}</p>
                  <span
                    className={`text-[11px] px-2.5 py-1 rounded-full font-medium tracking-wide capitalize ${statusStyle[order.status]}`}
                  >
                    {order.status}
                  </span>
                  <p
                    className="text-sm font-medium min-w-16 text-right"
                    style={{ fontFamily: "var(--font-cormorant), serif" }}
                  >
                    ${order.total}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-2 bg-white border border-stone-100">
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
            <h2 className="text-xs tracking-widest uppercase font-medium">Top Products</h2>
            <Link
              href="/admin/products"
              className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-900 transition-colors tracking-wide"
            >
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-stone-50">
            {topProducts.map((product, i) => (
              <div key={product.name} className="flex items-center gap-4 px-6 py-4">
                <span className="text-xs text-stone-300 font-medium w-4 shrink-0">0{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-stone-400 capitalize mt-0.5">{product.category}</p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className="text-sm"
                    style={{ fontFamily: "var(--font-cormorant), serif" }}
                  >
                    ${product.revenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-stone-400">{product.sold} sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Add Product", href: "/admin/products" },
          { label: "View Orders", href: "/admin/orders" },
          { label: "Manage Customers", href: "/admin/customers" },
          { label: "View Analytics", href: "/admin/analytics" },
        ].map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center justify-between px-5 py-4 bg-white border border-stone-100 text-xs tracking-widest uppercase hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all group"
          >
            {label}
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        ))}
      </div>
    </div>
  );
}
