"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useRef } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useTailoredOrderStore } from "@/store/tailoredOrderStore";
import { useAuthStore } from "@/store/authStore";
import { useProductStore } from "@/store/productStore";
import { tailoredImageByKey, useTailoredContentStore } from "@/store/tailoredContentStore";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

/* ─── Products available for custom fit ─── */
interface CFProduct {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
}

const fallbackProducts: CFProduct[] = [
  {
    id: "cf-1",
    name: "Linen Blend Blazer",
    category: "Blazer",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
    description: "A relaxed, fluid blazer in our signature linen blend.",
  },
  {
    id: "cf-2",
    name: "Draped Midi Dress",
    category: "Dress",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80",
    description: "A graceful midi silhouette with fluid drape.",
  },
  {
    id: "cf-3",
    name: "Tailored Wide Leg Pant",
    category: "Trousers",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
    description: "Wide-leg trousers with a structured waistband.",
  },
  {
    id: "cf-4",
    name: "Soft Wrap Set",
    category: "Set",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80",
    description: "A coordinated wrap top and skirt set.",
  },
  {
    id: "cf-5",
    name: "Structured Column Dress",
    category: "Dress",
    image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80",
    description: "A sleek column silhouette with architectural precision.",
  },
  {
    id: "cf-6",
    name: "Satin Slip Skirt",
    category: "Skirt",
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80",
    description: "A bias-cut satin skirt that moves with you.",
  },
];

function productToCustomFitProduct(product: Product): CFProduct {
  return {
    id: product.id,
    name: product.name,
    category: product.subcategory ?? product.category,
    image: product.images[0] ?? fallbackProducts[0].image,
    description: product.shortDescription || product.description,
  };
}

/* ─── How It Works ─── */
const steps = [
  { num: "01", title: "Choose Your Design",       desc: "Select the Lunelle silhouette you'd like us to fit to you." },
  { num: "02", title: "Submit Your Measurements", desc: "Provide your precise measurements through our detailed form." },
  { num: "03", title: "Personalized Production",  desc: "We review your measurements and craft the piece with exact adjustments." },
];

/* ─── Timeline info ─── */
const timeline = [
  {
    title: "Production Time",
    desc: "3–4 weeks. Each piece is crafted with care and attention to your measurements.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8 text-stone-400 mx-auto mb-4">
        <circle cx="16" cy="16" r="13" /><path d="M16 9 L16 16 L21 20" />
      </svg>
    ),
  },
  {
    title: "Pricing",
    desc: "Customized pieces are priced separately. We will contact you with a final quote.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8 text-stone-400 mx-auto mb-4">
        <circle cx="16" cy="16" r="13" />
        <path d="M12 20 C12 20 13 22 16 22 C19 22 20 20.5 20 19 C20 17 18 16 16 15.5 C14 15 12 14 12 12 C12 10 13.5 9 16 9 C18.5 9 20 10.5 20 12" />
        <line x1="16" y1="8" x2="16" y2="24" />
      </svg>
    ),
  },
  {
    title: "Communication",
    desc: "We will confirm all details and keep you updated throughout the process.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8 text-stone-400 mx-auto mb-4">
        <circle cx="16" cy="16" r="13" />
        <path d="M10 12 Q10 10 12 10 L22 10 Q24 10 24 12 L24 19 Q24 21 22 21 L14 21 L10 24 L10 12Z" />
      </svg>
    ),
  },
];

const inputCls =
  "w-full border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 transition-colors";

