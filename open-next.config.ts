import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";
import { softTagFilter, withFilter } from "@opennextjs/cloudflare/overrides/tag-cache/tag-cache-filter";

// Cached pages live in R2 (Western Europe); the regional cache keeps a copy in
// Cloudflare's cache near each visitor so a page view doesn't round-trip to R2
// (measured 0.5-2s before). The D1 tag cache is still consulted, so
// revalidatePath() from admin saves and orders refreshes pages immediately.
export default defineCloudflareConfig({
	incrementalCache: withRegionalCache(r2IncrementalCache, { mode: "long-lived" }),
	tagCache: withFilter({ tagCache: d1NextTagCache, filterFn: softTagFilter }),
	queue: memoryQueue,
});
