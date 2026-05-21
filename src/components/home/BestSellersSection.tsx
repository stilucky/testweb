import Link from "next/link";
import { products } from "@/lib/data";
import ProductCard from "@/components/product/ProductCard";

export default function BestSellersSection() {
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);

  return (
    <section className="py-20 bg-stone-50">
      <div className="px-4 md:px-8 max-w-screen-xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-3">
            Customer Favourites
          </p>
          <h2
            className="text-4xl md:text-5xl"
            style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
          >
            Best Sellers
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
            Shop All Best Sellers
          </Link>
        </div>
      </div>
    </section>
  );
}
