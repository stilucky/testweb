import { NextRequest, NextResponse } from "next/server";
import { generateOTP, storeOTP } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email, purpose, name } = await req.json();

    if (!email || !purpose) {
      return NextResponse.json({ error: "Missing email or purpose" }, { status: 400 });
    }

    if (purpose !== "verify" && purpose !== "reset") {
      return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });
    }

    const otp = generateOTP();
    storeOTP(email, otp, purpose);

    try {
      await sendOTPEmail({ to: email, otp, purpose, name });
      return NextResponse.json({ success: true });
    } catch (emailErr) {
      // In development: return OTP so you can test without real email
      if (process.env.NODE_ENV !== "production") {
        console.log(`[DEV] OTP for ${email}: ${otp}`);
        return NextResponse.json({ success: true, devOTP: otp });
      }
      console.error("Email send error:", emailErr);
      return NextResponse.json(
        { error: "Failed to send email. Please check SMTP configuration." },
        { status: 500 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
