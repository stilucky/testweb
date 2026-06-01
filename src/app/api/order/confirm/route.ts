import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import type { OrderItem, PaymentMethod } from "@/store/orderStore";

interface ConfirmPayload {
  orderId: string;
  customer: string;
  email: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  shippingAddress: string;
  shippingMethod: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
}

function fmt(n: number) {
  return `$${n.toFixed(2)}`;
}

function paymentLabel(method: PaymentMethod) {
  if (method === "card") return "Credit / Debit Card";
  if (method === "paypal") return "PayPal";
  return "Bank Transfer";
}

function buildOrderEmail(p: ConfirmPayload): string {
  const shopUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const itemRows = p.items
    .map(
      (item) => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #f0ede8;vertical-align:top;">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            ${
              item.image
                ? `<td width="64" style="vertical-align:top;padding-right:14px;">
                    <img src="${item.image}" width="64" height="80" alt="${item.name}"
                      style="object-fit:cover;display:block;background:#f5f5f0;" />
                  </td>`
                : ""
            }
            <td style="vertical-align:top;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#1c1917;">${item.name}</p>
              <p style="margin:0 0 2px;font-size:11px;color:#a8a29e;">
                Size: ${item.size}&nbsp;&nbsp;·&nbsp;&nbsp;Color: ${item.color}
              </p>
              <p style="margin:4px 0 0;font-size:12px;color:#57534e;">
                ${fmt(item.price)} × ${item.qty}
              </p>
            </td>
            <td style="vertical-align:top;text-align:right;white-space:nowrap;">
              <p style="margin:0;font-size:13px;color:#1c1917;font-weight:500;">
                ${fmt(item.price * item.qty)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
    )
    .join("");

  const discountRow =
    p.discount > 0
      ? `<tr>
          <td style="padding:5px 0;font-size:12px;color:#78716c;">
            Discount${p.couponCode ? ` (${p.couponCode})` : ""}
          </td>
          <td style="padding:5px 0;font-size:12px;color:#16a34a;text-align:right;">
            −${fmt(p.discount)}
          </td>
        </tr>`
      : "";

  const freeShipping = p.shippingCost === 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmed — ${p.orderId}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:40px 0;">
  <tr>
    <td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:580px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#1c1917;padding:36px 48px;text-align:center;">
            <p style="margin:0 0 6px;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#78716c;">
              Lunelle
            </p>
            <h1 style="margin:0;font-size:26px;font-weight:300;letter-spacing:4px;text-transform:uppercase;color:#ffffff;">
              Order Confirmed
            </h1>
          </td>
        </tr>

        <!-- Thank you -->
        <tr>
          <td style="padding:40px 48px 32px;border-bottom:1px solid #f0ede8;">
            <p style="margin:0 0 10px;font-size:16px;color:#1c1917;">
              Thank you, ${p.customer.split(" ")[0]}!
            </p>
            <p style="margin:0;font-size:13px;color:#78716c;line-height:1.7;">
              Your order has been received and is being processed.
              We will notify you once it ships.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin-top:20px;background:#fafaf9;border:1px solid #f0ede8;padding:14px 20px;width:100%;">
              <tr>
                <td style="font-size:11px;color:#a8a29e;letter-spacing:2px;text-transform:uppercase;">
                  Order number
                </td>
                <td style="text-align:right;font-size:14px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:2px;color:#1c1917;">
                  ${p.orderId}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Items -->
        <tr>
          <td style="padding:32px 48px;border-bottom:1px solid #f0ede8;">
            <p style="margin:0 0 18px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#a8a29e;">
              Order Summary
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${itemRows}
            </table>
          </td>
        </tr>

        <!-- Totals -->
        <tr>
          <td style="padding:24px 48px;border-bottom:1px solid #f0ede8;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:5px 0;font-size:12px;color:#78716c;">Subtotal</td>
                <td style="padding:5px 0;font-size:12px;color:#57534e;text-align:right;">${fmt(p.subtotal)}</td>
              </tr>
              ${discountRow}
              <tr>
                <td style="padding:5px 0;font-size:12px;color:#78716c;">
                  Shipping — ${p.shippingMethod}
                </td>
                <td style="padding:5px 0;font-size:12px;color:#57534e;text-align:right;">
                  ${freeShipping ? '<span style="color:#16a34a;">Free</span>' : fmt(p.shippingCost)}
                </td>
              </tr>
              <tr>
                <td style="padding:14px 0 5px;border-top:1px solid #f0ede8;font-size:14px;font-weight:600;color:#1c1917;">
                  Total
                </td>
                <td style="padding:14px 0 5px;border-top:1px solid #f0ede8;font-size:14px;font-weight:600;color:#1c1917;text-align:right;">
                  ${fmt(p.total)}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Shipping + Payment info -->
        <tr>
          <td style="padding:28px 48px;border-bottom:1px solid #f0ede8;background:#fafaf9;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" style="vertical-align:top;padding-right:16px;">
                  <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#a8a29e;">
                    Ship to
                  </p>
                  <p style="margin:0;font-size:12px;color:#57534e;line-height:1.7;">
                    ${p.shippingAddress.replace(/,\s*/g, "<br/>")}
                  </p>
                </td>
                <td width="50%" style="vertical-align:top;padding-left:16px;border-left:1px solid #f0ede8;">
                  <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#a8a29e;">
                    Payment
                  </p>
                  <p style="margin:0;font-size:12px;color:#57534e;">${paymentLabel(p.paymentMethod)}</p>
                  <p style="margin:8px 0 0;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#a8a29e;">
                    Delivery
                  </p>
                  <p style="margin:4px 0 0;font-size:12px;color:#57534e;">${p.shippingMethod}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:36px 48px;text-align:center;border-bottom:1px solid #f0ede8;">
            <a href="${shopUrl}/account"
              style="display:inline-block;background:#1c1917;color:#ffffff;text-decoration:none;font-size:10px;letter-spacing:4px;text-transform:uppercase;padding:15px 36px;">
              Track Your Order
            </a>
            <p style="margin:20px 0 0;font-size:11px;color:#a8a29e;line-height:1.6;">
              Questions? Reply to this email or visit our
              <a href="${shopUrl}/contact" style="color:#78716c;">Help Centre</a>.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1c1917;padding:28px 48px;text-align:center;">
            <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#57534e;">
              Lunelle
            </p>
            <p style="margin:0;font-size:11px;color:#44403c;line-height:1.6;">
              © ${new Date().getFullYear()} Lunelle. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const payload: ConfirmPayload = await req.json();
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.warn("SMTP not configured — skipping order confirmation for", payload.email);
      return NextResponse.json({ sent: false, reason: "smtp_not_configured" });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 587),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"Lunelle" <${SMTP_USER}>`,
      to: payload.email,
      subject: `Order confirmed — ${payload.orderId}`,
      html: buildOrderEmail(payload),
    });

    return NextResponse.json({ sent: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    console.error("Order confirm email error:", message);
    return NextResponse.json({ sent: false, reason: message });
  }
}
