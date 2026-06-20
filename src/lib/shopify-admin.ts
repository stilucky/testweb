/**
 * Shopify Admin REST API — product & inventory operations.
 * All functions are server-side only (use in API routes / Server Components).
 */

import { Product, Color } from "@/types";

const DOMAIN  = process.env.SHOPIFY_SHOP_DOMAIN!;
const TOKEN   = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!;
const API_VER = "2024-01";
const BASE    = `https://${DOMAIN}/admin/api/${API_VER}`;
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
interface ShopifyOption { id: number; name: string; values: string[] }

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

/** Convert Shopify product to our Product type */
export function shopifyToProduct(sp: ShopifyProduct): Product {
  const tagMap = parseTags(sp.tags);

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

  // Price logic: Shopify price = what customer pays, compare_at = original
  const firstVariant = sp.variants[0];
  const shopifyPrice = parseFloat(firstVariant?.price ?? "0");
  const compareAt = firstVariant?.compare_at_price ? parseFloat(firstVariant.compare_at_price) : null;

  // If compare_at_price > price, item is on sale
  const price    = compareAt && compareAt > shopifyPrice ? compareAt : shopifyPrice;
  const salePrice = compareAt && compareAt > shopifyPrice ? shopifyPrice : undefined;

  // Total inventory across all variants
  const stock = sp.variants.reduce((s, v) => s + (v.inventory_quantity ?? 0), 0);

  return {
    id: String(sp.id),
    name: sp.title,
    slug: sp.handle,
    description: sp.body_html ? stripHtml(sp.body_html) : "",
    shortDescription: sp.body_html ? stripHtml(sp.body_html).slice(0, 120) : "",
    price,
    salePrice,
    images: sp.images.map((i) => i.src),
    category: sp.product_type || tagMap["cat"] || "dresses",
    gender: (tagMap["gender"] as Product["gender"]) || "women",
    sizes: sizes.filter(Boolean),
    colors,
    featured: false,
    isNew: "isNew" in tagMap,
    isBestSeller: "isBestSeller" in tagMap,
    stock,
    tags: sp.tags.split(",").map((t) => t.trim()).filter((t) => !t.startsWith("color:") && !t.startsWith("gender:") && !t.startsWith("cat:")),
    createdAt: sp.created_at,
  };
}

/** Convert our Product to Shopify product payload */
function productToShopify(p: Partial<Product> & { name: string; price: number; sizes: string[] }) {
  const isOnSale = p.salePrice !== undefined && p.salePrice > 0 && p.salePrice < p.price;

  // Each size → one variant
  const variants = (p.sizes ?? ["One Size"]).map((size) => ({
    option1: size,
    price: String(isOnSale ? p.salePrice! : p.price),
    compare_at_price: isOnSale ? String(p.price) : null,
    inventory_management: "shopify",
    inventory_quantity: Math.round((p.stock ?? 0) / Math.max(1, p.sizes?.length ?? 1)),
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
    images: (p.images ?? []).map((src) => ({ src })),
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
  return res.json();
}

/** List all products (up to 250) */
export async function listShopifyProducts(limit = 50): Promise<Product[]> {
  const data = await shopifyFetch(`/products.json?limit=${limit}&status=active`);
  return (data.products as ShopifyProduct[]).map(shopifyToProduct);
}

/** Get single product by Shopify ID */
export async function getShopifyProduct(id: string): Promise<Product> {
  const data = await shopifyFetch(`/products/${id}.json`);
  return shopifyToProduct(data.product as ShopifyProduct);
}

/** Get raw Shopify product (with variants, for inventory editing) */
export async function getRawShopifyProduct(id: string): Promise<ShopifyProduct> {
  const data = await shopifyFetch(`/products/${id}.json`);
  return data.product as ShopifyProduct;
}

/** Create product on Shopify, return our Product type */
export async function createShopifyProduct(p: Omit<Product, "id">): Promise<Product> {
  const payload = productToShopify(p as Product);
  const data = await shopifyFetch("/products.json", {
    method: "POST",
    body: JSON.stringify({ product: payload }),
  });
  return shopifyToProduct(data.product as ShopifyProduct);
}

/** Update product on Shopify */
export async function updateShopifyProduct(id: string, p: Partial<Product>): Promise<Product> {
  const raw = await getRawShopifyProduct(id);

  // Merge sizes with existing variants
  const sizes = p.sizes ?? raw.options.find((o) => o.name === "Size")?.values ?? [];
  const isOnSale = p.salePrice !== undefined && p.salePrice! > 0 && p.salePrice! < (p.price ?? parseFloat(raw.variants[0]?.price ?? "0"));
  const price    = p.price ?? parseFloat(raw.variants[0]?.price ?? "0");
  const salePrice = p.salePrice;

  // Match existing variants by size to preserve IDs
  const updatedVariants = sizes.map((size) => {
    const existing = raw.variants.find((v) => v.option1 === size);
    return {
      ...(existing ? { id: existing.id } : {}),
      option1: size,
      price: String(isOnSale ? salePrice! : price),
      compare_at_price: isOnSale ? String(price) : null,
      inventory_management: "shopify",
      // Only update stock if explicitly provided
      ...(p.stock !== undefined && !existing ? { inventory_quantity: Math.round(p.stock / Math.max(1, sizes.length)) } : {}),
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
    ...(p.images ? { images: p.images.map((src) => ({ src })) } : {}),
    ...(sizes.length  ? { options: [{ name: "Size", values: sizes }] } : {}),
  };

  const data = await shopifyFetch(`/products/${id}.json`, {
    method: "PUT",
    body: JSON.stringify({ product: payload }),
  });
  return shopifyToProduct(data.product as ShopifyProduct);
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

  // Get store's primary location
  const locData = await shopifyFetch("/locations.json");
  const locationId: number = locData.locations?.[0]?.id;
  if (!locationId) throw new Error("No location found");

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

/** Update total stock across all variants (distributes evenly) */
export async function updateTotalStock(productId: string, totalStock: number): Promise<void> {
  const raw = await getRawShopifyProduct(productId);
  const perVariant = Math.floor(totalStock / Math.max(1, raw.variants.length));
  const remainder  = totalStock % Math.max(1, raw.variants.length);

  const locData = await shopifyFetch("/locations.json");
  const locationId: number = locData.locations?.[0]?.id;
  if (!locationId) throw new Error("No location found");

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
