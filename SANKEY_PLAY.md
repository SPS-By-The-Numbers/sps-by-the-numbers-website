# SANKEY_PLAY.md — Playbook: Revenues Dashboard + Expenditure Flow (Sankey) View

This is an execution playbook for **serial Claude sessions (Opus/Sonnet class)**.
Each session implements ONE numbered session below, verifies it, and updates the
Progress Log at the bottom of this file. Do not skip ahead; later sessions assume
earlier ones landed.

**How to use this file in a session:**
1. Read this whole file first.
2. Read ONLY the repo files listed in your session's "Files to read" — the
   "Ground Truth" section below already contains verified architecture facts
   (verified 2026-07-21 against this repo); do not re-explore broadly.
3. Implement, then run the session's Verification steps.
4. Update the Progress Log (status, date, deviations, anything the next session
   must know). Commit with a descriptive message.

**Model per session** (rationale in each session header):

| Session | Model |
|---|---|
| 1 — Revenue filter foundations | Sonnet |
| 2 — Revenues dashboard | Sonnet (Opus if budget allows) |
| 3 — Sankey compute engine | **Opus** |
| 4 — Expenditure Flow view | **Opus** |
| 5 — Tooltip deep links | Sonnet |
| 6 — Reconciliation & polish | **Opus** |

**Guardrails for all sessions:**
- `SANKEY_HANDOFF.md` (repo root) is background reading from a *different* repo's
  playground. Its algorithm and palette are correct; its integration details are
  superseded by THIS file. When they conflict, this file wins.
- Do not re-litigate the "Locked design decisions" section. If one is truly
  impossible, note it in the Progress Log and pick the closest alternative.
- Do not touch `functions/` — the backend pipeline is already complete.
- Do not modify existing dashboards' behavior except where a session explicitly
  says to (nav entries, small additive exports).
- Match existing code style (see neighboring files). Tests live alongside source
  as `*.test.ts`. Run `npm run test` and `npm run lint` before finishing.
- Untracked junk at repo root (`foo`, `data.csv`, `old/`, `*.swp` files, etc.) is
  unrelated — ignore it.

---

## Goal

1. **Revenues dashboard** at `app/finance/revenues/` — a peer of the
   expenditures dashboard, faceted by revenue category / revenue account /
   program, with its own filters and shareable URLs.
2. **Expenditure Flow view** at `app/finance/flow/` — a per-district Highcharts
   Sankey: Revenue Source → Program → Activity → (optional: Object → NCES →
   School), with:
   - (a) user-selectable optional levels (Object, NCES, School),
   - (b) filters at each level; filtered-out flow diverts into a gray
     "Filtered Out" band that continues to the rightmost column,
   - (c) a sticky tooltip on each band with **two deep links** — one per node on
     the band — opening the existing expenditures/revenues dashboards with that
     node's filter preselected.

---

## Ground Truth (verified against this repo, 2026-07-21)

### Data pipeline: ALREADY DONE — do not rebuild

- `functions/src/finance.ts` already registers dataset **`gf_revenues`**
  (`getRevenues` ~line 202, dispatch branch ~line 321) querying BigQuery table
  `sps-btn-data.safs_f19x.general_fund_revenues`, cached as AVRO in
  `gs://sps-by-the-numbers-public/cache/scratch/<ccddd>/<dataset>/…`.
- Revenue row columns (exactly): `data_type, school_year, class_of, fund_code,
  fund, revenue_code, revenue, category_code, category, program_code, program,
  amount`. `data_type` is `'actuals' | 'budget'`. `program_code = 0` with label
  `"[special] Unrestricted"` marks **fungible** accounts; nonzero means OSPI
  directs that account to that program.
- Expenditure row columns (exactly): `data_type, school_year, class_of,
  program_code, program, activity_code, activity, object_code, object,
  nces_code, nces, school_code, school, amount` (pre-aggregated by the query).
- `utilities/DistrictData.tsx` already loads it: `fetchDataset(ccddd,
  "gf_revenues")` at ~line 293; accessor `revenues()` at ~line 319 returns the
  arquero `ColumnTable`. `expenditures()` at ~line 315. `cashflow()` ~line 542.
- `utilities/client/FetchData.ts` and `app/finance/_providers/
  DistrictDataProvider.tsx` are dataset-generic — **no changes ever needed**.
- `utilities/ChartableMetrics.ts` is column-generic (`amount` + `<facet>_code`):
  `toFacetedCharatbleDataset` (note the existing typo in the name) works on the
  revenues frame as-is. A `pctrev` normalization already exists in
  `extractNormalizationDf` (~line 65) but is NOT listed in
  `ALL_CURRENCY_NORMALIZATION` in `utilities/normalizations.ts`.

### Dashboard architecture (the pattern every route follows)

A finance route = 4 files, modeled on `app/finance/expenditures/`:

