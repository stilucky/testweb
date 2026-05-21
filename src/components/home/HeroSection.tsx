"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=85",
    tag: "New Collection",
    title: "Solstice\nFever",
    subtitle: "Ethereal pieces for every occasion",
    cta: "Explore Collection",
    href: "/products?filter=new",
    align: "center",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1600&q=85",
    tag: "Occasion Wear",
    title: "Dressed\nFor Every\nMoment",
    subtitle: "From pre-wedding to gala nights",
    cta: "Shop Occasions",
    href: "/products?filter=occasion",
    align: "left",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1519657337289-077653f724ed?w=1600&q=85",
    tag: "Best Sellers",
    title: "Timeless\nElegance",
    subtitle: "Our most-loved pieces, reimagined",
    cta: "Shop Best Sellers",
    href: "/products?filter=bestseller",
    align: "right",
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  const slide = slides[current];

  return (
    <section className="relative h-[85vh] md:h-screen overflow-hidden bg-stone-100">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            i === current ? "opacity-100" : "opacity-0"
          )}
        >
          <Image
            src={s.image}
            alt={s.title}
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/25" />
        </div>
      ))}

      {/* Content */}
      <div
        className={cn(
          "relative z-10 h-full flex flex-col justify-end pb-16 px-6 md:px-16 lg:px-24",
          slide.align === "center" && "items-center text-center",
          slide.align === "right" && "items-end text-right"
        )}
      >
        <div className="max-w-2xl">
          <p
            key={`tag-${current}`}
            className="text-white/70 text-xs tracking-[0.3em] uppercase mb-4 animate-[fadeInUp_0.6s_ease_forwards]"
          >
            {slide.tag}
          </p>
          <h1
            key={`title-${current}`}
            className="text-white text-5xl md:text-7xl lg:text-8xl leading-none mb-6 animate-[fadeInUp_0.7s_ease_0.1s_forwards] opacity-0 whitespace-pre-line"
            style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
          >
            {slide.title}
          </h1>
          <p
            key={`sub-${current}`}
            className="text-white/80 text-sm md:text-base mb-10 animate-[fadeInUp_0.7s_ease_0.2s_forwards] opacity-0 max-w-sm"
            style={{ fontFamily: "var(--font-cormorant), serif", fontStyle: "italic" }}
          >
            {slide.subtitle}
          </p>
          <Link
            key={`cta-${current}`}
            href={slide.href}
            className="inline-block bg-white text-stone-900 text-xs tracking-[0.2em] uppercase px-10 py-4 hover:bg-stone-100 transition-colors animate-[fadeInUp_0.7s_ease_0.3s_forwards] opacity-0"
          >
            {slide.cta}
          </Link>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/20 hover:bg-white/40 text-white transition-colors rounded-full"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/20 hover:bg-white/40 text-white transition-colors rounded-full"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              "h-0.5 transition-all duration-300",
              i === current ? "w-8 bg-white" : "w-4 bg-white/50"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
