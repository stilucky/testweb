"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  Package,
  X,
  Save,
} from "lucide-react";
import { products as initialProducts } from "@/lib/data";
import { Product } from "@/types";
import { formatPrice, cn } from "@/lib/utils";

const categoryOptions = ["all", "dresses", "tops", "bottoms", "outerwear", "accessories"];
const allSizes = ["XS", "S", "M", "L", "XL", "XXL"];
const allColors = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Ivory", hex: "#FFFFF0" },
  { name: "Cream", hex: "#FFFDD0" },
  { name: "Camel", hex: "#C19A6B" },
  { name: "Beige", hex: "#F5F0E8" },
  { name: "Stone", hex: "#928E85" },
  { name: "Charcoal", hex: "#36454F" },
  { name: "Navy", hex: "#000080" },
  { name: "Midnight", hex: "#191970" },
  { name: "Blush", hex: "#FFB6C1" },
  { name: "Champagne", hex: "#F7E7CE" },
  { name: "Wine", hex: "#722F37" },
  { name: "Sage", hex: "#B2AC88" },
  { name: "Terracotta", hex: "#E2725B" },
  { name: "Aqua", hex: "#00FFFF" },
  { name: "Coral", hex: "#FF7F50" },
];

type FormColor = { name: string; hex: string; imageUrls: string };

type FormData = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: string;
  salePrice: string;
  stock: string;
  category: string;
  gender: "women" | "men" | "unisex";
  sizes: string[];
  colors: FormColor[];
  images: string;
  isNew: boolean;
  isBestSeller: boolean;
  featured: boolean;
};

