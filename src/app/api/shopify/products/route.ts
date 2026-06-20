import { NextRequest, NextResponse } from "next/server";
import { listShopifyProducts, createShopifyProduct } from "@/lib/shopify-admin";
import { unlink } from "fs/promises";
import { join } from "path";

async function deleteLocalUploads(imageUrls: string[]) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  if (!appUrl) return;
  const prefix = `${appUrl}/uploads/`;
  const temps = imageUrls.filter((u) => typeof u === "string" && u.startsWith(prefix));
  await Promise.allSettled(
    temps.map((url) => {
      const filename = url.slice(prefix.length);
      if (!filename || filename.includes("..") || filename.includes("/")) return Promise.resolve();
      return unlink(join(process.cwd(), "public", "uploads", filename)).catch(() => {});
    })
  );
}

export async function GET(req: NextRequest) {
  try {
    const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "50");
    const products = await listShopifyProducts(limit);
    return NextResponse.json({ products });
  } catch (err) {
    console.error("[GET /api/shopify/products]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sentImages: string[] = body.images ?? [];
    const product = await createShopifyProduct(body);
    // Shopify has now hosted the images on its CDN — delete local temp files
    await deleteLocalUploads(sentImages);
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/shopify/products]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