| File | Role |
|---|---|
| `page.tsx` | Server component; sets `metadata`, renders the Page component. |
| `<X>Page.tsx` | `"use client"`. Defines `XSettings` type, `DEFAULT_X_SETTINGS`, the serializer generator arrays, renders `<EnsureDistrictData defaultAllSettings=… allSettingsConfigGenerators=… defaultContextSettings=… contextSettingsConfigGenerators=… ContentComponent={XDashboard} />`. Cleanest minimal template: `app/finance/detailedactuals/DetailedActualsPage.tsx`. |
| `<X>ContextSettings.tsx` | Context settings type, facet enum + serialize/deserialize, defaults. |
| `<X>Dashboard.tsx` | `"use client"` ContentComponent. Receives `{ districtDataMap, contextSettings, allSettings }` (`DistrictDataContentProps<XSettings, XContextSettings>`). Builds config in `useMemo`, renders `<SettingsLayout …><HcDashboard config={config}/></SettingsLayout>`. |

- **Nav**: add `{ name, isAppPath: true, pathPrefix }` to `FINANCE_NAV_CONFIGS`
  in `app/PrimaryNav.tsx` (~lines 78–107). Also add a `<NavLink>` to the legacy
  `app/finance/_widgets/FinanceSubNav.tsx` list to keep them in sync.
- `app/finance/page.tsx` just redirects to `/finance/vitals`; there are no cards.

### Settings / URL serialization (deep-link cheatsheet)

- URL shape: repeated `d=<datasetSettings>` (one per dataset; index 0 =
  "primary") + one `c=<contextSettings>`. Built by
  `SettingsLayout.navigateToNewSettings` (`app/finance/_widgets/
  SettingsLayout.tsx` ~lines 168–183).
- A `d`/`c` value is `key.value~key.value~…` (`utilities/settings.ts` ~21–48).
  Values must not contain `.` or `~` (serializer throws). Defaults are omitted.
- Engine: `app/finance/_settings/common_settings.ts` —
  `serializeDatasetSettings(allSettings, generators)`,
  `serializeOneSetting(contextSettings, generators)`,
  `deserializeDatasetSettings` (a left-fold: later configs may depend on earlier
  keys, e.g. school depends on `ccddd`).
- Serializer kinds (`_settings/base_settings.ts`): `"filter"`
  (`{urlVar, filter}` → uses `Filter.toFilterString`/`fromFilterString`),
  `"custom"` (`{urlVar, serialize, deserialize}`), `"nourlvar"`.
- **URL vars already taken** (do not reuse for new keys):
  dataset params: `c`(ccddd) `g` `cn` `sn` `p`(program) `a`(activity)
  `o`(object) `d`(dutyRoot) `n`(nces) `gl` `ta` `sg` `ts` `s`(school)
  `of`(expenditures overridePrimaryFilter);
  context params: `f`(facet) `l`(facetLimit) `so` `st` `csg` `ce` `sl` `ys`.
- Expenditures deep link example (facet=object, filtered to objects {2,3,4}):
  `/finance/expenditures?d=c.17001~o.<ObjectFilter.toFilterString(new Set([2,3,4]))>&c=f.2`
- Filters: `utilities/filter.ts` — a `Filter` wraps a domain tree; leaves have
  numeric `code` and optionally `serializationCode` (compresses sparse domains
  into [0,119] for compact URL encoding — see `_filteritems/nces.ts` and
  `school.ts`). `toFilterString(Set<number>)` emits a compact include/exclude
  base64 set; "all selected" → empty string (omitted from URL).
- Filter singletons live in `app/finance/_filteritems/` (`object.ts`,
  `program.ts`, `activity.ts`, `duty_root.ts`, `nces.ts`, `school.ts` …), tests
  alongside. Settings-panel widgets in `app/finance/_widgets/
  ExpenditureFilterContents.tsx` — each `<X>FilterContents` is ~15 lines wrapping
  a MUI `RichTreeView` via the internal `FilterTree`; copy that shape exactly.
- **Dataset settings vs context settings**: dataset settings (per-`d`) say WHAT
  data (ccddd + filter code-sets); context settings (single `c`) say HOW to view
  (facet, sort, yScale, chartsEnabled…). `EnsureDistrictData`
  (`_providers/DistrictDataProvider.tsx` ~63–112) deserializes both, loads each
  ccddd, then renders the ContentComponent.

### Highcharts

- `components/providers/HighchartsProvider.tsx` **already loads the sankey
  module** (~line 41). Access via `useHighcharts()` →
  `{ highchartsObjs: { highcharts, dashboards } }`.
- Two render paths in-repo:
  - Faceted dashboards: `HcDashboard` (`components/HcDashboard.tsx`) +
    `makeHighchartConfig` (`utilities/highcharts/utils.tsx` ~191–244).
  - Single chart: `<HighchartsReact highcharts={highchartsObjs.highcharts}
    options={…}/>` (`highcharts-react-official`; example:
    `app/tools/panorama-slicer/PanoramaSlicer.js` ~253, `components/Histogram.jsx`).
- `makeCurrencyFormatter(precision)` in `utilities/highcharts/utils.tsx` (~9–17)
  → compact-USD `Intl.NumberFormat`; reuse for Sankey tooltips.
- Versions: highcharts 12.3, @highcharts/dashboards 4.1, highcharts-react 3.1.
- Highcharts sankey series shape:
  `series: [{ type:'sankey', keys:['from','to','weight'], data: links,
  nodes: [{id, name, color, column}] }]`. Node `column` pins a node to a band —
  required to keep "Filtered Out" aligned per column.

