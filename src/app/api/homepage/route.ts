import { NextRequest, NextResponse } from "next/server";
import { readHomeFeatureSettings, writeHomeFeatureSettings } from "@/lib/server-home-features";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await readHomeFeatureSettings();

  return NextResponse.json(
    settings ?? { features: null },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body.features)) {
      return NextResponse.json({ error: "features must be an array" }, { status: 400 });
    }

    const settings = await writeHomeFeatureSettings({ features: body.features });
    return NextResponse.json(settings, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[PUT /api/homepage]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
