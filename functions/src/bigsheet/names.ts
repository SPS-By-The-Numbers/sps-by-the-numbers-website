// Column-name helpers for the bigsheet SQL generator.
//
// MIGRATION POLICY (legacy names, mechanically sanitized). The Python
// marts/bigsheet.py builds pivot column names by rotating the pivot tuple left
// (value moves to the back), joining with "_", and keeps raw headers with
// spaces/slashes. AVRO/BigQuery field names must match [A-Za-z_][A-Za-z0-9_]*,
// so every generated name is passed through `sanitizeName`. The golden-diff
// harness applies the SAME `sanitizeName` to the golden headers, so this file
// and the harness MUST agree byte-for-byte (see scripts/bigsheet_inputs_lib.py
// for the identical Python copy used to name the external-table columns).

/**
 * Sanitize an arbitrary header into a valid SQL/AVRO identifier: every run of
 * non-[A-Za-z0-9_] characters becomes a single "_"; a leading digit is
 * prefixed with "_". No trailing-underscore stripping (kept faithful to the
 * golden headers, which the harness sanitizes the same way).
 */
export function sanitizeName(raw: string): string {
  let s = String(raw).replace(/[^A-Za-z0-9_]+/g, '_');
  if (s.length > 0 && s[0] >= '0' && s[0] <= '9') {
    s = '_' + s;
  }
  return s;
}

/**
 * Build a pivot output column name the way bigsheet.py does: rotate the tuple
 * (value, ...levels) left to (...levels, value), drop empty parts, join with
 * "_", prepend the family prefix, then sanitize.
 *
 * @param prefix "hc_" | "nonhc_" | "" (applied before the joined parts)
 * @param levels the pivot combo values, in pivot `columns=[...]` order
 * @param valueLabel the pandas `values=` label (e.g. "Average of RITScore")
 */
export function pivotColumnName(
    prefix: string, levels: Array<string | number>,
    valueLabel: string): string {
  const parts = [...levels, valueLabel]
      .map((p) => (p === null || p === undefined ? '' : String(p)))
      .filter((p) => p !== '');
  return sanitizeName(prefix + parts.join('_'));
}

/**
 * Sanitize a list of raw names to unique identifiers, disambiguating genuine
 * collisions deterministically: the first occurrence (in list order) keeps the
 * base identifier; each later collider gets the lowest free `_<k>` suffix
 * (k>=2). Returns the parallel `names` array plus the list of disambiguated
 * `[raw, assignedName]` collisions.
 *
 * WHY (not fail-on-collision): the SQSS source genuinely carries two spellings
 * of the same group, "Non Migrant" and "Non-Migrant", which sanitize to one
 * identifier. The golden keeps both as distinct columns, so the migration must
 * too. BigQuery also requires unique column names within a SELECT. Because the
 * generator's pivot column order equals the golden's column order (full-tuple
 * first-appearance), applying this function in both places assigns identical
 * names, so values still line up. Collisions are logged by callers.
 */
export function sanitizeUnique(
    rawNames: string[]): { names: string[]; collisions: Array<[string, string]> } {
  const used = new Set<string>();
  const names: string[] = [];
  const collisions: Array<[string, string]> = [];
  for (const raw of rawNames) {
    let s = sanitizeName(raw);
    if (used.has(s)) {
      const base = s;
      let k = 2;
      while (used.has(`${base}_${k}`)) k++;
      s = `${base}_${k}`;
      collisions.push([raw, s]);
    }
    used.add(s);
    names.push(s);
  }
  return { names, collisions };
}
