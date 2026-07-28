import { NextRequest, NextResponse } from "next/server";
import { readAboutSettings, writeAboutSettings } from "@/lib/server-about";
import { defaultPosts, defaultSections } from "@/store/aboutStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await readAboutSettings();

  return NextResponse.json(
    settings
      ? { ...settings, initialized: true }
      : { sections: defaultSections, posts: defaultPosts, initialized: false },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body.sections) || !Array.isArray(body.posts)) {
      return NextResponse.json(
        { error: "sections and posts must be arrays" },
        { status: 400 }
      );
    }

    const settings = await writeAboutSettings({
      sections: body.sections,
      posts: body.posts,
    });

    return NextResponse.json(settings, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[PUT /api/about]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
