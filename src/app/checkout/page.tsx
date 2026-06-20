"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Lock,
  ChevronDown,
  ChevronUp,
  Check,
  Tag,
  Loader2,
  AlertCircle,
  ExternalLink,
  ShoppingBag,
  User,
  LogIn,
  Search,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useOrderStore } from "@/store/orderStore";
import { useAuthStore } from "@/store/authStore";
import { useCouponStore } from "@/store/couponStore";
import { useSubscriberStore } from "@/store/subscriberStore";
import { formatPrice, cn } from "@/lib/utils";

type Step = "information" | "payment";
type CheckoutMode = "guest" | "signin";

// Province/State data per country
const regionsByCountry: Record<string, string[]> = {
  Canada: [
    "Alberta", "British Columbia", "Manitoba", "New Brunswick",
    "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia",
    "Nunavut", "Ontario", "Prince Edward Island", "Quebec",
    "Saskatchewan", "Yukon",
  ],
  "United States": [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
    "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
    "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
    "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
    "New Hampshire", "New Jersey", "New Mexico", "New York",
    "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
    "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
    "West Virginia", "Wisconsin", "Wyoming",
  ],
  Australia: [
    "Australian Capital Territory", "New South Wales", "Northern Territory",
    "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia",
  ],
  "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
  Germany: [
    "Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen",
    "Hamburg", "Hesse", "Lower Saxony", "Mecklenburg-Vorpommern",
    "North Rhine-Westphalia", "Rhineland-Palatinate", "Saarland",
    "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia",
  ],
  France: [
    "Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Bretagne",
    "Centre-Val de Loire", "Corse", "Grand Est", "Hauts-de-France",
    "Île-de-France", "Normandie", "Nouvelle-Aquitaine", "Occitanie",
    "Pays de la Loire", "Provence-Alpes-Côte d'Azur",
  ],
};

const regionLabel: Record<string, string> = {
  Canada: "Province / Territory",
  "United States": "State",
  Australia: "State / Territory",
  "United Kingdom": "Country",
  Germany: "State",
  France: "Region",
};

// ─── Floating label input components ───

