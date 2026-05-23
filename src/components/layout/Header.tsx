"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, User, Menu, X, Heart } from "lucide-react";
import { navItems } from "@/lib/data";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const wishlistCount = useWishlistStore((s) => s.itemCount);
  const { currentUser, logout } = useAuthStore();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-stone-900 text-white text-xs text-center py-2 tracking-widest uppercase">
        Complimentary shipping on orders over $200
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 bg-white transition-shadow duration-300",
          scrolled ? "shadow-sm" : ""
        )}
      >
        <div className="max-w-screen-xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0"
            >
              <span
                className="text-2xl md:text-3xl tracking-[0.15em] uppercase"
                style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 400 }}
              >
                TeBoutique
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8 ml-8">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className="text-xs tracking-widest uppercase font-light text-stone-800 hover:text-black transition-colors py-6 inline-block"
                  >
                    {item.label}
                  </Link>

                  {item.children && item.children.length > 0 && activeDropdown === item.label && (
                    <div className="absolute top-full left-0 bg-white shadow-lg border-t border-stone-100 min-w-44 py-4 z-50">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-6 py-2 text-xs tracking-widest uppercase text-stone-600 hover:text-black hover:bg-stone-50 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-1 md:gap-3">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 hover:bg-stone-50 rounded transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              {/* Wishlist — desktop only */}
              <Link
                href="/wishlist"
                className="p-2 hover:bg-stone-50 rounded transition-colors hidden md:block relative"
                aria-label="Wishlist"
              >
                <Heart size={18} />
                {wishlistCount() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-stone-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount()}
                  </span>
                )}
              </Link>

              {/* User — desktop dropdown */}
              {currentUser ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 hover:bg-stone-50 rounded transition-colors"
                    aria-label="Account"
                  >
                    <div className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center text-[11px] font-medium tracking-wide">
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
                        { label: "My Account", href: "/account" },
                        { label: "Orders", href: "/account?tab=orders" },
                        { label: "Wishlist", href: "/wishlist" },
                        ...(currentUser.role === "admin" ? [{ label: "Admin Dashboard", href: "/admin" }] : []),
                      ].map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-xs tracking-widest uppercase text-stone-600 hover:text-black hover:bg-stone-50 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); router.push("/"); }}
                        className="block w-full text-left px-4 py-2.5 text-xs tracking-widest uppercase text-stone-400 hover:text-red-600 hover:bg-stone-50 transition-colors border-t border-stone-100 mt-1"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="p-2 hover:bg-stone-50 rounded transition-colors hidden md:block"
                  aria-label="Account"
                >
                  <User size={18} />
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-stone-50 rounded transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingBag size={18} />
                {itemCount() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-stone-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-stone-100 bg-white px-4 md:px-8 py-4">
            <div className="max-w-screen-xl mx-auto relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                autoFocus
                type="search"
                placeholder="Search for dresses, tops, occasions..."
                className="w-full pl-9 pr-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors bg-stone-50"
              />
            </div>
          </div>
        )}

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-stone-100 bg-white max-h-[85vh] overflow-y-auto">
            {/* Nav links */}
            {navItems.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className="block px-6 py-4 text-xs tracking-widest uppercase border-b border-stone-100"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children?.map((child) => (
                  <Link
                    key={child.label}
                    href={child.href}
                    className="block px-10 py-3 text-xs tracking-wider text-stone-500 border-b border-stone-50 bg-stone-50/50"
                    onClick={() => setMobileOpen(false)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}

            {/* Account section */}
            <div className="border-t border-stone-200 mt-1">
              {currentUser ? (
                <>
                  {/* User info */}
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100 bg-stone-50">
                    <div className="w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-medium shrink-0">
                      {currentUser.firstName[0]}{currentUser.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">
                        {currentUser.firstName} {currentUser.lastName}
                      </p>
                      <p className="text-xs text-stone-400 truncate">{currentUser.email}</p>
                    </div>
                  </div>

                  {/* Account links */}
                  {[
                    { label: "My Account", href: "/account", icon: User },
                    { label: "Orders", href: "/account?tab=orders", icon: ShoppingBag },
                    { label: "Wishlist", href: "/wishlist", icon: Heart },
                    ...(currentUser.role === "admin"
                      ? [{ label: "Admin Dashboard", href: "/admin", icon: User }]
                      : []),
                  ].map(({ label, href, icon: Icon }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-6 py-4 text-xs tracking-widest uppercase border-b border-stone-100 text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <Icon size={15} className="text-stone-400 shrink-0" />
                      {label}
                    </Link>
                  ))}

                  {/* Sign out */}
                  <button
                    onClick={() => { logout(); setMobileOpen(false); router.push("/"); }}
                    className="flex items-center gap-3 w-full px-6 py-4 text-xs tracking-widest uppercase text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X size={15} className="shrink-0" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="px-6 py-4 flex flex-col gap-3">
                  <Link
                    href="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 py-3 bg-stone-900 text-white text-xs tracking-widest uppercase"
                  >
                    <User size={14} />
                    Sign In
                  </Link>
                  <Link
                    href="/auth?tab=register"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 py-3 border border-stone-200 text-stone-700 text-xs tracking-widest uppercase"
                  >
                    Create Account
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
