"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
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
  CreditCard,
  Building2,
  AlertCircle,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useOrderStore } from "@/store/orderStore";
import { useAuthStore, type Address } from "@/store/authStore";
import { formatPrice, cn } from "@/lib/utils";

const StripePaymentForm = dynamic(
  () => import("@/components/checkout/StripePaymentForm"),
  { ssr: false, loading: () => <PaymentLoader /> }
);
const PayPalCheckout = dynamic(
  () => import("@/components/checkout/PayPalCheckout"),
  { ssr: false, loading: () => <PaymentLoader /> }
);

function PaymentLoader() {
  return (
    <div className="flex items-center justify-center py-12 gap-3 text-stone-400 text-sm">
      <Loader2 size={16} className="animate-spin" />
      Loading payment...
    </div>
  );
}

type Step = "information" | "shipping" | "payment";
type PayMethod = "card" | "paypal" | "bank";

const COUPONS: Record<string, { label: string; type: "percent" | "fixed"; value: number }> = {
  WELCOME10: { label: "10% off your order", type: "percent", value: 10 },
  SUMMER20: { label: "20% off summer styles", type: "percent", value: 20 },
  STYLE15: { label: "15% off everything", type: "percent", value: 15 },
  FREE50: { label: "$50 off orders over $300", type: "fixed", value: 50 },
};

const shippingOptions = [
  { id: "standard", label: "Standard Shipping", sub: "5–7 business days", price: 15 },
  { id: "express", label: "Express Shipping", sub: "2–3 business days", price: 25 },
  { id: "overnight", label: "Overnight", sub: "Next business day", price: 45 },
];

interface InfoForm {
  email: string;
  newsletter: boolean;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postal: string;
  country: string;
  phone: string;
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();
  const { currentUser, addAddress, getAddresses } = useAuthStore();
  const [saveAddress, setSaveAddress] = useState(false);

  const [step, setStep] = useState<Step>("information");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<(typeof COUPONS)[string] & { code: string } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [payMethod, setPayMethod] = useState<PayMethod>("card");
  const [placing, setPlacing] = useState(false);

  // Stripe state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSetupError, setPaymentSetupError] = useState("");

  const [info, setInfo] = useState<InfoForm>({
    email: "",
    newsletter: false,
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postal: "",
    country: "",
    phone: "",
  });
  const [infoErrors, setInfoErrors] = useState<Partial<InfoForm>>({});

