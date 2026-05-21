import Link from "next/link";
import { products } from "@/lib/data";
import ProductCard from "@/components/product/ProductCard";

export default function FeaturedSection() {
  const featured = products.filter((p) => p.isNew).slice(0, 4);

  return (
    <section className="py-20 px-4 md:px-8 max-w-screen-xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-3">
            Just Arrived
          </p>
          <h2
            className="text-4xl md:text-5xl"
            style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
          >
            New In
          </h2>
        </div>
        <Link
          href="/products?filter=new"
          className="text-xs tracking-widest uppercase underline underline-offset-4 hover:text-stone-500 transition-colors self-start md:self-auto"
        >
          View All
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
