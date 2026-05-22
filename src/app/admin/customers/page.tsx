"use client";

import { useState } from "react";
import { Search, Filter, Mail, ChevronDown, ChevronUp, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joined: string;
  orders: number;
  totalSpent: number;
  status: "active" | "inactive";
  lastOrder: string;
}

const customers: Customer[] = [
  { id: "u1", name: "Sophie Laurent", email: "sophie@example.com", phone: "+1 604 555 0198", joined: "Jan 15, 2024", orders: 7, totalSpent: 1840, status: "active", lastOrder: "May 12, 2026" },
  { id: "u2", name: "Claire Dubois", email: "claire@example.com", phone: "+1 514 555 0234", joined: "Feb 3, 2024", orders: 4, totalSpent: 920, status: "active", lastOrder: "May 11, 2026" },
  { id: "u3", name: "Emma Wilson", email: "emma@example.com", phone: "+1 416 555 0187", joined: "Mar 21, 2024", orders: 3, totalSpent: 640, status: "active", lastOrder: "May 11, 2026" },
  { id: "u4", name: "Lena Park", email: "lena@example.com", phone: "+1 778 555 0321", joined: "Apr 5, 2024", orders: 2, totalSpent: 390, status: "active", lastOrder: "May 10, 2026" },
  { id: "u5", name: "Mia Chen", email: "mia@example.com", phone: "+1 604 555 0456", joined: "Apr 18, 2024", orders: 5, totalSpent: 1120, status: "active", lastOrder: "May 10, 2026" },
  { id: "u6", name: "Julia Martin", email: "julia@example.com", phone: "+1 514 555 0567", joined: "May 1, 2024", orders: 1, totalSpent: 195, status: "active", lastOrder: "May 8, 2026" },
  { id: "u7", name: "Anna Leclerc", email: "anna@example.com", phone: "+1 613 555 0678", joined: "Jun 14, 2024", orders: 6, totalSpent: 1560, status: "active", lastOrder: "May 5, 2026" },
  { id: "u8", name: "Sara Kowalski", email: "sara@example.com", phone: "+1 403 555 0789", joined: "Jul 22, 2024", orders: 0, totalSpent: 0, status: "inactive", lastOrder: "—" },
  { id: "u9", name: "Isabelle Roy", email: "isabelle@example.com", phone: "+1 450 555 0890", joined: "Aug 9, 2024", orders: 2, totalSpent: 480, status: "active", lastOrder: "Apr 28, 2026" },
  { id: "u10", name: "Zoe Tremblay", email: "zoe@example.com", phone: "+1 819 555 0901", joined: "Sep 30, 2024", orders: 0, totalSpent: 0, status: "inactive", lastOrder: "—" },
];

