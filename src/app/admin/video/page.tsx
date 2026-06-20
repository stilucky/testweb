"use client";

import { useState, useRef } from "react";
import { Play, Upload, Video, Eye, EyeOff, Save, Trash2, AlertCircle } from "lucide-react";
import { useVideoStore, BrandVideo } from "@/store/videoStore";
import { cn } from "@/lib/utils";

type VideoType = "youtube" | "native";

function getYoutubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?/]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminVideoPage() {
  const { brandVideo, enabled, setBrandVideo, setEnabled, clearBrandVideo } = useVideoStore();

  const [videoType, setVideoType] = useState<VideoType>(brandVideo?.type ?? "youtube");
  const [youtubeUrl, setYoutubeUrl] = useState(
    brandVideo?.type === "youtube" ? brandVideo.url : ""
  );
  const [nativeUrl, setNativeUrl] = useState(
    brandVideo?.type === "native" ? brandVideo.url : ""
  );
  const [title, setTitle] = useState(brandVideo?.title ?? "The Lunelle Film");
  const [subtitle, setSubtitle] = useState(brandVideo?.subtitle ?? "");
  const [ctaLabel, setCtaLabel] = useState(brandVideo?.ctaLabel ?? "Watch Now");
  const [ctaHref, setCtaHref] = useState(brandVideo?.ctaHref ?? "/products");
  const [uploadWarning, setUploadWarning] = useState("");
  const [saved, setSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoUpload = (file: File) => {
    setUploadWarning("");
    if (!file.type.startsWith("video/")) {
      setUploadWarning("File must be a video (MP4, WebM, MOV...)");
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      setUploadWarning(`File quá lớn (${formatBytes(file.size)}). Tối đa 200 MB. Dùng YouTube URL cho video dài.`);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadWarning(`Video lớn (${formatBytes(file.size)}) — sẽ mất thời gian tải. Khuyến nghị dùng YouTube.`);
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) setNativeUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const url = videoType === "youtube" ? youtubeUrl.trim() : nativeUrl;
    if (!url) return;

    const video: BrandVideo = {
      url,
      type: videoType,
      title: title.trim() || "The Lunelle Film",
      subtitle: subtitle.trim(),
      ctaLabel: ctaLabel.trim() || "Watch Now",
      ctaHref: ctaHref.trim() || "#video",
    };
    setBrandVideo(video);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const youtubeId = videoType === "youtube" ? getYoutubeId(youtubeUrl) : null;
  const hasVideo = videoType === "youtube" ? !!youtubeId : !!nativeUrl;

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-1">Homepage</p>
        <h1 className="text-xl font-light text-stone-900">Brand Video</h1>
        <p className="text-sm text-stone-400 mt-1">
          Hiển thị video thương hiệu giữa trang chủ. Hỗ trợ YouTube và video upload trực tiếp.
        </p>
      </div>

      {/* Enable toggle */}
      <div className="flex items-center justify-between p-5 border border-stone-200 mb-6">
        <div>
          <p className="text-sm font-medium text-stone-800">Hiển thị Video Section</p>
          <p className="text-xs text-stone-400 mt-0.5">Bật/tắt phần video trên trang chủ</p>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={cn(
            "relative w-11 h-6 rounded-full transition-colors duration-200",
            enabled ? "bg-stone-900" : "bg-stone-200"
          )}
        >
          <span
            className={cn(
              "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200",
              enabled ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
      </div>

      <div className={cn("space-y-6 transition-opacity", !enabled && "opacity-40 pointer-events-none")}>

        {/* Video type selector */}
        <div>
          <p className="text-[10px] tracking-widest uppercase text-stone-500 mb-3">Nguồn video</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setVideoType("youtube")}
              className={cn(
                "flex items-center gap-3 p-4 border transition-all text-left",
                videoType === "youtube"
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 text-stone-600 hover:border-stone-400"
              )}
            >
              <Play size={18} />
              <div>
                <p className="text-xs font-medium">YouTube / Vimeo</p>
                <p className={cn("text-[10px]", videoType === "youtube" ? "text-white/60" : "text-stone-400")}>
                  Dán URL từ YouTube
                </p>
              </div>
            </button>
            <button
              onClick={() => setVideoType("native")}
              className={cn(
                "flex items-center gap-3 p-4 border transition-all text-left",
                videoType === "native"
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 text-stone-600 hover:border-stone-400"
              )}
            >
              <Video size={18} />
              <div>
                <p className="text-xs font-medium">Upload file</p>
                <p className={cn("text-[10px]", videoType === "native" ? "text-white/60" : "text-stone-400")}>
                  MP4, WebM, MOV (tối đa 200 MB)
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* YouTube URL */}
        {videoType === "youtube" && (
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-stone-500 mb-2">
              YouTube URL
            </label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
            />
            {youtubeUrl && !youtubeId && (
              <p className="mt-1 text-xs text-amber-500">URL không hợp lệ — cần youtube.com/watch?v= hoặc youtu.be/</p>
            )}
            {youtubeId && (
              <div className="mt-3 relative aspect-video bg-stone-100 overflow-hidden rounded">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <Play size={18} fill="white" className="text-white ml-0.5" />
                  </div>
                </div>
                <p className="absolute bottom-2 left-3 text-[10px] text-white/70 tracking-widest uppercase">
                  Preview — click to test on homepage
                </p>
              </div>
            )}
          </div>
        )}

        {/* Native video upload */}
        {videoType === "native" && (
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-stone-500 mb-2">
              Upload video
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleVideoUpload(file);
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleVideoUpload(file);
              }}
              className="w-full flex flex-col items-center gap-2 border-2 border-dashed border-stone-200 hover:border-stone-400 py-8 transition-colors bg-stone-50/50 hover:bg-stone-50"
            >
              <Upload size={22} className="text-stone-400" />
              <p className="text-sm text-stone-500">Click hoặc kéo thả video vào đây</p>
              <p className="text-xs text-stone-400">MP4, WebM, MOV — tối đa 200 MB</p>
            </button>

            {uploadWarning && (
              <div className="mt-3 flex items-start gap-2 text-amber-600 text-xs bg-amber-50 border border-amber-200 p-3">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                {uploadWarning}
              </div>
            )}

            {nativeUrl && (
              <div className="mt-3">
                <video
                  src={nativeUrl}
                  controls
                  className="w-full rounded border border-stone-200"
                  style={{ maxHeight: 280 }}
                />
                <button
                  onClick={() => { setNativeUrl(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="mt-2 flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={12} /> Xoá video
                </button>
              </div>
            )}
          </div>
        )}

        {/* Text settings */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px flex-1 bg-stone-100" />
            <span className="text-[10px] tracking-widest uppercase text-stone-400">Nội dung hiển thị</span>
            <div className="h-px flex-1 bg-stone-100" />
          </div>
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-stone-500 mb-2">Tiêu đề</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="The Lunelle Film"
              className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-stone-500 mb-2">Phụ đề</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Resort 2025 — A story of light and texture"
              className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] tracking-widest uppercase text-stone-500 mb-2">Nút CTA</label>
              <input
                type="text"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="Watch Now"
                className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-widest uppercase text-stone-500 mb-2">Link CTA</label>
              <input
                type="text"
                value={ctaHref}
                onChange={(e) => setCtaHref(e.target.value)}
                placeholder="/products"
                className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={!hasVideo}
            className="flex items-center gap-2 px-8 py-3 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors disabled:opacity-40"
          >
            <Save size={13} />
            {saved ? "Saved!" : "Save Changes"}
          </button>
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-6 py-3 border border-stone-200 text-stone-600 text-xs tracking-widest uppercase hover:bg-stone-50 transition-colors"
          >
            <Eye size={13} />
            Preview
          </a>
          {brandVideo && (
            <button
              onClick={() => { clearBrandVideo(); setNativeUrl(""); setYoutubeUrl(""); }}
              className="flex items-center gap-2 px-4 py-3 text-red-400 text-xs tracking-widest uppercase hover:text-red-600 transition-colors"
            >
              <EyeOff size={13} />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
