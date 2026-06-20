import nodemailer from "nodemailer";

const smtpPort = Number(process.env.SMTP_PORT ?? 587);
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function emailTemplate(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:Georgia,serif;">
  <div style="max-width:480px;margin:40px auto;background:#fff;border:1px solid #e7e5e4;">
    <!-- Header -->
    <div style="padding:32px 40px;border-bottom:1px solid #e7e5e4;text-align:center;">
      <h1 style="margin:0;font-size:22px;font-weight:300;letter-spacing:0.2em;text-transform:uppercase;color:#1c1917;">
        Lunelle
      </h1>
    </div>
    <!-- Body -->
    <div style="padding:40px;">
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:300;color:#1c1917;">${title}</h2>
      ${bodyHtml}
    </div>
    <!-- Footer -->
    <div style="padding:20px 40px;border-top:1px solid #e7e5e4;text-align:center;background:#fafaf9;">
      <p style="margin:0;font-size:11px;color:#a8a29e;letter-spacing:0.1em;text-transform:uppercase;">
        © ${new Date().getFullYear()} Lunelle · All rights reserved
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendOTPEmail({
  to,
  otp,
  purpose,
  name,
}: {
  to: string;
  otp: string;
  purpose: "verify" | "reset";
  name?: string;
}): Promise<void> {
  const isVerify = purpose === "verify";

  const subject = isVerify
    ? "Verify your Lunelle account"
    : "Reset your Lunelle password";

  const greeting = name ? `Hi ${name},` : "Hello,";

  const bodyHtml = `
    <p style="margin:0 0 24px;color:#78716c;font-size:14px;line-height:1.7;">
      ${greeting}<br><br>
      ${
        isVerify
          ? "Thank you for creating an account with Lunelle. Please use the verification code below to activate your account."
          : "We received a request to reset the password for your Lunelle account. Use the code below to proceed."
      }
    </p>
    <!-- OTP Box -->
    <div style="background:#f5f5f4;border:1px solid #e7e5e4;text-align:center;padding:32px;margin-bottom:28px;">
      <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#a8a29e;">
        ${isVerify ? "Verification Code" : "Reset Code"}
      </p>
      <p style="margin:0;font-size:44px;font-weight:300;letter-spacing:0.4em;color:#1c1917;font-family:Courier,monospace;">
        ${otp}
      </p>
      <p style="margin:12px 0 0;font-size:12px;color:#a8a29e;">
        Valid for <strong>10 minutes</strong>
      </p>
    </div>
    <p style="margin:0;color:#a8a29e;font-size:12px;line-height:1.7;">
      If you did not request this, please ignore this email.
      Your account will remain secure.
    </p>
  `;

  await transporter.sendMail({
    from: `"Lunelle" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: emailTemplate(subject, bodyHtml),
  });
}

export async function sendMultiProductAnnouncementEmail({
  to,
  subject,
  products,
}: {
  to: string;
  subject: string;
  products: Array<{
    name: string;
    slug: string;
    price: number;
    salePrice?: number;
    image: string;
    shortDescription?: string;
    currency?: string;
  }>;
}): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://lunellestory.ca";

  const productCards = products
    .map((p) => {
      const currency = p.currency ?? "CAD";
      const displayPrice = p.salePrice ?? p.price;
      const productUrl = `${appUrl}/products/${p.slug}`;

      return `
      <div style="border:1px solid #e7e5e4;margin-bottom:16px;overflow:hidden;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            ${p.image
              ? `<td width="120" valign="top" style="padding:0;">
                   <a href="${productUrl}">
                     <img src="${p.image}" alt="${p.name}"
                          width="120" height="140"
                          style="display:block;width:120px;height:140px;object-fit:cover;" />
                   </a>
                 </td>`
              : `<td width="120" valign="top" style="padding:0;background:#f5f5f4;width:120px;height:140px;text-align:center;">
                   <span style="font-size:10px;color:#a8a29e;letter-spacing:0.2em;text-transform:uppercase;line-height:140px;display:block;">Lunelle</span>
                 </td>`
            }
            <td valign="top" style="padding:20px 20px 20px 16px;">
              <p style="margin:0 0 4px;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#a8a29e;">New Arrival</p>
              <a href="${productUrl}" style="text-decoration:none;">
                <h3 style="margin:0 0 8px;font-size:16px;font-weight:300;color:#1c1917;font-family:Georgia,serif;">${p.name}</h3>
              </a>
              ${p.shortDescription ? `<p style="margin:0 0 12px;font-size:12px;color:#78716c;line-height:1.5;">${p.shortDescription.slice(0, 80)}${p.shortDescription.length > 80 ? "…" : ""}</p>` : ""}
              <p style="margin:0 0 14px;">
                ${p.salePrice
                  ? `<span style="text-decoration:line-through;color:#a8a29e;font-size:12px;">${currency} $${p.price.toFixed(2)}</span>&nbsp;<span style="color:#1c1917;font-size:15px;font-weight:400;">${currency} $${displayPrice.toFixed(2)}</span>`
                  : `<span style="color:#1c1917;font-size:15px;font-weight:400;">${currency} $${displayPrice.toFixed(2)}</span>`
                }
              </p>
              <a href="${productUrl}"
                 style="display:inline-block;padding:8px 18px;background:#1c1917;color:#fff;text-decoration:none;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;">
                Shop Now
              </a>
            </td>
          </tr>
        </table>
      </div>`;
    })
    .join("");

  const bodyHtml = `
    <p style="margin:0 0 24px;color:#78716c;font-size:14px;line-height:1.7;">
      Discover our latest arrivals — each piece crafted for those who appreciate refined simplicity.
    </p>

    ${productCards}

    <div style="text-align:center;margin:28px 0;">
      <a href="${appUrl}/products?filter=new"
         style="display:inline-block;padding:14px 40px;background:#1c1917;color:#fff;text-decoration:none;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;">
        Shop All New Arrivals
      </a>
    </div>

    <p style="margin:0;color:#a8a29e;font-size:11px;line-height:1.7;text-align:center;">
      You're receiving this because you subscribed to Lunelle updates.<br>
      <a href="${appUrl}/unsubscribe" style="color:#a8a29e;">Unsubscribe</a>
    </p>
  `;

  await transporter.sendMail({
    from: `"Lunelle" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: emailTemplate(subject, bodyHtml),
  });
}

