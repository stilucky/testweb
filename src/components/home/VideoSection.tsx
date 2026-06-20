"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Volume2, VolumeX } from "lucide-react";
import { useVideoStore } from "@/store/videoStore";

function getYoutubeId(url: string): string | null {
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

export default function VideoSection() {
  const { brandVideo, enabled } = useVideoStore();
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Autoplay native video
  useEffect(() => {
    if (brandVideo?.type === "native" && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [brandVideo?.type]);

  if (!enabled || !brandVideo) return null;

  const youtubeId =
    brandVideo.type === "youtube" ? getYoutubeId(brandVideo.url) : null;

  // Toggle mute: native uses ref, YouTube uses postMessage to iframe
  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (brandVideo.type === "native" && videoRef.current) {
      videoRef.current.muted = next;
    }
    if (brandVideo.type === "youtube" && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: next ? "mute" : "unMute",
          args: "",
        }),
        "*"
      );
    }
  };

  return (
    <section
      className="relative w-full bg-black overflow-hidden"
      style={{ height: "75vh", minHeight: 420 }}
      id="video"
    >
      {/* ── YouTube iframe — autoplay muted loop, no controls ── */}
      {brandVideo.type === "youtube" && youtubeId && (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&showinfo=0`}
          allow="autoplay; encrypted-media; fullscreen"
          title="Brand video"
          className="absolute w-full h-full border-0"
          /* Scale up to cover black bars from 16/9 inside a non-16/9 container */
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) scale(1.6)",
            pointerEvents: "none",
            minWidth: "100%",
            minHeight: "100%",
          }}
        />
      )}

      {/* ── Native video — autoplay muted loop ── */}
      {brandVideo.type === "native" && (
        <video
          ref={videoRef}
          src={brandVideo.url}
          autoPlay
          loop
          muted={muted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* ── Cinematic dark veil ── */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      {/* Gradient vignette edges */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)" }} />

      {/* ── Text overlay — centered ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center z-10 px-6 pointer-events-none">
        <p className="text-[9px] md:text-[11px] tracking-[0.4em] uppercase text-white/50 mb-5 font-light">
          — Lunelle Editorial —
        </p>
        <h2
          className="text-4xl md:text-6xl lg:text-7xl font-light leading-[1.1] mb-5 tracking-wide"
          style={{ fontFamily: "var(--font-didot), 'GFS Didot', Georgia, serif" }}
        >
          {brandVideo.title}
        </h2>
        {brandVideo.subtitle && (
          <p className="text-sm md:text-base text-white/60 font-light max-w-md leading-relaxed">
            {brandVideo.subtitle}
          </p>
        )}
      </div>

      {/* ── Bottom bar: CTA link + mute toggle ── */}
      <div className="absolute bottom-0 inset-x-0 z-20 px-8 md:px-14 pb-8 flex items-end justify-between">
        {/* CTA */}
        {brandVideo.ctaHref && brandVideo.ctaHref !== "#video" ? (
          <Link
            href={brandVideo.ctaHref}
            className="group flex items-center gap-3 text-white/80 text-xs tracking-[0.22em] uppercase hover:text-white transition-all duration-300"
          >
            <span className="w-5 h-px bg-white/40 group-hover:w-8 group-hover:bg-white transition-all duration-300" />
            {brandVideo.ctaLabel}
          </Link>
        ) : (
          <span />
        )}

        {/* Mute toggle */}
        <button
          onClick={toggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          className="flex items-center gap-2 text-white/60 hover:text-white text-[10px] tracking-widest uppercase transition-colors duration-200"
        >
          {muted ? (
            <>
              <VolumeX size={14} strokeWidth={1.5} />
              <span className="hidden sm:block">Sound off</span>
            </>
          ) : (
            <>
              <Volume2 size={14} strokeWidth={1.5} />
              <span className="hidden sm:block">Sound on</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
