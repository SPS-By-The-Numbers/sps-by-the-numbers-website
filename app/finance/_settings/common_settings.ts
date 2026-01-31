import { makeSchoolFilter } from "app/finance/_filteritems/school";
import { deserializeSettings } from "app/finance/_settings/base_settings";

import type { BaseSettings } from "app/finance/_settings/base_settings";

import {
  serializeSettingsDict,
  deserializeSettingsDict,
} from "utilities/settings";
import ActivityFilter from "app/finance/_filteritems/activity";
import DutyRootFilter from "app/finance/_filteritems/duty_root";
import ObjectFilter from "app/finance/_filteritems/object";
import ProgramFilter from "app/finance/_filteritems/program";

import type { FilterSerializationConfig } from "utilities/filter";
import type { SettingsDict } from "utilities/settings";

///////
// Big blob of defaults for one setting.
//
export function makeDefaultSettings(ccddd: number) {
  return {
    activityCodes: ActivityFilter.allCodes(),
    programCodes: ProgramFilter.allCodes(),
    dutyRootCodes: DutyRootFilter.allCodes(),
    objectCodes: ObjectFilter.allCodes(),
    schoolCodes: makeSchoolFilter(ccddd).allCodes(),
  };
}


///////
// Configurations for serializing to a URL.
//
export function makePaSerializeConfig(context?) : FilterSerializationConfig {
  return {
    "programCodes": {
      urlVar: "p",
      filter: ProgramFilter,
    },
    "activityCodes": {
      urlVar: "a",
      filter: ActivityFilter,
    },
  };
}

export function makePaoSerializeConfig(context?) : FilterSerializationConfig {
  return {
    ...makePaSerializeConfig(context),
    "objectCodes": {
      urlVar: "o",
      filter: ObjectFilter,
    },
  };
}

export function makeDutyRootSerializeConfig(context?) : FilterSerializationConfig {
  return {
    "dutyRootCodes": {
      urlVar: "d",
      filter: DutyRootFilter,
    },
  };
};

export function serializeFilters(serializationConfig: FilterSerializationConfig,
                                 settings) : string {
  const settingsDict : SettingsDict = {};
  for (const [key, serializerInfo] of Object.entries(serializationConfig)) {
    settingsDict[serializerInfo.urlVar] = serializerInfo.filter.toFilterString(settings[key]);
  }

  return serializeSettingsDict(settingsDict);
}

export function deserializeFilters<SettingsType>(defaultSettings: SettingsType,
                                                 serializationConfig: FilterSerializationConfig,
                                                 serialized: string) : SettingsType {
  const settings = Object.assign({}, defaultSettings);
  const settingsDict = deserializeSettingsDict(serialized);
  const configByUrlVar = Object.fromEntries(
    Object.entries(serializationConfig).map(
      ([settingsVar, config]) => [config.urlVar, {...config, settingsVar}]
    ));
  for (const [urlVar, serializedValue] of Object.entries(settingsDict)) {
    const serializerInfo = configByUrlVar[urlVar];
    if (serializerInfo) {
      settings[serializerInfo.settingsVar] = serializerInfo.filter.fromFilterString(serializedValue);
    }
  }

  return settings;
}

// Serializes an array of settings for a dataset into one url query parameter.
export function serializeDatasetSettings<SettingsType extends BaseSettings>(
  allSettings: Array<SettingsType>,
  configGenerators: Array<(context?) => FilterSerializationConfig>,
) : Array<string> {
  const serializedSettings = new Array<string>();
  for (const settings of allSettings) {
    const fragments = new Array<string>();
    // Run through each config in order.
    for (const geneator of configGenerators) {
      fragments.push(serializeFilters(geneator(settings), settings));
    }
    serializedSettings.push(fragments.join('~'));
  }

  return serializedSettings;
}

// Deserializes all of a dataset.  The configs are deserialized in order like a
// foldLeft using the defaultAllSettings[0] as the first value. That means
// later configs can depend on results of earlier ones.
export function deserializeDatasetSettings<SettingsType extends BaseSettings>(
  queries: Array<string>,
  defaultAllSettings: Array<SettingsType>,
  configGenerators: Array<(context?) => FilterSerializationConfig>,
) : Array<SettingsType> {
  if (queries.length === 0) {
    return defaultAllSettings;
  }

  // Make settings.
  const allSettings = new Array<SettingsType>();
  for (let i = 0; i < queries.length; i++) {
    let settings = Object.assign({}, defaultAllSettings[0]);

    // Run through each config in order.
    for (const geneator of configGenerators) {
      settings = deserializeFilters(settings, geneator(settings), queries[i]);
    }

    // Stamp a new Id and add.
    settings.id = i;
    allSettings.push(settings);
  }

  return allSettings;
}
