#!/usr/bin/env node
// Builds fiscal_corpus_index.json — the compact stand-in for the OSPI fiscal
// PDF corpus under gs://sps-btn-data-all-data/raw/fiscal/. The corpus is far
// too large (~167k files, ~140 GB) to carry in all_data.txt file-by-file, so
// this script folds it into what the /data/fiscal page needs to link every
// document: per-subcorpus and per-year roll-ups, an org (district / ESD /
// college / state agency) directory, and a per-org-per-year document index.
//
// The index stays small because both halves of a path repeat. Document names
// repeat across orgs (all ~13k org-year document sets collapse to a couple
// hundred distinct sets), and directory names repeat across years, so an
// org-year is stored as a pair of integers into shared `sets` and `dirs`
// vocabularies. Directories are interned verbatim rather than rebuilt from the
// org name: OSPI renames orgs between years (17001 is both
// "seattle_school_district_no_1" and "seattle_public_schools"), so a
// reconstructed slug would 404.
//
// To refresh:
//   gsutil du gs://sps-btn-data-all-data/raw/fiscal/ > fiscal_du.txt
//   node scripts/build-fiscal-corpus-index.mjs fiscal_du.txt
//   git add fiscal_corpus_index.json && git commit
// (fiscal_du.txt is a ~167k-line intermediate; don't commit it.)

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT = resolve(ROOT, "fiscal_corpus_index.json");
const GS_PREFIX = "gs://sps-btn-data-all-data/raw/fiscal/";

const input = process.argv[2];
if (!input) {
  console.error(
    "usage: build-fiscal-corpus-index.mjs <fiscal_du.txt>\n" +
      "  where fiscal_du.txt = `gsutil du gs://sps-btn-data-all-data/raw/fiscal/`",
  );
  process.exit(1);
}

const YEAR_RE = /^\d{4}-\d{4}$/;
// Org directories are "{code}_{slug}": 5-digit CCDDD for districts, colleges
// and state agencies; 3-digit for the ESDs themselves.
const ORG_DIR_RE = /^(\d{3,5})_(.+)$/;
const SMALL_WORDS = new Set(["of", "the", "and"]);
const ACRONYMS = new Set(["esd"]);

