import { makeSchoolFilter } from "app/finance/_filteritems/school";

import {
  serializeSettingsDict,
  deserializeSettingsDict,
} from "utilities/settings";

import type { SchoolFilters } from "utilities/DistrictData";

export function defaultSchooFilters(ccddd: number) : SchoolFilters {
  return { schoolCodes: makeSchoolFilter(ccddd).allCodes() };
}

export function serializeSchoolFilters(ccddd: number, s: SchoolFilters) : string {
  const settingsDict = {
    "s": makeSchoolFilter(ccddd).toFilterString(s.schoolCodes),
  };

  return serializeSettingsDict(settingsDict);
}

export function deserializeSchoolFilters(ccddd: number,
                                         serialized: string) : SchoolFilters {
  const settings = defaultSchooFilters(ccddd);
  const schoolFilter = makeSchoolFilter(ccddd);
  if (!serialized) {
    return schoolFilter.allCodes();
  }
  const settingsDict = deserializeSettingsDict(serialized);
  for (const [key, value] of Object.entries(settingsDict)) {
    switch (key) {
      case "s":
        settings.schoolCodes = schoolFilter.fromFilterString(value);
        break;
    }
  }

  return settings;
}
