import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import StoreShell from "@/components/layout/StoreShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TeBoutique — Premium Fashion",
    template: "%s | TeBoutique",
  },
  description:
    "Discover curated luxury fashion at TeBoutique. Elegant dresses, occasion wear, and everyday luxury pieces.",
  keywords: ["fashion", "boutique", "luxury", "dresses", "occasion wear"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://teboutique.com",
    siteName: "TeBoutique",
    title: "TeBoutique — Premium Fashion",
    description: "Discover curated luxury fashion at TeBoutique.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="min-h-screen flex flex-col">
        <StoreShell>{children}</StoreShell>
      </body>
    </html>
  );
}
