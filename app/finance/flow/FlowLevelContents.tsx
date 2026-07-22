"use client";

// Settings-panel widget for the Expenditure Flow view: toggles for the optional
// sankey levels (Object / NCES / School) plus selects for source granularity,
// fiscal year, and data type.
//
// Year options come from `districtData.all_class_ofs()`. This widget can render
// before the district data has loaded, so it pulls the map from context and
// guards for the district being absent (empty year list => only "Latest").

import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormLabel from "@mui/material/FormLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import SettingsSelect from "app/finance/_widgets/SettingsSelect";
import { useDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { useId } from "react";

import type { FlowSettings } from "./FlowSettings";
import type { Level } from "utilities/sankey/types";

const OPTIONAL_LEVELS: ReadonlyArray<{ level: Level; label: string }> = [
  { level: "object", label: "Object" },
  { level: "nces", label: "NCES" },
  { level: "school", label: "School" },
];

const SOURCE_MODE_OPTIONS: Record<string, string> = {
  category: "Category (~9)",
  account: "Account (~60)",
};

const DATA_TYPE_OPTIONS: Record<string, string> = {
  actuals: "Actuals",
  budget: "Budget",
};

function fiscalYearLabel(classOf: number): string {
  return `${classOf - 1}-${classOf}`;
}

export default function FlowLevelContents({
  settings,
  setSettings,
}: {
  settings: FlowSettings;
  setSettings: (x: FlowSettings) => void;
}) {
  const yearLabelId = useId();
  const yearSelectId = useId();
  const { districtDataMap } = useDistrictData();
  const districtData = districtDataMap[settings.ccddd];

  const years: number[] = districtData
    ? [...(districtData.all_class_ofs().array("class_of") as number[])].sort(
        (a, b) => b - a,
      )
    : [];

  const toggleLevel = (level: Level, checked: boolean) => {
    const next = new Set(settings.enabledLevels);
    if (checked) {
      next.add(level);
    } else {
      next.delete(level);
    }
    setSettings({ ...settings, enabledLevels: next });
  };

  return (
    <FormGroup sx={{ marginX: "0.5rem", gap: "0.7rem" }}>
      <FormControl component="fieldset" variant="standard">
        <FormLabel component="legend" sx={{ fontSize: "0.85rem" }}>
          Optional Levels
        </FormLabel>
        {OPTIONAL_LEVELS.map(({ level, label }) => (
          <FormControlLabel
            key={level}
            label={label}
            control={
              <Checkbox
                size="small"
                checked={settings.enabledLevels.has(level)}
                onChange={(e) => toggleLevel(level, e.target.checked)}
              />
            }
          />
        ))}
      </FormControl>

      <SettingsSelect
        label="Source Granularity"
        settings={settings}
        setSettings={setSettings}
        fieldName="sourceMode"
        options={SOURCE_MODE_OPTIONS}
      />

      <FormControl size="small">
        <InputLabel id={yearLabelId}>Fiscal Year</InputLabel>
        <Select
          labelId={yearLabelId}
          id={yearSelectId}
          label="Fiscal Year"
          value={settings.classOf === null ? "" : String(settings.classOf)}
          onChange={(e) =>
            setSettings({
              ...settings,
              classOf:
                e.target.value === "" ? null : parseInt(e.target.value, 10),
            })
          }
        >
          <MenuItem value="">Latest</MenuItem>
          {years.map((y) => (
            <MenuItem key={y} value={String(y)}>
              {fiscalYearLabel(y)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <SettingsSelect
        label="Data Type"
        settings={settings}
        setSettings={setSettings}
        fieldName="dataType"
        options={DATA_TYPE_OPTIONS}
      />
    </FormGroup>
  );
}
