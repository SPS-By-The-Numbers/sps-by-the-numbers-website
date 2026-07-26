#!/usr/bin/env node
// Parses all_data.txt (a `gsutil ls -r` listing of gs://sps-btn-data-all-data)
// and emits per-section JSON manifests into app/data/_manifest/, consumed by
// the /data/* pages. Runs on prebuild and predev.
//
// raw/fiscal/ (the OSPI fiscal PDF corpus, ~167k files / ~140 GB) is mostly
// EXCLUDED from all_data.txt — it would dwarf everything else and can't ship
// to the client as a file list anyway. It is summarized by
// fiscal_raw_summary.json instead (see scripts/build-fiscal-raw-summary.mjs).
// The exception is raw/fiscal/fiscal/ (the per-district F-195/F-196 packets,
// ~17k files), which IS listed so the /data/fiscal district chooser can link
// each packet.
//
// To refresh from the bucket:
//   { gsutil ls -r gs://sps-btn-data-all-data | grep -v '^gs://sps-btn-data-all-data/raw/fiscal/'; \
//     gsutil ls -r gs://sps-btn-data-all-data/raw/fiscal/fiscal; } > all_data.txt
//   git add all_data.txt && git commit

import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const INPUT = resolve(ROOT, "all_data.txt");
const FISCAL_RAW_SUMMARY = resolve(ROOT, "fiscal_raw_summary.json");
const OUT_DIR = resolve(ROOT, "app/data/_manifest");
const GS_PREFIX = "gs://sps-btn-data-all-data/";

function parseLines(raw) {
  const files = [];
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    if (!t.startsWith(GS_PREFIX)) continue;
    if (t.endsWith(":")) continue; // directory header
    if (t.endsWith("/")) continue; // trailing-slash placeholder
    files.push(t.slice(GS_PREFIX.length));
  }
  return files;
}

function under(prefix, files) {
  return files.filter((f) => f.startsWith(prefix));
}

function basename(path) {
  return path.slice(path.lastIndexOf("/") + 1);
}

function byName(a, b) {
  return a.file.localeCompare(b.file);
}

function toEntry(path) {
  return { file: basename(path), path };
}

// Parse "2024-2025 - <Report Type> - <District Name> (<code>) - <short>[ <SEASON>].<ext>"
const STARS_RE =
  /^(\d{4}-\d{4}) - (.+?) - (.+?) \((\d{5})\) - (.+?)(?: (FALL|WINTER|SPRING|SUMMER))?\.([a-z0-9]+)$/i;
// Skip duplicate uploads suffixed with " (1)", " (2)" etc.
const DUP_SUFFIX_RE = / \(\d+\)\.[a-z0-9]+$/i;

function parseStarsName(name) {
  if (DUP_SUFFIX_RE.test(name)) return null;
  const m = name.match(STARS_RE);
  if (!m) return null;
  return {
    year: m[1],
    report: m[2],
    districtName: m[3],
    code: m[4],
    short: m[5],
    season: m[6] || null,
    ext: m[7].toLowerCase(),
  };
}

// "Efficiency Review" filenames have an extra classification segment after the
// report type, e.g. "... - Efficiency Review - Current above 90% Prior below 90% - <District> (code) - ..."
const STARS_REVIEW_RE =
  /^(\d{4}-\d{4}) - Efficiency Review - (.+?) - (.+?) \((\d{5})\) - (.+?)\.([a-z0-9]+)$/i;

function parseStarsReviewName(name) {
  const m = name.match(STARS_REVIEW_RE);
  if (!m) return null;
  return {
    year: m[1],
    classification: m[2],
    districtName: m[3],
    code: m[4],
    short: m[5],
    ext: m[6].toLowerCase(),
  };
}

// "f195-2014-2015-activity.avro" → year "2014-2015", section "activity"
const F19X_RE = /^f19[56]-(\d{4}-\d{4})-(.+?)\.avro$/;

