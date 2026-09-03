"use client";

// Salaries dashboard: every S-275 total_final_salary for one district and
// year, one column per person, grouped by duty title and wrapped across rows.
//
// This fetches `s275_salaries` itself rather than going through DistrictData.
// That dataset is one row per employee (~82k rows across all years for SPS)
// and only this page reads it, so loading it in the shared provider would put
// it on the wire for every finance dashboard.

import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useState } from "react";

import SettingsLayout from "app/finance/_widgets/SettingsLayout";
import {
  ActivityFilterContents,
  DutyRootFilterContents,
  ProgramFilterContents,
} from "app/finance/_widgets/ExpenditureFilterContents";
import {
  serializeDatasetSettings,
  serializeOneSetting,
} from "app/finance/_settings/common_settings";
import { fetchDataset } from "utilities/client/FetchData";

import SalarySkyline from "./SalarySkyline";
import {
  RowWidthContents,
  SalariesDatasetContents,
  SchoolYearContents,
} from "./SalariesSettingsContents";
import { groupByDuty, planRows } from "./rowPlan";
import {
  SERIALIZE_SALARIES_CONTEXT_SETTINGS_GENERATORS,
  SERIALIZE_SALARIES_SETTINGS_GENERATORS,
} from "./settings";

import type { Person } from "./rowPlan";
import type { SalariesContextSettings, SalariesSettings } from "./settings";

type Row = {
  school_year: string;
  duty_root: string | null;
  duty_root_code: number | null;
  // Program and activity were added to the dataset after the first deploy, so
  // treat them as optional: an older cached export simply has no such column,
  // and the filters below pass everything through rather than empty the chart.
  program_code?: number | null;
  activity_code?: number | null;
  total_final_salary: unknown;
  fte: unknown;
};

type Result = { ccddd: number; rows: Row[] | null };

// Avro decimal columns arrive as a Decimal wrapper, JSON fixtures as strings,
// and plain ints as numbers; normalize before doing arithmetic on any of them.
function num(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  const maybe = v as { toNumber?: () => number };
  return typeof maybe.toNumber === "function" ? maybe.toNumber() : Number(v);
}

type Props = {
  allSettings: Array<SalariesSettings>;
  contextSettings: SalariesContextSettings;
};

export default function SalariesDashboard({
  allSettings,
  contextSettings,
}: Props) {
  const settings = allSettings[0];
  const ccddd = settings.ccddd;
  // The result carries the district it belongs to, so a stale result for the
  // previous district reads as "still loading" without an effect having to
  // synchronously clear state on every change.
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    let live = true;
    fetchDataset(ccddd, "s275_salaries")
      .then((table) => {
        if (live) setResult({ ccddd, rows: table.objects() as Row[] });
      })
      .catch((err) => {
        if (!live) return;
        console.error("s275_salaries fetch failed", err);
        setResult({ ccddd, rows: null });
      });
    return () => {
      live = false;
    };
  }, [ccddd]);

  const current = result?.ccddd === ccddd ? result : null;
  const rows = current?.rows ?? null;
  const failed = current !== null && current.rows === null;

  const years = useMemo(() => {
    if (!rows) return [];
    return [...new Set(rows.map((r) => r.school_year))].sort().reverse();
  }, [rows]);

  // "" (or a year this district never filed) falls back to the newest year
  // present rather than rendering an empty chart.
  const year = years.includes(contextSettings.year)
    ? contextSettings.year
    : (years[0] ?? "");

  const people: Person[] = useMemo(() => {
    if (!rows || !year) return [];
    const passes = (code: number | null | undefined, codes: Set<number>) =>
      code === null || code === undefined || codes.has(code);
    return rows
      .filter(
        (r) =>
          r.school_year === year &&
          passes(r.duty_root_code, settings.dutyRootCodes) &&
          passes(r.program_code, settings.programCodes) &&
          passes(r.activity_code, settings.activityCodes),
      )
      .map((r) => ({
        duty: r.duty_root ?? `Duty ${r.duty_root_code ?? "unknown"}`,
        salary: num(r.total_final_salary),
        fte: num(r.fte),
      }))
      .filter((p) => p.salary > 0);
  }, [
    rows,
    year,
    settings.dutyRootCodes,
    settings.programCodes,
    settings.activityCodes,
  ]);

  const plan = useMemo(
    () => planRows(people, contextSettings.peoplePerRow),
    [people, contextSettings.peoplePerRow],
  );

  const colorOf = useMemo(() => {
    const map = new Map<string, number>();
    let i = 0;
    for (const duty of groupByDuty(people).keys()) map.set(duty, i++);
    return map;
  }, [people]);

  const payroll = people.reduce((sum, p) => sum + p.salary, 0);
  const fte = people.reduce((sum, p) => sum + p.fte, 0);

  // The year selector can only offer what the loaded data actually has, so it
  // is bound here rather than in the settings module.
  const YearContents = useMemo(
    () =>
      function BoundSchoolYearContents(props) {
        return <SchoolYearContents {...props} years={years} />;
      },
    [years],
  );

  return (
    <SettingsLayout
      settingsSerializer={{
        serialize: (newAllSettings) =>
          serializeDatasetSettings(
            newAllSettings,
            SERIALIZE_SALARIES_SETTINGS_GENERATORS,
          ),
        serializeContext: (context) =>
          serializeOneSetting(
            context,
            SERIALIZE_SALARIES_CONTEXT_SETTINGS_GENERATORS,
          ),
      }}
      allSettings={allSettings}
      contextSettings={contextSettings}
      contextSettingsComponents={[YearContents, RowWidthContents]}
      settingsContentsComponents={[
        SalariesDatasetContents,
        DutyRootFilterContents,
        ProgramFilterContents,
        ActivityFilterContents,
      ]}
      // One skyline at a time: two districts' payrolls overlaid on one axis
      // would not be readable, and the rows are already the comparison unit.
      hideAddComparison
    >
      <Typography className="analysis-title" component="h1" variant="h1">
        Salaries
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
        Every S-275 <code>total_final_salary</code> for the year, one column per
        person, grouped by the duty title of their major assignment and sorted
        by salary within each duty. Rows wrap; every row shares the same salary
        scale and the same number of slots, so heights and horizontal positions
        are comparable between them. A variant of the{" "}
        <Link href="/analyses/seattle_sea_pay_gap.html">
          SEA pay-gap analysis
        </Link>{" "}
        chart.
      </Typography>

      {failed && (
        <Alert severity="info" sx={{ mb: 2 }}>
          The per-employee salary dataset is not available for this district
          yet.
        </Alert>
      )}

      {!current && (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={18} />
          <Typography variant="body2">Loading salaries…</Typography>
        </Stack>
      )}

      {rows && people.length === 0 && year && (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          No salaries match the selected duty titles for {year}.
        </Typography>
      )}

      {rows && people.length > 0 && (
        <>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            <b>{people.length.toLocaleString()}</b> people ·{" "}
            <b>{fte.toLocaleString(undefined, { maximumFractionDigits: 0 })}</b>{" "}
            FTE · <b>${(payroll / 1e6).toFixed(1)}M</b> in salaries ·{" "}
            {colorOf.size} duty titles · {year}
          </Typography>
          <SalarySkyline plan={plan} colorOf={colorOf} year={year} />
        </>
      )}
    </SettingsLayout>
  );
}
