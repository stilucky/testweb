"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

/* ─── Collection ─── */
const collection = [
  { name: "Linen Blend Blazer",    price: "$219.00", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80" },
  { name: "Draped Midi Dress",     price: "$189.00", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80" },
  { name: "Tailored Wide Leg Pant",price: "$169.00", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80" },
  { name: "Soft Wrap Set",         price: "$179.00", image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80" },
];

/* ─── How It Works icons ─── */
function IconOrder() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-12 h-12 text-stone-500">
      <circle cx="24" cy="24" r="23" />
      <path d="M24 16 C20 16 16 19 16 23 L16 32 L32 32 L32 23 C32 19 28 16 24 16Z" />
      <line x1="20" y1="32" x2="20" y2="35" />
      <line x1="28" y1="32" x2="28" y2="35" />
      <path d="M21 16 L21 13 Q24 11 27 13 L27 16" />
    </svg>
  );
}
function IconCraft() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-12 h-12 text-stone-500">
      <circle cx="24" cy="24" r="23" />
      <path d="M16 32 L24 16 L32 32" />
      <line x1="18" y1="27" x2="30" y2="27" />
      <circle cx="24" cy="24" r="2" />
    </svg>
  );
}
function IconDeliver() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-12 h-12 text-stone-500">
      <circle cx="24" cy="24" r="23" />
      <rect x="13" y="18" width="22" height="15" rx="1" />
      <path d="M13 24 L35 24" />
      <path d="M19 18 L19 14 L29 14 L29 18" />
    </svg>
  );
}

const steps = [
  { Icon: IconOrder,   num: "01", title: "PLACE YOUR ORDER",       desc: "Choose your piece and preferred size." },
  { Icon: IconCraft,   num: "02", title: "CRAFTED FOR YOU",        desc: "Your garment is produced after you place it through expertise." },
  { Icon: IconDeliver, num: "03", title: "DELIVERED THOUGHTFULLY", desc: "Once complete, your piece is carefully packaged and shipped to you." },
];

/* ─── FAQ Accordion ─── */
const faqs = [
  { title: "Production Timeline",   body: "Made-to-order pieces require 3–4 weeks for production. Each garment is crafted with care and attention to quality." },
  { title: "Shipping",              body: "Complimentary shipping on all made-to-order pieces. Orders are shipped via tracked courier." },
  { title: "Returns & Exchanges",   body: "As each piece is made especially for you, made-to-order items are final sale unless there is a quality defect." },
  { title: "Care Instructions",     body: "Dry clean recommended. Specific care instructions will be included with every order." },
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
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 h-full flex flex-col justify-end pb-16 px-10 md:px-20">
          <h1
            className="text-3xl md:text-4xl text-white mb-5 leading-none"
            style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
          >
            Made to Order
          </h1>
          <p className="text-white/75 text-sm leading-relaxed max-w-sm mb-8">
            Thoughtfully produced after purchase in limited quantities.
            Each piece is crafted with intention and care.
          </p>
          <Link
            href="#collection"
            className="inline-block bg-stone-900 text-white text-[10px] tracking-[0.2em] uppercase px-8 py-4 hover:bg-stone-700 transition-colors w-fit"
          >
            View the Collection
          </Link>
        </div>
      </section>

      {/* ── 2. COLLECTION SHOWCASE ── */}
      <section id="collection" className="py-20 px-4 md:px-10 max-w-screen-xl mx-auto">
        <p className="text-[11px] tracking-[0.3em] uppercase text-stone-500 text-center mb-12">
          The Made to Order Collection
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {collection.map((item) => (
            <div key={item.name} className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 mb-3">
                <Image
                  src={item.image} alt={item.name} fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <p className="text-xs text-stone-700 mb-1">{item.name}</p>
              <p className="text-xs text-stone-400">{item.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ── */}
      <section className="py-20 border-t border-stone-100">
        <div className="max-w-screen-xl mx-auto px-4 md:px-10">
          <p className="text-[11px] tracking-[0.3em] uppercase text-stone-500 text-center mb-16">
            How It Works
          </p>
          <div className="grid md:grid-cols-3 gap-10 text-center">
            {steps.map(({ Icon, num, title, desc }) => (
              <div key={num} className="flex flex-col items-center gap-4">
                <Icon />
                <p className="text-[10px] tracking-[0.15em] text-stone-400">{num}</p>
                <p className="text-[11px] tracking-[0.15em] uppercase font-medium text-stone-800">{title}</p>
                <p className="text-xs text-stone-500 leading-relaxed max-w-[200px]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. CRAFTSMANSHIP ── */}
      <section className="grid md:grid-cols-2 border-t border-stone-100">
        {/* image left */}
        <div className="relative aspect-[4/3] md:aspect-auto min-h-[380px] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&q=80"
            alt="Craftsmanship"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        {/* text right */}
        <div className="flex flex-col justify-center px-10 md:px-16 py-16 bg-stone-50">
          <p className="text-[10px] tracking-[0.3em] uppercase text-stone-400 mb-5">Craftsmanship</p>
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
            Learn More
          </Link>
        </div>
      </section>

      {/* ── 6. IMPORTANT INFO ── */}
      <section className="py-20 border-t border-stone-100">
        <div className="max-w-2xl mx-auto px-4 md:px-10">
          {faqs.map((f) => (
            <AccordionItem key={f.title} title={f.title} body={f.body} />
          ))}
        </div>
      </section>
    </>
  );
}
