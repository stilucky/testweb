"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Search, Plus, Edit, Trash2, Eye, ChevronDown,
  Package, X, Save, RefreshCw, Cloud, CloudOff,
  AlertCircle, CheckCircle, Loader2,
} from "lucide-react";
import { Product } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { useProductStore } from "@/store/productStore";

const categoryOptions = ["all", "dresses", "tops", "bottoms", "outerwear", "accessories"];
const allSizes = ["XS", "S", "M", "L", "XL", "XXL"];
const allColors = [
  { name: "Black",     hex: "#000000" },
  { name: "White",     hex: "#FFFFFF" },
  { name: "Ivory",     hex: "#FFFFF0" },
  { name: "Cream",     hex: "#FFFDD0" },
  { name: "Camel",     hex: "#C19A6B" },
  { name: "Beige",     hex: "#F5F0E8" },
  { name: "Stone",     hex: "#928E85" },
  { name: "Charcoal",  hex: "#36454F" },
  { name: "Navy",      hex: "#000080" },
  { name: "Midnight",  hex: "#191970" },
  { name: "Blush",     hex: "#FFB6C1" },
  { name: "Champagne", hex: "#F7E7CE" },
  { name: "Wine",      hex: "#722F37" },
  { name: "Sage",      hex: "#B2AC88" },
  { name: "Terracotta",hex: "#E2725B" },
];

type FormColor = { name: string; hex: string; isPrimary: boolean };
type FormData = {
  name: string; slug: string;
  shortDescription: string; shortDescriptionFR: string;
  description: string; descriptionFR: string;
  price: string; salePrice: string;
  priceCAD: string; salePriceCAD: string;
  stock: string; category: string;
  gender: "women" | "men" | "unisex"; sizes: string[]; colors: FormColor[];
  images: string; videoUrl: string; isNew: boolean; isBestSeller: boolean; featured: boolean;
};

const emptyForm: FormData = {
  name: "", slug: "",
  shortDescription: "", shortDescriptionFR: "",
  description: "", descriptionFR: "",
  price: "", salePrice: "",
  priceCAD: "", salePriceCAD: "",
  stock: "", category: "dresses",
  gender: "women", sizes: [], colors: [], images: "", videoUrl: "",
  isNew: false, isBestSeller: false, featured: false,
};

function toSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

type ToastType = "success" | "error" | "loading";
type Toast = { id: number; type: ToastType; message: string };