### Testing

- Jest + ts-jest + jsdom. `__mocks__/arquero.ts` stubs arquero with just
  `table`/`from` jest.fn()s — so **any module you want unit-tested must not
  require real arquero execution**. Convert `ColumnTable` → plain rows with
  `.objects()` at the boundary in components; keep computation modules pure
  (plain arrays in/out).
- Existing test patterns to copy: `app/finance/_filteritems/object.test.ts`,
  `app/finance/_settings/dataset_settings.test.ts`.

---

## Locked design decisions

1. **Sankey level order is fixed**: `Source → Program → Activity` always, then
   optional `Object → NCES → School` (subset toggleable, order fixed).
2. **Source granularity setting**: `category` (default, ~9 nodes from
   `category_code`) or `account` (~60 nodes from `revenue_code`). Plus the
   synthetic `Fund Balance Drawdown` source when expenditures > revenues.
3. **Attribution runs on UNFILTERED data** (it is an economic fact about the
   whole fund); filters only re-route already-attributed flow into "Filtered
   Out" bands. Filters never change attribution math.
4. **Filtered Out semantics**: each flow record is checked against the enabled
   levels in order. At the first failing level `f`, the record follows real
   nodes for columns `< f`, then `Filtered Out` nodes for columns `>= f`
   through the last column. One gray `Filtered Out` node per column
   (`id "flt:<col>"`, pinned via `node.column`), chained left→right. Grand
   total is conserved in every column.
5. **Surplus years**: if revenues > expenditures, the excess goes to a terminal
   `Fund Balance Growth` node placed in the Program column (no outflow). If a
   directed/fungible pass leaves revenue unconsumed (all program gaps full),
   that residual also goes to Fund Balance Growth.
6. **Node ids are prefixed** to avoid numeric collisions across levels:
   `src:<code>`, `prog:<code>`, `act:<code>`, `obj:<code>`, `nces:<code>`,
   `sch:<code>`, `fb:drawdown`, `fb:growth`, `flt:<col>`. Display name = label
   from the data. Each node carries `custom: { level, code }` for the tooltip
   link builder.
7. **Sankey view shows ONE (school_year, data_type) at a time** — settings:
   year (default: latest available), data_type (default `actuals`).
8. **Tooltip deep links**: one link per node on the hovered band; each link
   applies only THAT node's filter on the target dashboard (source nodes →
   revenues dashboard; program/activity/object → expenditures; nces/school →
   detailedactuals if its serializers support `n`/`s`, else no link). Fund
   balance and Filtered Out nodes get no link.
9. **New URL vars** (chosen to avoid the taken list above): revenues dashboard
   filters `rc` (category codes), `rv` (revenue account codes); flow view
   `lv` (enabled optional levels), `sm` (source mode), `y` (class_of year),
   `dt` (data_type). If any collides with something added since this was
   written, pick another two-letter var and note it in the Progress Log.
10. **Chart rendering for the flow view**: single `HighchartsReact` chart inside
    `SettingsLayout` (NOT the faceted `HcDashboard` machinery).
11. Colors (from the validated playground):
    ```ts
    export const SANKEY_COLORS = {
      state: "#4285F4", federal: "#34A853", localTaxes: "#FF6D00",
      localNonTax: "#FFB300", otherEntities: "#8D6E63",
      otherFinancing: "#5D4037", otherResources: "#9AA0A6",
      program: "#F4B400", activity: "#00897B", fundBalance: "#B71C1C",
      nces: "#3949AB", school: "#E65100",
      object: { 2:"#7B1FA2", 3:"#8E24AA", 4:"#9C27B0", 5:"#AB47BC",
                7:"#BA68C8", 8:"#CE93D8", 9:"#E1BEE7", default:"#BA68C8" },
      filteredOut: "#BDBDBD",
    };
    ```

---

## Session 1 — Revenue filter foundations (data layer + filter items)

**Model: Sonnet.** Pattern-copying against explicit templates (`object.ts`,
`filteredExpenditures`, `makePaoSerializeConfig`); low ambiguity.

**Deliverable**: revenue category + revenue account filters, `filteredRevenues()`
on DistrictData, serializer configs, settings-panel widgets. No new routes yet.

**Files to read first**: `utilities/filter.ts`,
`app/finance/_filteritems/object.ts` + `object.test.ts`, `_filteritems/nces.ts`
(for `serializationCode`), `utilities/DistrictData.tsx` (~lines 29–80 filter
types, ~745–779 `filteredExpenditures`), `app/finance/_settings/
common_settings.ts` (the `make*FilterConfig` helpers),
`app/finance/_widgets/ExpenditureFilterContents.tsx`.

