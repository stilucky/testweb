import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import type { BrandVideo } from "@/store/videoStore";

export type VideoSettings = {
  brandVideo: BrandVideo | null;
  enabled: boolean;
};

export const VIDEO_SETTINGS_FILE =
  process.env.LUNELLE_VIDEO_SETTINGS_FILE ||
  join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads", "video-settings.json");

export async function readVideoSettings(): Promise<VideoSettings | null> {
  try {
    const raw = await readFile(VIDEO_SETTINGS_FILE, "utf8");
    const data = JSON.parse(raw) as Partial<VideoSettings>;

    return {
      brandVideo: data.brandVideo ?? null,
      enabled: data.enabled !== false,
    };
  } catch {
    return null;
  }
}

export async function writeVideoSettings(settings: VideoSettings) {
  await mkdir(dirname(VIDEO_SETTINGS_FILE), { recursive: true });
  await writeFile(VIDEO_SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf8");
  return settings;
}
