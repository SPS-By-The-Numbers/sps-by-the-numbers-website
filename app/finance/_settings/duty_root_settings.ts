import {
  serializeSettingsDict,
  deserializeSettingsDict,
} from "utilities/settings";
import DutyRootFilter from "app/finance/_filteritems/duty_root";

import type { DutyFilters } from "utilities/DistrictData";

export const DEFAULT_DUTY_FILTERS : DutyFilters = {
  dutyCodes: DutyRootFilter.allCodes()
};

export function serializeDutyFilters(s: DutyFilters) : string {
  const settingsDict = {
    "d": DutyRootFilter.toFilterString(s.dutyCodes),
  };

  return serializeSettingsDict(settingsDict);
}

export function deserializeDutyFilters(defaultSettings: DutyFilters, serialized: string) : DutyFilters {
  if (serialized === undefined) {
    return { dutyCodes: DutyRootFilter.allCodes() };
  }
  const settingsDict = deserializeSettingsDict(serialized);
  const settings = Object.assign({}, defaultSettings);
  for (const [key, value] of Object.entries(settingsDict)) {
    switch (key) {
      case "d":
        const s = DutyRootFilter.fromFilterString(value);
        settings.dutyCodes = DutyRootFilter.fromFilterString(value);
        break;
    }
  }

  return settings;
}
