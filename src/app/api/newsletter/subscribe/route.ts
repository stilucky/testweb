import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

function buildEmailHtml(couponCode: string, expiresAt: string): string {
  const expireDate = new Date(expiresAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const shopUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to TeBoutique</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1c1917;padding:40px 48px;text-align:center;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#78716c;">
                Welcome to
              </p>
              <h1 style="margin:0;font-size:28px;font-weight:300;letter-spacing:6px;text-transform:uppercase;color:#ffffff;">
                TeBoutique
              </h1>
            </td>
          </tr>

          <!-- Hero message -->
          <tr>
            <td style="padding:48px 48px 32px;text-align:center;border-bottom:1px solid #f0ede8;">
              <p style="margin:0 0 16px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#a8a29e;">
                Your exclusive welcome gift
              </p>
              <h2 style="margin:0 0 16px;font-size:32px;font-weight:300;color:#1c1917;line-height:1.3;">
                10% Off<br/>Your First Order
              </h2>
              <p style="margin:0;font-size:14px;color:#78716c;line-height:1.7;">
                Thank you for joining us. As a welcome gift, here is your personal discount code — valid for one month.
              </p>
            </td>
          </tr>

          <!-- Coupon box -->
          <tr>
            <td style="padding:40px 48px;text-align:center;">
              <p style="margin:0 0 16px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#a8a29e;">
                Your promo code
              </p>
              <div style="display:inline-block;border:1.5px dashed #d6d3d1;padding:18px 40px;background:#fafaf9;">
                <p style="margin:0;font-size:26px;font-weight:600;letter-spacing:8px;color:#1c1917;font-family:Courier New,monospace;">
                  ${couponCode}
                </p>
              </div>
              <p style="margin:16px 0 0;font-size:12px;color:#a8a29e;letter-spacing:0.5px;">
                Single use &nbsp;·&nbsp; Expires ${expireDate}
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 48px 48px;text-align:center;">
              <a href="${shopUrl}/products"
                style="display:inline-block;background:#1c1917;color:#ffffff;text-decoration:none;font-size:10px;letter-spacing:4px;text-transform:uppercase;padding:16px 40px;">
                Shop Now
              </a>
              <p style="margin:24px 0 0;font-size:11px;color:#a8a29e;line-height:1.7;">
                Apply <strong style="color:#57534e;">${couponCode}</strong> at checkout.<br/>
                Valid on all full-price items. Cannot be combined with other offers.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="background:#fafaf9;padding:32px 48px;text-align:center;border-top:1px solid #f0ede8;">
              <p style="margin:0 0 12px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#a8a29e;">
                Complimentary benefits
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:center;padding:0 8px;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#1c1917;">Free Shipping</p>
                    <p style="margin:0;font-size:11px;color:#a8a29e;">On orders over $200</p>
                  </td>
                  <td style="text-align:center;padding:0 8px;border-left:1px solid #e7e5e4;border-right:1px solid #e7e5e4;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#1c1917;">Free Returns</p>
                    <p style="margin:0;font-size:11px;color:#a8a29e;">Within 30 days</p>
                  </td>
                  <td style="text-align:center;padding:0 8px;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#1c1917;">Authenticity</p>
                    <p style="margin:0;font-size:11px;color:#a8a29e;">Guaranteed</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1c1917;padding:28px 48px;text-align:center;">
              <p style="margin:0 0 8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#57534e;">
                TeBoutique
              </p>
              <p style="margin:0;font-size:11px;color:#44403c;line-height:1.6;">
                You are receiving this email because you subscribed to our newsletter.<br/>
                © ${new Date().getFullYear()} TeBoutique. All rights reserved.
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
    const { email, couponCode, expiresAt } = await req.json();

    if (!email || !couponCode || !expiresAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      // Email not configured — still return success so the UI flow is not blocked
      console.warn("SMTP not configured — skipping welcome email for", email);
      return NextResponse.json({ sent: false, reason: "smtp_not_configured" });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 587),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"TeBoutique" <${SMTP_USER}>`,
      to: email,
      subject: `Your welcome gift: ${couponCode} — 10% off your first order`,
      html: buildEmailHtml(couponCode, expiresAt),
    });

    return NextResponse.json({ sent: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    console.error("Newsletter email error:", message);
    // Return 200 so the UI is not blocked — email is non-critical
    return NextResponse.json({ sent: false, reason: message });
  }
}
