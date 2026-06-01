import { NextRequest, NextResponse } from "next/server";
import { updateTotalStock, updateVariantInventory } from "@/lib/shopify-admin";

type Params = { params: Promise<{ id: string }> };

/**
 * PUT /api/shopify/products/[id]/inventory
 * Body: { stock: number }              → update total stock (distributed across variants)
 *   or: { size: string, stock: number } → update specific size variant
 */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body: { stock: number; size?: string } = await req.json();

    if (typeof body.stock !== "number") {
      return NextResponse.json({ error: "stock (number) is required" }, { status: 400 });
    }

    if (body.size) {
      await updateVariantInventory(id, body.size, body.stock);
    } else {
      await updateTotalStock(id, body.stock);
    }

    return NextResponse.json({ success: true, stock: body.stock });
  } catch (err) {
    console.error("[PUT /api/shopify/products/[id]/inventory]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
