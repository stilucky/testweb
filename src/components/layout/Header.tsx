"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, User, Menu, X, Heart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { useLocaleStore } from "@/store/localeStore";
import { useTranslations } from "@/lib/i18n";
import LocaleSelector from "./LocaleSelector";
import { cn } from "@/lib/utils";

export default function Header() {
  const [scrolled,       setScrolled]       = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen,     setSearchOpen]     = useState(false);
  const [userMenuOpen,   setUserMenuOpen]   = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const itemCount     = useCartStore((s) => s.itemCount);
  const toggleCart    = useCartStore((s) => s.toggleCart);
  const wishlistCount = useWishlistStore((s) => s.itemCount);
  const { currentUser, logout } = useAuthStore();
  const router   = useRouter();
  const language = useLocaleStore((s) => s.language);
  const t        = useTranslations(language);

  const navItems = [
    {
      label: t("newIn"),
      href: "/products?filter=new",
    },
    {
      label: t("shop"),
      href: "/products",
      groups: [
        {
          items: [
            { label: "Pre-Fall 2026", href: "/products?collection=pre-fall-2026" },
          ],
        },
        {
          title: t("readyToWear"),
          items: [
            { label: t("dresses"),  href: "/products?category=dresses" },
            { label: t("tops"),     href: "/products?category=tops" },
            { label: t("bottoms"),  href: "/products?category=bottoms" },
            { label: t("sets"),     href: "/products?category=sets" },
          ],
        },
        {
          title: t("collections"),
          items: [
            { label: "Clair de Lune", href: "/products?collection=claire-de-lune" },
          ],
        },
      ],
    },
    {
      label: t("tailored"),
      href: "/tailored",
      children: [
        { label: t("madeToOrder"),   href: "/tailored/made-to-order" },
        { label: t("customizedFit"), href: "/tailored/customized-fit" },
      ],
    },
    {
      label: t("about"),
      href: "/about",
    },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  return (
    <>
      {/* ── Announcement bar ── */}
      <div className="bg-stone-900 text-white text-xs py-2.5 tracking-widest uppercase overflow-hidden">
        <div className="flex whitespace-nowrap" style={{ animation: "marquee 28s linear infinite" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="flex-shrink-0 px-16">
              {t("freeReturns")}
              <span className="mx-8 opacity-40">·</span>
              {t("newCollection")}
              <span className="mx-8 opacity-40">·</span>
              {language === "FR" ? "Retours gratuits sous 30 jours" : "Free returns within 30 days"}
            </span>
          ))}
        </div>
        <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
      </div>

      {/* ══════════════════════════════════════════════════
          HEADER — single row: nav | LUNELLE | icons
      ══════════════════════════════════════════════════ */}
      <header className={cn(
        "sticky top-0 z-50 bg-white transition-shadow duration-300",
        scrolled && "shadow-[0_1px_0_0_rgba(0,0,0,0.08)]"
      )}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">

          {/* ── Desktop single row ── */}
          <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] items-center h-16">

            {/* LEFT — nav items */}
            <nav className="flex items-center gap-7">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className="type-nav text-stone-700 hover:text-black transition-colors py-4 inline-block"
                  >
                    {item.label}
                  </Link>

                  {/* Mega menu */}
                  {item.groups && activeDropdown === item.label && (
                    <div className="absolute top-full left-0 bg-white shadow-lg border-t border-stone-100 z-50 py-5 px-6 flex gap-10 min-w-max">
                      {item.groups.map((group, gi) => (
                        <div key={gi}>
                          {group.title && (
                            <p className="text-[10px] tracking-[0.15em] uppercase text-stone-400 mb-3 font-medium">
                              {group.title}
                            </p>
                          )}
                          <ul className="space-y-2">
                            {group.items.map((child) => (
                              <li key={child.label}>
                                <Link href={child.href} className="block text-sm font-light text-stone-600 hover:text-black transition-colors py-0.5">
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Simple dropdown */}
                  {item.children && item.children.length > 0 && activeDropdown === item.label && (
                    <div className="absolute top-full left-0 bg-white shadow-lg border-t border-stone-100 min-w-40 py-3 z-50">
                      {item.children.map((child) => (
                        <Link key={child.label} href={child.href}
                          className="block px-5 py-2 text-sm font-light text-stone-600 hover:text-black hover:bg-stone-50 transition-colors">
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* CENTER — Logo */}
            <Link href="/" className="flex items-center justify-center px-10">
              <span
                className="type-logo"
                style={{ fontSize: "clamp(19px, 2vw, 52px)" }}
              >
                Lunelle
              </span>
            </Link>

            {/* RIGHT — icons */}
            <div className="flex items-center justify-end gap-0.5">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-light text-stone-600 hover:text-black transition-colors"
              >
                <Search size={16} strokeWidth={1.5} />
                <span className="hidden lg:block">Search</span>
              </button>

              {/* Account */}
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-light text-stone-600 hover:text-black transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-medium">
                      {currentUser.firstName[0]}{currentUser.lastName[0]}
                    </div>
                    <span className="hidden lg:block">{t("myAccount")}</span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-stone-100 shadow-lg min-w-48 py-2 z-50">
                      <div className="px-4 py-3 border-b border-stone-100">
                        <p className="text-sm font-medium">{currentUser.firstName} {currentUser.lastName}</p>
                        <p className="text-xs text-stone-400 mt-0.5 truncate">{currentUser.email}</p>
                      </div>
                      {[
                        { label: t("myAccount"), href: "/account" },
                        { label: t("orders"),    href: "/account?tab=orders" },
                        { label: t("wishlist"),  href: "/wishlist" },
                        ...(currentUser.role === "admin" ? [{ label: t("adminDash"), href: "/admin" }] : []),
                      ].map((item) => (
                        <Link key={item.label} href={item.href} onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm font-light text-stone-600 hover:text-black hover:bg-stone-50 transition-colors">
                          {item.label}
                        </Link>
                      ))}
                      <button onClick={() => { logout(); setUserMenuOpen(false); router.push("/"); }}
                        className="block w-full text-left px-4 py-2.5 text-sm font-light text-stone-400 hover:text-red-600 hover:bg-stone-50 transition-colors border-t border-stone-100 mt-1">
                        {t("signOut")}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-light text-stone-600 hover:text-black transition-colors">
                  <User size={16} strokeWidth={1.5} />
                  <span className="hidden lg:block">{t("signIn")}</span>
                </Link>
              )}

              {/* Wishlist */}
              <Link href="/wishlist"
                className="relative px-3 py-2 text-stone-600 hover:text-black transition-colors">
                <Heart size={16} strokeWidth={1.5} />
                {wishlistCount() > 0 && (
                  <span className="absolute top-1 right-1 bg-stone-900 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {wishlistCount()}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button onClick={toggleCart}
                className="relative px-3 py-2 text-stone-600 hover:text-black transition-colors">
                <ShoppingBag size={16} strokeWidth={1.5} />
                {itemCount() > 0 && (
                  <span className="absolute top-1 right-1 bg-stone-900 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {itemCount()}
                  </span>
                )}
              </button>

              {/* Locale */}
              <div className="ml-1">
                <LocaleSelector />
              </div>
            </div>
          </div>

          {/* ── Mobile row ── */}
          <div className="md:hidden grid grid-cols-3 items-center h-14">
            <div className="flex items-center">
              <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 -ml-2">
                {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
              </button>
            </div>
            <Link href="/" className="flex justify-center">
              <span className="text-xl tracking-[0.25em] uppercase"
                style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 500 }}>
                Lunelle
              </span>
            </Link>
            <div className="flex items-center justify-end gap-0.5">
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2">
                <Search size={18} strokeWidth={1.5} />
              </button>
              <button onClick={toggleCart} className="relative p-2">
                <ShoppingBag size={18} strokeWidth={1.5} />
                {itemCount() > 0 && (
                  <span className="absolute top-1 right-1 bg-stone-900 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {itemCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Search overlay ── */}
        {searchOpen && (
          <div className="border-t border-stone-100 bg-white px-6 md:px-10 py-4">
            <div className="max-w-screen-xl mx-auto relative">
              <Search size={15} className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                ref={searchRef}
                type="search"
                placeholder={t("search")}
                className="w-full pl-7 pr-4 py-2.5 text-sm font-light border-b border-stone-200 focus:outline-none focus:border-stone-800 transition-colors bg-transparent"
              />
              <button onClick={() => setSearchOpen(false)} className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900">
                <X size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── Mobile drawer ── */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-stone-100 max-h-[85vh] overflow-y-auto">
            {navItems.map((item) => (
              <div key={item.label}>
                <Link href={item.href}
                  className="block px-6 py-4 text-sm font-light border-b border-stone-100"
                  onClick={() => setMobileOpen(false)}>
                  {item.label}
                </Link>
                {item.children?.map((child) => (
                  <Link key={child.label} href={child.href}
                    className="block px-10 py-3 text-sm font-light text-stone-400 border-b border-stone-50 bg-stone-50/50"
                    onClick={() => setMobileOpen(false)}>
                    {child.label}
                  </Link>
                ))}
                {item.groups?.map((group) =>
                  group.items.map((child) => (
                    <Link key={child.label} href={child.href}
                      className="block px-10 py-3 text-sm font-light text-stone-400 border-b border-stone-50 bg-stone-50/50"
                      onClick={() => setMobileOpen(false)}>
                      {group.title ? `${group.title} — ` : ""}{child.label}
                    </Link>
                  ))
                )}
              </div>
            ))}

            <div className="border-t border-stone-200">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100 bg-stone-50">
                    <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-medium">
                      {currentUser.firstName[0]}{currentUser.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{currentUser.firstName} {currentUser.lastName}</p>
                      <p className="text-xs text-stone-400">{currentUser.email}</p>
                    </div>
                  </div>
                  {[
                    { label: t("myAccount"), href: "/account" },
                    { label: t("orders"),    href: "/account?tab=orders" },
                    { label: t("wishlist"),  href: "/wishlist" },
                    ...(currentUser.role === "admin" ? [{ label: t("adminDash"), href: "/admin" }] : []),
                  ].map(({ label, href }) => (
                    <Link key={label} href={href} onClick={() => setMobileOpen(false)}
                      className="block px-6 py-4 text-sm font-light border-b border-stone-100">
                      {label}
                    </Link>
                  ))}
                  <button onClick={() => { logout(); setMobileOpen(false); router.push("/"); }}
                    className="block w-full text-left px-6 py-4 text-sm font-light text-red-500">
                    {t("signOut")}
                  </button>
                </>
              ) : (
                <div className="px-6 py-4 flex flex-col gap-3">
                  <Link href="/auth" onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center py-3 bg-stone-900 text-white text-xs tracking-widest uppercase">
                    {t("signIn")}
                  </Link>
                  <Link href="/auth?tab=register" onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center py-3 border border-stone-200 text-stone-700 text-xs tracking-widest uppercase">
                    {t("createAccount")}
                  </Link>
                  <div className="pt-1">
                    <LocaleSelector />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
