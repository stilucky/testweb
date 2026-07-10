"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, Trash2, Upload } from "lucide-react";
import { normalizeMediaUrl, uploadImageFiles, useMediaLibraryStore } from "@/store/mediaLibraryStore";

function formatSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default function AdminMediaPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { assets, addAssets, removeAsset } = useMediaLibraryStore();

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const newAssets = await uploadImageFiles(files);
      if (newAssets.length > 0) addAssets(newAssets);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="type-label mb-1 text-stone-400">Assets</p>
          <h1 className="text-3xl text-stone-900 md:text-4xl" style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}>
            Media Library
          </h1>
          <p className="mt-1 text-sm text-stone-400">{assets.length} images saved for admin use</p>
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex shrink-0 items-center gap-2 bg-stone-900 px-4 py-2.5 text-xs uppercase tracking-widests text-white transition-colors hover:bg-stone-700 disabled:cursor-wait disabled:opacity-60"
        >
          <Upload size={13} />
          {uploading ? "Uploading" : "Upload"}
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*,.jfif,.ifif"
        multiple
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />

      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleUpload(e.dataTransfer.files);
        }}
        className="mb-6 flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-stone-200 bg-white py-10 text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-900"
      >
        <Upload size={22} />
        <p className="text-xs uppercase tracking-widests">Click or drag images here</p>
        <p className="text-[11px] text-stone-400">JPG, PNG, WEBP, GIF, JFIF</p>
      </div>

      {assets.length === 0 ? (
        <div className="border border-stone-100 bg-white py-20 text-center">
          <ImageIcon size={34} className="mx-auto mb-3 text-stone-200" />
          <p className="text-sm text-stone-400">Your media library is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {assets.map((asset) => (
            <div key={asset.id} className="group border border-stone-100 bg-white">
              <div className="aspect-square overflow-hidden bg-stone-100">
                <img src={normalizeMediaUrl(asset.url)} alt={asset.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              <div className="p-3">
                <p className="truncate text-xs text-stone-800">{asset.name}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wide text-stone-400">{formatSize(asset.size)}</p>
                <button
                  type="button"
                  onClick={() => removeAsset(asset.id)}
                  className="mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widests text-red-400 transition-colors hover:text-red-600"
                >
                  <Trash2 size={11} />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
