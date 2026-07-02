import Image from "next/image";
import type { Product } from "@/lib/products";
import { categoryLabel } from "@/lib/products";
import { clsx } from "@/lib/clsx";

/**
 * Renders a product's photograph when available, otherwise a refined
 * sand-toned "atelier" placeholder so the catalogue stays elegant before
 * real product photography exists.
 */
export function ProductImage({
  product,
  imageSrc,
  alt,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
  className,
  priority = false,
}: {
  product: Product;
  imageSrc?: string;
  alt?: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  const src = imageSrc ?? product.image;
  if (src) {
    return (
      <Image
        src={src}
        alt={alt ?? product.name}
        fill
        sizes={sizes}
        priority={priority}
        className={clsx("object-cover", className)}
      />
    );
  }

  // Deterministic gentle variation so the grid isn't monotonous.
  const tones = [
    "from-sand to-cream",
    "from-sand-deep/70 to-sand",
    "from-cream to-sand",
    "from-sand to-sand-deep/60",
  ];
  const tone = tones[hash(product.id) % tones.length];

  return (
    <div
      className={clsx(
        "flex h-full w-full flex-col items-center justify-center bg-gradient-to-br p-6 text-center",
        tone,
        className,
      )}
    >
      <span className="eyebrow !text-bronze/70">
        {categoryLabel(product.category)}
      </span>
      <span className="mt-2 font-serif text-2xl leading-tight text-ink/80">
        {product.name}
      </span>
      <span className="mt-4 font-serif text-sm tracking-[0.4em] text-bronze/50">
        M·L
      </span>
    </div>
  );
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
