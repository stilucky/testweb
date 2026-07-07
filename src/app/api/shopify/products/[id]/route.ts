import { NextRequest, NextResponse } from "next/server";
import {
  getShopifyProduct,
  updateShopifyProduct,
  deleteShopifyProduct,
} from "@/lib/shopify-admin";

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
    const product = await updateShopifyProduct(id, body);
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
