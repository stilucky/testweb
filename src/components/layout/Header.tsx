"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, User, Menu, X, Heart, ChevronRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { useLocaleStore } from "@/store/localeStore";
import { useCollectionStore } from "@/store/collectionStore";
import { useTranslations } from "@/lib/i18n";
import LocaleSelector from "./LocaleSelector";
import { cn } from "@/lib/utils";

export default function Header() {
  const [mounted,        setMounted]        = useState(false);
  const [scrolled,       setScrolled]       = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen,     setSearchOpen]     = useState(false);
  const [userMenuOpen,   setUserMenuOpen]   = useState(false);
  const [hoveredGroup,   setHoveredGroup]   = useState<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const itemCount     = useCartStore((s) => s.itemCount);
  const toggleCart    = useCartStore((s) => s.toggleCart);
  const wishlistCount = useWishlistStore((s) => s.itemCount);
  const { currentUser, logout } = useAuthStore();
  const { collections } = useCollectionStore();
  const router   = useRouter();
  const pathname = usePathname();
  const language = useLocaleStore((s) => s.language);
  const displayLanguage = mounted ? language : "EN";
  const t        = useTranslations(displayLanguage);
  const displayCurrentUser = mounted ? currentUser : null;
  const displayItemCount = mounted ? itemCount() : 0;
  const displayWishlistCount = mounted ? wishlistCount() : 0;

  const activeCollections  = (mounted ? collections : []).filter((c) => c.status === "active");
  const featuredCollections = activeCollections.filter((c) => c.featured);
  const otherCollections    = activeCollections.filter((c) => !c.featured);
  const aboutLinks = [
    { label: "Origin",   href: "/about/origin" },
    { label: "Universe", href: "/about/universe" },
    { label: "Angels",   href: "/about/angels" },
    { label: "Mantra",   href: "/about/mantra" },
  ];

  /* transparent only on homepage when not scrolled */
  const isHome        = pathname === "/";
  const isTransparent = isHome && !scrolled && !searchOpen && !mobileOpen;

  const navItems = [
    {
      label: t("newIn"),
      href: "/products?filter=new",
    },
    {
      label: t("shop"),
      href: "/products",
      groups: [
        ...(featuredCollections.length > 0
          ? [{
              flyout: false,
              items: featuredCollections.map((c) => ({
                label: c.name,
                href: `/products?collection=${c.slug}`,
              })),
            }]
          : []),
        {
          title: t("readyToWear"),
          flyout: false,
          items: [
            { label: t("dresses"), href: "/products?category=dresses" },
            { label: t("tops"), href: "/products?category=tops" },
            { label: t("bottoms"), href: "/products?category=bottoms" },
            { label: t("sets"), href: "/products?category=sets" },
          ],
        },
        ...(otherCollections.length > 0
          ? [{
              title: t("collections"),
              flyout: false,
              items: otherCollections.map((c) => ({
                label: c.name,
                href: `/products?collection=${c.slug}`,
              })),
            }]
          : []),
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
      children: aboutLinks,
    },
  ];

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  /* icon / text color */
  const textColor   = isTransparent ? "text-white"       : "text-stone-700";
  const hoverColor  = isTransparent ? "hover:text-white/70" : "hover:text-black";
  const iconColor   = isTransparent ? "text-white"       : "text-stone-600";
  const logoColor   = isTransparent ? "text-white"       : "text-stone-900";

  return (
    <>
      {/* ══════════════════════════════════════════════════
          HEADER — fixed, transparent on hero, opaque on scroll
      ══════════════════════════════════════════════════ */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          isTransparent
            ? "bg-transparent"
            : "bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.08)]"
        )}
      >
        <div className="px-6 md:px-12 xl:px-20">

          {/* ── Desktop single row ── */}
          <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] items-center h-20">

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
                    className={cn(
                      "type-nav transition-all py-1.5 px-3 inline-block rounded-full",
                      activeDropdown === item.label
                        ? isTransparent ? "bg-white/15 text-white" : "bg-stone-100 text-stone-900"
                        : cn(textColor, hoverColor, isTransparent ? "hover:bg-white/10" : "hover:bg-stone-100")
                    )}
                  >
                    {item.label}
                  </Link>

                  {/* Mega menu — vertical
                      Outer wrapper starts at top-full with pt-2 transparent padding
                      so mouse stays in hover zone while crossing the visual gap */}
                  {item.groups && activeDropdown === item.label && (
                    <div
                      className="absolute top-full left-0 z-50 pt-2 min-w-[220px]"
                      onMouseLeave={() => setHoveredGroup(null)}
                    >
                      <div className="bg-white rounded-2xl shadow-xl border border-stone-100/80 py-3 overflow-hidden">
                        {item.groups.map((group, gi) => {
                          const isFlyout = !!group.flyout;
                          return (
                            <div
                              key={gi}
                              className="relative"
                              onMouseEnter={() => isFlyout ? setHoveredGroup(gi) : setHoveredGroup(null)}
                            >
                              {gi > 0 && <div className="mx-4 my-2 border-t border-stone-100" />}

                              {group.title && isFlyout ? (
                                <Link
                                  href="/products"
                                  className="flex items-center justify-between mx-2 px-3 py-2.5 text-[15px] font-light text-stone-600 hover:text-black hover:bg-stone-50 rounded-xl transition-all duration-150"
                                >
                                  <span>{group.title}</span>
                                  <ChevronRight size={13} className="text-stone-300 ml-3" />
                                </Link>
                              ) : group.title ? (
                                <Link
                                  href="/products"
                                  className={cn(
                                    "block px-5 pt-2 pb-1 text-[10px] tracking-[0.2em] uppercase transition-colors",
                                    group.title === t("collections")
                                      ? "font-semibold text-stone-700 hover:text-stone-950"
                                      : "text-stone-400 hover:text-stone-700"
                                  )}
                                >
                                  {group.title}
                                </Link>
                              ) : null}

                              {!isFlyout && (
                                <ul className="px-2">
                                  {group.items.map((child) => (
                                    <li key={child.label}>
                                      <Link
                                        href={child.href}
                                        className={cn(
                                          "block px-3 py-2.5 text-[15px] hover:text-black hover:bg-stone-50 rounded-xl transition-all duration-150",
                                          child.href.includes("collection=")
                                            ? "font-medium text-stone-900"
                                            : "font-light text-stone-700"
                                        )}
                                      >
                                        {child.label}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}

                              {/* Flyout panel — pl-2 bridges the gap to the sub-panel */}
                              {isFlyout && hoveredGroup === gi && (
                                <div
                                  className="absolute left-full top-0 z-50 pl-2"
                                  onMouseEnter={() => setHoveredGroup(gi)}
                                  onMouseLeave={() => setHoveredGroup(null)}
                                >
                                  <div className="bg-white rounded-2xl shadow-xl border border-stone-100/80 min-w-[180px] py-3 px-2 overflow-hidden">
                                    {group.items.map((child) => (
                                      <Link
                                        key={child.label}
                                        href={child.href}
                                        className="block px-3 py-2.5 text-[15px] font-light text-stone-700 hover:text-black hover:bg-stone-50 rounded-xl transition-all duration-150"
                                      >
                                        {child.label}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Simple dropdown — same pt-2 bridge trick */}
                  {item.children && item.children.length > 0 && activeDropdown === item.label && (
                    <div className="absolute top-full left-0 z-50 pt-2 min-w-[180px]">
                      <div className="bg-white rounded-2xl shadow-xl border border-stone-100/80 py-3 px-2 overflow-hidden">
                        {item.children.map((child) => (
                          <Link key={child.label} href={child.href}
                            className="block px-3 py-2.5 text-[15px] font-light text-stone-700 hover:text-black hover:bg-stone-50 rounded-xl transition-all duration-150">
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* CENTER — Logo */}
            <Link href="/" className="flex items-center justify-center px-10">
              <span
                className={cn("type-logo transition-colors duration-300", logoColor)}
                style={{ fontSize: "clamp(22px, 2.2vw, 56px)" }}
              >
                Lunelle
              </span>
            </Link>

            {/* RIGHT — icons */}
            <div className="flex items-center justify-end gap-0.5">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={cn("flex items-center gap-1.5 px-3 py-2 text-base font-light transition-colors", iconColor, hoverColor)}
              >
                <Search size={18} strokeWidth={1.5} />
                <span className="hidden lg:block">Search</span>
              </button>

              {/* Account */}
              {displayCurrentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={cn("flex items-center gap-1.5 px-3 py-2 text-base font-light transition-colors", iconColor, hoverColor)}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium",
                      isTransparent ? "bg-white/20 text-white border border-white/40" : "bg-stone-900 text-white"
                    )}>
                      {displayCurrentUser.firstName[0]}{displayCurrentUser.lastName[0]}
                    </div>
                    <span className="hidden lg:block">{t("myAccount")}</span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-stone-100 shadow-lg min-w-48 py-2 z-50">
                      <div className="px-4 py-3 border-b border-stone-100">
                        <p className="text-sm font-medium text-stone-900">{displayCurrentUser.firstName} {displayCurrentUser.lastName}</p>
                        <p className="text-xs text-stone-400 mt-0.5 truncate">{displayCurrentUser.email}</p>
                      </div>
                      {[
                        { label: t("myAccount"), href: "/account" },
                        { label: t("orders"),    href: "/account?tab=orders" },
                        { label: t("wishlist"),  href: "/wishlist" },
                        ...(displayCurrentUser.role === "admin" ? [{ label: t("adminDash"), href: "/admin" }] : []),
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
                  className={cn("flex items-center gap-1.5 px-3 py-2 text-base font-light transition-colors", iconColor, hoverColor)}>
                  <User size={18} strokeWidth={1.5} />
                  <span className="hidden lg:block">{t("signIn")}</span>
                </Link>
              )}

              {/* Wishlist */}
              <Link href="/wishlist"
                className={cn("relative px-3 py-2 transition-colors", iconColor, hoverColor)}>
                <Heart size={18} strokeWidth={1.5} />
                {displayWishlistCount > 0 && (
                  <span className={cn(
                    "absolute top-1 right-1 text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center",
                    isTransparent ? "bg-white text-stone-900" : "bg-stone-900 text-white"
                  )}>
                    {displayWishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button onClick={toggleCart}
                className={cn("relative px-3 py-2 transition-colors", iconColor, hoverColor)}>
                <ShoppingBag size={18} strokeWidth={1.5} />
                {displayItemCount > 0 && (
                  <span className={cn(
                    "absolute top-1 right-1 text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center",
                    isTransparent ? "bg-white text-stone-900" : "bg-stone-900 text-white"
                  )}>
                    {displayItemCount}
                  </span>
                )}
              </button>

              {/* Locale */}
              <div className="ml-1">
                <LocaleSelector transparent={isTransparent} />
              </div>
            </div>
          </div>

          {/* ── Mobile row ── */}
          <div className="md:hidden grid grid-cols-3 items-center h-14">
            <div className="flex items-center">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={cn("p-2 -ml-2 transition-colors", iconColor)}
              >
                {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
              </button>
            </div>
            <Link href="/" className="flex justify-center">
              <span
                className={cn("text-xl tracking-[0.25em] uppercase transition-colors duration-300", logoColor)}
                style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 500 }}
              >
                Lunelle
              </span>
            </Link>
            <div className="flex items-center justify-end gap-0.5">
              <button onClick={() => setSearchOpen(!searchOpen)} className={cn("p-2 transition-colors", iconColor)}>
                <Search size={18} strokeWidth={1.5} />
              </button>
              <button onClick={toggleCart} className={cn("relative p-2 transition-colors", iconColor)}>
                <ShoppingBag size={18} strokeWidth={1.5} />
                {displayItemCount > 0 && (
                  <span className={cn(
                    "absolute top-1 right-1 text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center",
                    isTransparent ? "bg-white text-stone-900" : "bg-stone-900 text-white"
                  )}>
                    {displayItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Search overlay ── */}
        {searchOpen && (
          <div className="border-t border-stone-100 bg-white px-6 md:px-10 py-4">
            <div className="relative">
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
                  className="block px-6 py-4 text-sm font-light border-b border-stone-100 text-stone-800"
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
                      className={cn(
                        "block px-10 py-3 text-sm border-b border-stone-50 bg-stone-50/50",
                        child.href.includes("collection=")
                          ? "font-semibold text-stone-800"
                          : "font-light text-stone-400"
                      )}
                      onClick={() => setMobileOpen(false)}>
                      {group.title ? `${group.title} — ` : ""}{child.label}
                    </Link>
                  ))
                )}
              </div>
            ))}

            <div className="border-t border-stone-200">
              {displayCurrentUser ? (
                <>
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100 bg-stone-50">
                    <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-medium">
                      {displayCurrentUser.firstName[0]}{displayCurrentUser.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{displayCurrentUser.firstName} {displayCurrentUser.lastName}</p>
                      <p className="text-xs text-stone-400">{displayCurrentUser.email}</p>
                    </div>
                  </div>
                  {[
                    { label: t("myAccount"), href: "/account" },
                    { label: t("orders"),    href: "/account?tab=orders" },
                    { label: t("wishlist"),  href: "/wishlist" },
                    ...(displayCurrentUser.role === "admin" ? [{ label: t("adminDash"), href: "/admin" }] : []),
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
