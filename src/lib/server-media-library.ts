import { mkdir, readFile, readdir, stat, unlink, writeFile } from "fs/promises";
import { basename, dirname, isAbsolute, join, normalize, resolve } from "path";

export type ServerMediaAsset = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
};

function defaultUploadDir() {
  const cwd = normalize(/*turbopackIgnore: true*/ process.cwd());
  const standaloneSuffix = normalize(join(".next", "standalone"));

  if (cwd.endsWith(standaloneSuffix)) {
    return join(cwd, "..", "..", "public", "uploads");
  }

  return join(cwd, "public", "uploads");
}

function resolveUploadDir() {
  const configuredDir = process.env.LUNELLE_UPLOAD_DIR;
  if (!configuredDir) return defaultUploadDir();
  if (isAbsolute(configuredDir)) return configuredDir;
  return resolve(defaultUploadDir(), "..", "..", configuredDir);
}

export const UPLOAD_DIR = resolveUploadDir();
export const MEDIA_MANIFEST = join(UPLOAD_DIR, "media-library.json");

export const CONTENT_TYPES: Record<string, string> = {
  avif: "image/avif",
  gif: "image/gif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  m4v: "video/x-m4v",
  mov: "video/quicktime",
  mp4: "video/mp4",
  ogv: "video/ogg",
  png: "image/png",
  webm: "video/webm",
  webp: "image/webp",
};

const IMAGE_EXTENSIONS = new Set(["avif", "gif", "jpg", "jpeg", "png", "webp"]);

export function uploadUrl(filename: string) {
  return `/api/uploads/${basename(filename)}`;
}

export function uploadPath(filename: string) {
  return join(UPLOAD_DIR, basename(filename));
}

export async function ensureUploadDir() {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

export async function ensureUploadPath(filename: string) {
  await mkdir(dirname(uploadPath(filename)), { recursive: true });
}

function assetFromFile(filename: string, size: number, createdAt: string): ServerMediaAsset {
  const safeName = basename(filename);
  const ext = safeName.split(".").pop()?.toLowerCase() ?? "jpg";

  return {
    id: safeName,
    name: safeName,
    url: uploadUrl(safeName),
    type: CONTENT_TYPES[ext] ?? "image/*",
    size,
    createdAt,
  };
}

async function readManifest() {
  try {
    const raw = await readFile(MEDIA_MANIFEST, "utf8");
    const parsed = JSON.parse(raw) as ServerMediaAsset[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeManifest(assets: ServerMediaAsset[]) {
  await ensureUploadDir();
  await writeFile(MEDIA_MANIFEST, JSON.stringify(assets, null, 2), "utf8");
}

export async function listMediaAssets() {
  await ensureUploadDir();

  const manifest = await readManifest();
  const byId = new Map(manifest.map((asset) => [asset.id, asset]));
  const files = await readdir(UPLOAD_DIR);
  const assets: ServerMediaAsset[] = [];

  for (const file of files) {
    const ext = file.split(".").pop()?.toLowerCase() ?? "";
    if (!IMAGE_EXTENSIONS.has(ext)) continue;

    const fileStat = await stat(uploadPath(file));
    const existing = byId.get(file);
    assets.push({
      ...(existing ?? assetFromFile(file, fileStat.size, fileStat.birthtime.toISOString())),
      id: file,
      url: uploadUrl(file),
      size: fileStat.size,
      createdAt: existing?.createdAt ?? fileStat.birthtime.toISOString(),
    });
  }

  assets.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  await writeManifest(assets);
  return assets;
}

export async function addMediaAssets(assets: ServerMediaAsset[]) {
  const current = await listMediaAssets();
  const byId = new Map(current.map((asset) => [asset.id, asset]));

  for (const asset of assets) {
    byId.set(asset.id, asset);
  }

  const next = Array.from(byId.values()).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  await writeManifest(next);
  return next;
}

export async function removeMediaAsset(idOrFilename: string) {
  const safeName = basename(idOrFilename);
  await unlink(uploadPath(safeName)).catch(() => undefined);

  const current = await readManifest();
  const next = current.filter((asset) => asset.id !== safeName && basename(asset.url) !== safeName);
  await writeManifest(next);
  return next;
}
