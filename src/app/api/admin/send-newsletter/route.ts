import { NextRequest, NextResponse } from "next/server";
import {
  sendProductAnnouncementEmail,
  sendCustomNewsletterEmail,
} from "@/lib/email";

interface ProductPayload {
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  image: string;
  shortDescription?: string;
  currency?: string;
}

interface RequestBody {
  emails: string[];
  subject: string;
  type: "new_product" | "custom";
  product?: ProductPayload;
  customHtml?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { emails, subject, type, product, customHtml } = body;

    if (!emails || emails.length === 0) {
      return NextResponse.json({ error: "No recipients provided" }, { status: 400 });
    }
    if (!subject) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }
    if (type === "new_product" && !product) {
      return NextResponse.json({ error: "Product data required for new_product type" }, { status: 400 });
    }
    if (type === "custom" && !customHtml) {
      return NextResponse.json({ error: "customHtml required for custom type" }, { status: 400 });
    }

    let successCount = 0;
    const errors: string[] = [];

    // Send in batches to avoid overwhelming SMTP
    const batchSize = 10;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map(async (email) => {
          try {
            if (type === "new_product" && product) {
              await sendProductAnnouncementEmail({
                to: email,
                productName: product.name,
                productSlug: product.slug,
                productImage: product.image,
                price: product.price,
                salePrice: product.salePrice,
                shortDescription: product.shortDescription,
                currency: product.currency,
              });
            } else if (type === "custom" && customHtml) {
              await sendCustomNewsletterEmail({ to: email, subject, bodyHtml: customHtml });
            }
            successCount++;
          } catch (err) {
            errors.push(`${email}: ${err instanceof Error ? err.message : String(err)}`);
          }
        })
      );
    }

    const status =
      successCount === emails.length
        ? "sent"
        : successCount === 0
          ? "failed"
          : "partial";

    return NextResponse.json({
      ok: true,
      status,
      recipientCount: emails.length,
      successCount,
      failCount: emails.length - successCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: detail }, { status: 500 });
  }
}
