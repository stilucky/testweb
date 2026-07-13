import { NextRequest, NextResponse } from "next/server";
import { readHeroSettings, writeHeroSettings } from "@/lib/server-hero";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await readHeroSettings();

  return NextResponse.json(
    settings ?? { slides: null },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body.slides)) {
      return NextResponse.json({ error: "slides must be an array" }, { status: 400 });
    }

    const settings = await writeHeroSettings({
      slides: body.slides,
      maxSlides: Math.min(Math.max(Number(body.maxSlides) || 5, 1), 10),
      autoplayInterval: Math.min(Math.max(Number(body.autoplayInterval) || 5, 2), 30),
    });

    return NextResponse.json(settings, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[PUT /api/hero]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
