// Settings type, defaults, and URL serializers for the Expenditure Flow
// (Sankey) view.
//
// The flow view is a SINGLE-dataset, per-district view (not a comparison view),
// so `DEFAULT_FLOW_SETTINGS` is a one-element array built on
// `DEFAULT_DATASET_SETTINGS`. Alongside the usual district + per-level filter
// serializers (`c`/`g`/`cn`/`sn`, `p`/`a`/`o`, `n`, `s`, `rc`/`rv`) it adds five
// custom URL vars unique to this view:
//   - `lv`  the level plan: an ORDERED, enable/disable-able list of the sankey
//           columns. Encoded as one letter per level (r=Resource/source,
//           p=program, a=activity, o=object, n=nces, s=school); UPPERCASE means
//           enabled, lowercase disabled; Resource and Program are always emitted
//           first (they are pinned in the UI), and the remaining letters appear
//           in the user's chosen order. e.g. "RPAons" is the default.
//   - `sm`  source mode ("a" = account, omitted = category)
//   - `y`   selected class_of (fiscal year end); omitted => latest available
//   - `dt`  data type ("b" = budget, omitted = actuals)
//   - `cs`  coalesce small nodes into "Other" ("1" = on, omitted = off)
// Defaults serialize to the empty string so they are omitted from the URL.

import { DEFAULT_DATASET_SETTINGS } from "app/finance/_settings/dataset_settings";
import {
  makeDatasetSerializeConfig,
  makeDefaultActualsSettings,
  makeDefaultDatasetSettings,
  makeDefaultPaoSettings,
  makeDefaultRevenueSettings,
  makeNcesSerializeConfig,
  makePaoSerializeConfig,
  makeRevenueSerializeConfig,
  makeSchoolFilterConfig,
} from "app/finance/_settings/common_settings";

import type { SettingsConfig } from "app/finance/_settings/base_settings";
import type { DatasetSettings } from "app/finance/_settings/dataset_settings";
import type {
  NcesFilters,
  PAOFilters,
  RevenueAccountFilters,
  RevenueCategoryFilters,
  SchoolFilters,
} from "utilities/DistrictData";
import type { Level, SourceMode } from "utilities/sankey/types";

// One row of the level plan: a sankey column and whether it is currently shown.
export type LevelPlanEntry = { level: Level; enabled: boolean };
// The ordered level plan. Resource (source) and Program are pinned to indices
// 0 and 1 (the UI does not let them move); the remaining four levels may be
// reordered and each may be enabled/disabled.
export type LevelPlan = Array<LevelPlanEntry>;

export type FlowSettings = DatasetSettings &
  Partial<
    PAOFilters &
      NcesFilters &
      SchoolFilters &
      RevenueCategoryFilters &
      RevenueAccountFilters
  > & {
    // The ordered, enable/disable-able list of sankey columns (see the header
    // comment). Derive the columns to actually draw with `enabledLevelsFromPlan`.
    levelPlan: LevelPlan;
    sourceMode: SourceMode;
    // null => latest available class_of.
    classOf: number | null;
    dataType: "actuals" | "budget";
    // Combine small nodes on each level into an "Other" node.
    coalesce: boolean;
  };

// The two pinned levels and the four reorderable ones.
export const PINNED_LEVELS: ReadonlyArray<Level> = ["source", "program"];
// Program cannot be disabled: it is the revenue-attribution linchpin and is
// always rendered. (Resource/Source is pinned but may be disabled.)
export const ALWAYS_ENABLED_LEVELS: ReadonlyArray<Level> = ["program"];
export const REORDERABLE_LEVELS: ReadonlyArray<Level> = [
  "activity",
  "object",
  "nces",
  "school",
];

const LEVEL_LETTER: Record<Level, string> = {
  source: "r",
  program: "p",
  activity: "a",
  object: "o",
  nces: "n",
  school: "s",
};
const LETTER_LEVEL: Record<string, Level> = {
  r: "source",
  p: "program",
  a: "activity",
  o: "object",
  n: "nces",
  s: "school",
};

// The out-of-the-box plan: Resource, Program, Activity shown; Object, NCES,
// School hidden; reorderables in canonical order. Matches the previous
// always-on source/program/activity behavior.
export const DEFAULT_LEVEL_PLAN: LevelPlan = [
  { level: "source", enabled: true },
  { level: "program", enabled: true },
  { level: "activity", enabled: true },
  { level: "object", enabled: false },
  { level: "nces", enabled: false },
  { level: "school", enabled: false },
];
const DEFAULT_ENABLED: Record<Level, boolean> = Object.fromEntries(
  DEFAULT_LEVEL_PLAN.map((e) => [e.level, e.enabled]),
) as Record<Level, boolean>;

// The columns to actually draw, in order: the enabled levels of the plan.
export function enabledLevelsFromPlan(plan: LevelPlan): Level[] {
  return plan.filter((e) => e.enabled).map((e) => e.level);
}

