"use client";

import Link from "next/link";
import { TrendingUp, ShoppingCart, Package, Users, ArrowRight } from "lucide-react";
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

  const productRevMap: Record<string, { name: string; revenue: number; sold: number }> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productRevMap[item.name]) {
        productRevMap[item.name] = { name: item.name, revenue: 0, sold: 0 };
      }
      productRevMap[item.name].revenue += item.price * item.qty;
      productRevMap[item.name].sold += item.qty;
    });
  });
  const topProducts = Object.values(productRevMap).sort((a, b) => b.revenue - a.revenue).slice(0, 4);

  const stats = [
    { label: `Revenue`, value: totalRevenue > 0 ? formatPrice(totalRevenue) : "$0", icon: TrendingUp, sub: thisMonth },
    { label: "Orders", value: String(orders.length), icon: ShoppingCart, sub: "total placed" },
    { label: "Products", value: String(products.length), icon: Package, sub: "in catalog" },
    { label: "Customers", value: String(users.filter((u) => u.role === "customer").length), icon: Users, sub: "registered" },
  ];

  const statusStyle: Record<string, string> = {
    delivered: "bg-emerald-50 text-emerald-600",
    shipped: "bg-blue-50 text-blue-600",
    processing: "bg-amber-50 text-amber-600",
    pending: "bg-stone-100 text-stone-500",
    cancelled: "bg-red-50 text-red-500",
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <p className="type-label text-stone-400 mb-1">Overview</p>
        <h1
          className="text-3xl md:text-4xl text-stone-900"
          style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
        >
          Dashboard
        </h1>
        <p className="text-stone-400 text-xs md:text-sm mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-10">
        {stats.map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className="bg-white border border-stone-100 p-4 md:p-6">
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <p className="text-[10px] md:text-xs tracking-widests uppercase text-stone-400 leading-tight pr-1">{label}</p>
              <div className="p-1.5 md:p-2 bg-stone-50 rounded-sm shrink-0">
                <Icon size={13} className="text-stone-600" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl mb-1" style={{ fontFamily: "var(--font-cormorant), serif" }}>
              {value}
            </p>
            <p className="text-xs text-stone-400">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-4 md:gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-3 bg-white border border-stone-100">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-5 border-b border-stone-100">
            <h2 className="text-xs tracking-widests uppercase font-medium">Recent Orders</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-900 transition-colors">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-sm">No orders yet</div>
          ) : (
            <div className="divide-y divide-stone-50">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 hover:bg-stone-50/50 transition-colors gap-2">
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm font-medium font-mono">{order.id}</p>
                    <p className="text-xs text-stone-400 mt-0.5 truncate">{order.customer}</p>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize whitespace-nowrap ${statusStyle[order.status]}`}>
                      {order.status}
                    </span>
                    <p className="text-xs md:text-sm font-medium whitespace-nowrap" style={{ fontFamily: "var(--font-cormorant), serif" }}>
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
          <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-5 border-b border-stone-100">
            <h2 className="text-xs tracking-widests uppercase font-medium">Top Products</h2>
            <Link href="/admin/products" className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-900 transition-colors">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          {topProducts.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-sm">No sales data yet</div>
          ) : (
            <div className="divide-y divide-stone-50">
              {topProducts.map((product, i) => (
                <div key={product.name} className="flex items-center gap-3 px-4 md:px-6 py-3 md:py-4">
                  <span className="text-xs text-stone-300 font-medium w-4 shrink-0">0{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{product.sold} sold</p>
                  </div>
                  <p className="text-xs md:text-sm shrink-0" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                    {formatPrice(product.revenue)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-4 md:mt-6 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {[
          { label: "Add Product", href: "/admin/products" },
          { label: "View Orders", href: "/admin/orders" },
          { label: "Customers", href: "/admin/customers" },
          { label: "Analytics", href: "/admin/analytics" },
        ].map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center justify-between px-3 md:px-5 py-3 md:py-4 bg-white border border-stone-100 text-xs tracking-widests uppercase hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all group"
          >
            <span className="truncate">{label}</span>
            <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform shrink-0 ml-1" />
          </Link>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="mt-4 p-4 bg-stone-50 border border-stone-100 text-xs text-stone-400 text-center">
          Orders placed by customers will appear here automatically.
        </div>
      )}
    </div>
  );
}
