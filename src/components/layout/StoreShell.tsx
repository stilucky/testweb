"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "../cart/CartDrawer";
import LocaleInit from "./LocaleInit";
import WelcomePopup from "./WelcomePopup";

export default function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin  = pathname.startsWith("/admin");
  const isHome   = pathname === "/";

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
