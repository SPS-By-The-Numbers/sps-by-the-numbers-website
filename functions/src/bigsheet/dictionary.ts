// Data dictionary for the bigsheet output, generated from the SAME column
// plan that renders the SQL (assemble.ts), so it cannot drift from the data.
// One entry per output column: name, source family (columns that refresh
// together), source label, and derivation/provenance notes.

import { BigsheetCombos, buildBigsheetPlan } from './assemble';
import { SOURCE_LABELS } from './columns';

export interface DictionaryEntry {
  name: string;
  /** family key; columns sharing it come from one source and update together */
  source: string;
  sourceLabel: string;
  doc: string;
}

/** Grain note shared by every column: the sheet is one row per
 * (class_of, school_code), district totals carried as NULL school_code. */
export const GRAIN =
  'One row per (class_of, school_code); district-total rows have NULL school_code.';

export function buildDictionary(
    ccddd: number, combos: BigsheetCombos): DictionaryEntry[] {
  return buildBigsheetPlan(ccddd, combos).columns.map((c) => ({
    name: c.name,
    source: c.source,
    sourceLabel: SOURCE_LABELS[c.source],
    doc: c.doc,
  }));
}

/** Render the dictionary as CSV (name,source,description) for publishing next
 * to the data download. */
export function dictionaryCsv(entries: DictionaryEntry[]): string {
  const esc = (s: string) =>
    /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  const rows = entries.map((e) => [e.name, e.source, e.sourceLabel, e.doc]
      .map(esc).join(','));
  return ['name,source,source_label,description', ...rows].join('\r\n');
}
