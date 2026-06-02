"use client";

import Image from "next/image";
import { useState } from "react";

/* ─── How It Works icons ─── */
function IconDesign() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-12 h-12 text-stone-500">
      <circle cx="24" cy="24" r="23" />
      <path d="M24 13 C18 13 14 17.5 14 22 C14 27 18 30 24 35 C30 30 34 27 34 22 C34 17.5 30 13 24 13Z" />
      <line x1="24" y1="18" x2="24" y2="26" />
      <line x1="20" y1="22" x2="28" y2="22" />
    </svg>
  );
}
function IconMeasure() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-12 h-12 text-stone-500">
      <circle cx="24" cy="24" r="23" />
      <rect x="12" y="20" width="24" height="8" rx="2" />
      <line x1="16" y1="20" x2="16" y2="28" />
      <line x1="20" y1="20" x2="20" y2="25" />
      <line x1="24" y1="20" x2="24" y2="28" />
      <line x1="28" y1="20" x2="28" y2="25" />
      <line x1="32" y1="20" x2="32" y2="28" />
    </svg>
  );
}
function IconProduce() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-12 h-12 text-stone-500">
      <circle cx="24" cy="24" r="23" />
      <circle cx="24" cy="24" r="5" />
      <path d="M24 12 L24 15 M24 33 L24 36 M12 24 L15 24 M33 24 L36 24 M15.5 15.5 L17.6 17.6 M30.4 30.4 L32.5 32.5 M32.5 15.5 L30.4 17.6 M17.6 30.4 L15.5 32.5" />
    </svg>
  );
}

const steps = [
  { Icon: IconDesign,  num: "01", title: "CHOOSE YOUR DESIGN",       desc: "Select a Lunelle silhouette or your base piece." },
  { Icon: IconMeasure, num: "02", title: "SUBMIT YOUR MEASUREMENTS", desc: "Provide your measurements and fit preferences through our form." },
  { Icon: IconProduce, num: "03", title: "PERSONALIZED PRODUCTION",  desc: "We review your request and create your piece with tailored adjustments." },
];

/* ─── Timeline info ─── */
function IconClock() {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8 text-stone-400 mx-auto mb-4">
      <circle cx="16" cy="16" r="13" />
      <path d="M16 9 L16 16 L21 20" />
    </svg>
  );
}
function IconPrice() {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8 text-stone-400 mx-auto mb-4">
      <circle cx="16" cy="16" r="13" />
      <path d="M12 20 C12 20 13 22 16 22 C19 22 20 20.5 20 19 C20 17 18 16 16 15.5 C14 15 12 14 12 12 C12 10 13.5 9 16 9 C18.5 9 20 10.5 20 12" />
      <line x1="16" y1="8" x2="16" y2="24" />
    </svg>
  );
}
function IconComm() {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8 text-stone-400 mx-auto mb-4">
      <circle cx="16" cy="16" r="13" />
      <path d="M10 12 Q10 10 12 10 L22 10 Q24 10 24 12 L24 19 Q24 21 22 21 L14 21 L10 24 L10 12Z" />
    </svg>
  );
}

const timeline = [
  { Icon: IconClock, title: "Production Time",  desc: "3–4 weeks. Each piece is crafted with care and attention to your measurements." },
  { Icon: IconPrice, title: "Pricing",           desc: "Customized pieces are priced separately from ready-to-wear collection." },
  { Icon: IconComm,  title: "Communication",     desc: "We are here for you to confirm details and keep you updated." },
];