function titleCase(slug) {
  return slug
    .split("_")
    .map((w, i) => {
      if (ACRONYMS.has(w)) return w.toUpperCase();
      if (i && SMALL_WORDS.has(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

const raw = await readFile(resolve(process.cwd(), input), "utf8");

const subcorpora = new Map(); // dir -> {files, bytes}
const fiscalYears = new Map(); // year -> {files, bytes} (the F-195/F-196 packets)
let totalFiles = 0;
let totalBytes = 0;

// Accumulated as raw lists, then collapsed into shared vocabularies below:
//   docs[orgCode][kind][year] = {dir, files: [...]}
//   flat[subcorpus][year]     = [...]
const orgs = new Map(); // code -> {code, name, latest, esd}
const docs = new Map();
const flat = new Map();
const unmatched = new Map(); // path shape -> count, reported at the end

function bump(map, key) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function pushDoc(code, kind, year, dir, file) {
  let byKind = docs.get(code);
  if (!byKind) docs.set(code, (byKind = new Map()));
  let byYear = byKind.get(kind);
  if (!byYear) byKind.set(kind, (byYear = new Map()));
  let entry = byYear.get(year);
  if (!entry) byYear.set(year, (entry = { dir, files: [] }));
  entry.files.push(file);
}

function pushFlat(sub, year, file) {
  let byYear = flat.get(sub);
  if (!byYear) flat.set(sub, (byYear = new Map()));
  let files = byYear.get(year);
  if (!files) byYear.set(year, (files = []));
  files.push(file);
}

// An org's display name comes from its most recent directory slug, so a
// renamed district shows under the name OSPI uses today.
function recordOrg(code, slug, year, esd) {
  let org = orgs.get(code);
  if (!org) orgs.set(code, (org = { code, name: "", latest: "", esd: null }));
  if (year >= org.latest) {
    org.latest = year;
    org.name = titleCase(slug);
  }
  if (esd && (!org.esd || year >= org.esd.year)) org.esd = esd;
}

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
  const parts = rel.split("/");
  if (parts.length < 2) continue;
  const sub = parts[0];

  totalFiles += 1;
  totalBytes += bytes;

  const s = subcorpora.get(sub) ?? { files: 0, bytes: 0 };
  s.files += 1;
  s.bytes += bytes;
  subcorpora.set(sub, s);

  const year = parts[1];
  if (!YEAR_RE.test(year)) {
    bump(unmatched, `${sub}/<not-a-year>`);
    continue;
  }
  const rest = parts.slice(2);
  const file = rest[rest.length - 1];
  const dir = rest.slice(0, -1).join("/");

  if (sub === "fiscal") {
    // fiscal/<year>/<code>_<slug>/<packet>.pdf
    const y = fiscalYears.get(year) ?? { files: 0, bytes: 0 };
    y.files += 1;
    y.bytes += bytes;
    fiscalYears.set(year, y);

    if (rest.length !== 2) {
      bump(unmatched, "fiscal");
      continue;
    }
    // The statewide F-195/F-196 rollups sit beside the districts in an
    // "OSPI_state_summary" directory with no code; file them under the 00000
    // code OSPI uses for the state summary elsewhere in the corpus.
    const org = rest[0].match(ORG_DIR_RE) ?? [, "00000", rest[0]];
    recordOrg(org[1], org[2], year, null);
    pushDoc(org[1], "fiscal", year, dir, file);
  } else if (sub === "apportionment") {
    // apportionment/<year>/<org_type>/<code>_<slug>/<report>.pdf, with an
    // extra <esd>/<member> cascade under the esd/ org type.
    const orgType = rest[0];
    if (orgType === "esd" && rest.length === 4) {
      const parent = rest[1].match(ORG_DIR_RE);
      const org = rest[2].match(ORG_DIR_RE);
      if (!parent || !org) {
        bump(unmatched, "apportionment/esd");
        continue;
      }
      recordOrg(org[1], org[2], year, {
        code: parent[1],
        name: titleCase(parent[2]),
        year,
      });
      pushDoc(org[1], "esd", year, dir, file);
    } else if (rest.length === 3) {
      const org = rest[1].match(ORG_DIR_RE);
      if (!org) {
        bump(unmatched, `apportionment/${orgType}`);
        continue;
      }
      recordOrg(org[1], org[2], year, null);
      pushDoc(org[1], orgType, year, dir, file);
    } else {
      bump(unmatched, `apportionment/${orgType}`);
    }
  } else if (rest.length === 1) {
    // The statewide subcorpora are flat: <sub>/<year>/<file>.
    pushFlat(sub, year, file);
  } else {
    bump(unmatched, sub);
  }
}

// ---- Collapse into shared `sets` and `dirs` vocabularies ------------------
const sets = [];
const setIds = new Map();
const dirs = [];
const dirIds = new Map();

function internSet(files) {
  files.sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  // NUL separator: document names can contain spaces, a NUL cannot.
  const sig = files.join("\u0000");
  let id = setIds.get(sig);
  if (id === undefined) {
    id = sets.length;
    sets.push(files);
    setIds.set(sig, id);
  }
  return id;
}

function internDir(dir) {
  let id = dirIds.get(dir);
  if (id === undefined) {
    id = dirs.length;
    dirs.push(dir);
    dirIds.set(dir, id);
  }
  return id;
}

const docsOut = {};
for (const [code, byKind] of docs) {
  const kinds = {};
  for (const [kind, byYear] of byKind) {
    const years = {};
    for (const [year, entry] of byYear) {
      years[year] = [internSet(entry.files), internDir(entry.dir)];
    }
    kinds[kind] = years;
  }
  docsOut[code] = kinds;
}

const flatOut = {};
for (const [sub, byYear] of flat) {
  const years = {};
  for (const [year, files] of byYear) years[year] = internSet(files);
  flatOut[sub] = years;
}

const index = {
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
  sets,
  dirs,
  orgs: Array.from(orgs.values())
    .map(({ code, name, esd }) => ({
      code,
      name,
      esd: esd ? { code: esd.code, name: esd.name } : null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name)),
  docs: docsOut,
  flat: flatOut,
};

await writeFile(OUT, JSON.stringify(index) + "\n");

if (unmatched.size) {
  console.warn(
    "[build-fiscal-corpus-index] unrecognized path shapes (not indexed): " +
      Array.from(unmatched.entries())
        .map(([k, n]) => `${k}=${n}`)
        .join(", "),
  );
}
console.log(
  `[build-fiscal-corpus-index] ${totalFiles.toLocaleString()} files, ` +
    `${(totalBytes / 1024 ** 3).toFixed(1)} GiB, ${orgs.size} orgs, ` +
    `${sets.length} document sets, ${dirs.length} directories ` +
    `-> fiscal_corpus_index.json`,
);
