import { createReadStream } from "fs";
import { readFile, stat } from "fs/promises";
import { basename } from "path";
import { Readable } from "stream";
import { NextRequest, NextResponse } from "next/server";
import { CONTENT_TYPES, uploadPath } from "@/lib/server-media-library";

export const runtime = "nodejs";

async function getUploadFile(filename: string) {
  const safeName = basename(filename);
  const ext = safeName.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = uploadPath(safeName);
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
  const fileStat = await stat(path);

  return { contentType, fileStat, path };
}

function commonHeaders(contentType: string, size: number) {
  return {
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Length": String(size),
    "Content-Type": contentType,
  };
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    const { contentType, fileStat, path } = await getUploadFile(filename);
    const range = req.headers.get("range");

    if (range) {
      const match = range.match(/bytes=(\d*)-(\d*)/);
      if (!match) {
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${fileStat.size}` },
        });
      }

      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Number(match[2]) : fileStat.size - 1;

      if (
        !Number.isFinite(start) ||
        !Number.isFinite(end) ||
        start < 0 ||
        end >= fileStat.size ||
        start > end
      ) {
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${fileStat.size}` },
        });
      }

      const stream = Readable.toWeb(
        createReadStream(path, { start, end })
      ) as ReadableStream;

      return new NextResponse(stream, {
        status: 206,
        headers: {
          ...commonHeaders(contentType, end - start + 1),
          "Content-Range": `bytes ${start}-${end}/${fileStat.size}`,
        },
      });
    }

    const file = await readFile(path);

    return new NextResponse(file, {
      headers: commonHeaders(contentType, fileStat.size),
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}

export async function HEAD(
  _req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    const { contentType, fileStat } = await getUploadFile(filename);

    return new NextResponse(null, {
      headers: commonHeaders(contentType, fileStat.size),
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
