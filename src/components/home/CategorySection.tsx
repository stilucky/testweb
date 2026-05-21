import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/data";

export default function CategorySection() {
  return (
    <section className="py-20 px-4 md:px-8 max-w-screen-xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-3">
          Collections
        </p>
        <h2
          className="text-4xl md:text-5xl text-stone-900"
          style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
        >
          Shop by Category
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {categories.map((cat, index) => (
          <Link
            key={cat.id}
            href={cat.href}
            className="group relative overflow-hidden block"
            style={{ aspectRatio: index === 0 ? "3/4" : "3/4" }}
          >
            <Image
              src={cat.image}
              alt={cat.label}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors duration-300" />
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 text-white">
              <span className="text-xs tracking-[0.25em] uppercase mb-1 opacity-80">
                Explore
              </span>
              <span
                className="text-xl md:text-2xl"
                style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 400 }}
              >
                {cat.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
