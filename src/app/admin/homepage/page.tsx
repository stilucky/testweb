"use client";

import { useState } from "react";
import { Image as ImageIcon, Upload } from "lucide-react";
import MediaPicker from "@/components/admin/MediaPicker";
import { useHomeFeatureStore, type HomeFeature, type HomeFeatureKey } from "@/store/homeFeatureStore";
import { uploadImageFiles } from "@/store/mediaLibraryStore";

export default function AdminHomepagePage() {
  const [mediaTarget, setMediaTarget] = useState<HomeFeatureKey | null>(null);
  const homeFeatures = useHomeFeatureStore((state) => state.features);
  const updateHomeFeature = useHomeFeatureStore((state) => state.updateFeature);

  const handleHomeFeatureImageUpload = async (key: HomeFeatureKey, file: File | null) => {
    if (!file) return;

    const [asset] = await uploadImageFiles([file]);
    if (asset) updateHomeFeature(key, { image: asset.url });
  };

  const inputCls = "w-full px-3 md:px-4 py-2.5 md:py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors";

  return (
    <div className="p-4 md:p-8">
      <MediaPicker
        open={mediaTarget !== null}
        title="Homepage Images"
        onClose={() => setMediaTarget(null)}
        onSelect={(asset) => {
          if (mediaTarget) updateHomeFeature(mediaTarget, { image: asset.url });
        }}
      />

      <div className="mb-5 md:mb-8">
        <p className="type-label mb-1 text-stone-400">Homepage</p>
        <h1 className="text-3xl text-stone-900 md:text-4xl" style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}>
          Homepage
        </h1>
        <p className="mt-1 text-sm text-stone-400">Manage the two split feature images on the homepage</p>
      </div>

      <div className="bg-white border border-stone-100 p-4 md:p-8 space-y-5">
        <h2 className="text-xs tracking-widests uppercase font-medium border-b border-stone-100 pb-4">Homepage Split Images</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {homeFeatures.map((feature: HomeFeature) => (
            <div key={feature.key} className="border border-stone-100 bg-white">
              <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
                {feature.image ? (
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: feature.imagePosition }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs uppercase tracking-widests text-stone-300">
                    No Image
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-5 px-5 text-center text-white">
                  <p className="text-sm font-light uppercase tracking-[0.22em] drop-shadow">{feature.title}</p>
                </div>
              </div>
              <div className="space-y-4 p-4">
                <div>
                  <label className="block text-[10px] tracking-widests uppercase text-stone-400 mb-2">Title</label>
                  <input
                    type="text"
                    value={feature.title}
                    onChange={(e) => updateHomeFeature(feature.key, { title: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widests uppercase text-stone-400 mb-2">Link</label>
                  <input
                    type="text"
                    value={feature.href}
                    onChange={(e) => updateHomeFeature(feature.key, { href: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widests uppercase text-stone-400 mb-2">Image URL</label>
                  <input
                    type="text"
                    value={feature.image}
                    onChange={(e) => updateHomeFeature(feature.key, { image: e.target.value })}
                    className={inputCls}
                    placeholder="https://..."
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <input
                      id={`home-feature-image-${feature.key}`}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => handleHomeFeatureImageUpload(feature.key, e.target.files?.[0] ?? null)}
                    />
                    <label
                      htmlFor={`home-feature-image-${feature.key}`}
                      className="inline-flex cursor-pointer items-center gap-2 border border-stone-200 px-3 py-2 text-[10px] uppercase tracking-widests text-stone-600 transition-colors hover:border-stone-800 hover:text-stone-900"
                    >
                      <Upload size={12} />
                      Choose Image
                    </label>
                    <button
                      type="button"
                      onClick={() => setMediaTarget(feature.key)}
                      className="inline-flex items-center gap-2 border border-stone-200 px-3 py-2 text-[10px] uppercase tracking-widests text-stone-600 transition-colors hover:border-stone-800 hover:text-stone-900"
                    >
                      <ImageIcon size={12} />
                      Library
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] tracking-widests uppercase text-stone-400 mb-2">Image Position</label>
                  <input
                    type="text"
                    value={feature.imagePosition}
                    onChange={(e) => updateHomeFeature(feature.key, { imagePosition: e.target.value })}
                    className={inputCls}
                    placeholder="50% 35%"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
