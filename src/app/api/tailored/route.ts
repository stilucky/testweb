import { NextRequest, NextResponse } from "next/server";
import { readTailoredContentSettings, writeTailoredContentSettings } from "@/lib/server-tailored-content";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await readTailoredContentSettings();

  return NextResponse.json(
    settings ?? { images: null },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body.images)) {
      return NextResponse.json({ error: "images must be an array" }, { status: 400 });
    }

    const settings = await writeTailoredContentSettings({ images: body.images });
    return NextResponse.json(settings, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[PUT /api/tailored]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
