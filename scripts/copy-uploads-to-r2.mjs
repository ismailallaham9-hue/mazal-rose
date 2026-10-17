#!/usr/bin/env node
/**
 * Copy every /uploads/<file> referenced in a store backup from the live site
 * into the R2 media bucket (uploads/<file>), so product photos keep working
 * after the move to Cloudflare. Safe to re-run; files are only read from the
 * live site.
 *
 *   node scripts/copy-uploads-to-r2.mjs backup.json --dry-run
 *   node scripts/copy-uploads-to-r2.mjs backup.json
 *
 * Env: SOURCE_URL (default https://mazal.ae), BUCKET (default mazal-media).
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const [file, ...flags] = process.argv.slice(2);
const dryRun = flags.includes("--dry-run");
const source = (process.env.SOURCE_URL || "https://mazal.ae").replace(/\/$/, "");
const bucket = process.env.BUCKET || "mazal-media";
if (!file) {
  console.error("usage: node scripts/copy-uploads-to-r2.mjs <backup.json> [--dry-run]");
  process.exit(1);
}

const text = readFileSync(file, "utf8");
const names = [...new Set([...text.matchAll(/\/uploads\/([A-Za-z0-9._-]+)/g)].map((m) => m[1]))];
console.log(`${names.length} uploaded files referenced in ${path.basename(file)}`);

const TYPES = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", mp4: "video/mp4", webm: "video/webm" };
const dir = mkdtempSync(path.join(tmpdir(), "mazal-uploads-"));
let copied = 0;
const failed = [];

for (const name of names) {
  const url = `${source}/uploads/${encodeURIComponent(name)}`;
  const res = await fetch(url, { redirect: "manual" });
  if (res.status !== 200) {
    failed.push(`${name} (HTTP ${res.status})`);
    continue;
  }
  const bytes = Buffer.from(await res.arrayBuffer());
  if (dryRun) {
    console.log(`would copy ${name} (${bytes.length} bytes)`);
    copied++;
    continue;
  }
  const local = path.join(dir, name);
  writeFileSync(local, bytes);
  const type = TYPES[name.split(".").pop().toLowerCase()] || "application/octet-stream";
  execFileSync(
    "npx",
    ["wrangler", "r2", "object", "put", `${bucket}/uploads/${name}`, "--file", local,
      "--content-type", type, "--cache-control", "public, max-age=31536000, immutable", "--remote"],
    { stdio: "ignore" },
  );
  console.log(`copied ${name} (${statSync(local).size} bytes)`);
  copied++;
}

console.log(`${dryRun ? "Would copy" : "Copied"} ${copied}/${names.length}.`);
if (failed.length) {
  console.error(`Could not fetch ${failed.length}:\n  ${failed.join("\n  ")}`);
  process.exitCode = 1;
}
