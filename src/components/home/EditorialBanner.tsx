import Image from "next/image";
import Link from "next/link";

export default function EditorialBanner() {
  return (
    <section className="py-20 px-4 md:px-8 max-w-screen-xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6 items-center">
        {/* Image side */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&q=80"
            alt="Resort Collection"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Text side */}
        <div className="flex flex-col justify-center md:px-10 lg:px-16 py-8">
          <p className="type-label text-stone-400 mb-6">
            L&apos;ÉCHO | Resort 2025
          </p>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl leading-tight mb-6 text-stone-900"
            style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
          >
            Where Luxury
            <br />
            <em>Meets</em> The Sea
          </h2>
          <p className="text-stone-500 text-sm leading-relaxed mb-10 max-w-sm">
            Our resort collection draws inspiration from sun-drenched coastlines and languid
            afternoons. Each piece crafted for the woman who moves through the world with
            effortless grace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/products?subcategory=resort"
              className="inline-block bg-stone-900 text-white text-xs tracking-widest uppercase px-10 py-4 hover:bg-stone-700 transition-colors text-center"
            >
              Explore Resort
            </Link>
            <Link
              href="/about"
              className="inline-block border border-stone-300 text-stone-700 text-xs tracking-widest uppercase px-10 py-4 hover:border-stone-900 transition-colors text-center"
            >
              Our Story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
