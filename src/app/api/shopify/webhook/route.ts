import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Verify the request is genuinely from Shopify
function verifyWebhook(body: string, hmacHeader: string | null): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) return true; // allow through if secret not configured yet

  if (!hmacHeader) return false;
  const hash = crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmacHeader));
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const hmac = req.headers.get("x-shopify-hmac-sha256");
  const topic = req.headers.get("x-shopify-topic");

  if (!verifyWebhook(rawBody, hmac)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // orders/paid — Shopify confirms payment received
  if (topic === "orders/paid") {
    const shopifyOrderId = payload.id;
    const tags = String(payload.tags ?? "");

    // Extract our local order ID from the tags (set during draft order creation)
    const match = tags.match(/local-order-([A-Z0-9-]+)/);
    const localOrderId = match?.[1];

    // TODO: When a database is connected, find the local order by localOrderId
    // and update its payment status to "paid" and status to "confirmed".
    // For now we log the event — the order is already recorded locally in the
    // browser before the customer was redirected to Shopify.
    console.log("[Shopify webhook] orders/paid", {
      shopifyOrderId,
      localOrderId,
      email: payload.email,
      total: payload.total_price,
    });
  }

  // orders/fulfilled — Shopify marks order as shipped
  if (topic === "orders/fulfilled") {
    const tags = String(payload.tags ?? "");
    const match = tags.match(/local-order-([A-Z0-9-]+)/);
    const localOrderId = match?.[1];

    console.log("[Shopify webhook] orders/fulfilled", {
      shopifyOrderId: payload.id,
      localOrderId,
      trackingNumber: (payload.fulfillments as Array<{ tracking_number?: string }>)?.[0]?.tracking_number,
    });
  }

  return NextResponse.json({ received: true });
}
