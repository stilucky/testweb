"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Scissors, X, Ruler, CheckCircle,
  Clock, Truck, XCircle, Search, Trash2, Tag,
} from "lucide-react";
import { useTailoredOrderStore, TailoredOrder } from "@/store/tailoredOrderStore";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: TailoredOrder["status"][] = [
  "pending", "confirmed", "in_production", "shipped", "completed", "cancelled",
];

const STATUS_META: Record<TailoredOrder["status"], { label: string; color: string; icon: React.ElementType }> = {
  pending:       { label: "Pending",       color: "bg-amber-100 text-amber-700",   icon: Clock },
  confirmed:     { label: "Confirmed",     color: "bg-blue-100 text-blue-700",     icon: CheckCircle },
  in_production: { label: "In Production", color: "bg-violet-100 text-violet-700", icon: Scissors },
  shipped:       { label: "Shipped",       color: "bg-sky-100 text-sky-700",       icon: Truck },
  completed:     { label: "Completed",     color: "bg-green-100 text-green-700",   icon: CheckCircle },
  cancelled:     { label: "Cancelled",     color: "bg-red-100 text-red-600",       icon: XCircle },
};

const MEASURE_LABELS: Record<string, string> = {
  bust: "Bust / Chest",
  waist: "Waist",
  hips: "Hips",
  shoulder: "Shoulder Width",
  sleeve: "Sleeve Length",
  length: "Body Length",
  height: "Height",
};

type Toast = { id: number; message: string };

