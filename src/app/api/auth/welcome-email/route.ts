import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email, name, couponCode } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    try {
      await sendWelcomeEmail({ to: email, name, couponCode });
    } catch (err) {
      // Non-fatal — account already created, just log
      console.error("[welcome-email] Failed to send:", err);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
