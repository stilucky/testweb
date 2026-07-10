import { readFile } from "fs/promises";
import { basename } from "path";
import { NextRequest, NextResponse } from "next/server";
import { CONTENT_TYPES, uploadPath } from "@/lib/server-media-library";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    const safeName = basename(filename);
    const ext = safeName.split(".").pop()?.toLowerCase() ?? "jpg";
    const file = await readFile(uploadPath(safeName));

    return new NextResponse(file, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
