import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import type { HeroSlide } from "@/store/heroStore";

export type HeroSettings = {
  slides: HeroSlide[];
  maxSlides: number;
  autoplayInterval: number;
};

export const HERO_SETTINGS_FILE =
  process.env.LUNELLE_HERO_SETTINGS_FILE ||
  join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads", "hero-settings.json");

export async function readHeroSettings(): Promise<HeroSettings | null> {
  try {
    const raw = await readFile(HERO_SETTINGS_FILE, "utf8");
    const data = JSON.parse(raw) as Partial<HeroSettings>;

    if (!Array.isArray(data.slides)) return null;

    return {
      slides: data.slides,
      maxSlides: Number.isFinite(data.maxSlides) ? Number(data.maxSlides) : 5,
      autoplayInterval: Number.isFinite(data.autoplayInterval) ? Number(data.autoplayInterval) : 5,
    };
  } catch {
    return null;
  }
}

export async function writeHeroSettings(settings: HeroSettings) {
  await mkdir(dirname(HERO_SETTINGS_FILE), { recursive: true });
  await writeFile(HERO_SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf8");
  return settings;
}
