// Shape of fiscal_corpus_index.json, the compact index over the OSPI fiscal
// PDF corpus (see scripts/build-fiscal-corpus-index.mjs). Document names and
// directory names are deduped into the `sets` and `dirs` vocabularies, so an
// org-year is a [setId, dirId] pair.

export const BUCKET_PREFIX =
  "https://storage.googleapis.com/sps-btn-data-all-data/";

export type FiscalOrg = {
  code: string;
  name: string;
  esd: { code: string; name: string } | null;
};

/** [index into corpus.sets, index into corpus.dirs] */
export type DocRef = [number, number];

export type FiscalCorpus = {
  generated: string;
  bucket_prefix: string;
  total_files: number;
  total_bytes: number;
  subcorpora: { dir: string; files: number; bytes: number }[];
  fiscal_years: { year: string; files: number; bytes: number }[];
  sets: string[][];
  dirs: string[];
  orgs: FiscalOrg[];
  /** docs[orgCode][kind][year] — kind is "fiscal" or an apportionment org type. */
  docs: Record<string, Record<string, Record<string, DocRef>>>;
  /** flat[subcorpus][year] — index into corpus.sets; these paths carry no org. */
  flat: Record<string, Record<string, number>>;
};

export function fmtBytes(bytes: number) {
  const gib = bytes / 1024 ** 3;
  if (gib >= 1) return `${gib.toFixed(1)} GiB`;
  const mib = bytes / 1024 ** 2;
  return `${mib.toFixed(0)} MiB`;
}
