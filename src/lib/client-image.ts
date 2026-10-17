/**
 * Shrink a photo in the browser before uploading: longest edge 2000px, WebP
 * at quality 80 (the same rules the server applies with sharp on Render).
 * Cloudflare Workers can't run sharp, so without this phone photos would be
 * stored at full size. Falls back to the original file on any failure or if
 * the result isn't smaller.
 */
const MAX_DIMENSION = 2000;
const RESIZABLE = ["image/jpeg", "image/png", "image/webp"];

export async function shrinkImageForUpload(file: File): Promise<File> {
  if (!RESIZABLE.includes(file.type) || typeof createImageBitmap !== "function") {
    return file;
  }
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.8),
    );
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[a-z0-9]+$/i, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    return file;
  }
}
