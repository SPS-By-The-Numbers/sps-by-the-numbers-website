"use client";

// Settings-panel widget for the Expenditure Flow view.
//
// The top control is the "level plan": an ordered list of the sankey columns
// with an enable/disable checkbox per level. Resource (Source) and Program are
// pinned to the top two positions and cannot be moved; Resource may be disabled
// but Program cannot (it is always shown). Activity / Object / NCES / School can
// be reordered by dragging and toggled on or off. Below it are selects for
// source granularity, fiscal year, and data type.
//
// Year options come from `districtData.all_class_ofs()`. This widget can render
// before the district data has loaded, so it pulls the map from context and
// guards for the district being absent (empty year list => only "Latest").

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import CompressIcon from "@mui/icons-material/Compress";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import PushPinIcon from "@mui/icons-material/PushPin";
import Select from "@mui/material/Select";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SettingsSelect from "app/finance/_widgets/SettingsSelect";
import Typography from "@mui/material/Typography";
import { useDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { useId, useState } from "react";
import {
  ACTUALS_ONLY_LEVELS,
  ALWAYS_ENABLED_LEVELS,
  PINNED_LEVELS,
} from "./FlowSettings";

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

function isAlwaysEnabled(level: Level): boolean {
  return ALWAYS_ENABLED_LEVELS.includes(level);
}

// Filled (contained) icon-button style: solid primary when active, muted grey
// otherwise.
function filledIconSx(active: boolean) {
  return {
    borderRadius: 1,
    padding: "4px",
    backgroundColor: active ? "primary.main" : "action.selected",
    color: active ? "primary.contrastText" : "text.secondary",
    "&:hover": {
      backgroundColor: active ? "primary.dark" : "action.hover",
    },
    "&.Mui-disabled": {
      backgroundColor: "action.disabledBackground",
      color: "action.disabled",
    },
  };
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
    if (isAlwaysEnabled(level)) {
      return; // Program is always shown.
    }
    setPlan(
      settings.levelPlan.map((e) =>
        e.level === level ? { ...e, enabled } : e,
      ),
    );
  };

  const toggleCoalesce = (level: Level, on: boolean) => {
    const next = new Set(settings.coalesceLevels);
    if (on) {
      next.add(level);
    } else {
      next.delete(level);
    }
    setSettings({ ...settings, coalesceLevels: next });
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
          Levels — drag to reorder
        </FormLabel>
        <Typography
          variant="caption"
          component="p"
          sx={{ color: "text.secondary", mb: "0.25rem" }}
        >
          Eye: show / hide the level. Compress: coalesce its small nodes into an
          &ldquo;Other&rdquo; node.
        </Typography>
        <Box role="list" sx={{ display: "flex", flexDirection: "column" }}>
          {settings.levelPlan.map((entry, index) => {
            const pinned = isPinned(entry.level);
            // NCES / School have no breakdown in Budget data.
            const unavailable =
              settings.dataType === "budget" &&
              ACTUALS_ONLY_LEVELS.includes(entry.level);
            const shown = entry.enabled && !unavailable;
            const coalesceOn = settings.coalesceLevels.has(entry.level);
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
                    titleAccess={
                      isAlwaysEnabled(entry.level)
                        ? "Pinned and always shown"
                        : "Pinned; cannot be moved"
                    }
                  />
                ) : (
                  <DragIndicatorIcon
                    fontSize="small"
                    sx={{ color: "text.secondary", fontSize: "1.1rem" }}
                  />
                )}
                <Typography
                  variant="body2"
                  sx={unavailable ? { color: "text.disabled" } : undefined}
                >
                  {LEVEL_LABEL[entry.level]}
                  {unavailable ? " (actuals only)" : ""}
                </Typography>
                <Box
                  sx={{
                    marginLeft: "auto",
                    display: "flex",
                    gap: "4px",
                    pl: "4px",
                  }}
                >
                  <IconButton
                    size="small"
                    sx={filledIconSx(shown)}
                    disabled={isAlwaysEnabled(entry.level) || unavailable}
                    onClick={() => toggleLevel(entry.level, !entry.enabled)}
                    title={
                      shown
                        ? `Hide ${LEVEL_LABEL[entry.level]}`
                        : `Show ${LEVEL_LABEL[entry.level]}`
                    }
                    aria-pressed={shown}
                    aria-label={
                      shown
                        ? `Hide ${LEVEL_LABEL[entry.level]} column`
                        : `Show ${LEVEL_LABEL[entry.level]} column`
                    }
                  >
                    {shown ? (
                      <VisibilityIcon fontSize="small" />
                    ) : (
                      <VisibilityOffIcon fontSize="small" />
                    )}
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={filledIconSx(coalesceOn)}
                    disabled={!entry.enabled || unavailable}
                    onClick={() => toggleCoalesce(entry.level, !coalesceOn)}
                    title={
                      coalesceOn
                        ? `Stop coalescing small ${LEVEL_LABEL[entry.level]} nodes`
                        : `Coalesce small ${LEVEL_LABEL[entry.level]} nodes into "Other"`
                    }
                    aria-pressed={coalesceOn}
                    aria-label={`Coalesce small ${LEVEL_LABEL[entry.level]} nodes`}
                  >
                    <CompressIcon fontSize="small" />
                  </IconButton>
                </Box>
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

      <Box>
        <FormControlLabel
          label="Highlight resource w/ PTA funds"
          control={
            <Checkbox
              size="small"
              checked={settings.highlightPta}
              onChange={(e) =>
                setSettings({ ...settings, highlightPta: e.target.checked })
              }
            />
          }
        />
        <Typography
          variant="caption"
          component="p"
          sx={{ color: "text.secondary", ml: "0.25rem", mt: "-0.25rem" }}
        >
          Highlights the whole Gifts, Grants &amp; Donations resource. PTA gifts
          are only a fraction of it — likely a small one.
        </Typography>
      </Box>
    </Box>
  );
}
