"use client";
import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/data";
import { useLocaleStore } from "@/store/localeStore";
import { useTranslations } from "@/lib/i18n";

export default function CategorySection() {
  const language = useLocaleStore((s) => s.language);
  const t = useTranslations(language);

  return (
    <section className="py-20 px-4 md:px-8 max-w-screen-xl mx-auto">
      <div className="text-center mb-12">
        <p className="type-label text-stone-400 mb-3">
          {t("collections")}
        </p>
        <h2
          className="text-3xl md:text-4xl"
          style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
        >
          {t("shopByCategory")}
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={cat.href}
            className="group relative aspect-[3/4] overflow-hidden bg-stone-100 block"
          >
            <Image
              src={cat.image}
              alt={cat.label}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 text-white">
              <span
                className="text-xl md:text-2xl tracking-wide"
                style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
              >
                {cat.label}
              </span>
              <span className="text-xs tracking-widest uppercase mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                {t("exploreMore")}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
