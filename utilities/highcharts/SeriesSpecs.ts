// Declarative description of the series a budget/actuals-style column chart
// renders. The chart machinery is N-series: it maps an ordered list of
// SeriesSpecs to Highcharts series, deriving the nested-overlay styling
// (pointPadding, data-label offsets) from list position so adding or
// dropping a series never needs per-series constants.

export type SeriesRole = "budget" | "revised" | "actuals";

export type SeriesSpec = {
  // Highcharts series id AND JSON-connector seriesId.
  id: string;
  role: SeriesRole;
  // Display name in legends/tooltips.
  label: string;
  // Matches the data_type value pivoted into column names by
  // toChartableDataset (`<metricColumn>[_<facet>]_<columnSuffix>`).
  columnSuffix: string;
  // CSS palette index (styledMode) -- colors live in highcharts-base.scss.
  colorIndex: number;
};

export const BUDGET_SERIES: SeriesSpec = {
  id: "budget",
  role: "budget",
  label: "Budget",
  columnSuffix: "budget",
  colorIndex: 2,
};

export const REVISED_SERIES: SeriesSpec = {
  id: "revised",
  role: "revised",
  label: "Revised Budget",
  columnSuffix: "revised",
  colorIndex: 3,
};

export const ACTUALS_SERIES: SeriesSpec = {
  id: "actuals",
  role: "actuals",
  label: "Actuals",
  columnSuffix: "actuals",
  colorIndex: 1,
};

// Canonical back-to-front render order: widest bar first.
export const BUDGET_ACTUALS_SERIES = [BUDGET_SERIES, ACTUALS_SERIES];
export const BUDGET_REVISED_ACTUALS_SERIES = [
  BUDGET_SERIES,
  REVISED_SERIES,
  ACTUALS_SERIES,
];

// Every column suffix a chartable frame can carry, for bounds scans.
export const SERIES_COLUMN_SUFFIXES = ["actuals", "budget", "revised"] as const;

// Column name for one series of a metric.
export function seriesColumnName(
  metricColumn: string,
  facet: string | number | undefined,
  columnSuffix: string,
) {
  // Non-falsy check: facet codes can be the literal number 0 (e.g. an
  // unassigned ms_assignment bucket), which a `truthy` check would
  // collapse into an empty realFacet and break the column lookup.
  const realFacet = facet != null && facet !== "" ? `_${facet}` : "";
  return `${metricColumn}${realFacet}_${columnSuffix}`;
}

// The subset of the arquero ColumnTable surface filterSpecsWithData needs.
// Kept minimal so tests can pass duck-typed stubs (real arquero is mocked
// out under jest).
export type ColumnLookup = {
  column: (name: string) => unknown;
  array: (name: string) => ArrayLike<unknown>;
};

// Keeps a spec only if its column exists in df AND holds at least one
// finite value. Presence alone isn't enough: the vitals join_full + pivot
// mints all-null `<metric>_revised` columns for metrics that have no
// revised data (staffing FTE, enrollment, ...), and pctcomp/pctfte
// normalization turns revised values into NaN. Without a frame to inspect,
// the declared specs pass through unchanged.
export function filterSpecsWithData(
  df: ColumnLookup | undefined,
  metricColumn: string,
  facet: string | number | undefined,
  specs: Array<SeriesSpec>,
): Array<SeriesSpec> {
  if (!df) {
    return specs;
  }
  return specs.filter((spec) => {
    const name = seriesColumnName(metricColumn, facet, spec.columnSuffix);
    if (!df.column(name)) {
      return false;
    }
    return Array.from(df.array(name)).some((v) => Number.isFinite(v as number));
  });
}

// Nested-overlay bar width tier: the back bar is widest (padding 0) and
// tiers spread evenly toward the front. A two-series chart yields exactly
// the historical 0 / 0.26 pair. Three or more spread to a wider 0.32
// endpoint: at typical cell sizes (~19px per year) an even 0..0.26 spread
// leaves the middle bar all but occluding the back bar, while 0.32 keeps a
// visible ~2.5px rim around every tier.
export function seriesPointPadding(index: number, count: number) {
  if (count < 2) {
    return 0;
  }
  const end = count === 2 ? 0.26 : 0.32;
  return (end * index) / (count - 1);
}

// Vertical offset stacking the per-bar data labels so they don't overlap;
// tier 0 (back bar) uses the Highcharts default position.
export function seriesDataLabelOffset(index: number) {
  return 30 * index;
}
