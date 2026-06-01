"use client";
import Link from "next/link";
import { useProductStore } from "@/store/productStore";
import { useLocaleStore } from "@/store/localeStore";
import { useTranslations } from "@/lib/i18n";
import ProductCard from "@/components/product/ProductCard";

export default function BestSellersSection() {
  const products = useProductStore((s) => s.products);
  const language = useLocaleStore((s) => s.language);
  const t = useTranslations(language);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);

  return (
    <section className="py-20 bg-stone-50">
      <div className="px-4 md:px-8 max-w-screen-xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-3">
            {t("customerFavs")}
          </p>
          <h2
            className="text-3xl md:text-4xl"
            style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
          >
            {t("bestSellersHeading")}
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center">
          <Link
            href="/products?filter=bestseller"
            className="inline-block border border-stone-900 text-stone-900 text-xs tracking-widest uppercase px-12 py-4 hover:bg-stone-900 hover:text-white transition-colors"
          >
            {t("shopAllBestSellers")}
          </Link>
        </div>
      </div>
    </section>
  );
}
