import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, GFS_Didot } from "next/font/google";
import "./globals.css";
import StoreShell from "@/components/layout/StoreShell";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const didot = GFS_Didot({
  subsets: ["latin"],
  variable: "--font-didot",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Lunelle — Tailored Section Structure",
    template: "%s | Lunelle",
  },
  description:
    "Lunelle — Tailored Section Structure. Discover made-to-order and customized fashion crafted with intention.",
  keywords: ["fashion", "boutique", "luxury", "tailored", "made to order", "customized fit"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lunelle.com",
    siteName: "Lunelle",
    title: "Lunelle — Tailored Section Structure",
    description: "Lunelle — Tailored Section Structure. Fashion crafted with intention.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jost.variable} ${cormorant.variable} ${didot.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <StoreShell>{children}</StoreShell>
      </body>
    </html>
  );
}
