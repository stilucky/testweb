import { NextRequest, NextResponse } from "next/server";
import { updateTotalStock, updateVariantInventories, updateVariantInventory } from "@/lib/shopify-admin";

type Params = { params: Promise<{ id: string }> };

function isLocationScopeError(err: unknown) {
  return String(err).includes("read_locations scope");
}

/**
 * PUT /api/shopify/products/[id]/inventory
 * Body: { stock: number }              → update total stock (distributed across variants)
 *   or: { size: string, stock: number } → update specific size variant
 */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body: { stock?: number; size?: string; inventoryBySize?: Record<string, number> } = await req.json();

    if (body.inventoryBySize) {
      await updateVariantInventories(id, body.inventoryBySize);
      const stock = Object.values(body.inventoryBySize).reduce((sum, qty) => sum + qty, 0);
      return NextResponse.json({ success: true, stock, inventoryBySize: body.inventoryBySize });
    }

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
    if (isLocationScopeError(err)) {
      return NextResponse.json(
        {
          success: false,
          warning:
            "Product saved, but inventory was not synced because Shopify requires read_locations scope or SHOPIFY_LOCATION_ID.",
        },
        { status: 202 }
      );
    }
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
