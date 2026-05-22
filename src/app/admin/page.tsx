"use client";

import Link from "next/link";
import { TrendingUp, ShoppingCart, Package, Users, ArrowUpRight, ArrowRight } from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";
import { products } from "@/lib/data";

export default function AdminDashboard() {
  const { orders } = useOrderStore();
  const { users } = useAuthStore();

  const totalRevenue = orders
    .filter((o) => o.payment === "paid")
    .reduce((s, o) => s + o.total, 0);

  const thisMonth = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

  const recentOrders = [...orders].slice(0, 5);

  // Top products by revenue
  const productRevMap: Record<string, { name: string; revenue: number; sold: number; category: string }> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productRevMap[item.name]) {
        productRevMap[item.name] = { name: item.name, revenue: 0, sold: 0, category: "" };
      }
      productRevMap[item.name].revenue += item.price * item.qty;
      productRevMap[item.name].sold += item.qty;
    });
  });
  const topProducts = Object.values(productRevMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

  const stats = [
    {
      label: `Revenue (${thisMonth})`,
      value: totalRevenue > 0 ? formatPrice(totalRevenue) : "$0",
      icon: TrendingUp,
      sub: "from paid orders",
    },
    {
      label: "Orders",
      value: String(orders.length),
      icon: ShoppingCart,
      sub: "total placed",
    },
    {
      label: "Active Products",
      value: String(products.length),
      icon: Package,
      sub: "in catalog",
    },
    {
      label: "Customers",
      value: String(users.filter((u) => u.role === "customer").length),
      icon: Users,
      sub: "registered",
    },
  ];

  const statusStyle: Record<string, string> = {
    delivered: "bg-emerald-50 text-emerald-600",
    shipped: "bg-blue-50 text-blue-600",
    processing: "bg-amber-50 text-amber-600",
    pending: "bg-stone-100 text-stone-500",
    cancelled: "bg-red-50 text-red-500",
  };

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
        <p className="text-stone-400 text-sm mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className="bg-white border border-stone-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs tracking-widest uppercase text-stone-400">{label}</p>
              <div className="p-2 bg-stone-50 rounded-sm">
                <Icon size={14} className="text-stone-600" />
              </div>
            </div>
            <p className="text-3xl mb-1" style={{ fontFamily: "var(--font-cormorant), serif" }}>
              {value}
            </p>
            <p className="text-xs text-stone-400">{sub}</p>
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

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-sm">
              No orders yet
            </div>
          ) : (
            <div className="divide-y divide-stone-50">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-stone-50/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{order.id}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{order.customer}</p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <p className="text-xs text-stone-400 hidden md:block">{order.date}</p>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium tracking-wide capitalize ${statusStyle[order.status]}`}>
                      {order.status}
                    </span>
                    <p className="text-sm font-medium min-w-16 text-right" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
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

          {topProducts.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-sm">
              No sales data yet
            </div>
          ) : (
            <div className="divide-y divide-stone-50">
              {topProducts.map((product, i) => (
                <div key={product.name} className="flex items-center gap-4 px-6 py-4">
                  <span className="text-xs text-stone-300 font-medium w-4 shrink-0">0{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{product.sold} sold</p>
                  </div>
                  <p className="text-sm shrink-0" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                    {formatPrice(product.revenue)}
                  </p>
                </div>
              ))}
            </div>
          )}
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

      {/* No orders hint */}
      {orders.length === 0 && (
        <div className="mt-6 p-4 bg-stone-50 border border-stone-100 text-xs text-stone-400 text-center">
          Orders placed by customers will appear here automatically.
        </div>
      )}
    </div>
  );
}
