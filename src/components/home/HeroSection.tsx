"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHeroStore } from "@/store/heroStore";
import type { HeroSettings } from "@/lib/server-hero";

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

function HeroNativeVideo({
  src,
  poster,
  objectPosition,
  active,
}: {
  src: string;
  poster?: string;
  objectPosition?: string;
  active: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!active) {
      video.pause();
      video.load();
      return;
    }

    const play = () => {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      void video.play().catch(() => {});
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") play();
    };

    play();
    video.addEventListener("canplay", play);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      video.removeEventListener("canplay", play);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [active, src]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      controls={false}
      disablePictureInPicture
      className="absolute left-1/2 top-1/2 h-[112%] w-[112%] -translate-x-1/2 -translate-y-1/2 object-cover"
      style={{ objectPosition: objectPosition ?? "50% 50%" }}
    />
  );
}

function videoMimeType(src: string) {
  const cleanSrc = src.split("?")[0].toLowerCase();
  if (cleanSrc.endsWith(".webm")) return "video/webm";
  if (cleanSrc.endsWith(".ogv") || cleanSrc.endsWith(".ogg")) return "video/ogg";
  if (cleanSrc.endsWith(".mov")) return "video/quicktime";
  if (cleanSrc.endsWith(".m4v")) return "video/x-m4v";
  return "video/mp4";
}

function shouldPreloadNativeVideo(src?: string) {
  return Boolean(src && !src.startsWith("data:") && !src.startsWith("blob:"));
}

export default function HeroSection({ initialSettings }: { initialSettings?: HeroSettings | null }) {
  const { slides: allSlides, autoplayInterval, setHeroSettings } = useHeroStore();
  const configuredSlides = initialSettings?.slides ?? allSlides;
  const configuredAutoplayInterval = initialSettings?.autoplayInterval ?? autoplayInterval;
  const slides = configuredSlides.filter((s) => s.enabled !== false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (initialSettings?.slides) {
      setHeroSettings(initialSettings);
      return;
    }

    const controller = new AbortController();

    fetch("/api/hero", { cache: "no-store", signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        if (Array.isArray(data.slides)) {
          setHeroSettings({
            slides: data.slides,
            maxSlides: data.maxSlides,
            autoplayInterval: data.autoplayInterval,
          });
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.warn("[HeroSection] Failed to load hero settings", err);
      });

    return () => controller.abort();
  }, [initialSettings, setHeroSettings]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const ms = configuredAutoplayInterval * 1000;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), ms);
    return () => clearInterval(timer);
  }, [slides.length, configuredAutoplayInterval]);

  if (slides.length === 0) return null;

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  const activeIndex = Math.min(current, slides.length - 1);
  const activeSlide = slides[activeIndex];
  const nextIndex = slides.length > 1 ? (activeIndex + 1) % slides.length : activeIndex;
  const preloadVideoUrls = [activeSlide, slides[nextIndex]]
    .filter((slide) => slide?.videoType === "native" && shouldPreloadNativeVideo(slide.videoUrl))
    .map((slide) => slide.videoUrl as string)
    .filter((url, index, list) => list.indexOf(url) === index);
  const hasYouTubeSlide = slides.some((slide) => slide.videoType === "youtube" && slide.videoUrl);

  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-stone-900 md:h-screen">
      {hasYouTubeSlide && (
        <>
          <link rel="preconnect" href="https://www.youtube.com" />
          <link rel="preconnect" href="https://www.google.com" />
          <link rel="preconnect" href="https://i.ytimg.com" />
        </>
      )}
      {preloadVideoUrls.map((url) => (
        <link key={url} rel="preload" href={url} as="video" type={videoMimeType(url)} />
      ))}

      {/* ── Slides ── */}
      {slides.map((s, i) => {
        const isActive = i === activeIndex;
        const shouldWarmVideo = i === nextIndex;
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
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    title="Hero video"
                    className="pointer-events-none absolute left-1/2 top-1/2 h-[max(63vw,112svh)] w-[max(112vw,199.111111svh)] -translate-x-1/2 -translate-y-1/2 border-0"
                  />
                )}
                {/* Native video — active slide plays, next slide preloads in place */}
                {s.videoType === "native" && (isActive || shouldWarmVideo) && (
                  <HeroNativeVideo
                    src={s.videoUrl}
                    poster={s.image || undefined}
                    objectPosition={s.imagePosition}
                    active={isActive}
                  />
                )}
                {/* Thumbnail fallback when this slide is not active */}
                {!isActive && s.image && (
                  <Image
                    src={s.image}
                    alt=""
                    fill
                    sizes="100vw"
                    className="object-cover object-center"
                    style={{ objectPosition: s.imagePosition ?? "50% 50%" }}
                    priority={i === 0}
                    unoptimized={s.image.startsWith("data:")}
                  />
                )}
              </>
            ) : (
              <Image
                src={s.image}
                alt=""
                fill
                sizes="100vw"
                priority={i === 0}
                className="object-cover object-center"
                style={{ objectPosition: s.imagePosition ?? "50% 50%" }}
                unoptimized={s.image.startsWith("data:")}
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
      <div className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-between gap-6 px-5 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-8 md:px-16">
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
                  i === activeIndex ? "w-8 bg-white" : "w-4 bg-white/40"
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
