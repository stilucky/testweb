import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const { email, code, purpose } = await req.json();

    if (!email || !code || !purpose) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const valid = verifyOTP(email, code, purpose);

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