export async function sendProductAnnouncementEmail({
  to,
  productName,
  productSlug,
  productImage,
  price,
  salePrice,
  shortDescription,
  currency = "CAD",
}: {
  to: string;
  productName: string;
  productSlug: string;
  productImage: string;
  price: number;
  salePrice?: number;
  shortDescription?: string;
  currency?: string;
}): Promise<void> {
  const subject = `New Arrival: ${productName}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://lunellestory.ca";
  const productUrl = `${appUrl}/products/${productSlug}`;

  const formattedPrice = salePrice
    ? `<span style="text-decoration:line-through;color:#a8a29e;font-size:14px;">${currency} $${price.toFixed(2)}</span>&nbsp;<span style="color:#1c1917;font-size:18px;font-weight:400;">${currency} $${salePrice.toFixed(2)}</span>`
    : `<span style="color:#1c1917;font-size:18px;font-weight:400;">${currency} $${price.toFixed(2)}</span>`;

  const bodyHtml = `
    <p style="margin:0 0 24px;color:#78716c;font-size:14px;line-height:1.7;">
      A new piece has just arrived at Lunelle — crafted for those who appreciate refined simplicity.
    </p>

    <!-- Product card -->
    <a href="${productUrl}" style="display:block;text-decoration:none;border:1px solid #e7e5e4;margin-bottom:28px;">
      ${productImage
        ? `<img src="${productImage}" alt="${productName}" style="width:100%;display:block;max-height:320px;object-fit:cover;" />`
        : `<div style="width:100%;height:200px;background:#f5f5f4;display:flex;align-items:center;justify-content:center;">
             <span style="font-size:11px;color:#a8a29e;letter-spacing:0.2em;text-transform:uppercase;">Lunelle</span>
           </div>`
      }
      <div style="padding:24px;">
        <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#a8a29e;">New Arrival</p>
        <h2 style="margin:0 0 10px;font-size:20px;font-weight:300;color:#1c1917;font-family:Georgia,serif;">${productName}</h2>
        ${shortDescription ? `<p style="margin:0 0 14px;font-size:13px;color:#78716c;line-height:1.6;">${shortDescription}</p>` : ""}
        <p style="margin:0;">${formattedPrice}</p>
      </div>
    </a>

    <div style="text-align:center;margin-bottom:28px;">
      <a href="${productUrl}"
         style="display:inline-block;padding:14px 40px;background:#1c1917;color:#fff;text-decoration:none;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;">
        Shop Now
      </a>
    </div>

    <p style="margin:0;color:#a8a29e;font-size:11px;line-height:1.7;text-align:center;">
      You're receiving this because you subscribed to Lunelle updates.<br>
      <a href="${appUrl}/unsubscribe" style="color:#a8a29e;">Unsubscribe</a>
    </p>
  `;

  await transporter.sendMail({
    from: `"Lunelle" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: emailTemplate(subject, bodyHtml),
  });
}

