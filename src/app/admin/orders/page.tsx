"use client";

import { useState } from "react";
import { Search, Check, Truck, Clock, XCircle, Package } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { useOrderStore, type OrderStatus, type Order } from "@/store/orderStore";

const orderStatusConfig: Record<OrderStatus, { label: string; icon: React.ElementType; cls: string }> = {
  pending: { label: "Pending", icon: Clock, cls: "bg-stone-100 text-stone-600" },
  processing: { label: "Processing", icon: Clock, cls: "bg-amber-50 text-amber-600" },
  shipped: { label: "Shipped", icon: Truck, cls: "bg-blue-50 text-blue-600" },
  delivered: { label: "Delivered", icon: Check, cls: "bg-emerald-50 text-emerald-600" },
  cancelled: { label: "Cancelled", icon: XCircle, cls: "bg-red-50 text-red-500" },
};

const paymentConfig = {
  paid: { label: "Paid", cls: "text-emerald-600" },
  pending: { label: "Pending", cls: "text-amber-600" },
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
    const matchSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.customer.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusCounts = statusOptions.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {} as Record<OrderStatus, number>);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-1">Management</p>
        <h1
          className="text-4xl text-stone-900"
          style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
        >
          Orders
        </h1>
        <p className="text-stone-400 text-sm mt-1">{orders.length} total orders</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6 flex-wrap">
        <button
          onClick={() => setFilterStatus("all")}
          className={cn(
            "px-4 py-2 text-xs tracking-widest uppercase transition-colors",
            filterStatus === "all"
              ? "bg-stone-900 text-white"
              : "bg-white border border-stone-200 text-stone-500 hover:border-stone-400"
          )}
        >
          All ({orders.length})
        </button>
        {statusOptions.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={cn(
              "px-4 py-2 text-xs tracking-widest uppercase transition-colors",
              filterStatus === s
                ? "bg-stone-900 text-white"
                : "bg-white border border-stone-200 text-stone-500 hover:border-stone-400"
            )}
          >
            {orderStatusConfig[s].label} ({statusCounts[s]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order, customer..."
          className="w-full pl-9 pr-4 py-2.5 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-100 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-stone-100 bg-stone-50">
          <p className="col-span-2 text-[10px] tracking-widest uppercase text-stone-400">Order</p>
          <p className="col-span-3 text-[10px] tracking-widest uppercase text-stone-400">Customer</p>
          <p className="col-span-2 text-[10px] tracking-widest uppercase text-stone-400">Date</p>
          <p className="col-span-1 text-[10px] tracking-widest uppercase text-stone-400 text-center">Items</p>
          <p className="col-span-2 text-[10px] tracking-widest uppercase text-stone-400">Status</p>
          <p className="col-span-2 text-[10px] tracking-widest uppercase text-stone-400 text-right">Total</p>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Package size={40} className="text-stone-200 mx-auto mb-4" />
            <p className="text-stone-400 text-sm">
              {orders.length === 0 ? "No orders yet" : "No orders match your search"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-50">
            {filtered.map((order: Order) => {
              const { icon: StatusIcon, cls: statusCls } = orderStatusConfig[order.status];
              const { label: payLabel, cls: payCls } = paymentConfig[order.payment];
              const isExpanded = expandedOrder === order.id;

              return (
                <div key={order.id}>
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="w-full grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-stone-50/50 transition-colors text-left"
                  >
                    <div className="col-span-2">
                      <p className="text-sm font-medium font-mono">{order.id}</p>
                    </div>
                    <div className="col-span-3 min-w-0">
                      <p className="text-sm font-medium truncate">{order.customer}</p>
                      <p className="text-xs text-stone-400 truncate mt-0.5">{order.email}</p>
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
                      <p className={cn("text-[11px] font-medium mt-0.5 capitalize", payCls)}>
                        {payLabel}
                      </p>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-stone-100 bg-stone-50/30 px-6 py-5">
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Items */}
                        <div className="md:col-span-2">
                          <p className="text-xs tracking-widest uppercase text-stone-400 mb-3">Items</p>
                          <div className="space-y-2">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex items-center justify-between text-sm bg-white border border-stone-100 px-4 py-3">
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-xs text-stone-400 mt-0.5">
                                    {item.size} · {item.color} · Qty {item.qty}
                                  </p>
                                </div>
                                <p className="text-sm">{formatPrice(item.price * item.qty)}</p>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 bg-white border border-stone-100 px-4 py-3">
                            <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">Ship to</p>
                            <p className="text-sm text-stone-600">{order.shippingAddress}</p>
                            <p className="text-xs text-stone-400 mt-1 capitalize">{order.shippingMethod}</p>
                          </div>

                          {/* Payment info */}
                          <div className="mt-3 bg-white border border-stone-100 px-4 py-3 flex items-center justify-between">
                            <div>
                              <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">Payment</p>
                              <p className="text-sm text-stone-600 capitalize">{order.paymentMethod}</p>
                            </div>
                            {order.couponCode && (
                              <div className="text-right">
                                <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">Coupon</p>
                                <p className="text-sm font-mono text-stone-600">{order.couponCode}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status editor + totals */}
                        <div>
                          <p className="text-xs tracking-widest uppercase text-stone-400 mb-3">Update Status</p>
                          <div className="space-y-2">
                            {statusOptions.map((s) => {
                              const { label, icon: SIcon } = orderStatusConfig[s];
                              return (
                                <button
                                  key={s}
                                  onClick={() => updateStatus(order.id, s)}
                                  className={cn(
                                    "w-full flex items-center gap-2.5 px-4 py-2.5 border text-xs transition-all",
                                    order.status === s
                                      ? "border-stone-900 bg-stone-900 text-white"
                                      : "border-stone-200 text-stone-600 hover:border-stone-400 bg-white"
                                  )}
                                >
                                  <SIcon size={12} />
                                  {label}
                                  {order.status === s && <Check size={12} className="ml-auto" />}
                                </button>
                              );
                            })}
                          </div>

                          {/* Total breakdown */}
                          <div className="mt-4 bg-white border border-stone-100 p-4 space-y-2 text-sm">
                            <div className="flex justify-between text-stone-500">
                              <span>Subtotal</span>
                              <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            {order.discount > 0 && (
                              <div className="flex justify-between text-emerald-600">
                                <span>Discount</span>
                                <span>−{formatPrice(order.discount)}</span>
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
      </div>

      <p className="mt-4 text-xs text-stone-400">
        Showing {filtered.length} of {orders.length} orders
      </p>
    </div>
  );
}
