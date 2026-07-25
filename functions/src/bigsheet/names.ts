// Naming vocabulary for the bigsheet SQL generator.
//
// Every output column is a clean snake_case identifier ([a-z][a-z0-9_]*)
// carrying a data-source family prefix (enroll_, spend_, staff_, asmt_,
// sqss_, map_hc_, map_nonhc_, bex_, bldg_, income_, churn_). The sources
// refresh on independent cadences (report-card releases, F-196 closes, S-275
// snapshots, SPS one-off files), so the prefix tells a consumer which columns
// update together. See NAMING.md for the full design.
//
// Raw source labels (test administrations, student groups, …) are mapped to
// canonical slugs. Distinct raw spellings of the same population ("Non
// Migrant"/"Non-Migrant", "Hispanic/ Latino …"/"Hispanic/Latino …") map to
// ONE slug on purpose: the pivot generator merges them into a single column,
// fixing an upstream data-quality wart instead of reproducing it.

/** Generic slug: lowercase, non-alphanumeric runs -> "_", trimmed; "x" prefix
 * for a leading digit. Fallback for values with no canonical entry. */
export function slugify(raw: string | number): string {
  let s = String(raw).toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  if (s.length === 0) s = 'blank';
  if (s[0] >= '0' && s[0] <= '9') s = 'x' + s;
  return s;
}

/** Legacy mechanical sanitizer. The bigsheet_inputs external tables were
 * created with column names produced by the identical Python function in
 * data-tools scripts/bigsheet_inputs_lib.py, so the BEX column mapping in
 * columns.ts keys off these names. Keep byte-identical to that copy. */
export function sanitizeName(raw: string): string {
  let s = String(raw).replace(/[^A-Za-z0-9_]+/g, '_');
  if (s.length > 0 && s[0] >= '0' && s[0] <= '9') {
    s = '_' + s;
  }
  return s;
}

// ---- Student groups ---------------------------------------------------------
// Canonical slugs match the rc_enrollment column names where one exists
// (low_income, students_with_disabilities, …) so the same population carries
// the same identifier in enroll_, asmt_ and sqss_ columns. Multiple raw
// spellings intentionally share a slug (variants drifted across report-card
// years). slugify() already unifies space/hyphen variants; entries here handle
// everything it can't.
const STUDENT_GROUP_SLUGS = new Map<string, string>([
  ['All Students', 'all'],
  ['Black/ African American', 'black_african_american'],
  ['Black/African American', 'black_african_american'],
  ['Hispanic/ Latino of any race(s)', 'hispanic_latino_of_any_race'],
  ['Hispanic/Latino of any race(s)', 'hispanic_latino_of_any_race'],
  ['American Indian/ Alaskan Native', 'american_indian_alaskan_native'],
  ['American Indian/Alaskan Native', 'american_indian_alaskan_native'],
  ['Native Hawaiian/ Other Pacific Islander', 'native_hawaiian_other_pacific'],
  ['Native Hawaiian/Other Pacific Islander', 'native_hawaiian_other_pacific'],
  // The complement of students_with_disabilities appears as both phrasings.
  ['Non-Students with Disabilities', 'students_without_disabilities'],
  ['Students without Disabilities', 'students_without_disabilities'],
]);

export function studentGroupSlug(raw: string): string {
  return STUDENT_GROUP_SLUGS.get(raw) ?? slugify(raw);
}

/** Column-order position for student groups: identity first, then race,
 * program/status pairs, unknown last; novel groups sort after all known ones
 * alphabetically. */
export const STUDENT_GROUP_ORDER: string[] = [
  'all', 'female', 'male', 'gender_x',
  'american_indian_alaskan_native', 'asian', 'black_african_american',
  'hispanic_latino_of_any_race', 'native_hawaiian_other_pacific',
  'two_or_more_races', 'white',
  'english_language_learners', 'non_english_language_learners',
  'highly_capable', 'non_highly_capable',
  'students_with_disabilities', 'students_without_disabilities',
  'section_504', 'non_section_504',
  'low_income', 'non_low_income',
  'homeless', 'non_homeless',
  'foster_care', 'non_foster_care',
  'migrant', 'non_migrant',
  'military_parent', 'non_military_parent',
  'mobile', 'non_mobile',
  'unknown',
];

// ---- Assessment administrations / subjects ----------------------------------
export const TEST_ADMIN_ORDER: string[] =
    ['sbac', 'wcas', 'eoc', 'msphspe', 'aim', 'elpa', 'widaacc'];
export const TEST_SUBJECT_ORDER: string[] = ['ela', 'math', 'science', 'biology'];

// ---- MAP --------------------------------------------------------------------
const MAP_SUBJECT_SLUGS = new Map<string, string>([
  ['Mathematics', 'math'],
  ['Reading', 'reading'],
]);
export function mapSubjectSlug(raw: string): string {
  return MAP_SUBJECT_SLUGS.get(raw) ?? slugify(raw);
}
export const MAP_SUBJECT_ORDER = ['math', 'reading'];
export const SEASON_ORDER = ['fall', 'winter', 'spring'];

// ---- SQSS -------------------------------------------------------------------
// Measure whitelist; raw label -> slug. Rows with any other measure are
// excluded from the pivot (matches the original mart, which mapped exactly
// these three and dropped the rest).
export const SQSS_MEASURES = new Map<string, string>([
  ['Regular Attendance', 'attendance'],
  ['Dual Credit', 'dual_credit'],
  ['Ninth Grade on Track', 'ninth_grade_on_track'],
]);
export const SQSS_MEASURE_ORDER = ['attendance', 'dual_credit', 'ninth_grade_on_track'];

/** Comparator position: index in `order`, else past-the-end and alphabetical
 * among unknowns. */
export function orderIndex(order: string[], slug: string): number {
  const i = order.indexOf(slug);
  return i === -1 ? order.length : i;
}

export function compareBySlugOrder(order: string[]) {
  return (a: string, b: string): number => {
    const ia = orderIndex(order, a);
    const ib = orderIndex(order, b);
    if (ia !== ib) return ia - ib;
    return a < b ? -1 : a > b ? 1 : 0;
  };
}

/** Every output column must be unique; a collision means two semantically
 * different source values slugged to the same name — fail loudly so the
 * vocabulary gets a proper entry instead of silently merging strangers. */
export function assertUniqueNames(names: string[]): void {
  const seen = new Set<string>();
  for (const n of names) {
    if (seen.has(n)) {
      throw new Error(`bigsheet: duplicate output column name "${n}"`);
    }
    seen.add(n);
  }
}
