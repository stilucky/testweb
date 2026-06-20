import { NextRequest, NextResponse } from "next/server";
import {
  getShopifyProduct,
  updateShopifyProduct,
  deleteShopifyProduct,
} from "@/lib/shopify-admin";
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

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const product = await getShopifyProduct(id);
    return NextResponse.json({ product });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const sentImages: string[] = body.images ?? [];
    const product = await updateShopifyProduct(id, body);
    // Shopify has now hosted the images on its CDN — delete local temp files
    await deleteLocalUploads(sentImages);
    return NextResponse.json({ product });
  } catch (err) {
    console.error("[PUT /api/shopify/products/[id]]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await deleteShopifyProduct(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
