/**
 * Shopify Admin REST API — product & inventory operations.
 * All functions are server-side only (use in API routes / Server Components).
 */

import { Product, Color } from "@/types";
import { readFile } from "fs/promises";
import { basename, join } from "path";
import { CAD_RATE } from "@/store/localeStore";

const DOMAIN  = process.env.SHOPIFY_SHOP_DOMAIN!;
const TOKEN   = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!;
const API_VER = "2024-01";
const BASE    = `https://${DOMAIN}/admin/api/${API_VER}`;
const CONFIGURED_LOCATION_ID = process.env.SHOPIFY_LOCATION_ID
  ? Number(process.env.SHOPIFY_LOCATION_ID)
  : null;
const HEADERS = {
  "Content-Type": "application/json",
  "X-Shopify-Access-Token": TOKEN,
};

// ── raw Shopify types ─────────────────────────────────────────────────────────

interface ShopifyVariant {
  id: number;
  title: string;         // size value e.g. "M"
  price: string;
  compare_at_price: string | null;
  inventory_quantity: number;
  inventory_item_id: number;
  inventory_management: string | null;
  sku: string;
  option1: string | null; // Size
  option2: string | null;
  option3: string | null;
}

interface ShopifyImage { id: number; src: string; position: number }
type ShopifyImageInput = { src: string } | { attachment: string; filename: string };
interface ShopifyOption { id: number; name: string; values: string[] }
interface ShopifyMetafield {
  id: number;
  namespace: string;
  key: string;
  value: string;
  type?: string;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string;           // comma-separated
  status: "active" | "draft" | "archived";
  variants: ShopifyVariant[];
  options: ShopifyOption[];
  images: ShopifyImage[];
  metafields?: ShopifyMetafield[];
  created_at: string;
  updated_at: string;
}

// ── helpers ───────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function parseTags(tags: string): Record<string, string> {
  const out: Record<string, string> = {};
  tags.split(",").map((t) => t.trim()).filter(Boolean).forEach((t) => {
    const idx = t.indexOf(":");
    if (idx > -1) out[t.slice(0, idx)] = t.slice(idx + 1);
    else out[t] = "true";
  });
  return out;
}

function normalizeCategory(value: string | undefined): string {
  const normalized = (value || "dresses")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "dresses";

  const aliases: Record<string, string> = {
    dress: "dresses",
    top: "tops",
    bottom: "bottoms",
    pant: "bottoms",
    pants: "bottoms",
    skirt: "bottoms",
    set: "sets",
    accessory: "accessories",
  };

  return aliases[normalized] ?? normalized;
}

function buildTags(
  gender: string,
  category: string,
  isNew: boolean,
  isBestSeller: boolean,
  colors: Color[],
  extraTags: string[]
): string {
  const tags: string[] = [
    `gender:${gender}`,
    `cat:${category}`,
    ...(isNew ? ["isNew"] : []),
    ...(isBestSeller ? ["isBestSeller"] : []),
    ...colors.map((c) => `color:${c.name}:${c.hex.replace("#", "")}`),
    ...extraTags,
  ];
  return tags.join(",");
}

const METAFIELD_NAMESPACE = "lunelle";
const METAFIELD_KEYS = {
  shortDescription: "short_description",
  shortDescriptionFR: "short_description_fr",
  descriptionFR: "description_fr",
  detailsCare: "details_care",
  detailsCareFR: "details_care_fr",
  returnPolicy: "return_policy",
  returnPolicyFR: "return_policy_fr",
  fitNote: "fit_note",
  fitNoteFR: "fit_note_fr",
  sizeChart: "size_chart",
  sizeChartFR: "size_chart_fr",
} as const;

function metafieldValue(sp: ShopifyProduct, key: string): string | undefined {
  const value = sp.metafields?.find(
    (m) => m.namespace === METAFIELD_NAMESPACE && m.key === key
  )?.value;
  return value?.trim() || undefined;
}

