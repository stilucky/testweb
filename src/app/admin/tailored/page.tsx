"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, Upload } from "lucide-react";
import MediaPicker from "@/components/admin/MediaPicker";
import {
  tailoredImageByKey,
  useTailoredContentStore,
  type TailoredImage,
  type TailoredImageKey,
} from "@/store/tailoredContentStore";
import { uploadImageFiles, useMediaLibraryStore } from "@/store/mediaLibraryStore";

const imageKeys: TailoredImageKey[] = [
  "overviewMadeToOrder",
  "overviewCustomizedFit",
  "overviewClosing",
  "madeToOrderHero",
  "customizedFitHero",
];

export default function AdminTailoredPage() {
  const [mediaTarget, setMediaTarget] = useState<TailoredImageKey | null>(null);
  const images = useTailoredContentStore((state) => state.images);
  const setImages = useTailoredContentStore((state) => state.setImages);
  const updateImage = useTailoredContentStore((state) => state.updateImage);
  const addAssets = useMediaLibraryStore((state) => state.addAssets);

  useEffect(() => {
    const controller = new AbortController();

    Promise.resolve(useTailoredContentStore.persist.rehydrate())
      .then(() => fetch("/api/tailored", { cache: "no-store", signal: controller.signal }))
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        if (Array.isArray(data.images)) setImages(data.images);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.warn("[AdminTailoredPage] Failed to load tailored settings", err);
      });

    return () => controller.abort();
  }, [setImages]);

  const handleUpload = async (key: TailoredImageKey, file: File | null) => {
    if (!file) return;

    const [asset] = await uploadImageFiles([file]);
    if (asset) {
      addAssets([asset]);
      updateImage(key, { image: asset.url });
    }
  };

  const inputCls = "w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-800 transition-colors";

  return (
    <div className="p-4 md:p-8">
      <MediaPicker
        open={mediaTarget !== null}
        title="Tailored Images"
        onClose={() => setMediaTarget(null)}
        onSelect={(asset) => {
          if (mediaTarget) updateImage(mediaTarget, { image: asset.url });
        }}
      />

      <div className="mb-5 md:mb-8">
        <p className="type-label mb-1 text-stone-400">Tailored</p>
        <h1 className="text-3xl text-stone-900 md:text-4xl" style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}>
          Tailored Images
        </h1>
        <p className="mt-1 text-sm text-stone-400">Manage representative images for the tailored landing and service pages</p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {imageKeys.map((key) => {
          const image: TailoredImage = tailoredImageByKey(images, key);
          return (
            <div key={key} className="border border-stone-100 bg-white">
              <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                {image.image ? (
                  <img
                    src={image.image}
                    alt={image.title}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: image.imagePosition }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs uppercase tracking-widests text-stone-300">
                    No Image
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-white">{image.title}</p>
                </div>
              </div>

              <div className="space-y-4 p-4">
                <div>
                  <label className="mb-2 block text-[10px] uppercase tracking-widests text-stone-400">Title</label>
                  <input
                    value={image.title}
                    onChange={(e) => updateImage(key, { title: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] uppercase tracking-widests text-stone-400">Image URL</label>
                  <input
                    value={image.image}
                    onChange={(e) => updateImage(key, { image: e.target.value })}
                    className={inputCls}
                    placeholder="https://..."
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <input
                      id={`tailored-image-${key}`}
                      type="file"
                      accept="image/*,.jfif,.ifif"
                      className="sr-only"
                      onChange={(e) => handleUpload(key, e.target.files?.[0] ?? null)}
                    />
                    <label
                      htmlFor={`tailored-image-${key}`}
                      className="inline-flex cursor-pointer items-center gap-2 border border-stone-200 px-3 py-2 text-[10px] uppercase tracking-widests text-stone-600 transition-colors hover:border-stone-800 hover:text-stone-900"
                    >
                      <Upload size={12} />
                      Upload
                    </label>
                    <button
                      type="button"
                      onClick={() => setMediaTarget(key)}
                      className="inline-flex items-center gap-2 border border-stone-200 px-3 py-2 text-[10px] uppercase tracking-widests text-stone-600 transition-colors hover:border-stone-800 hover:text-stone-900"
                    >
                      <ImageIcon size={12} />
                      Library
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] uppercase tracking-widests text-stone-400">Image Position</label>
                  <input
                    value={image.imagePosition}
                    onChange={(e) => updateImage(key, { imagePosition: e.target.value })}
                    className={inputCls}
                    placeholder="50% 0%"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
