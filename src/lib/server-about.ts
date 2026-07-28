import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import type { AboutSettings } from "@/store/aboutStore";

export const ABOUT_SETTINGS_FILE =
  process.env.LUNELLE_ABOUT_SETTINGS_FILE ||
  join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads", "about-settings.json");

export async function readAboutSettings(): Promise<AboutSettings | null> {
  try {
    const raw = await readFile(ABOUT_SETTINGS_FILE, "utf8");
    const data = JSON.parse(raw) as Partial<AboutSettings>;

    if (!Array.isArray(data.sections) || !Array.isArray(data.posts)) return null;
    return { sections: data.sections, posts: data.posts };
  } catch {
    return null;
  }
}

export async function writeAboutSettings(settings: AboutSettings) {
  await mkdir(dirname(ABOUT_SETTINGS_FILE), { recursive: true });
  await writeFile(ABOUT_SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf8");
  return settings;
}
