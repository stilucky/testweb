import { NextRequest, NextResponse } from "next/server";
import { readSubscriberSettings, writeSubscriberSettings } from "@/lib/server-subscribers";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await readSubscriberSettings();

  return NextResponse.json(
    settings
      ? { ...settings, initialized: true }
      : { subscribers: [], emailCampaigns: [], initialized: false },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body.subscribers) || !Array.isArray(body.emailCampaigns)) {
      return NextResponse.json(
        { error: "subscribers and emailCampaigns must be arrays" },
        { status: 400 }
      );
    }

    const settings = await writeSubscriberSettings({
      subscribers: body.subscribers,
      emailCampaigns: body.emailCampaigns,
    });

    return NextResponse.json(settings, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[PUT /api/subscribers]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
