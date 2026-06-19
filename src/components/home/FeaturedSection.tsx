"use client";
import Link from "next/link";
import { useProductStore } from "@/store/productStore";
import { useLocaleStore } from "@/store/localeStore";
import { useTranslations } from "@/lib/i18n";
import ProductCard from "@/components/product/ProductCard";

export default function FeaturedSection() {
  const products = useProductStore((s) => s.products);
  const language = useLocaleStore((s) => s.language);
  const t = useTranslations(language);
  const featured = products.filter((p) => p.isNew).slice(0, 4);

  return (
    <section className="py-20 px-4 md:px-8 max-w-screen-xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <p className="type-label text-stone-400 mb-3">
            {t("justArrived")}
          </p>
          <h2 className="text-3xl md:text-4xl font-light">
            {t("newInHeading")}
          </h2>
        </div>
        <Link
          href="/products?filter=new"
          className="text-xs tracking-widest uppercase underline underline-offset-4 hover:text-stone-500 transition-colors self-start md:self-auto"
        >
          {t("viewAll")}
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {featured.map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i < 2} />
        ))}
      </div>
    </section>
  );
}
