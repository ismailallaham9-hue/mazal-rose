import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/store";

export const runtime = "nodejs";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/webm"];
const ALLOWED_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES];

// Generous cap (videos): raised so larger media is allowed. Images are
// compressed below, so their final stored size is tiny regardless.
const MAX_BYTES = 200 * 1024 * 1024;
// Longest edge for stored photos — plenty for full-bleed display; Next/Image
// resizes further per device on top of this.
const MAX_DIMENSION = 2000;

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file selected" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Use a JPG, PNG, WebP, MP4, or WebM file" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File must be smaller than 200 MB" },
      { status: 400 },
    );
  }

  let bytes: Buffer = Buffer.from(await file.arrayBuffer());
  let outName = file.name;
  let outType = file.type;

  // Auto-optimise photos: downscale oversized images and convert to WebP so
  // every stored picture is small and fast to load (videos pass through).
  if (IMAGE_TYPES.includes(file.type)) {
    try {
      const sharp = (await import("sharp")).default;
      bytes = await sharp(bytes)
        .rotate() // honour EXIF orientation
        .resize({
          width: MAX_DIMENSION,
          height: MAX_DIMENSION,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer();
      outType = "image/webp";
      outName = file.name.replace(/\.[a-z0-9]+$/i, "") + ".webp";
    } catch {
      // If optimisation fails for any reason, store the original as-is.
    }
  }

  const url = await uploadImage(bytes, outName, outType);
  return NextResponse.json({
    asset: {
      id: `m-${Date.now().toString(36)}`,
      url,
      name: outName,
      type: outType,
      createdAt: new Date().toISOString(),
      alt: "",
    },
    url,
  });
}
