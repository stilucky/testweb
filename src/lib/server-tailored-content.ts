import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import type { TailoredImage } from "@/store/tailoredContentStore";

export type TailoredContentSettings = {
  images: TailoredImage[];
};

export const TAILORED_CONTENT_FILE =
  process.env.LUNELLE_TAILORED_CONTENT_FILE ||
  join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads", "tailored-content.json");

export async function readTailoredContentSettings(): Promise<TailoredContentSettings | null> {
  try {
    const raw = await readFile(TAILORED_CONTENT_FILE, "utf8");
    const data = JSON.parse(raw) as Partial<TailoredContentSettings>;

    if (!Array.isArray(data.images)) return null;
    return { images: data.images };
  } catch {
    return null;
  }
}

export async function writeTailoredContentSettings(settings: TailoredContentSettings) {
  await mkdir(dirname(TAILORED_CONTENT_FILE), { recursive: true });
  await writeFile(TAILORED_CONTENT_FILE, JSON.stringify(settings, null, 2), "utf8");
  return settings;
}
