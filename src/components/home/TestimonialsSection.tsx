const testimonials = [
  {
    id: 1,
    text: "I wore the Celestine Lace Dress to my sister's pre-wedding and received endless compliments. The quality and elegance are unmatched.",
    author: "Sophia M.",
    location: "New York",
    rating: 5,
  },
  {
    id: 2,
    text: "TeBoutique has become my go-to for special occasion dressing. Each piece feels like it was made for me personally.",
    author: "Linh N.",
    location: "Los Angeles",
    rating: 5,
  },
  {
    id: 3,
    text: "The Margot Slip Dress is everything. Incredibly versatile — I've worn it dressed up and down. Absolute perfection.",
    author: "Charlotte R.",
    location: "Toronto",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 px-4 md:px-8 max-w-screen-xl mx-auto">
      <div className="text-center mb-14">
        <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-3">
          Client Stories
        </p>
        <h2
          className="text-4xl md:text-5xl"
          style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
        >
          What Our Clients Say
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((t) => (
          <div key={t.id} className="text-center px-4">
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: t.rating }).map((_, i) => (
                <span key={i} className="text-stone-400 text-sm">★</span>
              ))}
            </div>
            <p
              className="text-stone-600 leading-relaxed mb-8 text-lg italic"
              style={{ fontFamily: "var(--font-cormorant), serif" }}
            >
              &ldquo;{t.text}&rdquo;
            </p>
            <div>
              <p className="text-sm font-medium tracking-wide">{t.author}</p>
              <p className="text-xs text-stone-400 mt-1 tracking-wider">{t.location}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