function FInput({
  label, type = "text", value, onChange, error, disabled, placeholder, right,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; error?: string;
  disabled?: boolean; placeholder?: string;
  right?: React.ReactNode;
}) {
  return (
    <div>
      <div className={cn(
        "relative flex items-center border rounded-xl px-4 pt-2.5 pb-2 transition-colors bg-white",
        error ? "border-red-400" : disabled ? "border-stone-100 bg-stone-50" : "border-stone-200 focus-within:border-stone-800"
      )}>
        <div className="flex-1 min-w-0">
          <label className="block text-[11px] text-stone-400 mb-0.5 select-none">{label}</label>
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full text-sm text-stone-900 focus:outline-none bg-transparent disabled:text-stone-400 placeholder:text-stone-300"
          />
        </div>
        {right && <div className="ml-2 shrink-0 text-stone-400">{right}</div>}
      </div>
      {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
    </div>
  );
}

function FSelect({
  label, value, onChange, options, error, disabled, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; error?: string; disabled?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <div className={cn(
        "relative border rounded-xl px-4 pt-2.5 pb-2 transition-colors bg-white",
        error ? "border-red-400" : disabled ? "border-stone-100 bg-stone-50" : "border-stone-200 focus-within:border-stone-800"
      )}>
        <label className="block text-[11px] text-stone-400 mb-0.5 select-none">{label}</label>
        <div className="flex items-center">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={cn(
              "flex-1 text-sm focus:outline-none appearance-none bg-transparent pr-4",
              value ? "text-stone-900" : "text-stone-300",
              disabled && "text-stone-400"
            )}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <ChevronDown size={13} className="text-stone-400 shrink-0 absolute right-4 pointer-events-none" />
        </div>
      </div>
      {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
    </div>
  );
}

interface InfoForm {
  email: string;
  newsletter: boolean;
  firstName: string;
  lastName: string;
  country: string;
  address: string;
  province: string;
  city: string;
  postal: string;
  phone: string;
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const { addOrder, updateShopifyOrderId } = useOrderStore();
  const { currentUser, addAddress, getAddresses } = useAuthStore();
  const { validateCoupon, useCoupon } = useCouponStore();
  const { markCouponUsed } = useSubscriberStore();

  const [saveAddress, setSaveAddress] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>("guest");
  const [step, setStep] = useState<Step>("information");

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string; label: string; type: "percent" | "fixed"; value: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [shopifyError, setShopifyError] = useState("");
  const [shopifyRedirecting, setShopifyRedirecting] = useState(false);

  const [info, setInfo] = useState<InfoForm>({
    email: currentUser?.email ?? "",
    newsletter: false,
    firstName: currentUser?.firstName ?? "",
    lastName: currentUser?.lastName ?? "",
    country: "",
    address: "",
    province: "",
    city: "",
    postal: "",
    phone: currentUser?.phone ?? "",
  });
  const [infoErrors, setInfoErrors] = useState<Partial<InfoForm>>({});

  // ─── Calculations ───
  const subtotal = total();
  const shippingCost = subtotal >= 200 ? 0 : 15;
  const discountAmount = appliedCoupon
    ? appliedCoupon.type === "percent"
      ? Math.round((subtotal * appliedCoupon.value) / 100 * 100) / 100
      : appliedCoupon.value
    : 0;
  const orderTotal = subtotal - discountAmount + shippingCost;

  // ─── Coupon ───
  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (appliedCoupon) {
      setCouponError("Only one discount code can be applied per order. Remove the current code first.");
      return;
    }
    setCouponLoading(true);
    setCouponError("");
    setTimeout(() => {
      const result = validateCoupon(code, subtotal);
      if (result.valid) {
        const c = result.coupon;
        setAppliedCoupon({ code: c.code, label: c.label, type: c.type, value: c.value });
        setCouponInput("");
      } else {
        setCouponError(result.error);
      }
      setCouponLoading(false);
    }, 600);
  };

  // ─── Validate info ───
  const validateInfo = () => {
    const e: Partial<InfoForm> = {};
    if (!info.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) e.email = "Valid email required";
    if (!info.country) e.country = "Required";
    if (!info.firstName.trim()) e.firstName = "Required";
    if (!info.lastName.trim()) e.lastName = "Required";
    if (!info.address.trim()) e.address = "Required";
    if (regionsByCountry[info.country] && !info.province) e.province = "Required";
    if (!info.city.trim()) e.city = "Required";
    if (!info.postal.trim()) e.postal = "Required";
    setInfoErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Save address ───
  const maybeSaveAddress = () => {
    if (!saveAddress || !currentUser) return;
    const existingAddresses = getAddresses();
    addAddress({
      label: "Home",
      firstName: info.firstName,
      lastName: info.lastName,
      line1: info.address,
      city: info.city,
      postal: info.postal,
      country: info.country,
      phone: info.phone || undefined,
      isDefault: existingAddresses.length === 0,
    });
  };

  // ─── Shopify Checkout ───
  const handleShopifyCheckout = async () => {
    setShopifyRedirecting(true);
    setShopifyError("");
    try {
      maybeSaveAddress();
      const orderItems = items.map((item) => ({
        name: item.product.name,
        qty: item.quantity,
        price: item.product.salePrice ?? item.product.price,
        size: item.selectedSize,
        color: item.selectedColor,
        image: item.product.images[0],
      }));
      const orderId = addOrder({
        customer: `${info.firstName} ${info.lastName}`.trim() || "Guest",
        email: info.email,
        phone: info.phone || undefined,
        items: orderItems,
        subtotal,
        shippingCost,
        discount: discountAmount,
        total: orderTotal,
        status: "pending",
        payment: "pending",
        paymentMethod: "shopify",
        shippingMethod: "Standard Shipping",
        shippingAddress: [info.address, info.city, info.province, info.postal, info.country].filter(Boolean).join(", "),
        couponCode: appliedCoupon?.code,
        userId: currentUser?.id,
      });
      if (appliedCoupon) {
        useCoupon(appliedCoupon.code);
        markCouponUsed(info.email);
      }
      const res = await fetch("/api/shopify/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          info,
          discountAmount,
          appliedCoupon,
          localOrderId: orderId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Shopify checkout failed");
      if (data.draftOrderId) updateShopifyOrderId(orderId, data.draftOrderId);
      clearCart();
      window.location.href = data.invoiceUrl;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to redirect to Shopify. Please try again.";
      setShopifyError(msg);
      setShopifyRedirecting(false);
    }
  };

  // ─── Empty cart ───
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag size={40} className="text-stone-200 mb-4" />
        <p className="text-stone-500 mb-6">Your cart is empty</p>
        <Link
          href="/products"
          className="bg-stone-900 text-white text-xs tracking-widest uppercase px-8 py-4 hover:bg-stone-700 transition-colors"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  const stepLabels: Record<Step, string> = {
    information: "Information",
    payment: "Review & Pay",
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-10">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-10">
        <Link
          href="/cart"
          className="flex items-center gap-2 text-xs tracking-widest uppercase text-stone-400 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft size={14} /> Cart
        </Link>
        <Link href="/">
          <span
            className="text-2xl tracking-[0.15em] uppercase"
            style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 400 }}
          >
            Lunelle
          </span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-stone-400">
          <Lock size={12} /> Secure Checkout
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-10 text-xs tracking-widest uppercase justify-center">
        {(["information", "payment"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors",
                  step === s
                    ? "bg-stone-900 text-white"
                    : step === "payment" && s === "information"
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-400"
                )}
              >
                {step === "payment" && s === "information" ? (
                  <Check size={10} />
                ) : (
                  i + 1
                )}
              </span>
              <span className={cn("hidden sm:block", step === s ? "text-stone-900" : "text-stone-400")}>
                {stepLabels[s]}
              </span>
            </div>
            {i < 1 && <span className="text-stone-200">—</span>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-10">
        {/* ─── Left: Form ─── */}
        <div className="lg:col-span-3 space-y-8">

          {/* ─── Step 1: Information ─── */}
          {step === "information" && (
            <div className="space-y-6">

              {/* Guest / Sign In toggle (only when not logged in) */}
              {!currentUser && (
                <div>
                  <div className="flex gap-px bg-stone-100 p-1 mb-4">
                    <button
                      onClick={() => setCheckoutMode("guest")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 text-xs tracking-widest uppercase transition-colors",
                        checkoutMode === "guest"
                          ? "bg-white text-stone-900 shadow-sm"
                          : "text-stone-400 hover:text-stone-600"
                      )}
                    >
                      <User size={13} />
                      Guest Checkout
                    </button>
                    <button
                      onClick={() => setCheckoutMode("signin")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 text-xs tracking-widest uppercase transition-colors",
                        checkoutMode === "signin"
                          ? "bg-white text-stone-900 shadow-sm"
                          : "text-stone-400 hover:text-stone-600"
                      )}
                    >
                      <LogIn size={13} />
                      Sign In
                    </button>
                  </div>

                  {checkoutMode === "signin" ? (
                    <div className="border border-stone-200 p-6 text-center space-y-4">
                      <p className="text-sm text-stone-600">
                        Sign in to use saved addresses and view your order history.
                      </p>
                      <Link
                        href="/auth/login?redirect=/checkout"
                        className="inline-block bg-stone-900 text-white text-xs tracking-widests uppercase px-8 py-3.5 hover:bg-stone-700 transition-colors"
                      >
                        Sign In to My Account
                      </Link>
                      <p className="text-xs text-stone-400">
                        No account?{" "}
                        <Link href="/auth/register" className="underline underline-offset-2 hover:text-stone-700">
                          Create one
                        </Link>{" "}
                        — or continue as guest below.
                      </p>
                      <button
                        onClick={() => setCheckoutMode("guest")}
                        className="block w-full text-xs text-stone-400 underline underline-offset-2 hover:text-stone-700 transition-colors mt-1"
                      >
                        Continue as guest instead
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-stone-400 text-center">
                      No account needed — just enter your details below.
                    </p>
                  )}
                </div>
              )}

              {/* Show form in guest mode, or always if logged in */}
              {(checkoutMode === "guest" || currentUser) && (
                <>
                  <div>
                    <h2 className="text-xs tracking-widest uppercase font-medium mb-5">Contact Information</h2>
                    <div className="space-y-4">
                      <div>
                        <input
                          type="email"
                          value={info.email}
                          onChange={(e) => setInfo((f) => ({ ...f, email: e.target.value }))}
                          placeholder="Email address"
                          className={cn(
                            "w-full px-4 py-3 border text-sm focus:outline-none transition-colors",
                            infoErrors.email ? "border-red-400 bg-red-50/30" : "border-stone-200 focus:border-stone-800"
                          )}
                        />
                        {infoErrors.email && <p className="text-xs text-red-500 mt-1">{infoErrors.email}</p>}
                      </div>
                      <label className="flex items-center gap-2 text-xs text-stone-500 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={info.newsletter}
                          onChange={(e) => setInfo((f) => ({ ...f, newsletter: e.target.checked }))}
                          className="accent-stone-900"
                        />
                        Email me with exclusive offers and style news
                      </label>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xs tracking-widests uppercase font-medium mb-4">Shipping Address</h2>
                    <div className="space-y-3">

                      {/* Step A: Country first */}
                      <FSelect
                        label="Country / Region"
                        value={info.country}
                        onChange={(v) => setInfo((f) => ({ ...f, country: v, province: "" }))}
                        options={["Canada", "United States", "United Kingdom", "Australia", "Vietnam", "France", "Germany", "Japan"]}
                        placeholder="Select country"
                        error={infoErrors.country}
                      />

                      {/* Step B: Name — only after country selected */}
                      {info.country && (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <FInput
                              label="First name"
                              value={info.firstName}
                              onChange={(v) => setInfo((f) => ({ ...f, firstName: v }))}
                              error={infoErrors.firstName}
                            />
                            <FInput
                              label="Last name"
                              value={info.lastName}
                              onChange={(v) => setInfo((f) => ({ ...f, lastName: v }))}
                              error={infoErrors.lastName}
                            />
                          </div>

                          {/* Address with search icon */}
                          <FInput
                            label="Address"
                            value={info.address}
                            onChange={(v) => setInfo((f) => ({ ...f, address: v }))}
                            placeholder="Street address, apartment, suite…"
                            error={infoErrors.address}
                            right={<Search size={15} />}
                          />

                          {/* Province/State dropdown (countries that have regions) */}
                          {regionsByCountry[info.country] ? (
                            <FSelect
                              label={regionLabel[info.country] ?? "Province / State"}
                              value={info.province}
                              onChange={(v) => setInfo((f) => ({ ...f, province: v }))}
                              options={regionsByCountry[info.country]}
                              placeholder={`Select ${regionLabel[info.country] ?? "Province"}`}
                              error={infoErrors.province}
                            />
                          ) : (
                            <FInput
                              label="Region / State"
                              value={info.province}
                              onChange={(v) => setInfo((f) => ({ ...f, province: v }))}
                              placeholder="Optional"
                            />
                          )}

                          <div className="grid grid-cols-2 gap-3">
                            <FInput
                              label="City"
                              value={info.city}
                              onChange={(v) => setInfo((f) => ({ ...f, city: v }))}
                              error={infoErrors.city}
                            />
                            <FInput
                              label="Postal / ZIP code"
                              value={info.postal}
                              onChange={(v) => setInfo((f) => ({ ...f, postal: v }))}
                              error={infoErrors.postal}
                            />
                          </div>

                          <FInput
                            label="Phone (optional)"
                            type="tel"
                            value={info.phone}
                            onChange={(v) => setInfo((f) => ({ ...f, phone: v }))}
                          />

                          {currentUser && (
                            <label className="flex items-center gap-2.5 cursor-pointer select-none group pt-1">
                              <input
                                type="checkbox"
                                checked={saveAddress}
                                onChange={(e) => setSaveAddress(e.target.checked)}
                                className="w-4 h-4 accent-stone-900"
                              />
                              <span className="text-xs text-stone-500 group-hover:text-stone-700 transition-colors">
                                Save this address to my account
                              </span>
                            </label>
                          )}
                        </>
                      )}

                      {!info.country && (
                        <p className="text-xs text-stone-400 text-center py-4 border border-dashed border-stone-200 rounded-xl">
                          Please select your country to continue
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => { if (validateInfo()) setStep("payment"); }}
                    className="w-full py-4 bg-stone-900 text-white text-xs tracking-widests uppercase hover:bg-stone-700 transition-colors font-medium"
                  >
                    Continue to Review
                  </button>
                </>
              )}
            </div>
          )}

          {/* ─── Step 2: Review & Pay ─── */}
          {step === "payment" && (
            <div className="space-y-6">
              {/* Order summary row */}
              <div className="bg-stone-50 px-5 py-4 space-y-1.5 text-sm text-stone-500">
                <div className="flex justify-between">
                  <p><span className="text-stone-400 text-xs mr-2">Contact</span>{info.email}</p>
                  <button onClick={() => setStep("information")} className="text-xs underline underline-offset-2 text-stone-400 hover:text-stone-900">Change</button>
                </div>
                <div className="flex justify-between">
                  <p><span className="text-stone-400 text-xs mr-2">Ship to</span>{[info.address, info.city, info.province, info.postal, info.country].filter(Boolean).join(", ")}</p>
                  <button onClick={() => setStep("information")} className="text-xs underline underline-offset-2 text-stone-400 hover:text-stone-900">Change</button>
                </div>
              </div>

              {/* Shopify checkout panel */}
              <div className="border border-stone-200 p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#96BF48]/10 rounded-full flex items-center justify-center shrink-0">
                    <ShoppingBag size={18} className="text-[#96BF48]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">Shopify Secure Checkout</p>
                    <p className="text-xs text-stone-400 mt-0.5">You&apos;ll be redirected to complete payment securely</p>
                  </div>
                </div>

                <p className="text-xs text-stone-500 leading-relaxed">
                  Your order is managed end-to-end by Shopify — including payment processing, shipping dispatch,
                  and tracking updates sent directly to your email.
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-500">
                  {[
                    "Credit / Debit Card",
                    "Apple Pay & Google Pay",
                    "PayPal",
                    "SSL encrypted",
                    "Shopify fulfillment",
                    "Email order tracking",
                  ].map((f) => (
                    <span key={f} className="flex items-center gap-1.5">
                      <Check size={10} className="text-[#96BF48] shrink-0" /> {f}
                    </span>
                  ))}
                </div>

                {shopifyError && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-xs mb-0.5">Checkout unavailable</p>
                      <p className="text-xs">{shopifyError}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("information")}
                  className="flex-1 py-4 border border-stone-200 text-xs tracking-widests uppercase hover:bg-stone-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleShopifyCheckout}
                  disabled={shopifyRedirecting}
                  className="flex-1 py-4 bg-[#96BF48] text-white text-xs tracking-widests uppercase hover:bg-[#7aa33a] transition-colors font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {shopifyRedirecting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Redirecting to Shopify...
                    </>
                  ) : (
                    <>
                      <ExternalLink size={13} />
                      Pay · {formatPrice(orderTotal)}
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-stone-400 text-center flex items-center justify-center gap-1.5">
                <Lock size={10} />
                Secured by Shopify · 256-bit SSL encryption
              </p>
            </div>
          )}
        </div>

        {/* ─── Right: Order Summary ─── */}
        <div className="lg:col-span-2">
          <button
            onClick={() => setSummaryOpen(!summaryOpen)}
            className="lg:hidden w-full flex items-center justify-between p-4 border border-stone-200 mb-4 text-xs tracking-widests uppercase"
          >
            <span className="flex items-center gap-2">
              {summaryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              Order Summary
            </span>
            <span className="font-medium" style={{ fontFamily: "var(--font-cormorant), serif" }}>
              {formatPrice(orderTotal)}
            </span>
          </button>

          <div className={cn("bg-stone-50 p-6 sticky top-24", !summaryOpen && "hidden lg:block")}>
            <h2 className="text-xs tracking-widests uppercase font-medium mb-5 hidden lg:block">Order Summary</h2>

            <div className="divide-y divide-stone-100 mb-5">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-3 py-3">
                  <div className="relative w-14 h-18 bg-stone-100 shrink-0 overflow-hidden">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute -top-1.5 -right-1.5 bg-stone-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 flex justify-between items-start min-w-0">
                    <div className="min-w-0 pr-2">
                      <p className="text-sm line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-stone-400">{item.selectedSize} · {item.selectedColor}</p>
                    </div>
                    <p className="text-sm shrink-0 font-medium">
                      {formatPrice((item.product.salePrice ?? item.product.price) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="mb-5">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Tag size={13} className="text-emerald-600" />
                    <div>
                      <p className="text-xs font-medium text-emerald-700 font-mono">{appliedCoupon.code}</p>
                      <p className="text-[11px] text-emerald-600">{appliedCoupon.label}</p>
                    </div>
                  </div>
                  <button onClick={() => setAppliedCoupon(null)} className="text-stone-400 hover:text-stone-700 text-xs">✕</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    placeholder="Promo code"
                    className={cn(
                      "flex-1 px-3 py-2.5 border text-sm focus:outline-none transition-colors bg-white",
                      couponError ? "border-red-400" : "border-stone-200 focus:border-stone-800"
                    )}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="px-4 py-2.5 border border-stone-900 text-xs tracking-widests uppercase hover:bg-stone-900 hover:text-white transition-colors whitespace-nowrap disabled:opacity-50"
                  >
                    {couponLoading ? <Loader2 size={12} className="animate-spin" /> : "Apply"}
                  </button>
                </div>
              )}
              {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
            </div>

            {/* Totals */}
            <div className="space-y-2.5 text-sm border-t border-stone-200 pt-4">
              <div className="flex justify-between">
                <span className="text-stone-500">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>−{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-500">Shipping</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-emerald-600">Free</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              {subtotal < 200 && (
                <p className="text-xs text-stone-400">
                  Add {formatPrice(200 - subtotal)} more for free standard shipping
                </p>
              )}
              <div className="flex justify-between font-medium text-base pt-3 border-t border-stone-200">
                <span>Total</span>
                <span style={{ fontFamily: "var(--font-cormorant), serif" }} className="text-xl">
                  {formatPrice(orderTotal)}
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-stone-100 flex flex-wrap gap-3 justify-center">
              {["Free Returns", "SSL Secure", "Shopify Verified"].map((t) => (
                <span key={t} className="flex items-center gap-1 text-[10px] text-stone-400 tracking-wide">
                  <Check size={9} className="text-emerald-500" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
