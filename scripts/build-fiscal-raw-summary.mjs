#!/usr/bin/env node
// Builds fiscal_raw_summary.json — the compact stand-in for the OSPI fiscal
// PDF corpus under gs://sps-btn-data-all-data/raw/fiscal/. The corpus is far
// too large (~167k files, ~140 GB) to carry in all_data.txt or ship to the
// client as a file manifest, so the /data/fiscal page presents per-subcorpus
// and per-year roll-ups instead.
//
// To refresh:
//   gsutil du gs://sps-btn-data-all-data/raw/fiscal/ > fiscal_du.txt
//   node scripts/build-fiscal-raw-summary.mjs fiscal_du.txt
//   git add fiscal_raw_summary.json && git commit
// (fiscal_du.txt is a ~167k-line intermediate; don't commit it.)

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT = resolve(ROOT, "fiscal_raw_summary.json");
const GS_PREFIX = "gs://sps-btn-data-all-data/raw/fiscal/";

const input = process.argv[2];
if (!input) {
  console.error(
    "usage: build-fiscal-raw-summary.mjs <fiscal_du.txt>\n" +
      "  where fiscal_du.txt = `gsutil du gs://sps-btn-data-all-data/raw/fiscal/`",
  );
  process.exit(1);
}

const raw = await readFile(resolve(process.cwd(), input), "utf8");

const subcorpora = new Map(); // dir -> {files, bytes}
const fiscalYears = new Map(); // year -> {files, bytes}
let totalFiles = 0;
let totalBytes = 0;

for (const line of raw.split("\n")) {
  const t = line.trim();
  if (!t) continue;
  // "<bytes>  gs://.../raw/fiscal/<subcorpus>/<rest>"
  const m = t.match(/^(\d+)\s+(gs:\/\/\S.*)$/);
  if (!m) continue;
  const bytes = Number(m[1]);
  const path = m[2];
  if (!path.startsWith(GS_PREFIX)) continue;
  if (path.endsWith("/")) continue; // directory summary line
  const rel = path.slice(GS_PREFIX.length);
  const slash = rel.indexOf("/");
  if (slash < 0) continue;
  const sub = rel.slice(0, slash);

  totalFiles += 1;
  totalBytes += bytes;

  const s = subcorpora.get(sub) ?? { files: 0, bytes: 0 };
  s.files += 1;
  s.bytes += bytes;
  subcorpora.set(sub, s);

  // The district F-195/F-196 packets are organized fiscal/<year>/<district>/;
  // roll those up per year for the drill-down list.
  if (sub === "fiscal") {
    const rest = rel.slice(slash + 1);
    const year = rest.slice(0, rest.indexOf("/"));
    if (/^\d{4}-\d{4}$/.test(year)) {
      const y = fiscalYears.get(year) ?? { files: 0, bytes: 0 };
      y.files += 1;
      y.bytes += bytes;
      fiscalYears.set(year, y);
    }
  }
}

const summary = {
  generated: new Date().toISOString().slice(0, 10),
  bucket_prefix: "raw/fiscal/",
  total_files: totalFiles,
  total_bytes: totalBytes,
  subcorpora: Array.from(subcorpora.entries())
    .map(([dir, v]) => ({ dir, ...v }))
    .sort((a, b) => a.dir.localeCompare(b.dir)),
  fiscal_years: Array.from(fiscalYears.entries())
    .map(([year, v]) => ({ year, ...v }))
    .sort((a, b) => a.year.localeCompare(b.year)),
};

await writeFile(OUT, JSON.stringify(summary, null, 2) + "\n");
console.log(
  `[build-fiscal-raw-summary] ${totalFiles.toLocaleString()} files, ` +
    `${(totalBytes / 1024 ** 3).toFixed(1)} GiB -> fiscal_raw_summary.json`,
);
