"use client";

import { useState, useRef } from "react";
import {
  Plus, Trash2, ChevronUp, ChevronDown,
  ImageIcon, Save, CheckCircle2, Eye, Settings2, Play, Video, Upload,
} from "lucide-react";
import { useHeroStore, HeroSlide } from "@/store/heroStore";
import { cn } from "@/lib/utils";
import MediaPicker from "@/components/admin/MediaPicker";
import { uploadImageFiles, useMediaLibraryStore } from "@/store/mediaLibraryStore";

function getYouTubeId(url: string): string | null {
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

const BLANK_SLIDE: Omit<HeroSlide, "id"> = {
  image: "",
  videoUrl: "",
  videoType: undefined,
  tag: "New Collection",
  title: "Title\nHere",
  subtitle: "A short subtitle for this slide",
  cta: "Shop Now",
  href: "/products",
  align: "center",
};

/* ── Slide thumbnail in list ── */
function SlideThumbnail({ slide }: { slide: HeroSlide }) {
  const ytId = slide.videoUrl && slide.videoType === "youtube"
    ? getYouTubeId(slide.videoUrl)
    : null;

  if (ytId) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <Play size={16} fill="white" className="text-white" />
        </div>
      </>
    );
  }
  if (slide.videoType === "native" && slide.videoUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-stone-800 gap-1">
        <Video size={18} className="text-white/60" />
        <span className="text-[9px] text-white/40 uppercase tracking-wide">Video</span>
      </div>
    );
  }
  if (slide.image) {
    return <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />;
  }
  return (
    <div className="flex items-center justify-center h-full">
      <ImageIcon size={20} className="text-stone-300" />
    </div>
  );
}

