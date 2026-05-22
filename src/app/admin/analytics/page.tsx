"use client";

import { useMemo } from "react";
import { TrendingUp, ShoppingBag, Users, BarChart2, BarChart3 } from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import { useAuthStore } from "@/store/authStore";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

  const customerCount = users.filter((u) => u.role === "customer").length;

  const last6 = useMemo(() => getLast6Months(), []);

  const monthlyRevenue = useMemo(() => {
    return last6.map(({ year, month, label }) => {
      const monthOrders = orders.filter((o) => {
        const d = new Date(o.createdAt);
        return d.getFullYear() === year && d.getMonth() === month;
      });
      const revenue = monthOrders
        .filter((o) => o.payment === "paid")
        .reduce((s, o) => s + o.total, 0);
      return { label, revenue, orders: monthOrders.length };
    });
  }, [orders, last6]);

  const totalRevenue = useMemo(
    () => orders.filter((o) => o.payment === "paid").reduce((s, o) => s + o.total, 0),
    [orders]
  );

  const totalOrders = orders.length;
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const productMap = useMemo(() => {
    const map: Record<string, string> = {};
    products.forEach((p) => { map[p.name.toLowerCase()] = p.category; });
    return map;
  }, []);

  const topProducts = useMemo(() => {
    const agg: Record<string, { name: string; sold: number; revenue: number; category: string }> = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        const key = item.name;
        if (!agg[key]) {
          agg[key] = {
            name: item.name,
            sold: 0,
            revenue: 0,
            category: productMap[item.name.toLowerCase()] ?? "—",
          };
        }
        agg[key].sold += item.qty;
        agg[key].revenue += item.price * item.qty;
      });
    });
    return Object.values(agg).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orders, productMap]);

  const categoryBreakdown = useMemo(() => {
    const cat: Record<string, number> = {};
    let grandTotal = 0;
    orders.forEach((o) => {
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
  }, [orders, productMap]);

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

  const avgItemsPerOrder = useMemo(() => {
    if (totalOrders === 0) return 0;
    const totalItems = orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.qty, 0), 0);
    return totalItems / totalOrders;
  }, [orders, totalOrders]);

  const kpis = [
    {
      label: "Total Revenue",
      value: totalRevenue > 0 ? formatPrice(totalRevenue) : "$0",
      icon: TrendingUp,
      sub: "from paid orders",
    },
    {
      label: "Total Orders",
      value: String(totalOrders),
      icon: ShoppingBag,
      sub: "all time",
    },
    {
      label: "Avg Order Value",
      value: aov > 0 ? formatPrice(aov) : "$0",
      icon: BarChart2,
      sub: "per transaction",
    },
    {
      label: "Customers",
      value: String(customerCount),
      icon: Users,
      sub: "registered accounts",
    },
  ];

  const rangeLabel = `${last6[0].label} – ${last6[5].label} ${new Date().getFullYear()}`;

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
        <p className="text-stone-400 text-sm mt-1">Last 6 months — {rangeLabel}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {kpis.map(({ label, value, icon: Icon, sub }) => (
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

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-stone-100">
          <div className="px-6 py-5 border-b border-stone-100">
            <h2 className="text-xs tracking-widest uppercase font-medium">Monthly Revenue</h2>
          </div>
          <div className="p-6">
            {totalOrders === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center">
                <BarChart3 size={36} className="text-stone-200 mb-3" />
                <p className="text-stone-400 text-sm">No orders yet</p>
                <p className="text-stone-300 text-xs mt-1">Revenue data will appear once orders are placed</p>
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
            <h2 className="text-xs tracking-widest uppercase font-medium">Revenue by Category</h2>
          </div>
          <div className="p-6">
            {categoryBreakdown.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-stone-400 text-sm">No data yet</p>
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
                      <div
                        className="h-full bg-stone-900 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
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
          <h2 className="text-xs tracking-widest uppercase font-medium">Top Products by Revenue</h2>
        </div>
        {topProducts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-stone-400 text-sm">No sales data yet</p>
            <p className="text-stone-300 text-xs mt-1">Product performance will appear once orders are placed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-50">
                  <th className="text-left text-[10px] tracking-widest uppercase text-stone-400 font-normal px-6 py-3">#</th>
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
                    <td
                      className="px-6 py-4 text-sm text-right font-medium"
                      style={{ fontFamily: "var(--font-cormorant), serif" }}
                    >
                      {formatPrice(revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary footer */}
        <div className="grid grid-cols-3 divide-x divide-stone-100 border-t border-stone-100">
          {[
            {
              label: "Paid Orders",
              value: String(orders.filter((o) => o.payment === "paid").length),
              note: "successfully charged",
            },
            {
              label: "Avg Items / Order",
              value: avgItemsPerOrder > 0 ? avgItemsPerOrder.toFixed(1) : "—",
              note: "units per transaction",
            },
            {
              label: "Pending Orders",
              value: String(orders.filter((o) => o.status === "pending" || o.status === "processing").length),
              note: "awaiting fulfilment",
            },
          ].map(({ label, value, note }) => (
            <div key={label} className="px-6 py-5 text-center">
              <p className="text-xs tracking-widest uppercase text-stone-400 mb-2">{label}</p>
              <p className="text-2xl text-stone-900" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                {value}
              </p>
              <p className="text-[10px] text-stone-400 mt-1">{note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
