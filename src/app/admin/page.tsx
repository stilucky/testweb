"use client";

import Link from "next/link";
import {
  TrendingUp, ShoppingCart, ArrowRight,
  Scissors, Ruler,
} from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import { useAuthStore } from "@/store/authStore";
import { useTailoredOrderStore } from "@/store/tailoredOrderStore";
import { formatPrice, cn } from "@/lib/utils";
import { products } from "@/lib/data";

export default function AdminDashboard() {
  const { orders } = useOrderStore();
  const { users } = useAuthStore();
  const { orders: tailoredOrders } = useTailoredOrderStore();
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safeTailoredOrders = Array.isArray(tailoredOrders) ? tailoredOrders : [];

  // ── Regular orders ──────────────────────────────────────────────
  const totalRevenue = safeOrders
    .filter((o) => o.payment === "paid")
    .reduce((s, o) => s + o.total, 0);

  const recentOrders = [...safeOrders].slice(0, 5);

  // ── Tailored orders breakdown ────────────────────────────────────
  const madeToOrderCount   = safeTailoredOrders.filter((o) => o.type === "made-to-order").length;
  const customizedFitCount = safeTailoredOrders.filter((o) => o.type === "customized-fit").length;
  const pendingTailored    = safeTailoredOrders.filter((o) => o.status === "pending").length;
  const recentTailored     = [...safeTailoredOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const tailoredRevenue = safeTailoredOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.totalPrice, 0);

  const stats = [
    {
      label: "Revenue",
      value: formatPrice(totalRevenue + tailoredRevenue),
      icon: TrendingUp,
      sub: "all order types · paid",
      href: "/admin/analytics",
    },
    {
      label: "Regular Orders",
      value: String(safeOrders.length),
      icon: ShoppingCart,
      sub: "ready-to-wear",
      href: "/admin/orders",
    },
    {
      label: "Make to Order",
      value: String(madeToOrderCount),
      icon: Scissors,
      sub: pendingTailored > 0 ? `${pendingTailored} pending` : "standard size · custom made",
      href: "/admin/tailored-orders",
      accent: madeToOrderCount > 0 ? "violet" : undefined,
    },
    {
      label: "Customized Fit",
      value: String(customizedFitCount),
      icon: Ruler,
      sub: "body measurements · bespoke",
      href: "/admin/tailored-orders",
      accent: customizedFitCount > 0 ? "pink" : undefined,
    },
  ];

  const orderStatusStyle: Record<string, string> = {
    delivered:  "bg-emerald-50 text-emerald-600",
    shipped:    "bg-blue-50 text-blue-600",
    processing: "bg-amber-50 text-amber-600",
    pending:    "bg-stone-100 text-stone-500",
    cancelled:  "bg-red-50 text-red-500",
  };

  const tailoredStatusStyle: Record<string, string> = {
    completed:     "bg-emerald-50 text-emerald-600",
    shipped:       "bg-blue-50 text-blue-600",
    in_production: "bg-amber-50 text-amber-600",
    confirmed:     "bg-violet-50 text-violet-600",
    pending:       "bg-stone-100 text-stone-500",
    cancelled:     "bg-red-50 text-red-500",
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {stats.map(({ label, value, icon: Icon, sub, href, accent }) => (
          <Link
            key={label}
            href={href}
            className="bg-white border border-stone-100 p-4 md:p-6 hover:border-stone-300 transition-colors group"
          >
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <p className="text-[10px] md:text-xs tracking-widests uppercase text-stone-400 leading-tight pr-1">
                {label}
              </p>
              <div className={cn(
                "p-1.5 md:p-2 rounded-sm shrink-0",
                accent === "violet" ? "bg-violet-50" :
                accent === "pink"   ? "bg-pink-50" :
                "bg-stone-50"
              )}>
                <Icon size={13} className={cn(
                  accent === "violet" ? "text-violet-500" :
                  accent === "pink"   ? "text-pink-500" :
                  "text-stone-600"
                )} />
              </div>
            </div>
            <p className="text-2xl md:text-3xl mb-1" style={{ fontFamily: "var(--font-cormorant), serif" }}>
              {value}
            </p>
            <p className="text-xs text-stone-400">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Order type legend */}
      <div className="flex items-center gap-4 mb-4 md:mb-6 px-1">
        <div className="flex items-center gap-1.5">
          <ShoppingCart size={11} className="text-stone-400" />
          <span className="text-[11px] text-stone-500">Regular Orders</span>
        </div>
        <span className="text-stone-200">·</span>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-violet-400" />
          <span className="text-[11px] text-stone-500">Make to Order</span>
        </div>
        <span className="text-stone-200">·</span>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-pink-400" />
          <span className="text-[11px] text-stone-500">Customized Fit</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-4 md:gap-6 mb-4 md:mb-6">
        {/* Recent regular orders */}
        <div className="lg:col-span-3 bg-white border border-stone-100">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-5 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <ShoppingCart size={13} className="text-stone-400" />
              <h2 className="text-xs tracking-widests uppercase font-medium">Regular Orders</h2>
            </div>
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
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize whitespace-nowrap ${orderStatusStyle[order.status]}`}>
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

        {/* Recent tailored orders */}
        <div className="lg:col-span-2 bg-white border border-stone-100">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-5 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Scissors size={13} className="text-stone-400" />
              <h2 className="text-xs tracking-widests uppercase font-medium">Tailored Orders</h2>
              {pendingTailored > 0 && (
                <span className="text-[9px] bg-amber-100 text-amber-700 font-medium px-1.5 py-0.5 rounded-full">
                  {pendingTailored} new
                </span>
              )}
            </div>
            <Link href="/admin/tailored-orders" className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-900 transition-colors">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          {recentTailored.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-sm">No tailored orders yet</div>
          ) : (
            <div className="divide-y divide-stone-50">
              {recentTailored.map((order) => (
                <div key={order.id} className="flex items-center gap-3 px-4 md:px-6 py-3 md:py-4 hover:bg-stone-50/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{order.designName}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap",
                        order.type === "made-to-order"
                          ? "bg-violet-50 text-violet-600"
                          : "bg-pink-50 text-pink-600"
                      )}>
                        {order.type === "made-to-order" ? "Make Order" : "Custom Fit"}
                      </span>
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded-full font-medium capitalize whitespace-nowrap",
                        tailoredStatusStyle[order.status]
                      )}>
                        {order.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-medium shrink-0" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                    {formatPrice(order.totalPrice)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Additional stats row */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="bg-white border border-stone-100 p-4">
          <p className="text-[10px] tracking-widests uppercase text-stone-400 mb-2">Products</p>
          <p className="text-2xl" style={{ fontFamily: "var(--font-cormorant), serif" }}>{products.length}</p>
          <p className="text-xs text-stone-400 mt-1">in catalog</p>
        </div>
        <div className="bg-white border border-stone-100 p-4">
          <p className="text-[10px] tracking-widests uppercase text-stone-400 mb-2">Customers</p>
          <p className="text-2xl" style={{ fontFamily: "var(--font-cormorant), serif" }}>
            {safeUsers.filter((u) => u.role === "customer").length}
          </p>
          <p className="text-xs text-stone-400 mt-1">registered</p>
        </div>
        <div className="bg-white border border-stone-100 p-4">
          <p className="text-[10px] tracking-widests uppercase text-stone-400 mb-2">Tailored Total</p>
          <p className="text-2xl" style={{ fontFamily: "var(--font-cormorant), serif" }}>
            {safeTailoredOrders.length}
          </p>
          <p className="text-xs text-stone-400 mt-1">
            {madeToOrderCount} make · {customizedFitCount} custom fit
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {[
          { label: "Add Product",     href: "/admin/products" },
          { label: "Regular Orders",  href: "/admin/orders" },
          { label: "Make to Order",   href: "/admin/tailored-orders" },
          { label: "Analytics",       href: "/admin/analytics" },
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
    </div>
  );
}