  // ─── Calculations ───
  const subtotal = total();
  const shippingCost = subtotal >= 200 ? 0 : (shippingOptions.find((s) => s.id === selectedShipping)?.price ?? 15);
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
    setCouponLoading(true);
    setCouponError("");
    setTimeout(() => {
      const found = COUPONS[code];
      if (found) {
        setAppliedCoupon({ ...found, code });
        setCouponInput("");
      } else {
        setCouponError("Invalid or expired promo code.");
      }
      setCouponLoading(false);
    }, 600);
  };

  // ─── Validate info step ───
  const validateInfo = () => {
    const e: Partial<InfoForm> = {};
    if (!info.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) e.email = "Valid email required";
    if (!info.firstName.trim()) e.firstName = "Required";
    if (!info.lastName.trim()) e.lastName = "Required";
    if (!info.address.trim()) e.address = "Required";
    if (!info.city.trim()) e.city = "Required";
    if (!info.postal.trim()) e.postal = "Required";
    if (!info.country) e.country = "Required";
    setInfoErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Go to payment step — create Stripe PaymentIntent ───
  const handleContinueToPayment = async () => {
    setPaymentSetupError("");
    setPaymentLoading(true);
    setClientSecret(null);

    try {
      const res = await fetch("/api/checkout/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: orderTotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to initialize payment");
      setClientSecret(data.clientSecret ?? null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment setup failed";
      setPaymentSetupError(msg);
    } finally {
      setPaymentLoading(false);
      setStep("payment");
    }
  };

  // ─── Save address if requested ───
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

  // ─── Order success ───
  const handleOrderSuccess = () => {
    maybeSaveAddress();
    const shippingOption = shippingOptions.find((s) => s.id === selectedShipping);
    const orderId = addOrder({
      customer: `${info.firstName} ${info.lastName}`.trim() || "Guest",
      email: info.email,
      phone: info.phone || undefined,
      items: items.map((item) => ({
        name: item.product.name,
        qty: item.quantity,
        price: item.product.salePrice ?? item.product.price,
        size: item.selectedSize,
        color: item.selectedColor,
        image: item.product.images[0],
      })),
      subtotal,
      shippingCost,
      discount: discountAmount,
      total: orderTotal,
      status: "pending",
      payment: payMethod === "bank" ? "pending" : "paid",
      paymentMethod: payMethod,
      shippingMethod: shippingOption?.label ?? "Standard Shipping",
      shippingAddress: `${info.address}, ${info.city}, ${info.postal}, ${info.country}`,
      couponCode: appliedCoupon?.code,
      userId: currentUser?.id,
    });
    setOrderNumber(orderId);
    clearCart();
    setOrderPlaced(true);
  };

  // ─── Bank transfer order ───
  const handleBankOrder = () => {
    setPlacing(true);
    setTimeout(() => {
      handleOrderSuccess();
      setPlacing(false);
    }, 1000);
  };

  // ─── Order Confirmed screen ───
  if (orderPlaced) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="w-20 h-20 border-2 border-stone-900 rounded-full flex items-center justify-center mb-8">
          <Check size={32} />
        </div>
        <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-3">Thank You</p>
        <h1
          className="text-4xl md:text-5xl mb-4"
          style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
        >
          Order Confirmed
        </h1>
        <p className="text-stone-500 mb-1">
          Order <span className="font-medium text-stone-900 font-mono">{orderNumber}</span>
        </p>
        <p className="text-stone-400 text-sm mb-2">
          A confirmation has been sent to <span className="text-stone-700">{info.email || "your email"}</span>
        </p>
        <p className="text-stone-400 text-sm mb-12">
          Estimated delivery: {shippingOptions.find((s) => s.id === selectedShipping)?.sub ?? "5–7 business days"}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/account"
            className="inline-block border border-stone-200 text-xs tracking-widest uppercase px-8 py-4 hover:bg-stone-50 transition-colors"
          >
            Track Order
          </Link>
          <Link
            href="/products"
            className="inline-block bg-stone-900 text-white text-xs tracking-widest uppercase px-10 py-4 hover:bg-stone-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-10">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-10">
        <Link href="/cart" className="flex items-center gap-2 text-xs tracking-widest uppercase text-stone-400 hover:text-stone-900 transition-colors">
          <ArrowLeft size={14} /> Cart
        </Link>
        <Link href="/">
          <span
            className="text-2xl tracking-[0.15em] uppercase"
            style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 400 }}
          >
            TeBoutique
          </span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-stone-400">
          <Lock size={12} /> Secure Checkout
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-10 text-xs tracking-widest uppercase justify-center">
        {(["information", "shipping", "payment"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors",
                  step === s
                    ? "bg-stone-900 text-white"
                    : (step === "shipping" && s === "information") ||
                      (step === "payment" && s !== "payment")
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-400"
                )}
              >
                {(step === "shipping" && s === "information") ||
                (step === "payment" && s !== "payment") ? (
                  <Check size={10} />
                ) : (
                  i + 1
                )}
              </span>
              <span className={cn("hidden sm:block", step === s ? "text-stone-900" : "text-stone-400")}>
                {s}
              </span>
            </div>
            {i < 2 && <span className="text-stone-200">—</span>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-10">
        {/* ─── Left: Form ─── */}
        <div className="lg:col-span-3 space-y-8">

          {/* ─── Step 1: Information ─── */}
          {step === "information" && (
            <div className="space-y-6">
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
                <h2 className="text-xs tracking-widest uppercase font-medium mb-5">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      value={info.firstName}
                      onChange={(e) => setInfo((f) => ({ ...f, firstName: e.target.value }))}
                      placeholder="First name"
                      className={cn(
                        "w-full px-4 py-3 border text-sm focus:outline-none transition-colors",
                        infoErrors.firstName ? "border-red-400" : "border-stone-200 focus:border-stone-800"
                      )}
                    />
                    {infoErrors.firstName && <p className="text-xs text-red-500 mt-1">{infoErrors.firstName}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      value={info.lastName}
                      onChange={(e) => setInfo((f) => ({ ...f, lastName: e.target.value }))}
                      placeholder="Last name"
                      className={cn(
                        "w-full px-4 py-3 border text-sm focus:outline-none transition-colors",
                        infoErrors.lastName ? "border-red-400" : "border-stone-200 focus:border-stone-800"
                      )}
                    />
                    {infoErrors.lastName && <p className="text-xs text-red-500 mt-1">{infoErrors.lastName}</p>}
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={info.address}
                      onChange={(e) => setInfo((f) => ({ ...f, address: e.target.value }))}
                      placeholder="Street address"
                      className={cn(
                        "w-full px-4 py-3 border text-sm focus:outline-none transition-colors",
                        infoErrors.address ? "border-red-400" : "border-stone-200 focus:border-stone-800"
                      )}
                    />
                    {infoErrors.address && <p className="text-xs text-red-500 mt-1">{infoErrors.address}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      value={info.city}
                      onChange={(e) => setInfo((f) => ({ ...f, city: e.target.value }))}
                      placeholder="City"
                      className={cn(
                        "w-full px-4 py-3 border text-sm focus:outline-none transition-colors",
                        infoErrors.city ? "border-red-400" : "border-stone-200 focus:border-stone-800"
                      )}
                    />
                    {infoErrors.city && <p className="text-xs text-red-500 mt-1">{infoErrors.city}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      value={info.postal}
                      onChange={(e) => setInfo((f) => ({ ...f, postal: e.target.value }))}
                      placeholder="Postal code"
                      className={cn(
                        "w-full px-4 py-3 border text-sm focus:outline-none transition-colors",
                        infoErrors.postal ? "border-red-400" : "border-stone-200 focus:border-stone-800"
                      )}
                    />
                    {infoErrors.postal && <p className="text-xs text-red-500 mt-1">{infoErrors.postal}</p>}
                  </div>
                  <div className="col-span-2 relative">
                    <select
                      value={info.country}
                      onChange={(e) => setInfo((f) => ({ ...f, country: e.target.value }))}
                      className={cn(
                        "w-full px-4 py-3 border text-sm focus:outline-none transition-colors appearance-none bg-white",
                        infoErrors.country ? "border-red-400" : "border-stone-200 focus:border-stone-800"
                      )}
                    >
                      <option value="">Select country</option>
                      {["United States", "Canada", "United Kingdom", "Australia", "Vietnam", "France", "Germany", "Japan"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                    {infoErrors.country && <p className="text-xs text-red-500 mt-1">{infoErrors.country}</p>}
                  </div>
                  <div className="col-span-2">
                    <input
                      type="tel"
                      value={info.phone}
                      onChange={(e) => setInfo((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="Phone number (optional)"
                      className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
                    />
                  </div>

                  {currentUser && (
                    <div className="col-span-2">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none group">
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
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => { if (validateInfo()) setStep("shipping"); }}
                className="w-full py-4 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors font-medium"
              >
                Continue to Shipping
              </button>
            </div>
          )}

          {/* ─── Step 2: Shipping ─── */}
          {step === "shipping" && (
            <div className="space-y-6">
              <div className="bg-stone-50 px-5 py-4 flex items-center justify-between text-sm">
                <div className="space-y-1 text-stone-500">
                  <p><span className="text-stone-400 text-xs mr-2">Contact</span>{info.email}</p>
                  <p><span className="text-stone-400 text-xs mr-2">Ship to</span>{info.address}, {info.city}</p>
                </div>
                <button
                  onClick={() => setStep("information")}
                  className="text-xs underline underline-offset-2 text-stone-400 hover:text-stone-900 transition-colors"
                >
                  Change
                </button>
              </div>

              <div>
                <h2 className="text-xs tracking-widest uppercase font-medium mb-5">Shipping Method</h2>
                <div className="space-y-3">
                  {shippingOptions.map((opt) => {
                    const isFree = subtotal >= 200 && opt.id === "standard";
                    return (
                      <label
                        key={opt.id}
                        className={cn(
                          "flex items-center justify-between p-4 border cursor-pointer transition-colors",
                          selectedShipping === opt.id
                            ? "border-stone-900 bg-stone-50"
                            : "border-stone-200 hover:border-stone-400"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                            selectedShipping === opt.id ? "border-stone-900" : "border-stone-300"
                          )}>
                            {selectedShipping === opt.id && (
                              <div className="w-2 h-2 rounded-full bg-stone-900" />
                            )}
                          </div>
                          <input
                            type="radio"
                            name="shipping"
                            value={opt.id}
                            checked={selectedShipping === opt.id}
                            onChange={() => setSelectedShipping(opt.id)}
                            className="sr-only"
                          />
                          <div>
                            <p className="text-sm font-medium">{opt.label}</p>
                            <p className="text-xs text-stone-400">{opt.sub}</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium">
                          {isFree ? (
                            <span className="text-emerald-600">Free</span>
                          ) : (
                            formatPrice(opt.price)
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep("information")}
                  className="flex-1 py-4 border border-stone-200 text-xs tracking-widest uppercase hover:bg-stone-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleContinueToPayment}
                  disabled={paymentLoading}
                  className="flex-1 py-4 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    "Continue to Payment"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 3: Payment ─── */}
          {step === "payment" && (
            <div className="space-y-6">
              <div className="bg-stone-50 px-5 py-4 space-y-1 text-sm text-stone-500">
                <div className="flex justify-between">
                  <p><span className="text-stone-400 text-xs mr-2">Contact</span>{info.email}</p>
                  <button onClick={() => setStep("information")} className="text-xs underline underline-offset-2 text-stone-400 hover:text-stone-900">Change</button>
                </div>
                <div className="flex justify-between">
                  <p><span className="text-stone-400 text-xs mr-2">Ship to</span>{info.address}, {info.city}</p>
                  <button onClick={() => { setStep("shipping"); setClientSecret(null); }} className="text-xs underline underline-offset-2 text-stone-400 hover:text-stone-900">Change</button>
                </div>
                <p>
                  <span className="text-stone-400 text-xs mr-2">Method</span>
                  {shippingOptions.find((s) => s.id === selectedShipping)?.label}
                  {" · "}
                  {subtotal >= 200 && selectedShipping === "standard"
                    ? "Free"
                    : formatPrice(shippingOptions.find((s) => s.id === selectedShipping)?.price ?? 0)}
                </p>
              </div>

              {/* Payment method selector */}
              <div>
                <h2 className="text-xs tracking-widest uppercase font-medium mb-4">Payment Method</h2>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {([
                    { id: "card" as PayMethod, label: "Credit Card", icon: CreditCard },
                    { id: "paypal" as PayMethod, label: "PayPal", icon: Building2 },
                    { id: "bank" as PayMethod, label: "Bank Transfer", icon: Building2 },
                  ]).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setPayMethod(id)}
                      className={cn(
                        "flex flex-col items-center gap-2 py-4 border text-xs tracking-wide uppercase transition-all",
                        payMethod === id
                          ? "border-stone-900 bg-stone-900 text-white"
                          : "border-stone-200 text-stone-500 hover:border-stone-400"
                      )}
                    >
                      <Icon size={18} />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Stripe error / setup error */}
                {paymentSetupError && payMethod === "card" && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 mb-4 text-sm">
                    <AlertCircle size={14} className="shrink-0" />
                    {paymentSetupError}
                    <span className="ml-1 text-xs">
                      (Add <span className="font-mono">STRIPE_SECRET_KEY</span> to .env.local)
                    </span>
                  </div>
                )}

                {/* ── Stripe Card ── */}
                {payMethod === "card" && (
                  clientSecret ? (
                    <StripePaymentForm
                      clientSecret={clientSecret}
                      amount={orderTotal}
                      onSuccess={handleOrderSuccess}
                      onBack={() => { setStep("shipping"); setClientSecret(null); }}
                    />
                  ) : paymentLoading ? (
                    <PaymentLoader />
                  ) : (
                    /* Fallback: Stripe not configured — show manual card note */
                    <div className="space-y-4">
                      <div className="border border-amber-200 bg-amber-50 p-5 text-center">
                        <p className="text-sm text-amber-700 font-medium mb-1">Stripe not configured</p>
                        <p className="text-xs text-amber-600">
                          Add <span className="font-mono">STRIPE_SECRET_KEY</span> and{" "}
                          <span className="font-mono">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</span> to{" "}
                          <span className="font-mono">.env.local</span> to accept card payments.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => { setStep("shipping"); setClientSecret(null); }}
                          className="flex-1 py-4 border border-stone-200 text-xs tracking-widest uppercase hover:bg-stone-50 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          disabled
                          className="flex-1 py-4 bg-stone-300 text-white text-xs tracking-widest uppercase cursor-not-allowed"
                        >
                          Pay · {formatPrice(orderTotal)}
                        </button>
                      </div>
                    </div>
                  )
                )}

                {/* ── PayPal ── */}
                {payMethod === "paypal" && (
                  <PayPalCheckout
                    amount={orderTotal}
                    onSuccess={handleOrderSuccess}
                    onBack={() => { setStep("shipping"); setClientSecret(null); }}
                  />
                )}

                {/* ── Bank Transfer ── */}
                {payMethod === "bank" && (
                  <div className="space-y-6">
                    <div className="border border-stone-200 p-5 space-y-3 text-sm text-stone-600">
                      <p className="text-xs tracking-widest uppercase text-stone-400 mb-4">Bank Transfer Details</p>
                      {[
                        { label: "Bank", value: "CIBC — Commerce Bank" },
                        { label: "Account Name", value: "TeBoutique Inc." },
                        { label: "Account Number", value: "1234 5678 9012" },
                        { label: "Routing Number", value: "021 000 089" },
                        { label: "Reference", value: `ORDER-${Date.now().toString().slice(-6)}` },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between border-b border-stone-100 pb-2">
                          <span className="text-stone-400 text-xs">{label}</span>
                          <span className="font-mono text-xs">{value}</span>
                        </div>
                      ))}
                      <p className="text-xs text-stone-400 pt-2">
                        Your order will be confirmed within 1–2 business days upon receipt of payment.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setStep("shipping"); setClientSecret(null); }}
                        className="flex-1 py-4 border border-stone-200 text-xs tracking-widest uppercase hover:bg-stone-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleBankOrder}
                        disabled={placing}
                        className="flex-1 py-4 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors font-medium disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {placing ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Processing...
                          </>
                        ) : (
                          `Place Order · ${formatPrice(orderTotal)}`
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-stone-400 text-center flex items-center justify-center gap-1">
                      <Lock size={10} /> 256-bit SSL encryption · Your payment is secure
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ─── Right: Order Summary ─── */}
        <div className="lg:col-span-2">
          <button
            onClick={() => setSummaryOpen(!summaryOpen)}
            className="lg:hidden w-full flex items-center justify-between p-4 border border-stone-200 mb-4 text-xs tracking-widest uppercase"
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
            <h2 className="text-xs tracking-widest uppercase font-medium mb-5 hidden lg:block">Order Summary</h2>

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
                    className="px-4 py-2.5 border border-stone-900 text-xs tracking-widest uppercase hover:bg-stone-900 hover:text-white transition-colors whitespace-nowrap disabled:opacity-50"
                  >
                    {couponLoading ? <Loader2 size={12} className="animate-spin" /> : "Apply"}
                  </button>
                </div>
              )}
              {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
              <p className="text-[11px] text-stone-400 mt-1">Try: WELCOME10, SUMMER20, STYLE15</p>
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
              {["Free Returns", "SSL Secure", "Authenticity Guaranteed"].map((t) => (
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
