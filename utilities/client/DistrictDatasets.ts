// Per-dataset fetching and caching for the finance dashboards.
//
// The district data is eleven independent datasets, but they used to be
// fetched as one all-or-nothing batch, so every dashboard blocked on ~18 MB
// (for Seattle) regardless of what it read. Assessment and SQSS alone are
// 9.5 MB that only the Assessments dashboard has any use for.
//
// Caching here rather than in the provider, and caching PROMISES rather than
// resolved tables, buys three things:
//   * two dashboards asking for the same dataset while it is in flight share
//     one request instead of racing,
//   * a dataset already loaded for another tab resolves immediately, which is
//     what keeps tab-to-tab switching fast,
//   * the "have we started this yet" bookkeeping is the cache itself, rather
//     than a second set that can drift out of sync with it.
//
// Normalization (synthetic activities, derived staff-class columns) happens
// here too, so it runs once per district-dataset instead of once per
// DistrictData, and every consumer sees the same shape.

import * as aq from "arquero";

import { fetchDataset } from "utilities/client/FetchData";

import type { ColumnTable } from "arquero";

export const DATASET_NAMES = [
  "enrollment",
  "fundedEnrollment",
  "assessment",
  "sqss",
  "gf_expenditures",
  "gf_revenues",
  "budget_items",
  "actuals_items",
  "s275_summary",
  "budgeted_fte",
  "budgetary_comparison",
] as const;

export type DatasetName = (typeof DATASET_NAMES)[number];

/** Datasets a dashboard asked for. Anything not requested is absent. */
export type DatasetBundle = Partial<Record<DatasetName, ColumnTable>>;

// Datasets that may legitimately not exist for a district (newer Cloud
// Function endpoints, or a district with no such filing). These resolve to an
// empty, correctly-shaped frame so one missing dataset cannot break a whole
// dashboard -- the charts that read them simply have no series.
//
// This is ONLY for datasets that may genuinely be absent. A dataset a
// dashboard forgot to declare must fail loudly instead (see DistrictData),
// because a silently empty chart is a worse bug than a crash.
const EMPTY_FALLBACKS: Partial<Record<DatasetName, () => ColumnTable>> = {
  budgeted_fte: () =>
    aq.table({
      class_of: [],
      program_code: [],
      activity_code: [],
      duty_root_code: [],
      fte: [],
    }),
  budgetary_comparison: () =>
    aq.table({
      class_of: [],
      fund: [],
      section: [],
      item_code: [],
      amount: [],
    }),
};

type Normalizer = (df: ColumnTable) => ColumnTable;

// Registered by DistrictData, which owns the domain rules (synthetic activity
// codes, duty-root-derived staff class). Kept as a registration rather than an
// import so this module does not depend on DistrictData and create a cycle.
const normalizers = new Map<DatasetName, Normalizer>();

export function registerNormalizer(name: DatasetName, fn: Normalizer) {
  normalizers.set(name, fn);
}

// How long to wait for an idle moment before prefetching anyway.
const PREFETCH_DEADLINE_MS = 2000;

const cache = new Map<string, Promise<ColumnTable>>();

function key(ccddd: number, name: DatasetName) {
  return `${ccddd}:${name}`;
}

/** Fetch one dataset, or hand back the in-flight/completed request for it. */
export function loadDataset(
  ccddd: number,
  name: DatasetName,
): Promise<ColumnTable> {
  const cacheKey = key(ccddd, name);
  const hit = cache.get(cacheKey);
  if (hit) return hit;

  const pending = fetchDataset(ccddd, name)
    .catch((err) => {
      const fallback = EMPTY_FALLBACKS[name];
      if (!fallback) throw err;
      console.warn(
        `[DistrictDatasets] ${name} unavailable for ${ccddd}; ` +
          `continuing with an empty frame.`,
        err,
      );
      return fallback();
    })
    .then((df) => normalizers.get(name)?.(df) ?? df);

  // A failed fetch of a dataset with no fallback must not poison the cache,
  // or the dashboard can never recover without a reload.
  pending.catch(() => {
    if (cache.get(cacheKey) === pending) cache.delete(cacheKey);
  });

  cache.set(cacheKey, pending);
  return pending;
}

/** Fetch exactly the datasets asked for, in parallel. */
export async function loadDatasets(
  ccddd: number,
  names: readonly DatasetName[],
): Promise<DatasetBundle> {
  const wanted = [...new Set(names)];
  const frames = await Promise.all(wanted.map((n) => loadDataset(ccddd, n)));
  const bundle: DatasetBundle = {};
  wanted.forEach((n, i) => {
    bundle[n] = frames[i];
  });
  return bundle;
}

/**
 * Warm the datasets this district has not loaded yet, without blocking.
 *
 * Requesting only what a dashboard needs makes its first paint cheap, but
 * would make the first switch to a heavier tab slower than loading everything
 * up front did. Filling the rest in once the page is idle keeps that switch
 * warm; failures are ignored because nothing is waiting on them.
 */
export function prefetchRemaining(
  ccddd: number,
  exclude: readonly DatasetName[],
) {
  const skip = new Set(exclude);
  const rest = DATASET_NAMES.filter(
    (n) => !skip.has(n) && !cache.has(key(ccddd, n)),
  );
  if (rest.length === 0) return;

  const run = () => {
    for (const name of rest) loadDataset(ccddd, name).catch(() => {});
  };

  // The timeout is not optional: requestIdleCallback with no deadline can be
  // deferred indefinitely on a page that never goes idle (the Money Flows
  // Sankey is one), and the prefetch would then simply never happen.
  const idle = (
    globalThis as {
      requestIdleCallback?: (
        cb: () => void,
        opts?: { timeout: number },
      ) => void;
    }
  ).requestIdleCallback;
  if (idle) idle(run, { timeout: PREFETCH_DEADLINE_MS });
  else setTimeout(run, PREFETCH_DEADLINE_MS);
}

/** Test seam: forget everything cached. */
export function resetDatasetCacheForTest() {
  cache.clear();
}
