"use client";
import { useLocaleStore } from "@/store/localeStore";
import { useTranslations } from "@/lib/i18n";

const testimonials = [
  { id: 1, text: "I wore the Celestine Lace Dress to my sister's pre-wedding and received endless compliments. The quality and elegance are unmatched.", author: "Sophia M.", location: "New York", rating: 5 },
  { id: 2, text: "Lunelle has become my go-to for special occasion dressing. Each piece feels like it was made for me personally.", author: "Linh N.", location: "Los Angeles", rating: 5 },
  { id: 3, text: "The Margot Slip Dress is everything. Incredibly versatile — I've worn it dressed up and down. Absolute perfection.", author: "Charlotte R.", location: "Toronto", rating: 5 },
];

const testimonialsFR = [
  { id: 1, text: "J'ai porté la robe Celestine au pré-mariage de ma soeur et j'ai reçu d'innombrables compliments. La qualité et l'élégance sont incomparables.", author: "Sophia M.", location: "New York", rating: 5 },
  { id: 2, text: "Lunelle est devenue ma référence pour les tenues de cérémonie. Chaque pièce semble avoir été faite pour moi.", author: "Linh N.", location: "Los Angeles", rating: 5 },
  { id: 3, text: "La robe Margot est parfaite. Incroyablement polyvalente — je l'ai portée habillée et décontractée. Absolument parfaite.", author: "Charlotte R.", location: "Toronto", rating: 5 },
];

export default function TestimonialsSection() {
  const language = useLocaleStore((s) => s.language);
  const t = useTranslations(language);
  const list = language === "FR" ? testimonialsFR : testimonials;

  return (
    <section className="py-20 px-4 md:px-8 max-w-screen-xl mx-auto">
      <div className="text-center mb-14">
        <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-3">
          {t("clientStories")}
        </p>
        <h2
          className="text-3xl md:text-4xl"
          style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
        >
          {t("whatClientsSay")}
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {list.map((item) => (
          <div key={item.id} className="text-center px-4">
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: item.rating }).map((_, i) => (
                <span key={i} className="text-stone-400 text-sm">&#9733;</span>
              ))}
            </div>
            <p
              className="text-stone-600 leading-relaxed mb-8 text-lg italic"
              style={{ fontFamily: "var(--font-cormorant), serif" }}
            >
              &ldquo;{item.text}&rdquo;
            </p>
            <div>
              <p className="text-sm font-medium tracking-wide">{item.author}</p>
              <p className="text-xs text-stone-400 mt-1 tracking-wider">{item.location}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
