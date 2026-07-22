"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Search, Plus, Edit, Trash2, Eye, ChevronDown,
  Package, X, Save, RefreshCw, Cloud, CloudOff,
  AlertCircle, CheckCircle, Loader2, ImagePlus, Trash, Video, Send, Mail,
} from "lucide-react";
import { Product } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { useProductStore } from "@/store/productStore";
import { useCollectionStore } from "@/store/collectionStore";
import { useSubscriberStore } from "@/store/subscriberStore";
import { ToastContainer, useToast } from "@/components/ui/Toast";
import { CAD_RATE } from "@/store/localeStore";
import MediaPicker from "@/components/admin/MediaPicker";
import { compressImageFiles, useMediaLibraryStore } from "@/store/mediaLibraryStore";

const categoryOptions = ["all", "dresses", "tops", "bottoms", "sets", "outerwear", "accessories"];
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
  detailsCare: string; detailsCareFR: string;
  returnPolicy: string; returnPolicyFR: string;
  fitNote: string; fitNoteFR: string;
  sizeChart: string; sizeChartFR: string;
  price: string; salePrice: string;
  priceCAD: string; salePriceCAD: string;
  category: string;
  gender: "women" | "men" | "unisex"; sizes: string[]; inventoryBySize: Record<string, string>; colors: FormColor[];
  images: string; videoUrl: string; isNew: boolean; isBestSeller: boolean; featured: boolean;
  collections: string[];
};
type FormErrors = Partial<Record<keyof FormData | "stock", string>>;

const emptyForm: FormData = {
  name: "", slug: "",
  shortDescription: "", shortDescriptionFR: "",
  description: "", descriptionFR: "",
  detailsCare: "", detailsCareFR: "",
  returnPolicy: "", returnPolicyFR: "",
  fitNote: "", fitNoteFR: "",
  sizeChart: "", sizeChartFR: "",
  price: "", salePrice: "",
  priceCAD: "", salePriceCAD: "",
  category: "dresses",
  gender: "women", sizes: [], inventoryBySize: {}, colors: [], images: "", videoUrl: "",
  isNew: false, isBestSeller: false, featured: false,
  collections: [],
};

function toSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

function normalizeInventoryBySize(sizes: string[], values: Record<string, string>): Record<string, number> {
  return sizes.reduce<Record<string, number>>((acc, size) => {
    acc[size] = Math.max(0, Math.floor(Number(values[size] || 0)));
    return acc;
  }, {});
}

function totalInventory(values: Record<string, number>) {
  return Object.values(values).reduce((sum, qty) => sum + qty, 0);
}

function isValidProductImageSource(src: string) {
  const trimmed = src.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("/api/uploads/")) return true;
  if (/^data:image\/[a-z0-9.+-]+;base64,/i.test(trimmed)) return true;

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

type SizeChartKey = "sizeChart" | "sizeChartFR";
type SizeChartTable = { headers: string[]; rows: string[][] };
type MeasurementUnit = "in" | "cm";

const defaultSizeChartHeaders: Record<SizeChartKey, string[]> = {
  sizeChart: ["Size", "Bust", "Waist", "Hip", "Length"],
  sizeChartFR: ["Taille", "Buste", "Taille", "Hanches", "Longueur"],
};

function sizeChartHeaders(key: SizeChartKey, unit: MeasurementUnit) {
  return defaultSizeChartHeaders[key].map((header, index) =>
    index === 0 ? header : `${header} (${unit})`
  );
}

function parseSizeChartTable(raw: string, fallbackHeaders: string[]): SizeChartTable {
  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const parseLine = (line: string) =>
    line.split(line.includes("|") ? "|" : ",").map((cell) => cell.trim());

  if (lines.length === 0) return { headers: fallbackHeaders, rows: [] };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return {
    headers: headers.length > 0 ? headers : fallbackHeaders,
    rows,
  };
}

function serializeSizeChartTable(table: SizeChartTable): string {
  const cleanHeaders = table.headers.map((cell) => cell.trim()).filter(Boolean);
  const cleanRows = table.rows
    .map((row) => row.map((cell) => cell.trim()))
    .filter((row) => row.some(Boolean));

  const headerLine = cleanHeaders.join(" | ");
  if (cleanRows.length === 0) return headerLine;
  return [headerLine, ...cleanRows.map((row) => row.join(" | "))].join("\n");
}

function detectMeasurementUnit(raw: string): MeasurementUnit {
  return /\((cm|centimeters?)\)/i.test(raw) ? "cm" : "in";
}

function convertMeasurementText(value: string, from: MeasurementUnit, to: MeasurementUnit) {
  if (from === to || !value.trim()) return value;
  const factor = from === "in" ? 2.54 : 1 / 2.54;

  return value.replace(/\d+(?:\.\d+)?/g, (match) => {
    const converted = Number(match) * factor;
    if (!Number.isFinite(converted)) return match;
    return Number(converted.toFixed(1)).toString();
  });
}


