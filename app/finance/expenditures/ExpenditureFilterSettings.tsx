import { DEFAULT_METRIC_SETTINGS, serializeMetricSettings, deserializeMetricSettings } from "app/finance/_widgets/MetricSettingsContents";
import {
  ALL_OBJECT_ITEMS,
  ALL_ACTIVITY_ITEMS,
  ALL_PROGRAM_ITEMS,
  extractCodes,
} from "app/finance/_widgets/ExpenditureFilterContents";
import ProgramFilter from 'app/finance/_filteritems/program';
import ActivityFilter from 'app/finance/_filteritems/activity';
import ObjectFilter from 'app/finance/_filteritems/object';

import { serializeSettingsDict, deserializeSettingsDict } from 'utilities/settings';
import type { MetricSettings } from "app/finance/_widgets/MetricSettingsContents";
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


export const DEFAULT_EXPENDITURE_SETTINGS = DEFAULT_METRIC_SETTINGS.map((v) => ({
  ...v,
  overridePrimaryFilter: false,

  selectedObjects: ALL_OBJECT_ITEMS,
  selectedActivities: ALL_ACTIVITY_ITEMS,
  selectedPrograms: ALL_PROGRAM_ITEMS,
}));

export function serializeExpenditureFilterSettings(allSettings : ExpendituresSettings) {
  // Only handles first setting.
  const settings = allSettings[0];
  const mStr = serializeMetricSettings(settings);
  const settingsDict = {};
  if (settings.overridePrimaryFilter || settings.id == 'primary') {
    const distrctDataFilters = settingsToDistrictDataFilters(settings);
    settingsDict['p'] = ProgramFilter.toFilterString(new Set(distrctDataFilters.selectedProgramCodes));
    settingsDict['a'] = ActivityFilter.toFilterString(new Set(distrctDataFilters.selectedActivityCodes));
    settingsDict['o'] = ObjectFilter.toFilterString(new Set(distrctDataFilters.selectedObjectCodes));
  }

  const str = serializeSettingsDict(settingsDict);

  return [mStr, str].filter(x => !!x).join(';')
}

export function deserializeExpenditureFilterSettings(serialized : string) {
  const settingsDict = deserializeSettingsDict(serialized);
  const ms = deserializeMetricSettings(serialized);
  const allSettings = Object.assign(DEFAULT_EXPENDITURE_SETTINGS);
  for (const i in ms) {
    if (allSettings[i] === undefined) {
      // TODO: uh oh...missing settings?
      allSettings[i] = ms[i];
    } else {
      for (const [s, v] of Object.entries(ms[i])) {
        allSettings[i][s] = v;
      }
    }
  }

  // TODO: This only handles first one.
  const settings = allSettings[0];
  for (const [key, value] of Object.entries(settingsDict)) {
    switch (key) {
      case 'p':
        settings.overridePrimaryFilter = true;
        settings.selectedPrograms = ProgramFilter.fromFilterString(value);
        break;
      
      case 'a':
        settings.overridePrimaryFilter = true;
        settings.selectedActivities = ActivityFilter.fromFilterString(value);
        break;

      case 'o':
        settings.overridePrimaryFilter = true;
        settings.selectedObjects = ObjectFilter.fromFilterString(value);
        break;
    }
  }

  return allSettings;
}
