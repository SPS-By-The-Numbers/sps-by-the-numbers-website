# Plan: load only the datasets a dashboard needs

`EnsureDistrictData` blocks every finance dashboard on all eleven district
datasets. This plan makes the blocking load the subset a dashboard actually
reads, without giving up the cache that makes tab-to-tab switching instant.

## What it costs today

`DistrictData.loadFromGcs` fetches eleven datasets in one `Promise.all` and the
constructor takes all eleven frames. `EnsureDistrictData` renders `Loading…`
until `ccddd in districtDataMap`, so nothing paints until the slowest finishes.

Measured over the wire for Seattle (17001), compressed AVRO:

| dataset | bytes |
| --- | ---: |
| gf_expenditures | 6,133,051 |
| assessment | 5,224,948 |
| sqss | 4,316,181 |
| s275_summary | 1,831,418 |
| actuals_items | 255,739 |
| enrollment | 234,520 |
| budget_items | 62,996 |
| gf_revenues | 28,720 |
| budgeted_fte | 23,439 |
| fundedEnrollment | 12,674 |
| budgetary_comparison | 5,509 |
| **total** | **~18.1 MB** |

Three datasets are 83% of it. What each dashboard needs, tracing every
`DistrictData` accessor through to the frames it touches:

| dashboard | needs | unused today |
| --- | --- | ---: |
| Enrollment | enrollment | ~17.9 MB |
| Assessments | assessment | ~12.9 MB |
| Vitals / Revenues / Correlations | budget_items, budgeted_fte, s275_summary, gf_expenditure, gf_revenue, actuals_items, fundedEnrollment | ~9.5 MB |
| Money Flows | enrollment, gf_expenditure, gf_revenue | ~11.9 MB |
| Staffing | + budget_items, budgeted_fte, s275_summary | ~9.5 MB |

Nothing outside Assessments reads `assessment`; nothing reads `sqss` at all
through `DistrictData`. That is 9.5 MB every dashboard pays and no dashboard
except Assessments spends.

## What must not regress

1. **Tab-to-tab speed.** `DistrictDataProvider` sits in `app/finance/layout.tsx`,
   so it stays mounted across finance route changes and `districtDataMap`
   survives them. Any refactor has to keep a cache at that level, or switching
   tabs starts refetching.
2. **Multi-district comparison.** `allSettings` can hold several districts; the
   cache is keyed by `ccddd` and must stay that way.
3. **Graceful degrade.** `budgeted_fte` and `budgetary_comparison` fall back to
   empty, correctly-shaped frames when the fetch fails, so one missing dataset
   cannot break every dashboard. That is per-dataset behavior and must survive.
4. **Settings-driven reloads.** Changing district in the drawer re-runs
   `loadCcddd`; the in-flight dedupe in `previouslyLoadedCcddds` must not
   regress into double fetches.

## The shape of the change

Three pieces, each independently shippable.

### 1. A dataset-level cache, keyed `(ccddd, dataset)`

Replace `districtDataMap: {ccddd -> DistrictData}` with a store of
**promises**, not values:

```ts
Map<`${Ccddd}:${DatasetName}`, Promise<ColumnTable>>
```

Promise-keyed matters: two dashboards asking for `gf_expenditures` while it is
in flight share one request, and an already-resolved entry is effectively free.
This subsumes what `previouslyLoadedCcddds` does today, so that set goes away.

Per-dataset fallbacks (the empty frames) move next to the fetch, so each entry
resolves to a usable frame either way.

### 2. `DistrictData` becomes a view, not an owner

Today the constructor takes eleven positional frames — adding or removing one
touches every call site. Change it to take a partial bundle:

```ts
type DatasetBundle = Partial<Record<DatasetName, ColumnTable>>;
new DistrictData(bundle)
```

Accessors read from the bundle and **throw a named error** when a dataset was
not requested:

> `DistrictData.expenditures() needs "gf_expenditures", which this dashboard did not declare.`

That turns a wrong declaration into an immediate, self-explaining failure
instead of a confusing empty chart. Worth keeping loud in production too — an
empty chart is a worse bug than a clear crash.

### 3. Dashboards declare what they need

`EnsureDistrictData` gains a `datasets: DatasetName[]` prop and awaits only
those. Dashboards should not hand-list them, because most reach the data
indirectly: only Flow touches `DistrictData` directly, and everything else goes
through **`ChartableMetrics`** or **`ChartableVitals`**. Those two modules are
the only indirect callers, which is what makes this tractable.

So export the requirement from where the dependency lives:

```ts
// utilities/ChartableVitals.ts
export const VITALS_DATASETS = [
  "budget_items", "budgeted_fte", "s275_summary",
  "gf_expenditures", "gf_revenues", "actuals_items", "fundedEnrollment",
] as const;
```

and let a dashboard compose:

```ts
datasets={[...VITALS_DATASETS, "assessment"]}
```

If a helper later reads a new frame, the constant moves with it and every
dashboard using that helper picks it up — the declaration cannot drift from the
code that depends on it.

### 4. Prefetch the rest when idle

Declaring a subset makes first paint cheap but would make the *first* switch to
a heavier tab slower than today. So after the blocking set resolves, kick off
the remaining datasets for the current district at idle
(`requestIdleCallback`, `void`-ed, never awaited). They land in the same cache,
so the next tab finds them warm.

Net effect: first paint waits on what this dashboard needs; moving between tabs
usually waits on nothing.

## Suggested order

1. **Cache + bundle, no behavior change.** Introduce the promise cache and the
   `DatasetBundle` constructor, with `EnsureDistrictData` still requesting all
   eleven. Nothing gets faster; everything keeps working. Ship it.
2. **Add `datasets` and declare per dashboard.** Start with Enrollment and
   Assessments — the biggest wins and the simplest dependency sets — then the
   `ChartableVitals` group. Verify each tab still renders before moving on.
3. **Add idle prefetch.** Measure tab-switch time before and after.
4. **Drop `sqss` from `DistrictData` entirely** if the audit holds that nothing
   reads it (4.3 MB). Check the SQSS page first — it may fetch separately.

Steps 1 and 2 are independently valuable; if step 3 proves unnecessary, skip it.

## Risks

- **A missed indirect reader.** The audit found two chokepoints, but it was a
  static scan of `.method(` calls. A dynamic or re-exported call would be
  missed. The throwing accessor in §2 is the mitigation: it fails loudly at the
  first wrong declaration rather than silently drawing nothing.
- **Comparison mode.** With several districts in `allSettings`, the declared set
  is fetched per district. Fine, but the loading gate has to check every
  (ccddd, dataset) pair, not just every ccddd.
- **Empty-frame fallbacks becoming load-bearing.** Once datasets are optional,
  it gets tempting to let a missing declaration fall back to an empty frame.
  Do not — that is the silent-wrong-chart failure mode. Fallbacks stay only for
  datasets that genuinely may not exist for a district.
- **`sqss` may have a non-`DistrictData` reader.** Confirm before removing.

## Worth deciding first

- Should the throwing accessor throw in production, or warn and return empty?
  (Recommendation: throw. A blank chart with no explanation is the bug we are
  trying to avoid creating.)
- Is comparison mode across districts still used? If not, the cache key
  simplifies and the loading gate gets easier.
- Salaries currently bypasses this system entirely and fetches `s275_salaries`
  itself. Once `datasets` exists it could join, using the same cache — worth
  doing for consistency, though it gains little on its own.