function parseF19x(name) {
  const m = name.match(F19X_RE);
  if (!m) return null;
  return { year: m[1], section: m[2] };
}

// "P223_Apr21.pdf" → "2021-04"
const MONTH_MAP = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

function parseP223Name(name) {
  const m = name.match(/^P223_([A-Z][a-z]{2})(\d{2})\.pdf$/);
  if (!m) return null;
  return { month: `20${m[2]}-${MONTH_MAP[m[1]]}` };
}

async function main() {
  const raw = await readFile(INPUT, "utf8");
  const files = parseLines(raw);

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  // ---------- Finance ----------
  const finance = {
    sps_budgets: under("raw/sps/budget/", files).map(toEntry).sort(byName),
    f195_raw: under("raw/safs/f195/", files).map(toEntry).sort(byName),
    f196_raw: under("raw/safs/f196/", files).map(toEntry).sort(byName),
    f195_processed: under("processed/safs/f195/", files).map((p) => {
      const file = basename(p);
      const meta = parseF19x(file);
      return {
        file,
        path: p,
        year: meta?.year ?? null,
        section: meta?.section ?? null,
      };
    }),
    f196_processed: under("processed/safs/f196/", files).map((p) => {
      const file = basename(p);
      const meta = parseF19x(file);
      return {
        file,
        path: p,
        year: meta?.year ?? null,
        section: meta?.section ?? null,
      };
    }),
    f19x_processed: under("processed/safs/f19x/", files)
      .map(toEntry)
      .sort(byName),
    domains: under("processed/safs/domains/", files)
      // Skip testout/ debugging artifacts
      .filter((p) => !p.startsWith("processed/safs/domains/testout/"))
      .map(toEntry)
      .sort(byName),
    analysis: under("processed/safs/analysis/", files)
      .map(toEntry)
      .sort(byName),
  };

  // ---------- Enrollment ----------
  const enrollment = {
    sps_p223_pdf: under("raw/sps/p223/", files).map(toEntry).sort(byName),
    ospi_p223_pdf: under("raw/ospi/pdf/p223/", files).map((p) => {
      const file = basename(p);
      const meta = parseP223Name(file);
      return { file, path: p, month: meta?.month ?? null };
    }),
    processed_monthly_csv: under("processed/ospi/csv/p223/", files).map((p) => {
      const file = basename(p);
      const month = file.replace(/\.csv$/, "");
      return { file, path: p, month };
    }),
    processed_avro: under("processed/safs/enrollment/", files).map(toEntry),
    safs_p223_source: under("raw/safs/p223/", files).map(toEntry).sort(byName),
  };

  // ---------- Staffing ----------
  const staffing = {
    raw_s275: under("raw/safs/s275/", files)
      .map((p) => {
        const file = basename(p);
        const m = file.match(/^(\d{4}-\d{4})/);
        return { file, path: p, year: m?.[1] ?? null };
      })
      .sort(byName),
    processed_s275: under("processed/safs/s275/", files)
      .map(toEntry)
      .sort(byName),
  };

  // ---------- Assessment ----------
  const assessment = {
    processed_avro: under("processed/safs/assessment/", files).map(toEntry),
    analysis_csv: under("processed/safs/analysis/", files)
      .map(toEntry)
      .sort(byName),
  };

  // ---------- SQSS ----------
  const sqss = {
    raw: under("raw/sqss/", files).map(toEntry).sort(byName),
    processed: under("processed/safs/sqss/", files).map(toEntry),
  };

  // ---------- Fiscal (OSPI fiscal-report PDF corpus + extracted tables) ----
  // The raw corpus is summarized (see the header comment); the extracted
  // per-table AVROs are small enough to list.
  let fiscalRawSummary = null;
  try {
    fiscalRawSummary = JSON.parse(await readFile(FISCAL_RAW_SUMMARY, "utf8"));
  } catch {
    console.warn(
      "[build-data-manifest] fiscal_raw_summary.json missing — /data/fiscal raw section will be empty",
    );
  }
  // Per-district F-195/F-196 packets, indexed for the district chooser:
  // raw/fiscal/fiscal/<year>/<code>_<district_slug>/<packet>.pdf
  // -> packets[code][year] = { dir, files: [packet, ...] }.
  const fiscalDistricts = new Map();
  const fiscalPackets = {};
  const FISCAL_PACKET_RE =
    /^raw\/fiscal\/fiscal\/(\d{4}-\d{4})\/((\d{5})_([a-z0-9_]+))\/([^/]+)$/;
  const SMALL_WORDS = new Set(["of", "the", "and"]);
  for (const p of under("raw/fiscal/fiscal/", files)) {
    const m = p.match(FISCAL_PACKET_RE);
    if (!m) continue;
    const [, year, dir, code, slug, file] = m;
    if (!fiscalDistricts.has(code)) {
      const name = slug
        .split("_")
        .map((w, i) =>
          !i || !SMALL_WORDS.has(w)
            ? w.charAt(0).toUpperCase() + w.slice(1)
            : w,
        )
        .join(" ");
      fiscalDistricts.set(code, { code, name });
    }
    if (!fiscalPackets[code]) fiscalPackets[code] = {};
    if (!fiscalPackets[code][year])
      fiscalPackets[code][year] = { dir, files: [] };
    fiscalPackets[code][year].files.push(file);
  }
  for (const byYear of Object.values(fiscalPackets)) {
    for (const entry of Object.values(byYear)) {
      entry.files.sort();
    }
  }

  const fiscal = {
    raw: fiscalRawSummary,
    tables: under("processed/fiscal/", files).map(toEntry).sort(byName),
    districts: Array.from(fiscalDistricts.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
    packets: fiscalPackets,
  };

  // ---------- ODATA ----------
  // Pair AVRO + schema by code.
  const odataPairs = new Map();
  for (const p of under("raw/ospi/odata/", files)) {
    const file = basename(p);
    const m = file.match(/^([^.]+)\.(avro|schema)$/);
    if (!m) continue;
    const entry = odataPairs.get(m[1]) || { code: m[1] };
    entry[m[2]] = p;
    odataPairs.set(m[1], entry);
  }
  const odata = Array.from(odataPairs.values()).sort((a, b) =>
    a.code.localeCompare(b.code),
  );

  // ---------- Public Records ----------
  const publicRecords = under("raw/prr/", files).map(toEntry).sort(byName);
  const prrZip = files.find((f) => f === "processed/prr_transportation.zip");

  // ---------- STARS Transportation ----------
  // Indexed structure: categories[cat][district_code][year][season?] = filename
  // Plus a districts lookup.
  const districts = new Map();
  const stars = {
    kpi: {},
    efficiency: {},
    operations_allocation: {},
    quarterly_district: {},
  };

  function recordDistrict(meta) {
    if (!districts.has(meta.code)) {
      districts.set(meta.code, {
        code: meta.code,
        name: meta.districtName,
        short: meta.short,
      });
    }
  }

  function shouldReplace(existing, incoming) {
    // Prefer .pdf over .docx when both exist for the same slot.
    if (!existing) return true;
    const existingPdf = existing.toLowerCase().endsWith(".pdf");
    const incomingPdf = incoming.toLowerCase().endsWith(".pdf");
    return !existingPdf && incomingPdf;
  }

  function indexStars(category, prefix) {
    for (const p of under(prefix, files)) {
      const file = basename(p);
      const meta = parseStarsName(file);
      if (!meta) continue;
      recordDistrict(meta);
      const byDistrict = stars[category];
      if (!byDistrict[meta.code]) byDistrict[meta.code] = {};
      const byYear = byDistrict[meta.code];
      if (meta.season) {
        if (!byYear[meta.year]) byYear[meta.year] = {};
        const existing = byYear[meta.year][meta.season];
        if (shouldReplace(existing, file))
          byYear[meta.year][meta.season] = file;
      } else {
        if (shouldReplace(byYear[meta.year], file)) byYear[meta.year] = file;
      }
    }
  }

  indexStars("kpi", "raw/stars/kpi/");
  indexStars("efficiency", "raw/stars/efficiency/");
  indexStars("operations_allocation", "raw/stars/operations_allocation/");
  indexStars("quarterly_district", "raw/stars/quarterly_district/");

  // Efficiency reviews — flat list with classification.
  const efficiencyReviews = [];
  for (const p of under("raw/stars/efficiency_review/", files)) {
    const file = basename(p);
    const meta = parseStarsReviewName(file);
    if (!meta) continue;
    recordDistrict({
      code: meta.code,
      districtName: meta.districtName,
      short: meta.short,
    });
    efficiencyReviews.push({
      year: meta.year,
      classification: meta.classification,
      districtCode: meta.code,
      districtName: meta.districtName,
      file,
    });
  }
  efficiencyReviews.sort(
    (a, b) =>
      a.year.localeCompare(b.year) ||
      a.classification.localeCompare(b.classification) ||
      a.districtName.localeCompare(b.districtName),
  );

  // Sorted districts array.
  const districtsList = Array.from(districts.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const transportation = {
    districts: districtsList,
    categories: stars,
    efficiency_reviews: efficiencyReviews,
    processed: under("processed/stars/", files).map(toEntry).sort(byName),
    prr_transportation_zip: prrZip || null,
    readme:
      under("raw/stars/", files).find((p) => p.endsWith("README.md")) || null,
  };

  // ---------- Write all manifests ----------
  const manifests = {
    finance,
    enrollment,
    staffing,
    assessment,
    sqss,
    fiscal,
    odata,
    "public-records": publicRecords,
    transportation,
  };

  for (const [name, data] of Object.entries(manifests)) {
    const dst = `${OUT_DIR}/${name}.json`;
    await writeFile(dst, JSON.stringify(data));
    const size = JSON.stringify(data).length;
    console.log(
      `[build-data-manifest] ${name}.json (${(size / 1024).toFixed(1)} KB)`,
    );
  }

  // Top-level counts for the landing page.
  const counts = {
    sps_budgets: finance.sps_budgets.length,
    f195_raw: finance.f195_raw.length,
    f196_raw: finance.f196_raw.length,
    f195_processed: finance.f195_processed.length,
    f196_processed: finance.f196_processed.length,
    domains: finance.domains.length,
    sps_p223_pdf: enrollment.sps_p223_pdf.length,
    ospi_p223_pdf: enrollment.ospi_p223_pdf.length,
    processed_monthly_csv: enrollment.processed_monthly_csv.length,
    s275_years: staffing.raw_s275.length,
    odata: odata.length,
    stars_districts: districtsList.length,
    stars_total:
      Object.values(stars).reduce((sum, byDistrict) => {
        for (const byYear of Object.values(byDistrict)) {
          for (const v of Object.values(byYear)) {
            sum += typeof v === "string" ? 1 : Object.keys(v).length;
          }
        }
        return sum;
      }, 0) + efficiencyReviews.length,
    public_records: publicRecords.length,
    sqss: sqss.raw.length + sqss.processed.length,
    fiscal_tables: fiscal.tables.length,
    fiscal_raw_files: fiscalRawSummary?.total_files ?? 0,
    fiscal_raw_bytes: fiscalRawSummary?.total_bytes ?? 0,
  };
  await writeFile(`${OUT_DIR}/counts.json`, JSON.stringify(counts));
  console.log(`[build-data-manifest] counts.json`);
}

main().catch((err) => {
  console.error("[build-data-manifest] failed:", err);
  process.exit(1);
});