function localUploadFilename(src: string): string | null {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const uploadPrefixes = [`${appUrl}/uploads/`, `${appUrl}/api/uploads/`];
  const trimmed = src.trim();

  const matchedPrefix = uploadPrefixes.find((prefix) => trimmed.startsWith(prefix));
  if (matchedPrefix) {
    return decodeURIComponent(trimmed.slice(matchedPrefix.length));
  }

  try {
    const url = new URL(trimmed);
    const uploadPathPrefix = ["/uploads/", "/api/uploads/"].find((prefix) => url.pathname.startsWith(prefix));
    if (uploadPathPrefix) {
      return decodeURIComponent(url.pathname.slice(uploadPathPrefix.length));
    }
  } catch {
    const uploadPathPrefix = ["/uploads/", "/api/uploads/"].find((prefix) => trimmed.startsWith(prefix));
    if (uploadPathPrefix) return decodeURIComponent(trimmed.slice(uploadPathPrefix.length));
  }

  return null;
}

function dataUrlImageInput(src: string, index: number): ShopifyImageInput | null {
  const match = src.trim().match(/^data:image\/([a-z0-9.+-]+);base64,([a-z0-9+/=\s]+)$/i);
  if (!match) return null;

  const extension = match[1].toLowerCase().replace("jpeg", "jpg").replace(/[^a-z0-9]/g, "") || "jpg";
  const attachment = match[2].replace(/\s/g, "");

  return {
    attachment,
    filename: `product-image-${index + 1}.${extension}`,
  };
}

function remoteImageInput(src: string): ShopifyImageInput {
  const trimmed = src.trim();

  try {
    const url = new URL(trimmed);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return { src: url.toString() };
    }
  } catch {
    // Fall through to the clearer error below.
  }

  throw new Error(`Invalid product image URL: "${trimmed}". Use an http(s) URL or upload the image first.`);
}

async function imageInput(src: string, index: number): Promise<ShopifyImageInput> {
  const trimmed = src.trim();
  const dataUrlInput = dataUrlImageInput(trimmed, index);
  if (dataUrlInput) return dataUrlInput;

  const filename = localUploadFilename(trimmed);
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return remoteImageInput(trimmed);
  }

  const buffer = await readFile(join(process.cwd(), "public", "uploads", filename));
  return {
    attachment: buffer.toString("base64"),
    filename: basename(filename),
  };
}

async function imageInputs(images: string[] = []) {
  const cleanImages = images.map((src) => src.trim()).filter(Boolean);
  return Promise.all(cleanImages.map(imageInput));
}

/** Convert Shopify product to our Product type */
export function shopifyToProduct(sp: ShopifyProduct): Product {
  const tagMap = parseTags(sp.tags);
  const shortDescription = metafieldValue(sp, METAFIELD_KEYS.shortDescription);
  const shortDescriptionFR = metafieldValue(sp, METAFIELD_KEYS.shortDescriptionFR);
  const descriptionFR = metafieldValue(sp, METAFIELD_KEYS.descriptionFR);
  const detailsCare = metafieldValue(sp, METAFIELD_KEYS.detailsCare);
  const detailsCareFR = metafieldValue(sp, METAFIELD_KEYS.detailsCareFR);
  const returnPolicy = metafieldValue(sp, METAFIELD_KEYS.returnPolicy);
  const returnPolicyFR = metafieldValue(sp, METAFIELD_KEYS.returnPolicyFR);
  const fitNote = metafieldValue(sp, METAFIELD_KEYS.fitNote);
  const fitNoteFR = metafieldValue(sp, METAFIELD_KEYS.fitNoteFR);
  const sizeChart = metafieldValue(sp, METAFIELD_KEYS.sizeChart);
  const sizeChartFR = metafieldValue(sp, METAFIELD_KEYS.sizeChartFR);

  // Parse colors from tags: "color:Black:000000"
  const colors: Color[] = sp.tags
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.startsWith("color:"))
    .map((t) => {
      const [, name, hex] = t.split(":");
      return { name, hex: hex ? `#${hex}` : "#000000" } as Color;
    });

  // Sizes from options
  const sizeOption = sp.options.find((o) => o.name.toLowerCase() === "size");
  const sizes = sizeOption?.values ?? (sp.variants.map((v) => v.option1).filter(Boolean) as string[]);

  // Price logic: Shopify price is the Canada storefront price (CAD).
  const firstVariant = sp.variants[0];
  const shopifyPrice = parseFloat(firstVariant?.price ?? "0");
  const compareAt = firstVariant?.compare_at_price ? parseFloat(firstVariant.compare_at_price) : null;

  // If compare_at_price > price, item is on sale
  const priceCAD = compareAt && compareAt > shopifyPrice ? compareAt : shopifyPrice;
  const salePriceCAD = compareAt && compareAt > shopifyPrice ? shopifyPrice : undefined;
  const price = Math.round((priceCAD / CAD_RATE) * 100) / 100;
  const salePrice = salePriceCAD !== undefined ? Math.round((salePriceCAD / CAD_RATE) * 100) / 100 : undefined;

  // Total inventory across all variants
  const stock = sp.variants.reduce((s, v) => s + (v.inventory_quantity ?? 0), 0);
  const inventoryBySize = sp.variants.reduce<Record<string, number>>((acc, v) => {
    if (v.option1) acc[v.option1] = v.inventory_quantity ?? 0;
    return acc;
  }, {});

  return {
    id: String(sp.id),
    name: sp.title,
    slug: sp.handle,
    description: sp.body_html ? stripHtml(sp.body_html) : "",
    descriptionFR,
    detailsCare,
    detailsCareFR,
    returnPolicy,
    returnPolicyFR,
    fitNote,
    fitNoteFR,
    shortDescription: shortDescription ?? (sp.body_html ? stripHtml(sp.body_html).slice(0, 120) : ""),
    shortDescriptionFR,
    sizeChart,
    sizeChartFR,
    price,
    salePrice,
    priceCAD,
    salePriceCAD,
    images: sp.images.map((i) => i.src),
    category: normalizeCategory(sp.product_type || tagMap["cat"]),
    gender: (tagMap["gender"] as Product["gender"]) || "women",
    sizes: sizes.filter(Boolean),
    colors,
    featured: false,
    isNew: "isNew" in tagMap,
    isBestSeller: "isBestSeller" in tagMap,
    stock,
    inventoryBySize,
    tags: sp.tags.split(",").map((t) => t.trim()).filter((t) => !t.startsWith("color:") && !t.startsWith("gender:") && !t.startsWith("cat:")),
    createdAt: sp.created_at,
  };
}

