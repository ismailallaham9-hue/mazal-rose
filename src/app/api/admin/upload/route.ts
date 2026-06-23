import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/store";

export const runtime = "nodejs";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
];
const MAX_BYTES = 40 * 1024 * 1024;

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image selected" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Use a JPG, PNG, WebP, MP4, or WebM file" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File must be smaller than 40 MB" },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const url = await uploadImage(bytes, file.name, file.type);
  return NextResponse.json({
    asset: {
      id: `m-${Date.now().toString(36)}`,
      url,
      name: file.name,
      type: file.type,
      createdAt: new Date().toISOString(),
    },
    url,
  });
}
