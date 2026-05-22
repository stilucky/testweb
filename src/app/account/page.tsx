"use client";

import { useState, useEffect } from "react";
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
  Plus,
  LogOut,
} from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
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

const mockOrders = [
  {
    id: "ORD-24051",
    date: "May 12, 2026",
    items: [
      { name: "Celestine Lace Dress", size: "S", color: "Ivory", qty: 1, price: 285 },
      { name: "Vivienne Blazer", size: "S", color: "Camel", qty: 1, price: 245 },
    ],
    total: 530,
    status: "delivered" as const,
    tracking: "1Z999AA10123456784",
  },
  {
    id: "ORD-24038",
    date: "Apr 28, 2026",
    items: [{ name: "Margot Slip Dress", size: "M", color: "Black", qty: 1, price: 155 }],
    total: 155,
    status: "shipped" as const,
    tracking: "1Z999AA10123456785",
  },
  {
    id: "ORD-24019",
    date: "Apr 3, 2026",
    items: [
      { name: "Elara Wrap Top", size: "S", color: "Terracotta", qty: 1, price: 145 },
      { name: "Solène Palazzo Pants", size: "S", color: "Ecru", qty: 1, price: 175 },
    ],
    total: 320,
    status: "delivered" as const,
    tracking: "1Z999AA10123456786",
  },
  {
    id: "ORD-23997",
    date: "Mar 15, 2026",
    items: [{ name: "Isabelle Cocktail Dress", size: "XS", color: "Midnight", qty: 1, price: 265 }],
    total: 265,
    status: "delivered" as const,
    tracking: "1Z999AA10123456787",
  },
];

const mockAddresses = [
  {
    id: "1",
    label: "Home",
    name: "Sophie Laurent",
    line1: "123 Maple Street, Apt 4B",
    line2: "Vancouver, BC V6B 2N4",
    country: "Canada",
    isDefault: true,
  },
  {
    id: "2",
    label: "Office",
    name: "Sophie Laurent",
    line1: "800 Robson Street, Suite 1200",
    line2: "Vancouver, BC V6Z 3B7",
    country: "Canada",
    isDefault: false,
  },
];

const statusConfig = {
  delivered: { label: "Delivered", icon: Check, color: "text-emerald-600 bg-emerald-50" },
  shipped: { label: "Shipped", icon: Truck, color: "text-blue-600 bg-blue-50" },
  processing: { label: "Processing", icon: Clock, color: "text-amber-600 bg-amber-50" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-500 bg-red-50" },
};

export default function AccountPage() {
  const router = useRouter();
  const { currentUser, logout, updateProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profile, setProfile] = useState({
    firstName: currentUser?.firstName ?? "",
    lastName: currentUser?.lastName ?? "",
    email: currentUser?.email ?? "",
    phone: currentUser?.phone ?? "",
  });
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

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
          <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-1">My Account</p>
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
                    { label: "Member Since", value: "January 2024" },
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
            </div>
          )}

          {/* Orders */}
          {activeTab === "orders" && (
            <div>
              <h2 className="text-xs tracking-widest uppercase font-medium mb-8">Order History</h2>
              {mockOrders.length === 0 ? (
                <div className="text-center py-16">
                  <Package size={48} className="text-stone-200 mx-auto mb-4" />
                  <p className="text-stone-400">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mockOrders.map((order) => {
                    const { label, icon: StatusIcon, color } = statusConfig[order.status];
                    const isExpanded = expandedOrder === order.id;

                    return (
                      <div key={order.id} className="border border-stone-100">
                        {/* Order header */}
                        <button
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          className="w-full flex items-center justify-between p-5 hover:bg-stone-50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-6">
                            <div>
                              <p className="text-sm font-medium">{order.id}</p>
                              <p className="text-xs text-stone-400 mt-0.5">{order.date}</p>
                            </div>
                            <div className="hidden md:block">
                              <p className="text-xs text-stone-400">
                                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span
                              className={cn(
                                "flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium",
                                color
                              )}
                            >
                              <StatusIcon size={10} />
                              {label}
                            </span>
                            <p
                              className="text-sm font-medium"
                              style={{ fontFamily: "var(--font-cormorant), serif" }}
                            >
                              {formatPrice(order.total)}
                            </p>
                            <ChevronRight
                              size={14}
                              className={cn(
                                "text-stone-400 transition-transform shrink-0",
                                isExpanded && "rotate-90"
                              )}
                            />
                          </div>
                        </button>

                        {/* Order detail */}
                        {isExpanded && (
                          <div className="border-t border-stone-100 px-5 pb-5">
                            <div className="pt-4 space-y-3">
                              {order.items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                  <div>
                                    <p>{item.name}</p>
                                    <p className="text-xs text-stone-400 mt-0.5">
                                      Size: {item.size} · Color: {item.color} · Qty: {item.qty}
                                    </p>
                                  </div>
                                  <p className="text-sm">{formatPrice(item.price * item.qty)}</p>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                              <p className="text-xs text-stone-400">
                                Tracking: <span className="text-stone-600 font-mono">{order.tracking}</span>
                              </p>
                              <div className="flex gap-3">
                                <button className="text-xs tracking-wider uppercase underline underline-offset-2 hover:text-stone-600 transition-colors">
                                  Track
                                </button>
                                <button className="text-xs tracking-wider uppercase underline underline-offset-2 hover:text-stone-600 transition-colors">
                                  Return
                                </button>
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
          )}

          {/* Addresses */}
          {activeTab === "addresses" && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs tracking-widest uppercase font-medium">Saved Addresses</h2>
                <button className="flex items-center gap-1.5 text-xs tracking-widest uppercase hover:text-stone-600 transition-colors border border-stone-200 px-4 py-2 hover:bg-stone-50">
                  <Plus size={12} />
                  Add Address
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {mockAddresses.map((addr) => (
                  <div key={addr.id} className="border border-stone-100 p-6 relative">
                    {addr.isDefault && (
                      <span className="absolute top-4 right-4 text-[10px] bg-stone-900 text-white px-2 py-0.5 tracking-widest uppercase">
                        Default
                      </span>
                    )}
                    <p className="text-xs tracking-widest uppercase text-stone-400 mb-3">{addr.label}</p>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{addr.name}</p>
                      <p className="text-stone-500">{addr.line1}</p>
                      <p className="text-stone-500">{addr.line2}</p>
                      <p className="text-stone-500">{addr.country}</p>
                    </div>
                    <div className="flex gap-4 mt-5 pt-4 border-t border-stone-100">
                      <button className="text-xs tracking-wider uppercase underline underline-offset-2 hover:text-stone-600 transition-colors">
                        Edit
                      </button>
                      {!addr.isDefault && (
                        <>
                          <button className="text-xs tracking-wider uppercase underline underline-offset-2 hover:text-stone-600 transition-colors">
                            Set Default
                          </button>
                          <button className="text-xs tracking-wider uppercase text-red-400 underline underline-offset-2 hover:text-red-600 transition-colors ml-auto">
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
