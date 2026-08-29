"use client";

// Salaries dashboard: every S-275 total_final_salary for one district and year,
// one column per person, grouped by duty title and wrapped across rows.
//
// This page fetches `s275_salaries` itself rather than going through
// DistrictData. That dataset is one row per employee (~7k rows per year for
// SPS, ~86k across all years) and only this page needs it, so loading it in
// the shared provider would put it on the wire for every finance dashboard.

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useState } from "react";

import DistrictSelector from "app/finance/_widgets/DistrictSelector";
import FinanceSubNav from "app/finance/_widgets/FinanceSubNav";
import { fetchDataset } from "utilities/client/FetchData";

import SalarySkyline from "./SalarySkyline";
import { groupByDuty, planRows } from "./rowPlan";

import type { Person } from "./rowPlan";

const SPS_CCDDD = 17001;
const PEOPLE_PER_ROW = 1500;

type Result = { ccddd: number; rows: Record[] | null };

type Record = {
  school_year: string;
  duty_root: string | null;
  duty_root_code: number | null;
  total_final_salary: unknown;
  fte: unknown;
};

// Arquero hands numeric columns back as Decimal wrappers or plain numbers
// depending on the Avro logical type, so normalize before arithmetic.
function num(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  const maybe = v as { toNumber?: () => number };
  return typeof maybe.toNumber === "function" ? maybe.toNumber() : Number(v);
}

export default function SalariesPage() {
  const [ccddd, setCcddd] = useState(SPS_CCDDD);
  // The fetch result carries the district it belongs to, so a stale result
  // for the previous district reads as "still loading" without an effect
  // having to synchronously clear state on every change.
  const [result, setResult] = useState<Result | null>(null);
  const [yearChoice, setYearChoice] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetchDataset(ccddd, "s275_salaries")
      .then((table) => {
        if (live) setResult({ ccddd, rows: table.objects() as Record[] });
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

  // Derived rather than stored: the newest year is the default, and a year
  // the current district has no filings for falls back to that default
  // instead of needing an effect to correct it.
  const year =
    yearChoice && years.includes(yearChoice) ? yearChoice : (years[0] ?? "");

  const people: Person[] = useMemo(() => {
    if (!rows || !year) return [];
    return rows
      .filter((r) => r.school_year === year)
      .map((r) => ({
        duty: r.duty_root ?? `Duty ${r.duty_root_code ?? "unknown"}`,
        salary: num(r.total_final_salary),
        fte: num(r.fte),
      }))
      .filter((p) => p.salary > 0);
  }, [rows, year]);

  const plan = useMemo(() => planRows(people, PEOPLE_PER_ROW), [people]);

  const colorOf = useMemo(() => {
    const map = new Map<string, number>();
    let i = 0;
    for (const duty of groupByDuty(people).keys()) map.set(duty, i++);
    return map;
  }, [people]);

  const payroll = people.reduce((sum, p) => sum + p.salary, 0);
  const fte = people.reduce((sum, p) => sum + p.fte, 0);

  return (
    <>
      <FinanceSubNav />
      <Box sx={{ p: 3 }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Salaries
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          Every S-275 <code>total_final_salary</code> for the year, one column
          per person, grouped by the duty title of their major assignment and
          sorted by salary within each duty. Rows wrap; every row shares the
          same salary scale and the same number of slots, so heights and
          horizontal positions are comparable between them. A variant of the{" "}
          <Link href="/analyses/seattle_sea_pay_gap.html">
            SEA pay-gap analysis
          </Link>{" "}
          chart.
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
          <DistrictSelector
            ccddd={ccddd}
            onChange={setCcddd}
            sx={{ minWidth: 320 }}
          />
          <TextField
            select
            size="small"
            label="School year"
            value={year}
            onChange={(e) => setYearChoice(e.target.value)}
            disabled={years.length === 0}
            sx={{ minWidth: 160 }}
          >
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {failed && (
          <Alert severity="info" sx={{ mb: 2 }}>
            The per-employee salary dataset is not available for this district
            yet. The <code>s275_salaries</code> dataset needs the Cloud Function
            deployed (<code>cd functions && npm run deploy</code>); until then
            this page has nothing per-person to draw.
          </Alert>
        )}

        {!current && (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={18} />
            <Typography variant="body2">Loading salaries…</Typography>
          </Stack>
        )}

        {rows && people.length > 0 && (
          <>
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              <b>{people.length.toLocaleString()}</b> people ·{" "}
              <b>
                {fte.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </b>{" "}
              FTE · <b>${(payroll / 1e6).toFixed(1)}M</b> in salaries ·{" "}
              {colorOf.size} duty titles
            </Typography>
            <SalarySkyline plan={plan} colorOf={colorOf} year={year} />
          </>
        )}
      </Box>
    </>
  );
}
