import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = "CAD") {
  return new Intl.NumberFormat(currency === "CAD" ? "en-CA" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(price);
}

export function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
}
