"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User,
  Package,
  MapPin,
  Heart,
  ChevronRight,
  Edit3,
  Check,
  Truck,
  Clock,
  XCircle,
  LogOut,
  Tag,
  Copy,
  Scissors,
  Ruler,
  RefreshCw,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { useOrderStore } from "@/store/orderStore";
import { useTailoredOrderStore, type TailoredOrder } from "@/store/tailoredOrderStore";
import { useCouponStore } from "@/store/couponStore";
import { formatPrice, cn } from "@/lib/utils";

function timeAgo(isoString?: string): string {
  if (!isoString) return "Never";
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

type Tab = "profile" | "orders" | "addresses" | "wishlist";
type OrderFilter = "all" | "regular" | "tailored";

const shipStatusConfig = {
  pending:    { label: "Pending",    icon: Clock,    color: "text-stone-500 bg-stone-100" },
  processing: { label: "Processing", icon: Clock,    color: "text-amber-600 bg-amber-50" },
  shipped:    { label: "Shipped",    icon: Truck,    color: "text-blue-600 bg-blue-50" },
  delivered:  { label: "Delivered",  icon: Check,    color: "text-emerald-600 bg-emerald-50" },
  cancelled:  { label: "Cancelled",  icon: XCircle,  color: "text-red-500 bg-red-50" },
};

const payStatusConfig = {
  paid:     { label: "Paid",     color: "text-emerald-600 bg-emerald-50" },
  pending:  { label: "Unpaid",   color: "text-amber-600 bg-amber-50" },
  refunded: { label: "Refunded", color: "text-blue-600 bg-blue-50" },
};

const tailoredStatusConfig: Record<TailoredOrder["status"], { label: string; color: string }> = {
  pending:       { label: "Pending",       color: "text-stone-500 bg-stone-100" },
  confirmed:     { label: "Confirmed",     color: "text-violet-600 bg-violet-50" },
  in_production: { label: "In Production", color: "text-amber-600 bg-amber-50" },
  shipped:       { label: "Shipped",       color: "text-blue-600 bg-blue-50" },
  completed:     { label: "Completed",     color: "text-emerald-600 bg-emerald-50" },
  cancelled:     { label: "Cancelled",     color: "text-red-500 bg-red-50" },
};

const tailoredSteps: TailoredOrder["status"][] = [
  "pending", "confirmed", "in_production", "shipped", "completed",
];

interface ShopifyStatusData {
  id: number;
  name: string;
  status: "open" | "invoice_sent" | "completed";
  financial_status?: string | null;
  fulfillment_status?: string | null;
  invoice_url?: string | null;
  error?: string;
}

function ShopifyStatusDisplay({ status }: { status: ShopifyStatusData }) {
  const steps = [
    { label: "Order Created", done: true },
    {
      label: "Payment Received",
      done: status.status === "completed" || status.financial_status === "paid",
    },
    {
      label: "Fulfilled",
      done: status.fulfillment_status === "fulfilled",
    },
  ];

  const statusLabel =
    status.status === "completed"
      ? "Paid & Processing"
      : status.status === "invoice_sent"
      ? "Invoice Sent"
      : "Awaiting Payment";

  const statusColor =
    status.status === "completed"
      ? "text-emerald-600 bg-emerald-50"
      : status.status === "invoice_sent"
      ? "text-blue-600 bg-blue-50"
      : "text-amber-600 bg-amber-50";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className={cn("text-[11px] px-2.5 py-1 rounded-full font-medium", statusColor)}>
          {statusLabel}
        </span>
        <span className="text-[10px] text-stone-400">Shopify #{status.name}</span>
        {status.invoice_url && status.status !== "completed" && (
          <a
            href={status.invoice_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-stone-500 hover:text-stone-800 underline underline-offset-2 transition-colors"
          >
            Pay Now <ExternalLink size={9} />
          </a>
        )}
      </div>
      <div className="flex items-center gap-0">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-0">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                step.done ? "bg-stone-900" : "bg-stone-200"
              )}>
                {step.done && <Check size={9} className="text-white" />}
              </div>
              <p className="text-[9px] text-stone-400 mt-1 text-center max-w-14 leading-tight">{step.label}</p>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                "h-px w-10 md:w-16 mb-4 mx-0.5 shrink-0",
                steps[i + 1].done ? "bg-stone-900" : "bg-stone-200"
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TailoredOrderCard({
  order,
  isExpanded,
  onToggle,
}: {
  order: TailoredOrder;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const cfg = tailoredStatusConfig[order.status];
  const currentStepIdx = order.status === "cancelled" ? -1 : tailoredSteps.indexOf(order.status);

  return (
    <div className="border border-stone-100">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 hover:bg-stone-50 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm font-medium line-clamp-1">{order.designName}</p>
            <p className="text-xs text-stone-400 mt-0.5">
              {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <span className={cn(
            "hidden md:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full shrink-0",
            order.type === "made-to-order"
              ? "bg-violet-50 text-violet-600"
              : "bg-pink-50 text-pink-600"
          )}>
            {order.type === "made-to-order" ? <><Scissors size={9} /> Make to Order</> : <><Ruler size={9} /> Customized Fit</>}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <span className={cn("text-[11px] px-2.5 py-1 rounded-full font-medium", cfg.color)}>
            {cfg.label}
          </span>
          <p className="text-sm font-medium min-w-14 text-right" style={{ fontFamily: "var(--font-cormorant), serif" }}>
            {formatPrice(order.totalPrice)}
          </p>
          <ChevronRight size={14} className={cn("text-stone-400 transition-transform shrink-0", isExpanded && "rotate-90")} />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-stone-100 px-5 pb-5">
          {/* Progress steps */}
          {order.status !== "cancelled" && (
            <div className="pt-4 pb-5 border-b border-stone-100 mb-4">
              <p className="text-[10px] tracking-widests uppercase text-stone-400 font-medium mb-3">
                Order Progress
              </p>
              <div className="flex items-center">
                {tailoredSteps.map((step, i) => {
                  const isDone = i <= currentStepIdx;
                  const labels: Record<typeof step, string> = {
                    pending: "Received",
                    confirmed: "Confirmed",
                    in_production: "Production",
                    shipped: "Shipped",
                    completed: "Completed",
                  };
                  return (
                    <div key={step} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                          isDone ? "bg-stone-900" : "bg-stone-200"
                        )}>
                          {isDone && <Check size={9} className="text-white" />}
                        </div>
                        <p className="text-[9px] text-stone-400 mt-1 text-center max-w-12 leading-tight">
                          {labels[step]}
                        </p>
                      </div>
                      {i < tailoredSteps.length - 1 && (
                        <div className={cn(
                          "h-px w-8 md:w-12 mb-4 mx-0.5 shrink-0",
                          i < currentStepIdx ? "bg-stone-900" : "bg-stone-200"
                        )} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Design info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs mb-4">
            <div>
              <p className="text-stone-400 mb-0.5">Type</p>
              <p className="text-stone-700 capitalize">
                {order.type === "made-to-order" ? "Make to Order" : "Customized Fit"}
              </p>
            </div>
            <div>
              <p className="text-stone-400 mb-0.5">Color</p>
              <p className="text-stone-700">{order.color}</p>
            </div>
            {order.selectedSize && (
              <div>
                <p className="text-stone-400 mb-0.5">Size</p>
                <p className="text-stone-700">{order.selectedSize}</p>
              </div>
            )}
          </div>

          {/* Measurements for customized fit */}
          {order.type === "customized-fit" && Object.keys(order.measurements).length > 0 && (
            <div className="pt-4 border-t border-stone-100">
              <p className="text-[10px] tracking-widests uppercase text-stone-400 font-medium mb-3">
                Your Measurements
              </p>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                {(Object.entries(order.measurements) as [string, string | undefined][])
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k}>
                      <p className="text-stone-400 mb-0.5 capitalize">{k}</p>
                      <p className="text-stone-700">{v}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-stone-400 mb-0.5">Base Price</p>
              <p className="text-stone-700">{formatPrice(order.basePrice)}</p>
            </div>
            <div>
              <p className="text-stone-400 mb-0.5">Tailoring Fee</p>
              <p className="text-stone-700">{formatPrice(order.tailoringFee)}</p>
            </div>
            <div>
              <p className="text-stone-400 mb-0.5">Total</p>
              <p className="text-stone-900 font-medium">{formatPrice(order.totalPrice)}</p>
            </div>
          </div>

          {order.notes && (
            <div className="mt-3 pt-3 border-t border-stone-100">
              <p className="text-xs text-stone-400">
                Notes: <span className="text-stone-600">{order.notes}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { currentUser, logout, updateProfile } = useAuthStore();
  const { coupons } = useCouponStore();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [codeCopied, setCodeCopied] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profile, setProfile] = useState({
    firstName: currentUser?.firstName ?? "",
    lastName: currentUser?.lastName ?? "",
    email: currentUser?.email ?? "",
    phone: currentUser?.phone ?? "",
  });
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [shopifyStatuses, setShopifyStatuses] = useState<Record<string, ShopifyStatusData>>({});
  const [fetchingStatus, setFetchingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) router.push("/auth");
  }, [currentUser, router]);

  useEffect(() => {
    if (currentUser) {
      setProfile({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phone: currentUser.phone ?? "",
      });
    }
  }, [currentUser]);

  const { items: wishlistItems, removeItem: removeWishlistItem } = useWishlistStore();
  const { getAddresses, removeAddress, setDefaultAddress } = useAuthStore();
  const { orders: allOrders } = useOrderStore();
  const { orders: allTailoredOrders } = useTailoredOrderStore();

  const myOrders = (allOrders ?? []).filter((o) => {
    if (!currentUser) return false;
    return (
      (o.userId && o.userId === currentUser.id) ||
      o.email.toLowerCase() === currentUser.email.toLowerCase()
    );
  });

  const myTailoredOrders = (allTailoredOrders ?? []).filter((o) => {
    if (!currentUser) return false;
    return o.customerEmail?.toLowerCase() === currentUser.email.toLowerCase();
  });

  const fetchShopifyStatus = useCallback(async (orderId: string, shopifyDraftOrderId: number) => {
    setFetchingStatus(orderId);
    try {
      const res = await fetch(`/api/shopify/draft-order/${shopifyDraftOrderId}`);
      const data = await res.json();
      if (!res.ok) {
        setShopifyStatuses((prev) => ({
          ...prev,
          [orderId]: { ...data, error: data.error ?? "Failed to load status" } as ShopifyStatusData,
        }));
      } else {
        setShopifyStatuses((prev) => ({ ...prev, [orderId]: data as ShopifyStatusData }));
      }
    } catch {
      setShopifyStatuses((prev) => ({
        ...prev,
        [orderId]: { id: shopifyDraftOrderId, name: "", status: "open", error: "Network error" } as ShopifyStatusData,
      }));
    } finally {
      setFetchingStatus(null);
    }
  }, []);

  if (!currentUser) return null;

  const tabs = [
    { id: "profile" as Tab, label: "Profile", icon: User },
    { id: "orders" as Tab, label: "Orders", icon: Package },
    { id: "addresses" as Tab, label: "Addresses", icon: MapPin },
    { id: "wishlist" as Tab, label: "Wishlist", icon: Heart },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="type-label text-stone-400 mb-1">My Account</p>
          <h1
            className="text-4xl md:text-5xl"
            style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
          >
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="text-stone-400 text-sm mt-1">{profile.email}</p>
        </div>
        <button
          onClick={() => { logout(); router.push("/"); }}
          className="hidden md:flex items-center gap-2 text-xs text-stone-400 hover:text-stone-900 transition-colors tracking-wide uppercase"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar tabs */}
        <aside className="md:w-52 shrink-0">
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3 text-xs tracking-widest uppercase transition-all text-left",
                  activeTab === id
                    ? "bg-stone-900 text-white"
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
                )}
              >
                <Icon size={14} />
                {label}
                {id === "orders" && (myOrders.length + myTailoredOrders.length) > 0 && (
                  <span className={cn(
                    "ml-auto text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-medium",
                    activeTab === id ? "bg-white text-stone-900" : "bg-stone-200 text-stone-600"
                  )}>
                    {myOrders.length + myTailoredOrders.length}
                  </span>
                )}
                {id === "wishlist" && wishlistItems.length > 0 && (
                  <span className={cn(
                    "ml-auto text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-medium",
                    activeTab === id ? "bg-white text-stone-900" : "bg-stone-200 text-stone-600"
                  )}>
                    {wishlistItems.length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-stone-100 md:hidden">
            <button className="flex items-center gap-2 text-xs text-stone-400 hover:text-stone-900 transition-colors tracking-wide uppercase">
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Tab content */}
        <div className="flex-1 min-w-0">

          {/* Profile */}
          {activeTab === "profile" && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs tracking-widest uppercase font-medium">Personal Information</h2>
                <button
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-900 transition-colors"
                >
                  <Edit3 size={12} />
                  {editingProfile ? "Cancel" : "Edit"}
                </button>
              </div>

              {editingProfile ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateProfile(profile);
                    setEditingProfile(false);
                  }}
                  className="space-y-4 max-w-lg"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-stone-500 mb-1.5 tracking-wide">First Name</label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                        className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-500 mb-1.5 tracking-wide">Last Name</label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                        className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-stone-500 mb-1.5 tracking-wide">Email Address</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-500 mb-1.5 tracking-wide">Phone</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-8 py-3 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProfile(false)}
                      className="px-8 py-3 border border-stone-200 text-xs tracking-widest uppercase hover:bg-stone-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6 max-w-lg">
                  {[
                    { label: "Name", value: `${profile.firstName} ${profile.lastName}` },
                    { label: "Email", value: profile.email },
                    { label: "Phone", value: profile.phone },
                    {
                      label: "Member Since",
                      value: currentUser.createdAt
                        ? new Date(currentUser.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                        : "—",
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between border-b border-stone-100 pb-5">
                      <p className="text-xs tracking-widest uppercase text-stone-400 pt-0.5">{label}</p>
                      <p className="text-sm text-stone-800 text-right">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Change password section */}
              <div className="mt-12 pt-8 border-t border-stone-100 max-w-lg">
                <h2 className="text-xs tracking-widest uppercase font-medium mb-6">Security</h2>
                <div className="flex items-center justify-between border-b border-stone-100 pb-5">
                  <div>
                    <p className="text-sm">Password</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Last changed: {timeAgo(currentUser?.passwordChangedAt)}
                    </p>
                  </div>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs tracking-wider uppercase underline underline-offset-2 hover:text-stone-600 transition-colors"
                  >
                    Change
                  </Link>
                </div>
              </div>

              {/* ── My Discount ── */}
              {currentUser.personalCode && (() => {
                const coupon = coupons.find((c) => c.code === currentUser.personalCode);
                const isUsed = (coupon?.usedCount ?? 0) >= 1;
                return (
                  <div className="mt-10">
                    <div className="flex items-center gap-2 mb-6">
                      <Tag size={13} className="text-stone-500" />
                      <h2 className="text-xs tracking-widest uppercase font-medium">My Discount</h2>
                    </div>

                    <div className={cn(
                      "border p-5",
                      isUsed ? "border-stone-100 bg-stone-50" : "border-stone-200 bg-white"
                    )}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-1">
                            {isUsed ? "Used" : "Available"}
                          </p>
                          <p className={cn(
                            "font-mono text-xl tracking-widest font-medium mb-1",
                            isUsed ? "text-stone-300 line-through" : "text-stone-900"
                          )}>
                            {currentUser.personalCode}
                          </p>
                          <p className={cn("text-xs", isUsed ? "text-stone-300" : "text-stone-500")}>
                            10% off your order — one-time use, no expiry
                          </p>
                          <p className="text-[10px] text-stone-400 mt-2">
                            Cannot be combined with other discount codes.
                          </p>
                        </div>

                        {!isUsed && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(currentUser.personalCode!);
                              setCodeCopied(true);
                              setTimeout(() => setCodeCopied(false), 2000);
                            }}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-2 border border-stone-200 text-stone-600 text-[10px] tracking-widest uppercase hover:border-stone-900 hover:text-stone-900 transition-colors"
                          >
                            {codeCopied
                              ? <><Check size={11} className="text-emerald-600" /> Copied</>
                              : <><Copy size={11} /> Copy</>
                            }
                          </button>
                        )}
                      </div>

                      {isUsed && (
                        <p className="text-[10px] text-stone-400 mt-3 pt-3 border-t border-stone-100">
                          This code has been used. Contact us if you have any questions.
                        </p>
                      )}
                    </div>

                    {!isUsed && (
                      <p className="text-[11px] text-stone-400 mt-3">
                        Apply this code at checkout to save 10% on your order.
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Orders */}
          {activeTab === "orders" && (
            <div>
              {/* Header + filter tabs */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs tracking-widest uppercase font-medium">Order History</h2>
                <div className="flex items-center border border-stone-200 overflow-hidden">
                  {(["all", "regular", "tailored"] as OrderFilter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setOrderFilter(f)}
                      className={cn(
                        "px-3 py-1.5 text-[10px] tracking-widest uppercase transition-colors border-r border-stone-200 last:border-r-0",
                        orderFilter === f
                          ? "bg-stone-900 text-white"
                          : "text-stone-400 hover:text-stone-700 hover:bg-stone-50"
                      )}
                    >
                      {f === "all" ? "All" : f === "regular" ? "Regular" : "Tailored"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary row */}
              {(myOrders.length > 0 || myTailoredOrders.length > 0) && (
                <div className="flex items-center gap-3 mb-6 text-[11px] text-stone-400 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Package size={11} />
                    {myOrders.length} regular
                  </span>
                  <span className="text-stone-200">·</span>
                  <span className="flex items-center gap-1.5">
                    <Scissors size={11} className="text-violet-400" />
                    {myTailoredOrders.filter((o) => o.type === "made-to-order").length} make to order
                  </span>
                  <span className="text-stone-200">·</span>
                  <span className="flex items-center gap-1.5">
                    <Ruler size={11} className="text-pink-400" />
                    {myTailoredOrders.filter((o) => o.type === "customized-fit").length} customized fit
                  </span>
                </div>
              )}

              {/* Regular orders */}
              {(orderFilter === "all" || orderFilter === "regular") && myOrders.length > 0 && (
                <div className={orderFilter === "all" && myTailoredOrders.length > 0 ? "mb-8" : ""}>
                  {orderFilter === "all" && (
                    <div className="flex items-center gap-2 mb-3">
                      <Package size={12} className="text-stone-400" />
                      <p className="text-[10px] tracking-widest uppercase text-stone-400 font-medium">
                        Regular Orders
                      </p>
                    </div>
                  )}
                  <div className="space-y-3">
                    {myOrders.map((order) => {
                      const ship = shipStatusConfig[order.status];
                      const pay = payStatusConfig[order.payment];
                      const ShipIcon = ship.icon;
                      const isExpanded = expandedOrder === order.id;
                      const itemCount = order.items.reduce((s, i) => s + i.qty, 0);
                      const shopifyStatus = shopifyStatuses[order.id];
                      const isFetchingThis = fetchingStatus === order.id;

                      return (
                        <div key={order.id} className="border border-stone-100">
                          <button
                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                            className="w-full flex items-center justify-between p-5 hover:bg-stone-50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="text-sm font-medium">{order.id}</p>
                                <p className="text-xs text-stone-400 mt-0.5">{order.date}</p>
                              </div>
                              <p className="hidden md:block text-xs text-stone-400">
                                {itemCount} item{itemCount !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap justify-end">
                              <span className={cn("flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium", ship.color)}>
                                <ShipIcon size={10} />
                                {ship.label}
                              </span>
                              <span className={cn("text-[11px] px-2.5 py-1 rounded-full font-medium", pay.color)}>
                                {pay.label}
                              </span>
                              <p className="text-sm font-medium min-w-14 text-right" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                                {formatPrice(order.total)}
                              </p>
                              <ChevronRight
                                size={14}
                                className={cn("text-stone-400 transition-transform shrink-0", isExpanded && "rotate-90")}
                              />
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="border-t border-stone-100 px-5 pb-5">
                              {/* Shopify live status block */}
                              {order.shopifyDraftOrderId && (
                                <div className="pt-4 pb-4 border-b border-stone-100 mb-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <p className="text-[10px] tracking-widest uppercase text-stone-400 font-medium">
                                      Shopify Status
                                    </p>
                                    <button
                                      onClick={() => fetchShopifyStatus(order.id, order.shopifyDraftOrderId!)}
                                      disabled={isFetchingThis}
                                      className="flex items-center gap-1 text-[10px] text-stone-400 hover:text-stone-700 transition-colors disabled:opacity-50"
                                    >
                                      <RefreshCw size={10} className={isFetchingThis ? "animate-spin" : ""} />
                                      Refresh
                                    </button>
                                  </div>
                                  {shopifyStatus?.error ? (
                                    <div className="flex items-center gap-2 text-xs text-red-400">
                                      <AlertCircle size={12} />
                                      {shopifyStatus.error}
                                    </div>
                                  ) : shopifyStatus ? (
                                    <ShopifyStatusDisplay status={shopifyStatus} />
                                  ) : (
                                    <button
                                      onClick={() => fetchShopifyStatus(order.id, order.shopifyDraftOrderId!)}
                                      disabled={isFetchingThis}
                                      className="flex items-center gap-1.5 text-[10px] text-stone-500 hover:text-stone-800 transition-colors underline underline-offset-2 disabled:opacity-50"
                                    >
                                      <RefreshCw size={10} className={isFetchingThis ? "animate-spin" : ""} />
                                      {isFetchingThis ? "Loading..." : "Load Shopify status"}
                                    </button>
                                  )}
                                </div>
                              )}

                              <div className="pt-0 space-y-3">
                                {order.items.map((item, i) => (
                                  <div key={i} className="flex items-center justify-between text-sm">
                                    <div>
                                      <p>{item.name}</p>
                                      <p className="text-xs text-stone-400 mt-0.5">
                                        Size: {item.size} · Color: {item.color} · Qty: {item.qty}
                                      </p>
                                    </div>
                                    <p className="text-sm shrink-0 ml-4">{formatPrice(item.price * item.qty)}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                <div>
                                  <p className="text-stone-400 mb-0.5">Subtotal</p>
                                  <p className="text-stone-700">{formatPrice(order.subtotal)}</p>
                                </div>
                                {order.discount > 0 && (
                                  <div>
                                    <p className="text-stone-400 mb-0.5">Discount</p>
                                    <p className="text-emerald-600">−{formatPrice(order.discount)}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-stone-400 mb-0.5">Shipping</p>
                                  <p className="text-stone-700">
                                    {order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-stone-400 mb-0.5">Payment</p>
                                  <p className="text-stone-700 capitalize">{order.paymentMethod}</p>
                                </div>
                              </div>
                              <div className="mt-3 pt-3 border-t border-stone-100">
                                <p className="text-xs text-stone-400">
                                  Ship to: <span className="text-stone-600">{order.shippingAddress}</span>
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tailored orders */}
              {(orderFilter === "all" || orderFilter === "tailored") && myTailoredOrders.length > 0 && (
                <div>
                  {orderFilter === "all" && (
                    <div className="flex items-center gap-2 mb-3">
                      <Scissors size={12} className="text-stone-400" />
                      <p className="text-[10px] tracking-widest uppercase text-stone-400 font-medium">
                        Tailored Orders
                      </p>
                    </div>
                  )}
                  <div className="space-y-3">
                    {myTailoredOrders.map((order) => (
                      <TailoredOrderCard
                        key={order.id}
                        order={order}
                        isExpanded={expandedOrder === order.id}
                        onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty states */}
              {myOrders.length === 0 && myTailoredOrders.length === 0 && (
                <div className="text-center py-16 border border-dashed border-stone-200">
                  <Package size={48} className="text-stone-200 mx-auto mb-4" />
                  <p className="text-stone-400 mb-1">No orders yet</p>
                  <p className="text-stone-300 text-xs">Your orders will appear here after checkout</p>
                </div>
              )}
              {orderFilter === "regular" && myOrders.length === 0 && myTailoredOrders.length > 0 && (
                <div className="text-center py-12 border border-dashed border-stone-200">
                  <Package size={36} className="text-stone-200 mx-auto mb-3" />
                  <p className="text-stone-400 text-sm">No regular orders yet</p>
                </div>
              )}
              {orderFilter === "tailored" && myTailoredOrders.length === 0 && myOrders.length > 0 && (
                <div className="text-center py-12 border border-dashed border-stone-200">
                  <Scissors size={36} className="text-stone-200 mx-auto mb-3" />
                  <p className="text-stone-400 text-sm">No tailored orders yet</p>
                </div>
              )}
            </div>
          )}

          {/* Addresses */}
          {activeTab === "addresses" && (() => {
            const addresses = getAddresses();
            return (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xs tracking-widest uppercase font-medium">
                    Saved Addresses
                    {addresses.length > 0 && (
                      <span className="ml-2 text-stone-400 font-normal">({addresses.length})</span>
                    )}
                  </h2>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-stone-200">
                    <MapPin size={36} className="text-stone-200 mx-auto mb-3" />
                    <p className="text-stone-400 text-sm mb-1">No saved addresses yet</p>
                    <p className="text-stone-300 text-xs">
                      Check "Save address" at checkout to save your shipping address here.
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="border border-stone-100 p-6 relative">
                        {addr.isDefault && (
                          <span className="absolute top-4 right-4 text-[10px] bg-stone-900 text-white px-2 py-0.5 tracking-widest uppercase">
                            Default
                          </span>
                        )}
                        <p className="text-xs tracking-widest uppercase text-stone-400 mb-3">{addr.label}</p>
                        <div className="space-y-1 text-sm">
                          <p className="font-medium">{addr.firstName} {addr.lastName}</p>
                          <p className="text-stone-500">{addr.line1}</p>
                          <p className="text-stone-500">{addr.city}, {addr.postal}</p>
                          <p className="text-stone-500">{addr.country}</p>
                          {addr.phone && <p className="text-stone-400 text-xs">{addr.phone}</p>}
                        </div>
                        <div className="flex gap-4 mt-5 pt-4 border-t border-stone-100">
                          {!addr.isDefault && (
                            <>
                              <button
                                onClick={() => setDefaultAddress(addr.id)}
                                className="text-xs tracking-wider uppercase underline underline-offset-2 hover:text-stone-600 transition-colors"
                              >
                                Set Default
                              </button>
                              <button
                                onClick={() => removeAddress(addr.id)}
                                className="text-xs tracking-wider uppercase text-red-400 underline underline-offset-2 hover:text-red-600 transition-colors ml-auto"
                              >
                                Delete
                              </button>
                            </>
                          )}
                          {addr.isDefault && (
                            <button
                              onClick={() => removeAddress(addr.id)}
                              className="text-xs tracking-wider uppercase text-red-400 underline underline-offset-2 hover:text-red-600 transition-colors ml-auto"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Wishlist */}
          {activeTab === "wishlist" && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs tracking-widest uppercase font-medium">Saved Pieces</h2>
                <Link
                  href="/wishlist"
                  className="text-xs tracking-widest uppercase text-stone-400 hover:text-stone-900 transition-colors underline underline-offset-2"
                >
                  View All
                </Link>
              </div>

              {wishlistItems.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-stone-200">
                  <Heart size={40} className="text-stone-200 mx-auto mb-4" />
                  <p className="text-stone-400 text-sm mb-4">No saved pieces yet</p>
                  <Link
                    href="/products"
                    className="text-xs tracking-widest uppercase underline underline-offset-2 hover:text-stone-600 transition-colors"
                  >
                    Explore Collection
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlistItems.slice(0, 6).map((product) => {
                    const displayPrice = product.salePrice ?? product.price;
                    return (
                      <div key={product.id} className="group relative">
                        <button
                          onClick={() => removeWishlistItem(product.id)}
                          className="absolute top-2 right-2 z-10 p-1 bg-white/90 rounded-full text-stone-400 hover:text-stone-900 opacity-0 group-hover:opacity-100 transition-all"
                          aria-label="Remove"
                        >
                          <Heart size={12} fill="currentColor" className="text-red-400" />
                        </button>
                        <Link href={`/products/${product.slug}`} className="block relative overflow-hidden bg-stone-50 aspect-[3/4]">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            sizes="33vw"
                          />
                        </Link>
                        <div className="mt-2">
                          <Link href={`/products/${product.slug}`} className="text-sm font-medium hover:text-stone-600 line-clamp-1">
                            {product.name}
                          </Link>
                          <p className="text-xs text-stone-500 mt-0.5">{formatPrice(displayPrice)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {wishlistItems.length > 6 && (
                <Link
                  href="/wishlist"
                  className="mt-6 flex items-center justify-center gap-2 py-3 border border-stone-200 text-xs tracking-widest uppercase hover:bg-stone-50 transition-colors"
                >
                  View All {wishlistItems.length} Pieces
                  <ChevronRight size={12} />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
