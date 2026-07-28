import { NextRequest, NextResponse } from "next/server";
import { readCouponSettings, writeCouponSettings } from "@/lib/server-coupons";
import { defaultCoupons } from "@/store/couponStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await readCouponSettings();

  return NextResponse.json(
    settings ? { ...settings, initialized: true } : { coupons: defaultCoupons, initialized: false },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body.coupons)) {
      return NextResponse.json({ error: "coupons must be an array" }, { status: 400 });
    }

    const settings = await writeCouponSettings({ coupons: body.coupons });
    return NextResponse.json(settings, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[PUT /api/coupons]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
