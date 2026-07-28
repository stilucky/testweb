import { NextRequest, NextResponse } from "next/server";
import { readVideoSettings, writeVideoSettings } from "@/lib/server-video";
import { defaultBrandVideo } from "@/store/videoStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await readVideoSettings();

  return NextResponse.json(
    settings
      ? { ...settings, initialized: true }
      : { brandVideo: defaultBrandVideo, enabled: true, initialized: false },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const settings = await writeVideoSettings({
      brandVideo: body.brandVideo ?? null,
      enabled: body.enabled !== false,
    });

    return NextResponse.json(settings, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[PUT /api/video]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