type SortKey = "name" | "joined" | "orders" | "totalSpent";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortKey, setSortKey] = useState<SortKey>("totalSpent");
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = customers
    .filter((c) => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let diff = 0;
      if (sortKey === "name") diff = a.name.localeCompare(b.name);
      else if (sortKey === "joined") diff = a.joined.localeCompare(b.joined);
      else if (sortKey === "orders") diff = a.orders - b.orders;
      else diff = a.totalSpent - b.totalSpent;
      return sortAsc ? diff : -diff;
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? sortAsc ? <ChevronUp size={12} className="text-stone-900" /> : <ChevronDown size={12} className="text-stone-900" />
      : <ChevronDown size={12} className="text-stone-300" />;

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const activeCount = customers.filter((c) => c.status === "active").length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-1">CRM</p>
        <h1
          className="text-4xl text-stone-900"
          style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
        >
          Customers
        </h1>
        <p className="text-stone-400 text-sm mt-1">{customers.length} registered accounts</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Customers", value: customers.length, sub: "registered" },
          { label: "Active Customers", value: activeCount, sub: "placed ≥1 order" },
          { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, sub: "lifetime" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white border border-stone-100 px-6 py-5">
            <p className="text-xs tracking-widest uppercase text-stone-400 mb-2">{label}</p>
            <p className="text-3xl" style={{ fontFamily: "var(--font-cormorant), serif" }}>{value}</p>
            <p className="text-xs text-stone-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-52">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 border border-stone-200">
          <Filter size={13} className="ml-3 text-stone-400" />
          {(["all", "active", "inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-4 py-2.5 text-xs tracking-widest uppercase transition-colors",
                statusFilter === s ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-50"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left px-6 py-3">
                  <button
                    onClick={() => toggleSort("name")}
                    className="flex items-center gap-1 text-[10px] tracking-widest uppercase text-stone-400 font-normal hover:text-stone-700"
                  >
                    Customer <SortIcon k="name" />
                  </button>
                </th>
                <th className="text-left text-[10px] tracking-widest uppercase text-stone-400 font-normal px-6 py-3">Contact</th>
                <th className="text-left px-6 py-3">
                  <button
                    onClick={() => toggleSort("joined")}
                    className="flex items-center gap-1 text-[10px] tracking-widest uppercase text-stone-400 font-normal hover:text-stone-700"
                  >
                    Joined <SortIcon k="joined" />
                  </button>
                </th>
                <th className="text-right px-6 py-3">
                  <button
                    onClick={() => toggleSort("orders")}
                    className="flex items-center gap-1 text-[10px] tracking-widest uppercase text-stone-400 font-normal hover:text-stone-700 ml-auto"
                  >
                    Orders <SortIcon k="orders" />
                  </button>
                </th>
                <th className="text-right px-6 py-3">
                  <button
                    onClick={() => toggleSort("totalSpent")}
                    className="flex items-center gap-1 text-[10px] tracking-widest uppercase text-stone-400 font-normal hover:text-stone-700 ml-auto"
                  >
                    Spent <SortIcon k="totalSpent" />
                  </button>
                </th>
                <th className="text-left text-[10px] tracking-widest uppercase text-stone-400 font-normal px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map((c) => {
                const initials = c.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
                const isExpanded = expandedId === c.id;
                return (
                  <>
                    <tr
                      key={c.id}
                      className="hover:bg-stone-50/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : c.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-medium text-stone-600">{initials}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{c.name}</p>
                            <p className="text-xs text-stone-400">{c.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-stone-600">{c.email}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{c.phone}</p>
                      </td>
                      <td className="px-6 py-4 text-xs text-stone-500">{c.joined}</td>
                      <td className="px-6 py-4 text-sm text-right">{c.orders}</td>
                      <td
                        className="px-6 py-4 text-sm text-right font-medium"
                        style={{ fontFamily: "var(--font-cormorant), serif" }}
                      >
                        {c.totalSpent > 0 ? `$${c.totalSpent.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "text-[11px] px-2.5 py-1 rounded-full font-medium tracking-wide",
                            c.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-stone-100 text-stone-400"
                          )}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${c.id}-expanded`} className="bg-stone-50/60">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="flex flex-wrap gap-8 text-sm">
                            <div>
                              <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-1">Last Order</p>
                              <p className="text-stone-700">{c.lastOrder}</p>
                            </div>
                            <div>
                              <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-1">Avg Order Value</p>
                              <p className="text-stone-700">
                                {c.orders > 0 ? `$${(c.totalSpent / c.orders).toFixed(0)}` : "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-1">Email</p>
                              <a
                                href={`mailto:${c.email}`}
                                className="flex items-center gap-1.5 text-stone-700 hover:text-stone-900"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Mail size={12} />
                                {c.email}
                              </a>
                            </div>
                            <div className="ml-auto">
                              <button
                                onClick={(e) => { e.stopPropagation(); }}
                                className="flex items-center gap-2 px-4 py-2 border border-stone-200 text-xs tracking-widest uppercase hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all"
                              >
                                <User size={12} />
                                View Profile
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-stone-400 text-sm">
            No customers match your search.
          </div>
        )}

        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between">
          <p className="text-xs text-stone-400">
            Showing {filtered.length} of {customers.length} customers
          </p>
        </div>
      </div>
    </div>
  );
}