function SlidePreviewMedia({ slide }: { slide: HeroSlide }) {
  if (slide.videoType === "youtube" && slide.videoUrl) {
    const ytId = getYouTubeId(slide.videoUrl);
    if (ytId) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&rel=0`}
          allow="autoplay; encrypted-media"
          className="absolute inset-0 w-full h-full border-0"
        />
      );
    }
  }
  if (slide.videoType === "native" && slide.videoUrl) {
    return (
      <video src={slide.videoUrl} autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover" />
    );
  }
  if (slide.image) {
    return <img src={slide.image} alt={slide.title} className="absolute inset-0 h-full w-full object-cover" />;
  }
  return null;
}

export default function HeroAdminPage() {
  const {
    slides, maxSlides, autoplayInterval,
    addSlide, removeSlide, updateSlide, toggleSlideEnabled, moveSlide,
    setMaxSlides, setAutoplayInterval,
  } = useHeroStore();

  const [editing, setEditing]     = useState<string | null>(null);
  const [form, setForm]           = useState<Omit<HeroSlide, "id">>(BLANK_SLIDE);
  const [addingNew, setAddingNew] = useState(false);
  const [saved, setSaved]         = useState(false);
  const [preview, setPreview]     = useState<HeroSlide | null>(null);

  const canAdd = slides.length < maxSlides;

  const openEdit = (slide: HeroSlide) => {
    setEditing(slide.id);
    setAddingNew(false);
    setForm({
      image: slide.image,
      videoUrl: slide.videoUrl ?? "",
      videoType: slide.videoType,
      tag: slide.tag,
      title: slide.title,
      subtitle: slide.subtitle,
      cta: slide.cta,
      href: slide.href,
      align: slide.align,
    });
  };

  const saveEdit = () => {
    if (!editing) return;
    updateSlide(editing, form);
    setEditing(null);
    flash();
  };

  const saveNew = () => {
    const hasImage = !!form.image.trim();
    const hasVideo = !!form.videoUrl?.trim();
    if (!hasImage && !hasVideo) return;
    addSlide(form);
    setAddingNew(false);
    setForm(BLANK_SLIDE);
    flash();
  };

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const inputCls = "w-full px-3 py-2.5 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors bg-white";
  const labelCls = "block text-[10px] tracking-widests uppercase text-stone-400 mb-1.5";

  return (
    <div className="p-4 md:p-8 max-w-5xl">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="type-label text-stone-400 mb-1">Homepage</p>
          <h1 className="text-3xl text-stone-900" style={{ fontWeight: 300 }}>Hero Slides</h1>
          <p className="text-sm text-stone-400 mt-1">
            {slides.length} / {maxSlides} slides · Autoplay every {autoplayInterval}s
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-emerald-600 text-xs">
              <CheckCircle2 size={14} /> Saved
            </span>
          )}
          {canAdd && (
            <button
              onClick={() => { setAddingNew(true); setEditing(null); setForm(BLANK_SLIDE); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-xs tracking-widests uppercase hover:bg-stone-700 transition-colors"
            >
              <Plus size={13} /> Add Slide
            </button>
          )}
        </div>
      </div>

      {/* ── Global settings ── */}
      <div className="bg-white border border-stone-100 p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 size={14} className="text-stone-400" />
          <p className="text-xs tracking-widests uppercase text-stone-500">Slide Settings</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>Max Slides (1–10)</label>
            <input type="number" min={1} max={10} value={maxSlides}
              onChange={(e) => setMaxSlides(Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Autoplay Interval (sec)</label>
            <input type="number" min={2} max={30} value={autoplayInterval}
              onChange={(e) => setAutoplayInterval(Number(e.target.value))} className={inputCls} />
          </div>
          <div className="col-span-2 flex items-end">
            <p className="text-xs text-stone-400 leading-relaxed">
              Slides can be images or videos (YouTube / file upload). Video slides show a mute toggle in the hero.
            </p>
          </div>
        </div>
      </div>

      {/* ── Slide list ── */}
      <div className="space-y-3 mb-6">
        {slides.length === 0 && (
          <div className="bg-white border border-dashed border-stone-200 py-16 text-center">
            <ImageIcon size={32} className="mx-auto text-stone-200 mb-3" />
            <p className="text-sm text-stone-400">No slides yet. Add one to get started.</p>
          </div>
        )}

        {slides.map((slide, idx) => (
          <div key={slide.id} className="bg-white border border-stone-100">

            {/* ── Slide row ── */}
            <div className={cn("flex items-start gap-4 p-4", slide.enabled === false && "opacity-50")}>
              {/* Thumbnail */}
              <div className="w-28 h-20 shrink-0 relative overflow-hidden bg-stone-100">
                <SlideThumbnail slide={slide} />
                <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5">
                  #{idx + 1}
                </span>
                {slide.videoUrl && (
                  <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] px-1 py-0.5 uppercase tracking-wide">
                    {slide.videoType === "youtube" ? "YT" : "MP4"}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs tracking-widests uppercase text-stone-400 mb-0.5">{slide.tag}</p>
                <p className="text-sm font-medium text-stone-900 whitespace-pre-line leading-snug">{slide.title}</p>
                <p className="text-xs text-stone-400 mt-0.5 truncate">{slide.subtitle}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 uppercase tracking-wide">{slide.align}</span>
                  <span className="text-[10px] text-stone-400 truncate max-w-[160px]">{slide.href}</span>
                  {slide.videoType && (
                    <span className="text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 uppercase tracking-wide">
                      {slide.videoType === "youtube" ? "YouTube" : "Native video"}
                    </span>
                  )}
                </div>
              </div>

              {/* Order */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <button onClick={() => moveSlide(slide.id, "up")} disabled={idx === 0}
                  className="p-1.5 text-stone-400 hover:text-stone-900 disabled:opacity-20 transition-colors">
                  <ChevronUp size={14} />
                </button>
                <button onClick={() => moveSlide(slide.id, "down")} disabled={idx === slides.length - 1}
                  className="p-1.5 text-stone-400 hover:text-stone-900 disabled:opacity-20 transition-colors">
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-start gap-1 shrink-0">
                {/* Per-slide enabled toggle */}
                <button
                  onClick={() => toggleSlideEnabled(slide.id)}
                  title={slide.enabled === false ? "Bật slide" : "Tắt slide"}
                  style={{ width: 40, height: 22, borderRadius: 999, flexShrink: 0, position: "relative", transition: "background 0.2s", background: slide.enabled === false ? "#d6d3d1" : "#1c1917" }}
                >
                  <span style={{
                    position: "absolute",
                    top: 2,
                    left: slide.enabled === false ? 2 : 20,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                    transition: "left 0.2s ease",
                  }} />
                </button>
                <button onClick={() => setPreview(preview?.id === slide.id ? null : slide)}
                  className="p-2 text-stone-400 hover:text-stone-900 transition-colors" title="Preview">
                  <Eye size={14} />
                </button>
                <button onClick={() => openEdit(slide)}
                  className="px-3 py-1.5 border border-stone-200 text-xs hover:bg-stone-50 transition-colors">
                  Edit
                </button>
                <button onClick={() => removeSlide(slide.id)} disabled={slides.length <= 1}
                  className="p-2 text-stone-400 hover:text-red-500 disabled:opacity-20 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* ── Inline preview ── */}
            {preview?.id === slide.id && (
              <div className="border-t border-stone-100 p-3 bg-stone-50">
                <div className="relative h-48 overflow-hidden bg-stone-200">
                  <SlidePreviewMedia slide={slide} />
                  <div className="absolute inset-0 bg-black/30 flex flex-col justify-end pb-6 px-6">
                    <p className="text-white/70 text-[10px] tracking-widests uppercase mb-1">{slide.tag}</p>
                    <p className="text-white text-xl font-light whitespace-pre-line leading-tight mb-1">{slide.title}</p>
                    <p className="text-white/70 text-xs italic mb-3">{slide.subtitle}</p>
                    <span className="inline-block border border-white/60 text-white text-[10px] tracking-widests uppercase px-6 py-2 self-start">{slide.cta}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Edit form ── */}
            {editing === slide.id && (
              <SlideForm
                form={form} setForm={setForm}
                onSave={saveEdit} onCancel={() => setEditing(null)}
                inputCls={inputCls} labelCls={labelCls}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Add new ── */}
      {addingNew && (
        <div className="bg-white border border-stone-100">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-2">
            <Plus size={14} className="text-stone-400" />
            <p className="text-xs tracking-widests uppercase text-stone-500">New Slide</p>
          </div>
          <SlideForm
            form={form} setForm={setForm}
            onSave={saveNew} onCancel={() => setAddingNew(false)}
            inputCls={inputCls} labelCls={labelCls} isNew
          />
        </div>
      )}

      {!canAdd && !addingNew && (
        <p className="text-xs text-stone-400 text-center py-4">
          Maximum of {maxSlides} slides reached. Increase the limit or delete a slide.
        </p>
      )}
    </div>
  );
}

/* ── Shared slide form ── */
function SlideForm({
  form, setForm, onSave, onCancel, inputCls, labelCls, isNew = false,
}: {
  form: Omit<HeroSlide, "id">;
  setForm: React.Dispatch<React.SetStateAction<Omit<HeroSlide, "id">>>;
  onSave: () => void;
  onCancel: () => void;
  inputCls: string;
  labelCls: string;
  isNew?: boolean;
}) {
  const [slideMode, setSlideMode] = useState<"image" | "video">(
    form.videoUrl ? "video" : "image"
  );
  const [videoTab, setVideoTab] = useState<"youtube" | "native">(
    form.videoType ?? "youtube"
  );
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const addAssets = useMediaLibraryStore((state) => state.addAssets);
  const imageFileRef = useRef<HTMLInputElement>(null);
  const thumbnailFileRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const switchToImage = () => {
    setSlideMode("image");
    setForm((f) => ({ ...f, videoUrl: "", videoType: undefined }));
  };

  const switchToVideo = () => {
    setSlideMode("video");
    setForm((f) => ({ ...f, videoType: videoTab }));
  };

  const switchVideoTab = (tab: "youtube" | "native") => {
    setVideoTab(tab);
    setForm((f) => ({ ...f, videoType: tab, videoUrl: "" }));
  };

  const handleNativeUpload = (file: File) => {
    if (!file.type.startsWith("video/")) return;
    if (file.size > 200 * 1024 * 1024) {
      alert("File quá lớn (max 200 MB). Khuyến nghị dùng YouTube URL.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      if (data) setForm((f) => ({ ...f, videoUrl: data, videoType: "native" }));
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;

    const [asset] = await uploadImageFiles([file]);
    if (asset) {
      addAssets([asset]);
      setForm((f) => ({ ...f, image: asset.url }));
    }
  };

  const ytId = slideMode === "video" && videoTab === "youtube" && form.videoUrl
    ? getYouTubeId(form.videoUrl)
    : null;

  const canSave = slideMode === "image"
    ? !!form.image.trim()
    : !!form.videoUrl?.trim();

  return (
    <div className="p-5 space-y-5 border-t border-stone-100 bg-stone-50/50">
      <MediaPicker
        open={mediaPickerOpen}
        title="Hero Images"
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(asset) => setForm((f) => ({ ...f, image: asset.url }))}
      />

      {/* ── Slide type ── */}
      <div>
        <label className={labelCls}>Slide Type</label>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={switchToImage}
            className={cn("flex items-center gap-2.5 p-3 border text-sm transition-all text-left",
              slideMode === "image" ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 text-stone-600 hover:border-stone-400")}>
            <ImageIcon size={14} />
            <span>Image</span>
          </button>
          <button onClick={switchToVideo}
            className={cn("flex items-center gap-2.5 p-3 border text-sm transition-all text-left",
              slideMode === "video" ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 text-stone-600 hover:border-stone-400")}>
            <Video size={14} />
            <span>Video</span>
          </button>
        </div>
      </div>

      {/* ── Image input ── */}
      {slideMode === "image" && (
        <div>
          <label className={labelCls}>Image URL *</label>
          <input type="url" value={form.image} onChange={set("image")}
            placeholder="https://images.unsplash.com/..." className={inputCls} />
          <input
            ref={imageFileRef}
            type="file"
            accept="image/*,.jfif,.ifif"
            className="hidden"
            onChange={(e) => handleImageUpload(e.target.files?.[0] ?? null)}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => imageFileRef.current?.click()}
              className="inline-flex items-center gap-2 border border-stone-200 bg-white px-3 py-2 text-[10px] uppercase tracking-widests text-stone-600 transition-colors hover:border-stone-800 hover:text-stone-900"
            >
              <Upload size={12} />
              Upload Image
            </button>
            <button
              type="button"
              onClick={() => setMediaPickerOpen(true)}
              className="inline-flex items-center gap-2 border border-stone-200 bg-white px-3 py-2 text-[10px] uppercase tracking-widests text-stone-600 transition-colors hover:border-stone-800 hover:text-stone-900"
            >
              <ImageIcon size={12} />
              Choose from Library
            </button>
            {form.image && (
              <button
                type="button"
                onClick={() => {
                  setForm((f) => ({ ...f, image: "" }));
                  if (imageFileRef.current) imageFileRef.current.value = "";
                }}
                className="text-xs text-red-400 transition-colors hover:text-red-600"
              >
                Remove image
              </button>
            )}
          </div>
          {form.image && (
            <div className="mt-2 relative h-24 w-40 overflow-hidden bg-stone-100">
              <img
                src={form.image}
                alt="preview"
                className="h-full w-full object-cover"
                onError={() => setForm((f) => ({ ...f, image: "" }))}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Video input ── */}
      {slideMode === "video" && (
        <div className="space-y-4">
          {/* Tab bar */}
          <div className="flex gap-1 border-b border-stone-100">
            {(["youtube", "native"] as const).map((tab) => (
              <button key={tab} onClick={() => switchVideoTab(tab)}
                className={cn("px-4 py-2 text-xs transition-colors",
                  videoTab === tab ? "border-b-2 border-stone-900 text-stone-900 font-medium -mb-px" : "text-stone-400 hover:text-stone-600")}>
                {tab === "youtube" ? "YouTube URL" : "Upload file"}
              </button>
            ))}
          </div>

          {videoTab === "youtube" && (
            <div>
              <label className={labelCls}>YouTube URL *</label>
              <input type="url" value={form.videoUrl ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value, videoType: "youtube" }))}
                placeholder="https://www.youtube.com/watch?v=..." className={inputCls} />
              {form.videoUrl && !ytId && (
                <p className="mt-1 text-xs text-amber-500">URL không hợp lệ</p>
              )}
              {ytId && (
                <div className="mt-2 relative h-24 w-44 overflow-hidden bg-stone-900 rounded">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="" className="w-full h-full object-cover opacity-70" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play size={20} fill="white" className="text-white" />
                  </div>
                </div>
              )}
            </div>
          )}

          {videoTab === "native" && (
            <div>
              <input ref={fileRef} type="file" accept="video/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleNativeUpload(f); }} />
              {form.videoUrl && form.videoType === "native" ? (
                <div>
                  <video src={form.videoUrl} controls className="w-full border border-stone-200" style={{ maxHeight: 160 }} />
                  <button onClick={() => { setForm(f => ({ ...f, videoUrl: "" })); if (fileRef.current) fileRef.current.value = ""; }}
                    className="mt-1.5 text-xs text-red-400 hover:text-red-600 transition-colors">
                    Remove video
                  </button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleNativeUpload(f); }}
                  className="w-full flex flex-col items-center gap-2 border-2 border-dashed border-stone-200 hover:border-stone-400 py-6 transition-colors bg-white">
                  <Upload size={18} className="text-stone-400" />
                  <p className="text-xs text-stone-500">Click hoặc kéo thả video (MP4, WebM — max 200 MB)</p>
                </button>
              )}
            </div>
          )}

          {/* Thumbnail for inactive state */}
          <div>
            <label className={labelCls}>Thumbnail (optional — hiện khi slide không active)</label>
            <input type="url" value={form.image} onChange={set("image")}
              placeholder="https://images.unsplash.com/..." className={inputCls} />
            <input
              ref={thumbnailFileRef}
              type="file"
              accept="image/*,.jfif,.ifif"
              className="hidden"
              onChange={(e) => handleImageUpload(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => thumbnailFileRef.current?.click()}
              className="mt-2 inline-flex items-center gap-2 border border-stone-200 bg-white px-3 py-2 text-[10px] uppercase tracking-widests text-stone-600 transition-colors hover:border-stone-800 hover:text-stone-900"
            >
              <Upload size={12} />
              Upload Thumbnail
            </button>
            <button
              type="button"
              onClick={() => setMediaPickerOpen(true)}
              className="mt-2 ml-2 inline-flex items-center gap-2 border border-stone-200 bg-white px-3 py-2 text-[10px] uppercase tracking-widests text-stone-600 transition-colors hover:border-stone-800 hover:text-stone-900"
            >
              <ImageIcon size={12} />
              Choose from Library
            </button>
          </div>
        </div>
      )}

      {/* ── Text content ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Tag / Label</label>
          <input type="text" value={form.tag} onChange={set("tag")} placeholder="New Collection" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>CTA Button Text</label>
          <input type="text" value={form.cta} onChange={set("cta")} placeholder="Shop Now" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>CTA Link</label>
          <input type="text" value={form.href} onChange={set("href")} placeholder="/products" className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Title (dùng \n xuống dòng)</label>
        <textarea rows={2} value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder={"Timeless\nElegance"} className={cn(inputCls, "resize-none")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Subtitle</label>
          <input type="text" value={form.subtitle} onChange={set("subtitle")} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Text Alignment</label>
          <select value={form.align} onChange={set("align")} className={cn(inputCls, "bg-white")}>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button onClick={onSave} disabled={!canSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white text-xs tracking-widests uppercase hover:bg-stone-700 transition-colors disabled:opacity-40">
          <Save size={12} />
          {isNew ? "Add Slide" : "Save Changes"}
        </button>
        <button onClick={onCancel}
          className="px-5 py-2.5 border border-stone-200 text-xs tracking-widests uppercase text-stone-600 hover:bg-stone-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
