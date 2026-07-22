import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import type { Collection } from "@/lib/collections";
import { UPLOAD_DIR } from "@/lib/server-media-library";

export type CollectionSettings = {
  collections: Collection[];
};

export const COLLECTIONS_FILE =
  process.env.LUNELLE_COLLECTIONS_FILE
  || join(UPLOAD_DIR, "collections.json");

export async function readCollectionSettings(): Promise<CollectionSettings | null> {
  try {
    const raw = await readFile(COLLECTIONS_FILE, "utf8");
    const data = JSON.parse(raw) as Partial<CollectionSettings>;
    if (!Array.isArray(data.collections)) return null;
    return { collections: data.collections };
  } catch {
    return null;
  }
}

export async function writeCollectionSettings(settings: CollectionSettings) {
  await mkdir(dirname(COLLECTIONS_FILE), { recursive: true });
  await writeFile(COLLECTIONS_FILE, JSON.stringify(settings, null, 2), "utf8");
  return settings;
}
