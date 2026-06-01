import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "EN" | "FR";
export type Currency = "USD" | "CAD";

const CAD_RATE = 1.38; // 1 USD = 1.38 CAD (fixed reference rate)

interface LocaleState {
  language: Language;
  currency: Currency;
  geoDetected: boolean;
  setLanguage: (l: Language) => void;
  setCurrency: (c: Currency) => void;
  /** Called once on first visit — detects country via IP, sets CAD+EN for Canada */
  initFromGeo: () => Promise<void>;
  /** Convert a USD price to the active currency */
  convert: (usdPrice: number) => number;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      language: "EN",
      currency: "USD",
      geoDetected: false,

      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),

      initFromGeo: async () => {
        if (get().geoDetected) return;
        try {
          const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(4000) });
          const data = await res.json();
          if (data?.country_code === "CA") {
            set({ language: "EN", currency: "CAD", geoDetected: true });
          } else {
            set({ geoDetected: true });
          }
        } catch {
          set({ geoDetected: true });
        }
      },

      convert: (usdPrice: number) => {
        const { currency } = get();
        return currency === "CAD" ? Math.round(usdPrice * CAD_RATE) : usdPrice;
      },
    }),
    { name: "lunelle-locale" }
  )
);

/**
 * Format a price in the current currency.
 * If cadPrice is provided and currency === "CAD", use it directly (no conversion).
 * Otherwise fall back to converting usdPrice × CAD_RATE.
 */
export function formatLocalPrice(
  usdPrice: number,
  currency: Currency,
  cadPrice?: number
): string {
  if (currency === "CAD") {
    const amount = cadPrice !== undefined ? cadPrice : Math.round(usdPrice * CAD_RATE);
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(usdPrice);
}
