import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  clientIp,
  payloadTooLarge,
  rateLimit,
  readJsonBody,
  RequestTooLarge,
  tooManyRequests,
} from "@/lib/request-guard";
import {
  ratingSummaryForProduct,
  type RatingSummary,
  type StoreRating,
  updateStoreData,
} from "@/lib/store";

export const runtime = "nodejs";

const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

type RatingPostResult = {
  status: 200 | 400 | 404 | 429;
  body: {
    error?: string;
    summary?: RatingSummary | null;
  };
  path?: string;
};

function clean(value: unknown) {
  return String(value ?? "").trim();
}

// One rating per product per visitor IP. The user agent and session header
// used to be part of this, but the client controls both, so changing them
// allowed unlimited ratings.
function fingerprint(req: Request, targetId: string) {
  return createHash("sha256")
    .update([targetId, clientIp(req)].join("|"))
    .digest("hex");
}

export async function POST(req: Request) {
  if (!rateLimit(`ratings:${clientIp(req)}`, 10, 10 * 60 * 1000)) return tooManyRequests();
  let body: Record<string, unknown>;
  try {
    body = await readJsonBody(req, 4 * 1024);
  } catch (error) {
    if (error instanceof RequestTooLarge) return payloadTooLarge();
    throw error;
  }
  const targetType = clean(body.targetType);
  const targetId = clean(body.targetId);
  const targetSlug = clean(body.targetSlug);
  const rating = Number(body.rating);

  if (targetType !== "product" || !targetId || !targetSlug) {
    return NextResponse.json(
      { error: "Please choose a valid product to rate." },
      { status: 400 },
    );
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Please choose a rating from 1 to 5 stars." },
      { status: 400 },
    );
  }

  const now = new Date();
  const fp = fingerprint(req, targetId);
  const result = await updateStoreData<RatingPostResult>((store) => {
    const product = store.products.find(
      (item) => item.id === targetId && item.slug === targetSlug,
    );

    if (!product) {
      return {
        store,
        result: {
          status: 404 as const,
          body: { error: "We could not find this product." },
        },
      };
    }

    const duplicate = store.ratings.find((item) => {
      if (item.targetType !== "product") return false;
      if (item.targetId !== targetId || item.fingerprint !== fp) return false;
      const submittedAt = Date.parse(item.createdAt);
      return Number.isFinite(submittedAt) && now.getTime() - submittedAt < DUPLICATE_WINDOW_MS;
    });

    if (duplicate) {
      return {
        store,
        result: {
          status: 429 as const,
          body: {
            error: "You already rated this product recently.",
            summary: ratingSummaryForProduct(store, product),
          },
        },
      };
    }

    const newRating: StoreRating = {
      id: randomUUID(),
      targetType: "product",
      targetId,
      targetSlug,
      rating,
      createdAt: now.toISOString(),
      fingerprint: fp,
    };
    const nextStore = {
      ...store,
      ratings: [newRating, ...store.ratings],
    };

    return {
      store: nextStore,
      result: {
        status: 200 as const,
        body: {
          summary: ratingSummaryForProduct(nextStore, product),
        },
        path: `/shop/${product.slug}`,
      },
    };
  });

  if ("path" in result && result.path) {
    revalidatePath(result.path);
    revalidatePath("/shop/[slug]", "page");
  }

  return NextResponse.json(result.body, { status: result.status });
}