const emptyForm: FormData = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  price: "",
  salePrice: "",
  stock: "",
  category: "dresses",
  gender: "women",
  sizes: [],
  colors: [],
  images: "",
  isNew: false,
  isBestSeller: false,
  featured: false,
};

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function AdminProductsPage() {
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

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
      description: product.description,
      price: String(product.price),
      salePrice: product.salePrice ? String(product.salePrice) : "",
      stock: String(product.stock),
      category: product.category,
      gender: product.gender,
      sizes: [...product.sizes],
      colors: product.colors.map((c) => ({
        name: c.name,
        hex: c.hex,
        imageUrls: (c.images ?? []).join("\n"),
      })),
      images: product.images.join("\n"),
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
    if (form.colors.length === 0) e.colors = "Select at least one color";
    if (!form.images.trim()) e.images = "At least one image URL required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const parseUrls = (raw: string) =>
      raw.split("\n").map((u) => u.trim()).filter(Boolean);

    const imageList = parseUrls(form.images);
    const builtColors = form.colors.map((c) => ({
      name: c.name,
      hex: c.hex,
      images: parseUrls(c.imageUrls),
    }));

    if (editingProduct) {
      setProductList((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: form.name,
                slug: form.slug || toSlug(form.name),
                shortDescription: form.shortDescription,
                description: form.description,
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
                tags: p.tags,
              }
            : p
        )
      );
    } else {
      const newProduct: Product = {
        id: String(Date.now()),
        name: form.name,
        slug: form.slug || toSlug(form.name),
        shortDescription: form.shortDescription,
        description: form.description,
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
      };
      setProductList((prev) => [newProduct, ...prev]);
    }

    closeModal();
  };

  const handleDelete = (id: string) => {
    setProductList((prev) => prev.filter((p) => p.id !== id));
    setDeleteId(null);
  };

  const toggleSize = (size: string) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size],
    }));
  };

  const toggleColor = (color: { name: string; hex: string }) => {
    setForm((f) => ({
      ...f,
      colors: f.colors.some((c) => c.name === color.name)
        ? f.colors.filter((c) => c.name !== color.name)
        : [...f.colors, { ...color, imageUrls: "" }],
    }));
  };

  const updateColorImages = (colorName: string, imageUrls: string) => {
    setForm((f) => ({
      ...f,
      colors: f.colors.map((c) => c.name === colorName ? { ...c, imageUrls } : c),
    }));
  };

  const filtered = productList
    .filter((p) => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      const matchCat = filterCat === "all" || p.category === filterCat;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "stock-asc") return a.stock - b.stock;
      return 0;
    });

  const stockBadge = (stock: number) => {
    if (stock === 0) return { cls: "bg-red-50 text-red-500" };
    if (stock <= 5) return { cls: "bg-amber-50 text-amber-600" };
    return { cls: "bg-emerald-50 text-emerald-600" };
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-1">Catalog</p>
          <h1
            className="text-4xl text-stone-900"
            style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
          >
            Products
          </h1>
          <p className="text-stone-400 text-sm mt-1">{productList.length} total products</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-3 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors"
        >
          <Plus size={14} />
          Add Product
        </button>
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
                filterCat === cat
                  ? "bg-stone-900 text-white"
                  : "bg-white border border-stone-200 text-stone-500 hover:border-stone-400"
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
            Sort
            <ChevronDown size={12} className={cn("transition-transform", sortOpen && "rotate-180")} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-stone-100 shadow-lg min-w-40 py-1 z-20">
              {[
                { label: "Newest", value: "newest" },
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

        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Package size={40} className="text-stone-200 mx-auto mb-4" />
            <p className="text-stone-400 text-sm">No products found</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-50">
            {filtered.map((product) => {
              const { cls: stockCls } = stockBadge(product.stock);
              return (
                <div key={product.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-stone-50/50 transition-colors">
                  <div className="col-span-4 flex items-center gap-4 min-w-0">
                    <div className="relative w-12 h-16 bg-stone-100 shrink-0 overflow-hidden">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-stone-400 mt-0.5 truncate">{product.shortDescription}</p>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <p className="text-xs text-stone-500 capitalize">{product.category}</p>
                  </div>
                  <div className="col-span-2">
                    <div className="flex flex-col gap-1">
                      {product.isNew && (
                        <span className="text-[10px] bg-stone-900 text-white px-1.5 py-0.5 tracking-wider uppercase w-fit">New</span>
                      )}
                      {product.isBestSeller && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 tracking-wider uppercase w-fit">Bestseller</span>
                      )}
                      {product.salePrice && (
                        <span className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 tracking-wider uppercase w-fit">Sale</span>
                      )}
                      {!product.isNew && !product.isBestSeller && !product.salePrice && (
                        <span className="text-[10px] text-stone-300">—</span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    {product.salePrice ? (
                      <>
                        <p className="text-sm text-red-600" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                          {formatPrice(product.salePrice)}
                        </p>
                        <p className="text-xs text-stone-400 line-through">{formatPrice(product.price)}</p>
                      </>
                    ) : (
                      <p className="text-sm" style={{ fontFamily: "var(--font-cormorant), serif" }}>
                        {formatPrice(product.price)}
                      </p>
                    )}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <span className={cn("text-[10px] px-2 py-1 rounded-full font-medium", stockCls)}>
                      {product.stock}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <a
                      href={`/products/${product.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                      title="View on store"
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
                      onClick={() => setDeleteId(product.id)}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
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

      <div className="mt-4 flex items-center justify-between text-xs text-stone-400">
        <p>Showing {filtered.length} of {productList.length} products</p>
        <div className="flex items-center gap-4">
          <span>In Stock: {productList.filter((p) => p.stock > 5).length}</span>
          <span>Low Stock: {productList.filter((p) => p.stock > 0 && p.stock <= 5).length}</span>
          <span>Out of Stock: {productList.filter((p) => p.stock === 0).length}</span>
        </div>
      </div>

      {/* ─── Add / Edit Modal (slide-over) ─── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Panel */}
          <div className="w-full max-w-xl bg-white h-full flex flex-col shadow-2xl overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 shrink-0">
              <div>
                <h2 className="text-xs tracking-widest uppercase font-medium">
                  {editingProduct ? "Edit Product" : "Add Product"}
                </h2>
                {editingProduct && (
                  <p className="text-xs text-stone-400 mt-0.5">{editingProduct.name}</p>
                )}
              </div>
              <button onClick={closeModal} className="text-stone-400 hover:text-stone-900 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Form body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

              {/* Name */}
              <div>
                <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((f) => ({ ...f, name, slug: toSlug(name) }));
                  }}
                  placeholder="e.g. Céleste Maxi Dress"
                  className={cn(
                    "w-full px-4 py-3 border text-sm focus:outline-none transition-colors",
                    errors.name ? "border-red-400 focus:border-red-500" : "border-stone-200 focus:border-stone-800"
                  )}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">URL Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="auto-generated from name"
                  className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors text-stone-500"
                />
              </div>

              {/* Short description */}
              <div>
                <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.shortDescription}
                  onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
                  placeholder="One-line product summary"
                  className={cn(
                    "w-full px-4 py-3 border text-sm focus:outline-none transition-colors",
                    errors.shortDescription ? "border-red-400" : "border-stone-200 focus:border-stone-800"
                  )}
                />
                {errors.shortDescription && <p className="text-xs text-red-500 mt-1">{errors.shortDescription}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">Full Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Detailed product description..."
                  rows={4}
                  className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors resize-none"
                />
              </div>

              {/* Price row */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="0.00"
                    className={cn(
                      "w-full px-4 py-3 border text-sm focus:outline-none transition-colors",
                      errors.price ? "border-red-400" : "border-stone-200 focus:border-stone-800"
                    )}
                  />
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">Sale Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.salePrice}
                    onChange={(e) => setForm((f) => ({ ...f, salePrice: e.target.value }))}
                    placeholder="Optional"
                    className={cn(
                      "w-full px-4 py-3 border text-sm focus:outline-none transition-colors",
                      errors.salePrice ? "border-red-400" : "border-stone-200 focus:border-stone-800"
                    )}
                  />
                  {errors.salePrice && <p className="text-xs text-red-500 mt-1">{errors.salePrice}</p>}
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    placeholder="0"
                    className={cn(
                      "w-full px-4 py-3 border text-sm focus:outline-none transition-colors",
                      errors.stock ? "border-red-400" : "border-stone-200 focus:border-stone-800"
                    )}
                  />
                  {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
                </div>
              </div>

              {/* Category & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors bg-white appearance-none"
                  >
                    {categoryOptions.filter((c) => c !== "all").map((c) => (
                      <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as FormData["gender"] }))}
                    className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors bg-white appearance-none"
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">
                  Sizes <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {allSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={cn(
                        "w-12 h-12 border text-xs transition-all",
                        form.sizes.includes(size)
                          ? "border-stone-900 bg-stone-900 text-white"
                          : "border-stone-200 text-stone-600 hover:border-stone-400"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {errors.sizes && <p className="text-xs text-red-500 mt-1">{errors.sizes}</p>}
              </div>

              {/* Colors */}
              <div>
                <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">
                  Colors <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 flex-wrap mb-3">
                  {allColors.map((color) => {
                    const selected = form.colors.some((c) => c.name === color.name);
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => toggleColor(color)}
                        title={color.name}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all",
                          selected ? "border-stone-900 scale-110 ring-2 ring-stone-900 ring-offset-1" : "border-stone-200 hover:border-stone-400"
                        )}
                        style={{ backgroundColor: color.hex }}
                      />
                    );
                  })}
                </div>
                {errors.colors && <p className="text-xs text-red-500 mt-1">{errors.colors}</p>}

                {/* Per-color image inputs */}
                {form.colors.length > 0 && (
                  <div className="space-y-3 mt-3">
                    {form.colors.map((c) => (
                      <div key={c.name} className="border border-stone-100 p-3 bg-stone-50/50">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="w-4 h-4 rounded-full border border-stone-300 shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="text-xs font-medium text-stone-700">{c.name}</span>
                          <span className="text-[10px] text-stone-400">— images for this color</span>
                        </div>
                        <textarea
                          value={c.imageUrls}
                          onChange={(e) => updateColorImages(c.name, e.target.value)}
                          placeholder="https://images.unsplash.com/photo-xxx?w=800"
                          rows={2}
                          className="w-full px-3 py-2 border border-stone-200 bg-white text-xs focus:outline-none focus:border-stone-800 transition-colors resize-none font-mono"
                        />
                        <p className="text-[10px] text-stone-400 mt-1">One URL per line</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Default / fallback images */}
              <div>
                <label className="block text-xs tracking-widest uppercase text-stone-500 mb-1">
                  Default Images <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-stone-400 mb-2">
                  Fallback when no color selected. Leave empty to use first color's images.
                </p>
                <textarea
                  value={form.images}
                  onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
                  placeholder={"https://images.unsplash.com/photo-xxx?w=800\nhttps://images.unsplash.com/photo-yyy?w=800"}
                  rows={2}
                  className={cn(
                    "w-full px-4 py-3 border text-sm focus:outline-none transition-colors resize-none font-mono",
                    errors.images ? "border-red-400" : "border-stone-200 focus:border-stone-800"
                  )}
                />
                {errors.images && <p className="text-xs text-red-500 mt-0.5">{errors.images}</p>}
              </div>

              {/* Flags */}
              <div>
                <label className="block text-xs tracking-widest uppercase text-stone-500 mb-3">Labels</label>
                <div className="flex flex-wrap gap-3">
                  {(
                    [
                      { key: "isNew", label: "New Arrival" },
                      { key: "isBestSeller", label: "Best Seller" },
                      { key: "featured", label: "Featured" },
                    ] as { key: keyof FormData; label: string }[]
                  ).map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form[key] as boolean}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                        className="w-4 h-4 accent-stone-900"
                      />
                      <span className="text-sm text-stone-600">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel footer */}
            <div className="px-6 py-5 border-t border-stone-100 flex gap-3 shrink-0 bg-white">
              <button
                onClick={closeModal}
                className="flex-1 py-3 border border-stone-200 text-xs tracking-widest uppercase hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={13} />
                {editingProduct ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-8 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-xs tracking-widest uppercase font-medium">Confirm Delete</h3>
              <button onClick={() => setDeleteId(null)} className="text-stone-400 hover:text-stone-900">
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-stone-600 mb-8">
              Are you sure you want to delete{" "}
              <span className="font-medium text-stone-900">
                {productList.find((p) => p.id === deleteId)?.name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 border border-stone-200 text-xs tracking-widest uppercase hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-3 bg-red-600 text-white text-xs tracking-widest uppercase hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
