import { appendFile, mkdir, readFile, stat, unlink } from "fs/promises";
import { randomUUID } from "crypto";
import { basename, join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { UPLOAD_DIR, ensureUploadPath, uploadPath, uploadUrl } from "@/lib/server-media-library";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MB = 1024 * 1024;
const MAX_FILE_SIZE = Number(process.env.HERO_VIDEO_MAX_MB ?? 4096) * MB;
const CHUNK_DIR = join(UPLOAD_DIR, ".hero-video-chunks");
const ALLOWED_EXTENSIONS = ["m4v", "mov", "mp4", "ogv", "webm"];

function cleanToken(value: string) {
  return value.replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 120);
}

function extensionFor(filename: string) {
  const rawExt = filename.split(".").pop()?.toLowerCase() ?? "mp4";
  const ext = rawExt.replace(/[^a-z0-9]/g, "").slice(0, 5) || "mp4";
  return ALLOWED_EXTENSIONS.includes(ext) ? ext : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const uploadId = cleanToken(String(body.uploadId ?? ""));
    const filename = basename(String(body.filename ?? "hero-video.mp4"));
    const fileType = String(body.fileType ?? "video/*");
    const totalChunks = Number(body.totalChunks);
    const totalSize = Number(body.totalSize);

    if (!uploadId || !Number.isInteger(totalChunks) || totalChunks <= 0) {
      return NextResponse.json({ error: "Invalid complete payload" }, { status: 400 });
    }

    if (!Number.isFinite(totalSize) || totalSize <= 0 || totalSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Video too large: max ${Math.round(MAX_FILE_SIZE / MB)} MB` },
        { status: 400 }
      );
    }

    const ext = extensionFor(filename);
    if (!ext) {
      return NextResponse.json({ error: `Video extension not allowed: ${filename}` }, { status: 400 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });
    const finalName = `${randomUUID()}.${ext}`;
    const finalPath = uploadPath(finalName);
    await ensureUploadPath(finalName);
    let receivedSize = 0;

    for (let index = 0; index < totalChunks; index += 1) {
      const partPath = join(CHUNK_DIR, `${uploadId}.${index}.part`);
      const partStat = await stat(partPath);
      receivedSize += partStat.size;
      await appendFile(finalPath, await readFile(partPath));
    }

    if (receivedSize !== totalSize) {
      await unlink(finalPath).catch(() => undefined);
      return NextResponse.json(
        { error: `Upload incomplete: received ${receivedSize} of ${totalSize} bytes` },
        { status: 400 }
      );
    }

    await Promise.all(
      Array.from({ length: totalChunks }, (_, index) =>
        unlink(join(CHUNK_DIR, `${uploadId}.${index}.part`)).catch(() => undefined)
      )
    );

    return NextResponse.json({
      ok: true,
      url: uploadUrl(finalName),
      asset: {
        id: finalName,
        name: filename,
        url: uploadUrl(finalName),
        type: fileType,
        size: totalSize,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[POST /api/hero-video/complete]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
