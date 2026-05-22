import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
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
        TeBoutique
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
        © ${new Date().getFullYear()} TeBoutique · All rights reserved
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
    ? "Verify your TeBoutique account"
    : "Reset your TeBoutique password";

  const greeting = name ? `Hi ${name},` : "Hello,";

  const bodyHtml = `
    <p style="margin:0 0 24px;color:#78716c;font-size:14px;line-height:1.7;">
      ${greeting}<br><br>
      ${
        isVerify
          ? "Thank you for creating an account with TeBoutique. Please use the verification code below to activate your account."
          : "We received a request to reset the password for your TeBoutique account. Use the code below to proceed."
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
    from: `"TeBoutique" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: emailTemplate(subject, bodyHtml),
  });
}
