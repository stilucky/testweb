"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, User, Menu, X, Heart } from "lucide-react";
import { navItems } from "@/lib/data";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { useLocaleStore } from "@/store/localeStore";
import { useTranslations } from "@/lib/i18n";
import LocaleSelector from "./LocaleSelector";
import { cn } from "@/lib/utils";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const itemCount     = useCartStore((s) => s.itemCount);
  const toggleCart    = useCartStore((s) => s.toggleCart);
  const wishlistCount = useWishlistStore((s) => s.itemCount);
  const { currentUser, logout } = useAuthStore();
  const router = useRouter();
  const language = useLocaleStore((s) => s.language);
  const t = useTranslations(language);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* shared icon button styles */
  const iconBtn = "p-2 hover:bg-stone-50 rounded transition-colors relative";

  return (
    <>
      {/* ── Announcement bar ── */}
      <div className="bg-stone-900 text-white text-sm py-3 tracking-widest uppercase overflow-hidden">
        <div className="flex whitespace-nowrap" style={{ animation: "marquee 28s linear infinite" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="flex-shrink-0 px-16">
              {t("shipping200")} $200
              <span className="mx-8 opacity-40">·</span>
              {t("freeReturns")}
              <span className="mx-8 opacity-40">·</span>
              {t("newCollection")}
            </span>
          ))}
        </div>
        <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
      </div>

      <header className={cn("sticky top-0 z-50 bg-white transition-shadow duration-300", scrolled && "shadow-sm")}>
        <div className="max-w-screen-xl mx-auto px-4 md:px-8">

          {/* ══════════════════════════════════════
              ROW 1 — 3-col grid: left | LOGO | right
          ══════════════════════════════════════ */}
          <div className="grid grid-cols-3 items-center h-14 md:h-auto md:py-5">

            {/* Col 1 — hamburger (mobile only) */}
            <div className="flex items-center">
              <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {/* Col 2 — Logo + slogan, truly centered */}
            <Link href="/" className="flex flex-col items-center text-center">
              <span
                className="text-2xl md:text-3xl tracking-[0.2em] uppercase leading-none"
                style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 400 }}
              >
                Lunelle
              </span>
              <span className="hidden md:block text-[9px] tracking-[0.28em] uppercase text-stone-400 mt-1.5">
                Tailored Section Structure
              </span>
            </Link>

            {/* Col 3 — mobile icons (right-aligned) */}
            <div className="flex items-center justify-end gap-1 md:hidden">
              <button onClick={() => setSearchOpen(!searchOpen)} className={iconBtn} aria-label="Search">
                <Search size={18} />
              </button>
              <button onClick={toggleCart} className={iconBtn} aria-label="Cart">
                <ShoppingBag size={18} />
                {itemCount() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-stone-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount()}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════
              ROW 2 — 3-col grid: space | NAV | icons
          ══════════════════════════════════════ */}
          <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] items-center border-t border-stone-100 py-2.5">

            {/* Col 1 — left spacer */}
            <div />

            {/* Col 2 — Nav, auto-width, truly centered */}
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
                    className="text-xs tracking-[0.18em] uppercase font-light text-stone-800 hover:text-black transition-colors py-1.5 inline-block"
                  >
                    {item.label}
                  </Link>

                  {/* Mega menu (groups) */}
                  {item.groups && activeDropdown === item.label && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 bg-white shadow-lg border-t border-stone-100 z-50 py-6 px-8 flex gap-10 min-w-max">
                      {item.groups.map((group, gi) => (
                        <div key={gi}>
                          {group.title && (
                            <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-3 font-medium">
                              {group.title}
                            </p>
                          )}
                          <ul className="space-y-2">
                            {group.items.map((child) => (
                              <li key={child.label}>
                                <Link href={child.href} className="block text-xs tracking-widest uppercase text-stone-600 hover:text-black transition-colors py-0.5">
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
                    <div className="absolute top-full left-1/2 -translate-x-1/2 bg-white shadow-lg border-t border-stone-100 min-w-44 py-4 z-50">
                      {item.children.map((child) => (
                        <Link key={child.label} href={child.href} className="block px-6 py-2 text-xs tracking-widest uppercase text-stone-600 hover:text-black hover:bg-stone-50 transition-colors">
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Col 3 — Icons, right-aligned */}
            <div className="flex items-center gap-1 justify-end">
              {/* Search */}
              <button onClick={() => setSearchOpen(!searchOpen)} className={iconBtn} aria-label="Search">
                <Search size={18} />
              </button>

              {/* Wishlist */}
              <Link href="/wishlist" className={iconBtn} aria-label="Wishlist">
                <Heart size={18} />
                {wishlistCount() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-stone-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount()}
                  </span>
                )}
              </Link>

              {/* User */}
              {currentUser ? (
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center p-1 hover:bg-stone-50 rounded transition-colors" aria-label="Account">
                    <div className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center text-[11px] font-medium">
                      {currentUser.firstName[0]}{currentUser.lastName[0]}
                    </div>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 bg-white border border-stone-100 shadow-lg min-w-48 py-2 z-50">
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
                          className="block px-4 py-2.5 text-xs tracking-widest uppercase text-stone-600 hover:text-black hover:bg-stone-50 transition-colors">
                          {item.label}
                        </Link>
                      ))}
                      <button onClick={() => { logout(); setUserMenuOpen(false); router.push("/"); }}
                        className="block w-full text-left px-4 py-2.5 text-xs tracking-widest uppercase text-stone-400 hover:text-red-600 hover:bg-stone-50 transition-colors border-t border-stone-100 mt-1">
                        {t("signOut")}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth" className={iconBtn} aria-label="Account">
                  <User size={18} />
                </Link>
              )}

              {/* Cart */}
              <button onClick={toggleCart} className={iconBtn} aria-label="Cart">
                <ShoppingBag size={18} />
                {itemCount() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-stone-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount()}
                  </span>
                )}
              </button>

              <div className="w-px h-4 bg-stone-200 mx-1" />

              {/* Locale selector — ngoài cùng bên phải */}
              <LocaleSelector />
            </div>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-stone-100 bg-white px-4 md:px-8 py-4">
            <div className="max-w-screen-xl mx-auto relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input autoFocus type="search" placeholder={t("search")}
                className="w-full pl-9 pr-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors bg-stone-50" />
            </div>
          </div>
        )}

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-stone-100 bg-white max-h-[85vh] overflow-y-auto">
            {navItems.map((item) => (
              <div key={item.label}>
                <Link href={item.href} className="block px-6 py-4 text-sm tracking-[0.15em] uppercase border-b border-stone-100" onClick={() => setMobileOpen(false)}>
                  {item.label}
                </Link>
                {item.children?.map((child) => (
                  <Link key={child.label} href={child.href} className="block px-10 py-3 text-xs tracking-wider text-stone-500 border-b border-stone-50 bg-stone-50/50" onClick={() => setMobileOpen(false)}>
                    {child.label}
                  </Link>
                ))}
                {item.groups?.map((group) =>
                  group.items.map((child) => (
                    <Link key={child.label} href={child.href} className="block px-10 py-3 text-xs tracking-wider text-stone-500 border-b border-stone-50 bg-stone-50/50" onClick={() => setMobileOpen(false)}>
                      {group.title ? `${group.title} — ` : ""}{child.label}
                    </Link>
                  ))
                )}
              </div>
            ))}

            <div className="border-t border-stone-200 mt-1">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100 bg-stone-50">
                    <div className="w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-medium shrink-0">
                      {currentUser.firstName[0]}{currentUser.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{currentUser.firstName} {currentUser.lastName}</p>
                      <p className="text-xs text-stone-400 truncate">{currentUser.email}</p>
                    </div>
                  </div>
                  {[
                    { label: t("myAccount"), href: "/account", icon: User },
                    { label: t("orders"),    href: "/account?tab=orders", icon: ShoppingBag },
                    { label: t("wishlist"),  href: "/wishlist", icon: Heart },
                    ...(currentUser.role === "admin" ? [{ label: t("adminDash"), href: "/admin", icon: User }] : []),
                  ].map(({ label, href, icon: Icon }) => (
                    <Link key={label} href={href} onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-6 py-4 text-sm tracking-[0.15em] uppercase border-b border-stone-100 text-stone-700 hover:bg-stone-50 transition-colors">
                      <Icon size={15} className="text-stone-400 shrink-0" />
                      {label}
                    </Link>
                  ))}
                  <button onClick={() => { logout(); setMobileOpen(false); router.push("/"); }}
                    className="flex items-center gap-3 w-full px-6 py-4 text-xs tracking-widest uppercase text-red-500 hover:bg-red-50 transition-colors">
                    <X size={15} className="shrink-0" /> {t("signOut")}
                  </button>
                </>
              ) : (
                <div className="px-6 py-4 flex flex-col gap-3">
                  <Link href="/auth" onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 py-3 bg-stone-900 text-white text-xs tracking-widest uppercase">
                    <User size={14} /> {t("signIn")}
                  </Link>
                  <Link href="/auth?tab=register" onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 py-3 border border-stone-200 text-stone-700 text-xs tracking-widest uppercase">
                    {t("createAccount")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
