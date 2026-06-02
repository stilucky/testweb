"use client";

import { useState } from "react";
import { Search, Mail, ChevronDown, ChevronUp, Users, Trash2, X } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useOrderStore } from "@/store/orderStore";

type SortKey = "name" | "joined" | "orders" | "totalSpent";

export default function CustomersPage() {
  const { users, deleteUser } = useAuthStore();
  const { orders } = useOrderStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortKey, setSortKey] = useState<SortKey>("joined");
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const customers = users
    .filter((u) => u.role === "customer")
    .map((u) => {
      const userOrders = orders.filter(
        (o) => o.email.toLowerCase() === u.email.toLowerCase() || o.userId === u.id
      );
      const totalSpent = userOrders.filter((o) => o.payment === "paid").reduce((s, o) => s + o.total, 0);
      return {
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        phone: u.phone ?? "—",
        joined: new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        joinedRaw: u.createdAt,
        orders: userOrders.length,
        totalSpent,
        status: userOrders.length > 0 ? ("active" as const) : ("inactive" as const),
        lastOrder: userOrders[0]?.date ?? "—",
      };
    });

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
      else if (sortKey === "joined") diff = a.joinedRaw.localeCompare(b.joinedRaw);
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

  const handleDeleteConfirm = () => {
    if (!confirmDelete) return;
    const result = deleteUser(confirmDelete.id);
    if (!result.success) {
      setDeleteError(result.error ?? "Failed to delete");
    } else {
      setConfirmDelete(null);
      setDeleteError(null);
      if (expandedId === confirmDelete.id) setExpandedId(null);
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <p className="type-label text-stone-400 mb-1">CRM</p>
        <h1 className="text-3xl md:text-4xl text-stone-900" style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}>
          Customers
        </h1>
        <p className="text-stone-400 text-sm mt-1">{customers.length} registered accounts</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
        {[
          { label: "Total", value: customers.length, sub: "customers" },
          { label: "Active", value: activeCount, sub: "≥1 order" },
          { label: "Revenue", value: totalRevenue > 0 ? formatPrice(totalRevenue) : "$0", sub: "lifetime" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white border border-stone-100 px-3 md:px-6 py-3 md:py-5">
            <p className="text-[10px] md:text-xs tracking-widests uppercase text-stone-400 mb-1.5">{label}</p>
            <p className="text-xl md:text-3xl" style={{ fontFamily: "var(--font-cormorant), serif" }}>{value}</p>
            <p className="text-[10px] md:text-xs text-stone-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-stone-200 text-sm focus:outline-none focus:border-stone-800"
          />
        </div>
        <div className="flex border border-stone-200 shrink-0">
          {(["all", "active", "inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-2 text-xs tracking-widests uppercase transition-colors",
                statusFilter === s ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-50"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Empty */}
      {customers.length === 0 ? (
        <div className="bg-white border border-stone-100 py-20 text-center">
          <Users size={36} className="text-stone-200 mx-auto mb-4" />
          <p className="text-stone-400 text-sm">No customers yet</p>
        </div>
      ) : (
        <>
          {/* ── Mobile card list ── */}
          <div className="md:hidden space-y-2">
            {filtered.length === 0 ? (
              <p className="text-center text-stone-400 text-sm py-10">No customers match your search.</p>
            ) : filtered.map((c) => {
              const initials = c.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
              const isExpanded = expandedId === c.id;
              return (
                <div key={c.id} className="bg-white border border-stone-100">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : c.id)}
                    className="w-full text-left px-4 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-stone-600">{initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium truncate">{c.name}</p>
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full shrink-0",
                            c.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-stone-100 text-stone-400"
                          )}>
                            {c.status}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 truncate">{c.email}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-stone-500">{c.orders} orders</span>
                          <span className="text-xs text-stone-500" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                            {c.totalSpent > 0 ? formatPrice(c.totalSpent) : "—"}
                          </span>
                          <span className="text-xs text-stone-400 ml-auto">{isExpanded ? "▲" : "▼"}</span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-stone-100 px-4 py-3 bg-stone-50/40">
                      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                        <div>
                          <p className="text-[10px] tracking-widests uppercase text-stone-400 mb-0.5">Joined</p>
                          <p className="text-stone-700">{c.joined}</p>
                        </div>
                        <div>
                          <p className="text-[10px] tracking-widests uppercase text-stone-400 mb-0.5">Last Order</p>
                          <p className="text-stone-700">{c.lastOrder}</p>
                        </div>
                        <div>
                          <p className="text-[10px] tracking-widests uppercase text-stone-400 mb-0.5">Avg Order</p>
                          <p className="text-stone-700">{c.orders > 0 ? formatPrice(c.totalSpent / c.orders) : "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] tracking-widests uppercase text-stone-400 mb-0.5">Phone</p>
                          <p className="text-stone-700">{c.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900">
                          <Mail size={12} /> {c.email}
                        </a>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteError(null); setConfirmDelete({ id: c.id, name: c.name }); }}
                          className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Desktop table ── */}
          <div className="hidden md:block bg-white border border-stone-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="text-left px-6 py-3">
                      <button onClick={() => toggleSort("name")} className="flex items-center gap-1 text-[10px] tracking-widests uppercase text-stone-400 font-normal hover:text-stone-700">
                        Customer <SortIcon k="name" />
                      </button>
                    </th>
                    <th className="text-left text-[10px] tracking-widests uppercase text-stone-400 font-normal px-6 py-3">Contact</th>
                    <th className="text-left px-6 py-3">
                      <button onClick={() => toggleSort("joined")} className="flex items-center gap-1 text-[10px] tracking-widests uppercase text-stone-400 font-normal hover:text-stone-700">
                        Joined <SortIcon k="joined" />
                      </button>
                    </th>
                    <th className="text-right px-6 py-3">
                      <button onClick={() => toggleSort("orders")} className="flex items-center gap-1 text-[10px] tracking-widests uppercase text-stone-400 font-normal hover:text-stone-700 ml-auto">
                        Orders <SortIcon k="orders" />
                      </button>
                    </th>
                    <th className="text-right px-6 py-3">
                      <button onClick={() => toggleSort("totalSpent")} className="flex items-center gap-1 text-[10px] tracking-widests uppercase text-stone-400 font-normal hover:text-stone-700 ml-auto">
                        Spent <SortIcon k="totalSpent" />
                      </button>
                    </th>
                    <th className="text-left text-[10px] tracking-widests uppercase text-stone-400 font-normal px-6 py-3">Status</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {filtered.map((c) => {
                    const initials = c.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                    const isExpanded = expandedId === c.id;
                    return (
                      <>
                        <tr key={c.id} className="hover:bg-stone-50/50 transition-colors cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : c.id)}>
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
                          <td className="px-6 py-4 text-sm text-right font-medium" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                            {c.totalSpent > 0 ? formatPrice(c.totalSpent) : "—"}
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn("text-[11px] px-2.5 py-1 rounded-full font-medium",
                              c.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-stone-100 text-stone-400"
                            )}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteError(null); setConfirmDelete({ id: c.id, name: c.name }); }}
                              className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${c.id}-exp`} className="bg-stone-50/60">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="flex flex-wrap gap-8 text-sm">
                                <div>
                                  <p className="text-[10px] tracking-widests uppercase text-stone-400 mb-1">Last Order</p>
                                  <p className="text-stone-700">{c.lastOrder}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] tracking-widests uppercase text-stone-400 mb-1">Avg Order Value</p>
                                  <p className="text-stone-700">{c.orders > 0 ? formatPrice(c.totalSpent / c.orders) : "—"}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] tracking-widests uppercase text-stone-400 mb-1">Email</p>
                                  <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-stone-700 hover:text-stone-900" onClick={(e) => e.stopPropagation()}>
                                    <Mail size={12} /> {c.email}
                                  </a>
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
              <div className="py-12 text-center text-stone-400 text-sm">No customers match your search.</div>
            )}
            <div className="px-6 py-4 border-t border-stone-100">
              <p className="text-xs text-stone-400">Showing {filtered.length} of {customers.length} customers</p>
            </div>
          </div>
        </>
      )}

      {/* Delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-medium text-stone-900">Delete Customer</h3>
                <p className="text-sm text-stone-500 mt-1">This action cannot be undone.</p>
              </div>
              <button onClick={() => { setConfirmDelete(null); setDeleteError(null); }} className="text-stone-400 hover:text-stone-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-stone-700 mb-2">
              Are you sure you want to delete <span className="font-medium">{confirmDelete.name}</span>?
            </p>
            <p className="text-xs text-stone-400 mb-5">Their account will be permanently removed. Orders remain in the system.</p>
            {deleteError && <p className="text-xs text-red-500 mb-4 bg-red-50 px-3 py-2">{deleteError}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setConfirmDelete(null); setDeleteError(null); }} className="flex-1 py-2.5 border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 transition-colors">Cancel</button>
              <button onClick={handleDeleteConfirm} className="flex-1 py-2.5 bg-red-600 text-white text-sm hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
