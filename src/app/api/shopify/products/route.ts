import { NextRequest, NextResponse } from "next/server";
import { listShopifyProducts, createShopifyProduct } from "@/lib/shopify-admin";

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
    const product = await createShopifyProduct(body);
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/shopify/products]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