/** Convert our Product to Shopify product payload */
async function productToShopify(p: Partial<Product> & { name: string; price: number; sizes: string[] }) {
  const cadPrice = p.priceCAD ?? p.price;
  const cadSalePrice = p.salePriceCAD;
  const isOnSale = cadSalePrice !== undefined && cadSalePrice > 0 && cadSalePrice < cadPrice;

  // Each size → one variant
  const variants = (p.sizes ?? ["One Size"]).map((size) => ({
    option1: size,
    price: String(isOnSale ? cadSalePrice! : cadPrice),
    compare_at_price: isOnSale ? String(cadPrice) : null,
    inventory_management: "shopify",
    inventory_quantity: p.inventoryBySize?.[size] ?? 0,
  }));

  const tags = buildTags(
    p.gender ?? "women",
    p.category ?? "dresses",
    p.isNew ?? false,
    p.isBestSeller ?? false,
    p.colors ?? [],
    p.tags?.filter((t) => !["isNew", "isBestSeller"].includes(t)) ?? []
  );

  return {
    title: p.name,
    handle: p.slug,
    body_html: p.description ?? "",
    product_type: p.category ?? "dresses",
    vendor: "Lunelle Story",
    tags,
    status: "active",
    options: [{ name: "Size", values: p.sizes ?? ["One Size"] }],
    variants,
    images: await imageInputs(p.images),
  };
}

// ── API calls ─────────────────────────────────────────────────────────────────

async function shopifyFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...HEADERS, ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Shopify ${res.status}: ${body.slice(0, 300)}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

async function getInventoryLocationId(): Promise<number> {
  if (CONFIGURED_LOCATION_ID && Number.isFinite(CONFIGURED_LOCATION_ID)) {
    return CONFIGURED_LOCATION_ID;
  }

  const locData = await shopifyFetch("/locations.json");
  const locationId: number | undefined = locData.locations?.[0]?.id;
  if (!locationId) throw new Error("No Shopify location found. Set SHOPIFY_LOCATION_ID in your environment.");
  return locationId;
}

async function getProductMetafields(productId: string): Promise<ShopifyMetafield[]> {
  try {
    const data = await shopifyFetch(`/products/${productId}/metafields.json`);
    return data.metafields as ShopifyMetafield[];
  } catch {
    return [];
  }
}

