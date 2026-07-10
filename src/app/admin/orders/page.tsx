"use client";

import { useState } from "react";
import { Search, Check, Truck, Clock, XCircle, Package, ChevronDown, ChevronUp } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { maskAddress, maskEmail } from "@/lib/privacy";
import { useOrderStore, type OrderStatus, type Order } from "@/store/orderStore";

const orderStatusConfig: Record<OrderStatus, { label: string; icon: React.ElementType; cls: string }> = {
  pending:    { label: "Pending",    icon: Clock,    cls: "bg-stone-100 text-stone-600" },
  processing: { label: "Processing", icon: Clock,    cls: "bg-amber-50 text-amber-600" },
  shipped:    { label: "Shipped",    icon: Truck,    cls: "bg-blue-50 text-blue-600" },
  delivered:  { label: "Delivered",  icon: Check,    cls: "bg-emerald-50 text-emerald-600" },
  cancelled:  { label: "Cancelled",  icon: XCircle,  cls: "bg-red-50 text-red-500" },
};

const paymentConfig = {
  paid:     { label: "Paid",     cls: "text-emerald-600" },
  pending:  { label: "Pending",  cls: "text-amber-600" },
  refunded: { label: "Refunded", cls: "text-red-500" },
};

const statusOptions: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const { orders, updateStatus } = useOrderStore();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | OrderStatus>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusCounts = statusOptions.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {} as Record<OrderStatus, number>);

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <p className="type-label text-stone-400 mb-1">Management</p>
        <h1 className="text-3xl md:text-4xl text-stone-900" style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}>
          Orders
        </h1>
        <p className="text-stone-400 text-sm mt-1">{orders.length} total orders</p>
      </div>

      {/* Status tabs — horizontal scroll on mobile */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap scrollbar-none">
        <button
          onClick={() => setFilterStatus("all")}
          className={cn(
            "px-3 py-1.5 text-[11px] tracking-widests uppercase transition-colors whitespace-nowrap shrink-0",
            filterStatus === "all" ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-500"
          )}
        >
          All ({orders.length})
        </button>
        {statusOptions.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={cn(
              "px-3 py-1.5 text-[11px] tracking-widests uppercase transition-colors whitespace-nowrap shrink-0",
              filterStatus === s ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-500"
            )}
          >
            {orderStatusConfig[s].label} ({statusCounts[s]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order, customer..."
          className="w-full pl-9 pr-4 py-2.5 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 bg-white"
        />
      </div>

      {/* Empty */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-stone-100 py-20 text-center">
          <Package size={36} className="text-stone-200 mx-auto mb-4" />
          <p className="text-stone-400 text-sm">{orders.length === 0 ? "No orders yet" : "No orders match your search"}</p>
        </div>
      ) : (
        <div className="space-y-2 md:space-y-0 md:bg-white md:border md:border-stone-100">

          {/* Desktop table header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-stone-100 bg-stone-50">
            <p className="col-span-2 text-[10px] tracking-widests uppercase text-stone-400">Order</p>
            <p className="col-span-3 text-[10px] tracking-widests uppercase text-stone-400">Customer</p>
            <p className="col-span-2 text-[10px] tracking-widests uppercase text-stone-400">Date</p>
            <p className="col-span-1 text-[10px] tracking-widests uppercase text-stone-400 text-center">Items</p>
            <p className="col-span-2 text-[10px] tracking-widests uppercase text-stone-400">Status</p>
            <p className="col-span-2 text-[10px] tracking-widests uppercase text-stone-400 text-right">Total</p>
          </div>

          {filtered.map((order: Order) => {
            const { icon: StatusIcon, cls: statusCls } = orderStatusConfig[order.status];
            const { label: payLabel, cls: payCls } = paymentConfig[order.payment];
            const isExpanded = expandedOrder === order.id;

            return (
              <div key={order.id} className="bg-white md:bg-transparent border border-stone-100 md:border-0 md:border-b md:border-stone-50">

                {/* ── Mobile card row ── */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="md:hidden w-full text-left px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-medium text-stone-900">{order.id}</p>
                      <p className="text-sm font-medium mt-0.5 truncate">{order.customer}</p>
                      <p className="text-xs text-stone-400 truncate">{maskEmail(order.email)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-medium" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                        {formatPrice(order.total)}
                      </p>
                      <p className={cn("text-[11px] font-medium mt-0.5", payCls)}>{payLabel}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className={cn("inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium", statusCls)}>
                      <StatusIcon size={10} />
                      {orderStatusConfig[order.status].label}
                    </span>
                    <div className="flex items-center gap-2 text-stone-400">
                      <span className="text-xs">{order.date}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>
                </button>

                {/* ── Desktop table row ── */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="hidden md:grid w-full grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-stone-50/50 transition-colors text-left"
                >
                  <div className="col-span-2">
                    <p className="text-sm font-medium font-mono">{order.id}</p>
                  </div>
                  <div className="col-span-3 min-w-0">
                    <p className="text-sm font-medium truncate">{order.customer}</p>
                    <p className="text-xs text-stone-400 truncate mt-0.5">{maskEmail(order.email)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-stone-500">{order.date}</p>
                  </div>
                  <div className="col-span-1 text-center">
                    <p className="text-xs text-stone-500">{order.items.length}</p>
                  </div>
                  <div className="col-span-2">
                    <span className={cn("inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium", statusCls)}>
                      <StatusIcon size={10} />
                      {orderStatusConfig[order.status].label}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-sm font-medium" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                      {formatPrice(order.total)}
                    </p>
                    <p className={cn("text-[11px] font-medium mt-0.5 capitalize", payCls)}>{payLabel}</p>
                  </div>
                </button>

                {/* ── Expanded detail (shared) ── */}
                {isExpanded && (
                  <div className="border-t border-stone-100 bg-stone-50/30 px-4 md:px-6 py-4 md:py-5">
                    <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                      {/* Items */}
                      <div className="md:col-span-2 space-y-2">
                        <p className="text-xs tracking-widests uppercase text-stone-400 mb-2">Items</p>
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-sm bg-white border border-stone-100 px-3 py-2.5">
                            <div>
                              <p className="font-medium text-xs md:text-sm">{item.name}</p>
                              <p className="text-xs text-stone-400 mt-0.5">{item.size} · {item.color} · Qty {item.qty}</p>
                            </div>
                            <p className="text-xs md:text-sm shrink-0 ml-2">{formatPrice(item.price * item.qty)}</p>
                          </div>
                        ))}

                        <div className="bg-white border border-stone-100 px-3 py-2.5">
                          <p className="text-xs tracking-widests uppercase text-stone-400 mb-1">Ship to</p>
                          <p className="text-xs md:text-sm text-stone-600">{maskAddress(order.shippingAddress)}</p>
                          <p className="text-xs text-stone-400 mt-1 capitalize">{order.shippingMethod}</p>
                        </div>

                        <div className="bg-white border border-stone-100 px-3 py-2.5 flex items-center justify-between">
                          <div>
                            <p className="text-xs tracking-widests uppercase text-stone-400 mb-1">Payment</p>
                            <p className="text-xs md:text-sm text-stone-600 capitalize">{order.paymentMethod}</p>
                          </div>
                          {order.couponCode && (
                            <div className="text-right">
                              <p className="text-xs tracking-widests uppercase text-stone-400 mb-1">Coupon</p>
                              <p className="text-xs md:text-sm font-mono text-stone-600">{order.couponCode}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status + totals */}
                      <div>
                        <p className="text-xs tracking-widests uppercase text-stone-400 mb-2">Update Status</p>
                        <div className="grid grid-cols-2 md:grid-cols-1 gap-1.5 md:gap-2">
                          {statusOptions.map((s) => {
                            const { label, icon: SIcon } = orderStatusConfig[s];
                            return (
                              <button
                                key={s}
                                onClick={() => updateStatus(order.id, s)}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2 border text-xs transition-all",
                                  order.status === s
                                    ? "border-stone-900 bg-stone-900 text-white"
                                    : "border-stone-200 text-stone-600 hover:border-stone-400 bg-white"
                                )}
                              >
                                <SIcon size={11} />
                                {label}
                                {order.status === s && <Check size={11} className="ml-auto" />}
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-3 md:mt-4 bg-white border border-stone-100 p-3 md:p-4 space-y-2 text-xs md:text-sm">
                          <div className="flex justify-between text-stone-500">
                            <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-emerald-600">
                              <span>Discount</span><span>−{formatPrice(order.discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-stone-500">
                            <span>Shipping</span>
                            <span>{order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}</span>
                          </div>
                          <div className="flex justify-between font-medium pt-2 border-t border-stone-100">
                            <span>Total</span>
                            <span style={{ fontFamily: "var(--font-cormorant), serif" }} className="text-base">
                              {formatPrice(order.total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-3 text-xs text-stone-400">
        Showing {filtered.length} of {orders.length} orders
      </p>
    </div>
  );
}
