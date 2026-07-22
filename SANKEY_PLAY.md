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

### Session 2 — Revenues dashboard route — DONE — 2026-07-21

- **What landed**:
  - `app/finance/revenues/page.tsx` — server component, metadata + renders
    `RevenuesPage`.
  - `app/finance/revenues/RevenuesPage.tsx` — `RevenuesSettings`,
    `DEFAULT_REVENUES_SETTINGS`, `SERIALIZE_REVENUES_SETTINGS_GENERATORS`
    (`makeDatasetSerializeConfig`, `makeRevenueSerializeConfig`, the new
    `makeProgramSerializeConfig`), `SERIALIZE_REVENUES_CONTEXT_SETTINGS_GENERATORS`,
    renders `<EnsureDistrictData … ContentComponent={RevenuesDashboard}/>`.
  - `app/finance/revenues/RevenuesContextSettings.tsx` — facet enum
    `["category", "revenue", "program"]` serialized to `"0"/"1"/"2"`,
    `RevenuesContextSettings` type + `DEFAULT_DASHBOARD_SETTINGS`, settings
    panel contents, copying `ExpendituresContextSettings.tsx` shape exactly.
  - `app/finance/revenues/RevenuesDashboard.tsx` — `"use client"`
    ContentComponent mirroring `ExpendituresDashboard.tsx`/
    `DetailedActualsDashboard.tsx` (no context row, so no
    `augmentContextComponents`/`"hascontext"` class — closer to
    `DetailedActualsDashboard.tsx` in that respect). Calls `extractFacets`
    with `DistrictData.prototype.filteredRevenues` passed as the existing
    `extractor` parameter.
  - `app/finance/_settings/common_settings.ts`: added
    `makeProgramSerializeConfig` (urlVar `p`, `ProgramFilter`) and
    `makeDefaultProgramSettings()`; `makePaSerializeConfig`/
    `makeDefaultPaSettings` now compose on top of these instead of
    duplicating the program entry.
  - `app/finance/_settings/common_settings.test.ts`: added a
    `"ProgramFilter"` entry to the golden/round-trip test table for the
    new `makeProgramSerializeConfig`.
  - `app/PrimaryNav.tsx`: added `{ name: "Revenues", isAppPath: true,
    pathPrefix: "revenues" }` to `FINANCE_NAV_CONFIGS`, right after
    Expenditures.
  - `app/finance/_widgets/FinanceSubNav.tsx`: added a matching
    `<NavLink href="/finance/revenues">Revenues</NavLink>`, right after
    Expenditures.
  - Optional nicety **done**: `utilities/normalizations.ts` — added
    `"pctrev"` to `ALL_CURRENCY_NORMALIZATION` (the underlying
    `extractNormalizationDf` branch already existed per Ground Truth, it
    was just unreachable via the selector). `app/finance/_widgets/
    CurrencyNormalizationSelector.tsx` — added a `"% of Revenues"`
    `MenuItem` for it. This makes percent-of-revenue selectable on every
    finance dashboard that uses this selector (expenditures, detailed
    actuals, revenues), not just revenues.

