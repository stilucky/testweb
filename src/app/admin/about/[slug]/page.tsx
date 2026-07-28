"use client";

import { use, useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Check, Edit2, Trash2, Plus, X, ExternalLink, ArrowLeft,
  ImagePlus, Move, Eye, EyeOff, ChevronUp, ChevronDown,
} from "lucide-react";
import { useAboutStore, type AboutKey, type AboutPost } from "@/store/aboutStore";
import MediaPicker from "@/components/admin/MediaPicker";
import { uploadImageFiles, useMediaLibraryStore } from "@/store/mediaLibraryStore";

const VALID_SLUGS: AboutKey[] = ["origin", "universe", "angels", "mantra"];

/* ─────────────────────────────────────────────
   Focal point drag picker
───────────────────────────────────────────── */
function FocalPicker({
  src,
  position,
  onChange,
}: {
  src: string;
  position: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const calc = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
      const y = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
      onChange(`${x}% ${y}%`);
    },
    [onChange]
  );

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    calc(e);
    const move = (ev: MouseEvent) => { if (dragging.current) calc(ev); };
    const up   = () => { dragging.current = false; window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const parts = position.replace(/%/g, "").split(" ");
  const cx = parseFloat(parts[0] ?? "50");
  const cy = parseFloat(parts[1] ?? "50");

  return (
    <div className="space-y-1.5">
      <div
        ref={ref}
        className="relative overflow-hidden bg-stone-100 cursor-crosshair select-none"
        style={{ aspectRatio: "4/3" }}
        onMouseDown={onMouseDown}
      >
        {src ? (
          <Image
            src={src} alt="" fill sizes="360px"
            className="object-cover pointer-events-none"
            style={{ objectPosition: position }}
            unoptimized={src.startsWith("data:")}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-stone-300">
            <ImagePlus size={24} />
          </div>
        )}
        {src && (
          <div
            className="absolute w-5 h-5 pointer-events-none"
            style={{ left: `${cx}%`, top: `${cy}%`, transform: "translate(-50%,-50%)" }}
          >
            <div className="absolute inset-0 rounded-full border-2 border-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.5)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>
          </div>
        )}
        <div className="absolute bottom-1.5 left-1.5 bg-black/50 text-white text-[8px] px-1.5 py-0.5 flex items-center gap-1 pointer-events-none">
          <Move size={8} /> drag to set focal point
        </div>
      </div>
      <p className="text-[9px] font-mono text-stone-400">{position}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Image upload + focal point field
───────────────────────────────────────────── */
function ImageField({
  label, hint, src, position,
  onSrcChange, onPositionChange,
}: {
  label: string; hint?: string;
  src: string; position: string;
  onSrcChange: (v: string) => void;
  onPositionChange: (v: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const addAssets = useMediaLibraryStore((state) => state.addAssets);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const [asset] = await uploadImageFiles([file]);
      if (asset) {
        addAssets([asset]);
        onSrcChange(asset.url);
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2.5 p-4 border border-stone-100 bg-stone-50 rounded-sm">
      <MediaPicker
        open={libraryOpen}
        title={label}
        onClose={() => setLibraryOpen(false)}
        onSelect={(asset) => onSrcChange(asset.url)}
      />
      <p className="text-[9px] tracking-[0.2em] uppercase text-stone-500 font-medium">
        {label}
        {hint && <span className="ml-1.5 text-stone-300 normal-case tracking-normal font-normal">— {hint}</span>}
      </p>
      <FocalPicker src={src} position={position} onChange={onPositionChange} />
      {uploading && <p className="text-[10px] text-stone-400 animate-pulse">Processing…</p>}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center justify-center gap-1.5 border border-stone-300 py-2 text-[10px] tracking-[0.15em] uppercase text-stone-600 hover:border-stone-900 hover:text-stone-900 transition-colors bg-white"
        >
          <ImagePlus size={11} /> Upload
        </button>
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className="flex items-center justify-center gap-1.5 border border-stone-300 py-2 text-[10px] tracking-[0.15em] uppercase text-stone-600 hover:border-stone-900 hover:text-stone-900 transition-colors bg-white"
        >
          <ImagePlus size={11} /> Library
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*,.jfif,.ifif" className="hidden" onChange={handleFile} />
      <input
        value={src}
        onChange={(e) => onSrcChange(e.target.value)}
        className="w-full border border-stone-200 bg-white px-3 py-2 text-[11px] font-mono focus:outline-none focus:border-stone-500 transition-colors"
        placeholder="Or paste URL…"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Section meta editor (hero image + subtitle)
───────────────────────────────────────────── */
function SectionMetaEditor({ sectionKey }: { sectionKey: AboutKey }) {
  const { sections, updateSection } = useAboutStore();
  const section = sections.find((s) => s.key === sectionKey)!;

  const [subtitle,  setSubtitle]  = useState(section.subtitle);
  const [heroImage, setHeroImage] = useState(section.heroImage);
  const [heroPos,   setHeroPos]   = useState(section.heroImagePosition ?? "50% 50%");
  const [saved,     setSaved]     = useState(false);
  const [open,      setOpen]      = useState(false);

  const handleSave = () => {
    updateSection(sectionKey, { subtitle, heroImage, heroImagePosition: heroPos });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="border border-stone-200 bg-white mb-8">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-stone-700">Section Settings</span>
          <span className="text-[10px] text-stone-400">— hero image, subtitle</span>
        </div>
        {open ? <ChevronUp size={14} className="text-stone-400" /> : <ChevronDown size={14} className="text-stone-400" />}
      </button>

      {open && (
        <div className="border-t border-stone-100 p-6 grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-2">Subtitle / Tagline</label>
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-stone-800 transition-colors"
              />
            </div>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2.5 text-[10px] tracking-[0.2em] uppercase transition-colors ${
                saved ? "bg-emerald-600 text-white" : "bg-stone-900 text-white hover:bg-stone-700"
              }`}
            >
              {saved ? <><Check size={12} /> Saved</> : "Save Settings"}
            </button>
          </div>
          <ImageField
            label="Hero Image"
            hint="displayed at top of section page"
            src={heroImage}
            position={heroPos}
            onSrcChange={setHeroImage}
            onPositionChange={setHeroPos}
          />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Post editor (create or edit)
───────────────────────────────────────────── */
function PostEditor({
  sectionKey,
  post,
  onClose,
}: {
  sectionKey: AboutKey;
  post?: AboutPost;
  onClose: () => void;
}) {
  const { addPost, updatePost } = useAboutStore();
  const isNew = !post;

  const [title,     setTitle]     = useState(post?.title     ?? "");
  const [subtitle,  setSubtitle]  = useState(post?.subtitle  ?? "");
  const [body,      setBody]      = useState(post?.body      ?? "");
  const [image,     setImage]     = useState(post?.image     ?? "");
  const [imagePos,  setImagePos]  = useState(post?.imagePosition  ?? "50% 50%");
  const [image2,    setImage2]    = useState(post?.image2    ?? "");
  const [image2Pos, setImage2Pos] = useState(post?.image2Position ?? "50% 50%");
  const [status,    setStatus]    = useState<"published" | "draft">(post?.status ?? "draft");
  const [saved,     setSaved]     = useState(false);

  const handleSave = () => {
    if (!title.trim()) return;
    const data = {
      sectionKey,
      title, subtitle, body,
      image, imagePosition: imagePos,
      image2: image2 || undefined,
      image2Position: image2 ? image2Pos : undefined,
      status,
      order: post?.order ?? Date.now(),
    };
    if (isNew) {
      addPost(data);
    } else {
      updatePost(post!.id, data);
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); if (isNew) onClose(); }, 1200);
  };

  return (
    <div className="border border-stone-900 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-stone-50 border-b border-stone-200">
        <span className="text-xs font-medium text-stone-700 tracking-wide">
          {isNew ? "New Post" : `Editing: ${post.title}`}
        </span>
        <div className="flex items-center gap-3">
          {/* Status toggle */}
          <button
            type="button"
            onClick={() => setStatus(status === "published" ? "draft" : "published")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase border transition-colors ${
              status === "published"
                ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                : "border-stone-200 text-stone-400"
            }`}
          >
            {status === "published" ? <Eye size={10} /> : <EyeOff size={10} />}
            {status}
          </button>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-900 transition-colors">
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8 grid md:grid-cols-2 gap-10">
        {/* Text fields */}
        <div className="space-y-5">
          <div>
            <label className="block text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-2">Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className="w-full border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-stone-800 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-2">
              Subtitle / Pull Quote
            </label>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Displayed as italic pull quote"
              className="w-full border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-stone-800 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-2">
              Body
              <span className="ml-2 text-stone-300 normal-case tracking-normal">— blank line = new paragraph</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              placeholder="Write your editorial content…"
              className="w-full border border-stone-200 px-4 py-3 text-sm font-light leading-relaxed focus:outline-none focus:border-stone-800 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Image fields */}
        <div className="space-y-5">
          <ImageField
            label="Main Image"
            hint="primary photo for this post"
            src={image}
            position={imagePos}
            onSrcChange={setImage}
            onPositionChange={setImagePos}
          />
          <ImageField
            label="Secondary Image (optional)"
            hint="creates a two-image grid layout"
            src={image2}
            position={image2Pos}
            onSrcChange={setImage2}
            onPositionChange={setImage2Pos}
          />
        </div>
      </div>

      {/* Save bar */}
      <div className="px-6 md:px-8 py-4 border-t border-stone-100 flex items-center justify-between bg-stone-50">
        <p className="text-[10px] text-stone-400">
          {status === "draft"
            ? "This post is a draft and won't appear on the public page."
            : "This post will be visible on the public page."}
        </p>
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className={`flex items-center gap-2 px-7 py-2.5 text-[10px] tracking-[0.2em] uppercase transition-colors disabled:opacity-40 ${
            saved ? "bg-emerald-600 text-white" : "bg-stone-900 text-white hover:bg-stone-700"
          }`}
        >
          {saved ? <><Check size={12} /> Saved</> : isNew ? "Publish Post" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Post row card (collapsed view)
───────────────────────────────────────────── */
function PostCard({
  post,
  index,
  total,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  post: AboutPost;
  index: number;
  total: number;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="border border-stone-200 bg-white hover:border-stone-300 transition-colors">
      <div className="flex items-center gap-4 p-4">
        {/* Order controls */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1 text-stone-300 hover:text-stone-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronUp size={13} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1 text-stone-300 hover:text-stone-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronDown size={13} />
          </button>
        </div>

        {/* Thumbnail */}
        <div className="relative w-16 h-12 shrink-0 overflow-hidden bg-stone-100">
          {post.image && (
            <Image
              src={post.image} alt={post.title}
              fill sizes="64px" className="object-cover"
              style={{ objectPosition: post.imagePosition ?? "center" }}
              unoptimized={post.image.startsWith("data:")}
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-sm font-medium text-stone-900 truncate">{post.title}</h4>
            <span className={`shrink-0 text-[8px] tracking-[0.15em] uppercase px-1.5 py-0.5 ${
              post.status === "published"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-stone-100 text-stone-400 border border-stone-200"
            }`}>
              {post.status}
            </span>
          </div>
          <p className="text-[11px] text-stone-400 italic truncate">
            {post.subtitle ? `"${post.subtitle}"` : post.body.slice(0, 60) + "…"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onEdit}
            className="flex items-center gap-1 px-3 py-1.5 border border-stone-200 text-[10px] tracking-[0.15em] uppercase text-stone-600 hover:border-stone-900 hover:text-stone-900 transition-colors"
          >
            <Edit2 size={10} /> Edit
          </button>

          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={onDelete}
                className="px-3 py-1.5 bg-red-600 text-white text-[10px] tracking-[0.1em] uppercase"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="p-1.5 text-stone-400 hover:text-stone-900"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 text-stone-300 hover:text-red-600 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function AdminAboutSectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  if (!VALID_SLUGS.includes(slug as AboutKey)) notFound();

  const sectionKey = slug as AboutKey;
  const { sections, posts, setAboutSettings, updatePost, deletePost } = useAboutStore();

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/about", { cache: "no-store", signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.initialized !== false && Array.isArray(data?.sections) && Array.isArray(data?.posts)) {
          setAboutSettings({ sections: data.sections, posts: data.posts });
        }
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          console.warn("[AdminAboutSectionPage] Failed to load about settings", err);
        }
      });

    return () => controller.abort();
  }, [setAboutSettings]);
  const section = sections.find((s) => s.key === sectionKey);
  if (!section) notFound();

  const sectionPosts = posts
    .filter((p) => p.sectionKey === sectionKey)
    .sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));

  const [editingId, setEditingId] = useState<string | "new" | null>(null);

  const movePost = (id: string, dir: "up" | "down") => {
    const list = [...sectionPosts];
    const idx  = list.findIndex((p) => p.id === id);
    if (dir === "up" && idx > 0) {
      const [a, b] = [list[idx - 1], list[idx]];
      updatePost(a.id, { order: b.order });
      updatePost(b.id, { order: a.order });
    }
    if (dir === "down" && idx < list.length - 1) {
      const [a, b] = [list[idx], list[idx + 1]];
      updatePost(a.id, { order: b.order });
      updatePost(b.id, { order: a.order });
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link
          href="/admin/about"
          className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-stone-400 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft size={12} /> About
        </Link>
        <span className="text-stone-200">/</span>
        <span className="text-[10px] tracking-[0.2em] uppercase text-stone-700">{section.label}</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light text-stone-900 mb-1">{section.label}</h1>
          <p className="text-sm text-stone-400 italic">{section.subtitle}</p>
        </div>
        <Link
          href={`/about/${sectionKey}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-stone-500 border border-stone-200 px-4 py-2.5 hover:border-stone-900 hover:text-stone-900 transition-colors shrink-0"
        >
          <ExternalLink size={13} /> View Page
        </Link>
      </div>

      {/* Section meta (hero image, subtitle) */}
      <SectionMetaEditor sectionKey={sectionKey} />

      {/* Post list */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-stone-700">
          Posts
          <span className="ml-2 text-stone-400 font-normal">({sectionPosts.length})</span>
        </h2>
        <button
          onClick={() => setEditingId("new")}
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-[10px] tracking-[0.18em] uppercase hover:bg-stone-700 transition-colors"
        >
          <Plus size={12} /> New Post
        </button>
      </div>

      {/* New post form */}
      {editingId === "new" && (
        <div className="mb-4">
          <PostEditor sectionKey={sectionKey} onClose={() => setEditingId(null)} />
        </div>
      )}

      {/* Post cards */}
      {sectionPosts.length === 0 && editingId !== "new" ? (
        <div className="text-center py-16 border border-dashed border-stone-200">
          <p className="text-sm text-stone-400 mb-4">No posts yet for this section.</p>
          <button
            onClick={() => setEditingId("new")}
            className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white text-[10px] tracking-[0.18em] uppercase hover:bg-stone-700 transition-colors mx-auto"
          >
            <Plus size={12} /> Create First Post
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {sectionPosts.map((post, i) =>
            editingId === post.id ? (
              <div key={post.id}>
                <PostEditor
                  sectionKey={sectionKey}
                  post={post}
                  onClose={() => setEditingId(null)}
                />
              </div>
            ) : (
              <PostCard
                key={post.id}
                post={post}
                index={i}
                total={sectionPosts.length}
                onEdit={() => setEditingId(post.id)}
                onDelete={() => deletePost(post.id)}
                onMoveUp={() => movePost(post.id, "up")}
                onMoveDown={() => movePost(post.id, "down")}
              />
            )
          )}
        </div>
      )}

      <div className="mt-8 p-4 bg-stone-50 border border-stone-100">
        <p className="text-[11px] text-stone-400 leading-relaxed">
          <strong className="text-stone-600">Layout:</strong> Posts with a secondary image display as a two-image grid. Posts with a single image alternate left/right layout for each post. Drag the focal point to control which part of the image is visible in the crop.
        </p>
      </div>
    </div>
  );
}
