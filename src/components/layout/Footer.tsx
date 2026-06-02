import Link from "next/link";
import FooterSubscribe from "./FooterSubscribe";

/* ── Social icons ── */
function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
    </svg>
  );
}
function IconPinterest() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
    </svg>
  );
}
function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M2 7l10 7 10-7"/>
    </svg>
  );
}

const shopLinks = [
  { label: "Pre-Fall 2026",   href: "/products?collection=pre-fall-2026" },
  { label: "Ready to Wear",   href: "/products" },
  { label: "Dresses",         href: "/products?category=dresses" },
  { label: "Tops",            href: "/products?category=tops" },
  { label: "Bottoms",         href: "/products?category=bottoms" },
  { label: "Sets",            href: "/products?category=sets" },
  { label: "Collection: Clair de Lune", href: "/products?collection=claire-de-lune" },
];

const tailoredLinks = [
  { label: "Made to Order",  href: "/tailored/made-to-order" },
  { label: "Customized Fit", href: "/tailored/customized-fit" },
];

const aboutLinks = [
  { label: "Our Story",      href: "/about" },
  { label: "Craftsmanship",  href: "/about" },
  { label: "Sustainability", href: "/about" },
  { label: "Press",          href: "/about" },
  { label: "Contact",        href: "/contact" },
];

const careLinks = [
  { label: "Shipping & Returns", href: "/shipping" },
  { label: "Size Guide",         href: "/size-guide" },
  { label: "FAQ",                href: "/faq" },
  { label: "Contact",            href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-white mt-24">

      {/* ══════════════════════════════════════
          STAY IN TOUCH — full-width own row
      ══════════════════════════════════════ */}
      <div className="border-b border-stone-800">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Left — heading */}
            <div>
              <p className="type-label text-stone-500 mb-4">
                Stay in Touch
              </p>
              <h4
                className="text-3xl md:text-4xl text-white leading-snug mb-3"
                style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
              >
                Get 10% off your first order
              </h4>
              <p className="text-sm text-stone-400 leading-relaxed">
                Subscribe to receive a personal discount code delivered straight to your inbox — plus new arrivals, exclusive stories, and early access to collections.
              </p>
            </div>

            {/* Right — form */}
            <div>
              <FooterSubscribe />
            </div>
          </div>
        </div>
      </div>

      {/* ── Links grid ── */}
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <p className="type-logo text-lg mb-4">
              Lunelle
            </p>
            <p className="text-sm text-stone-400 leading-relaxed mb-6">
              A modern luxury for women who value substance, elegance, and quiet
              confidence in every moment.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Instagram" className="text-stone-400 hover:text-white transition-colors">
                <IconInstagram />
              </a>
              <a href="#" aria-label="Pinterest" className="text-stone-400 hover:text-white transition-colors">
                <IconPinterest />
              </a>
              <a href="#" aria-label="Email" className="text-stone-400 hover:text-white transition-colors">
                <IconMail />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-5">Shop</p>
            <ul className="space-y-2.5">
              {shopLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-stone-300 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tailored */}
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-5">Tailored</p>
            <ul className="space-y-2.5">
              {tailoredLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-stone-300 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-5">About</p>
            <ul className="space-y-2.5">
              {aboutLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-stone-300 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-5">Customer Care</p>
            <ul className="space-y-2.5">
              {careLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-stone-300 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-stone-800">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-stone-600">
            © {new Date().getFullYear()} Lunelle. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-[11px] text-stone-600 hover:text-stone-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms"   className="text-[11px] text-stone-600 hover:text-stone-300 transition-colors">Terms of Service</Link>
            <Link href="/admin"   className="text-[11px] text-stone-700 hover:text-stone-500 transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
