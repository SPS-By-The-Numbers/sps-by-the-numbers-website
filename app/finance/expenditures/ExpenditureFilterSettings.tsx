import {
  DEFAULT_METRIC_SETTINGS,
  serializeMetricSettings,
  deserializeOneMetricSettings,
} from "app/finance/_settings/metric_settings";
import {
  ALL_OBJECT_ITEMS,
  ALL_ACTIVITY_ITEMS,
  ALL_PROGRAM_ITEMS,
  extractCodes,
} from "app/finance/_widgets/ExpenditureFilterContents";
import ProgramFilter from "app/finance/_filteritems/program";
import ActivityFilter from "app/finance/_filteritems/activity";
import ObjectFilter from "app/finance/_filteritems/object";

import {
  serializeSettingsDict,
  deserializeSettingsDict,
} from "utilities/settings";
import type { MetricSettings } from "app/finance/_settings/metric_settings";
import type { DistrictDataFilters } from "utilities/DistrictData";

interface PAOFilterSettings {
  selectedObjects: string[];
  selectedActivities: string[];
  selectedPrograms: string[];
}

export interface ExpendituresSettings
  extends MetricSettings, PAOFilterSettings {
  overridePrimaryFilter: boolean;
}

export function settingsToDistrictDataFilters(
  expenditureSettings: ExpendituresSettings,
): DistrictDataFilters {
  return {
    selectedObjectCodes: extractCodes(
      "obj",
      expenditureSettings.selectedObjects,
    ),
    selectedActivityCodes: extractCodes(
      "act",
      expenditureSettings.selectedActivities,
    ),
    selectedProgramCodes: extractCodes(
      "prog",
      expenditureSettings.selectedPrograms,
    ),
  };
}

export const DEFAULT_EXPENDITURE_SETTINGS = DEFAULT_METRIC_SETTINGS.map(
  (v) => ({
    ...v,
    overridePrimaryFilter: false,

    selectedObjects: ALL_OBJECT_ITEMS,
    selectedActivities: ALL_ACTIVITY_ITEMS,
    selectedPrograms: ALL_PROGRAM_ITEMS,
  }),
);

export function serializeOneExpenditureFilterSettings(
  settings: ExpendituresSettings,
): string {
  const mStr = serializeMetricSettings(settings);
  const settingsDict = {} as Record<string, string>;

  // Only output filters if they are overridden.
  if (settings.overridePrimaryFilter || settings.id === 0) {
    const distrctDataFilters = settingsToDistrictDataFilters(settings);
    settingsDict["p"] = ProgramFilter.toFilterString(
      new Set(distrctDataFilters.selectedProgramCodes),
    );
    settingsDict["a"] = ActivityFilter.toFilterString(
      new Set(distrctDataFilters.selectedActivityCodes),
    );
    settingsDict["o"] = ObjectFilter.toFilterString(
      new Set(distrctDataFilters.selectedObjectCodes),
    );
  }

  const str = serializeSettingsDict(settingsDict);

  // Drop missing settings. Then join with ~.
  return [mStr, str].filter((x) => !!x).join("~");
}

export function serializeExpenditureFilterSettings(
  allSettings: Array<ExpendituresSettings>,
): Array<string> {
  const result = new Array<string>();
  for (const setting of allSettings) {
    result.push(serializeOneExpenditureFilterSettings(setting));
  }
  return result;
}

export function deserializeOneExpenditureFilterSettings(
  defaultSettings,
  serialized: string,
) {
  const settings = deserializeOneMetricSettings(defaultSettings, serialized);
  const settingsDict = deserializeSettingsDict(serialized);

  for (const [key, value] of Object.entries(settingsDict)) {
    switch (key) {
      case "p":
        settings.overridePrimaryFilter = true;
        settings.selectedPrograms = ProgramFilter.toTreeViewItems(value);
        break;

      case "a":
        settings.overridePrimaryFilter = true;
        settings.selectedActivities = ActivityFilter.toTreeViewItems(value);
        break;

      case "o":
        settings.overridePrimaryFilter = true;
        settings.selectedObjects = ObjectFilter.toTreeViewItems(value);
        break;
    }
  }

  return settings;
}

export function deserializeExpenditureFilterSettings(queries: Array<string>) {
  if (queries.length === 0) {
    return DEFAULT_EXPENDITURE_SETTINGS;
  }

  const allSettings = new Array<ExpendituresSettings>();
  for (let i = 0; i < queries.length; i++) {
    const newSettings = deserializeOneExpenditureFilterSettings(
      DEFAULT_EXPENDITURE_SETTINGS,
      queries[i],
    );
    newSettings.id = i;
    allSettings.push(newSettings);
  }
  return allSettings;
}
