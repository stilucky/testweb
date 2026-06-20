"use client";

import Link from "next/link";
import { useLocaleStore } from "@/store/localeStore";
import { useTranslations } from "@/lib/i18n";

function IconInstagram() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
    </svg>
  );
}
function IconPinterest() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
    </svg>
  );
}
function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M2 7l10 7 10-7"/>
    </svg>
  );
}

export default function Footer() {
  const language = useLocaleStore((s) => s.language);
  const t = useTranslations(language);

  const aboutLinks = [
    { label: t("ourStory"),       href: "/about" },
    { label: t("craftsmanship"),  href: "/about" },
    { label: t("sustainability"), href: "/about" },
    { label: t("press"),          href: "/about" },
    { label: t("contact"),        href: "/contact" },
  ];

  const careLinks = [
    { label: t("returns"),    href: "/returns" },
    { label: t("sizeGuide"),  href: "/size-guide" },
    { label: "FAQ",           href: "/faq" },
    { label: t("contact"),    href: "/contact" },
  ];

  return (
    <footer className="bg-stone-900 text-white mt-24">

      {/* ── Links grid ── */}
      <div className="px-6 md:px-12 xl:px-20 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="col-span-2">
            <p className="type-logo text-base mb-4">Lunelle</p>
            <p className="text-sm text-stone-400 leading-relaxed mb-6 max-w-xs">
              {t("footerDesc")}
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/Lunellestory.official"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram @Lunellestory.official"
                className="text-stone-500 hover:text-white transition-colors"
              >
                <IconInstagram />
              </a>
              <a
                href="https://www.pinterest.com/lunellestoryofficial"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest @lunellestoryofficial"
                className="text-stone-500 hover:text-white transition-colors"
              >
                <IconPinterest />
              </a>
              <a
                href="mailto:admin@lunellestory.ca"
                aria-label="Email admin@lunellestory.ca"
                className="text-stone-500 hover:text-white transition-colors"
              >
                <IconMail />
              </a>
            </div>
          </div>

          {/* About */}
          <div>
            <p className="text-[9px] tracking-[0.22em] uppercase text-stone-500 mb-5">{t("about")}</p>
            <ul className="space-y-2.5">
              {aboutLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-stone-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <p className="text-[9px] tracking-[0.22em] uppercase text-stone-500 mb-5">{t("customerCare")}</p>
            <ul className="space-y-2.5">
              {careLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-stone-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Member CTA card */}
          <div className="flex flex-col">
            <p className="text-[9px] tracking-[0.22em] uppercase text-stone-500 mb-5">Members Only</p>
            <div className="border border-stone-700 p-5 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-sm font-light text-white leading-snug mb-2">
                  Get <strong className="font-medium">10% off</strong> your first order
                </p>
                <p className="text-[11px] text-stone-400 leading-relaxed mb-5">
                  Create a free account for early access to Pre-Fall collections and exclusive member benefits.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  href="/auth?tab=register"
                  className="flex items-center justify-center py-2.5 bg-white text-stone-900 text-[10px] tracking-[0.18em] uppercase hover:bg-stone-100 transition-colors"
                >
                  Create Account
                </Link>
                <Link
                  href="/auth"
                  className="flex items-center justify-center py-2.5 border border-stone-700 text-stone-400 text-[10px] tracking-[0.18em] uppercase hover:border-stone-500 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-stone-800">
        <div className="px-6 md:px-12 xl:px-20 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-stone-600">
            &copy; {new Date().getFullYear()} Lunelle. {t("allRightsReserved")}
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-[11px] text-stone-600 hover:text-stone-300 transition-colors">
              {t("privacyPolicy")}
            </Link>
            <Link href="/terms" className="text-[11px] text-stone-600 hover:text-stone-300 transition-colors">
              {t("termsOfService")}
            </Link>
            <Link href="/admin" className="text-[11px] text-stone-700 hover:text-stone-500 transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
