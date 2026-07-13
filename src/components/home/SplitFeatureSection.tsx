"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { defaultHomeFeatures, useHomeFeatureStore } from "@/store/homeFeatureStore";

export default function SplitFeatureSection() {
  const [mounted, setMounted] = useState(false);
  const features = useHomeFeatureStore((state) => state.features);
  const setFeatures = useHomeFeatureStore((state) => state.setFeatures);
  const displayFeatures = mounted ? features : defaultHomeFeatures;

  useEffect(() => {
    setMounted(true);

    const controller = new AbortController();
    fetch("/api/homepage", { cache: "no-store", signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        if (Array.isArray(data.features)) setFeatures(data.features);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.warn("[SplitFeatureSection] Failed to load homepage settings", err);
      });

    return () => controller.abort();
  }, [setFeatures]);

  return (
    <section className="grid min-h-screen grid-cols-1 gap-3 bg-white py-3 md:grid-cols-2 md:gap-4 md:py-4">
      {displayFeatures.map((feature, index) => (
        <Link
          key={feature.key}
          href={feature.href}
          className="group relative min-h-[72vh] overflow-hidden bg-stone-100 md:min-h-screen"
        >
          <Image
            src={feature.image}
            alt={feature.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={index === 0}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
            style={{ objectPosition: feature.imagePosition }}
            unoptimized={feature.image.startsWith("data:")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
          <div className="absolute inset-x-0 bottom-8 flex flex-col items-center px-6 text-center text-white md:bottom-10">
            <h2 className="text-sm font-light uppercase tracking-[0.22em]">
              {feature.title}
            </h2>
          </div>
        </Link>
      ))}
    </section>
  );
}
