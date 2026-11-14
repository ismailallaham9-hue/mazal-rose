import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = ts.transpileModule(readFileSync("src/lib/tabby.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const order = { id: "order1", paymentProvider: "tabby", paymentSessionId: "payment1", total: 100 };
let writes = 0;
let calls = 0;
let payment = { id: "payment1", order: { reference_id: "order1" }, currency: "AED", amount: "100", is_test: true, status: "CLOSED", captures: [{ amount: "100" }] };
const env = { TABBY_ENABLED: "true", TABBY_SECRET_KEY: "sk_test_dummy", TABBY_MERCHANT_CODE: "MAZ", TABBY_WEBHOOK_SECRET: "dummy" };
const exports = {};
vm.runInNewContext(source, {
  exports, process: { env }, URL, AbortSignal,
  require: name => name === "server-only" ? {} : {
    getFreshStoreData: async () => ({ orders: [order] }),
    updateStoreData: async fn => { const result = fn({ orders: [order] }); assert.equal(result.store.orders[0].paymentStatus, undefined); assert.equal(result.store.orders[0].tabbyTestStatus, "captured"); writes++; },
  },
  fetch: async (_url, options) => { calls++; assert.equal(options.method, "GET"); return { ok: true, json: async () => payment }; },
});
assert.equal(exports.tabbyConfigured(), true);
env.TABBY_SECRET_KEY = "sk_live_dummy";
assert.equal(exports.tabbyConfigured(), false);
env.TABBY_SECRET_KEY = "sk_test_dummy";
await exports.verifyTabbyPayment("order1");
await exports.verifyTabbyPayment("order1");
assert.equal(calls, 2);
assert.equal(writes, 2);
payment = { ...payment, amount: "1" };
await assert.rejects(exports.verifyTabbyPayment("order1"), /mismatch/);
payment = { ...payment, amount: "100", is_test: false };
await assert.rejects(exports.verifyTabbyPayment("order1"), /mismatch/);
assert.equal(writes, 2);
console.log("Tabby safeguards passed: test-only configuration, duplicate capture avoidance, amount matching, live-payment rejection, production paid status unchanged.");
