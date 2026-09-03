// Settings for the Salaries dashboard, in the same shape the other finance
// dashboards use so the drawer, the URL encoding and the deep links all behave
// the same way.

import * as CommonSettings from "app/finance/_settings/common_settings";
import { DEFAULT_DATASET_SETTINGS } from "app/finance/_settings/dataset_settings";
import ActivityFilter from "app/finance/_filteritems/activity";
import DutyRootFilter from "app/finance/_filteritems/duty_root";
import ProgramFilter from "app/finance/_filteritems/program";

import type {
  BaseSettings,
  SettingsConfig,
} from "app/finance/_settings/base_settings";
import type { DatasetSettings } from "app/finance/_settings/dataset_settings";
import type { DutyRootFilters, PAFilters } from "utilities/DistrictData";

/**
 * Per-district settings: which district, and which slices of the payroll to
 * draw. Program and activity describe where a person is mainly posted (they
 * come from the same major assignment the duty title does), so filtering on
 * them selects people, not fractions of anyone's salary.
 */
export type SalariesSettings = DatasetSettings & DutyRootFilters & PAFilters;

/** Chart-wide settings. */
export type SalariesContextSettings = BaseSettings & {
  /** "" means the newest year present in the loaded data. */
  year: string;
  peoplePerRow: number;
};

export const DEFAULT_PEOPLE_PER_ROW = 1500;

export const DEFAULT_SALARIES_SETTINGS: Array<SalariesSettings> =
  DEFAULT_DATASET_SETTINGS.map((v) => ({
    ...v,
    dutyRootCodes: DutyRootFilter.allCodes(),
    programCodes: ProgramFilter.allCodes(),
    activityCodes: ActivityFilter.allCodes(),
  }));

export const DEFAULT_SALARIES_CONTEXT_SETTINGS: SalariesContextSettings = {
  id: 0,
  name: "context",
  year: "",
  peoplePerRow: DEFAULT_PEOPLE_PER_ROW,
};

export const SERIALIZE_SALARIES_SETTINGS_GENERATORS = [
  CommonSettings.makeDatasetSerializeConfig,
  CommonSettings.makeDutyRootSerializeConfig,
  CommonSettings.makePaSerializeConfig,
];

export const SERIALIZE_SALARIES_CONTEXT_SETTINGS_GENERATORS = [
  () =>
    [
      [
        "year",
        {
          serializerType: "custom" as const,
          urlVar: "y",
          // Only the ending year rides in the URL: "2024-2025" is fully
          // determined by its second half, and that is the same class_of the
          // rest of the codebase keys years on.
          serialize: (settings, key: string) => {
            const m = /^(\d{4})-(\d{4})$/.exec(settings[key] ?? "");
            return m ? m[2] : "";
          },
          // Anything malformed is dropped rather than pinned; the dashboard
          // falls back to the newest year it actually has.
          deserialize: (_settings, s: string) =>
            /^\d{4}$/.test(s) ? `${Number(s) - 1}-${s}` : "",
        },
      ],
      [
        "peoplePerRow",
        {
          serializerType: "custom" as const,
          urlVar: "w",
          serialize: (settings, key: string) => String(settings[key]),
          deserialize: (_settings, s: string) => {
            const n = Number(s);
            return Number.isFinite(n) && n >= 1 ? n : DEFAULT_PEOPLE_PER_ROW;
          },
        },
      ],
    ] as SettingsConfig,
];