export default function AdminTailoredOrdersPage() {
  const { orders, updateStatus, removeOrder } = useTailoredOrderStore();
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState<TailoredOrder["status"] | "all">("all");
  const [selected, setSelected]   = useState<TailoredOrder | null>(null);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [toasts, setToasts]       = useState<Toast[]>([]);

  const addToast = (msg: string) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message: msg }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3200);
  };

  const handleStatusChange = (id: string, status: TailoredOrder["status"]) => {
    updateStatus(id, status);
    if (selected?.id === id) setSelected((s) => s ? { ...s, status } : null);
    addToast(`Order status updated to "${STATUS_META[status].label}"`);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const o = orders.find((x) => x.id === deleteId);
    removeOrder(deleteId);
    if (selected?.id === deleteId) setSelected(null);
    addToast(`Order from "${o?.designName}" deleted`);
    setDeleteId(null);
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.designName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">

      {/* Toasts */}
      <div className="fixed top-5 right-5 z-[100] space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="flex items-center gap-2 bg-stone-900 text-white px-4 py-3 text-sm shadow-lg min-w-[240px]">
            <CheckCircle size={13} className="shrink-0" />
            {t.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="bg-white border-b border-stone-100 px-6 md:px-10 py-5 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-medium text-stone-900 flex items-center gap-2">
              Tailored Orders
              {pendingCount > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                  {pendingCount} new
                </span>
              )}
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">
              {orders.length} total orders · Click a row to view full details
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mt-5">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by design or customer..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-stone-200 focus:border-stone-800 focus:outline-none transition-colors"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TailoredOrder["status"] | "all")}
            className="border border-stone-200 focus:border-stone-800 focus:outline-none text-sm px-3 py-2.5 bg-white transition-colors"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_META[s].label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Orders list */}
        <div className={cn("flex-1 overflow-y-auto", selected && "hidden md:block md:w-1/2 md:border-r md:border-stone-100")}>
          {filtered.length === 0 ? (
            <div className="text-center py-24 text-stone-400">
              <Scissors size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm">
                {orders.length === 0 ? "No tailored orders yet." : "No orders match your search."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {filtered.map((order) => {
                const meta = STATUS_META[order.status];
                const StatusIcon = meta.icon;
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelected(selected?.id === order.id ? null : order)}
                    className={cn(
                      "flex gap-4 px-6 py-5 cursor-pointer hover:bg-stone-50 transition-colors",
                      selected?.id === order.id && "bg-stone-50 border-l-2 border-stone-900"
                    )}
                  >
                    {/* Image */}
                    <div className="relative w-14 h-18 shrink-0 overflow-hidden bg-stone-100" style={{ height: "72px" }}>
                      {order.designImage ? (
                        <Image src={order.designImage} alt={order.designName} fill sizes="56px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Scissors size={16} className="text-stone-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-stone-800 truncate">{order.designName}</p>
                          <p className="text-xs text-stone-400 mt-0.5">
                            {order.designCategory}
                            {order.selectedSize && ` · Size ${order.selectedSize}`}
                            {order.color && ` · ${order.color}`}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={cn("inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-medium", meta.color)}>
                            <StatusIcon size={9} />
                            {meta.label}
                          </span>
                          <span className={cn(
                            "text-[9px] tracking-wider uppercase px-2 py-0.5",
                            order.type === "made-to-order"
                              ? "bg-stone-100 text-stone-500"
                              : "bg-violet-50 text-violet-500"
                          )}>
                            {order.type === "made-to-order" ? "Made to Order" : "Custom Fit"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-stone-500">
                          {order.customerName || "Guest"} · {order.customerEmail || "—"}
                        </p>
                        <p className="text-xs font-medium text-stone-900">
                          {order.currency === "CAD" ? `CA$${order.totalPriceCAD}` : `$${order.totalPrice}`}
                        </p>
                      </div>

                      <p className="text-[10px] text-stone-300 mt-1">
                        {new Date(order.createdAt).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-full md:w-1/2 bg-white overflow-y-auto flex flex-col">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 sticky top-0 bg-white z-10">
              <div>
                <p className="type-label text-stone-400 mb-0.5">Order Detail</p>
                <h3 className="text-sm font-medium text-stone-900">{selected.designName}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 text-stone-400 hover:text-stone-900">
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">

              {/* Design preview */}
              <div className="flex gap-4">
                <div className="relative w-24 h-32 shrink-0 overflow-hidden bg-stone-100">
                  {selected.designImage && (
                    <Image src={selected.designImage} alt={selected.designName} fill sizes="96px" className="object-cover" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-1">{selected.designCategory}</p>
                  <p className="text-base font-medium text-stone-900 mb-1">{selected.designName}</p>
                  <p className="text-xs text-stone-500 mb-2">Color: {selected.color}</p>
                  <p className="text-xs text-stone-400">
                    {new Date(selected.createdAt).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Status control */}
              <div>
                <p className="text-xs tracking-widest uppercase text-stone-500 mb-3">Order Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((s) => {
                    const m = STATUS_META[s];
                    const StatusIcon = m.icon;
                    return (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(selected.id, s)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-colors",
                          selected.status === s
                            ? "bg-stone-900 text-white border-stone-900"
                            : "border-stone-200 text-stone-500 hover:border-stone-900 hover:text-stone-900"
                        )}
                      >
                        <StatusIcon size={10} />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-stone-50 border border-stone-100 p-4 space-y-2">
                <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-3">Pricing</p>
                <div className="flex justify-between text-xs text-stone-500">
                  <span>Base price</span>
                  <span>${selected.basePrice}</span>
                </div>
                <div className="flex justify-between text-xs text-stone-500">
                  <span>Tailoring fee</span>
                  <span>${selected.tailoringFee}</span>
                </div>
                <div className="border-t border-stone-200 pt-2 flex justify-between text-sm font-medium text-stone-900">
                  <span>Total (USD)</span>
                  <span>${selected.totalPrice}</span>
                </div>
                {selected.totalPriceCAD > 0 && (
                  <div className="flex justify-between text-xs text-stone-400">
                    <span>Total (CAD)</span>
                    <span>CA${selected.totalPriceCAD}</span>
                  </div>
                )}
              </div>

              {/* Customer */}
              <div>
                <p className="text-xs tracking-widest uppercase text-stone-500 mb-3">Customer</p>
                <div className="space-y-1.5">
                  <p className="text-sm text-stone-700">{selected.customerName || <span className="text-stone-300 italic">Guest (not logged in)</span>}</p>
                  <p className="text-xs text-stone-400">{selected.customerEmail || "—"}</p>
                </div>
              </div>

              {/* Type badge */}
              <div className="flex items-center gap-2">
                <Tag size={12} className="text-stone-400" />
                <span className={cn(
                  "text-[10px] tracking-wider uppercase px-2.5 py-1",
                  selected.type === "made-to-order"
                    ? "bg-stone-100 text-stone-600"
                    : "bg-violet-50 text-violet-600"
                )}>
                  {selected.type === "made-to-order" ? "Made to Order" : "Customized Fit"}
                </span>
              </div>

              {/* Size (made-to-order only) */}
              {selected.type === "made-to-order" && selected.selectedSize && (
                <div>
                  <p className="text-xs tracking-widest uppercase text-stone-500 mb-3">Selected Size</p>
                  <div className="inline-flex items-center justify-center border-2 border-stone-900 w-16 h-16">
                    <span className="text-xl font-light text-stone-900">{selected.selectedSize}</span>
                  </div>
                </div>
              )}

              {/* Measurements (customized-fit only) */}
              {selected.type === "customized-fit" && Object.values(selected.measurements).some(Boolean) && (
                <div>
                  <p className="text-xs tracking-widest uppercase text-stone-500 mb-3 flex items-center gap-1.5">
                    <Ruler size={11} /> Measurements (cm)
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selected.measurements).map(([key, val]) =>
                      val ? (
                        <div key={key} className="bg-stone-50 px-3 py-2.5 border border-stone-100">
                          <p className="text-[10px] text-stone-400 mb-0.5">{MEASURE_LABELS[key] ?? key}</p>
                          <p className="text-sm font-medium text-stone-800">{val} cm</p>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selected.notes && (
                <div>
                  <p className="text-xs tracking-widest uppercase text-stone-500 mb-3">Customer Notes</p>
                  <p className="text-sm text-stone-600 leading-relaxed bg-stone-50 border border-stone-100 p-4">
                    {selected.notes}
                  </p>
                </div>
              )}

              {/* Order ID */}
              <p className="text-[10px] text-stone-300">Order ID: {selected.id}</p>

              {/* Delete */}
              <div className="pt-2 border-t border-stone-100">
                <button
                  onClick={() => setDeleteId(selected.id)}
                  className="flex items-center gap-2 text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={12} /> Delete this order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white p-8 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-sm font-medium text-stone-900 mb-2">Delete Order?</h3>
            <p className="text-xs text-stone-500 mb-6 leading-relaxed">
              This tailored order will be permanently removed from the system.
            </p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white text-xs tracking-widest uppercase hover:bg-red-700 transition-colors">
                Delete
              </button>
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 border border-stone-200 text-stone-600 text-xs tracking-widest uppercase hover:border-stone-900 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