**Steps**:
1. **Domain data**. Create `utilities/domain/revenues.ts` exporting the OSPI
   revenue category and account code→label tables. Source of truth: run
   ```
   bq query --use_legacy_sql=false 'SELECT DISTINCT category_code, category, revenue_code, revenue FROM `sps-btn-data.safs_f19x.general_fund_revenues` ORDER BY revenue_code'
   ```
   If `bq` is unavailable/unauthed, fetch via the deployed endpoint instead
   (`https://finance-rdcihhc4la-uw.a.run.app?ccddd=17001&dataset=gf_revenues`
   returns `{data: {dataUrl}}`; decode the AVRO or ask the user to run the bq
   command). Statewide accounts are stable; hardcoding the table is fine.
   Categories are the `X000` groups (e.g. 1000 Local Taxes, 2000 Local Non-Tax,
   3000 State General Purpose, 4000 State Special Purpose, 5000/6000 Federal,
   7000 Other Districts, 8000 Other Agencies, 9000 Other Financing).
2. **Filter items**. Add `app/finance/_filteritems/revenue_category.ts`
   (prefix `revcat`, flat tree of categories, codes = `category_code/1000` or
   raw `category_code` — pick raw + `serializationCode` if codes exceed the
   compact range, mirroring `nces.ts`) and `_filteritems/revenue.ts` (prefix
   `rev`, tree grouped: category → account leaves, leaf `code =
   revenue_code`, use `serializationCode` since 4-digit codes are sparse).
   Tests mirroring `object.test.ts` (round-trip `toFilterString`/
   `fromFilterString`, `treeViewItems` shape).
3. **DistrictData**. In `utilities/DistrictData.tsx` add near the other filter
   types: `RevenueCategoryFilters { revenueCategoryCodes: Set<number> }`,
   `RevenueAccountFilters { revenueCodes: Set<number> }`,
   `RevenuesFilters = Partial<RevenueCategoryFilters & RevenueAccountFilters &
   PFilters>`. Add `filteredRevenues(filters: RevenuesFilters)` copying the
   `filteredExpenditures` structure but filtering on `category_code`,
   `revenue_code`, `program_code`.
4. **Serializer configs**. In `app/finance/_settings/common_settings.ts` add
   `makeRevenueSerializeConfig` returning
   `[["revenueCategoryCodes", {serializerType:"filter", urlVar:"rc", filter: RevenueCategoryFilter}], ["revenueCodes", {…, urlVar:"rv", filter: RevenueFilter}]]`
   plus a `makeDefaultRevenueSettings()` (all codes selected), following
   `makePaoSerializeConfig`/`makeDefaultPaoSettings` exactly.
5. **Widgets**. Add `RevenueCategoryFilterContents` and `RevenueFilterContents`
   to `app/finance/_widgets/ExpenditureFilterContents.tsx` (or a sibling
   `RevenueFilterContents.tsx`), copying the `ObjectFilterContents` shape.

**Verification**: `npm run test` green (new filter + settings round-trip tests);
`npm run lint` clean; `npx tsc --noEmit` if quick.

---

## Session 2 — Revenues dashboard route

**Model: Sonnet** (Opus if budget allows). Mostly mirroring `expenditures/` /
`detailedactuals/`; the one judgment point is generalizing `extractFacets` in
`ChartableVitals.ts` — if that turns into deep refactoring, stop, do the
parallel-function version instead, and note it in the Progress Log.

**Deliverable**: `app/finance/revenues/` — faceted budget-vs-actuals dashboard
over the revenues frame, facets = revenue category / revenue account / program,
in the nav, deep-linkable.

**Files to read first**: all four files in `app/finance/detailedactuals/` (the
minimal template) and `app/finance/expenditures/` (the fuller one),
`utilities/ChartableVitals.ts` (`extractFacets`), `utilities/highcharts/
utils.tsx` (`makeHighchartConfig`), `app/PrimaryNav.tsx` (~78–107),
`app/finance/_widgets/FinanceSubNav.tsx`.

**Steps**:
1. Create the 4-file route following the table in Ground Truth:
   - `RevenuesSettings = DatasetSettings & Partial<RevenueCategoryFilters &
     RevenueAccountFilters & PFilters>`.
   - Facet enum `["category", "revenue", "program"]` with its own
     serialize/deserialize (map to "0"/"1"/"2"), context settings copying
     `ExpendituresContextSettings.tsx`.
   - Dataset generators: `makeDatasetSerializeConfig`, `makeRevenueSerializeConfig`,
     `makePaSerializeConfig`-style program config (reuse existing program filter
     config helper).
   - `RevenuesDashboard.tsx`: mirror `ExpendituresDashboard.tsx` but feed the
     revenues frame. Check how `extractFacets` sources its dataframe — if it is
     hardcoded to expenditures, add a parallel `extractRevenueFacets` in
     `utilities/ChartableVitals.ts` (or generalize with a frame-accessor
     parameter) that groups `filteredRevenues(settings)` by `<facet>_code`
     summing `amount`, then reuse `makeHighchartConfig` unchanged.
2. Nav: add `{ name: "Revenues", isAppPath: true, pathPrefix: "revenues" }` to
   `FINANCE_NAV_CONFIGS` (place after Expenditures) and a matching `<NavLink>`
   in `FinanceSubNav.tsx`.
3. Optional nicety (skip if time-boxed): add `"pctrev"` to
   `ALL_CURRENCY_NORMALIZATION` in `utilities/normalizations.ts` and a label for
   it wherever the normalization selector maps labels, making percent-of-revenue
   selectable on finance dashboards.

