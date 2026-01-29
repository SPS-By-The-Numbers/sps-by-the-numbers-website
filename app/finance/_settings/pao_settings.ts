// Fitlers for Program, Activity, and Object codes.
//
// Values are arrays of TreeView item strings suitable for a rich-test filter.
// Look at Filter.toTreeViewItems() for converting back and forth.

import ProgramFilter from "app/finance/_filteritems/program";
import ActivityFilter from "app/finance/_filteritems/activity";
import ObjectFilter from "app/finance/_filteritems/object";
import {
  serializeSettingsDict,
  deserializeSettingsDict,
} from "utilities/settings";

import type { PAFilters, PAOFilters } from "utilities/DistrictData";

export const DEFAULT_PA_FILTERS : PAFilters = {
  activityCodes: ActivityFilter.allCodes(),
  programCodes: ProgramFilter.allCodes(),
};

export const DEFAULT_PAO_FILTERS : PAOFilters = {
  ...DEFAULT_PA_FILTERS,
  objectCodes: ObjectFilter.allCodes(),
};

export function serializePAFilters(s: PAFilters) : string {
  const settingsDict = {
    "p": ProgramFilter.toFilterString(s.programCodes),
    "a": ActivityFilter.toFilterString(s.activityCodes),
  };

  return serializeSettingsDict(settingsDict);
}

export function deserializePAFilters(defaultSettings,
                                     serialized: string) : PAFilters {
  const settingsDict = deserializeSettingsDict(serialized);
  const settings = Object.assign({}, defaultSettings);
  for (const [key, value] of Object.entries(settingsDict)) {
    switch (key) {
      case "p":
        settings.programCodes = ProgramFilter.fromFilterString(value);
        break;

      case "a":
        settings.activityCodes = ActivityFilter.fromFilterString(value);
        break;
    }
  }

  return settings;
}

export function serializePAOFilters(s: PAOFilters) : string {
  const fragments = [serializePAOFilters(s)];
  const settingsDict = {
    "o": ProgramFilter.toFilterString(s.objectCodes),
  };
  fragments.push(serializeSettingsDict(settingsDict));

  return fragments.filter((x) => !!x).join("~");
}

export function deserializePAOFilters(defaultSettings,
                                      serialized: string) : PAOFilters {
  const settingsDict = deserializeSettingsDict(serialized);
  const settings = Object.assign({},
                                 DEFAULT_PAO_FILTERS,
                                 deserializePAFilters(defaultSettings, serialized));
  for (const [key, value] of Object.entries(settingsDict)) {
    switch (key) {
      case "o":
        settings.objectCodes = ObjectFilter.fromFilterString(value);
        break;
    }
  }

  return settings;
}