export default function AdminProductsPage() {
  const [productList, setProductList]   = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);
  const { addProduct, updateProduct, removeProduct, setProducts } = useProductStore();
  const { collections, updateCollection } = useCollectionStore();
  const { subscribers, addCampaign } = useSubscriberStore();
  const addMediaAssets = useMediaLibraryStore((state) => state.addAssets);
  const { toasts, addToast, removeToast } = useToast(3000);

  // Announce modal state — shown after creating a new product
  const [announceProduct, setAnnounceProduct] = useState<Product | null>(null);
  const [announcing, setAnnouncing] = useState(false);
  const [announceResult, setAnnounceResult] = useState<{ ok: boolean; sent?: number } | null>(null);
  const [syncing, setSyncing] = useState(false);

  const [search, setSearch]     = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy]     = useState("newest");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const [modalOpen, setModalOpen]         = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm]                   = useState<FormData>(emptyForm);
  const [errors, setErrors]               = useState<FormErrors>({});
  const [saving, setSaving]               = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>("");
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>("in");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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
  const handleProductVideoUpload = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) setUploadedVideoUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const imageFiles = Array.from(files);
    if (imageFiles.length === 0) return;
    setUploadingImages(true);
    try {
      const compressedImages = await compressImageFiles(imageFiles);
      if (compressedImages.length === 0) return;
      const fd = new FormData();
      compressedImages.forEach((f) => fd.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      const urls = data.urls as string[];
      addMediaAssets(urls.map((url, index) => ({
        name: compressedImages[index]?.name ?? `product-image-${index + 1}`,
        url,
        type: compressedImages[index]?.type ?? "image/*",
        size: compressedImages[index]?.size ?? 0,
      })));
      setUploadedImages((prev) => [...prev, ...urls]);
    } catch (err) {
      addToast("error", `Upload failed: ${err}`);
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const parseUrls = (raw: string) => raw.split("\n").map((u) => u.trim()).filter(Boolean);

  const removeUrlFromImages = (urlToRemove: string) => {
    const updated = parseUrls(form.images).filter((u) => u !== urlToRemove);
    setForm((f) => ({ ...f, images: updated.join("\n") }));
  };

  const addImageFromLibrary = (url: string) => {
    const existing = parseUrls(form.images);
    if (!existing.includes(url)) {
      setForm((f) => ({ ...f, images: [...existing, url].join("\n") }));
    }
    setShowUrlInput(false);
    if (errors.images) setErrors((prev) => ({ ...prev, images: undefined }));
  };

  const openAdd = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setErrors({});
    setUploadedImages([]);
    setUploadedVideoUrl("");
    setShowUrlInput(false);
    setMeasurementUnit("in");
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setMeasurementUnit(detectMeasurementUnit(product.sizeChart ?? product.sizeChartFR ?? ""));
    const inventoryBySize = product.sizes.reduce<Record<string, string>>((acc, size) => {
      acc[size] = String(product.inventoryBySize?.[size] ?? 0);
      return acc;
    }, {});
    setEditingProduct(product);
    setUploadedImages([]);
    setUploadedVideoUrl("");
    setForm({
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      shortDescriptionFR: product.shortDescriptionFR ?? "",
      description: product.description,
      descriptionFR: product.descriptionFR ?? "",
      detailsCare: product.detailsCare ?? "",
      detailsCareFR: product.detailsCareFR ?? "",
      returnPolicy: product.returnPolicy ?? "",
      returnPolicyFR: product.returnPolicyFR ?? "",
      fitNote: product.fitNote ?? "",
      fitNoteFR: product.fitNoteFR ?? "",
      sizeChart: product.sizeChart ?? "",
      sizeChartFR: product.sizeChartFR ?? "",
      price: product.price ? String(product.price) : "",
      salePrice: product.salePrice ? String(product.salePrice) : "",
      category: product.category,
      gender: product.gender,
      sizes: [...product.sizes],
      inventoryBySize,
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
      collections: collections
        .filter((c) => c.productIds.includes(product.id))
        .map((c) => c.id),
    });
    setErrors({});
    setShowUrlInput(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setErrors({});
    setUploadedImages([]);
    setUploadedVideoUrl("");
    setShowUrlInput(false);
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.priceCAD || isNaN(Number(form.priceCAD)) || Number(form.priceCAD) <= 0) e.priceCAD = "Valid CAD price required";
    if (form.salePriceCAD && (isNaN(Number(form.salePriceCAD)) || Number(form.salePriceCAD) <= 0)) e.salePriceCAD = "Invalid CAD sale price";
    if (form.salePriceCAD && Number(form.salePriceCAD) >= Number(form.priceCAD)) e.salePriceCAD = "Sale price must be lower than CAD price";
    if (form.price && (isNaN(Number(form.price)) || Number(form.price) <= 0)) e.price = "Invalid USD price";
    if (form.salePrice && (isNaN(Number(form.salePrice)) || Number(form.salePrice) <= 0)) e.salePrice = "Invalid USD sale price";
    if (!form.shortDescription.trim()) e.shortDescription = "Required";
    if (form.sizes.length === 0) e.sizes = "Select at least one size";
    const invalidSizeStock = form.sizes.some((size) => {
      const qty = form.inventoryBySize[size];
      return qty === undefined || qty === "" || isNaN(Number(qty)) || Number(qty) < 0;
    });
    if (invalidSizeStock) e.stock = "Enter a valid quantity for each selected size";
    if (!form.images.trim() && uploadedImages.length === 0) e.images = "At least one image required";
    if (!e.images && parseUrls(form.images).some((url) => !isValidProductImageSource(url))) {
      e.images = "Use full http(s) image URLs, /uploads/... images, or upload files from your computer";
    }
    if (form.collections.length === 0) e.collections = "Select at least one collection";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const syncCollections = (productId: string, selectedColIds: string[]) => {
    collections.forEach((col) => {
      const shouldInclude = selectedColIds.includes(col.id);
      const isIncluded = col.productIds.includes(productId);
      if (shouldInclude && !isIncluded) {
        updateCollection(col.id, { productIds: [...col.productIds, productId] });
      } else if (!shouldInclude && isIncluded) {
        updateCollection(col.id, { productIds: col.productIds.filter((id) => id !== productId) });
      }
    });
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const imageList = [...uploadedImages, ...parseUrls(form.images)];
    // Sort primary color to front
    const sortedColors = [...form.colors].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
    const builtColors = sortedColors.map((c) => ({
      name: c.name, hex: c.hex, images: [],
    }));
    const inventoryBySize = normalizeInventoryBySize(form.sizes, form.inventoryBySize);
    const stock = totalInventory(inventoryBySize);

    const payload: Omit<Product, "id"> = {
      name: form.name,
      slug: form.slug || toSlug(form.name),
      shortDescription: form.shortDescription,
      shortDescriptionFR: form.shortDescriptionFR.trim() || undefined,
      description: form.description,
      descriptionFR: form.descriptionFR.trim() || undefined,
      detailsCare: form.detailsCare.trim() || undefined,
      detailsCareFR: form.detailsCareFR.trim() || undefined,
      returnPolicy: form.returnPolicy.trim() || undefined,
      returnPolicyFR: form.returnPolicyFR.trim() || undefined,
      fitNote: form.fitNote.trim() || undefined,
      fitNoteFR: form.fitNoteFR.trim() || undefined,
      sizeChart: form.sizeChart.trim() || undefined,
      sizeChartFR: form.sizeChartFR.trim() || undefined,
      price: form.price ? Number(form.price) : Math.round((Number(form.priceCAD) / CAD_RATE) * 100) / 100,
      salePrice: form.salePrice ? Number(form.salePrice) : form.salePriceCAD ? Math.round((Number(form.salePriceCAD) / CAD_RATE) * 100) / 100 : undefined,
      stock,
      inventoryBySize,
      category: form.category,
      gender: form.gender,
      sizes: form.sizes,
      colors: builtColors,
      images: imageList.length ? imageList : (builtColors[0]?.images ?? []),
      isNew: form.isNew,
      isBestSeller: form.isBestSeller,
      featured: form.featured,
      tags: [],
      videoUrl: uploadedVideoUrl || form.videoUrl.trim() || undefined,
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

        const inventoryRes = await fetch(`/api/shopify/products/${editingProduct.id}/inventory`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inventoryBySize }),
        });
        const inventoryData = await inventoryRes.json();
        if (!inventoryRes.ok) throw new Error(inventoryData.error ?? "Inventory update failed");
        if (inventoryData.warning) addToast("success", inventoryData.warning);

        const updatedProduct = inventoryData.warning ? data.product : { ...data.product, stock, inventoryBySize };
        setProductList((prev) => prev.map((p) => p.id === editingProduct.id ? updatedProduct : p));
        updateProduct(updatedProduct); // sync store
        syncCollections(data.product.id, form.collections);
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
        syncCollections(data.product.id, form.collections);
        addToast("success", `"${data.product.name}" created on Shopify`);
        // Prompt to send email announcement if there are subscribers
        if (subscribers.length > 0) {
          setAnnounceProduct(data.product);
          setAnnounceResult(null);
        }
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

  const handleAnnounce = async (product: Product) => {
    if (subscribers.length === 0) {
      setAnnounceProduct(null);
      return;
    }
    setAnnouncing(true);
    setAnnounceResult(null);
    try {
      const subject = `New Arrival: ${product.name}`;
      const res = await fetch("/api/admin/send-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: subscribers.map((s) => s.email),
          subject,
          type: "new_product",
          products: [{
            name: product.name,
            slug: product.slug,
            price: product.priceCAD ?? product.price,
            salePrice: product.salePriceCAD ?? product.salePrice,
            image: product.images[0] ?? "",
            shortDescription: product.shortDescription,
            currency: "CAD",
          }],
        }),
      });
      const data = await res.json();
      if (data.ok) {
        addCampaign({
          type: "new_product",
          subject,
          productIds: [product.id],
          productNames: [product.name],
          productImage: product.images[0],
          recipientSource: "subscribers",
          sentAt: new Date().toISOString(),
          recipientCount: data.recipientCount ?? subscribers.length,
          successCount: data.successCount ?? 0,
          status: data.status ?? "sent",
        });
        setAnnounceResult({ ok: true, sent: data.successCount ?? subscribers.length });
      } else {
        setAnnounceResult({ ok: false });
      }
    } catch {
      setAnnounceResult({ ok: false });
    } finally {
      setAnnouncing(false);
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Inventory update failed");
      if (data.warning) {
        addToast("success", data.warning);
        return;
      }
      setProductList((prev) => prev.map((p) => p.id === id ? { ...p, stock: newStock } : p));
    } catch (err) {
      addToast("error", String(err));
    } finally {
      setSyncing(false);
    }
  };

  const toggleSize = (size: string) => setForm((f) => {
    if (f.sizes.includes(size)) {
      const inventoryBySize = { ...f.inventoryBySize };
      delete inventoryBySize[size];
      return { ...f, sizes: f.sizes.filter((s) => s !== size), inventoryBySize };
    }
    return {
      ...f,
      sizes: [...f.sizes, size],
      inventoryBySize: { ...f.inventoryBySize, [size]: f.inventoryBySize[size] ?? "0" },
    };
  });

  const sizeMeasurementValue = (size: string, measurementIndex: number) => {
    const table = parseSizeChartTable(form.sizeChart, sizeChartHeaders("sizeChart", measurementUnit));
    const row = table.rows.find((r) => r[0] === size);
    return row?.[measurementIndex + 1] ?? "";
  };

  const convertSizeChartUnit = (raw: string, key: SizeChartKey, from: MeasurementUnit, to: MeasurementUnit) => {
    const table = parseSizeChartTable(raw, sizeChartHeaders(key, from));
    const headers = sizeChartHeaders(key, to);
    const rows = table.rows.map((row) => {
      const nextRow = [...row];
      while (nextRow.length < headers.length) nextRow.push("");
      return nextRow.map((cell, index) =>
        index === 0 ? cell : convertMeasurementText(cell, from, to)
      );
    });

    return serializeSizeChartTable({ headers, rows });
  };

  const changeMeasurementUnit = (unit: MeasurementUnit) => {
    setForm((f) => {
      if (measurementUnit === unit) return f;

      return {
        ...f,
        sizeChart: convertSizeChartUnit(f.sizeChart, "sizeChart", measurementUnit, unit),
        sizeChartFR: convertSizeChartUnit(f.sizeChartFR, "sizeChartFR", measurementUnit, unit),
      };
    });
    setMeasurementUnit(unit);
  };

  const updateSelectedSizeMeasurement = (size: string, measurementIndex: number, value: string) => {
    setForm((f) => {
      const updateChart = (key: SizeChartKey) => {
        const table = parseSizeChartTable(f[key], sizeChartHeaders(key, measurementUnit));
        const headers = sizeChartHeaders(key, measurementUnit);
        const current = table.rows.find((row) => row[0] === size) ?? [size];
        const nextRow = [...current];
        while (nextRow.length < headers.length) nextRow.push("");
        nextRow[0] = size;
        nextRow[measurementIndex + 1] = value;

        const rowsBySize = new Map(table.rows.map((row) => [row[0], row]));
        rowsBySize.set(size, nextRow);

        const rows = f.sizes.map((selectedSize) => {
          const row = rowsBySize.get(selectedSize) ?? [selectedSize];
          const normalized = [...row];
          while (normalized.length < headers.length) normalized.push("");
          normalized[0] = selectedSize;
          return normalized;
        });

        return serializeSizeChartTable({ headers, rows });
      };

      return {
        ...f,
        sizeChart: updateChart("sizeChart"),
        sizeChartFR: updateChart("sizeChartFR"),
      };
    });
  };

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
    <div className="p-4 md:p-8 relative">

      <MediaPicker
        open={mediaPickerOpen}
        title="Product Images"
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(asset) => addImageFromLibrary(asset.url)}
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <p className="type-label text-stone-400">Catalog</p>
            {syncing
              ? <span className="flex items-center gap-1 text-[10px] text-amber-500 tracking-widest uppercase"><Loader2 size={10} className="animate-spin" /> Syncing</span>
              : <span className="flex items-center gap-1 text-[10px] text-emerald-500 tracking-widest uppercase"><Cloud size={10} /> Shopify Live</span>
            }
          </div>
          <h1 className="text-3xl md:text-4xl text-stone-900" style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}>
            Products
          </h1>
          <p className="text-stone-400 text-sm mt-1">{productList.length} total products</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2.5 border border-stone-200 text-xs tracking-widest uppercase hover:bg-stone-50 transition-colors disabled:opacity-50"
            title="Sync from Shopify"
          >
            <RefreshCw size={13} className={cn(loading && "animate-spin")} />
            <span className="hidden sm:inline">Sync</span>
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors"
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
        <div className="overflow-x-auto">
        <div className="min-w-[760px]">
        <div className="grid grid-cols-12 gap-4 px-4 md:px-6 py-3 border-b border-stone-100 bg-stone-50">
          <p className="col-span-3 text-[10px] tracking-widest uppercase text-stone-400">Product</p>
          <p className="col-span-1 text-[10px] tracking-widest uppercase text-stone-400">Category</p>
          <p className="col-span-2 text-[10px] tracking-widest uppercase text-stone-400">Collection</p>
          <p className="col-span-2 text-[10px] tracking-widest uppercase text-stone-400">Labels</p>
          <p className="col-span-1 text-[10px] tracking-widest uppercase text-stone-400 text-right">Price</p>
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
              const productCollections = collections.filter((collection) =>
                collection.productIds.includes(product.id)
              );
              return (
                <div key={product.id} className="grid grid-cols-12 gap-4 px-4 md:px-6 py-3 md:py-4 items-center hover:bg-stone-50/50 transition-colors group">
                  {/* Product name + image */}
                  <div className="col-span-3 flex items-center gap-4 min-w-0">
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

                  {/* Collection */}
                  <div className="col-span-2 min-w-0">
                    {productCollections.length > 0 ? (
                      <div className="flex flex-wrap gap-1" title={productCollections.map((collection) => collection.name).join(", ")}>
                        {productCollections.map((collection) => (
                          <span
                            key={collection.id}
                            className="max-w-full truncate text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 tracking-wider uppercase"
                          >
                            {collection.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-stone-300">—</span>
                    )}
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
                  <div className="col-span-1 text-right">
                    {(product.salePriceCAD ?? product.salePrice) ? (
                      <>
                        <p className="text-sm text-red-600" style={{ fontFamily: "var(--font-cormorant), serif" }}>{formatPrice(product.salePriceCAD ?? product.salePrice ?? 0, "CAD")}</p>
                        <p className="text-xs text-stone-400 line-through">{formatPrice(product.priceCAD ?? product.price, "CAD")}</p>
                      </>
                    ) : (
                      <p className="text-sm" style={{ fontFamily: "var(--font-cormorant), serif" }}>{formatPrice(product.priceCAD ?? product.price, "CAD")}</p>
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
        </div>{/* min-w */}
        </div>{/* overflow-x-auto */}
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
          <button className="flex-1 bg-black/40 backdrop-blur-sm cursor-default" onClick={closeModal} aria-label="Close" />
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

              {/* Details & care */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-px flex-1 bg-stone-100" />
                  <span className="text-[10px] tracking-widest uppercase text-stone-400">Details &amp; Care</span>
                  <div className="h-px flex-1 bg-stone-100" />
                </div>
                <Field label="Details & Care — EN">
                  <textarea value={form.detailsCare} onChange={(e) => setForm((f) => ({ ...f, detailsCare: e.target.value }))}
                    placeholder="Fabric, lining, fit notes, and care instructions..." rows={4}
                    className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors resize-none" />
                </Field>
                <Field label="Details & Care — FR">
                  <textarea value={form.detailsCareFR} onChange={(e) => setForm((f) => ({ ...f, detailsCareFR: e.target.value }))}
                    placeholder="Matière, doublure, coupe et conseils d'entretien..." rows={4}
                    className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors resize-none" />
                </Field>
              </div>

              {/* Fit note EN / FR */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-px flex-1 bg-stone-100" />
                  <span className="text-[10px] tracking-widest uppercase text-stone-400">Fit Note</span>
                  <div className="h-px flex-1 bg-stone-100" />
                </div>
                <Field label="Fit Note — EN">
                  <textarea
                    value={form.fitNote}
                    onChange={(e) => setForm((f) => ({ ...f, fitNote: e.target.value }))}
                    placeholder="e.g. True to size. Fitted through the bodice with a relaxed skirt."
                    rows={3}
                    className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors resize-none"
                  />
                </Field>
                <Field label="Fit Note — FR">
                  <textarea
                    value={form.fitNoteFR}
                    onChange={(e) => setForm((f) => ({ ...f, fitNoteFR: e.target.value }))}
                    placeholder="Note de coupe en français..."
                    rows={3}
                    className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors resize-none"
                  />
                </Field>
              </div>

              {/* Product-specific policies */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-px flex-1 bg-stone-100" />
                  <span className="text-[10px] tracking-widest uppercase text-stone-400">Returns</span>
                  <div className="h-px flex-1 bg-stone-100" />
                </div>
                <Field label="Return Policy — EN">
                  <textarea value={form.returnPolicy} onChange={(e) => setForm((f) => ({ ...f, returnPolicy: e.target.value }))}
                    placeholder="Leave empty to use the default return policy..." rows={3}
                    className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors resize-none" />
                </Field>
                <Field label="Return Policy — FR">
                  <textarea value={form.returnPolicyFR} onChange={(e) => setForm((f) => ({ ...f, returnPolicyFR: e.target.value }))}
                    placeholder="Laisser vide pour utiliser la politique de retour par défaut..." rows={3}
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
                  <Field label="Reference Price — USD ($)" error={errors.price}>
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
                  <Field label="Price — CAD (CA$)" required error={errors.priceCAD}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 font-medium">CA$</span>
                      <input type="number" min="0" step="0.01" value={form.priceCAD}
                        onChange={(e) => setForm((f) => ({ ...f, priceCAD: e.target.value }))}
                        placeholder="0.00" className={inputCls(!!errors.priceCAD) + " pl-10"} />
                    </div>
                  </Field>
                  <Field label="Sale Price — CAD (CA$)" error={errors.salePriceCAD}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 font-medium">CA$</span>
                      <input type="number" min="0" step="0.01" value={form.salePriceCAD}
                        onChange={(e) => setForm((f) => ({ ...f, salePriceCAD: e.target.value }))}
                        placeholder="Optional" className={inputCls(!!errors.salePriceCAD) + " pl-10"} />
                    </div>
                  </Field>
                </div>

                {/* Note */}
                <p className="text-[10px] text-stone-400 leading-relaxed">
                  CAD is the storefront and checkout currency. USD fields are optional references and will be auto-estimated from CAD if left empty.
                </p>

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
                <div className="space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    {allSizes.map((size) => (
                      <button key={size} type="button" onClick={() => toggleSize(size)}
                        className={cn("w-12 h-12 border text-xs transition-all",
                          form.sizes.includes(size) ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 text-stone-600 hover:border-stone-400")}>
                        {size}
                      </button>
                    ))}
                  </div>

                  {form.sizes.length === 0 ? (
                    <p className="text-[11px] text-stone-400">
                      Select one or more sizes to enter quantity for each size.
                    </p>
                  ) : (
                    <div className="border border-stone-200 divide-y divide-stone-100">
                      <div className="flex items-center justify-between px-3 py-2 bg-stone-50">
                        <span className="text-[10px] tracking-widest uppercase text-stone-400">Inventory & size measurements</span>
                        <div className="flex items-center gap-3">
                          <div className="flex border border-stone-200 bg-white">
                            {(["in", "cm"] as MeasurementUnit[]).map((unit) => (
                              <button
                                key={unit}
                                type="button"
                                onClick={() => changeMeasurementUnit(unit)}
                                className={cn(
                                  "px-3 py-1.5 text-[10px] uppercase tracking-widest transition-colors",
                                  measurementUnit === unit
                                    ? "bg-stone-900 text-white"
                                    : "text-stone-500 hover:text-stone-900"
                                )}
                              >
                                {unit}
                              </button>
                            ))}
                          </div>
                          <span className="text-[10px] text-stone-400">{form.sizes.length} selected</span>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <div className="min-w-[720px]">
                          <div className="grid grid-cols-[70px_100px_repeat(4,minmax(110px,1fr))] gap-3 px-3 py-2 bg-white">
                            <span className="text-[10px] tracking-widest uppercase text-stone-400">Size</span>
                            <span className="text-[10px] tracking-widest uppercase text-stone-400">Quantity</span>
                            {sizeChartHeaders("sizeChart", measurementUnit).slice(1).map((header) => (
                              <span key={header} className="text-[10px] tracking-widest uppercase text-stone-400">{header}</span>
                            ))}
                          </div>
                          {form.sizes.map((size) => (
                            <div key={size} className="grid grid-cols-[70px_100px_repeat(4,minmax(110px,1fr))] gap-3 items-center px-3 py-2">
                              <span className="text-xs font-medium text-stone-700">{size}</span>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={form.inventoryBySize[size] ?? "0"}
                                placeholder={`Qty for ${size}`}
                                inputMode="numeric"
                                onChange={(e) => setForm((f) => ({
                                  ...f,
                                  inventoryBySize: { ...f.inventoryBySize, [size]: e.target.value },
                                }))}
                                className={cn(
                                  "w-full px-3 py-2 border text-sm focus:outline-none transition-colors",
                                  errors.stock ? "border-red-400 focus:border-red-500" : "border-stone-200 focus:border-stone-800"
                                )}
                              />
                              {defaultSizeChartHeaders.sizeChart.slice(1).map((header, measurementIndex) => (
                                <input
                                  key={`${size}-${header}`}
                                  type="text"
                                  value={sizeMeasurementValue(size, measurementIndex)}
                                  placeholder={`${header} (${measurementUnit})`}
                                  onChange={(e) => updateSelectedSizeMeasurement(size, measurementIndex, e.target.value)}
                                  className="w-full px-3 py-2 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 bg-stone-50">
                        <span className="text-[10px] tracking-widest uppercase text-stone-400">Total Stock</span>
                        <span className="text-xs font-medium text-stone-700">
                          {totalInventory(normalizeInventoryBySize(form.sizes, form.inventoryBySize))}
                        </span>
                      </div>
                    </div>
                  )}
                  {errors.stock && <p className="text-xs text-red-500">{errors.stock}</p>}
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
              <Field label="Product Images" required error={errors.images}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.jfif,.ifif"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files)}
                />

                {/* Selected images from Shopify, uploads, or the media library */}
                {parseUrls(form.images).length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                      Selected images
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {parseUrls(form.images).map((url, i) => (
                        <div key={i} className="relative group aspect-square bg-stone-100 overflow-hidden rounded-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeUrlFromImages(url)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash size={9} />
                          </button>
                          {i === 0 && (
                            <span className="absolute bottom-1 left-1 bg-stone-900/80 text-white text-[9px] px-1.5 py-0.5">
                              Main
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Newly uploaded images (pending Shopify sync) */}
                {uploadedImages.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                      Uploaded — sẽ sync lên Shopify CDN khi lưu
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {uploadedImages.map((src, i) => (
                        <div key={i} className="relative group aspect-square bg-stone-100 overflow-hidden rounded-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setUploadedImages((prev) => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash size={9} />
                          </button>
                          <span className="absolute bottom-1 left-1 bg-amber-500/90 text-white text-[9px] px-1.5 py-0.5">
                            Pending
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload drop zone */}
                <div
                  onClick={() => !uploadingImages && fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handleImageUpload(e.dataTransfer.files); }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 border-2 border-dashed py-6 transition-colors mb-2",
                    uploadingImages
                      ? "border-stone-300 bg-stone-50 cursor-wait"
                      : "border-stone-200 hover:border-stone-400 bg-stone-50/50 hover:bg-stone-50 cursor-pointer"
                  )}
                >
                  {uploadingImages ? (
                    <>
                      <Loader2 size={22} className="text-stone-400 animate-spin" />
                      <p className="text-xs text-stone-500">Đang upload lên server...</p>
                    </>
                  ) : (
                    <>
                      <ImagePlus size={22} className="text-stone-400" />
                      <p className="text-xs text-stone-500">Click hoặc kéo thả ảnh từ máy tính</p>
                      <p className="text-[10px] text-stone-400">JPG, PNG, WEBP · tự nén dưới 10 MB/ảnh</p>
                    </>
                  )}
                </div>

                {/* URL paste — collapsible */}
                <button
                  type="button"
                  onClick={() => setMediaPickerOpen(true)}
                  className="mb-2 inline-flex items-center gap-2 border border-stone-200 px-3 py-2 text-[10px] uppercase tracking-widests text-stone-600 transition-colors hover:border-stone-800 hover:text-stone-900"
                >
                  <ImagePlus size={12} />
                  Choose from Library
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlInput((v) => !v)}
                  className="text-[10px] text-stone-400 hover:text-stone-600 underline underline-offset-2 transition-colors mb-1.5"
                >
                  {showUrlInput ? "Ẩn" : "Dán URL ảnh thay thế"}
                </button>
                {showUrlInput && (
                  <textarea
                    value={form.images}
                    onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
                    placeholder={"https://cdn.example.com/image-1.jpg\nhttps://..."}
                    rows={3}
                    className={cn(
                      "w-full px-4 py-3 border text-sm focus:outline-none transition-colors resize-none font-mono",
                      errors.images ? "border-red-400" : "border-stone-200 focus:border-stone-800"
                    )}
                  />
                )}
              </Field>

              {/* Product Video */}
              <Field label="Product Video">
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleProductVideoUpload(e.target.files?.[0] ?? null)}
                />

                {/* Upload or YouTube tabs */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 border border-dashed border-stone-200 hover:border-stone-400 py-3 text-xs text-stone-500 hover:text-stone-800 transition-colors"
                  >
                    <Video size={14} /> Upload file (MP4/WebM)
                  </button>
                  <div className="relative">
                    <input
                      type="url"
                      value={form.videoUrl}
                      onChange={(e) => { setForm((f) => ({ ...f, videoUrl: e.target.value })); setUploadedVideoUrl(""); }}
                      placeholder="YouTube URL..."
                      className="w-full px-3 py-3 border border-stone-200 text-xs focus:outline-none focus:border-stone-800 transition-colors"
                    />
                  </div>
                </div>

                {/* Uploaded video preview */}
                {uploadedVideoUrl && (
                  <div className="mt-2 space-y-1">
                    <video src={uploadedVideoUrl} controls className="w-full rounded border border-stone-200" style={{ maxHeight: 200 }} />
                    <button type="button" onClick={() => { setUploadedVideoUrl(""); if (videoInputRef.current) videoInputRef.current.value = ""; }}
                      className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-700">
                      <Trash size={10} /> Xoá video
                    </button>
                  </div>
                )}

                {/* YouTube preview */}
                {!uploadedVideoUrl && form.videoUrl && (() => {
                  const patterns = [/youtube\.com\/watch\?v=([^&]+)/, /youtu\.be\/([^?/]+)/, /youtube\.com\/embed\/([^?]+)/];
                  const id = patterns.reduce<string | null>((acc, p) => acc ?? (form.videoUrl.match(p)?.[1] ?? null), null);
                  return id ? (
                    <div className="mt-2 relative aspect-video bg-stone-900 overflow-hidden rounded">
                      <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} alt="Video preview"
                        className="w-full h-full object-cover opacity-70" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 ml-0.5"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1.5 text-[11px] text-amber-500">URL YouTube không hợp lệ</p>
                  );
                })()}
              </Field>

              {/* Collections */}
              <Field label="Collections" required error={errors.collections}>
                {collections.length > 0 ? (
                  <div className="space-y-2">
                    {collections.map((col) => (
                      <label key={col.id} className="flex items-center gap-2.5 cursor-pointer select-none group">
                        <input
                          type="checkbox"
                          checked={form.collections.includes(col.id)}
                          onChange={(e) => {
                            setForm((f) => ({
                              ...f,
                              collections: e.target.checked
                                ? [...f.collections, col.id]
                                : f.collections.filter((id) => id !== col.id),
                            }));
                            if (errors.collections) {
                              setErrors((prev) => ({ ...prev, collections: undefined }));
                            }
                          }}
                          className="w-4 h-4 accent-stone-900 shrink-0"
                        />
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm text-stone-700 group-hover:text-stone-900 transition-colors truncate">
                            {col.name}
                          </span>
                          {col.status === "draft" && (
                            <span className="text-[9px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded tracking-widest uppercase shrink-0">
                              Draft
                            </span>
                          )}
                          {col.membersOnly && (
                            <span className="text-[9px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded tracking-widest uppercase shrink-0">
                              Members Only
                            </span>
                          )}
                          {col.featured && (
                            <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded tracking-widest uppercase shrink-0">
                              Featured
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="border border-dashed border-stone-200 px-3 py-3 text-xs text-stone-500">
                    Create a collection before saving this product.
                  </p>
                )}
                <p className="text-[11px] text-stone-400 mt-2">
                  Product will appear in the selected collection pages.
                </p>
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

      {/* ── Announce new product modal ─────────────────────────────────────── */}
      {announceProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            className="absolute inset-0 w-full h-full bg-black/50 cursor-default"
            onClick={() => { setAnnounceProduct(null); setAnnounceResult(null); }}
            aria-label="Close"
          />
          <div className="relative bg-white w-full max-w-sm shadow-2xl p-6">
            {/* Icon */}
            <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center mb-4">
              <Mail size={16} className="text-stone-500" />
            </div>

            <h3 className="text-base font-light text-stone-900 mb-1">Announce to subscribers?</h3>
            <p className="text-xs text-stone-500 mb-5 leading-relaxed">
              <span className="font-medium text-stone-700">&ldquo;{announceProduct.name}&rdquo;</span> is now live.
              Send a &ldquo;New Arrival&rdquo; email to <span className="font-medium text-stone-700">{subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""}</span>?
            </p>

            {/* Result */}
            {announceResult && (
              <div className={cn(
                "flex items-center gap-2 p-3 mb-4 text-xs",
                announceResult.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
              )}>
                {announceResult.ok
                  ? <><CheckCircle size={13} /> Sent to {announceResult.sent} subscriber{(announceResult.sent ?? 0) !== 1 ? "s" : ""}</>
                  : <><AlertCircle size={13} /> Failed to send. Check SMTP settings.</>
                }
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setAnnounceProduct(null); setAnnounceResult(null); }}
                className="flex-1 py-2.5 border border-stone-200 text-xs tracking-widest uppercase text-stone-600 hover:bg-stone-50 transition-colors"
              >
                {announceResult ? "Close" : "Skip"}
              </button>
              {!announceResult && (
                <button
                  onClick={() => handleAnnounce(announceProduct)}
                  disabled={announcing}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 bg-stone-900 text-white text-xs tracking-widest uppercase transition-colors",
                    announcing ? "opacity-50 cursor-not-allowed" : "hover:bg-stone-700"
                  )}
                >
                  {announcing
                    ? <><Loader2 size={13} className="animate-spin" /> Sending...</>
                    : <><Send size={13} /> Send Email</>
                  }
                </button>
              )}
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
