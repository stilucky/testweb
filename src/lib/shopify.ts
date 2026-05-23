export interface ShopifyLineItem {
  title: string;
  price: string;
  quantity: number;
  sku?: string;
  grams?: number;
  requires_shipping?: boolean;
  properties?: { name: string; value: string }[];
}

export interface ShopifyAddress {
  first_name: string;
  last_name: string;
  address1: string;
  city: string;
  zip: string;
  country: string;
  phone?: string;
}

export interface CreateDraftOrderPayload {
  email: string;
  lineItems: ShopifyLineItem[];
  shippingAddress: ShopifyAddress;
  note?: string;
  tags?: string;
  discountCode?: string;
  discountAmount?: number;
}

export interface DraftOrderResult {
  id: number;
  name: string;              // e.g. "#D123"
  invoice_url: string;       // Shopify hosted payment page
  status: string;
}

export async function createShopifyDraftOrder(
  payload: CreateDraftOrderPayload
): Promise<DraftOrderResult> {
  const domain = process.env.SHOPIFY_SHOP_DOMAIN;
  const token  = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!domain || !token) {
    throw new Error("Shopify is not configured. Add SHOPIFY_SHOP_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN to .env.local");
  }

  const body: Record<string, unknown> = {
    draft_order: {
      email: payload.email,
      line_items: payload.lineItems,
      shipping_address: payload.shippingAddress,
      note: payload.note ?? "",
      tags: payload.tags ?? "teboutique-web",
      use_customer_default_address: false,
      ...(payload.discountAmount && payload.discountAmount > 0
        ? {
            applied_discount: {
              title: payload.discountCode ?? "Coupon",
              value_type: "fixed_amount",
              value: String(payload.discountAmount),
              amount: String(payload.discountAmount),
            },
          }
        : {}),
    },
  };

  const res = await fetch(
    `https://${domain}/admin/api/2024-01/draft_orders.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Shopify API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.draft_order as DraftOrderResult;
}
