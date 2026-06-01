import { NextRequest, NextResponse } from "next/server";
import { createShopifyDraftOrder } from "@/lib/shopify";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, info, selectedShipping, discountAmount, appliedCoupon, localOrderId } = body;

    const shippingLabels: Record<string, string> = {
      standard: "Standard Shipping (5–7 business days)",
      express: "Express Shipping (2–3 business days)",
      overnight: "Overnight (Next business day)",
    };

    const lineItems = items.map((item: {
      product: { name: string; salePrice?: number; price: number };
      selectedSize: string;
      selectedColor: string;
      quantity: number;
    }) => ({
      title: `${item.product.name} — ${item.selectedSize} / ${item.selectedColor}`,
      price: String(item.product.salePrice ?? item.product.price),
      quantity: item.quantity,
      requires_shipping: true,
      grams: 500,
    }));

    const result = await createShopifyDraftOrder({
      email: info.email,
      lineItems,
      shippingAddress: {
        first_name: info.firstName,
        last_name: info.lastName,
        address1: info.address,
        city: info.city,
        province: info.province || undefined,
        zip: info.postal,
        country: info.country,
        phone: info.phone || undefined,
      },
      note: `Lunelle order #${localOrderId} — ${shippingLabels[selectedShipping] ?? "Standard Shipping"}`,
      tags: `Lunelle-web,local-order-${localOrderId}`,
      discountCode: appliedCoupon?.code,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
    });

    return NextResponse.json({
      invoiceUrl: result.invoice_url,
      draftOrderId: result.id,
      draftOrderName: result.name,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Shopify checkout failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
