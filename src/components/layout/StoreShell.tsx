"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "../cart/CartDrawer";
import LocaleInit from "./LocaleInit";
import WelcomePopup from "./WelcomePopup";
import { useAuthStore } from "@/store/authStore";
import { useProductStore } from "@/store/productStore";

export default function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentPath = pathname ?? "";
  const isAdmin  = currentPath.startsWith("/admin");
  const isHome   = currentPath === "/";
  const checkSessionExpiry = useAuthStore((s) => s.checkSessionExpiry);
  const setProducts = useProductStore((s) => s.setProducts);

  useEffect(() => {
    // Check session expiry immediately on mount, then every hour
    checkSessionExpiry();
    const interval = setInterval(checkSessionExpiry, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkSessionExpiry]);

  useEffect(() => {
    if (isAdmin) return;

    const controller = new AbortController();

    fetch("/api/shopify/products?limit=250", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        if (Array.isArray(data.products)) setProducts(data.products);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.warn("[StoreShell] Failed to sync Shopify products", err);
      });

    return () => controller.abort();
  }, [isAdmin, setProducts]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <LocaleInit />
      <Header />
      {/*
        Header is fixed (out of flow).
        - Homepage: hero is h-screen and starts at top=0, header overlays transparently → no padding needed.
        - All other pages: add pt-16 (header height) so content isn't hidden under header.
      */}
      <main className={isHome ? "flex-1" : "flex-1 pt-16"}>
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <WelcomePopup />
    </>
  );
}
