import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import type { Coupon } from "@/store/couponStore";

export type CouponSettings = {
  coupons: Coupon[];
};

export const COUPONS_FILE =
  process.env.LUNELLE_COUPONS_FILE ||
  join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads", "coupons.json");

export async function readCouponSettings(): Promise<CouponSettings | null> {
  try {
    const raw = await readFile(COUPONS_FILE, "utf8");
    const data = JSON.parse(raw) as Partial<CouponSettings>;

    if (!Array.isArray(data.coupons)) return null;
    return { coupons: data.coupons };
  } catch {
    return null;
  }
}

export async function writeCouponSettings(settings: CouponSettings) {
  await mkdir(dirname(COUPONS_FILE), { recursive: true });
  await writeFile(COUPONS_FILE, JSON.stringify(settings, null, 2), "utf8");
  return settings;
}
