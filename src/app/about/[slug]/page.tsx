"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAboutStore, type AboutKey } from "@/store/aboutStore";

const VALID_SLUGS: AboutKey[] = ["our-story", "our-world", "lunelle-girl", "our-mantra"];

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n\n+/)
        .filter(Boolean)
        .map((para, i) => (
          <p key={i} className="text-[15px] text-stone-500 leading-[1.95] font-light">
            {para.trim()}
          </p>
        ))}
    </>
  );
}

export default function AboutSectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  if (!VALID_SLUGS.includes(slug as AboutKey)) notFound();

  const { sections, posts } = useAboutStore();
  const section = sections.find((s) => s.key === slug as AboutKey);
  if (!section) notFound();

  const sectionPosts = posts
    .filter((p) => p.sectionKey === slug && p.status === "published")
    .sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));

  const SECTION_INDEX: Record<AboutKey, string> = {
    "our-story":    "01",
    "our-world":    "02",
    "lunelle-girl": "03",
    "our-mantra":   "04",
  };

  return (
    <div className="bg-white pt-16">

      {/* ── Hero ── */}
      <div className="relative w-full overflow-hidden" style={{ height: "75vh" }}>
        <Image
          src={section.heroImage}
          alt={section.label}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: section.heroImagePosition ?? "center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/50" />

        {/* Back link */}
        <Link
          href="/about"
          className="absolute top-8 left-8 flex items-center gap-2 text-white/80 hover:text-white text-[10px] tracking-[0.2em] uppercase transition-colors"
        >
          <ArrowLeft size={13} /> About
        </Link>

        {/* Hero text */}
        <div className="absolute bottom-0 left-0 right-0 px-10 pb-16 text-center">
          <p className="text-[9px] tracking-[0.4em] uppercase text-white/50 mb-4">
            {SECTION_INDEX[slug as AboutKey]}
          </p>
          <h1
            className="text-4xl md:text-7xl font-light text-white leading-none mb-4"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            {section.label}
          </h1>
          <p className="text-sm text-white/60 font-light italic tracking-wide">
            {section.subtitle}
          </p>
        </div>
      </div>

      {/* ── Posts ── */}
      {sectionPosts.length === 0 ? (
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <p
            className="text-3xl text-stone-300 mb-4"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            Coming soon
          </p>
          <p className="text-sm text-stone-400">Stories are being crafted for this chapter.</p>
        </div>
      ) : (
        <div>
          {sectionPosts.map((post, index) => {
            const isEven = index % 2 === 0;

            return (
              <article key={post.id}>

                {/* ── Layout A: image left / text right (even posts) ── */}
                {/* ── Layout B: text left / image right (odd posts) ── */}

                {post.image2 ? (
                  /* Two-image layout */
                  <section className="py-24">
                    {/* Text centred above images */}
                    <div className="max-w-2xl mx-auto px-6 text-center mb-16">
                      <p className="text-[9px] tracking-[0.3em] uppercase text-stone-300 mb-6">
                        {new Date(post.createdAt).toLocaleDateString("en-CA", {
                          year: "numeric", month: "long",
                        })}
                      </p>
                      <h2
                        className="text-3xl md:text-5xl font-light text-stone-900 mb-6"
                        style={{ fontFamily: "var(--font-cormorant), serif" }}
                      >
                        {post.title}
                      </h2>
                      {post.subtitle && (
                        <p className="text-stone-400 italic text-base mb-10 font-light">
                          &ldquo;{post.subtitle}&rdquo;
                        </p>
                      )}
                      <div className="space-y-5 text-left">
                        <Paragraphs text={post.body} />
                      </div>
                    </div>

                    {/* Two images side-by-side */}
                    <div className="grid grid-cols-2 gap-2 max-w-screen-xl mx-auto px-6 md:px-10">
                      <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          sizes="50vw"
                          className="object-cover"
                          style={{ objectPosition: post.imagePosition ?? "center" }}
                        />
                      </div>
                      <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
                        <Image
                          src={post.image2}
                          alt={post.title}
                          fill
                          sizes="50vw"
                          className="object-cover"
                          style={{ objectPosition: post.image2Position ?? "center" }}
                        />
                      </div>
                    </div>
                  </section>
                ) : (
                  /* Single image layout — alternating sides */
                  <section className={`py-20 ${index > 0 ? "border-t border-stone-100" : ""}`}>
                    <div
                      className={`max-w-screen-xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-0 items-stretch ${
                        isEven ? "" : "md:[direction:rtl]"
                      }`}
                    >
                      {/* Image */}
                      <div
                        className={`relative overflow-hidden ${isEven ? "" : "md:[direction:ltr]"}`}
                        style={{ minHeight: "560px" }}
                      >
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                          style={{ objectPosition: post.imagePosition ?? "center" }}
                        />
                      </div>

                      {/* Text */}
                      <div
                        className={`flex flex-col justify-center px-8 md:px-14 py-12 ${
                          isEven ? "" : "md:[direction:ltr]"
                        }`}
                      >
                        <p className="text-[9px] tracking-[0.3em] uppercase text-stone-300 mb-6">
                          {new Date(post.createdAt).toLocaleDateString("en-CA", {
                            year: "numeric", month: "long",
                          })}
                        </p>
                        <h2
                          className="text-3xl md:text-5xl font-light text-stone-900 mb-6 leading-tight"
                          style={{ fontFamily: "var(--font-cormorant), serif" }}
                        >
                          {post.title}
                        </h2>
                        {post.subtitle && (
                          <p className="text-stone-400 italic text-sm mb-8 font-light">
                            &ldquo;{post.subtitle}&rdquo;
                          </p>
                        )}
                        <div className="space-y-5">
                          <Paragraphs text={post.body} />
                        </div>
                      </div>
                    </div>
                  </section>
                )}

              </article>
            );
          })}
        </div>
      )}

      {/* ── Nav to other sections ── */}
      <div className="border-t border-stone-100 py-20 px-6">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-[9px] tracking-[0.35em] uppercase text-stone-300 mb-10 text-center">
            Other chapters
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-stone-100">
            {(["our-story", "our-world", "lunelle-girl", "our-mantra"] as AboutKey[])
              .filter((k) => k !== slug)
              .map((k) => {
                const sec = sections.find((s) => s.key === k);
                if (!sec) return null;
                return (
                  <Link
                    key={k}
                    href={`/about/${k}`}
                    className="group bg-white relative overflow-hidden block"
                  >
                    <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                      <Image
                        src={sec.heroImage}
                        alt={sec.label}
                        fill
                        sizes="25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        style={{ objectPosition: sec.heroImagePosition ?? "center" }}
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-medium text-stone-900 group-hover:text-stone-600 transition-colors">
                        {sec.label}
                      </p>
                      <p className="text-[11px] text-stone-400 italic mt-1 truncate">
                        {sec.subtitle}
                      </p>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      </div>

    </div>
  );
}
