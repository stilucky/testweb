import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { readTailoredContentSettings } from "@/lib/server-tailored-content";
import { defaultTailoredImages, tailoredImageByKey } from "@/store/tailoredContentStore";

export const metadata: Metadata = {
  title: "Tailored",
  description: "Made to Order and Customized Fit — fashion crafted with intention, designed for you.",
};

const sections = {
  madeToOrder: [
    { n: "01", label: "Hero Section",        desc: "Introduce the service with a clear message and imagery." },
    { n: "02", label: "Collection Showcase", desc: "Show products available for made to order." },
    { n: "03", label: "How It Works",        desc: "Explain the process in simple steps." },
    { n: "04", label: "Craftsmanship",       desc: "Highlight fabric details and craftsmanship." },
    { n: "05", label: "Important Info",      desc: "Provide key information about timelines, shipping, returns." },
  ],
  customizedFit: [
    { n: "01", label: "Hero Section",        desc: "Introduce the tailored experience and personalization." },
    { n: "02", label: "How It Works",        desc: "Show the steps for a customized experience." },
    { n: "03", label: "Measurement Form",    desc: "Elegant and easy form for customers." },
    { n: "04", label: "Timeline & Info",     desc: "Set expectations for timelines and important details." },
    { n: "05", label: "Closing Message",     desc: "Emotional closing that reinforces the brand value." },
  ],
};

