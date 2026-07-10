import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

interface MediaLibraryStore {
  assets: MediaAsset[];
  setAssets: (assets: MediaAsset[]) => void;
  addAssets: (assets: Omit<MediaAsset, "id" | "createdAt">[]) => void;
  removeAsset: (id: string) => void;
}

export function normalizeMediaUrl(url: string) {
  if (!url) return url;

  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith("/uploads/")) {
      return parsed.pathname.replace(/^\/uploads\//, "/api/uploads/");
    }
    if (parsed.pathname.startsWith("/api/uploads/")) {
      return parsed.pathname;
    }
  } catch {
    if (url.startsWith("/uploads/")) {
      return url.replace(/^\/uploads\//, "/api/uploads/");
    }
  }

  return url;
}

export const useMediaLibraryStore = create<MediaLibraryStore>()(
  persist(
    (set) => ({
      assets: [],
      setAssets: (assets) =>
        set(() => ({
          assets: assets.map((asset) => ({ ...asset, url: normalizeMediaUrl(asset.url) })),
        })),
      addAssets: (assets) =>
        set((state) => ({
          assets: [
            ...assets.map((asset) => {
              const url = normalizeMediaUrl(asset.url);
              const filename = url.split("/").pop();
              return {
                ...asset,
                url,
                id: filename ?? `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                createdAt: new Date().toISOString(),
              };
            }),
            ...state.assets.map((asset) => ({ ...asset, url: normalizeMediaUrl(asset.url) })),
          ].filter((asset, index, all) => index === all.findIndex((item) => item.url === asset.url)),
        })),
      removeAsset: (id) =>
        set((state) => ({
          assets: state.assets.filter((asset) => {
            const filename = normalizeMediaUrl(asset.url).split("?")[0]?.split("/").filter(Boolean).pop();
            return asset.id !== id && filename !== id;
          }),
        })),
    }),
    {
      name: "lunelle-media-library",
      version: 3,
      migrate: (persisted: unknown) => {
        const state = persisted as Partial<MediaLibraryStore>;
        return {
          ...state,
          assets: (state.assets ?? []).map((asset) => ({
            ...asset,
            url: normalizeMediaUrl(asset.url),
          })),
        };
      },
    }
  )
);

const TARGET_IMAGE_SIZE = 9.5 * 1024 * 1024;
const MAX_CANVAS_EDGE = 2800;
const IMAGE_EXTENSIONS = /\.(avif|gif|ifif|jfif|jpe?g|png|webp)$/i;

function isImageFile(file: File) {
  return file.type.startsWith("image/") || IMAGE_EXTENSIONS.test(file.name);
}

function shouldNormalizeToJpeg(file: File) {
  return !file.type.startsWith("image/") || /\.(ifif|jfif)$/i.test(file.name);
}

function replaceExtension(name: string, extension: string) {
  const base = name.replace(/\.[^.]+$/, "") || "image";
  return `${base}.${extension}`;
}

async function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not compress image"));
      },
      "image/jpeg",
      quality
    );
  });
}

async function compressImageFile(file: File): Promise<File> {
  if (file.size <= TARGET_IMAGE_SIZE && !shouldNormalizeToJpeg(file)) return file;
  if (file.type === "image/svg+xml") return file;

  const imageUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.decoding = "async";
    image.src = imageUrl;
    await image.decode();

    let { width, height } = image;
    const largestEdge = Math.max(width, height);
    if (largestEdge > MAX_CANVAS_EDGE) {
      const scale = MAX_CANVAS_EDGE / largestEdge;
      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));
    }

    let quality = 0.86;
    let bestBlob: Blob | null = null;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is not supported");
      context.drawImage(image, 0, 0, width, height);

      const blob = await canvasToBlob(canvas, quality);
      bestBlob = blob;
      if (blob.size <= TARGET_IMAGE_SIZE) break;

      const scale = 0.82;
      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));
      quality = Math.max(0.55, quality - 0.06);
    }

    if (!bestBlob) return file;
    if (!shouldNormalizeToJpeg(file) && bestBlob.size > file.size) return file;

    return new File([bestBlob], replaceExtension(file.name, "jpg"), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export async function compressImageFiles(files: FileList | File[]): Promise<File[]> {
  const imageFiles = Array.from(files).filter(isImageFile);
  return Promise.all(imageFiles.map((file) => compressImageFile(file)));
}

export async function compressImageFileToDataUrl(file: File): Promise<string> {
  const compressed = await compressImageFile(file);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error(`Could not read ${file.name}`));
    };
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(compressed);
  });
}

export async function readImageFiles(files: FileList | File[]): Promise<Omit<MediaAsset, "id" | "createdAt">[]> {
  const imageFiles = Array.from(files).filter(isImageFile);
  const compressedFiles = await compressImageFiles(imageFiles);

  return Promise.all(
    compressedFiles.map(
      (file) =>
        new Promise<Omit<MediaAsset, "id" | "createdAt">>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === "string") {
              resolve({
                name: file.name,
                url: reader.result,
                type: file.type,
                size: file.size,
              });
            } else {
              reject(new Error(`Could not read ${file.name}`));
            }
          };
          reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
          reader.readAsDataURL(file);
        })
    )
  );
}

export async function uploadImageFiles(files: FileList | File[]): Promise<Omit<MediaAsset, "id" | "createdAt">[]> {
  const imageFiles = await compressImageFiles(files);
  if (imageFiles.length === 0) return [];

  const formData = new FormData();
  imageFiles.forEach((file) => formData.append("files", file));

  try {
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload failed");

    if (Array.isArray(data.assets)) {
      return (data.assets as MediaAsset[]).map((asset) => ({
        name: asset.name,
        url: normalizeMediaUrl(asset.url),
        type: asset.type,
        size: asset.size,
      }));
    }

    return (data.urls as string[]).map((url, index) => ({
      name: imageFiles[index]?.name ?? `image-${index + 1}`,
      url: normalizeMediaUrl(url),
      type: imageFiles[index]?.type ?? "image/*",
      size: imageFiles[index]?.size ?? 0,
    }));
  } catch {
    return readImageFiles(imageFiles);
  }
}

export async function fetchServerMediaAssets(): Promise<MediaAsset[]> {
  const res = await fetch("/api/media", { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to load media library");

  return ((data.assets ?? []) as MediaAsset[]).map((asset) => ({
    ...asset,
    url: normalizeMediaUrl(asset.url),
  }));
}

export function getMediaAssetFilename(asset: Pick<MediaAsset, "id" | "url">) {
  const normalizedUrl = normalizeMediaUrl(asset.url);
  const filename = normalizedUrl.split("?")[0]?.split("/").filter(Boolean).pop();
  return filename || asset.id;
}

export async function deleteServerMediaAsset(asset: MediaAsset | string): Promise<MediaAsset[]> {
  const id = typeof asset === "string" ? asset : getMediaAssetFilename(asset);
  const res = await fetch("/api/media", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to remove media");

  return ((data.assets ?? []) as MediaAsset[]).map((asset) => ({
    ...asset,
    url: normalizeMediaUrl(asset.url),
  }));
}
