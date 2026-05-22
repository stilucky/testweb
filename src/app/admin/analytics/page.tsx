"use client";

import { useMemo, useState } from "react";
import { TrendingUp, ShoppingBag, Users, BarChart2, BarChart3, Filter } from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import { useAuthStore } from "@/store/authStore";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type DatePreset = "7d" | "30d" | "3m" | "6m" | "1y" | "all" | "custom";

function getPresetRange(preset: DatePreset): { from: Date | null; to: Date | null } {
  const now = new Date();
  const to = new Date(now);
  if (preset === "all" || preset === "custom") return { from: null, to: null };
  const from = new Date(now);
  if (preset === "7d") from.setDate(from.getDate() - 7);
  else if (preset === "30d") from.setDate(from.getDate() - 30);
  else if (preset === "3m") from.setMonth(from.getMonth() - 3);
  else if (preset === "6m") from.setMonth(from.getMonth() - 6);
  else if (preset === "1y") from.setFullYear(from.getFullYear() - 1);
  return { from, to };
}

function getLast6Months(): { year: number; month: number; label: string }[] {
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({ year: d.getFullYear(), month: d.getMonth(), label: MONTH_LABELS[d.getMonth()] });
  }
  return result;
}

export default function AnalyticsPage() {
  const { orders } = useOrderStore();
  const { users } = useAuthStore();

  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [datePreset, setDatePreset] = useState<DatePreset>("6m");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const customers = users.filter((u) => u.role === "customer");
  const customerCount = customers.length;

  const filteredOrders = useMemo(() => {
    let result = orders;

    // Filter by user
    if (selectedUser !== "all") {
      const user = users.find((u) => u.id === selectedUser);
      if (user) {
        result = result.filter(
          (o) => o.userId === selectedUser || o.email.toLowerCase() === user.email.toLowerCase()
        );
      }
    }

    // Filter by date
    const { from, to } = datePreset === "custom"
      ? {
          from: customFrom ? new Date(customFrom) : null,
          to: customTo ? new Date(customTo + "T23:59:59") : null,
        }
      : getPresetRange(datePreset);

    if (from) result = result.filter((o) => new Date(o.createdAt) >= from);
    if (to) result = result.filter((o) => new Date(o.createdAt) <= to);

    return result;
  }, [orders, selectedUser, datePreset, customFrom, customTo, users]);

  const last6 = useMemo(() => getLast6Months(), []);

  const monthlyRevenue = useMemo(() => {
    return last6.map(({ year, month, label }) => {
      const monthOrders = filteredOrders.filter((o) => {
        const d = new Date(o.createdAt);
        return d.getFullYear() === year && d.getMonth() === month;
      });
      const revenue = monthOrders
        .filter((o) => o.payment === "paid")
        .reduce((s, o) => s + o.total, 0);
      return { label, revenue, orders: monthOrders.length };
    });
  }, [filteredOrders, last6]);

  const totalRevenue = useMemo(
    () => filteredOrders.filter((o) => o.payment === "paid").reduce((s, o) => s + o.total, 0),
    [filteredOrders]
  );

  const totalOrders = filteredOrders.length;
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const productMap = useMemo(() => {
    const map: Record<string, string> = {};
    products.forEach((p) => { map[p.name.toLowerCase()] = p.category; });
    return map;
  }, []);

  const topProducts = useMemo(() => {
    const agg: Record<string, { name: string; sold: number; revenue: number; category: string }> = {};
    filteredOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!agg[item.name]) {
          agg[item.name] = { name: item.name, sold: 0, revenue: 0, category: productMap[item.name.toLowerCase()] ?? "—" };
        }
        agg[item.name].sold += item.qty;
        agg[item.name].revenue += item.price * item.qty;
      });
    });
    return Object.values(agg).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [filteredOrders, productMap]);

  const categoryBreakdown = useMemo(() => {
    const cat: Record<string, number> = {};
    let grandTotal = 0;
    filteredOrders.forEach((o) => {
      o.items.forEach((item) => {
        const category = productMap[item.name.toLowerCase()] ?? "Other";
        const rev = item.price * item.qty;
        cat[category] = (cat[category] ?? 0) + rev;
        grandTotal += rev;
      });
    });
    return Object.entries(cat)
      .map(([name, revenue]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        revenue,
        pct: grandTotal > 0 ? Math.round((revenue / grandTotal) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders, productMap]);

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

  const avgItemsPerOrder = useMemo(() => {
    if (totalOrders === 0) return 0;
    const totalItems = filteredOrders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.qty, 0), 0);
    return totalItems / totalOrders;
  }, [filteredOrders, totalOrders]);

  const kpis = [
    { label: "Total Revenue", value: totalRevenue > 0 ? formatPrice(totalRevenue) : "$0", icon: TrendingUp, sub: "from paid orders" },
    { label: "Total Orders", value: String(totalOrders), icon: ShoppingBag, sub: "in selected period" },
    { label: "Avg Order Value", value: aov > 0 ? formatPrice(aov) : "$0", icon: BarChart2, sub: "per transaction" },
    { label: "Customers", value: String(customerCount), icon: Users, sub: "registered accounts" },
  ];

  const PRESETS: { key: DatePreset; label: string }[] = [
    { key: "7d", label: "7 days" },
    { key: "30d", label: "30 days" },
    { key: "3m", label: "3 months" },
    { key: "6m", label: "6 months" },
    { key: "1y", label: "1 year" },
    { key: "all", label: "All time" },
    { key: "custom", label: "Custom" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-1">Reporting</p>
        <h1
          className="text-4xl text-stone-900"
          style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
        >
          Analytics
        </h1>
        <p className="text-stone-400 text-sm mt-1">
          {selectedUser === "all"
            ? "All customers"
            : users.find((u) => u.id === selectedUser)
              ? `${users.find((u) => u.id === selectedUser)!.firstName} ${users.find((u) => u.id === selectedUser)!.lastName}`
              : "Selected customer"}
          {" · "}
          {PRESETS.find((p) => p.key === datePreset)?.label ?? "Custom range"}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8 bg-white border border-stone-100 p-4">
        <div className="flex items-center gap-2">
          <Filter size={13} className="text-stone-400 shrink-0" />
          <span className="text-[10px] tracking-widests uppercase text-stone-400">Filters</span>
        </div>

        {/* User filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-widests uppercase text-stone-400">Customer</span>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="border border-stone-200 text-xs px-3 py-1.5 text-stone-700 focus:outline-none focus:border-stone-800 bg-white"
          >
            <option value="all">All customers</option>
            {customers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.firstName} {u.lastName} ({u.email})
              </option>
            ))}
          </select>
        </div>

        {/* Date preset */}
        <div className="flex items-center gap-1 border border-stone-200">
          {PRESETS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setDatePreset(key)}
              className={cn(
                "px-3 py-1.5 text-xs tracking-wide transition-colors",
                datePreset === key ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-50"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Custom date inputs */}
        {datePreset === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="border border-stone-200 text-xs px-3 py-1.5 text-stone-700 focus:outline-none focus:border-stone-800"
            />
            <span className="text-xs text-stone-400">→</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="border border-stone-200 text-xs px-3 py-1.5 text-stone-700 focus:outline-none focus:border-stone-800"
            />
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {kpis.map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className="bg-white border border-stone-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs tracking-widests uppercase text-stone-400">{label}</p>
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

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-stone-100">
          <div className="px-6 py-5 border-b border-stone-100">
            <h2 className="text-xs tracking-widests uppercase font-medium">Monthly Revenue</h2>
          </div>
          <div className="p-6">
            {totalOrders === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center">
                <BarChart3 size={36} className="text-stone-200 mb-3" />
                <p className="text-stone-400 text-sm">No orders in this period</p>
                <p className="text-stone-300 text-xs mt-1">Try adjusting the date filter</p>
              </div>
            ) : (
              <>
                <div className="flex items-end gap-3 h-48">
                  {monthlyRevenue.map(({ label, revenue, orders: cnt }) => {
                    const heightPct = Math.round((revenue / maxRevenue) * 100);
                    return (
                      <div key={label} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="w-full relative flex flex-col justify-end" style={{ height: "160px" }}>
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {revenue > 0 ? formatPrice(revenue) : "$0"} · {cnt} orders
                          </div>
                          <div
                            className="w-full bg-stone-900 hover:bg-stone-700 transition-colors rounded-sm"
                            style={{ height: heightPct > 0 ? `${heightPct}%` : "2px", minHeight: cnt > 0 ? "4px" : "2px" }}
                          />
                        </div>
                        <span className="text-[10px] text-stone-400 tracking-wide">{label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-4 border-t border-stone-100 pt-3">
                  {monthlyRevenue.map(({ label, revenue }) => (
                    <div key={label} className="flex-1 text-center">
                      <p className="text-xs font-medium text-stone-700">
                        {revenue > 0 ? `$${(revenue / 1000).toFixed(1)}k` : "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white border border-stone-100">
          <div className="px-6 py-5 border-b border-stone-100">
            <h2 className="text-xs tracking-widests uppercase font-medium">Revenue by Category</h2>
          </div>
          <div className="p-6">
            {categoryBreakdown.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-stone-400 text-sm">No data for this period</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categoryBreakdown.map(({ name, revenue, pct }) => (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-stone-600">{name}</span>
                      <span className="text-xs font-medium text-stone-800">{formatPrice(revenue)}</span>
                    </div>
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-stone-900 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1">{pct}% of total</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white border border-stone-100">
        <div className="px-6 py-5 border-b border-stone-100">
          <h2 className="text-xs tracking-widests uppercase font-medium">Top Products by Revenue</h2>
        </div>
        {topProducts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-stone-400 text-sm">No sales data for this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-50">
                  <th className="text-left text-[10px] tracking-widests uppercase text-stone-400 font-normal px-6 py-3">#</th>
                  <th className="text-left text-[10px] tracking-widests uppercase text-stone-400 font-normal px-6 py-3">Product</th>
                  <th className="text-left text-[10px] tracking-widests uppercase text-stone-400 font-normal px-6 py-3">Category</th>
                  <th className="text-right text-[10px] tracking-widests uppercase text-stone-400 font-normal px-6 py-3">Units Sold</th>
                  <th className="text-right text-[10px] tracking-widests uppercase text-stone-400 font-normal px-6 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {topProducts.map(({ name, category, sold, revenue }, i) => (
                  <tr key={name} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs text-stone-300 font-medium">0{i + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium">{name}</td>
                    <td className="px-6 py-4 text-xs text-stone-400 capitalize">{category}</td>
                    <td className="px-6 py-4 text-sm text-right">{sold}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                      {formatPrice(revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid grid-cols-3 divide-x divide-stone-100 border-t border-stone-100">
          {[
            { label: "Paid Orders", value: String(filteredOrders.filter((o) => o.payment === "paid").length), note: "successfully charged" },
            { label: "Avg Items / Order", value: avgItemsPerOrder > 0 ? avgItemsPerOrder.toFixed(1) : "—", note: "units per transaction" },
            { label: "Pending Orders", value: String(filteredOrders.filter((o) => o.status === "pending" || o.status === "processing").length), note: "awaiting fulfilment" },
          ].map(({ label, value, note }) => (
            <div key={label} className="px-6 py-5 text-center">
              <p className="text-xs tracking-widests uppercase text-stone-400 mb-2">{label}</p>
              <p className="text-2xl text-stone-900" style={{ fontFamily: "var(--font-cormorant), serif" }}>{value}</p>
              <p className="text-[10px] text-stone-400 mt-1">{note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
