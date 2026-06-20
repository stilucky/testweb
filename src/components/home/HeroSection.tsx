"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHeroStore } from "@/store/heroStore";

function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?/]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function HeroSection() {
  const { slides: allSlides, autoplayInterval } = useHeroStore();
  const slides = allSlides.filter((s) => s.enabled !== false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length > 0 && current >= slides.length) setCurrent(slides.length - 1);
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

  const activeSlide = slides[current];

  return (
    <section className="relative w-full h-screen overflow-hidden bg-stone-900">

      {/* ── Slides ── */}
      {slides.map((s, i) => {
        const isActive = i === current;
        const ytId = s.videoUrl && s.videoType === "youtube" ? getYouTubeId(s.videoUrl) : null;

        return (
          <div
            key={s.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              isActive ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            {s.videoUrl ? (
              <>
                {/* YouTube — only rendered when active so autoplay triggers on slide change */}
                {s.videoType === "youtube" && ytId && isActive && (
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&showinfo=0`}
                    allow="autoplay; encrypted-media; fullscreen"
                    title="Hero video"
                    className="absolute border-0"
                    style={{
                      top: "50%", left: "50%",
                      width: "100%", height: "100%",
                      transform: "translate(-50%, -50%) scale(1.6)",
                      pointerEvents: "none",
                    }}
                  />
                )}
                {/* Native video — only active */}
                {s.videoType === "native" && isActive && (
                  <video
                    src={s.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {/* Thumbnail fallback when this slide is not active */}
                {!isActive && s.image && (
                  <Image src={s.image} alt="" fill className="object-cover object-center" sizes="100vw" />
                )}
              </>
            ) : (
              <Image
                src={s.image}
                alt=""
                fill
                priority={i === 0}
                className="object-cover object-center"
                sizes="100vw"
              />
            )}
          </div>
        );
      })}

      {/* ── Gradient veils ── */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/55 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />
      {activeSlide?.videoUrl && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{ background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.42) 100%)" }}
        />
      )}

      {/* ── Bottom bar ── */}
      <div className="absolute bottom-0 inset-x-0 z-30 px-8 md:px-16 pb-8 flex items-end justify-between gap-6">
        <Link
          href="/products"
          className="group flex items-center gap-2.5 text-white text-xs tracking-[0.2em] uppercase transition-all duration-300"
        >
          <span className="w-6 h-px bg-white/50 group-hover:w-10 group-hover:bg-white transition-all duration-300" />
          <span className="group-hover:tracking-[0.28em] transition-all duration-300">Shop All</span>
        </Link>

        {/* Slide dots */}
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
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 text-white/70 hover:text-white transition-colors"
          >
            <ChevronRight size={22} strokeWidth={1.5} />
          </button>
        </>
      )}
    </section>
  );
}
