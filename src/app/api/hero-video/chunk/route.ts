import { mkdir, rename, stat, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import { basename, join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { UPLOAD_DIR, uploadPath, uploadUrl } from "@/lib/server-media-library";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MB = 1024 * 1024;
const MAX_FILE_SIZE = Number(process.env.HERO_VIDEO_MAX_MB ?? 4096) * MB;
const CHUNK_DIR = join(UPLOAD_DIR, ".hero-video-chunks");
const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-m4v"];
const ALLOWED_EXTENSIONS = ["m4v", "mov", "mp4", "ogv", "webm"];

function cleanToken(value: string) {
  return value.replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 120);
}

function extensionFor(filename: string, type: string) {
  const rawExt = filename.split(".").pop()?.toLowerCase() ?? "mp4";
  const ext = rawExt.replace(/[^a-z0-9]/g, "").slice(0, 5) || "mp4";
  if (type && !ALLOWED_TYPES.includes(type) && !ALLOWED_EXTENSIONS.includes(ext)) return null;
  if (!type && !ALLOWED_EXTENSIONS.includes(ext)) return null;
  return ALLOWED_EXTENSIONS.includes(ext) ? ext : "mp4";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const chunk = formData.get("chunk") as File | null;
    const uploadId = cleanToken(String(formData.get("uploadId") ?? ""));
    const filename = basename(String(formData.get("filename") ?? "hero-video.mp4"));
    const fileType = String(formData.get("fileType") ?? "");
    const chunkIndex = Number(formData.get("chunkIndex"));
    const totalChunks = Number(formData.get("totalChunks"));
    const totalSize = Number(formData.get("totalSize"));

    if (!chunk || !uploadId || !Number.isInteger(chunkIndex) || !Number.isInteger(totalChunks)) {
      return NextResponse.json({ error: "Invalid chunk upload payload" }, { status: 400 });
    }

    if (!Number.isFinite(totalSize) || totalSize <= 0 || totalSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Video too large: max ${Math.round(MAX_FILE_SIZE / MB)} MB` },
        { status: 400 }
      );
    }

    const ext = extensionFor(filename, fileType || chunk.type);
    if (!ext) {
      return NextResponse.json({ error: `Video type not allowed: ${fileType || chunk.type}` }, { status: 400 });
    }

    await mkdir(CHUNK_DIR, { recursive: true });
    const partPath = join(CHUNK_DIR, `${uploadId}.part`);
    const buffer = Buffer.from(await chunk.arrayBuffer());
    await writeFile(partPath, buffer, { flag: chunkIndex === 0 ? "w" : "a" });

    const current = await stat(partPath);
    if (chunkIndex < totalChunks - 1) {
      return NextResponse.json({ ok: true, received: current.size });
    }

    if (current.size !== totalSize) {
      return NextResponse.json(
        { error: `Upload incomplete: received ${current.size} of ${totalSize} bytes` },
        { status: 400 }
      );
    }

    const finalName = `${randomUUID()}.${ext}`;
    await rename(partPath, uploadPath(finalName));

    return NextResponse.json({
      ok: true,
      url: uploadUrl(finalName),
      asset: {
        id: finalName,
        name: filename,
        url: uploadUrl(finalName),
        type: fileType || chunk.type || "video/*",
        size: totalSize,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[POST /api/hero-video/chunk]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
