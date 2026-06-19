"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHeroStore } from "@/store/heroStore";


export default function HeroSection() {
  const { slides, autoplayInterval } = useHeroStore();
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (slides.length > 0 && current >= slides.length) {
      setCurrent(slides.length - 1);
    }
  }, [slides.length, current]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const ms = autoplayInterval * 1000;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), ms);
    return () => clearInterval(timer);
  }, [slides.length, autoplayInterval]);

  if (slides.length === 0) return null;

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <section className="relative w-full h-screen overflow-hidden bg-stone-100">

      {/* ── Slides ── */}
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
            alt=""
            fill
            priority={i === 0}
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
      ))}

      {/* ── Gradient veil — top (for header) + bottom (for collection links) ── */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/55 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/50 to-transparent pointer-events-none z-10" />

      {/* ── Bottom bar: collection links + slide dots ── */}
      <div className="absolute bottom-0 inset-x-0 z-20 px-8 md:px-16 pb-8 flex items-end justify-between gap-6">

        {/* Shop All link */}
        <Link
          href="/products"
          className="text-white/75 text-xs tracking-[0.18em] uppercase hover:text-white transition-colors duration-200"
        >
          Shop All
        </Link>

        {/* Slide dots (only if >1 slide) */}
        {slides.length > 1 && (
          <div className="flex items-center gap-2 shrink-0">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
                className={cn(
                  "h-px transition-all duration-300",
                  i === current ? "w-8 bg-white" : "w-4 bg-white/40"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Arrows ── */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 text-white/70 hover:text-white transition-colors"
          >
            <ChevronRight size={22} strokeWidth={1.5} />
          </button>
        </>
      )}
    </section>
  );
}
