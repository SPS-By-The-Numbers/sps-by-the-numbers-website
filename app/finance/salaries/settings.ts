// Settings for the Salaries dashboard, in the same shape the other finance
// dashboards use so the drawer, the URL encoding and the deep links all behave
// the same way.

import * as CommonSettings from "app/finance/_settings/common_settings";
import { DEFAULT_DATASET_SETTINGS } from "app/finance/_settings/dataset_settings";
import DutyRootFilter from "app/finance/_filteritems/duty_root";

import type {
  BaseSettings,
  SettingsConfig,
} from "app/finance/_settings/base_settings";
import type { DatasetSettings } from "app/finance/_settings/dataset_settings";
import type { DutyRootFilters } from "utilities/DistrictData";

/** Per-district settings: which district, and which duty titles to draw. */
export type SalariesSettings = DatasetSettings & DutyRootFilters;

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
];

export const SERIALIZE_SALARIES_CONTEXT_SETTINGS_GENERATORS = [
  () =>
    [
      [
        "year",
        {
          serializerType: "custom" as const,
          urlVar: "y",
          serialize: (settings, key: string) => settings[key] ?? "",
          // A malformed year is dropped rather than pinned; the dashboard
          // falls back to the newest year it actually has.
          deserialize: (_settings, s: string) =>
            /^\d{4}-\d{4}$/.test(s) ? s : "",
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
