import { NextRequest, NextResponse } from "next/server";
import { listMediaAssets, removeMediaAsset } from "@/lib/server-media-library";

export const runtime = "nodejs";

export async function GET() {
  try {
    const assets = await listMediaAssets();
    return NextResponse.json({ assets });
  } catch (err) {
    console.error("[GET /api/media]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing media id" }, { status: 400 });
    }

    const assets = await removeMediaAsset(id);
    return NextResponse.json({ assets });
  } catch (err) {
    console.error("[DELETE /api/media]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