**Verification**: `npm run dev`, open `/finance/revenues` — charts render for
Seattle (17001), budget+actuals bars per facet; switch facets; toggle a filter
and confirm the URL updates (`d=…rc.…` / `rv.…`) and reloading the URL restores
state. Deep-link test: hand-build a URL filtered to one category and confirm.
`npm run test`, `npm run lint`, `npm run build` all green.

---

## Session 3 — Sankey compute engine (pure TS + tests)

**Model: Opus.** The algorithmic core of the whole project: penny-exact
clamping/proration, conservation invariants, filter-diversion semantics, and
the tests that everything downstream trusts. Do not use Sonnet here.

**Deliverable**: `utilities/sankey/` — pure, arquero-free modules with jest
tests. No UI.

**Files to read first**: `SANKEY_HANDOFF.md` (algorithm §"The attribution
algorithm", reconciliation §"Reconciliation checks"), `utilities/number_set.ts`
(style reference only).

**Modules**:

1. `utilities/sankey/types.ts`
   ```ts
   export type ExpRow = { program_code:number; program:string; activity_code:number;
     activity:string; object_code:number; object:string; nces_code:number; nces:string;
     school_code:number; school:string; amount:number };
   export type RevRow = { revenue_code:number; revenue:string; category_code:number;
     category:string; program_code:number; program:string; amount:number };
   export type Level = "source"|"program"|"activity"|"object"|"nces"|"school";
   export type SourceMode = "category"|"account";
   export type FlowFilters = Partial<{ sourceCodes:Set<number>; programCodes:Set<number>;
     activityCodes:Set<number>; objectCodes:Set<number>; ncesCodes:Set<number>;
     schoolCodes:Set<number> }>;   // sourceCodes = category or account codes per mode
   export type SankeyNode = { id:string; name:string; color:string; column:number;
     custom:{ level:Level|"fundBalance"|"filtered"; code:number|null } };
   export type SankeyLink = { from:string; to:string; weight:number };
   ```
   (Rows arrive pre-filtered to one `(class_of, data_type)` by the caller.)
2. `utilities/sankey/attribution.ts` — `attributeSources(expRows, revRows,
   mode: SourceMode): Map<programCode, Map<sourceKey, amount>>`. Port the
   3-pass algorithm verbatim from SANKEY_HANDOFF.md:
   - `prog_tot[p]` = expenditure sum per program.
   - Pass 1: revenue rows with `program_code !== 0` route to their program,
     clamped at remaining capacity; spillover joins the fungible pool.
   - Pass 2: fungible pool distributes proportionally over remaining gaps.
     If total remaining gap is 0, leftovers → `fb:growth`.
   - Pass 3: any residual program gap ← `fb:drawdown`.
   - Surplus handling per Locked decision 5.
   - `sourceKey` = `category_code` or `revenue_code` per mode (aggregate revenue
     rows to that key first, keeping directed vs fungible split: a category can
     contain both directed and fungible accounts — attribute at ACCOUNT level
     always, then roll up account→category for link emission when
     mode=`category`).
3. `utilities/sankey/flows.ts` — `computeFlows(expRows, revRows, opts:{
   mode:SourceMode; enabledLevels:Level[]; filters:FlowFilters }): {nodes, links,
   totals}`:
   - Aggregate expRows to the tuple of enabled expenditure levels (perf: do this
     BEFORE source expansion).
   - Expand each aggregated row across its program's sources proportionally
     (`share = attributed[p][src] / prog_tot[p]`) → flow records
     `(src, program, activity, [object], [nces], [school], amount)`.
   - Partition per Locked decision 4 into real links + Filtered Out chain links.
   - Emit deduped nodes (prefixed ids, colors from `SANKEY_COLORS`, explicit
     `column`) and links summed by (from,to). Drop links below a `minWeight`
     epsilon (e.g. $0.005) to kill float dust.
4. `utilities/sankey/colors.ts` — the `SANKEY_COLORS` constant from Locked
   decision 11 + `colorForNode(level, code)` (category→source color mapping:
   1000→localTaxes, 2000→localNonTax, 3000/4000→state, 5000/6000→federal,
   7000/8000→otherEntities, 9000→otherFinancing; account mode inherits its
   category's color).

**Tests** (`attribution.test.ts`, `flows.test.ts`) — use small synthetic
fixtures, no arquero:
- Directed clamping + spillover-to-fungible behaves per algorithm.
- Fungible proration sums exactly to the pool (use a rounding-residual
  assignment so pennies balance).
- Deficit fixture → `fb:drawdown` inflow = expenditure−revenue; surplus fixture
  → `fb:growth` = revenue−expenditure.
- **Per-program conservation**: inflow == outflow == prog_tot for every program.
- **Column conservation with filters**: for every column, sum(link weights) ==
  grand total, including the Filtered Out chain.
- First-failing-level diversion: a record failing at Activity still credits its
  real Source and Program nodes, then flows flt from Activity onward.

**Verification**: `npm run test` green, `npm run lint` clean.

---

## Session 4 — Expenditure Flow view (route + settings + chart)

**Model: Opus.** Widest integration surface: custom serializers for four new
url vars, arquero param-baking at the data boundary, SettingsLayout plumbing,
and a chart type with no in-repo precedent. Sonnet tends to flail when several
subsystems must be composed at once.

**Deliverable**: `app/finance/flow/` rendering the Sankey with full settings
(levels, source mode, year, data_type, per-level filters), in the nav,
deep-linkable.

**Files to read first**: `app/finance/detailedactuals/DetailedActualsPage.tsx`,
`app/finance/expenditures/ExpendituresDashboard.tsx` (SettingsLayout wiring,
lines ~218–261), `app/finance/_widgets/SettingsLayout.tsx`,
`app/tools/panorama-slicer/PanoramaSlicer.js` (~240–260, HighchartsReact usage),
`app/finance/_widgets/SettingsSelect.tsx`, `utilities/sankey/*` (Session 3),
`utilities/DistrictData.tsx` (`all_class_ofs`, minMax logic ~259–262).

**Steps**:
1. **Settings**. `FlowSettings = DatasetSettings & Partial<PAOFilters &
   NcesFilters & SchoolFilters & RevenueCategoryFilters & RevenueAccountFilters>
   & { enabledLevels: Set<Level>; sourceMode: SourceMode; classOf: number|null;
   dataType: "actuals"|"budget" }`. Serialize with existing filter configs
   (`p`,`a`,`o`,`n`,`s`,`rc`,`rv`) plus custom configs: `lv` (e.g. bitmask or
   letters "o","n","s" joined — no `.`/`~`), `sm` ("c"/"a"), `y` (classOf int,
   `null`→omitted→latest), `dt` ("a"/"b"). Single dataset only — this view is
   not a comparison view; use `DEFAULT_DATASET_SETTINGS` as the one-element
   base. Context settings: just `CommonContextSettings` defaults (no facet).
2. **Widgets**. Reuse `DatasetSettingsContents` (district picker) and the filter
   contents from Session 1 + existing PAO/NCES/School ones. Add a small
   `FlowLevelContents` widget (MUI checkboxes for Object/NCES/School, selects
   for source mode / year / data_type) modeled on `SettingsSelect` usage. Year
   options come from `districtData.all_class_ofs()` — since widgets may render
   before data, guard for undefined.
3. **Dashboard component** (`FlowDashboard.tsx`):
   - Pull `districtData` for the primary ccddd from `districtDataMap`.
   - `useMemo`: `const exp = districtData.expenditures()
     .filter(/* class_of === y && data_type === dt */).objects() as ExpRow[]`
     (same for revenues; check arquero filter idiom used elsewhere in
     DistrictData — params must be baked via `aq.escape` or `.params()`), then
     `computeFlows(...)`.
   - Options: `{ chart:{ height: 700 }, title:{text:...}, series:[{ type:'sankey',
     keys:['from','to','weight'], data: links, nodes, nodePadding: 8,
     nodeWidth: 12 }], tooltip:{ enabled:true } }` (real tooltip content is
     Session 5; a default tooltip is fine here). Render
     `<HighchartsReact highcharts={highchartsObjs.highcharts} options={options}/>`
     inside `<SettingsLayout …>` with the serializer plumbing copied from
     `ExpendituresDashboard.tsx` ~218–261.
   - Node count guard: school level for Seattle is ~110 nodes — bump chart
     height when `school` is enabled (e.g. `Math.max(700, nodeCount * 14)`).
4. **Nav**: `{ name: "Expenditure Flow", pathPrefix: "flow" }` in
   `FINANCE_NAV_CONFIGS` + FinanceSubNav.

**Verification**: `npm run dev` → `/finance/flow`:
- Default view: Source(category) → Program → Activity for Seattle latest
  actuals; totals in the right ballpark (Seattle 2024-25 actuals ≈ $1.196B
  total expenditure; Fund Balance Drawdown ≈ $23.7M).
- Toggle Object on → 4th column appears. Toggle NCES/School.
- Filter programs to a couple → gray Filtered Out band appears and runs to the
  last column; every column still visually totals the same.
- Reload with the URL → identical view. `npm run test`, `npm run lint`,
  `npm run build` green.

---

## Session 5 — Band tooltips with two deep links

**Model: Sonnet.** The plan supplies the exact node→dashboard→urlVar table, the
tooltip snippet, and the Popover fallback; work is a small tested util plus
wiring. Escalate to Opus only if the stickOnContact click-through fallback
spirals.

**Deliverable**: hovering a band shows a sticky HTML tooltip: band label
(`From → To`), compact-USD weight, and two links ("Explore <FromNode> ↗",
"Explore <ToNode> ↗") opening the right dashboard pre-filtered, in a new tab.

**Files to read first**: `utilities/highcharts/utils.tsx`
(`makeCurrencyFormatter`), `utilities/highcharts/ChartConfigGenerators.tsx`
(tooltip formatter style), `app/finance/expenditures/ExpendituresPage.tsx`
(exported generator arrays), `app/finance/revenues/RevenuesPage.tsx` (Session
2), `app/finance/detailedactuals/DetailedActualsPage.tsx` (confirm whether its
dataset generators include the `n`/`s` filter configs), `utilities/filter.ts`
(`toFilterString`), Session 1 filter items.

**Steps**:
1. `utilities/sankey/deepLinks.ts` — pure module + tests:
   `linkForNode(node: SankeyNode, ctx:{ ccddd:number; sourceMode:SourceMode }):
   {href:string; label:string} | null`.
   - Build the `d` value via each target page's real serializers where practical
     (import the page's `SERIALIZE_*_SETTINGS_GENERATORS` + defaults, set the
     one filter Set to `new Set([code])`, call `serializeDatasetSettings`), or
     hand-compose `c.<ccddd>~<var>.<Filter.toFilterString(new Set([code]))>`.
     Hand-composition is acceptable and easier to test; the var map is:

     | node level | dashboard | urlVar | extra |
     |---|---|---|---|
     | source (category mode) | `/finance/revenues` | `rc` | `&c=f.0` |
     | source (account mode) | `/finance/revenues` | `rv` | `&c=f.1` |
     | program | `/finance/expenditures` | `p` | `&c=f.1` |
     | activity | `/finance/expenditures` | `a` | `&c=f.0` |
     | object | `/finance/expenditures` | `o` | `&c=f.2` |
     | nces / school | `/finance/detailedactuals` | `n` / `s` | only if that page's generators include them — verify; else return null |
     | fb:* / flt:* | — | — | return null |
   - `encodeURIComponent` the whole `d` value when composing the href.
   - Tests: for a program node, deserializing the generated `d` with the
     expenditures generators yields `programCodes == Set([code])`; null cases.
2. **Tooltip wiring** in `FlowDashboard.tsx`:
   ```ts
   tooltip: {
     useHTML: true, stickOnContact: true, followPointer: false, hideDelay: 300,
     formatter() {
       const p = this.point as any;
       if (!p.from) { /* node hover */ return `<b>${p.name}</b><br/>${fmt(p.sum)}`; }
       const l1 = linkForNode(p.fromNode.options, ctx), l2 = linkForNode(p.toNode.options, ctx);
       return `<b>${p.fromNode.name} → ${p.toNode.name}</b><br/>${fmt(p.weight)}<br/>`
         + [l1,l2].filter(Boolean).map(l =>
             `<a href="${l.href}" target="_blank" rel="noopener" style="pointer-events:all">${l.label} ↗</a>`).join("<br/>");
     },
   }
   ```
   Notes: `stickOnContact` (Highcharts ≥8.1) keeps the tooltip open while the
   pointer moves into it, making the links clickable. If clicks still don't
   land (test this!), fall back: `plotOptions.sankey.point.events.click` opens a
   small MUI `Popover` anchored at the click with the same two links — put the
   fallback behind the same `linkForNode` util so only the surface changes.
   Note which approach shipped in the Progress Log.
3. Node-hover tooltip (nice-to-have): total through-flow + single link.

**Verification**: `npm run dev` → hover a Source→Program band: tooltip shows
both links; each opens a new tab with the target dashboard visibly filtered to
exactly that category/program. Repeat for Program→Activity and (with Object
enabled) Activity→Object bands. Filtered Out and Fund Balance bands show no
links. `npm run test`, `npm run lint`, `npm run build` green.

---

## Session 6 — Reconciliation, polish, cross-links

**Model: Opus.** Verification and judgment, not boilerplate: deciding whether
numbers actually reconcile, diagnosing attribution edge cases in other
districts, and choosing what's worth polishing. A weaker model will happily
declare success on numbers that don't match.

**Deliverable**: numbers verified against known-good totals; UX polish; ship.

**Steps**:
1. **Reconciliation** (add as a checked list in the Progress Log): for Seattle
   17001, 2024-25 actuals, on `/finance/flow`:
   - Grand total ≈ $1,195.86M; revenues ≈ $1,172.15M; Fund Balance Drawdown ≈
     $23.71M (cross-check: `districtData.cashflow()`).
   - Per-program inflow == outflow (spot-check 2–3 programs against the
     expenditures dashboard faceted by program).
   - Compare the rendered chart side-by-side with the static plotly variant
     `public/analyses/sps_sankey_avro_spao_expanded_source_actuals_2024-2025.html`.
2. Try `data_type=budget` and 1–2 other districts (e.g. a small district) —
   watch for: districts with revenue but a missing program (attribution clamp
   edge), surplus years (Fund Balance Growth path), empty frames (render a
   friendly empty state, not a crash).
3. Polish: loading state while district data loads (EnsureDistrictData already
   gates this), chart title showing district/year/data_type, `Filtered Out`
   legend note, number formatting consistency.
4. Cross-link: on `app/analyses/page.tsx`, add a pointer from the static Sankey
   section to the interactive `/finance/flow`; consider linking `/finance/flow`
   from the expenditures dashboard header text if there's a natural spot.
5. Final `npm run test && npm run lint && npm run build`. Do NOT run
   `npm run deploy` unless the user asks.

---

## Progress Log

Sessions append here. Format:

```
### Session N — <title> — <status: DONE | PARTIAL | BLOCKED> — <date>
- What landed (files touched)
- Deviations from plan + why
- Notes for next session
```

### Session 1 — Revenue filter foundations — DONE — 2026-07-21

- **What landed**:
  - `utilities/domain/revenues.ts` — `ALL_REVENUE_CATEGORIES` (9 categories)
    and `ALL_REVENUES` (183 revenue accounts, with `serialization_code`
    0-182 mirroring `nces.ts`).
  - `app/finance/_filteritems/revenue_category.ts` (prefix `revcat`, flat
    tree, `serializationCode = category_code / 1000`) +
    `revenue_category.test.ts`.
  - `app/finance/_filteritems/revenue.ts` (prefix `rev`, tree grouped
    category → account leaves, `code = revenue_code`, uses
    `serializationCode`) + `revenue.test.ts`.
  - `utilities/DistrictData.tsx`: added `RevenueCategoryFilters`,
    `RevenueAccountFilters`, `RevenuesFilters` (unexported, mirrors
    `ExpendituresFilters`), and `filteredRevenues(filters)` copying the
    `filteredExpenditures` idiom (filters on `category_code`,
    `revenue_code`, `program_code`).
  - `app/finance/_settings/common_settings.ts`: added
    `makeRevenueSerializeConfig` (urlVars `rc`/`rv`, as specified) and
    `makeDefaultRevenueSettings()`.
  - `app/finance/_widgets/ExpenditureFilterContents.tsx`: added
    `RevenueCategoryFilterContents` and `RevenueFilterContents` (same file,
    not a sibling — file wasn't large enough to warrant splitting).
  - Extended `app/finance/_settings/common_settings.test.ts`'s existing
    golden/round-trip test table with a `RevenueFilter` entry (merges
    `makeDefaultRevenueSettings()` into the test's default-settings fixture
    without touching `makeDefaultSettings` itself, since revenues aren't
    part of the expenditures dataset defaults).

- **Revenue domain data provenance — REAL, VERIFIED, not a placeholder.**
  `bq` turned out to be authed in this environment, so step 1 of the
  playbook's fallback chain worked directly:
  ```
  bq query --use_legacy_sql=false 'SELECT DISTINCT category_code, category,
    revenue_code, revenue FROM `sps-btn-data.safs_f19x.general_fund_revenues`
    ORDER BY revenue_code'
  ```
  This returned 183 distinct `(category_code, revenue_code)` rows across the
  real 9 OSPI SAFS categories (1000-9000), statewide (not Seattle-only) and
  hardcoded into `revenues.ts` verbatim (with two documented cleanups, see
  the comment header in that file):
  1. Several source labels contain a literal `?` character in place of what
     is almost certainly a mangled en-dash from OSPI's spreadsheet → BigQuery
     ingestion (upstream of this codebase, not introduced here). Normalized
     to `" - "` for readability; codes are untouched.
  2. Four revenue_codes (4109, 5700, 6109, 6210) have real, non-trivial
     dollar amounts in the table (up to $217M statewide across 2 years) but
     NULL category/revenue text in the source — OSPI's own spreadsheet never
     labeled them. Given placeholder labels
     `[Unlabeled in OSPI source] Reserve/Other (<code>)` with `category_code`
     inferred from the code's leading digit. If these ever show meaningful
     $ amounts for a specific district being analyzed, verify against a
     fresh bq pull / OSPI SAFS manual before trusting the label.
  - Cross-checked against real embedded data in
    `dashboards_raw/sps_sankey_avro_spao_by_account_directed_actuals_2024-2025.html`
    (60 Seattle-specific revenue accounts from a previously-reconciled
    $1.19B Sankey, commit `ad89d6c`) — every account code in that file is
    present in the statewide `ALL_REVENUES` table with a matching label.

- **Deviations from plan**:
  - `RevenuesFilters` type is not exported (mirrors the existing
    unexported `ExpendituresFilters` pattern in `DistrictData.tsx`); widgets
    and future settings types should compose `RevenueCategoryFilters &
    RevenueAccountFilters` directly, same as how `ExpenditureFilterContents`
    composes `OFilters`/`AFilters`/etc. rather than `ExpendituresFilters`.
  - Widgets landed in the existing `ExpenditureFilterContents.tsx` rather
    than a new sibling file — the file is a flat collection of ~15-line
    components with no shared local state, so a split wasn't warranted yet;
    revisit if the file gets unwieldy in Session 2/4.

- **Verification**: `npm run test` → 12 suites / 49 tests, all green
  (includes the two new filter test files + the extended
  `common_settings.test.ts`). `npx tsc --noEmit` clean. `npm run lint`
  clean on every file this session touched (repo-wide `npm run lint` has
  ~8,300 pre-existing prettier errors in unrelated files predating this
  session — confirmed via `git stash` before/after comparison — none in
  the files listed above).

- **Notes for next session**: `utilities/domain/revenues.ts` is ready to
  drive Session 2's revenues dashboard facets directly; `ALL_REVENUES` is
  the full statewide domain (not just Seattle's ~60 used accounts), so
  most districts will show far fewer than 183 non-zero leaves in practice
  — that's expected, same as ObjectFilter/ProgramFilter always exposing
  more codes than any one district uses in a given year.