export default async function TailoredPage() {
  const tailoredSettings = await readTailoredContentSettings();
  const tailoredImages = tailoredSettings?.images ?? defaultTailoredImages;
  const madeToOrderImage = tailoredImageByKey(tailoredImages, "overviewMadeToOrder");
  const customizedFitImage = tailoredImageByKey(tailoredImages, "overviewCustomizedFit");
  const closingImage = tailoredImageByKey(tailoredImages, "overviewClosing");

  return (
    <>
      {/* ── Page heading ── */}
      <section className="py-16 text-center px-4 border-b border-stone-100">
        <p className="text-[10px] tracking-[0.35em] uppercase text-stone-400 mb-3">Lunelle</p>
        <h1
          className="text-3xl md:text-4xl mb-3"
          style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
        >
          Tailored for You
        </h1>
        <p className="text-xs tracking-[0.2em] uppercase text-stone-400">
          Tailored Section Structure
        </p>
      </section>

      {/* ── Navigation pills ── */}
      <div className="flex border-b border-stone-200">
        <div className="flex-1 flex items-center justify-center py-4 border-r border-stone-200">
          <span className="text-[10px] tracking-[0.25em] uppercase font-medium text-stone-700">
            Made to Order
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center py-4">
          <span className="text-[10px] tracking-[0.25em] uppercase font-medium text-stone-700">
            Customized Fit
          </span>
        </div>
      </div>

      {/* ── Two-column split ── */}
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200 min-h-screen">

        {/* ── MADE TO ORDER ── */}
        <div className="flex flex-col">
          {/* Hero image */}
          <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
            <Image
              src={madeToOrderImage.image}
              alt="Made to Order"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top"
              style={{ objectPosition: madeToOrderImage.imagePosition }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <p className="text-[10px] tracking-[0.3em] uppercase text-white/60 mb-3">Tailored</p>
              <h2
                className="text-3xl md:text-4xl text-white mb-4 leading-tight"
                style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
              >
                Made to Order
              </h2>
              <p className="text-white/75 text-sm leading-relaxed mb-6 max-w-xs">
                Thoughtfully produced after purchase in limited quantities. Each piece is crafted with intention and care.
              </p>
              <Link
                href="/tailored/made-to-order"
                className="inline-block border border-white text-white text-[10px] tracking-widest uppercase px-8 py-3 hover:bg-white hover:text-stone-900 transition-colors"
              >
                View the Collection
              </Link>
            </div>
          </div>

          {/* Section index */}
          <div className="flex-1 p-8 md:p-12 bg-stone-50">
            <p className="text-[10px] tracking-[0.25em] uppercase text-stone-400 mb-8">
              Page Structure
            </p>
            <div className="space-y-0">
              {sections.madeToOrder.map((s, i) => (
                <div
                  key={s.n}
                  className="flex gap-5 py-5 border-b border-stone-200 last:border-0 group"
                >
                  <span
                    className="text-3xl text-stone-200 shrink-0 leading-none mt-0.5"
                    style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-xs font-medium tracking-wide text-stone-800 mb-1">{s.label}</p>
                    <p className="text-xs text-stone-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/tailored/made-to-order"
              className="inline-flex items-center gap-2 mt-8 text-xs tracking-widest uppercase text-stone-700 border-b border-stone-700 pb-0.5 hover:text-stone-400 hover:border-stone-400 transition-colors"
            >
              Explore Made to Order
              <span className="text-base leading-none">→</span>
            </Link>
          </div>
        </div>

        {/* ── CUSTOMIZED FIT ── */}
        <div className="flex flex-col">
          {/* Hero image */}
          <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
            <Image
              src={customizedFitImage.image}
              alt="Customized Fit"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top"
              style={{ objectPosition: customizedFitImage.imagePosition }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <p className="text-[10px] tracking-[0.3em] uppercase text-white/60 mb-3">Tailored</p>
              <h2
                className="text-3xl md:text-4xl text-white mb-4 leading-tight"
                style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
              >
                Customized Fit
              </h2>
              <p className="text-white/75 text-sm leading-relaxed mb-6 max-w-xs">
                Designed around you: your proportions, preferences, and the way you want to feel in your clothing.
              </p>
              <Link
                href="/tailored/customized-fit"
                className="inline-block border border-white text-white text-[10px] tracking-widest uppercase px-8 py-3 hover:bg-white hover:text-stone-900 transition-colors"
              >
                Start Your Request
              </Link>
            </div>
          </div>

          {/* Section index */}
          <div className="flex-1 p-8 md:p-12 bg-stone-50">
            <p className="text-[10px] tracking-[0.25em] uppercase text-stone-400 mb-8">
              Page Structure
            </p>
            <div className="space-y-0">
              {sections.customizedFit.map((s, i) => (
                <div
                  key={s.n}
                  className="flex gap-5 py-5 border-b border-stone-200 last:border-0 group"
                >
                  <span
                    className="text-3xl text-stone-200 shrink-0 leading-none mt-0.5"
                    style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-xs font-medium tracking-wide text-stone-800 mb-1">{s.label}</p>
                    <p className="text-xs text-stone-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/tailored/customized-fit"
              className="inline-flex items-center gap-2 mt-8 text-xs tracking-widest uppercase text-stone-700 border-b border-stone-700 pb-0.5 hover:text-stone-400 hover:border-stone-400 transition-colors"
            >
              Explore Customized Fit
              <span className="text-base leading-none">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Bottom closing strip ── */}
      <section className="relative py-28 overflow-hidden">
        <Image
          src={closingImage.image}
          alt="Tailored for you"
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: closingImage.imagePosition }}
        />
        <div className="absolute inset-0 bg-stone-900/55" />
        <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
          <p className="text-[10px] tracking-[0.35em] uppercase text-white/50 mb-6">Lunelle · Tailored</p>
          <p
            className="text-white/90 text-2xl md:text-4xl leading-relaxed"
            style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
          >
            Each piece is created with intention — designed to feel personal, refined, and naturally yours.
          </p>
          <div className="flex items-center justify-center gap-6 mt-10">
            <Link
              href="/tailored/made-to-order"
              className="text-[10px] tracking-widest uppercase text-white border-b border-white/40 pb-0.5 hover:border-white transition-colors"
            >
              Made to Order
            </Link>
            <span className="text-white/30 text-xs">·</span>
            <Link
              href="/tailored/customized-fit"
              className="text-[10px] tracking-widest uppercase text-white border-b border-white/40 pb-0.5 hover:border-white transition-colors"
            >
              Customized Fit
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