export async function sendCustomNewsletterEmail({
  to,
  subject,
  bodyHtml,
}: {
  to: string;
  subject: string;
  bodyHtml: string;
}): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://lunellestory.ca";
  const footerHtml = `
    <p style="margin:24px 0 0;color:#a8a29e;font-size:11px;line-height:1.7;text-align:center;">
      You're receiving this because you subscribed to Lunelle updates.<br>
      <a href="${appUrl}/unsubscribe" style="color:#a8a29e;">Unsubscribe</a>
    </p>
  `;
  await transporter.sendMail({
    from: `"Lunelle" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: emailTemplate(subject, bodyHtml + footerHtml),
  });
}

export async function sendWelcomeEmail({
  to,
  name,
  couponCode,
}: {
  to: string;
  name: string;
  couponCode?: string;
}): Promise<void> {
  const subject = "Welcome to Lunelle";

  const bodyHtml = `
    <p style="margin:0 0 20px;color:#78716c;font-size:14px;line-height:1.7;">
      Hi ${name},<br><br>
      Welcome to Lunelle. Your account has been successfully created.
    </p>
    ${
      couponCode
        ? `<div style="background:#f5f5f4;border:1px solid #e7e5e4;text-align:center;padding:28px;margin-bottom:28px;">
             <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#a8a29e;">
               Your welcome offer
             </p>
             <p style="margin:0 0 6px;font-size:28px;font-weight:300;color:#1c1917;">10% off</p>
             <p style="margin:0 0 14px;font-size:11px;color:#78716c;">your first order</p>
             <p style="margin:0;font-size:18px;font-weight:400;letter-spacing:0.3em;color:#1c1917;font-family:Courier,monospace;border:1px solid #d6d3d1;display:inline-block;padding:8px 20px;background:#fff;">
               ${couponCode}
             </p>
           </div>`
        : ""
    }
    <p style="margin:0 0 20px;color:#a8a29e;font-size:13px;line-height:1.7;">
      Explore our latest collections and enjoy complimentary shipping on orders over $200.
    </p>
    <div style="text-align:center;margin-top:32px;">
      <a href="${process.env.NEXTAUTH_URL ?? "https://lunellestory.ca"}/products"
         style="display:inline-block;padding:14px 36px;background:#1c1917;color:#fff;text-decoration:none;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">
        Shop Now
      </a>
    </div>
  `;

  await transporter.sendMail({
    from: `"Lunelle" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: emailTemplate(subject, bodyHtml),
  });
}
