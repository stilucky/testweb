"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Plus, Trash2, Edit, X, Save, Eye, EyeOff, Star, StarOff,
  Image as ImageIcon, Calendar, Layers,
} from "lucide-react";
import { useCollectionStore, Collection } from "@/store/collectionStore";
import { useProductStore } from "@/store/productStore";
import { cn } from "@/lib/utils";
import { ToastContainer, useToast } from "@/components/ui/Toast";
import MediaPicker from "@/components/admin/MediaPicker";

type FormData = {
  name: string;
  slug: string;
  description: string;
  image: string;
  season: string;
  status: "active" | "draft";
  featured: boolean;
  productIds: string[];
};

const emptyForm: FormData = {
  name: "",
  slug: "",
  description: "",
  image: "",
  season: "",
  status: "draft",
  featured: false,
  productIds: [],
};

function toSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

export default function AdminCollectionsPage() {
  const { collections, addCollection, updateCollection, removeCollection } = useCollectionStore();
  const { products } = useProductStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<Collection | null>(null);
  const [form, setForm]           = useState<FormData>(emptyForm);
  const [errors, setErrors]       = useState<Partial<Record<keyof FormData, string>>>({});
  const [saving, setSaving]       = useState(false);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const { toasts, addToast, removeToast } = useToast(3000);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setProductSearch("");
    setModalOpen(true);
  };

  const openEdit = (col: Collection) => {
    setEditing(col);
    setForm({
      name: col.name,
      slug: col.slug,
      description: col.description,
      image: col.image,
      season: col.season,
      status: col.status,
      featured: col.featured,
      productIds: col.productIds,
    });
    setErrors({});
    setProductSearch("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
  };

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && !editing) next.slug = toSlug(value as string);
      return next;
    });
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim())        e.name        = "Collection name is required";
    if (!form.slug.trim())        e.slug        = "Slug is required";
    if (!form.description.trim()) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    if (editing) {
      updateCollection(editing.id, form);
      addToast("success", `Collection "${form.name}" updated successfully`);
    } else {
      addCollection(form);
      addToast("success", `Collection "${form.name}" created successfully`);
    }
    setSaving(false);
    closeModal();
  };

  const confirmDelete = (id: string) => setDeleteId(id);

  const handleDelete = () => {
    if (!deleteId) return;
    const col = collections.find((c) => c.id === deleteId);
    removeCollection(deleteId);
    addToast("success", `Collection "${col?.name}" deleted`);
    setDeleteId(null);
  };

  const toggleStatus = (col: Collection) => {
    const next = col.status === "active" ? "draft" : "active";
    updateCollection(col.id, { status: next });
    addToast("success", `"${col.name}" is now ${next}`);
  };

  const toggleFeatured = (col: Collection) => {
    updateCollection(col.id, { featured: !col.featured });
    addToast("success", col.featured ? `Removed from featured` : `"${col.name}" is now featured`);
  };

  const toggleProduct = (productId: string) => {
    setField(
      "productIds",
      form.productIds.includes(productId)
        ? form.productIds.filter((id) => id !== productId)
        : [...form.productIds, productId]
    );
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-50">

      <MediaPicker
        open={mediaPickerOpen}
        title="Collection Images"
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(asset) => setField("image", asset.url)}
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* ── Header ── */}
      <div className="bg-white border-b border-stone-100 px-6 md:px-10 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-stone-900">Collections</h1>
            <p className="text-xs text-stone-400 mt-0.5">
              {collections.length} total · {collections.filter((c) => c.status === "active").length} active
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-stone-900 text-white text-xs tracking-widest uppercase px-5 py-3 hover:bg-stone-700 transition-colors"
          >
            <Plus size={14} />
            New Collection
          </button>
        </div>
      </div>

      {/* ── Collection grid ── */}
      <div className="p-6 md:p-10">
        {collections.length === 0 ? (
          <div className="text-center py-24 text-stone-400">
            <Layers size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm">No collections yet. Create your first one.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {collections.map((col) => (
              <div key={col.id} className="bg-white border border-stone-100 overflow-hidden group">

                {/* Cover image */}
                <div className="relative aspect-[16/9] bg-stone-100 overflow-hidden">
                  {col.image ? (
                    <img
                      src={col.image}
                      alt={col.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={32} className="text-stone-300" />
                    </div>
                  )}

                  {/* Status badge */}
                  <span className={cn(
                    "absolute top-3 left-3 text-[9px] tracking-widest uppercase px-2 py-1",
                    col.status === "active"
                      ? "bg-stone-900 text-white"
                      : "bg-white text-stone-500 border border-stone-200"
                  )}>
                    {col.status}
                  </span>

                  {col.featured && (
                    <span className="absolute top-3 right-3 bg-amber-500 text-white text-[9px] tracking-widest uppercase px-2 py-1">
                      Featured
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-sm font-medium text-stone-900">{col.name}</h3>
                      <p className="text-[10px] text-stone-400 tracking-wide mt-0.5">{col.season}</p>
                    </div>
                    <span className="text-[10px] text-stone-400 shrink-0 flex items-center gap-1">
                      <Layers size={10} />
                      {col.productIds.length} products
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 leading-relaxed mb-4 line-clamp-2">
                    {col.description}
                  </p>

                  <p className="text-[10px] text-stone-300 mb-4 flex items-center gap-1">
                    <Calendar size={10} />
                    Created {new Date(col.createdAt).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-stone-100">
                    <button
                      onClick={() => openEdit(col)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-600 border border-stone-200 hover:border-stone-900 hover:text-stone-900 transition-colors"
                    >
                      <Edit size={11} /> Edit
                    </button>

                    <button
                      onClick={() => toggleStatus(col)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-600 border border-stone-200 hover:border-stone-900 hover:text-stone-900 transition-colors"
                      title={col.status === "active" ? "Set to draft" : "Publish"}
                    >
                      {col.status === "active" ? <EyeOff size={11} /> : <Eye size={11} />}
                      {col.status === "active" ? "Draft" : "Publish"}
                    </button>

                    <button
                      onClick={() => toggleFeatured(col)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-600 border border-stone-200 hover:border-amber-500 hover:text-amber-600 hover:border-amber-300 transition-colors"
                      title={col.featured ? "Remove from featured" : "Mark as featured"}
                    >
                      {col.featured ? <StarOff size={11} /> : <Star size={11} />}
                    </button>

                    <button
                      onClick={() => confirmDelete(col.id)}
                      className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 border border-red-100 hover:border-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════
          ADD / EDIT MODAL
      ══════════════════════════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex">
          <button className="absolute inset-0 w-full h-full bg-black/50 cursor-default" onClick={closeModal} aria-label="Close" />

          <div className="relative ml-auto w-full max-w-lg bg-white h-full flex flex-col shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 shrink-0">
              <h2 className="text-base font-medium text-stone-900">
                {editing ? "Edit Collection" : "New Collection"}
              </h2>
              <button onClick={closeModal} className="p-1 text-stone-400 hover:text-stone-900 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Scrollable form */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

              {/* Name */}
              <div>
                <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">
                  Collection Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="e.g. Pre-Fall 2026"
                  className={cn(
                    "w-full border px-4 py-3 text-sm focus:outline-none transition-colors",
                    errors.name ? "border-red-400" : "border-stone-200 focus:border-stone-800"
                  )}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">
                  URL Slug <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center border border-stone-200 focus-within:border-stone-800 transition-colors">
                  <span className="pl-4 text-xs text-stone-400 shrink-0">/products?collection=</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setField("slug", toSlug(e.target.value))}
                    placeholder="pre-fall-2026"
                    className="flex-1 px-2 py-3 text-sm focus:outline-none"
                  />
                </div>
                {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
              </div>

              {/* Season */}
              <div>
                <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">Season</label>
                <input
                  type="text"
                  value={form.season}
                  onChange={(e) => setField("season", e.target.value)}
                  placeholder="e.g. Fall/Winter 2026"
                  className="w-full border border-stone-200 focus:border-stone-800 px-4 py-3 text-sm focus:outline-none transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="A brief, editorial description of this collection..."
                  rows={3}
                  className={cn(
                    "w-full border px-4 py-3 text-sm focus:outline-none transition-colors resize-none",
                    errors.description ? "border-red-400" : "border-stone-200 focus:border-stone-800"
                  )}
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>

              {/* Cover image */}
              <div>
                <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">Cover Image URL</label>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setField("image", e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-stone-200 focus:border-stone-800 px-4 py-3 text-sm focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setMediaPickerOpen(true)}
                  className="mt-2 inline-flex items-center gap-2 border border-stone-200 px-3 py-2 text-[10px] uppercase tracking-widests text-stone-600 transition-colors hover:border-stone-800 hover:text-stone-900"
                >
                  <ImageIcon size={12} />
                  Choose from Library
                </button>
                {form.image && (
                  <div className="relative mt-2 h-28 bg-stone-100 overflow-hidden">
                    <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              {/* Status & Featured */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setField("status", e.target.value as "active" | "draft")}
                    className="w-full border border-stone-200 focus:border-stone-800 px-3 py-3 text-sm focus:outline-none bg-white transition-colors"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active (Published)</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setField("featured", e.target.checked)}
                      className="w-4 h-4 accent-stone-900"
                    />
                    <span className="text-xs text-stone-700">Mark as Featured</span>
                  </label>
                </div>
              </div>

              {/* Products assignment */}
              <div>
                <label className="block text-xs tracking-widest uppercase text-stone-500 mb-3">
                  Assign Products
                  <span className="ml-2 font-normal normal-case tracking-normal text-stone-400">
                    ({form.productIds.length} selected)
                  </span>
                </label>

                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full border border-stone-200 focus:border-stone-800 px-3 py-2 text-sm focus:outline-none mb-3 transition-colors"
                />

                <div className="border border-stone-100 max-h-48 overflow-y-auto divide-y divide-stone-50">
                  {filteredProducts.length === 0 ? (
                    <p className="text-xs text-stone-400 px-4 py-4 text-center">No products found</p>
                  ) : (
                    filteredProducts.map((p) => (
                      <label
                        key={p.id}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-stone-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={form.productIds.includes(p.id)}
                          onChange={() => toggleProduct(p.id)}
                          className="w-3.5 h-3.5 accent-stone-900"
                        />
                        {p.images[0] && (
                          <div className="relative w-8 h-10 shrink-0 overflow-hidden bg-stone-100">
                            <Image src={p.images[0]} alt={p.name} fill sizes="32px" className="object-cover" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs text-stone-800 truncate">{p.name}</p>
                          <p className="text-[10px] text-stone-400 capitalize">{p.category}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Modal footer */}
            <div className="px-6 py-5 border-t border-stone-100 shrink-0 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-stone-900 text-white text-xs tracking-widest uppercase px-6 py-3 hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={13} />
                )}
                {saving ? "Saving…" : editing ? "Save Changes" : "Create Collection"}
              </button>
              <button
                onClick={closeModal}
                className="text-xs text-stone-400 hover:text-stone-900 tracking-wider uppercase transition-colors px-3 py-3"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm dialog ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button className="absolute inset-0 w-full h-full bg-black/50 cursor-default" onClick={() => setDeleteId(null)} aria-label="Close" />
          <div className="relative bg-white p-8 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-sm font-medium text-stone-900 mb-2">Delete Collection?</h3>
            <p className="text-xs text-stone-500 mb-6 leading-relaxed">
              This will permanently delete <strong>{collections.find(c => c.id === deleteId)?.name}</strong>.
              Products assigned to it will not be deleted, only the collection itself.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-600 text-white text-xs tracking-widest uppercase hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 border border-stone-200 text-stone-600 text-xs tracking-widest uppercase hover:border-stone-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
