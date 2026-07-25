# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SPS By the Numbers — a financial analytics dashboard for Seattle Public Schools district data. Built on Next.js (App Router) with client-heavy architecture: BigQuery data is cached as AVRO files in Cloud Storage, fetched client-side, manipulated with Arquero dataframes, and visualized with Highcharts Dashboards.

## Commands

| Task | Command |
|---|---|
| Dev server (recommended) | `npm run dev:watch` (runs TS watch + Next.js dev + Jest watch in parallel) |
| Dev server only | `npm run dev` (Next.js with Turbopack) |
| Build | `npm run build` |
| Test | `npm run test` |
| Test watch | `npm run test:watch` |
| Run single test | `npx jest path/to/file.test.ts` |
| Lint | `npm run lint` |
| Lint fix | `npm run lint:fix` |
| Deploy | `npm run deploy` (Firebase Hosting) |

Firebase Functions have a separate package.json in `functions/`:
- `cd functions && npm run build` — compile and bundle
- `cd functions && npm run dev` — watch mode with Firebase emulators
- `cd functions && npm run deploy` — deploy Cloud Functions

## Architecture

### Data Flow

1. **Cloud Functions** (`functions/src/finance.ts`) query BigQuery and cache results as AVRO in Cloud Storage. `functions/src/bigsheet.ts` + `functions/src/bigsheet/` is a second endpoint: it builds ONE BigQuery SQL string that joins ~1,240 columns of per-school data (a SQL port of data-tools `marts/bigsheet.py`, generalized to any WA district by `ccddd`) and `EXPORT DATA`s DEFLATE AVRO to the same cache bucket. Shared cache helpers live in `functions/src/cache.ts` (extracted from finance.ts). Fidelity is proven by `functions/scripts/golden_diff.ts` against a frozen Python golden (value-for-value).
2. **Client** fetches cached AVRO via public Cloud Storage URLs (`utilities/client/FetchData.ts`)
3. **DistrictData** (`utilities/DistrictData.tsx`) parses AVRO into typed data with domain-specific filters
4. **ChartableMetrics** (`utilities/ChartableMetrics.ts`) aggregates multiple DistrictData objects for charting
5. **Highcharts Dashboards** renders charts using DOM-direct rendering (not React components)

### Settings & URL State

Dashboard filters are serialized to URL query params for shareable links. The settings system lives in `app/finance/_settings/` with base classes for serialization/deserialization. Each dashboard type has its own settings (dataset settings for PAO filters, context settings for overlays).

### Filter System

Finance data uses OSPI classification codes: Activity, Program, Object, and Duty Root. Filters live in `app/finance/_filteritems/` with domain mappings in `utilities/domain/`. CCDDD codes are county+district identifiers. Synthetic activity codes 9990+ represent combined historical activities.

### Highcharts Integration

Highcharts modules are loaded asynchronously via `components/providers/HighchartsProvider.tsx`. Faceted dashboard layouts are generated in `utilities/highcharts/FacetedDashboard.tsx` producing JSON config for the Highcharts Dashboards GUI layout system.

### Provider Pattern

Root layout (`app/layout.tsx`) wraps the app in MUI and Highcharts providers. `DistrictDataProvider` (`app/finance/_providers/`) manages data loading per district. Page components use `"use client"` pragma.

## Key Directories

- `app/finance/` — main finance dashboards (expenditures, vitals, staffing, correlations, enrollment, assessments)
- `utilities/domain/` — OSPI code mappings
- `app/finance/_filteritems/` — filter logic with tests
- `app/finance/_settings/` — settings serialization with tests
- `app/finance/_widgets/` — dashboard UI components (selectors, settings panels)
- `utilities/highcharts/` — chart config generators and faceted layout
- `utilities/` — shared business logic (DistrictData, ChartableMetrics, filters, normalizations)
- `data/safs/` — static OSPI domain data (activities, objects, programs, schools)
- `functions/` — Firebase Cloud Functions (separate TypeScript project). `src/cache.ts` (shared sha256/path/export helpers), `src/bigsheet/` (the SQL generator: `names.ts`, `staticSql.ts`, `pivots.ts`, `assemble.ts`, verbatim `sql/` provenance), `src/bigsheet.ts` (endpoint). Unit tests: `src/bigsheet/bigsheet.test.ts`, `src/cache.test.ts` (`npm run test:unit`). The golden-diff gate + non-SPS smoke are `scripts/golden_diff.ts` / `scripts/nonsps_smoke.ts` (tsx + ADC, not jest).
- `config/constants.ts` — Firebase config, endpoints (conditional prod vs test), MUI theme

## Key Dependencies

- **Highcharts** + @highcharts/dashboards + grid-pro for visualization
- **Arquero** for client-side dataframe manipulation (mocked in tests via `__mocks__/arquero.ts`)
- **MUI Material** + MUI X (data grid, tree view) for UI
- **Firebase** (Hosting, Cloud Functions, Cloud Storage)
- **avsc** for AVRO format parsing

## TypeScript Path Aliases

Configured in tsconfig.json: `styles/*`, `app/*`, `components/*`, `common/*`, `config/*`, `data/*`, `utilities/*`

## Testing

Jest with ts-jest and jsdom environment. Tests live alongside source files (`*.test.ts`). The `functions/` directory has its own Jest config using Firebase emulators.
