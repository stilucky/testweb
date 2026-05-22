import type { Metadata } from "next";
import { TrendingUp, TrendingDown, ShoppingBag, Users, BarChart2, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = { title: "Analytics" };

const monthlyRevenue = [
  { month: "Dec", revenue: 18200, orders: 102 },
  { month: "Jan", revenue: 21400, orders: 118 },
  { month: "Feb", revenue: 19800, orders: 109 },
  { month: "Mar", revenue: 23100, orders: 134 },
  { month: "Apr", revenue: 22050, orders: 127 },
  { month: "May", revenue: 24580, orders: 148 },
];

const topProducts = [
  { name: "Vivienne Blazer", category: "Outerwear", sold: 34, revenue: 8330, change: "+18%" },
  { name: "Margot Slip Dress", category: "Dresses", sold: 28, revenue: 4340, change: "+12%" },
  { name: "Celestine Lace Dress", category: "Dresses", sold: 21, revenue: 5985, change: "+7%" },
  { name: "Solène Palazzo Pants", category: "Bottoms", sold: 19, revenue: 3325, change: "-3%" },
  { name: "Aurélie Trench Coat", category: "Outerwear", sold: 15, revenue: 6000, change: "+22%" },
];

const categoryBreakdown = [
  { name: "Outerwear", revenue: 14330, pct: 58 },
  { name: "Dresses", revenue: 10325, pct: 42 },
  { name: "Bottoms", revenue: 3325, pct: 14 },
  { name: "Tops", revenue: 2100, pct: 9 },
  { name: "Accessories", revenue: 890, pct: 4 },
];

const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue));

const kpis = [
  {
    label: "Total Revenue (6mo)",
    value: "$129,130",
    change: "+12.4%",
    up: true,
    icon: TrendingUp,
    sub: "vs previous 6 months",
  },
  {
    label: "Total Orders",
    value: "738",
    change: "+8.1%",
    up: true,
    icon: ShoppingBag,
    sub: "6-month total",
  },
  {
    label: "Avg Order Value",
    value: "$174.97",
    change: "+3.9%",
    up: true,
    icon: BarChart2,
    sub: "per transaction",
  },
  {
    label: "New Customers",
    value: "212",
    change: "-2.1%",
    up: false,
    icon: Users,
    sub: "this period",
  },
];

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-1">Reporting</p>
        <h1
          className="text-4xl text-stone-900"
          style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
        >
          Analytics
        </h1>
        <p className="text-stone-400 text-sm mt-1">Last 6 months — Dec 2025 to May 2026</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {kpis.map(({ label, value, change, up, icon: Icon, sub }) => (
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
              <span className={`text-xs font-medium flex items-center gap-0.5 ${up ? "text-emerald-600" : "text-red-500"}`}>
                {up ? <ArrowUpRight size={11} /> : <TrendingDown size={11} />}
                {change}
              </span>
              <span className="text-xs text-stone-400">{sub}</span>
            </div>
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
            <div className="flex items-end gap-3 h-48">
              {monthlyRevenue.map(({ month, revenue, orders }) => {
                const heightPct = Math.round((revenue / maxRevenue) * 100);
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full relative flex flex-col justify-end" style={{ height: "160px" }}>
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        ${(revenue / 1000).toFixed(1)}k · {orders} orders
                      </div>
                      <div
                        className="w-full bg-stone-900 hover:bg-stone-700 transition-colors rounded-sm"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-stone-400 tracking-wide">{month}</span>
                  </div>
                );
              })}
            </div>
            {/* Y-axis labels */}
            <div className="flex justify-between mt-4 border-t border-stone-100 pt-3">
              {monthlyRevenue.map(({ month, revenue }) => (
                <div key={month} className="flex-1 text-center">
                  <p className="text-xs font-medium text-stone-700">${(revenue / 1000).toFixed(1)}k</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white border border-stone-100">
          <div className="px-6 py-5 border-b border-stone-100">
            <h2 className="text-xs tracking-widest uppercase font-medium">Revenue by Category</h2>
          </div>
          <div className="p-6 space-y-4">
            {categoryBreakdown.map(({ name, revenue, pct }) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-stone-600">{name}</span>
                  <span className="text-xs font-medium text-stone-800">${revenue.toLocaleString()}</span>
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
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white border border-stone-100">
        <div className="px-6 py-5 border-b border-stone-100">
          <h2 className="text-xs tracking-widest uppercase font-medium">Top Products by Revenue</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-50">
                <th className="text-left text-[10px] tracking-widest uppercase text-stone-400 font-normal px-6 py-3">#</th>
                <th className="text-left text-[10px] tracking-widest uppercase text-stone-400 font-normal px-6 py-3">Product</th>
                <th className="text-left text-[10px] tracking-widest uppercase text-stone-400 font-normal px-6 py-3">Category</th>
                <th className="text-right text-[10px] tracking-widest uppercase text-stone-400 font-normal px-6 py-3">Units Sold</th>
                <th className="text-right text-[10px] tracking-widest uppercase text-stone-400 font-normal px-6 py-3">Revenue</th>
                <th className="text-right text-[10px] tracking-widest uppercase text-stone-400 font-normal px-6 py-3">MoM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {topProducts.map(({ name, category, sold, revenue, change }, i) => (
                <tr key={name} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs text-stone-300 font-medium">0{i + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium">{name}</td>
                  <td className="px-6 py-4 text-xs text-stone-400">{category}</td>
                  <td className="px-6 py-4 text-sm text-right">{sold}</td>
                  <td
                    className="px-6 py-4 text-sm text-right font-medium"
                    style={{ fontFamily: "var(--font-cormorant), serif" }}
                  >
                    ${revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-xs font-medium ${change.startsWith("+") ? "text-emerald-600" : "text-red-500"}`}>
                      {change}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Conversion summary */}
        <div className="grid grid-cols-3 divide-x divide-stone-100 border-t border-stone-100">
          {[
            { label: "Conversion Rate", value: "3.2%", note: "visits → purchase" },
            { label: "Avg Items / Order", value: "1.8", note: "units per transaction" },
            { label: "Return Rate", value: "4.1%", note: "orders returned" },
          ].map(({ label, value, note }) => (
            <div key={label} className="px-6 py-5 text-center">
              <p className="text-xs tracking-widest uppercase text-stone-400 mb-2">{label}</p>
              <p
                className="text-2xl text-stone-900"
                style={{ fontFamily: "var(--font-cormorant), serif" }}
              >
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