- **Deviations from plan + why**:
  - `extractFacets` in `utilities/ChartableVitals.ts` turned out to
    **already be generalized** — it takes an `extractor` parameter
    (default `DistrictData.prototype.filteredExpenditures`) that Session 1
    (unknowingly, since `filteredRevenues` was added for other reasons)
    made a drop-in replacement for: `filteredRevenues` has the exact
    `(filters) => ColumnTable` shape `extractFacets` expects, called via
    `extractor.call(districtData, expenditureSettings)`. Likewise
    `toFacetedCharatbleDataset`/`extractRawExpenditures` in
    `ChartableMetrics.ts` are column-generic (`class_of`, `data_type`,
    `<facet>_code`, `amount`) and needed no changes — this matches what
    Ground Truth already documented. **No new `extractRevenueFacets`
    function was needed and none was added** — `RevenuesDashboard.tsx`
    just passes `DistrictData.prototype.filteredRevenues` as the
    `extractor` argument to the existing `extractFacets`. This is the
    "generalize via frame-accessor parameter" branch of the judgment call,
    and it turned out to require zero new generalization work.
  - `RevenuesSettings` is typed as `DatasetSettings &
    RevenueCategoryFilters & RevenueAccountFilters & PFilters` (fields
    required, not `Partial<...>` as the plan's prose literally states).
    Reason: `Filter.toSummaryText`/`toFilterString` take a bare
    `Set<number>`, and the settings object is always fully populated by
    `DEFAULT_REVENUES_SETTINGS` — every other dashboard in the repo
    (`ExpendituresSettings`, `DetailedActualsSettings`) follows this same
    non-`Partial` convention for exactly this reason, even though the
    `filteredExpenditures`/`filteredRevenues` filter parameter types
    themselves are `Partial<...>` (a settings object with all fields
    present is structurally assignable to a `Partial` parameter type, so
    nothing is lost). `Partial<...>` was almost certainly meant loosely in
    the plan to describe "some subset of these filter fields", not as a
    literal TS type to copy verbatim.
  - No standalone "program-only" serialize config existed before this
    session (`makePaSerializeConfig` bundles program+activity, which
    revenues doesn't have). Added `makeProgramSerializeConfig` /
    `makeDefaultProgramSettings` to `common_settings.ts` and had
    `makePaSerializeConfig`/`makeDefaultPaSettings` delegate to them, so
    there's one source of truth for the program filter's `p` urlVar
    instead of two. `ProgramFilterContents` (the widget) already worked
    generically on `BaseSettings & PFilters`, so no widget changes were
    needed there.
  - `RevenuesDashboard.tsx` has no context row (funded enrollment /
    cashflow / revenues / expenditures sparklines) — that machinery
    (`augmentContextComponents`) is specific to `ExpendituresDashboard.tsx`
    and wasn't asked for here; `RevenuesDashboard.tsx` mirrors the simpler
    `DetailedActualsDashboard.tsx` shape instead (single `<HcDashboard
    config={config} />`, no `className="hascontext"`).

- **Verification**:
  - `npx tsc --noEmit`: clean.
  - `npm run lint` on every file touched/created this session: 0 errors,
    confirmed via `--fix` and by diffing full-repo `npm run lint` output
    before (`git stash -u`) vs after — the only per-file deltas are (a)
    `app/PrimaryNav.tsx` +2 pre-existing-style prettier errors (the new
    `Revenues` nav entry uses the same single-quote style as its
    `Expenditures`/`Detailed Actuals` neighbors in that array, which were
    already flagged before this session — matching neighbor style was
    prioritized per the "match existing code style" guardrail over fixing
    unrelated pre-existing formatting), (b) `utilities/normalizations.ts`
    net **-3** errors (an incidental trailing-newline cleanup from
    `eslint --fix`), (c) zero errors in every new `app/finance/revenues/*`
    file. Net repo-wide error count: 8269 → 8270 (all pre-existing debt,
    unrelated to correctness).
  - `npm run test`: 12 suites / 51 tests green (49 from Session 1 + 2 new:
    a `"ProgramFilter"` golden + round-trip case in
    `common_settings.test.ts`).
  - `npm run build`: succeeds; `/finance/revenues` appears in the route
    list as a static page alongside the other finance dashboards.
  - No browser automation was available in this session (Claude in Chrome
    extension not connected). Verified instead via: `npm run dev` +
    `curl` against `/finance/revenues`, `/finance/revenues?c=f.0`,
    `?c=f.1`, `?c=f.2` (facet switch via context param), and
    `/finance/revenues?d=c.17001~rc.gA` (category-filtered deep link) —
    all returned HTTP 200 with no compile/render errors in the dev server
    log. The client-side data fetch/chart render (AVRO → arquero →
    Highcharts) itself was **not** visually confirmed in a real browser —
    this is the one gap versus full verification and should be spot-
    checked with a browser in a later session if one becomes available.
    The settings serialize/deserialize round-trip was verified in code
    (traced `SettingsLayout` → `serializeDatasetSettings` →
    `RevenueCategoryFilter.toFilterString`/`RevenueFilter.toFilterString`
    → URL `rc`/`rv` fragments → `deserializeDatasetSettings` on reload)
    and covered by the existing `RevenueFilter` round-trip test from
    Session 1 plus the new `ProgramFilter` one added this session.

- **Notes for next session**: Session 3 (Sankey compute engine) doesn't
  depend on anything UI-side from this session — it only needs the
  Session 1 domain/filter shapes (`utilities/domain/revenues.ts`,
  `RevenueCategoryFilters`/`RevenueAccountFilters`, `filteredRevenues`),
  which are unchanged here. One thing worth knowing: `extractFacets`'s
  `extractor` parameter is the established seam for "run this against a
  different DistrictData frame" — Session 4's `FlowDashboard.tsx` will
  likely want its own direct `districtData.expenditures()`/`.revenues()`
  calls per the Locked-decision-7 single-(year,data_type) contract rather
  than going through `extractFacets` (which is faceted-dashboard-shaped,
  not Sankey-shaped), so this seam probably isn't directly reusable there
  — just flagging it exists in case it's useful for something narrower
  (e.g. a per-node total lookup).

### Session 3 — Sankey compute engine (pure TS + tests) — DONE — 2026-07-21

- **What landed** (new self-contained module tree `utilities/sankey/`, no
  arquero, no UI, no touches to existing code):
  - `utilities/sankey/types.ts` — `ExpRow`, `RevRow`, `Level`, `SourceMode`,
    `FlowFilters`, `SankeyNode`, `SankeyLink` exactly as specified, plus three
    additive types the engine needs: `ComputeFlowsOpts`, `FlowTotals`,
    `ComputeFlowsResult`.
  - `utilities/sankey/colors.ts` — `SANKEY_COLORS` verbatim from Locked
    decision 11 + `colorForNode(level, code)`. Source color derives the
    category bucket from the code's leading thousands digit
    (`Math.floor(code/1000)*1000`), so it works for both category codes and
    account codes (account mode inherits its category's color); 3000/4000→state,
    5000/6000→federal, 7000/8000→otherEntities, etc.
  - `utilities/sankey/attribution.ts` — `attributeSources(expRows, revRows,
    mode)` (3-pass) + exported `prorate` helper + sentinel constants
    `DRAWDOWN_SOURCE_CODE = -2`, `GROWTH_PROGRAM_CODE = -1`.
  - `utilities/sankey/flows.ts` — `computeFlows(expRows, revRows, opts)`.
  - `attribution.test.ts` (12 cases) + `flows.test.ts` (13 cases) — 25 new
    tests, all green; small synthetic fixtures, no arquero.

- **Test cases (all pass)**:
  - prorate: last-recipient-remainder sums to total (indivisible 100/[1,2] and
    100/[1,1,1]); clean split; zero-weight guard.
  - attribution: directed clamp + spillover-to-fungible; directed-to-a-program-
    with-no-expenditure spills entirely; fungible proration sums exactly to the
    pool (clean + indivisible); deficit→drawdown = exp−rev; surplus→growth =
    rev−exp; per-program conservation (mixed directed/fungible deficit fixture);
    category rollup keeps the directed/fungible split when one category mixes
    both kinds of account.
  - flows: source→program crediting; per-program inflow==outflow==prog_tot;
    drawdown reporting + totals; grand-total conserved in every column
    (unfiltered); program-filter diversion into a chained gray band + column
    conservation with filters; first-failing-level diversion at Activity (real
    Source+Program still credited, no node for the fully-filtered activity);
    surplus→terminal `fb:growth` node (inflow, zero outflow); optional Object
    column enabled + conservation.
  - Hand sanity-check at real Seattle magnitudes (scratch script): exp
    $1195.86M, rev $1172.15M → drawdown **$23.71M**, grandTotal $1195.86M,
    per-program in==out, columns 0/1 total the grand total. Matches the handoff.

- **Deviations from the plan's sketch (Session 4 MUST read this)**:
  1. **`attributeSources` return type** is `{ progTot: Map<number,number>;
     attributed: Map<number, Map<number,number>> }`, NOT the bare
     `Map<programCode, Map<sourceKey, amount>>` in the plan. Rationale: the bare
     map can't represent Fund Balance Drawdown (a synthetic *inflow source* into
     real programs) or Fund Balance Growth (a synthetic *sink* in the Program
     column) without sentinels, and `computeFlows` needs `progTot` anyway. In
     `attributed`: for a real program `p`, `attributed.get(p)` maps source codes
     (real, plus possibly `DRAWDOWN_SOURCE_CODE`) to dollars summing to
     `progTot.get(p)`; the key `GROWTH_PROGRAM_CODE` holds a source→dollars map
     of unspent revenue (Fund Balance Growth). Real program/revenue codes are
     non-negative, so the negative sentinels never collide. **Session 4 calls
     `computeFlows`, not `attributeSources` directly, so this is internal** —
     but if Session 6 reconciliation wants raw attribution it should use this
     shape and the exported `DRAWDOWN_SOURCE_CODE`/`GROWTH_PROGRAM_CODE`.
  2. **Pass 2 is aggregate-then-distribute, not the handoff's row-by-row loop.**
     The handoff pseudocode processes each fungible row independently and can
     overfill a program (or mis-handle surplus) if a single row's amount exceeds
     the remaining gap. I aggregate the fungible pool by source, compute
     `placedTotal = min(fungibleTotal, totalRemaining)`, distribute it across
     programs proportional to their gaps, then split each program's fill among
     sources proportional to what each source contributed — a nested `prorate`
     that is penny-exact on both axes and routes any unplaceable fungible dollars
     to growth uniformly. Same totals as the handoff on deficit data; strictly
     more correct on surplus/overflow data.
  3. **Penny-exactness** is achieved via `prorate` giving the LAST recipient the
     exact remainder (per the plan's hint), not integer-cents. Conservation
     tests assert `toBeCloseTo(_, 6)` (well past the penny); the engine drops
     links below `minWeight` (default **$0.005**) to kill float dust.
  4. **Column conservation caveat**: grand total is conserved in every column
     ONLY in the deficit/balanced case. In a **surplus** year, `fb:growth` is
     terminal in the Program column, so columns 0–1 total `revenue` while
     columns 2+ (activity onward) total `expenditure` (< revenue). This is
     economically correct (growth doesn't flow to activities), not a bug — the
     column-conservation invariant/test is a deficit-scenario check.

- **`computeFlows` call signature Session 4 depends on**:
  `computeFlows(expRows: ExpRow[], revRows: RevRow[], opts: { mode: SourceMode;
  enabledLevels: Level[]; filters: FlowFilters; minWeight?: number })
  → { nodes: SankeyNode[]; links: SankeyLink[]; totals: FlowTotals }`.
  - `enabledLevels` is normalized internally: `source`/`program`/`activity` are
    ALWAYS included regardless of what you pass, and levels are re-ordered to the
    canonical `source→program→activity→object→nces→school`. So passing just
    `["object"]` yields columns source,program,activity,object. Node `column` is
    the 0-based POSITION in the enabled set (enable only `school` → school is
    column 3, not 5) — the `flt:<col>` ids follow the same positional index.
  - `filters` sets are **include** sets (present ⇒ only listed codes pass;
    absent key ⇒ all pass). `sourceCodes` are category OR account codes matching
    `mode`. Fund-balance nodes (`fb:drawdown`/`fb:growth`) always bypass filters.
    Session 4 must materialize each filter as the effective selected `Set<number>`
    (or omit the key) before calling — the engine does no domain expansion.
  - Rows must be pre-filtered by the caller to ONE `(class_of, data_type)` and
    converted from arquero via `.objects()`. `attributeSources` only reads
    `program_code`/`amount` off exp rows, but `computeFlows` reads the full
    `ExpRow` fields for the enabled levels, so bake all columns.
  - `totals.grandTotal === revenue + drawdown === expenditure + growth` — the
    source-column total; use it for the chart title / reconciliation.
  - Node `custom.level` is `Level | "fundBalance" | "filtered"` and
    `custom.code` is `null` for fb/flt nodes — this is exactly what Session 5's
    `linkForNode` deep-link builder keys off of.

- **Verification**: `npm run test` → 14 suites / 76 tests green (25 new).
  `npx tsc --noEmit` clean. `npm run lint` clean on all 5 new files (verified
  with `eslint --fix`; repo-wide pre-existing prettier debt untouched).

### Session 4 — Expenditure Flow view (route + settings + chart) — DONE (static-verified) — 2026-07-21

- **What landed** (new route `app/finance/flow/`, plus two small additive nav
  entries; no existing dashboard behavior changed):
  - `app/finance/flow/FlowSettings.ts` — `FlowSettings` type,
    `DEFAULT_FLOW_SETTINGS` (one-element, on `DEFAULT_DATASET_SETTINGS`),
    the four custom URL-var serializers (`makeFlowSerializeConfig`), the
    enabled-level letter helpers (`serializeEnabledLevels`/
    `deserializeEnabledLevels`), and the exported generators array
    `SERIALIZE_FLOW_SETTINGS_GENERATORS`. Kept PURE (no client/sankey-runtime
    imports beyond the `Level`/`SourceMode` *types*) so it is jest-testable.
  - `app/finance/flow/FlowSettings.test.ts` — 4 new tests (level-letter
    round-trip + junk rejection; defaults omit `lv`/`sm`/`y`/`dt`; full
    URL round-trip of all four custom vars + a program-filter subset;
    latest/category/actuals defaults round-trip). 80 tests total now green.
  - `app/finance/flow/FlowLevelContents.tsx` — settings-panel widget:
    MUI checkboxes for Object/NCES/School optional levels + `SettingsSelect`s
    for source granularity and data type + a bespoke year `Select` (value
    `""` = Latest = `classOf:null`). Pulls `districtDataMap` from
    `useDistrictData()` (widgets don't receive districtData as a prop) and
    guards for the district being absent (empty year list).
  - `app/finance/flow/FlowDashboard.tsx` — the `"use client"` ContentComponent.
    Bakes `expenditures()`/`revenues()` to one `(class_of, data_type)` via
    `.params({year,dt}).filter(...).objects()`, builds `FlowFilters`, calls
    `computeFlows`, adapts nodes/links to a single Highcharts `sankey` series,
    renders `<HighchartsReact>` inside `<SettingsLayout>`.
  - `app/finance/flow/FlowPage.tsx` + `page.tsx` — `EnsureDistrictData` wiring
    and server metadata.
  - `app/PrimaryNav.tsx` + `app/finance/_widgets/FinanceSubNav.tsx` — added
    "Expenditure Flow" → `/finance/flow`, placed after Revenues.

- **Reconciliation with Session 3's REAL signatures (not the plan's sketch)**:
  - Called `computeFlows(expRows, revRows, { mode, enabledLevels, filters })`
    exactly as Session 3 shipped it. `enabledLevels` is passed as ONLY the
    optional levels (`[...settings.enabledLevels]`); the engine adds
    source/program/activity and normalizes order internally, so the settings
    only ever store the optional trio. `attributeSources` is never called
    directly from here (the engine owns it), so its `{progTot, attributed}`
    return shape and the drawdown/growth sentinels are internal as documented.
  - `FlowFilters` sets are include-sets. I pass the full settings Sets for every
    level every render (source uses `revenueCategoryCodes` vs `revenueCodes`
    per `sourceMode`). Passing the full "all selected" default Set is a no-op
    (everyone passes), and filters for disabled levels are never consulted
    because the engine only checks cells present in each record's path — so no
    special-casing was needed. `totals.grandTotal` drives the chart subtitle.

- **Deviations from plan + why**:
  - Per Session 2's precedent, `FlowSettings`'s filter fields are populated in
    the defaults (not left `undefined`) even though the type spells them
    `Partial<...>`; the `"filter"` serializers call `filter.toFilterString(
    settings[key])` and need a defined Set. A fully-populated object is
    assignable to the `Partial` type, so nothing is lost.
  - The generators array lives in `FlowSettings.ts` (pure), not in
    `FlowPage.tsx`, specifically so the round-trip test can import it without
    dragging in `HighchartsReact`/MUI/the provider tree. `FlowPage` and
    `FlowDashboard` both import it from there.
  - Context settings: `DEFAULT_COMMON_CONTEXT_SETTINGS` with an empty generators
    array and empty `contextSettingsComponents` — no context panel renders and
    `serializeContext` returns `""` (no `c=` in the URL), matching "no facet".
  - Chart height: `700` normally, `Math.max(700, nodeCount*14)` when School is
    enabled (per the ~110-node guard in the plan).
  - Added a minimal empty-state Typography when `links.length === 0` (cheap
    insurance; the fuller friendly empty-state polish is still Session 6's).

- **Verification — STATIC ONLY (no browser; claude-in-chrome not connected)**:
  - `npx tsc --noEmit` clean; `npm run test` → 15 suites / 80 tests green
    (4 new); `npm run build` succeeds with `/finance/flow` in the static route
    list; `npm run lint` clean on all new `app/finance/flow/*` files (via
    `eslint --fix`; the 2-line nav additions match neighbor single-quote style,
    so `PrimaryNav.tsx`/`FinanceSubNav.tsx` carry only the same pre-existing
    prettier debt as before — unchanged by this session).
  - `npm run dev` + `curl`: `/finance/flow`, `?d=c.17001~lv.o`, and
    `?d=c.17001~sm.a~dt.b` all return HTTP 200 with NO server error. NOTE: a
    hand-built GARBAGE filter (`?d=c.17001~p.A`) logs `Error: Iterator overrun`
    during SSR — but this is PRE-EXISTING `number_set` decoder behavior on
    malformed input, NOT a flow bug: the identical error reproduces on the
    existing `/finance/expenditures?d=c.17001~p.A`. Real serializer output never
    emits such strings; the round-trip test exercises valid encodings only.
  - **NOT visually confirmed in a browser**: the AVRO→arquero→`computeFlows`→
    Highcharts render, the actual Sankey drawing, the reconciliation totals
    (Seattle 2024-25 actuals ≈ $1.196B / drawdown ≈ $23.71M), and the
    Filtered-Out band appearing when programs are narrowed. The compute engine
    itself IS hand-verified at those magnitudes by Session 3's scratch check
    ($1195.86M / $23.71M), and the settings round-trip IS covered by the new
    tests — but a real browser pass on `/finance/flow` is still OPEN and is the
    single biggest thing Session 6's reconciliation must actually eyeball.

- **Notes for Session 5 (band tooltips with deep links)**:
  - `node.custom` shape (from Session 3, confirmed wired straight through this
    route into the Highcharts node options): `{ level: Level | "fundBalance" |
    "filtered"; code: number | null }`. For real nodes `code` is the domain code
    (category_code or revenue_code for source per mode; program/activity/object/
    nces/school codes for the rest); for `fb:*` and `flt:*` nodes `code` is
    `null` and `level` is `"fundBalance"`/`"filtered"` → those get no link.
  - In `FlowDashboard.tsx` the `ctx` a `linkForNode` builder needs is available
    from `allSettings[0]`: `ccddd = settings.ccddd` and `sourceMode =
    settings.sourceMode`. (Year/data_type are also on `settings` if a deep link
    should carry them, but the plan's link table doesn't.)
  - Highcharts node options passed are exactly `{id, name, color, column,
    custom}`; in a sankey point formatter, `this.point.fromNode.options` /
    `.toNode.options` expose that object, so `linkForNode(point.fromNode.options,
    ctx)` works. The series currently sets only `tooltip:{enabled:true}` and a
    `dataLabels` style — Session 5 replaces the tooltip block.
  - **Deep-link generator wiring THIS route already has** (so Session 5's link
    table can rely on it): source→`/finance/revenues` uses `rc`/`rv` — those
    generators exist (`makeRevenueSerializeConfig`, Session 1/2). program/
    activity/object→`/finance/expenditures` use `p`/`a`/`o` — exist. For
    nces/school→`/finance/detailedactuals`: that page's generators DO include
    `makeNcesSerializeConfig` (`n`) and `makeSchoolFilterConfig` (`s`) (verified
    in `DetailedActualsPage.tsx`), so nces/school deep links ARE viable — do not
    return null for them. This flow route also serializes `n`/`s` itself.

### Session 5 — Band tooltips with two deep links — DONE (static-verified) — 2026-07-21

- **What landed**:
  - `utilities/sankey/deepLinks.ts` — `linkForNode(node: SankeyNode, ctx:
    {ccddd:number; sourceMode:SourceMode}): {href, label} | null`. Hand-composes
    the `d`/`c` URL fragments (`c.<ccddd>~<urlVar>.<Filter.toFilterString(
    new Set([code]))>` + `&c=<facet>`) per the plan's node→dashboard→urlVar
    table, `encodeURIComponent`-ing the whole `d` value. Returns `null` whenever
    `node.custom.code === null` (covers both `fb:*`/`level:"fundBalance"` and
    `flt:*`/`level:"filtered"` per Session 3/4's confirmed shape) before even
    looking at `level`, plus a `switch` default for defense in depth.
  - `utilities/sankey/deepLinks.test.ts` — 10 tests, all green. Covers all 7
    linkable rows of the table (source×2 modes, program, activity, object,
    nces, school) plus fb/filtered/null-code null cases. For program and
    object, goes further than a bare `Filter.fromFilterString` check: feeds the
    generated `d` value through the **real**
    `CommonSettings.deserializeDatasetSettings` with
    `[makeDatasetSerializeConfig, makePaoSerializeConfig]` (exactly what
    `SERIALIZE_EXPENDITURES_SETTINGS_GENERATORS` is built from) and asserts
    `programCodes`/`objectCodes === Set([code])` end to end.
  - `app/finance/flow/FlowDashboard.tsx` — replaced the Session 4 placeholder
    `tooltip: { enabled: true }` with the full `useHTML`/`stickOnContact`
    formatter from the plan (band hover: `From → To` + compact-USD weight +
    up to two `linkForNode`-built links; node hover: name + through-flow sum +
    a single link when linkable — the Session 5 nice-to-have, included). Also
    added a `plotOptions.sankey.point.events.click` handler that opens a small
    MUI `Popover` (anchored at the click position) with the same two links,
    built from the exact same `linkForNode` calls via a shared `bandLinks()`
    helper — see "Tooltip approach shipped" below for why.

- **Facet-index verification (done, not blindly trusted from the plan)**: read
  the real `ALL_FACETS`/`serialize*Facet` in `RevenuesContextSettings.tsx`
  (`category`→`"0"`, `revenue`→`"1"`, `program`→`"2"`),
  `ExpendituresContextSettings.tsx` (`activity`→`"0"`, `program`→`"1"`,
  `object`→`"2"`), and `DetailedActualsDashboard.tsx`
  (`activity`→`"0"`,`program`→`"1"`,`object`→`"2"`,`school`→`"3"`,`nces`→`"4"`).
  The plan's `f.0`/`f.1`/`f.2` numbers for source/program/activity/object
  turned out to match reality exactly — no override needed. The plan's table
  didn't specify a context facet for nces/school (only "verify viability"); I
  added `f.4`/`f.3` for them anyway (a small, low-risk enhancement beyond the
  literal spec) so those deep links land on detailedactuals with the linked
  code's own facet already selected, consistent with every other row of the
  table — flagged here as a deviation, not hidden.
  - nces/school viability: re-confirmed Session 4's claim myself by reading
    `SERIALIZE_DETAILED_ACTUALS_SETTINGS_GENERATORS` in
    `DetailedActualsPage.tsx` — it does include `makeSchoolFilterConfig` (`s`)
    and `makeNcesSerializeConfig` (`n`). Both links are real, not null.

- **Tooltip approach shipped: formatter (hover) + Popover (click) fallback,
  both wired, neither one alone.** Rationale: `stickOnContact: true` (the
  plan's primary mechanism) *does* have in-repo precedent — it's already used
  in `utilities/highcharts/ChartConfigGenerators.tsx`'s budget/actuals tooltip
  — which is somewhat reassuring, but that precedent is a plain
  `shared: true` tooltip with no `useHTML`/clickable-link content, so it
  doesn't actually validate the "pointer can cross into the tooltip and click
  a link" behavior this session needs. Browser automation was checked (see
  Verification below) and is NOT available in this environment, so the click-
  through behavior could not be watched directly. Per the plan's explicit
  guidance ("If it's not testable and you're not confident stickOnContact
  alone is reliable, add the fallback"), I shipped both: the HTML tooltip
  formatter as primary UX, and a click handler on
  `plotOptions.sankey.point.events.click` that opens an MUI `Popover` with the
  identical two links as a guaranteed-clickable fallback surface, independent
  of tooltip hover/stick timing. Both draw from the same `linkForNode` calls
  (via the shared `bandLinks()` helper) so there is exactly one place that
  decides what a node/band links to.

- **Deviations from the plan + why**:
  - Added the nces/school `f.4`/`f.3` context-facet extras not listed in the
    plan's table (see Facet-index verification above) — pure enhancement,
    same mechanism as the other rows, no risk identified.
  - Shipped the Popover fallback unconditionally rather than "only if clicks
    don't land" — because there was no way to observe whether clicks land
    (see Tooltip approach above). This is the conservative reading of the
    plan's own contingency instruction, not a rejection of `stickOnContact`;
    `stickOnContact` is still enabled and is the primary hover UX.
  - `linkForNode`'s hand-composed `d` value deliberately does NOT round-trip
    through each target page's actual `*Page.tsx` generator arrays at runtime
    (e.g. does not import `SERIALIZE_EXPENDITURES_SETTINGS_GENERATORS` from
    `ExpendituresPage.tsx`) — per the plan, hand-composition is explicitly
    sanctioned as "acceptable and easier to test." Verified in the test file
    that no existing test in this repo imports a `*Page.tsx` file directly
    (all use `common_settings.ts`'s generator functions directly, e.g.
    `common_settings.test.ts`); matched that precedent rather than introducing
    a new import-a-Page-file-in-a-test pattern. The round-trip tests for
    program/object still use the *real* `deserializeDatasetSettings` +
    `makeDatasetSerializeConfig`/`makePaoSerializeConfig` (the exact functions
    `SERIALIZE_EXPENDITURES_SETTINGS_GENERATORS` is composed from), so the
    "real generators" bar from the plan's spec is met without the extra
    transitive import weight.

- **Verification**:
  - **Browser automation availability — checked, not available.** Invoked the
    `claude-in-chrome` skill directly this session; it reported the Chrome
    extension is not connected in this environment and instructed not to
    attempt any `mcp__claude-in-chrome__*` calls. Per the task's fallback
    path, verification proceeded via static methods only.
  - `npx tsc --noEmit`: clean.
  - `npm run test`: 16 suites / 90 tests green (10 new, all in
    `deepLinks.test.ts`).
  - `npm run lint` on touched files: `deepLinks.ts` and `deepLinks.test.ts`
    clean (0 errors/warnings after `eslint --fix` on the test file's prettier
    formatting). `FlowDashboard.tsx` has exactly one **warning** (not error):
    `react-hooks/unsupported-syntax` / "Compilation Skipped: `this` is not
    supported syntax," pointing at the Highcharts `formatter(this: any) {...}`
    — an unavoidable consequence of Highcharts' `this`-bound formatter API
    (same pattern the plan's own snippet specifies). Confirmed via
    `git stash -u` before/after repo-wide `npm run lint` comparison: baseline
    8270 problems (8268 errors / 2 warnings) → after this session's changes
    8271 problems (8268 errors / 3 warnings) — **zero new errors, one new
    (unavoidable) warning**, all pre-existing debt elsewhere untouched.
  - `npm run build`: succeeds; `/finance/flow` still in the static route list.
  - `npm run dev` + `curl`, against a **freshly started** dev server (found and
    killed a stray pre-existing `next dev` process from earlier in the day
    still holding port 3000/the Turbopack lock file, to make sure the curl
    hits were actually compiling this session's code, not stale output):
    `/finance/flow`, `/finance/flow?d=c.17001~lv.o`,
    `/finance/flow?d=c.17001~sm.a~dt.b`,
    `/finance/expenditures?d=c.17001~p.QA&c=f.1`,
    `/finance/revenues?d=c.17001~rc.gA&c=f.0`,
    `/finance/detailedactuals?d=c.17001~n.gA&c=f.4`, and
    `/finance/detailedactuals?d=c.17001~s.gA&c=f.3` all returned HTTP 200 with
    real (non-cached) compile times in the server log and no server-side
    errors in the response body.
  - **NOT visually confirmed in a browser (open for Session 6 or a human)**:
    hovering a band and seeing the tooltip with both links; whether
    `stickOnContact` actually keeps the tooltip open long enough for a pointer
    to reach and click a link (the exact uncertainty that motivated shipping
    the Popover fallback); clicking a node/band and seeing the Popover appear
    and its links work; that each opened target dashboard is *visibly*
    filtered to exactly the right node (URL-level correctness is
    tested/verified per above, but the resulting chart render on the target
    page was not eyeballed). This compounds with Session 4's still-open item
    (the Sankey chart's own rendering was never visually confirmed either) —
    Session 6 should treat "open `/finance/flow` in a real browser and
    interact with it" as the single highest-value verification step still
    outstanding across both sessions.

- **Notes for Session 6**: nothing here blocks reconciliation work. The two
  open visual-confirmation items (Session 4's chart render, this session's
  tooltip/Popover click-through) are independent of the numbers Session 6 is
  reconciling, but Session 6 should still eyeball both while it has a browser
  open for the reconciliation pass anyway, and note in its own log entry
  whether `stickOnContact` alone would have sufficed (i.e. whether the
  Popover fallback turned out to be load-bearing or just insurance).

### Session 6 — Reconciliation, polish, cross-links — DONE (found + fixed 2 real compute bugs) — 2026-07-21

**Browser automation: checked, STILL NOT AVAILABLE.** Re-invoked the
`claude-in-chrome` skill this session; it again reports the Chrome extension is
not connected. So the two open visual items (Sankey render, tooltip/Popover
click-through) remain **UNVERIFIED in a real browser** — see "What is still
open" at the bottom. In place of a browser, this session drove the REAL compute
engine over the REAL cached AVRO data via a throwaway Node decoder + jest
harness (now deleted; the decode logic mirrored `FetchData.ts`'s
`DecimalToNumberType` exactly, so the numbers below are what the browser client
would parse from the same files).

**This session found and fixed TWO real correctness bugs in Session 3's compute
engine** that only surface on real data with negative (correction/abatement)
line items — the synthetic fixtures and Session 3's magnitude-only scratch check
never exercised negatives, so they slipped through. Details under "Bugs" below.

#### Reconciliation checklist — Seattle 17001, 2024-25 actuals (default view)

Method: decoded `gs://…/17001/gf_expenditures` and `…/gf_revenues` AVRO, filtered
to `class_of==2025 && data_type=="actuals"`, ran the real `computeFlows`.

- [x] **VERIFIED — Grand total = $1,195,855,065.08** (plan said ≈ $1,195.86M).
      Equals total expenditure to the penny; equals `revenue + drawdown` and
      `expenditure + growth`.
- [x] **VERIFIED — Revenue = $1,172,148,744.12** (plan said ≈ $1,172.15M).
      Equals the raw revenue-frame sum.
- [x] **VERIFIED — Fund Balance Drawdown = $23,706,320.96** (plan said ≈ $23.71M).
      Equals expenditure − revenue exactly. **This is also the
      `districtData.cashflow()` cross-check**: `cashflow()` groups the same two
      frames by `class_of` and derives `revenues − expenditures`; per-year that
      is −$23,706,320.96 for 2025 (see the full per-year table computed this
      session — every historical year's exp/rev/cashflow was dumped and 2014-2019
      + 2021 are surplus years, 2020 + 2022-2025 are deficit).
- [x] **VERIFIED — Per-program inflow == outflow.** Max |inflow−outflow| across
      all 32 programs = $0.00 (default), $0.01 (account mode, float dust across
      860 links). Note the crediting is per-record so in==out is structural;
      after the Bug B fix, in==out ALSO == progTot (net) for every program.
      Top programs (in==out): Basic Education $489,664,037.00; Special Education
      Supplemental (State) $258,342,147.67; Districtwide Support $158,656,770.87;
      Pupil Transportation $63,819,395.43; Instructional Programs Other
      $53,408,810.95. These match the expenditures dashboard faceted by program
      (`/finance/expenditures?...&c=f.1`; facet index `f.1` = program, confirmed
      against `ExpendituresContextSettings.tsx` in Session 5's log).
- [x] **VERIFIED — Column conservation.** After the fixes, every column sums to
      $1,195,855,065.08 (Δ ≤ $0.01 float dust) in default, +object, account, and
      program-filtered views. **Before the fixes this FAILED** (columns overshot
      by $2.49M default / $9.69M with object — see Bug B).
- [~] **PARTIAL — Side-by-side with the static plotly variant**
      `public/analyses/sps_sankey_avro_spao_expanded_source_actuals_2024-2025.html`.
      That file (and its siblings) is a ~4.8 MB self-contained plotly HTML; the
      analyses page labels ALL the 2024-25 SPS Sankeys "$1,195.9M", which is the
      true expenditure total and **matches our post-fix grand total
      $1,195,855,065.08 to the rounding shown**. I did NOT diff individual band
      weights against the embedded plotly JSON (it's minified base64-ish blobs,
      not worth parsing); the headline total agreement plus the penny-exact
      internal reconciliation is the evidence. The pre-fix engine ($1,195.70M)
      would NOT have matched the static "$1,195.9M" label — the fix brought them
      into agreement.

#### Bugs found + fixed (corrections to Session 3's `utilities/sankey/`)

Both are the same blind spot: the algorithm assumed all dollar amounts are
non-negative. Real OSPI data has 332 negative expenditure lines (−$27.28M
gross, netting inside their tuples) and 3 negative directed revenue rows
(−$152,169.48) for Seattle 2024-25.

1. **`attribution.ts` (Session 3) — net-negative directed revenue was silently
   dropped.** Pass 1 computed `v = Math.min(amount, room)` then guarded
   `if (v > 0)` / `if (spill > 0)`. For a directed revenue account whose net is
   negative (a mid-year correction), `v` was negative → not placed, and
   `spill = amount − v = 0` → not spilled either, so the negative simply
   vanished. Effect: total attributed real-source dollars EXCEEDED revenue by
   the dropped amount ($152,169.48), so `grandTotal` (= revenue + drawdown) and
   the reported drawdown were BOTH short by $152,169.48 ($1,195.70M / $23.55M
   instead of $1,195.86M / $23.71M). **Fix:** `v = amount > 0 ? min(amount,
   room) : 0` and spill on `if (spill !== 0)`, so negatives net into the
   fungible pool. Pass 2 was also hardened: the fungible pool can now hold a
   net-negative source, so placement/growth are prorated over only the POSITIVE
   fungible sources while the net still counts in `fungibleTotal` (a negative
   correction shrinks the placeable pool → surfaces as extra drawdown, never as
   a negative band). Total attribution now equals revenue to the penny in both
   category and account mode.
2. **`flows.ts` (Session 3) — net-negative expenditure tuples were dropped,
   breaking column conservation.** The per-row loop expanded each aggregated
   `(program, activity[, object…])` tuple across sources with
   `prorate(row.amount, …)` then `if (w <= 0) continue`. A tuple whose NET is
   negative produced all-negative shares that were all skipped, so its magnitude
   leaked: emitted bands summed to MORE than the grand total, and the overshoot
   GREW with granularity (5 net-negative tuples = −$2.34M at program|activity;
   12 = −$9.54M at program|activity|object — both matched the observed column
   overshoot to the cent). **Fix:** group tuples by program, drop the net-≤0
   tuples, and `prorate(progTot, positiveTupleAmounts)` to scale the survivors
   so each program's emitted flow sums EXACTLY to its net `progTot` (= its
   attributed inflow). This distributes a program's small net refund
   proportionally across its positive children — a defensible, penny-exact,
   conserving treatment (a Sankey can't draw a negative-width band). Every
   column now conserves.

Both fixes carry a **regression test**: `attribution.test.ts` ("negative
directed revenue … drawdown == exp − rev", asserts real-source attributed ==
revenue, all attributed values ≥ 0, drawdown fills the gap) and `flows.test.ts`
("nets a negative tuple without breaking column conservation", asserts the
negative activity produces no band, the positive is scaled to the net, and every
column conserves). Suite: **16 files / 92 tests green** (was 90; +2 regressions).
All 25 pre-existing sankey tests still pass unchanged.

#### Edge cases exercised (real AVRO, real `computeFlows`)

- [x] **`data_type=budget`, Seattle 2025** (deficit, $1,252,959,867.00 exp):
      grandTotal == exp, drawdown $134,519,253.00 == exp − rev, columns conserve.
- [x] **Surplus year → Fund Balance Growth path** (Seattle 2019 actuals, +$38.13M;
      2021 actuals, +$37.42M): `growth` == revenue − expenditure exactly, a
      terminal `fb:growth` node is emitted, `drawdown == 0`. Column totals are
      correctly asymmetric here (source col == revenue, activity col ==
      expenditure) — the documented Session-3 surplus caveat, not a bug.
- [x] **Small district** (Wishram 20094, ~$3.0M): actuals AND budget both
      reconcile, object column conserves, no attribution-clamp blow-up; both
      happen to be small surplus years (growth path). No "revenue directed to a
      missing program" pathology observed (that money spills to fungible as
      designed — covered by an existing Session-3 test).
- [x] **Empty frame** (Seattle 2014 budget = 0 rows): `computeFlows` returns 0
      nodes / 0 links → `FlowDashboard` renders the friendly empty-state
      Typography, no crash.
- [x] **curl smoke test** (fresh dev server): `/finance/flow`,
      `?d=c.17001~dt.b` (budget), `?d=c.17001~lv.o~sm.a` (object + account mode),
      `?d=c.20094` and `?d=c.20094~dt.b` (small district), `/analyses` — all
      HTTP 200, zero runtime-error markers in the SSR body. (Client-side chart
      render still needs a browser — see below.)

#### Polish landed (`FlowDashboard.tsx`)

- **Loading state**: verified already wired — `FlowPage` → `EnsureDistrictData`
  renders `<Loading text="Loading distrct data for …"/>` until the district's
  data is in `districtDataMap`, then mounts `FlowDashboard`. No change needed.
- **Title / subtitle**: title shows `${district} — General Fund Expenditure
  Flow`; subtitle now shows `${FY} ${Actuals|Budget} · Total … · Revenue … ·
  <fund-balance clause>`. **Fixed a subtitle bug I introduced-adjacent**: it
  used to hard-code "Fund Balance Drawdown", which read "Drawdown $0.00" in a
  surplus year; it now shows "Fund Balance Growth …" in surplus, "… Drawdown …"
  in deficit, or "Balanced".
- **"Filtered Out" legend note**: added a `caption` below the chart explaining
  that attribution runs on the whole fund and that filtered flow re-routes into
  the gray Filtered Out band (so every column still totals the grand total),
  with an extra sentence when a Filtered Out band is actually present.
- **Number formatting**: all currency via the shared `makeCurrencyFormatter(2)`
  (compact USD), consistent with the rest of the app.

#### Cross-links

- **`app/analyses/page.tsx`**: added a highlighted callout at the top of the
  "Expenditure Flows (Sankey)" section pointing to the interactive
  `/finance/flow` (explains it covers any district/year/budget-vs-actuals and is
  click-through to the underlying data; frames the static HTML files below as
  fixed 2024-25 SPS snapshots). Matched the file's existing single-quote style.
- **Expenditures dashboard header link**: **intentionally skipped.**
  `ExpendituresDashboard.tsx` has no header/description text element — only
  `<HcDashboard/>` inside `SettingsLayout` — so there is no natural, small spot
  without adding a new element and risking the "don't modify existing dashboards'
  behavior" guardrail. The flow view is already in `FINANCE_NAV_CONFIGS`
  (Session 4), so it's discoverable. Per the plan's "don't force it," omitted.

#### Verification

- `npm run test` → 16 suites / 92 tests green.
- `npm run lint` → the 5 clean-part files I touched (`attribution.ts`,
  `flows.ts`, both `.test.ts`, `FlowDashboard.tsx`) are 0-error after
  `eslint --fix`; `FlowDashboard.tsx` keeps the ONE pre-existing unavoidable
  warning from Session 5 (`react-hooks/unsupported-syntax` on the Highcharts
  `formatter(this: any)`). `app/analyses/page.tsx` additions match that file's
  established single-quote style (its prettier double-quote "errors" are the
  same repo-wide pre-existing debt Sessions 1-5 documented; not reformatted, to
  avoid a whole-file noise diff).
- `npm run build` → succeeds; `/finance/flow` and `/analyses` in the route list.
- **Did NOT run `npm run deploy`** (per instruction).

#### Tooltip / Popover question left for Session 5's log

Could NOT determine whether `stickOnContact` alone would have sufficed vs. the
Popover fallback being load-bearing — that requires a real browser hover/click,
which was unavailable. The Popover fallback remains shipped as insurance.

#### What is still open (the one thing a human / browser-equipped session must do)

**The single highest-value remaining check: open `/finance/flow` in a real
browser and confirm (a) the Sankey actually renders (bands, per-column
alignment, Fund Balance / Filtered Out nodes pinned by `node.column`), (b)
hovering a band shows the HTML tooltip with two working deep links, (c)
`stickOnContact` lets the pointer reach and click those links — and if not, that
the click-to-open Popover fallback works, and (d) each deep link lands on the
target dashboard visibly filtered to that node.** Everything numeric is now
VERIFIED against real data to the penny and every route SSR-renders without
error, but no session in this project has ever seen the chart paint or the
tooltip interact in a browser. **Assessment: the compute/data layer is
trustworthy to ship; the rendering/interaction layer is code-complete and
statically sound but visually unconfirmed — do a ~10-minute manual browser pass
before relying on the interactive UI.**

---

## Post-plan changes (user-requested, after Session 6)

### Draggable/orderable levels — OVERRIDES Locked decision 1 — 2026-07-22
- The flow view's level selection is now a draggable, enable/disable list
  instead of fixed order + always-on source/program/activity. Resource (Source)
  and Program are pinned to positions 1 & 2 (cannot be dragged); Resource can be
  disabled but Program cannot (it is the attribution linchpin — always shown,
  enforced in `deserializeLevelPlan` so even a hand-crafted URL can't hide it).
  Activity/Object/NCES/School can be reordered and toggled. (The engine still
  supports hiding program for generality; the product just never asks it to.)
- This deliberately supersedes **Locked decision 1** ("Sankey level order is
  fixed: Source → Program → Activity always, then optional Object/NCES/School").
  The user asked for it directly.
- Engine (`utilities/sankey/flows.ts`): `ComputeFlowsOpts.enabledLevels` is now
  the EXACT ordered list of display columns. Any level may be omitted; levels
  may be in any order. Program is still ALWAYS used internally for revenue
  attribution even when its column is hidden. When Source is hidden, the revenue
  side (and Fund Balance nodes) drop and the diagram starts at the first
  expenditure column. All existing conservation tests still pass unchanged; new
  tests cover reordering + hiding source/program.
- Settings (`FlowSettings.ts`): `enabledLevels: Set<Level>` replaced by
  `levelPlan: LevelPlan` (ordered `{level, enabled}[]`). URL var `lv` now encodes
  one letter per level (r/p/a/o/n/s), UPPERCASE=enabled, Resource+Program first,
  then reorderables in chosen order (e.g. default `RPAons`, omitted when default).
- Widget (`FlowLevelContents.tsx`): native HTML5 drag-and-drop list (no new dep).
- Also (separate small asks): the diagram now renders uniform neutral gray with a
  single accent color revealed only on hover, and nodes are size-sorted (largest
  at the top of each column). Verified: 97 tests green, tsc + lint clean, build
  ok, all URL forms SSR 200. Still visually unconfirmed in a real browser (no
  browser automation available) — same standing caveat as Sessions 4-6.
