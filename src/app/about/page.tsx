import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "The story behind TeBoutique — where luxury meets craftsmanship.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[60vh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80"
          alt="About TeBoutique"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">
          <p className="text-xs tracking-[0.3em] uppercase mb-4 text-white/70">Est. 2020</p>
          <h1
            className="text-5xl md:text-7xl"
            style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
          >
            Our Story
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 px-4 md:px-8 max-w-screen-xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-6">Who We Are</p>
            <h2
              className="text-4xl md:text-5xl mb-8 leading-tight"
              style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
            >
              Fashion that tells your story
            </h2>
            <div className="space-y-5 text-stone-500 text-sm leading-relaxed">
              <p>
                TeBoutique was born from a passion for fashion that transcends trends — pieces that
                carry meaning, crafted with intention. Founded in 2020, we set out to create a
                curated destination for women who appreciate the artistry behind every stitch.
              </p>
              <p>
                Each piece in our collection is thoughtfully selected for its quality, its ability
                to make a woman feel confident and beautiful, and its versatility across life&apos;s most
                memorable moments — from intimate celebrations to grand occasions.
              </p>
              <p>
                We believe that exceptional fashion should feel personal. That&apos;s why we work with
                skilled artisans who share our commitment to craftsmanship, ensuring every piece
                meets our exacting standards before it reaches your wardrobe.
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80"
              alt="TeBoutique craftsmanship"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl"
              style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
            >
              Our Values
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "Craftsmanship",
                desc: "Every piece is selected for exceptional quality and artisanal skill. We partner only with makers who share our standards.",
              },
              {
                title: "Intentional Curation",
                desc: "We curate with purpose — fewer, better pieces that stand the test of time and serve as anchors in your wardrobe.",
              },
              {
                title: "Sustainability",
                desc: "We are committed to responsible sourcing, minimal packaging, and transparent production practices.",
              },
            ].map((v) => (
              <div key={v.title} className="text-center">
                <div className="w-12 h-px bg-stone-300 mx-auto mb-6" />
                <h3
                  className="text-2xl mb-4"
                  style={{ fontFamily: "var(--font-cormorant), serif" }}
                >
                  {v.title}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center px-4">
        <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-4">Discover the Collection</p>
        <h2
          className="text-4xl md:text-5xl mb-8"
          style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
        >
          Dress the life you imagine
        </h2>
        <Link
          href="/products"
          className="inline-block bg-stone-900 text-white text-xs tracking-widest uppercase px-12 py-4 hover:bg-stone-700 transition-colors"
        >
          Shop Collection
        </Link>
      </section>
    </>
  );
}
