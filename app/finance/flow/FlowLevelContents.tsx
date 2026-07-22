"use client";

// Settings-panel widget for the Expenditure Flow view.
//
// The top control is the "level plan": an ordered list of the sankey columns
// with an enable/disable checkbox per level. Resource (Source) and Program are
// pinned to the top two positions and cannot be moved (but can be disabled);
// Activity / Object / NCES / School can be reordered by dragging and toggled on
// or off. Below it are selects for source granularity, fiscal year, and data
// type.
//
// Year options come from `districtData.all_class_ofs()`. This widget can render
// before the district data has loaded, so it pulls the map from context and
// guards for the district being absent (empty year list => only "Latest").

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import PushPinIcon from "@mui/icons-material/PushPin";
import Select from "@mui/material/Select";
import SettingsSelect from "app/finance/_widgets/SettingsSelect";
import Typography from "@mui/material/Typography";
import { useDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { useId, useState } from "react";
import { PINNED_LEVELS } from "./FlowSettings";

import type { FlowSettings, LevelPlan } from "./FlowSettings";
import type { Level } from "utilities/sankey/types";

const LEVEL_LABEL: Record<Level, string> = {
  source: "Resource (Source)",
  program: "Program",
  activity: "Activity",
  object: "Object",
  nces: "NCES",
  school: "School",
};

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

function isPinned(level: Level): boolean {
  return PINNED_LEVELS.includes(level);
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

  // Index of the row currently being dragged, and the row it is hovering over,
  // for a drop-target highlight. Both are reorderable-row indices in levelPlan.
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const years: number[] = districtData
    ? [...(districtData.all_class_ofs().array("class_of") as number[])].sort(
        (a, b) => b - a,
      )
    : [];

  const setPlan = (plan: LevelPlan) =>
    setSettings({ ...settings, levelPlan: plan });

  const toggleLevel = (level: Level, enabled: boolean) => {
    setPlan(
      settings.levelPlan.map((e) =>
        e.level === level ? { ...e, enabled } : e,
      ),
    );
  };

  // Move the reorderable row at `from` to `to`. Pinned rows (indices 0/1) never
  // move and are never displaced.
  const moveRow = (from: number, to: number) => {
    const plan = settings.levelPlan;
    if (
      from === to ||
      from < 0 ||
      to < 0 ||
      isPinned(plan[from]?.level) ||
      isPinned(plan[to]?.level)
    ) {
      return;
    }
    const next = [...plan];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setPlan(next);
  };

  return (
    <Box
      sx={{
        marginX: "0.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.7rem",
      }}
    >
      <FormControl component="fieldset" variant="standard">
        <FormLabel component="legend" sx={{ fontSize: "0.85rem" }}>
          Levels (drag to reorder)
        </FormLabel>
        <Box role="list" sx={{ display: "flex", flexDirection: "column" }}>
          {settings.levelPlan.map((entry, index) => {
            const pinned = isPinned(entry.level);
            return (
              <Box
                key={entry.level}
                role="listitem"
                draggable={!pinned}
                onDragStart={
                  pinned
                    ? undefined
                    : () => {
                        setDragIndex(index);
                      }
                }
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                onDragOver={
                  pinned
                    ? undefined
                    : (e) => {
                        e.preventDefault();
                        if (overIndex !== index) {
                          setOverIndex(index);
                        }
                      }
                }
                onDrop={
                  pinned
                    ? undefined
                    : (e) => {
                        e.preventDefault();
                        if (dragIndex !== null) {
                          moveRow(dragIndex, index);
                        }
                        setDragIndex(null);
                        setOverIndex(null);
                      }
                }
                sx={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "4px",
                  cursor: pinned ? "default" : "grab",
                  opacity: dragIndex === index ? 0.4 : 1,
                  borderTop:
                    overIndex === index &&
                    dragIndex !== null &&
                    dragIndex !== index
                      ? "2px solid"
                      : "2px solid transparent",
                  borderTopColor:
                    overIndex === index &&
                    dragIndex !== null &&
                    dragIndex !== index
                      ? "primary.main"
                      : "transparent",
                }}
              >
                {pinned ? (
                  <PushPinIcon
                    fontSize="small"
                    sx={{ color: "text.disabled", fontSize: "1rem", mr: "2px" }}
                    titleAccess="Pinned; cannot be moved"
                  />
                ) : (
                  <DragIndicatorIcon
                    fontSize="small"
                    sx={{ color: "text.secondary", fontSize: "1.1rem" }}
                  />
                )}
                <Checkbox
                  size="small"
                  checked={entry.enabled}
                  onChange={(e) => toggleLevel(entry.level, e.target.checked)}
                  inputProps={{
                    "aria-label": `Show ${LEVEL_LABEL[entry.level]} column`,
                  }}
                />
                <Typography variant="body2">
                  {LEVEL_LABEL[entry.level]}
                </Typography>
              </Box>
            );
          })}
        </Box>
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
    </Box>
  );
}
