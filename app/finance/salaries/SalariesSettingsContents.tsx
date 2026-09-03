"use client";

// Settings panel contents for the Salaries dashboard, rendered inside the
// shared SettingsLayout drawer the other finance dashboards use.
//
// The dataset box deliberately does not reuse DatasetSettingsContents: that
// one also renders the currency and staffing normalization selectors and the
// filter-grouping selector, none of which mean anything here. This chart is
// always dollars-per-person, and the only PAO-style filter it applies is the
// duty title.

import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import DistrictSelector from "app/finance/_widgets/DistrictSelector";
import { settingsForDistrictChange } from "app/finance/_settings/common_settings";

import type { SalariesContextSettings, SalariesSettings } from "./settings";

// Row widths worth offering. Wider rows fit more people but make each column
// narrower than a pixel sooner; narrower rows mean more rows to scroll.
const ROW_WIDTHS = [750, 1000, 1500, 2500];

type ContextProps = {
  settings: SalariesContextSettings;
  setSettings: (x: SalariesContextSettings) => void;
  /** School years present in the loaded data, newest first. */
  years?: string[];
};

export function SchoolYearContents({
  settings,
  setSettings,
  years = [],
}: ContextProps) {
  // "" means "whatever the newest year in the data is", so a shared link does
  // not pin a district to a year it may not have filed.
  return (
    <TextField
      select
      size="small"
      fullWidth
      label="School year"
      value={years.includes(settings.year) ? settings.year : ""}
      onChange={(e) => setSettings({ ...settings, year: e.target.value })}
      disabled={years.length === 0}
    >
      <MenuItem value="">Most recent</MenuItem>
      {years.map((y) => (
        <MenuItem key={y} value={y}>
          {y}
        </MenuItem>
      ))}
    </TextField>
  );
}

export function RowWidthContents({ settings, setSettings }: ContextProps) {
  return (
    <TextField
      select
      size="small"
      fullWidth
      label="People per row"
      value={String(settings.peoplePerRow)}
      onChange={(e) =>
        setSettings({ ...settings, peoplePerRow: Number(e.target.value) })
      }
    >
      {ROW_WIDTHS.map((n) => (
        <MenuItem key={n} value={String(n)}>
          {n.toLocaleString()}
        </MenuItem>
      ))}
    </TextField>
  );
}

export function SalariesDatasetContents({
  settings,
  setSettings,
}: {
  settings: SalariesSettings;
  setSettings: (x: SalariesSettings) => void;
}) {
  return (
    <DistrictSelector
      ccddd={settings.ccddd}
      onChange={(ccddd) =>
        setSettings(settingsForDistrictChange(settings, ccddd))
      }
    />
  );
}
