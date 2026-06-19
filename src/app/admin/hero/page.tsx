"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Plus, Trash2, ChevronUp, ChevronDown,
  ImageIcon, Save, CheckCircle2, Eye, Settings2,
} from "lucide-react";
import { useHeroStore, HeroSlide } from "@/store/heroStore";
import { cn } from "@/lib/utils";

const BLANK_SLIDE: Omit<HeroSlide, "id"> = {
  image: "",
  tag: "New Collection",
  title: "Title\nHere",
  subtitle: "A short subtitle for this slide",
  cta: "Shop Now",
  href: "/products",
  align: "center",
};

export default function HeroAdminPage() {
  const {
    slides, maxSlides, autoplayInterval,
    addSlide, removeSlide, updateSlide, moveSlide,
    setMaxSlides, setAutoplayInterval,
  } = useHeroStore();

  const [editing, setEditing]   = useState<string | null>(null);
  const [form, setForm]         = useState<Omit<HeroSlide, "id">>(BLANK_SLIDE);
  const [addingNew, setAddingNew] = useState(false);
  const [saved, setSaved]       = useState(false);
  const [preview, setPreview]   = useState<HeroSlide | null>(null);

  const canAdd = slides.length < maxSlides;

  /* ── Open edit form for existing slide ── */
  const openEdit = (slide: HeroSlide) => {
    setEditing(slide.id);
    setAddingNew(false);
    setForm({ image: slide.image, tag: slide.tag, title: slide.title, subtitle: slide.subtitle, cta: slide.cta, href: slide.href, align: slide.align });
  };

  /* ── Save edits ── */
  const saveEdit = () => {
    if (!editing) return;
    updateSlide(editing, form);
    setEditing(null);
    flash();
  };

  /* ── Add new ── */
  const saveNew = () => {
    if (!form.image.trim()) return;
    addSlide(form);
    setAddingNew(false);
    setForm(BLANK_SLIDE);
    flash();
  };

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const inputCls = "w-full px-3 py-2.5 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors bg-white";
  const labelCls = "block text-[10px] tracking-widest uppercase text-stone-400 mb-1.5";

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
              className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors"
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
          <p className="text-xs tracking-widest uppercase text-stone-500">Slide Settings</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>Max Slides (1–10)</label>
            <input
              type="number" min={1} max={10}
              value={maxSlides}
              onChange={(e) => setMaxSlides(Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Autoplay Interval (sec)</label>
            <input
              type="number" min={2} max={30}
              value={autoplayInterval}
              onChange={(e) => setAutoplayInterval(Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <div className="col-span-2 flex items-end">
            <p className="text-xs text-stone-400 leading-relaxed">
              Images can be Unsplash URLs or any public image URL.
              Recommended ratio: <strong>16:9</strong> or <strong>3:2</strong>, min width 1600px.
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
            <div className="flex items-start gap-4 p-4">
              {/* Thumbnail */}
              <div className="w-28 h-20 shrink-0 relative overflow-hidden bg-stone-100">
                {slide.image ? (
                  <Image src={slide.image} alt={slide.title} fill className="object-cover" sizes="112px" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon size={20} className="text-stone-300" />
                  </div>
                )}
                {/* Slide number badge */}
                <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5">
                  #{idx + 1}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs tracking-widest uppercase text-stone-400 mb-0.5">{slide.tag}</p>
                <p className="text-sm font-medium text-stone-900 whitespace-pre-line leading-snug">{slide.title}</p>
                <p className="text-xs text-stone-400 mt-0.5 truncate">{slide.subtitle}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 uppercase tracking-wide">{slide.align}</span>
                  <span className="text-[10px] text-stone-400 truncate max-w-[160px]">{slide.href}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <button onClick={() => moveSlide(slide.id, "up")}   disabled={idx === 0}              className="p-1.5 text-stone-400 hover:text-stone-900 disabled:opacity-20 transition-colors"><ChevronUp   size={14} /></button>
                <button onClick={() => moveSlide(slide.id, "down")} disabled={idx === slides.length - 1} className="p-1.5 text-stone-400 hover:text-stone-900 disabled:opacity-20 transition-colors"><ChevronDown size={14} /></button>
              </div>
              <div className="flex items-start gap-1 shrink-0">
                <button onClick={() => setPreview(preview?.id === slide.id ? null : slide)} className="p-2 text-stone-400 hover:text-stone-900 transition-colors" title="Preview">
                  <Eye size={14} />
                </button>
                <button onClick={() => openEdit(slide)} className="px-3 py-1.5 border border-stone-200 text-xs hover:bg-stone-50 transition-colors">
                  Edit
                </button>
                <button
                  onClick={() => removeSlide(slide.id)}
                  disabled={slides.length <= 1}
                  className="p-2 text-stone-400 hover:text-red-500 disabled:opacity-20 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* ── Inline preview ── */}
            {preview?.id === slide.id && (
              <div className="border-t border-stone-100 p-3 bg-stone-50">
                <div className="relative h-48 overflow-hidden bg-stone-200">
                  {slide.image && (
                    <Image src={slide.image} alt={slide.title} fill className="object-cover" sizes="100vw" />
                  )}
                  <div className="absolute inset-0 bg-black/30 flex flex-col justify-end pb-6 px-6">
                    <p className="text-white/70 text-[10px] tracking-widest uppercase mb-1">{slide.tag}</p>
                    <p className="text-white text-xl font-light whitespace-pre-line leading-tight mb-1">{slide.title}</p>
                    <p className="text-white/70 text-xs italic mb-3">{slide.subtitle}</p>
                    <span className="inline-block bg-white text-stone-900 text-[10px] tracking-widest uppercase px-6 py-2 self-start">{slide.cta}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Inline edit form ── */}
            {editing === slide.id && (
              <SlideForm
                form={form}
                setForm={setForm}
                onSave={saveEdit}
                onCancel={() => setEditing(null)}
                inputCls={inputCls}
                labelCls={labelCls}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Add new slide form ── */}
      {addingNew && (
        <div className="bg-white border border-stone-100">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-2">
            <Plus size={14} className="text-stone-400" />
            <p className="text-xs tracking-widests uppercase text-stone-500">New Slide</p>
          </div>
          <SlideForm
            form={form}
            setForm={setForm}
            onSave={saveNew}
            onCancel={() => setAddingNew(false)}
            inputCls={inputCls}
            labelCls={labelCls}
            isNew
            canSave={!!form.image.trim()}
          />
        </div>
      )}

      {!canAdd && !addingNew && (
        <p className="text-xs text-stone-400 text-center py-4">
          Maximum of {maxSlides} slides reached. Increase the limit in settings above or delete a slide.
        </p>
      )}
    </div>
  );
}

/* ── Shared slide edit form ── */
function SlideForm({
  form, setForm, onSave, onCancel,
  inputCls, labelCls, isNew = false, canSave = true,
}: {
  form: Omit<HeroSlide, "id">;
  setForm: React.Dispatch<React.SetStateAction<Omit<HeroSlide, "id">>>;
  onSave: () => void;
  onCancel: () => void;
  inputCls: string;
  labelCls: string;
  isNew?: boolean;
  canSave?: boolean;
}) {
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="p-5 space-y-4 border-t border-stone-100 bg-stone-50/50">

      {/* Image URL + preview */}
      <div>
        <label className={labelCls}>Image URL *</label>
        <input type="url" value={form.image} onChange={set("image")} placeholder="https://images.unsplash.com/..." className={inputCls} />
        {form.image && (
          <div className="mt-2 relative h-24 w-40 overflow-hidden bg-stone-100">
            <Image src={form.image} alt="preview" fill className="object-cover" sizes="160px"
              onError={() => setForm((f) => ({ ...f, image: "" }))} />
          </div>
        )}
      </div>

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
          <label className={labelCls}>CTA Link (href)</label>
          <input type="text" value={form.href} onChange={set("href")} placeholder="/products" className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Title (use \n for line breaks)</label>
        <textarea
          rows={2}
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder={"Timeless\nElegance"}
          className={cn(inputCls, "resize-none")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Subtitle</label>
          <input type="text" value={form.subtitle} onChange={set("subtitle")} placeholder="A short description" className={inputCls} />
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
        <button
          onClick={onSave}
          disabled={!canSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors disabled:opacity-40"
        >
          <Save size={12} />
          {isNew ? "Add Slide" : "Save Changes"}
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2.5 border border-stone-200 text-xs tracking-widest uppercase text-stone-600 hover:bg-stone-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