async function productWithMetafields(sp: ShopifyProduct): Promise<ShopifyProduct> {
  const metafields = await getProductMetafields(String(sp.id));
  return { ...sp, metafields };
}

async function upsertProductMetafield(
  productId: string,
  existing: ShopifyMetafield[],
  key: string,
  value: string | undefined,
  type: "single_line_text_field" | "multi_line_text_field"
) {
  const current = existing.find((m) => m.namespace === METAFIELD_NAMESPACE && m.key === key);
  const cleanValue = value?.trim();

  if (!cleanValue) {
    if (current) {
      await shopifyFetch(`/products/${productId}/metafields/${current.id}.json`, { method: "DELETE" });
    }
    return;
  }

  const metafield = {
    namespace: METAFIELD_NAMESPACE,
    key,
    value: cleanValue,
    type,
  };

  if (current) {
    await shopifyFetch(`/metafields/${current.id}.json`, {
      method: "PUT",
      body: JSON.stringify({ metafield: { id: current.id, value: cleanValue, type } }),
    });
  } else {
    await shopifyFetch(`/products/${productId}/metafields.json`, {
      method: "POST",
      body: JSON.stringify({ metafield }),
    });
  }
}

async function syncProductMetafields(productId: string, p: Partial<Product>) {
  const existing = await getProductMetafields(productId);
  await Promise.all([
    upsertProductMetafield(productId, existing, METAFIELD_KEYS.shortDescription, p.shortDescription, "single_line_text_field"),
    upsertProductMetafield(productId, existing, METAFIELD_KEYS.shortDescriptionFR, p.shortDescriptionFR, "single_line_text_field"),
    upsertProductMetafield(productId, existing, METAFIELD_KEYS.descriptionFR, p.descriptionFR, "multi_line_text_field"),
    upsertProductMetafield(productId, existing, METAFIELD_KEYS.detailsCare, p.detailsCare, "multi_line_text_field"),
    upsertProductMetafield(productId, existing, METAFIELD_KEYS.detailsCareFR, p.detailsCareFR, "multi_line_text_field"),
    upsertProductMetafield(productId, existing, METAFIELD_KEYS.returnPolicy, p.returnPolicy, "multi_line_text_field"),
    upsertProductMetafield(productId, existing, METAFIELD_KEYS.returnPolicyFR, p.returnPolicyFR, "multi_line_text_field"),
    upsertProductMetafield(productId, existing, METAFIELD_KEYS.fitNote, p.fitNote, "multi_line_text_field"),
    upsertProductMetafield(productId, existing, METAFIELD_KEYS.fitNoteFR, p.fitNoteFR, "multi_line_text_field"),
    upsertProductMetafield(productId, existing, METAFIELD_KEYS.sizeChart, p.sizeChart, "multi_line_text_field"),
    upsertProductMetafield(productId, existing, METAFIELD_KEYS.sizeChartFR, p.sizeChartFR, "multi_line_text_field"),
  ]);
}

/** List all products (up to 250) */
export async function listShopifyProducts(limit = 50): Promise<Product[]> {
  const data = await shopifyFetch(`/products.json?limit=${limit}&status=active`);
  const products = await Promise.all((data.products as ShopifyProduct[]).map(productWithMetafields));
  return products.map(shopifyToProduct);
}

/** Get single product by Shopify ID */
export async function getShopifyProduct(id: string): Promise<Product> {
  const data = await shopifyFetch(`/products/${id}.json`);
  return shopifyToProduct(await productWithMetafields(data.product as ShopifyProduct));
}

/** Get raw Shopify product (with variants, for inventory editing) */
export async function getRawShopifyProduct(id: string): Promise<ShopifyProduct> {
  const data = await shopifyFetch(`/products/${id}.json`);
  return data.product as ShopifyProduct;
}

/** Create product on Shopify, return our Product type */
export async function createShopifyProduct(p: Omit<Product, "id">): Promise<Product> {
  const payload = await productToShopify(p as Product);
  const data = await shopifyFetch("/products.json", {
    method: "POST",
    body: JSON.stringify({ product: payload }),
  });
  const id = String((data.product as ShopifyProduct).id);
  await syncProductMetafields(id, p);
  return getShopifyProduct(id);
}

