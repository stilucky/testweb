import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import type { HomeFeature } from "@/store/homeFeatureStore";

export type HomeFeatureSettings = {
  features: HomeFeature[];
};

export const HOME_FEATURES_FILE =
  process.env.LUNELLE_HOME_FEATURES_FILE ||
  join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads", "home-features.json");

export async function readHomeFeatureSettings(): Promise<HomeFeatureSettings | null> {
  try {
    const raw = await readFile(HOME_FEATURES_FILE, "utf8");
    const data = JSON.parse(raw) as Partial<HomeFeatureSettings>;

    if (!Array.isArray(data.features)) return null;
    return { features: data.features };
  } catch {
    return null;
  }
}

export async function writeHomeFeatureSettings(settings: HomeFeatureSettings) {
  await mkdir(dirname(HOME_FEATURES_FILE), { recursive: true });
  await writeFile(HOME_FEATURES_FILE, JSON.stringify(settings, null, 2), "utf8");
  return settings;
}