function encodeLevelPlan(plan: LevelPlan): string {
  const letterFor = (e: LevelPlanEntry) =>
    e.enabled ? LEVEL_LETTER[e.level].toUpperCase() : LEVEL_LETTER[e.level];
  // Resource and Program always come first (pinned), then the rest in order.
  const pinned = PINNED_LEVELS.map((lvl) => plan.find((e) => e.level === lvl))
    .filter((e): e is LevelPlanEntry => e !== undefined)
    .map(letterFor)
    .join("");
  const rest = plan
    .filter((e) => !PINNED_LEVELS.includes(e.level))
    .map(letterFor)
    .join("");
  return pinned + rest;
}

const DEFAULT_LEVEL_PLAN_ENCODED = encodeLevelPlan(DEFAULT_LEVEL_PLAN);

export function serializeLevelPlan(plan: LevelPlan): string {
  const encoded = encodeLevelPlan(plan);
  // Default omitted from the URL.
  return encoded === DEFAULT_LEVEL_PLAN_ENCODED ? "" : encoded;
}

export function deserializeLevelPlan(s: string): LevelPlan {
  const enabled = new Map<Level, boolean>();
  const reorderOrder: Level[] = [];
  for (const ch of s) {
    const level = LETTER_LEVEL[ch.toLowerCase()];
    if (!level) {
      continue; // ignore junk
    }
    enabled.set(level, ch !== ch.toLowerCase()); // uppercase => enabled
    if (REORDERABLE_LEVELS.includes(level) && !reorderOrder.includes(level)) {
      reorderOrder.push(level);
    }
  }
  // Always pin Resource then Program at the front (defend against malformed
  // URLs), then the reorderables in the URL's order, filling any not mentioned
  // in canonical order so all six are always present.
  const orderedReorderables = [
    ...reorderOrder,
    ...REORDERABLE_LEVELS.filter((l) => !reorderOrder.includes(l)),
  ];
  return [...PINNED_LEVELS, ...orderedReorderables].map((level) => ({
    level,
    // Program is always enabled, even if a hand-crafted URL says otherwise.
    enabled: ALWAYS_ENABLED_LEVELS.includes(level)
      ? true
      : (enabled.get(level) ?? DEFAULT_ENABLED[level]),
  }));
}

export const DEFAULT_FLOW_SETTINGS: Array<FlowSettings> =
  DEFAULT_DATASET_SETTINGS.map((v) => ({
    ...v,
    ...makeDefaultDatasetSettings(v.ccddd),
    ...makeDefaultPaoSettings(),
    ...makeDefaultActualsSettings(v.ccddd),
    ...makeDefaultRevenueSettings(),
    levelPlan: DEFAULT_LEVEL_PLAN.map((e) => ({ ...e })),
    sourceMode: "category" as const,
    classOf: null,
    dataType: "actuals" as const,
    coalesce: false,
  }));

// Custom serializer config for the four flow-only URL vars. Kept separate from
// the shared filter serializers in common_settings.ts so the sankey types stay
// out of the shared settings engine.
export function makeFlowSerializeConfig(): SettingsConfig {
  return [
    [
      "levelPlan",
      {
        serializerType: "custom",
        urlVar: "lv",
        serialize: (settings, key) => serializeLevelPlan(settings[key]),
        deserialize: (settings, s) => deserializeLevelPlan(s),
      },
    ],
    [
      "sourceMode",
      {
        serializerType: "custom",
        urlVar: "sm",
        // "category" is the default and serializes to "" (omitted from URL).
        serialize: (settings, key) => (settings[key] === "account" ? "a" : ""),
        deserialize: (settings, s) => (s === "a" ? "account" : "category"),
      },
    ],
    [
      "classOf",
      {
        serializerType: "custom",
        urlVar: "y",
        // null (latest) serializes to "" (omitted from URL).
        serialize: (settings, key) =>
          settings[key] == null ? "" : String(settings[key]),
        deserialize: (settings, s) => {
          const n = parseInt(s, 10);
          return Number.isNaN(n) ? null : n;
        },
      },
    ],
    [
      "dataType",
      {
        serializerType: "custom",
        urlVar: "dt",
        // "actuals" is the default and serializes to "" (omitted from URL).
        serialize: (settings, key) => (settings[key] === "budget" ? "b" : ""),
        deserialize: (settings, s) => (s === "b" ? "budget" : "actuals"),
      },
    ],
    [
      "coalesce",
      {
        serializerType: "custom",
        urlVar: "cs",
        // false is the default and serializes to "" (omitted from URL).
        serialize: (settings, key) => (settings[key] ? "1" : ""),
        deserialize: (settings, s) => s === "1",
      },
    ],
  ];
}

// The dataset-settings serializer generators for the flow view, in fold order:
// district identity, PAO filters, NCES, School (depends on ccddd), revenue
// category/account filters, then the flow-only custom vars.
export const SERIALIZE_FLOW_SETTINGS_GENERATORS = [
  makeDatasetSerializeConfig,
  makePaoSerializeConfig,
  makeNcesSerializeConfig,
  makeSchoolFilterConfig,
  makeRevenueSerializeConfig,
  makeFlowSerializeConfig,
];
