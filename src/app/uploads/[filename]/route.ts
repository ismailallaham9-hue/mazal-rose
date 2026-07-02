import { NextResponse } from "next/server";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { getUploadedFileInfo } from "@/lib/store";

export const runtime = "nodejs";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  const info = await getUploadedFileInfo(filename);
  if (!info) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const contentType = MIME[ext] ?? "application/octet-stream";
  const range = req.headers.get("range");
  const headers = {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
    "Accept-Ranges": "bytes",
  };

  if (range) {
    const match = range.match(/^bytes=(\d*)-(\d*)$/);
    if (!match) {
      return new Response(null, {
        status: 416,
        headers: { ...headers, "Content-Range": `bytes */${info.size}` },
      });
    }
    const startRaw = match[1];
    const endRaw = match[2];
    const suffixLength = !startRaw && endRaw ? Number(endRaw) : null;
    const start = suffixLength
      ? Math.max(info.size - suffixLength, 0)
      : Number(startRaw || 0);
    const end = endRaw && startRaw ? Number(endRaw) : info.size - 1;
    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      start < 0 ||
      end >= info.size ||
      start > end
    ) {
      return new Response(null, {
        status: 416,
        headers: { ...headers, "Content-Range": `bytes */${info.size}` },
      });
    }
    const stream = createReadStream(info.file, { start, end });
    return new Response(Readable.toWeb(stream) as ReadableStream, {
      status: 206,
      headers: {
        ...headers,
        "Content-Length": String(end - start + 1),
        "Content-Range": `bytes ${start}-${end}/${info.size}`,
      },
    });
  }

  const stream = createReadStream(info.file);
  return new Response(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      ...headers,
      "Content-Length": String(info.size),
    },
  });
}
