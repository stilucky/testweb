import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import { ensureUploadDir, uploadPath, uploadUrl } from "@/lib/server-media-library";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MB = 1024 * 1024;
const MAX_FILE_SIZE = Number(process.env.HERO_VIDEO_MAX_MB ?? 4096) * MB;
const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-m4v"];
const ALLOWED_EXTENSIONS = ["m4v", "mov", "mp4", "ogv", "webm"];

export async function POST(req: NextRequest) {
  try {
    await ensureUploadDir();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "mp4";
    const ext = rawExt.replace(/[^a-z0-9]/g, "").slice(0, 5) || "mp4";

    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `Video type not allowed: ${file.type || ext}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Video too large: ${file.name} (max ${Math.round(MAX_FILE_SIZE / MB)} MB)` },
        { status: 400 }
      );
    }

    const filename = `${randomUUID()}.${ALLOWED_EXTENSIONS.includes(ext) ? ext : "mp4"}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(uploadPath(filename), buffer);

    return NextResponse.json({
      url: uploadUrl(filename),
      asset: {
        id: filename,
        name: file.name,
        url: uploadUrl(filename),
        type: file.type || "video/*",
        size: file.size,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[POST /api/hero-video]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
