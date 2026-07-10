"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAboutStore } from "@/store/aboutStore";

const SECTION_ORDER: import("@/store/aboutStore").AboutKey[] = [
  "origin",
  "universe",
  "angels",
  "mantra",
];

export default function AboutPage() {
  const { sections, posts } = useAboutStore();

  const ordered = SECTION_ORDER.map((k) => sections.find((s) => s.key === k)!).filter(Boolean);

  return (
    <div className="bg-white pt-16">

      {/* ── Hero brand statement ── */}
      <div className="max-w-3xl mx-auto px-6 py-28 text-center">
        <p className="text-[9px] tracking-[0.4em] uppercase text-stone-300 mb-8">
          Est. 2020 — Montréal
        </p>
        <p
          className="text-2xl md:text-4xl font-light text-stone-900 leading-[1.6]"
          style={{ fontFamily: "var(--font-cormorant), serif" }}
        >
          Lunelle is a fashion house rooted in feminine sensibility,
          modern craft, and the quiet power of a perfectly chosen garment.
        </p>
      </div>

      {/* ── Full-width divider image ── */}
      <div className="relative w-full overflow-hidden" style={{ height: "60vh" }}>
        <Image
          src={ordered[0]?.heroImage ?? ""}
          alt="Lunelle"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: ordered[0]?.heroImagePosition ?? "center" }}
        />
      </div>

      {/* ── Section grid ── */}
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-24">
        <p className="text-[9px] tracking-[0.35em] uppercase text-stone-300 mb-16 text-center">
          Our chapters
        </p>

        <div className="grid md:grid-cols-2 gap-px bg-stone-100">
          {ordered.map((section, i) => {
            const count = posts.filter(
              (p) => p.sectionKey === section.key && p.status === "published"
            ).length;

            return (
              <Link
                key={section.key}
                href={`/about/${section.key}`}
                className="group relative overflow-hidden bg-white block"
              >
                {/* Image */}
                <div
                  className="relative overflow-hidden"
                  style={{ aspectRatio: i === 0 ? "16/9" : "4/3" }}
                >
                  <Image
                    src={section.heroImage}
                    alt={section.label}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    style={{ objectPosition: section.heroImagePosition ?? "center" }}
                  />
                  <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-stone-900/20 transition-colors duration-500" />
                </div>

                {/* Info */}
                <div className="p-8 md:p-10">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-stone-300 mb-3">
                    {String(i + 1).padStart(2, "0")}
                    {count > 0 && <span className="ml-3">{count} {count === 1 ? "story" : "stories"}</span>}
                  </p>
                  <h2
                    className="text-3xl md:text-4xl font-light text-stone-900 mb-3"
                    style={{ fontFamily: "var(--font-cormorant), serif" }}
                  >
                    {section.label}
                  </h2>
                  <p className="text-sm text-stone-400 font-light mb-6 italic">
                    {section.subtitle}
                  </p>
                  <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-stone-900 group-hover:gap-3 transition-all duration-300">
                    Read <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="border-t border-stone-100 py-24 text-center px-6">
        <p className="text-[9px] tracking-[0.35em] uppercase text-stone-300 mb-6">
          Ready to explore?
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/products"
            className="inline-block bg-stone-900 text-white text-[10px] tracking-[0.25em] uppercase px-12 py-4 hover:bg-stone-700 transition-colors"
          >
            Shop Collection
          </Link>
          <Link
            href="/tailored"
            className="inline-block border border-stone-300 text-stone-700 text-[10px] tracking-[0.25em] uppercase px-12 py-4 hover:border-stone-800 transition-colors"
          >
            Tailored Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
