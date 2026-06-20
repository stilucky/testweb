import { NextRequest, NextResponse } from "next/server";

export interface DraftOrderStatus {
  id: number;
  name: string;
  status: "open" | "invoice_sent" | "completed";
  financial_status?: string;
  fulfillment_status?: string | null;
  email: string;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  invoice_url?: string;
  note?: string;
  tags?: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const domain = process.env.SHOPIFY_SHOP_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!domain || !token) {
    return NextResponse.json({ error: "Shopify not configured" }, { status: 503 });
  }

  const { id } = params;
  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Invalid draft order ID" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://${domain}/admin/api/2024-01/draft_orders/${id}.json`,
      { headers: { "X-Shopify-Access-Token": token }, next: { revalidate: 60 } }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Shopify returned ${res.status}: ${text}` },
        { status: res.status }
      );
    }

    const json = await res.json();
    const d = json.draft_order as DraftOrderStatus;

    return NextResponse.json({
      id: d.id,
      name: d.name,
      status: d.status,
      financial_status: d.financial_status ?? null,
      fulfillment_status: d.fulfillment_status ?? null,
      email: d.email,
      created_at: d.created_at,
      updated_at: d.updated_at,
      completed_at: d.completed_at ?? null,
      invoice_url: d.invoice_url ?? null,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch Shopify order";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