export default function AdminProductsPage() {
  const [productList, setProductList]   = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);
  const { addProduct, updateProduct, removeProduct, setProducts } = useProductStore();
  const [syncing, setSyncing]           = useState(false);
  const [toasts, setToasts]             = useState<Toast[]>([]);

  const [search, setSearch]     = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy]     = useState("newest");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const [modalOpen, setModalOpen]         = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm]                   = useState<FormData>(emptyForm);
  const [errors, setErrors]               = useState<Partial<Record<keyof FormData, string>>>({});
  const [saving, setSaving]               = useState(false);

  // ── toasts ────────────────────────────────────────────────────────────────
  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, type, message }]);
    if (type !== "loading") setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
    return id;
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  // ── fetch from Shopify ────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/shopify/products?limit=50");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      const list = data.products ?? [];
      setProductList(list);
      setProducts(list); // sync to store so shop page reflects changes
    } catch (err) {
      addToast("error", `Failed to load products: ${err}`);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── modal helpers ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      shortDescriptionFR: product.shortDescriptionFR ?? "",
      description: product.description,
      descriptionFR: product.descriptionFR ?? "",
      price: String(product.price),
      salePrice: product.salePrice ? String(product.salePrice) : "",
      stock: String(product.stock),
      category: product.category,
      gender: product.gender,
      sizes: [...product.sizes],
      colors: product.colors.map((c, i) => ({
        name: c.name, hex: c.hex, isPrimary: i === 0,
      })),
      images: product.images.join("\n"),
      videoUrl: product.videoUrl ?? "",
      priceCAD: product.priceCAD ? String(product.priceCAD) : "",
      salePriceCAD: product.salePriceCAD ? String(product.salePriceCAD) : "",
      isNew: product.isNew,
      isBestSeller: product.isBestSeller,
      featured: product.featured,
    });
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setErrors({});
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = "Valid price required";
    if (form.salePrice && (isNaN(Number(form.salePrice)) || Number(form.salePrice) <= 0)) e.salePrice = "Invalid sale price";
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0) e.stock = "Valid stock required";
    if (!form.shortDescription.trim()) e.shortDescription = "Required";
    if (form.sizes.length === 0) e.sizes = "Select at least one size";
    if (!form.images.trim()) e.images = "At least one image URL required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const parseUrls = (raw: string) => raw.split("\n").map((u) => u.trim()).filter(Boolean);
    const imageList = parseUrls(form.images);
    // Sort primary color to front
    const sortedColors = [...form.colors].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
    const builtColors = sortedColors.map((c) => ({
      name: c.name, hex: c.hex, images: [],
    }));

    const payload: Omit<Product, "id"> = {
      name: form.name,
      slug: form.slug || toSlug(form.name),
      shortDescription: form.shortDescription,
      shortDescriptionFR: form.shortDescriptionFR.trim() || undefined,
      description: form.description,
      descriptionFR: form.descriptionFR.trim() || undefined,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : undefined,
      stock: Number(form.stock),
      category: form.category,
      gender: form.gender,
      sizes: form.sizes,
      colors: builtColors,
      images: imageList.length ? imageList : (builtColors[0]?.images ?? []),
      isNew: form.isNew,
      isBestSeller: form.isBestSeller,
      featured: form.featured,
      tags: [],
      videoUrl: form.videoUrl.trim() || undefined,
      priceCAD: form.priceCAD ? Number(form.priceCAD) : undefined,
      salePriceCAD: form.salePriceCAD ? Number(form.salePriceCAD) : undefined,
    };

    try {
      if (editingProduct) {
        // Update on Shopify
        const res = await fetch(`/api/shopify/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Update failed");

        // Update inventory separately if stock changed
        if (Number(form.stock) !== editingProduct.stock) {
          await fetch(`/api/shopify/products/${editingProduct.id}/inventory`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stock: Number(form.stock) }),
          });
        }

        setProductList((prev) => prev.map((p) => p.id === editingProduct.id ? data.product : p));
        updateProduct(data.product); // sync store
        addToast("success", `"${data.product.name}" updated on Shopify`);
      } else {
        // Create on Shopify
        const res = await fetch("/api/shopify/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Create failed");
        setProductList((prev) => [data.product, ...prev]);
        addProduct(data.product); // sync store
        addToast("success", `"${data.product.name}" created on Shopify`);
      }
      closeModal();
    } catch (err) {
      addToast("error", String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(null);
    const toastId = addToast("loading", "Deleting product...");
    try {
      const res = await fetch(`/api/shopify/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      setProductList((prev) => prev.filter((p) => p.id !== id));
      removeProduct(id); // sync store
      removeToast(toastId);
      addToast("success", "Product deleted from Shopify");
    } catch (err) {
      removeToast(toastId);
      addToast("error", String(err));
    }
  };

  // Quick inventory update inline
  const handleQuickStock = async (id: string, newStock: number) => {
    setSyncing(true);
    try {
      const res = await fetch(`/api/shopify/products/${id}/inventory`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      if (!res.ok) throw new Error("Inventory update failed");
      setProductList((prev) => prev.map((p) => p.id === id ? { ...p, stock: newStock } : p));
    } catch (err) {
      addToast("error", String(err));
    } finally {
      setSyncing(false);
    }
  };

  const toggleSize  = (size: string) => setForm((f) => ({ ...f, sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size] }));
  const toggleColor = (color: { name: string; hex: string }) => setForm((f) => {
    const exists = f.colors.some((c) => c.name === color.name);
    if (exists) {
      const remaining = f.colors.filter((c) => c.name !== color.name);
      // If removed color was primary, make first remaining color primary
      if (f.colors.find((c) => c.name === color.name)?.isPrimary && remaining.length > 0) {
        remaining[0] = { ...remaining[0], isPrimary: true };
      }
      return { ...f, colors: remaining };
    }
    const isPrimary = f.colors.length === 0; // First color is automatically primary
    return { ...f, colors: [...f.colors, { ...color, isPrimary }] };
  });

  const setPrimaryColor = (colorName: string) =>
    setForm((f) => ({
      ...f,
      colors: f.colors.map((c) => ({ ...c, isPrimary: c.name === colorName })),
    }));

  const filtered = productList
    .filter((p) => {
      const q = search.toLowerCase();
      return (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
        && (filterCat === "all" || p.category === filterCat);
    })
    .sort((a, b) => {
      if (sortBy === "price-asc")  return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "stock-asc")  return a.stock - b.stock;
      return 0;
    });

  const stockBadge = (stock: number) => {
    if (stock === 0)  return { cls: "bg-red-50 text-red-500",      label: "Out" };
    if (stock <= 5)   return { cls: "bg-amber-50 text-amber-600",  label: String(stock) };
    return              { cls: "bg-emerald-50 text-emerald-600", label: String(stock) };
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-8 relative">

      {/* Toast notifications */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 shadow-lg text-sm max-w-sm pointer-events-auto",
              t.type === "success" && "bg-white border border-emerald-200 text-emerald-800",
              t.type === "error"   && "bg-white border border-red-200 text-red-700",
              t.type === "loading" && "bg-white border border-stone-200 text-stone-600"
            )}
          >
            {t.type === "success" && <CheckCircle size={15} className="text-emerald-500 shrink-0" />}
            {t.type === "error"   && <AlertCircle size={15} className="text-red-500 shrink-0" />}
            {t.type === "loading" && <Loader2 size={15} className="animate-spin text-stone-400 shrink-0" />}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="text-stone-300 hover:text-stone-600 ml-2">
              <X size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <p className="type-label text-stone-400">Catalog</p>
            {syncing
              ? <span className="flex items-center gap-1 text-[10px] text-amber-500 tracking-widest uppercase"><Loader2 size={10} className="animate-spin" /> Syncing</span>
              : <span className="flex items-center gap-1 text-[10px] text-emerald-500 tracking-widest uppercase"><Cloud size={10} /> Shopify Live</span>
            }
          </div>
          <h1 className="text-4xl text-stone-900" style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}>
            Products
          </h1>
          <p className="text-stone-400 text-sm mt-1">{productList.length} total products</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-3 border border-stone-200 text-xs tracking-widest uppercase hover:bg-stone-50 transition-colors disabled:opacity-50"
            title="Sync from Shopify"
          >
            <RefreshCw size={13} className={cn(loading && "animate-spin")} />
            Sync
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-3 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors"
          >
            <Plus size={14} />
            Add Product
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors bg-white"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categoryOptions.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={cn(
                "px-3 py-2 text-xs tracking-wider uppercase transition-colors capitalize",
                filterCat === cat ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-500 hover:border-stone-400"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 text-xs tracking-widest uppercase bg-white hover:bg-stone-50 transition-colors"
          >
            Sort <ChevronDown size={12} className={cn("transition-transform", sortOpen && "rotate-180")} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-stone-100 shadow-lg min-w-40 py-1 z-20">
              {[
                { label: "Newest",         value: "newest" },
                { label: "Price: Low–High", value: "price-asc" },
                { label: "Price: High–Low", value: "price-desc" },
                { label: "Stock: Low–High", value: "stock-asc" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                  className={cn(
                    "block w-full text-left px-4 py-2.5 text-xs tracking-wide hover:bg-stone-50 transition-colors",
                    sortBy === opt.value && "font-medium"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-100 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-stone-100 bg-stone-50">
          <p className="col-span-4 text-[10px] tracking-widest uppercase text-stone-400">Product</p>
          <p className="col-span-1 text-[10px] tracking-widest uppercase text-stone-400">Category</p>
          <p className="col-span-2 text-[10px] tracking-widest uppercase text-stone-400">Labels</p>
          <p className="col-span-2 text-[10px] tracking-widest uppercase text-stone-400 text-right">Price</p>
          <p className="col-span-1 text-[10px] tracking-widest uppercase text-stone-400 text-center">Stock</p>
          <p className="col-span-2 text-[10px] tracking-widest uppercase text-stone-400 text-right">Actions</p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 size={32} className="text-stone-300 animate-spin mx-auto mb-4" />
            <p className="text-stone-400 text-sm">Loading from Shopify...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Package size={40} className="text-stone-200 mx-auto mb-4" />
            <p className="text-stone-400 text-sm">No products found</p>
            {!loading && productList.length === 0 && (
              <p className="text-stone-300 text-xs mt-1">Add your first product or sync from Shopify</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-stone-50">
            {filtered.map((product) => {
              const { cls: stockCls, label: stockLabel } = stockBadge(product.stock);
              return (
                <div key={product.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-stone-50/50 transition-colors group">
                  {/* Product name + image */}
                  <div className="col-span-4 flex items-center gap-4 min-w-0">
                    <div className="relative w-12 h-16 bg-stone-100 shrink-0 overflow-hidden">
                      {product.images[0] ? (
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={16} className="text-stone-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-stone-400 mt-0.5 truncate">{product.shortDescription}</p>
                      <p className="text-[10px] text-stone-300 font-mono mt-0.5">#{product.id}</p>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="col-span-1">
                    <p className="text-xs text-stone-500 capitalize">{product.category}</p>
                  </div>

                  {/* Labels */}
                  <div className="col-span-2">
                    <div className="flex flex-col gap-1">
                      {product.isNew && <span className="text-[10px] bg-stone-900 text-white px-1.5 py-0.5 tracking-wider uppercase w-fit">New</span>}
                      {product.isBestSeller && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 tracking-wider uppercase w-fit">Bestseller</span>}
                      {product.salePrice && <span className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 tracking-wider uppercase w-fit">Sale</span>}
                      {!product.isNew && !product.isBestSeller && !product.salePrice && <span className="text-[10px] text-stone-300">—</span>}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 text-right">
                    {product.salePrice ? (
                      <>
                        <p className="text-sm text-red-600" style={{ fontFamily: "var(--font-cormorant), serif" }}>{formatPrice(product.salePrice)}</p>
                        <p className="text-xs text-stone-400 line-through">{formatPrice(product.price)}</p>
                      </>
                    ) : (
                      <p className="text-sm" style={{ fontFamily: "var(--font-cormorant), serif" }}>{formatPrice(product.price)}</p>
                    )}
                  </div>

                  {/* Stock — click to edit inline */}
                  <div className="col-span-1 flex justify-center">
                    <div className="relative group/stock">
                      <span className={cn("text-[10px] px-2 py-1 rounded-full font-medium cursor-pointer", stockCls)}>
                        {stockLabel}
                      </span>
                      {/* Quick stock editor on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/stock:flex bg-white border border-stone-200 shadow-lg p-2 gap-1 z-30 rounded">
                        <input
                          type="number"
                          min="0"
                          defaultValue={product.stock}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleQuickStock(product.id, Number((e.target as HTMLInputElement).value));
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          className="w-16 px-2 py-1 text-xs border border-stone-200 focus:outline-none focus:border-stone-800"
                          title="Press Enter to save"
                        />
                        <span className="text-[10px] text-stone-400 self-center whitespace-nowrap">↵ save</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <a
                      href={`https://${process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN ?? "8h2uzh-b5.myshopify.com"}/products/${product.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                      title="View on Shopify"
                    >
                      <Eye size={14} />
                    </a>
                    <button
                      onClick={() => openEdit(product)}
                      className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => { setDeleteId(product.id); setDeleteName(product.name); }}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Delete from Shopify"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      {!loading && (
        <div className="mt-4 flex items-center justify-between text-xs text-stone-400">
          <p>Showing {filtered.length} of {productList.length} products</p>
          <div className="flex items-center gap-4">
            <span>In Stock: {productList.filter((p) => p.stock > 5).length}</span>
            <span className="text-amber-500">Low Stock: {productList.filter((p) => p.stock > 0 && p.stock <= 5).length}</span>
            <span className="text-red-400">Out: {productList.filter((p) => p.stock === 0).length}</span>
          </div>
        </div>
      )}

      {/* ─── Add / Edit slide-over ─── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="w-full max-w-xl bg-white h-full flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-xs tracking-widest uppercase font-medium">
                    {editingProduct ? "Edit Product" : "Add Product"}
                  </h2>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-500 tracking-widest uppercase">
                    <Cloud size={9} /> Shopify
                  </span>
                </div>
                {editingProduct && <p className="text-xs text-stone-400">{editingProduct.name} · #{editingProduct.id}</p>}
              </div>
              <button onClick={closeModal} className="text-stone-400 hover:text-stone-900 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

              <Field label="Product Name" required error={errors.name}>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => { const name = e.target.value; setForm((f) => ({ ...f, name, slug: toSlug(name) })); }}
                  placeholder="e.g. Céleste Maxi Dress"
                  className={inputCls(!!errors.name)}
                />
              </Field>

              <Field label="URL Slug">
                <input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="auto-generated" className={inputCls(false) + " text-stone-500"} />
              </Field>

              {/* Short Description EN / FR */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-px flex-1 bg-stone-100" />
                  <span className="text-[10px] tracking-widest uppercase text-stone-400">Short Description</span>
                  <div className="h-px flex-1 bg-stone-100" />
                </div>
                <Field label="Short Description — EN" required error={errors.shortDescription}>
                  <input type="text" value={form.shortDescription}
                    onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
                    placeholder="One-line product summary (English)" className={inputCls(!!errors.shortDescription)} />
                </Field>
                <Field label="Short Description — FR">
                  <input type="text" value={form.shortDescriptionFR}
                    onChange={(e) => setForm((f) => ({ ...f, shortDescriptionFR: e.target.value }))}
                    placeholder="Résumé en une ligne (Français)" className={inputCls(false)} />
                </Field>
              </div>

              {/* Full Description EN / FR */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-px flex-1 bg-stone-100" />
                  <span className="text-[10px] tracking-widest uppercase text-stone-400">Full Description</span>
                  <div className="h-px flex-1 bg-stone-100" />
                </div>
                <Field label="Full Description — EN">
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Detailed product description (English)..." rows={4}
                    className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors resize-none" />
                </Field>
                <Field label="Full Description — FR">
                  <textarea value={form.descriptionFR} onChange={(e) => setForm((f) => ({ ...f, descriptionFR: e.target.value }))}
                    placeholder="Description détaillée du produit (Français)..." rows={4}
                    className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors resize-none" />
                </Field>
              </div>

              {/* Pricing */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-px flex-1 bg-stone-100" />
                  <span className="text-[10px] tracking-widest uppercase text-stone-400">Pricing</span>
                  <div className="h-px flex-1 bg-stone-100" />
                </div>

                {/* USD row */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Price — USD ($)" required error={errors.price}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">$</span>
                      <input type="number" min="0" step="0.01" value={form.price}
                        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                        placeholder="0.00" className={inputCls(!!errors.price) + " pl-7"} />
                    </div>
                  </Field>
                  <Field label="Sale Price — USD ($)" error={errors.salePrice}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">$</span>
                      <input type="number" min="0" step="0.01" value={form.salePrice}
                        onChange={(e) => setForm((f) => ({ ...f, salePrice: e.target.value }))}
                        placeholder="Optional" className={inputCls(!!errors.salePrice) + " pl-7"} />
                    </div>
                  </Field>
                </div>

                {/* CAD row */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Price — CAD (CA$)">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 font-medium">CA$</span>
                      <input type="number" min="0" step="0.01" value={form.priceCAD}
                        onChange={(e) => setForm((f) => ({ ...f, priceCAD: e.target.value }))}
                        placeholder="0.00" className={inputCls(false) + " pl-10"} />
                    </div>
                  </Field>
                  <Field label="Sale Price — CAD (CA$)">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 font-medium">CA$</span>
                      <input type="number" min="0" step="0.01" value={form.salePriceCAD}
                        onChange={(e) => setForm((f) => ({ ...f, salePriceCAD: e.target.value }))}
                        placeholder="Optional" className={inputCls(false) + " pl-10"} />
                    </div>
                  </Field>
                </div>

                {/* Note */}
                <p className="text-[10px] text-stone-400 leading-relaxed">
                  If CAD is left empty, price will be auto-converted from USD × 1.38.
                </p>

                {/* Stock */}
                <Field label="Stock" required error={errors.stock}>
                  <input type="number" min="0" value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    placeholder="0" className={inputCls(!!errors.stock)} />
                </Field>
              </div>

              {/* Category & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Category">
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 bg-white appearance-none">
                    {categoryOptions.filter((c) => c !== "all").map((c) => (
                      <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Gender">
                  <select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as FormData["gender"] }))}
                    className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 bg-white appearance-none">
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </Field>
              </div>

              {/* Sizes */}
              <Field label="Sizes" required error={errors.sizes}>
                <div className="flex gap-2 flex-wrap">
                  {allSizes.map((size) => (
                    <button key={size} type="button" onClick={() => toggleSize(size)}
                      className={cn("w-12 h-12 border text-xs transition-all",
                        form.sizes.includes(size) ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 text-stone-600 hover:border-stone-400")}>
                      {size}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Colors */}
              <Field label="Colors">
                {/* Color palette — click to select/deselect */}
                <div className="flex gap-2 flex-wrap mb-4">
                  {allColors.map((color) => {
                    const selected = form.colors.some((c) => c.name === color.name);
                    return (
                      <button
                        key={color.name} type="button"
                        onClick={() => toggleColor(color)}
                        title={color.name}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all",
                          selected
                            ? "border-stone-900 scale-110 ring-2 ring-stone-900 ring-offset-1"
                            : "border-stone-200 hover:border-stone-400"
                        )}
                        style={{ backgroundColor: color.hex }}
                      />
                    );
                  })}
                </div>

                {/* Màu đã chọn — chọn màu chính */}
                {form.colors.length > 0 && (
                  <div className="border border-stone-100 rounded overflow-hidden">
                    <div className="px-3 py-2 bg-stone-50 border-b border-stone-100">
                      <p className="text-[10px] tracking-widest uppercase text-stone-400">
                        Select primary display color
                      </p>
                    </div>
                    {form.colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setPrimaryColor(c.name)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-stone-50 last:border-0",
                          c.isPrimary ? "bg-stone-900" : "hover:bg-stone-50"
                        )}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-stone-300 shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className={cn("text-xs flex-1", c.isPrimary ? "text-white font-medium" : "text-stone-700")}>
                          {c.name}
                        </span>
                        {c.isPrimary && (
                          <span className="text-[10px] tracking-widest uppercase text-white/70">
                            Primary
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </Field>

              {/* Default images */}
              <Field label="Default Images" required error={errors.images}>
                <p className="text-[11px] text-stone-400 mb-2">Main product images (one URL per line)</p>
                <textarea value={form.images} onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
                  placeholder={"https://images.unsplash.com/photo-xxx?w=800\nhttps://..."}
                  rows={3} className={cn("w-full px-4 py-3 border text-sm focus:outline-none transition-colors resize-none font-mono",
                    errors.images ? "border-red-400" : "border-stone-200 focus:border-stone-800")} />
              </Field>

              {/* YouTube Video URL */}
              <Field label="YouTube Video URL">
                <input
                  type="url"
                  value={form.videoUrl}
                  onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=... hoặc https://youtu.be/..."
                  className={inputCls(false)}
                />
                {form.videoUrl && (() => {
                  const patterns = [/youtube\.com\/watch\?v=([^&]+)/, /youtu\.be\/([^?/]+)/, /youtube\.com\/embed\/([^?]+)/];
                  const id = patterns.reduce<string | null>((acc, p) => acc ?? (form.videoUrl.match(p)?.[1] ?? null), null);
                  return id ? (
                    <div className="mt-2 relative aspect-video bg-stone-900 overflow-hidden rounded">
                      <img
                        src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`}
                        alt="Video preview"
                        className="w-full h-full object-cover opacity-70"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 ml-0.5"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                      <p className="absolute bottom-2 left-2 text-[10px] text-white/70 tracking-widest uppercase">ID: {id}</p>
                    </div>
                  ) : (
                    <p className="mt-1.5 text-[11px] text-amber-500">URL không hợp lệ — hỗ trợ youtube.com/watch?v= hoặc youtu.be/</p>
                  );
                })()}
              </Field>

              {/* Flags */}
              <Field label="Labels">
                <div className="flex flex-wrap gap-3">
                  {([
                    { key: "isNew",        label: "New Arrival" },
                    { key: "isBestSeller", label: "Best Seller" },
                    { key: "featured",     label: "Featured" },
                  ] as { key: keyof FormData; label: string }[]).map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" checked={form[key] as boolean}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                        className="w-4 h-4 accent-stone-900" />
                      <span className="text-sm text-stone-600">{label}</span>
                    </label>
                  ))}
                </div>
              </Field>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-stone-100 flex gap-3 shrink-0 bg-white">
              <button onClick={closeModal}
                className="flex-1 py-3 border border-stone-200 text-xs tracking-widest uppercase hover:bg-stone-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {saving
                  ? <><Loader2 size={13} className="animate-spin" /> Saving to Shopify...</>
                  : <><Save size={13} /> {editingProduct ? "Save Changes" : "Add to Shopify"}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-8 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xs tracking-widest uppercase font-medium">Confirm Delete</h3>
              <button onClick={() => setDeleteId(null)} className="text-stone-400 hover:text-stone-900"><X size={16} /></button>
            </div>
            <div className="flex items-start gap-3 mb-6 p-3 bg-red-50 rounded">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-stone-600">
                Delete <span className="font-medium text-stone-900">{deleteName}</span> from Shopify permanently?
                This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-3 border border-stone-200 text-xs tracking-widest uppercase hover:bg-stone-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-3 bg-red-600 text-white text-xs tracking-widest uppercase hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── small helpers ─────────────────────────────────────────────────────────────
function inputCls(hasError: boolean) {
  return cn(
    "w-full px-4 py-3 border text-sm focus:outline-none transition-colors",
    hasError ? "border-red-400 focus:border-red-500" : "border-stone-200 focus:border-stone-800"
  );
}

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