/** Update product on Shopify */
export async function updateShopifyProduct(id: string, p: Partial<Product>): Promise<Product> {
  const raw = await getRawShopifyProduct(id);

  // Merge sizes with existing variants
  const sizes = p.sizes ?? raw.options.find((o) => o.name === "Size")?.values ?? [];
  const price = p.priceCAD ?? p.price ?? parseFloat(raw.variants[0]?.price ?? "0");
  const salePrice = p.salePriceCAD;
  const isOnSale = salePrice !== undefined && salePrice > 0 && salePrice < price;

  // Match existing variants by size to preserve IDs
  const updatedVariants = sizes.map((size) => {
    const existing = raw.variants.find((v) => v.option1 === size);
    return {
      ...(existing ? { id: existing.id } : {}),
      option1: size,
      price: String(isOnSale ? salePrice! : price),
      compare_at_price: isOnSale ? String(price) : null,
      inventory_management: "shopify",
      ...(p.inventoryBySize && !existing ? { inventory_quantity: p.inventoryBySize[size] ?? 0 } : {}),
    };
  });

  const tags = buildTags(
    p.gender ?? "women",
    p.category ?? raw.product_type,
    p.isNew ?? false,
    p.isBestSeller ?? false,
    p.colors ?? [],
    []
  );

  const payload: Record<string, unknown> = {
    id: parseInt(id),
    ...(p.name        ? { title: p.name }                   : {}),
    ...(p.slug        ? { handle: p.slug }                  : {}),
    ...(p.description ? { body_html: p.description }        : {}),
    ...(p.category    ? { product_type: p.category }        : {}),
    tags,
    variants: updatedVariants,
    ...(p.images ? { images: await imageInputs(p.images) } : {}),
    ...(sizes.length  ? { options: [{ name: "Size", values: sizes }] } : {}),
  };

  const data = await shopifyFetch(`/products/${id}.json`, {
    method: "PUT",
    body: JSON.stringify({ product: payload }),
  });
  await syncProductMetafields(id, p);
  return getShopifyProduct(String((data.product as ShopifyProduct).id));
}

/** Delete product from Shopify */
export async function deleteShopifyProduct(id: string): Promise<void> {
  await shopifyFetch(`/products/${id}.json`, { method: "DELETE" });
}

/** Update inventory for a specific variant (by size label) */
export async function updateVariantInventory(
  productId: string,
  sizeLabel: string | null,
  newQuantity: number
): Promise<void> {
  const raw = await getRawShopifyProduct(productId);

  // Find matching variant(s) — if sizeLabel is null, update all
  const targets = sizeLabel
    ? raw.variants.filter((v) => v.option1 === sizeLabel)
    : raw.variants;

  if (targets.length === 0) throw new Error(`No variant found for size "${sizeLabel}"`);

  const locationId = await getInventoryLocationId();

  // Set inventory level for each matching variant
  await Promise.all(
    targets.map((v) =>
      shopifyFetch("/inventory_levels/set.json", {
        method: "POST",
        body: JSON.stringify({
          location_id: locationId,
          inventory_item_id: v.inventory_item_id,
          available: newQuantity,
        }),
      })
    )
  );
}

/** Update inventory for multiple size variants */
export async function updateVariantInventories(
  productId: string,
  inventoryBySize: Record<string, number>
): Promise<void> {
  await Promise.all(
    Object.entries(inventoryBySize).map(([size, quantity]) =>
      updateVariantInventory(productId, size, quantity)
    )
  );
}

/** Update total stock across all variants (distributes evenly) */
export async function updateTotalStock(productId: string, totalStock: number): Promise<void> {
  const raw = await getRawShopifyProduct(productId);
  const perVariant = Math.floor(totalStock / Math.max(1, raw.variants.length));
  const remainder  = totalStock % Math.max(1, raw.variants.length);

  const locationId = await getInventoryLocationId();

  await Promise.all(
    raw.variants.map((v, i) =>
      shopifyFetch("/inventory_levels/set.json", {
        method: "POST",
        body: JSON.stringify({
          location_id: locationId,
          inventory_item_id: v.inventory_item_id,
          available: perVariant + (i === 0 ? remainder : 0),
        }),
      })
    )
  );
}
