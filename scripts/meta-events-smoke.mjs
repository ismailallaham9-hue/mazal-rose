import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (path) => readFileSync(join(root, path), "utf8");

const apiRoute = read("src/app/api/meta/events/route.ts");
assert.match(apiRoute, /eventName === "Purchase"/);
assert.match(apiRoute, /sendMetaCapiEvent/);

const noonReturn = read("src/app/checkout/noon/return/page.tsx");
assert.match(noonReturn, /paymentStatus !== "paid"/);
assert.match(noonReturn, /trackMetaPurchaseOnce/);
assert.match(noonReturn, /MetaPurchaseEvent/);

const capi = read("src/lib/meta-capi.ts");
assert.match(capi, /META_CAPI_ACCESS_TOKEN/);
assert.doesNotMatch(capi, /NEXT_PUBLIC_META_CAPI_ACCESS_TOKEN/);

const browser = read("src/lib/meta-browser.ts");
assert.match(browser, /event_id/);
assert.match(browser, /\/api\/meta\/events/);

console.log("Meta event smoke checks passed.");
