"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronRight, Ruler } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useLocaleStore, formatLocalPrice } from "@/store/localeStore";
import { useTailoredOrderStore } from "@/store/tailoredOrderStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

/* ─── Collection ─── */
const TAILORING_FEE = 10;
const TAILORING_FEE_CAD = 14;

interface MadeToOrderItem {
  id: string;
  name: string;
  category: string;
  price: number;
  priceCAD: number;
  image: string;
  colors: { name: string; hex: string }[];
  description: string;
  leadTime: string;
}

const collection: MadeToOrderItem[] = [
  {
    id: "mto-1",
    name: "Linen Blend Blazer",
    category: "Blazer",
    price: 219,
    priceCAD: 299,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
    colors: [
      { name: "Ivory", hex: "#F5F0E8" },
      { name: "Sage", hex: "#8A9E89" },
      { name: "Black", hex: "#1C1C1C" },
    ],
    description: "A relaxed, fluid blazer in our signature linen blend. Effortlessly elevated for any occasion.",
    leadTime: "3–4 weeks",
  },
  {
    id: "mto-2",
    name: "Draped Midi Dress",
    category: "Dress",
    price: 189,
    priceCAD: 259,
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80",
    colors: [
      { name: "Cream", hex: "#F2EDE4" },
      { name: "Blush", hex: "#D4A5A0" },
      { name: "Midnight", hex: "#2B2D42" },
    ],
    description: "A graceful midi silhouette with fluid drape. Made to fall beautifully on every body.",
    leadTime: "3–4 weeks",
  },
  {
    id: "mto-3",
    name: "Tailored Wide Leg Pant",
    category: "Trousers",
    price: 169,
    priceCAD: 229,
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
    colors: [
      { name: "Sand", hex: "#C8B89A" },
      { name: "Charcoal", hex: "#4A4A4A" },
      { name: "White", hex: "#FAFAF8" },
    ],
    description: "Wide-leg trousers with a structured waistband. Polished, comfortable, and entirely yours.",
    leadTime: "2–3 weeks",
  },
  {
    id: "mto-4",
    name: "Soft Wrap Set",
    category: "Set",
    price: 179,
    priceCAD: 245,
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80",
    colors: [
      { name: "Ecru", hex: "#EDE8DF" },
      { name: "Terracotta", hex: "#C27858" },
      { name: "Slate", hex: "#6E7D8A" },
    ],
    description: "A coordinated wrap top and skirt set. Individually fitted for a seamless, intentional look.",
    leadTime: "4–5 weeks",
  },
  {
    id: "mto-5",
    name: "Structured Column Dress",
    category: "Dress",
    price: 239,
    priceCAD: 325,
    image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80",
    colors: [
      { name: "Black", hex: "#1C1C1C" },
      { name: "Champagne", hex: "#E8D5B0" },
      { name: "Forest", hex: "#3D5C4A" },
    ],
    description: "A sleek column silhouette with architectural precision. Tailored to your exact measurements.",
    leadTime: "4–5 weeks",
  },
  {
    id: "mto-6",
    name: "Satin Slip Skirt",
    category: "Skirt",
    price: 149,
    priceCAD: 199,
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80",
    colors: [
      { name: "Pearl", hex: "#F0EBE3" },
      { name: "Dusty Rose", hex: "#C4A0A0" },
      { name: "Black", hex: "#1C1C1C" },
    ],
    description: "A bias-cut satin skirt that moves with you. Effortlessly elegant in any setting.",
    leadTime: "2–3 weeks",
  },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

/* ─── How It Works ─── */
const steps = [
  { num: "01", title: "Choose Your Design",  desc: "Browse our curated made-to-order styles and select your piece." },
  { num: "02", title: "Select Your Size",    desc: "Choose your standard size — XS through XXL — and your color." },
  { num: "03", title: "We Craft Your Piece", desc: "Your garment is handcrafted by our ateliers over 3–5 weeks." },
  { num: "04", title: "Delivered to You",    desc: "Thoughtfully packaged and shipped directly to your door." },
];

/* ─── FAQ ─── */
const faqs = [
  { title: "Production Timeline",  body: "Made-to-order pieces require 3–5 weeks for production depending on the style. We'll send you a confirmation and tracking update." },
  { title: "Tailoring Fee",        body: "A $10 tailoring fee (USD) applies to all made-to-order pieces to cover the bespoke measurement and fitting process." },
  { title: "Returns & Exchanges",  body: "As each piece is made especially for you, made-to-order items are final sale unless there is a quality defect." },
  { title: "Care Instructions",    body: "Dry clean recommended. Specific care instructions will be included with every order." },
];

function AccordionItem({ title, body }: { title: string; body: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-stone-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="text-sm text-stone-800 tracking-wide">{title}</span>
        <span className="text-stone-400 text-lg leading-none">{open ? "−" : "+"}</span>
      </button>
      {open && <p className="pb-5 text-sm text-stone-500 leading-relaxed pr-8">{body}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════ */
export default function MadeToOrderPage() {
  const [selected, setSelected] = useState<MadeToOrderItem | null>(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const currency = useLocaleStore((s) => s.currency);
  const addTailoredOrder = useTailoredOrderStore((s) => s.addOrder);
  const currentUser = useAuthStore((s) => s.currentUser);

  /* Open panel */
  const openPanel = (item: MadeToOrderItem) => {
    setSelected(item);
    setSelectedColor(item.colors[0].name);
    setSelectedSize("");
    setNotes("");
    setSubmitted(false);
    setSizeError(false);
    document.body.style.overflow = "hidden";
  };

  /* Close panel */
  const closePanel = () => {
    setSelected(null);
    document.body.style.overflow = "";
  };

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closePanel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleAddToBag = () => {
    if (!selected) return;

    if (!selectedSize) {
      setSizeError(true);
      return;
    }

    /* Save to tailored order store (visible in admin) */
    addTailoredOrder({
      type: "made-to-order",
      designId: selected.id,
      designName: selected.name,
      designImage: selected.image,
      designCategory: selected.category,
      color: selectedColor,
      selectedSize,
      basePrice: selected.price,
      basePriceCAD: selected.priceCAD,
      tailoringFee: TAILORING_FEE,
      totalPrice: selected.price + TAILORING_FEE,
      totalPriceCAD: selected.priceCAD + TAILORING_FEE_CAD,
      currency,
      measurements: {},
      notes,
      customerName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "",
      customerEmail: currentUser?.email ?? "",
    });

    /* Build a virtual product for cart */
    const customProduct = {
      id: `${selected.id}-mto-${Date.now()}`,
      name: `${selected.name} · Made to Order`,
      slug: selected.id,
      price: selected.price + TAILORING_FEE,
      priceCAD: selected.priceCAD + TAILORING_FEE_CAD,
      images: [selected.image],
      category: selected.category.toLowerCase(),
      gender: "women" as const,
      sizes: [selectedSize],
      colors: selected.colors.map((c) => ({ ...c, images: [] })),
      description: notes ? `${selected.description}\n\nCustomer notes: ${notes}` : selected.description,
      shortDescription: selected.description,
      featured: false,
      isNew: false,
      isBestSeller: false,
      stock: 1,
      tags: ["made-to-order"],
    };

    addItem(customProduct, selectedSize, selectedColor);
    setSubmitted(true);

    /* Redirect to checkout after brief confirmation */
    setTimeout(() => {
      closePanel();
      router.push("/checkout");
    }, 1200);
  };

  const totalPrice = selected ? selected.price + TAILORING_FEE : 0;
  const totalPriceCAD = selected ? selected.priceCAD + TAILORING_FEE_CAD : 0;

  return (
    <>
      {/* ── 1. HERO ── */}
      <section className="relative h-[90vh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80"
          alt="Made to Order"
          fill priority
          sizes="100vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 h-full flex flex-col justify-end pb-16 px-10 md:px-20">
          <p className="type-label text-white/60 mb-4">Lunelle Atelier</p>
          <h1
            className="text-4xl md:text-6xl text-white mb-5 leading-none"
            style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
          >
            Made to Order
          </h1>
          <p className="text-white/70 text-sm leading-relaxed max-w-sm mb-8">
            Each piece is crafted after purchase, precisely to your measurements.
            No excess, no compromise.
          </p>
          <Link
            href="#collection"
            className="inline-flex items-center gap-2 bg-white text-stone-900 text-[10px] tracking-[0.2em] uppercase px-8 py-4 hover:bg-stone-100 transition-colors w-fit"
          >
            View the Collection <ChevronRight size={12} />
          </Link>
        </div>
      </section>

      {/* ── 2. COLLECTION SHOWCASE ── */}
      <section id="collection" className="py-20 px-4 md:px-10 max-w-screen-xl mx-auto">
        <div className="text-center mb-4">
          <p className="type-label text-stone-400 mb-3">The Made to Order Collection</p>
          <p className="text-sm text-stone-400 max-w-md mx-auto">
            Click any design to begin your custom order
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <span className="inline-flex items-center gap-2 bg-stone-50 border border-stone-200 text-stone-500 text-xs px-4 py-2">
            <Ruler size={12} />
            All styles include a $10 tailoring fee for custom measurements
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
          {collection.map((item) => (
            <div
              key={item.id}
              className="group cursor-pointer"
              onClick={() => openPanel(item)}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 mb-4">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100">
                  <span className="bg-white text-stone-900 text-[10px] tracking-[0.2em] uppercase px-6 py-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    Order This Piece
                  </span>
                </div>
              </div>

              <p className="type-label text-stone-400 mb-1">{item.category}</p>
              <p className="text-sm text-stone-800 mb-1">{item.name}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-stone-500">
                  {formatLocalPrice(item.price + TAILORING_FEE, currency, item.priceCAD + TAILORING_FEE_CAD)}
                </p>
                <span className="text-[10px] text-stone-300 uppercase tracking-wider">{currency}</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">Lead time: {item.leadTime}</p>

              {/* Color dots */}
              <div className="flex gap-1.5 mt-2">
                {item.colors.map((c) => (
                  <span
                    key={c.name}
                    title={c.name}
                    className="w-3 h-3 rounded-full border border-stone-200"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ── */}
      <section className="py-20 border-t border-stone-100 bg-stone-50">
        <div className="max-w-screen-xl mx-auto px-4 md:px-10">
          <p className="type-label text-stone-400 text-center mb-16">How It Works</p>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="flex flex-col items-center gap-3">
                <p className="text-[10px] tracking-[0.15em] text-stone-300 font-light">{num}</p>
                <p className="text-[11px] tracking-[0.15em] uppercase font-medium text-stone-800">{title}</p>
                <p className="text-xs text-stone-500 leading-relaxed max-w-[180px]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. CRAFTSMANSHIP EDITORIAL ── */}
      <section className="grid md:grid-cols-2 border-t border-stone-100">
        <div className="relative aspect-[4/3] md:aspect-auto min-h-[380px] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&q=80"
            alt="Craftsmanship"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center px-10 md:px-16 py-16 bg-stone-50">
          <p className="type-label text-stone-400 mb-5">Craftsmanship</p>
          <h2
            className="text-3xl md:text-4xl mb-6 leading-snug"
            style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
          >
            Crafted with Intention
          </h2>
          <p className="text-sm text-stone-500 leading-relaxed mb-8 max-w-md">
            We focus on timeless silhouettes, thoughtful construction, and carefully
            sourced fabrics chosen for quality, refinement, and longevity.
          </p>
          <Link
            href="/about"
            className="text-[10px] tracking-[0.2em] uppercase border-b border-stone-700 pb-0.5 w-fit text-stone-700 hover:text-stone-400 hover:border-stone-400 transition-colors"
          >
            Our Atelier
          </Link>
        </div>
      </section>

      {/* ── 5. FAQ ── */}
      <section className="py-20 border-t border-stone-100">
        <div className="max-w-2xl mx-auto px-4 md:px-10">
          <p className="type-label text-stone-400 text-center mb-12">Important Information</p>
          {faqs.map((f) => (
            <AccordionItem key={f.title} title={f.title} body={f.body} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ORDER PANEL (slide-in from right)
      ══════════════════════════════════════════ */}
      {/* Backdrop */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          onClick={closePanel}
        />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-[540px] bg-white z-50 shadow-2xl flex flex-col",
          "transition-transform duration-500 ease-[cubic-bezier(0.32,0,0.15,1)]",
          selected ? "translate-x-0" : "translate-x-full"
        )}
      >
        {selected && (
          <>
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 shrink-0">
              <div>
                <p className="type-label text-stone-400">Made to Order</p>
                <h3
                  className="text-xl mt-1 text-stone-900"
                  style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
                >
                  {selected.name}
                </h3>
              </div>
              <button
                onClick={closePanel}
                className="w-9 h-9 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {/* Product preview strip */}
              <div className="flex gap-4 px-6 py-5 bg-stone-50 border-b border-stone-100">
                <div className="relative w-20 h-24 shrink-0 overflow-hidden bg-stone-200">
                  <Image src={selected.image} alt={selected.name} fill sizes="80px" className="object-cover" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="type-label text-stone-400 mb-1">{selected.category}</p>
                  <p className="text-sm text-stone-700 mb-2">{selected.description}</p>
                  <p className="text-[11px] text-stone-400">Lead time: {selected.leadTime}</p>
                </div>
              </div>

              <div className="px-6 py-6 space-y-7">

                {/* Pricing breakdown */}
                <div className="bg-stone-50 border border-stone-100 p-4 space-y-2">
                  <div className="flex justify-between text-sm text-stone-500">
                    <span>Base price</span>
                    <span>{formatLocalPrice(selected.price, currency, selected.priceCAD)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-stone-500">
                    <span>Tailoring fee</span>
                    <span>
                      {formatLocalPrice(TAILORING_FEE, currency, TAILORING_FEE_CAD)}
                    </span>
                  </div>
                  <div className="border-t border-stone-200 pt-2 flex justify-between text-stone-900 font-medium">
                    <span className="text-sm uppercase tracking-wider">Total</span>
                    <div className="text-right">
                      <span
                        className="text-xl"
                        style={{ fontFamily: "var(--font-cormorant), serif" }}
                      >
                        {formatLocalPrice(totalPrice, currency, totalPriceCAD)}
                      </span>
                      <span className="text-xs text-stone-400 ml-1">{currency}</span>
                    </div>
                  </div>
                </div>

                {/* Color selector */}
                <div>
                  <p className="text-xs tracking-widest uppercase mb-3 flex justify-between">
                    <span>Color</span>
                    <span className="text-stone-400 normal-case tracking-normal font-light">{selectedColor}</span>
                  </p>
                  <div className="flex gap-2.5 flex-wrap">
                    {selected.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        title={c.name}
                        className={cn(
                          "w-9 h-9 rounded-full border-2 transition-all",
                          selectedColor === c.name
                            ? "border-stone-900 scale-110 shadow-sm"
                            : "border-stone-200 hover:border-stone-400"
                        )}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>

                {/* Size selector */}
                <div>
                  <p className="text-xs tracking-widest uppercase mb-4 flex items-center justify-between">
                    <span>Select Size</span>
                    {selectedSize && (
                      <span className="text-stone-400 normal-case tracking-normal font-light">{selectedSize}</span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => { setSelectedSize(size); setSizeError(false); }}
                        className={cn(
                          "min-w-[48px] h-11 px-3 border text-sm transition-all",
                          selectedSize === size
                            ? "border-stone-900 bg-stone-900 text-white"
                            : "border-stone-200 text-stone-600 hover:border-stone-800"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {sizeError && (
                    <p className="text-[11px] text-red-500 mt-2">Please select a size to continue</p>
                  )}
                  <p className="text-[11px] text-stone-400 mt-3 leading-relaxed">
                    Each piece is hand-tailored. If you need a different fit, add a note below.
                  </p>
                </div>

                {/* Special requests */}
                <div>
                  <p className="text-xs tracking-widest uppercase mb-3">Special Requests</p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requests, adjustments, or notes for our atelier..."
                    rows={3}
                    className="w-full border border-stone-200 py-3 px-4 text-sm font-light text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-stone-800 transition-colors resize-none"
                  />
                </div>

                {/* Final note */}
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  By placing this order, you acknowledge that made-to-order pieces are final sale.
                  If sizing is a concern, add a note for our atelier — adjustments are included.
                </p>

              </div>
            </div>

            {/* Panel Footer — CTA */}
            <div className="px-6 py-5 border-t border-stone-100 bg-white shrink-0">
              {submitted ? (
                <div className="flex items-center justify-center gap-2 py-4 bg-stone-900 text-white">
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-xs tracking-widest uppercase">Redirecting to Payment…</span>
                </div>
              ) : (
                <button
                  onClick={handleAddToBag}
                  className="w-full py-4 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors"
                >
                  Place Order & Pay
                </button>
              )}
              <p className="text-center text-[10px] text-stone-400 mt-3">
                Total:{" "}
                <strong className="text-stone-700">
                  {formatLocalPrice(totalPrice, currency, totalPriceCAD)} {currency}
                </strong>
                {" · "}Includes {formatLocalPrice(TAILORING_FEE, currency, TAILORING_FEE_CAD)} tailoring fee
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
