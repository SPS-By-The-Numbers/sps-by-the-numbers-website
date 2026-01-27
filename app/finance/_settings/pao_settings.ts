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

export interface PAFilterSettings {
  activities: Set<number>;
  programs: Set<number>;
};
export const DEFAULT_PA_FILTER_SETTINGS : PAFilterSettings = {
  activities: ActivityFilter.allCodes(),
  programs: ProgramFilter.allCodes(),
};

export interface PAOFilterSettings extends PAFilterSettings {
  objects: Set<number>;
}
export const DEFAULT_PAO_FILTER_SETTINGS : PAOFilterSettings = {
  ...DEFAULT_PA_FILTER_SETTINGS,
  objects: ObjectFilter.allCodes(),
};

export function serializePAFilterSettings(s: PAFilterSettings) : string {
  const settingsDict = {
    "p": ProgramFilter.toFilterString(s.programs),
    "a": ActivityFilter.toFilterString(s.activities),
  };

  return serializeSettingsDict(settingsDict);
}

export function deserializePAFilterSettings(defaultSettings,
                                            serialized: string) : PAFilterSettings {
  const settingsDict = deserializeSettingsDict(serialized);
  const settings = Object.assign({}, defaultSettings);
  for (const [key, value] of Object.entries(settingsDict)) {
    switch (key) {
      case "p":
        settings.programs = ProgramFilter.fromFilterString(value);
        break;

      case "a":
        settings.activities = ActivityFilter.fromFilterString(value);
        break;
    }
  }

  return settings;
}

export function serializePAOFilterSettings(s: PAOFilterSettings) : string {
  const fragments = [serializePAOFilterSettings(s)];
  const settingsDict = {
    "o": ProgramFilter.toFilterString(s.objects),
  };
  fragments.push(serializeSettingsDict(settingsDict));

  return fragments.filter((x) => !!x).join("~");
}

export function deserializePAOFilterSettings(defaultSettings,
                                             serialized: string) : PAOFilterSettings {
  const settingsDict = deserializeSettingsDict(serialized);
  const settings = Object.assign({},
                                 DEFAULT_PAO_FILTER_SETTINGS,
                                 deserializePAFilterSettings(defaultSettings, serialized));
  for (const [key, value] of Object.entries(settingsDict)) {
    switch (key) {
      case "o":
        settings.objects = ObjectFilter.fromFilterString(value);
        break;
    }
  }

  return settings;
}
