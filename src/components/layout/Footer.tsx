import Link from "next/link";
import NewsletterSection from "./NewsletterSection";

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
    </svg>
  );
}

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.99a8.18 8.18 0 004.78 1.52V7.04a4.86 4.86 0 01-1.01-.35z"/>
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-white mt-24">
      <NewsletterSection />

      {/* Links */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <p className="text-xs tracking-widest uppercase text-stone-400 mb-6">Shop</p>
            <ul className="space-y-3">
              {["New In", "Dresses", "Tops", "Bottoms", "Outerwear", "Best Sellers"].map((item) => (
                <li key={item}>
                  <Link href="/products" className="text-sm text-stone-300 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-stone-400 mb-6">Occasions</p>
            <ul className="space-y-3">
              {["Pre-Wedding", "Cocktail", "Event & Gala", "Resort", "Everyday Luxury"].map((item) => (
                <li key={item}>
                  <Link href="/products" className="text-sm text-stone-300 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-stone-400 mb-6">Help</p>
            <ul className="space-y-3">
              {[
                { label: "Shipping & Returns", href: "/shipping" },
                { label: "Size Guide", href: "/size-guide" },
                { label: "FAQ", href: "/faq" },
                { label: "Contact Us", href: "/contact" },
                { label: "Track Order", href: "/track" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-stone-300 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-stone-400 mb-6">About</p>
            <ul className="space-y-3">
              {[
                { label: "Our Story", href: "/about" },
                { label: "Sustainability", href: "/sustainability" },
                { label: "Careers", href: "/careers" },
                { label: "Press", href: "/press" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-stone-300 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-4">
                <p className="text-xs tracking-widest uppercase text-stone-400 mb-3">Follow Us</p>
                <div className="flex gap-3">
                  <a href="#" className="text-stone-400 hover:text-white transition-colors" aria-label="Instagram">
                    <InstagramIcon size={18} />
                  </a>
                  <a href="#" className="text-stone-400 hover:text-white transition-colors" aria-label="TikTok">
                    <TikTokIcon size={18} />
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-stone-700">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-500">
            © {new Date().getFullYear()} TeBoutique. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-stone-500 hover:text-stone-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-stone-500 hover:text-stone-300 transition-colors">
              Terms of Service
            </Link>
            <Link href="/admin" className="text-xs text-stone-600 hover:text-stone-400 transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
