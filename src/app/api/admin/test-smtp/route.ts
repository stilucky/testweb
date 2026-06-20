import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  const config = {
    host: SMTP_HOST ?? "(not set)",
    port: SMTP_PORT ?? "(not set)",
    user: SMTP_USER ?? "(not set)",
    passSet: !!SMTP_PASS,
  };

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return NextResponse.json({ ok: false, error: "Missing SMTP env vars", config });
  }

  const port = Number(SMTP_PORT ?? 587);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transporter.verify();
    return NextResponse.json({ ok: true, message: "SMTP connection OK", config });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: detail, config }, { status: 500 });
  }
}
