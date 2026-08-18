import type { Metadata } from "next";
import { Suspense } from "react";
import { Cormorant_Garamond, Jost, GFS_Didot } from "next/font/google";
import "./globals.css";
import StoreShell from "@/components/layout/StoreShell";
import NavigationProgress from "@/components/layout/NavigationProgress";

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
    default: "Lunelle",
    template: "%s | Lunelle",
  },
  description:
    "Discover made-to-order and customized fashion crafted with intention.",
  keywords: ["fashion", "boutique", "luxury", "tailored", "made to order", "customized fit"],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lunelle.com",
    siteName: "Lunelle",
    title: "Lunelle",
    description: "Fashion crafted with intention.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jost.variable} ${cormorant.variable} ${didot.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <StoreShell>{children}</StoreShell>
      </body>
    </html>
  );
}
