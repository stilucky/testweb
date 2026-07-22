import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import { addMediaAssets, ensureUploadDir, ensureUploadPath, uploadPath, uploadUrl } from "@/lib/server-media-library";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file after client-side compression
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/jfif", "image/png", "image/webp", "image/gif", "image/avif"];
const ALLOWED_EXTENSIONS = ["avif", "gif", "ifif", "jfif", "jpg", "jpeg", "png", "webp"];

export async function POST(req: NextRequest) {
  try {
    await ensureUploadDir();

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const urls: string[] = [];
    const assets = [];

    for (const file of files) {
      const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const ext = rawExt.replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";

      if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { error: `File type not allowed: ${file.type}` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${file.name} (max 10 MB after compression)` },
          { status: 400 }
        );
      }

      const filename = `${randomUUID()}.${ext === "ifif" || ext === "jfif" ? "jpg" : ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await ensureUploadPath(filename);
      await writeFile(uploadPath(filename), buffer);
      const url = uploadUrl(filename);
      urls.push(url);
      assets.push({
        id: filename,
        name: file.name,
        url,
        type: file.type || "image/*",
        size: file.size,
        createdAt: new Date().toISOString(),
      });
    }

    await addMediaAssets(assets);

    return NextResponse.json({ urls, assets });
  } catch (err) {
    console.error("[POST /api/upload]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