/* ══════════════════════════════════════════ */
export default function CustomizedFitPage() {
  const storeProducts = useProductStore((s) => s.products);
  const products = storeProducts.length > 0
    ? storeProducts.map(productToCustomFitProduct)
    : fallbackProducts;
  const collectionImages = useMemo(
    () => products.map((product) => product.image).filter(Boolean),
    [products]
  );
  const sideImageIndex = useMemo(
    () => (collectionImages.length > 0 ? Math.floor(collectionImages.length / 2) : 0),
    [collectionImages.length]
  );
  const [selectedProduct, setSelectedProduct] = useState<CFProduct | null>(null);
  const [form, setForm] = useState({
    fullName: "", height: "", bust: "", waist: "",
    hips: "", shoulderWidth: "", inseam: "", sleeve: "",
    preferredFit: "", notes: "",
  });
  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const addTailoredOrder = useTailoredOrderStore((s) => s.addOrder);
  const currentUser = useAuthStore((s) => s.currentUser);
  const tailoredImages = useTailoredContentStore((s) => s.images);
  const setTailoredImages = useTailoredContentStore((s) => s.setImages);
  const heroImage = tailoredImageByKey(tailoredImages, "customizedFitHero");
  const randomCollectionImage =
    collectionImages[sideImageIndex] ?? fallbackProducts[0].image;

  useEffect(() => {
    const controller = new AbortController();

    Promise.resolve(useTailoredContentStore.persist.rehydrate())
      .then(() => fetch("/api/tailored", { cache: "no-store", signal: controller.signal }))
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        if (Array.isArray(data.images)) setTailoredImages(data.images);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.warn("[CustomizedFitPage] Failed to load tailored settings", err);
      });

    return () => controller.abort();
  }, [setTailoredImages]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSelectProduct = (p: CFProduct) => {
    setSelectedProduct(p);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTailoredOrder({
      type: "customized-fit",
      designId: selectedProduct?.id ?? "cf-custom",
      designName: selectedProduct?.name ?? "Custom Piece",
      designImage: selectedProduct?.image ?? "",
      designCategory: selectedProduct?.category ?? "Custom",
      color: "",
      basePrice: 0,
      basePriceCAD: 0,
      tailoringFee: 0,
      totalPrice: 0,
      totalPriceCAD: 0,
      currency: "USD",
      measurements: {
        bust: form.bust,
        waist: form.waist,
        hips: form.hips,
        shoulder: form.shoulderWidth,
        sleeve: form.sleeve,
        length: form.inseam,
        height: form.height,
      },
      notes: form.notes,
      customerName: currentUser
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : form.fullName,
      customerEmail: currentUser?.email ?? "",
    });
    setSubmitted(true);
  };

  return (
    <>
      {/* ── 1. HERO ── */}
      <section className="relative h-[90svh] min-h-[640px] overflow-hidden bg-stone-900">
        <Image
          src={heroImage.image}
          alt=""
          fill
          sizes="100vw"
          aria-hidden="true"
          className="scale-110 object-cover opacity-55 blur-2xl"
          style={{ objectPosition: heroImage.imagePosition }}
        />
        <Image
          src={heroImage.image}
          alt="Customized Fit"
          fill priority
          sizes="100vw"
          className="object-contain object-center p-4 md:object-right md:p-10"
          style={{ objectPosition: heroImage.imagePosition }}
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
        <div className="relative z-[1] h-full flex flex-col justify-end pb-16 px-8 md:px-20">
          <p className="text-white/75 text-[10px] tracking-[0.2em] uppercase mb-4">Lunelle Atelier</p>
          <h1 className="text-4xl md:text-5xl text-white mb-5 leading-none font-light drop-shadow-sm">
            Customized Fit
          </h1>
          <p className="text-white/85 text-sm leading-relaxed max-w-sm mb-8 drop-shadow-sm">
            Designed around you: your proportions, preferences, and the way you want to feel in your clothing.
          </p>
          <a
            href="#products"
            className="inline-flex items-center gap-2 bg-white text-stone-900 text-[10px] tracking-[0.2em] uppercase px-8 py-4 hover:bg-stone-100 transition-colors w-fit"
          >
            Choose Your Design <ChevronDown size={12} />
          </a>
        </div>
      </section>

      {/* ── 2. HOW IT WORKS ── */}
      <section className="py-20 border-t border-stone-100">
        <div className="max-w-screen-xl mx-auto px-4 md:px-10">
          <p className="text-[9px] tracking-[0.25em] uppercase text-stone-400 text-center mb-16">
            How It Works
          </p>
          <div className="grid md:grid-cols-3 gap-10 text-center">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="flex flex-col items-center gap-3">
                <p className="text-[10px] tracking-[0.15em] text-stone-300 font-light">{num}</p>
                <p className="text-[11px] tracking-[0.15em] uppercase font-medium text-stone-800">{title}</p>
                <p className="text-xs text-stone-500 leading-relaxed max-w-[200px]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. PRODUCT SELECTION ── */}
      <section id="products" className="py-16 border-t border-stone-100 bg-stone-50">
        <div className="max-w-screen-xl mx-auto px-4 md:px-10">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-[9px] tracking-[0.25em] uppercase text-stone-400 mb-2">Step 1</p>
              <h2 className="text-xl font-light text-stone-900">Choose Your Design</h2>
            </div>
            {selectedProduct && (
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Check size={13} className="text-stone-700" />
                <span className="font-medium text-stone-700">{selectedProduct.name}</span>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-stone-300 hover:text-stone-600 underline ml-1 transition-colors"
                >
                  change
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6 md:gap-x-6 md:gap-y-8">
            {products.map((p) => {
              const isSelected = selectedProduct?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectProduct(p)}
                  className={cn(
                    "group cursor-pointer",
                    isSelected && "ring-1 ring-stone-900"
                  )}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 mb-3">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-stone-900/20 flex items-center justify-center">
                        <span className="bg-stone-900 text-white text-[9px] tracking-widest uppercase px-4 py-2 flex items-center gap-1.5">
                          <Check size={10} /> Selected
                        </span>
                      </div>
                    )}
                    {!isSelected && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 flex items-end justify-center pb-5 opacity-0 group-hover:opacity-100">
                        <span className="bg-white text-stone-900 text-[9px] tracking-widest uppercase px-5 py-2.5 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                          Select This Piece
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] tracking-widest uppercase text-stone-400 mb-0.5">{p.category}</p>
                  <p className="text-sm font-light text-stone-800">{p.name}</p>
                </div>
              );
            })}
          </div>

          {!selectedProduct && (
            <p className="text-center text-xs text-stone-400 mt-8">
              Select a design above to proceed to measurements
            </p>
          )}
        </div>
      </section>

      {/* ── 4. MEASUREMENT FORM ── */}
      <div ref={formRef}>
        <section
          id="form"
          className={cn(
            "border-t border-stone-100 transition-opacity duration-500",
            selectedProduct ? "opacity-100" : "opacity-40 pointer-events-none select-none"
          )}
        >
          <div className="max-w-screen-xl mx-auto px-4 md:px-10">
            <div className="grid md:grid-cols-2 gap-0">

              {/* Form */}
              <div className="py-16 md:pr-16">
                <p className="text-[9px] tracking-[0.25em] uppercase text-stone-400 mb-2">Step 2</p>
                <h2 className="text-xl font-light text-stone-900 mb-10">
                  {selectedProduct
                    ? `Your Measurements for ${selectedProduct.name}`
                    : "Your Measurements"}
                </h2>

                {submitted ? (
                  <div className="py-16 text-center border border-stone-200">
                    <div className="w-10 h-px bg-stone-300 mx-auto mb-8" />
                    <h3 className="text-2xl font-light mb-4 text-stone-800">Request Received</h3>
                    <p className="text-sm text-stone-400 leading-relaxed max-w-xs mx-auto">
                      Thank you. We will review your measurements and be in touch within 2–3 business days
                      to confirm your order.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Full Name */}
                    {!currentUser && (
                      <div>
                        <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-1.5">Full Name</label>
                        <input value={form.fullName} onChange={set("fullName")} placeholder="Your Name" required className={inputCls} />
                      </div>
                    )}

                    {/* Height */}
                    <div>
                      <label className="block text-[10px] tracking-widests uppercase text-stone-400 mb-1.5">
                        Total Height <span className="text-stone-400 normal-case tracking-normal">*</span>
                      </label>
                      <div className="relative">
                        <input value={form.height} onChange={set("height")} placeholder="e.g. 165" required className={inputCls + " pr-10"} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">cm</span>
                      </div>
                    </div>

                    {/* Bust + Waist */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] tracking-widests uppercase text-stone-400 mb-1.5">
                          Bust / Chest <span className="text-stone-400">*</span>
                        </label>
                        <div className="relative">
                          <input value={form.bust} onChange={set("bust")} placeholder="e.g. 88" required className={inputCls + " pr-10"} />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">cm</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-widests uppercase text-stone-400 mb-1.5">
                          Waist <span className="text-stone-400">*</span>
                        </label>
                        <div className="relative">
                          <input value={form.waist} onChange={set("waist")} placeholder="e.g. 68" required className={inputCls + " pr-10"} />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">cm</span>
                        </div>
                      </div>
                    </div>

                    {/* Hips + Shoulder */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] tracking-widests uppercase text-stone-400 mb-1.5">
                          Hips <span className="text-stone-400">*</span>
                        </label>
                        <div className="relative">
                          <input value={form.hips} onChange={set("hips")} placeholder="e.g. 95" required className={inputCls + " pr-10"} />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">cm</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-widests uppercase text-stone-400 mb-1.5">Shoulder Width</label>
                        <div className="relative">
                          <input value={form.shoulderWidth} onChange={set("shoulderWidth")} placeholder="e.g. 38" className={inputCls + " pr-10"} />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">cm</span>
                        </div>
                      </div>
                    </div>

                    {/* Inseam + Sleeve */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] tracking-widests uppercase text-stone-400 mb-1.5">Inseam / Body Length</label>
                        <div className="relative">
                          <input value={form.inseam} onChange={set("inseam")} placeholder="e.g. 110" className={inputCls + " pr-10"} />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">cm</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-widests uppercase text-stone-400 mb-1.5">Sleeve Length</label>
                        <div className="relative">
                          <input value={form.sleeve} onChange={set("sleeve")} placeholder="e.g. 60" className={inputCls + " pr-10"} />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">cm</span>
                        </div>
                      </div>
                    </div>

                    {/* Preferred Fit */}
                    <div>
                      <label className="block text-[10px] tracking-widests uppercase text-stone-400 mb-1.5">Preferred Fit</label>
                      <div className="relative">
                        <select value={form.preferredFit} onChange={set("preferredFit")} className={inputCls + " appearance-none pr-8 bg-white"}>
                          <option value="">Select an option</option>
                          <option value="slim">Slim — a close fit</option>
                          <option value="regular">Regular — a comfortable fit</option>
                          <option value="relaxed">Relaxed — an easy fit</option>
                          <option value="oversized">Oversized — a generous fit</option>
                        </select>
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" viewBox="0 0 10 6" width="10" fill="none" stroke="currentColor" strokeWidth="1.2">
                          <path d="M1 1L5 5L9 1" />
                        </svg>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-[10px] tracking-widests uppercase text-stone-400 mb-1.5">Notes / Special Requests</label>
                      <textarea
                        value={form.notes} onChange={set("notes")}
                        placeholder="Tell us more about your preferences, fit concerns, or any special adjustments..."
                        rows={3}
                        className="w-full border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 transition-colors resize-none"
                      />
                    </div>

                    {/* Upload */}
                    <div>
                      <label className="block text-[10px] tracking-widests uppercase text-stone-400 mb-1.5">Inspiration Image (Optional)</label>
                      <label className="flex items-center justify-center border border-stone-200 py-3 cursor-pointer hover:bg-stone-50 transition-colors">
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
                        <span className="text-[10px] tracking-[0.2em] uppercase text-stone-400">{fileName || "Upload Image"}</span>
                      </label>
                    </div>

                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Fields marked with <span className="text-stone-700">*</span> are required. All measurements in centimeters.
                    </p>

                    <button
                      type="submit"
                      disabled={!selectedProduct}
                      className="w-full bg-stone-900 text-white text-[10px] tracking-[0.2em] uppercase py-4 hover:bg-stone-700 transition-colors mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Submit Request
                    </button>
                  </form>
                )}
              </div>

              {/* Side image / selected product */}
              <div className="relative hidden md:block min-h-[600px]">
                <Image
                  src={
                    selectedProduct?.image ??
                    randomCollectionImage
                  }
                  alt={selectedProduct?.name ?? "Customized fit"}
                  fill
                  sizes="50vw"
                  className="object-cover transition-all duration-700"
                />
                {selectedProduct && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-900/70 to-transparent p-8">
                    <p className="text-[9px] tracking-widests uppercase text-white/60 mb-1">{selectedProduct.category}</p>
                    <p className="text-white text-base font-light">{selectedProduct.name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── 5. TIMELINE & INFORMATION ── */}
      <section className="py-20 bg-stone-50 border-t border-stone-100">
        <div className="max-w-screen-xl mx-auto px-4 md:px-10">
          <p className="text-[9px] tracking-[0.25em] uppercase text-stone-500 text-center mb-16">
            Timeline &amp; Information
          </p>
          <div className="grid md:grid-cols-3 gap-10 text-center">
            {timeline.map(({ icon, title, desc }) => (
              <div key={title}>
                {icon}
                <p className="text-[11px] tracking-[0.15em] uppercase font-medium text-stone-800 mb-3">{title}</p>
                <p className="text-xs text-stone-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. CLOSING ── */}
      <section className="relative py-28 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&q=80"
          alt="Closing"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-stone-900/55" />
        <div className="relative z-10 max-w-2xl mx-auto text-center px-6">
          <p className="text-white/90 text-2xl md:text-3xl leading-relaxed font-light italic">
            Each piece is created with intention —<br />
            designed to feel personal, refined,<br />
            and naturally yours.
          </p>
        </div>
      </section>
    </>
  );
}
