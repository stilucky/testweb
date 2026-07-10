"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, ChevronRight } from "lucide-react";
import { useAboutStore, type AboutKey } from "@/store/aboutStore";

const SECTION_ORDER: AboutKey[] = ["origin", "universe", "angels", "mantra"];
const INDEX_LABEL: Record<AboutKey, string> = {
  origin:   "01",
  universe: "02",
  angels:   "03",
  mantra:   "04",
};

export default function AdminAboutPage() {
  const { sections, posts } = useAboutStore();

  const ordered = SECTION_ORDER.map((k) => sections.find((s) => s.key === k)!).filter(Boolean);

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-2xl font-light text-stone-900 mb-1">About Content</h1>
          <p className="text-sm text-stone-400">
            Manage the 4 editorial sections and their stories shown on the About page.
          </p>
        </div>
        <Link
          href="/about"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-stone-500 border border-stone-200 px-4 py-2.5 hover:border-stone-900 hover:text-stone-900 transition-colors shrink-0"
        >
          <ExternalLink size={13} /> View About Page
        </Link>
      </div>

      <div className="space-y-3">
        {ordered.map((section) => {
          const total     = posts.filter((p) => p.sectionKey === section.key).length;
          const published = posts.filter((p) => p.sectionKey === section.key && p.status === "published").length;
          const drafts    = total - published;

          return (
            <Link
              key={section.key}
              href={`/admin/about/${section.key}`}
              className="group flex items-center gap-5 p-5 border border-stone-200 bg-white hover:border-stone-400 transition-colors"
            >
              {/* Thumbnail */}
              <div className="relative w-24 h-16 shrink-0 overflow-hidden bg-stone-100">
                <Image
                  src={section.heroImage}
                  alt={section.label}
                  fill
                  sizes="96px"
                  className="object-cover"
                  style={{ objectPosition: section.heroImagePosition ?? "center" }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[9px] tracking-[0.25em] uppercase text-stone-300">
                    {INDEX_LABEL[section.key]}
                  </span>
                  <h3 className="text-sm font-medium text-stone-900">{section.label}</h3>
                </div>
                <p className="text-xs text-stone-400 italic truncate mb-2">{section.subtitle}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-stone-500">
                    {published} published
                  </span>
                  {drafts > 0 && (
                    <span className="text-[10px] text-amber-500">{drafts} draft</span>
                  )}
                  {total === 0 && (
                    <span className="text-[10px] text-stone-300">No posts yet</span>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight
                size={16}
                className="text-stone-300 group-hover:text-stone-900 transition-colors shrink-0"
              />
            </Link>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-stone-50 border border-stone-100">
        <p className="text-[11px] text-stone-400 leading-relaxed">
          Click a section to edit its hero image, subtitle, and manage all stories (posts) within it.
          Each section page at <code className="text-stone-600">/about/[section]</code> displays its published posts in an editorial layout.
        </p>
      </div>
    </div>
  );
}
