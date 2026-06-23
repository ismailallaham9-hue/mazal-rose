import { NextResponse } from "next/server";
import { readUploadedFile } from "@/lib/store";

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
  _req: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  const bytes = await readUploadedFile(filename);
  if (!bytes) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": MIME[ext] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