/* ══════════════════════════════════════════ */
export default function CustomizedFitPage() {
  const [form, setForm] = useState({
    fullName: "", height: "", bust: "", waist: "",
    hips: "", shoulderWidth: "", preferredFit: "", notes: "",
  });
  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputCls = "w-full border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 transition-colors";

  return (
    <>
      {/* ── 1. HERO ── */}
      <section className="relative h-[90vh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1600&q=80"
          alt="Customized Fit"
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
            Customized Fit
          </h1>
          <p className="text-white/75 text-sm leading-relaxed max-w-sm mb-8">
            Designed around you: your proportions, preferences, and the way you want to feel in your clothing.
          </p>
          <a
            href="#form"
            className="inline-block bg-stone-900 text-white text-[10px] tracking-[0.2em] uppercase px-8 py-4 hover:bg-stone-700 transition-colors w-fit"
          >
            Start Your Request
          </a>
        </div>
      </section>

      {/* ── 2. HOW IT WORKS ── */}
      <section className="py-20 border-t border-stone-100">
        <div className="max-w-screen-xl mx-auto px-4 md:px-10">
          <p className="type-label text-stone-500 text-center mb-16">
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

      {/* ── 3. MEASUREMENT FORM ── */}
      <section id="form" className="border-t border-stone-100">
        <div className="max-w-screen-xl mx-auto px-4 md:px-10">
          <div className="grid md:grid-cols-2 gap-0">

            {/* Form */}
            <div className="py-16 md:pr-16">
              <p className="type-label text-stone-500 mb-10">
                Submit Your Measurements
              </p>

              {submitted ? (
                <div className="py-16 text-center border border-stone-200">
                  <div className="w-10 h-px bg-stone-300 mx-auto mb-8" />
                  <h3
                    className="text-3xl mb-4 text-stone-800"
                    style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
                  >
                    Request Received
                  </h3>
                  <p className="text-sm text-stone-400 leading-relaxed max-w-xs mx-auto">
                    Thank you. We will review your measurements and be in touch within 2–3 business days.
                  </p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">

                  {/* Full Name */}
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-1.5">Full Name</label>
                    <input value={form.fullName} onChange={set("fullName")} placeholder="Your Name" required className={inputCls} />
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-1.5">Height</label>
                    <div className="relative">
                      <input value={form.height} onChange={set("height")} placeholder="" required className={inputCls + " pr-10"} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">cm</span>
                    </div>
                  </div>

                  {/* Bust + Waist */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-1.5">Bust</label>
                      <div className="relative">
                        <input value={form.bust} onChange={set("bust")} placeholder="" required className={inputCls + " pr-10"} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">cm</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-1.5">Waist</label>
                      <div className="relative">
                        <input value={form.waist} onChange={set("waist")} placeholder="" required className={inputCls + " pr-10"} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">cm</span>
                      </div>
                    </div>
                  </div>

                  {/* Hips + Shoulder */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-1.5">Hips</label>
                      <div className="relative">
                        <input value={form.hips} onChange={set("hips")} placeholder="" required className={inputCls + " pr-10"} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">cm</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-1.5">Shoulder Width</label>
                      <div className="relative">
                        <input value={form.shoulderWidth} onChange={set("shoulderWidth")} placeholder="" className={inputCls + " pr-10"} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">cm</span>
                      </div>
                    </div>
                  </div>

                  {/* Preferred Fit */}
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-1.5">Preferred Fit</label>
                    <div className="relative">
                      <select value={form.preferredFit} onChange={set("preferredFit")} className={inputCls + " appearance-none pr-8 bg-white"}>
                        <option value="">Select an option</option>
                        <option value="slim">Slim — a close fit</option>
                        <option value="regular">Regular — a comfortable fit</option>
                        <option value="relaxed">Relaxed — an easy fit</option>
                        <option value="oversized">Oversized — a generous fit</option>
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" viewBox="0 0 10 6" width="10" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <path d="M1 1L5 5L9 1" />
                      </svg>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-[10px] tracking-widests uppercase text-stone-400 mb-1.5">Notes / Preferences</label>
                    <textarea
                      value={form.notes} onChange={set("notes")}
                      placeholder="Tell us more about your preferences..."
                      rows={3}
                      className="w-full border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 transition-colors resize-none"
                    />
                  </div>

                  {/* Upload */}
                  <div>
                    <label className="block text-[10px] tracking-widests uppercase text-stone-400 mb-1.5">Inspiration Image (Optional)</label>
                    <label className="flex items-center justify-center border border-stone-200 py-3 cursor-pointer hover:bg-stone-50 transition-colors">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
                      <span className="text-[10px] tracking-[0.2em] uppercase text-stone-400">{fileName || "Upload Image"}</span>
                    </label>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full bg-stone-900 text-white text-[10px] tracking-[0.2em] uppercase py-4 hover:bg-stone-700 transition-colors mt-2"
                  >
                    Submit Request
                  </button>
                </form>
              )}
            </div>

            {/* Side image */}
            <div className="relative hidden md:block min-h-[600px]">
              <Image
                src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=900&q=80"
                alt="Customized fit"
                fill
                sizes="50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. TIMELINE & INFORMATION ── */}
      <section className="py-20 bg-stone-50 border-t border-stone-100">
        <div className="max-w-screen-xl mx-auto px-4 md:px-10">
          <p className="type-label text-stone-500 text-center mb-16">
            Timeline &amp; Information
          </p>
          <div className="grid md:grid-cols-3 gap-10 text-center">
            {timeline.map(({ Icon, title, desc }) => (
              <div key={title}>
                <Icon />
                <p className="text-[11px] tracking-[0.15em] uppercase font-medium text-stone-800 mb-3">{title}</p>
                <p className="text-xs text-stone-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. CLOSING MESSAGE ── */}
      <section className="relative py-28 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&q=80"
          alt="Closing"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-stone-900/55" />
        <div className="relative z-10 max-w-2xl mx-auto text-center px-6">
          <p
            className="text-white/90 text-2xl md:text-3xl leading-relaxed"
            style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300, fontStyle: "italic" }}
          >
            Each piece is created with intention —<br />
            designed to feel personal, refined,<br />
            and naturally yours.
          </p>
        </div>
      </section>
    </>
  );
}
