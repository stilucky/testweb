import { NextRequest, NextResponse } from "next/server";
import { defaultCollections, type Collection } from "@/lib/collections";
import { readCollectionSettings, writeCollectionSettings } from "@/lib/server-collections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isCollection(value: unknown): value is Collection {
  if (!value || typeof value !== "object") return false;
  const collection = value as Partial<Collection>;
  return typeof collection.id === "string"
    && typeof collection.name === "string"
    && typeof collection.slug === "string"
    && (collection.status === "active" || collection.status === "draft")
    && Array.isArray(collection.productIds);
}

export async function GET() {
  const settings = await readCollectionSettings();
  return NextResponse.json(
    settings
      ? { collections: settings.collections, initialized: true }
      : { collections: defaultCollections, initialized: false },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json() as { collections?: unknown };
    if (!Array.isArray(body.collections) || !body.collections.every(isCollection)) {
      return NextResponse.json({ error: "Invalid collections payload" }, { status: 400 });
    }

    const settings = await writeCollectionSettings({ collections: body.collections });
    return NextResponse.json(
      { ...settings, initialized: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[PUT /api/collections]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
