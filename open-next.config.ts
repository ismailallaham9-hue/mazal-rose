import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

// Cached pages live in R2. The D1 tag cache makes revalidatePath() (admin
// saves, orders) refresh pages immediately, as it does on Render.
export default defineCloudflareConfig({
	incrementalCache: r2IncrementalCache,
	tagCache: d1NextTagCache,
	queue: memoryQueue,
});
