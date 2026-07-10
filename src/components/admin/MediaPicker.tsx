"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, Trash2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadImageFiles, useMediaLibraryStore, type MediaAsset } from "@/store/mediaLibraryStore";

type MediaPickerProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
};

function formatSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default function MediaPicker({ open, title = "Media Library", onClose, onSelect }: MediaPickerProps) {
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[86vh] w-full max-w-4xl flex-col overflow-hidden bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-widests text-stone-400">Choose Image</p>
            <h2 className="text-lg font-light text-stone-900">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-stone-400 transition-colors hover:text-stone-900">
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-stone-100 p-5">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex w-full flex-col items-center justify-center gap-2 border-2 border-dashed border-stone-200 bg-stone-50/60 py-7 text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-900 disabled:cursor-wait disabled:opacity-60"
          >
            <Upload size={20} />
            <span className="text-xs uppercase tracking-widests">{uploading ? "Uploading..." : "Upload Images"}</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {assets.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center text-stone-400">
              <ImageIcon size={30} className="mb-3 text-stone-300" />
              <p className="text-sm">No images in the library yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {assets.map((asset) => (
                <div key={asset.id} className="group border border-stone-100 bg-white">
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(asset);
                      onClose();
                    }}
                    className="block w-full text-left"
                  >
                    <span className="block aspect-square overflow-hidden bg-stone-100">
                      <img src={asset.url} alt={asset.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </span>
                    <span className="block min-w-0 px-3 py-2">
                      <span className="block truncate text-xs text-stone-700">{asset.name}</span>
                      <span className="block text-[10px] uppercase tracking-wide text-stone-400">{formatSize(asset.size)}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAsset(asset.id)}
                    className={cn(
                      "mx-3 mb-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widests text-red-400 transition-colors hover:text-red-600"
                    )}
                  >
                    <Trash2 size={11} />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
