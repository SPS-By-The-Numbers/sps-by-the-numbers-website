import {
  serializeSettingsDict,
  deserializeSettingsDict,
} from "utilities/settings";
import ALL_DISTRICTS from "app/finance/_domain/ccddd";
import * as Normalizations from "utilities/normalizations";
import { makeSchoolFilter } from "app/finance/_filteritems/school";
import { serializeFilterGrouping, deserializeFilterGrouping } from "app/finance/_settings/dataset_settings";
import ActivityFilter from "app/finance/_filteritems/activity";
import DutyRootFilter from "app/finance/_filteritems/duty_root";
import ObjectFilter from "app/finance/_filteritems/object";
import ProgramFilter from "app/finance/_filteritems/program";
import memoize from "lodash/memoize";

import type { BaseSettings } from "app/finance/_settings/base_settings";
import type { Filter } from "utilities/filter";
import type { SettingsDict } from "utilities/settings";

export type SettingsConfigGenerators = Array<(context?) => SerializationConfig>;

type HasUrlVar = {
  urlVar: string;
};

type FilterSerializer = HasUrlVar & {
  serializerType: "filter";
  filter: Filter;
};

type CustomSerializer = HasUrlVar & {
  serializerType: "custom";
  serialize: (settings, key: string) => string;
  deserialize: (settings, value: string) => any;
};

type NoUrlVarSerializer = {
  serializerType: "nourlvar";
  deserialize: (settings) => any;
};

type SerializerInfo = FilterSerializer | CustomSerializer | NoUrlVarSerializer;

// Mapping of the key in a settings struct to a SerializerInfo that describes
// how it should be encoded into the URL.
export type SerializationConfig = Array<[string, SerializerInfo]>;

///////
// Big blob of defaults for one setting.
//
export function makeDefaultDatasetSettings(ccddd: number) {
  return {
    ccddd,
    filterGrouping: "spsbtn" as const,
    currencyNormalization: "amount" as const,
    staffingNormalization: "fte" as const,
    name: ALL_DISTRICTS[ccddd].district,
  }
}

export function makeDefaultPaSettings() {
  return {
    programCodes: ProgramFilter.allCodes(),
    activityCodes: ActivityFilter.allCodes(),
  }
}

export function makeDefaultPaoSettings() {
  return {
    ...makeDefaultPaSettings(),
    objectCodes: ObjectFilter.allCodes(),
  }
}

export function makeDefaultActualsSettings(ccddd: number) {
  return {
    schoolCodes: makeSchoolFilter(ccddd).allCodes(),
    dutyRootCodes: DutyRootFilter.allCodes(),
  }
}

export function makeDefaultSettings(ccddd: number) {
  return {
    ...makeDefaultDatasetSettings(ccddd),
    ...makeDefaultPaoSettings(),
    ...makeDefaultActualsSettings(ccddd),
  };
}

///////
// Configurations for serializing to a URL.
//
export function makeDatasetSerializeConfig(context?) : SerializationConfig {
  return [
    [
      "ccddd",
      {
        serializerType: "custom",
        urlVar: "c",
        serialize: (settings, key) => settings[key].toString(),
          deserialize: (settings, s) => parseInt(s),
      },
    ], [
      "filterGrouping",
      {
        serializerType: "custom",
        urlVar: "g",
        serialize: (settings, key) => serializeFilterGrouping(settings[key]),
          deserialize: (settings, s) => deserializeFilterGrouping(s),
      },
    ], [
      "currencyNormalization", {
        serializerType: "custom",
        urlVar: "cn",
        serialize: (settings, key) => Normalizations.serializeCurrencyNormalization(settings[key]),
          deserialize: (settings, s) => Normalizations.deserializeCurrencyNormalization(s),
      },
    ], [
      "staffingNormalization", {
        serializerType: "custom",
        urlVar: "sn",
        serialize: (settings, key) => Normalizations.serializeStaffingNormalization(settings[key]),
          deserialize: (settings, s) => Normalizations.deserializeStaffingNormalization(s),
      },
    ], [
      "name", {
        serializerType: "nourlvar",
        deserialize: (settings) => ALL_DISTRICTS[settings.ccddd].district,
      },
    ]
  ];
}

export function makePaSerializeConfig(context?) : SerializationConfig {
  return [
    [
      "programCodes", {
        serializerType: "filter",
        urlVar: "p",
        filter: ProgramFilter,
      },
    ], [
      "activityCodes", {
        serializerType: "filter",
        urlVar: "a",
        filter: ActivityFilter,
      },
    ]
  ];
}

export function makePaoSerializeConfig(context?) : SerializationConfig {
  return [
    ...makePaSerializeConfig(context),
    [
      "objectCodes",
      {
        serializerType: "filter",
        urlVar: "o",
        filter: ObjectFilter,
      },
    ],
  ];
}

export function makeDutyRootSerializeConfig(context?) : SerializationConfig {
  return [
    [
      "dutyRootCodes",
      {
        serializerType: "filter",
        urlVar: "d",
        filter: DutyRootFilter,
      },
    ]
  ];
};

function makeSchoolFilterConfigInternal(settings) : SerializationConfig {
  return [
    [ "schoolCodes",
      {
        serializerType: "filter",
        urlVar: "s",
        filter: makeSchoolFilter(settings.ccddd)
      }
    ],
  ];
}
export const makeSchoolFilterConfig = memoize(makeSchoolFilterConfigInternal);

// TODO: Don't export this.
export function serializeByConfig(serializationConfig: SerializationConfig,
                                  settings) : string {
  const settingsDict : SettingsDict = {};
  for (const [key, serializerInfo] of serializationConfig) {
    if (serializerInfo.serializerType === "filter") {
      settingsDict[serializerInfo.urlVar] = serializerInfo.filter.toFilterString(settings[key]);
    } else if (serializerInfo.serializerType === "custom") {
      settingsDict[serializerInfo.urlVar] = serializerInfo.serialize(settings, key)
    }
  }

  return serializeSettingsDict(settingsDict);
}

export function deserializeByConfig<SettingsType>(defaultSettings: SettingsType,
                                                  serializationConfig: SerializationConfig,
                                                  serialized: string) : SettingsType {
  const settings = Object.assign({}, defaultSettings);
  const settingsDict = deserializeSettingsDict(serialized);
  for (const [settingsVar, serializerInfo] of serializationConfig) {
    if (serializerInfo.serializerType === "nourlvar") {
      settings[settingsVar] = serializerInfo.deserialize(settings);
      continue;
    }

    const serializedValue = settingsDict[serializerInfo.urlVar];
    if (serializedValue === undefined) {
      continue;
    }

    if (serializerInfo.serializerType === "filter") {
      settings[settingsVar] = serializerInfo.filter.fromFilterString(serializedValue);
    } else if (serializerInfo.serializerType === "custom") {
      settings[settingsVar] = serializerInfo.deserialize(settings, serializedValue);
    }
  }

  return settings;
}

// Serializes an array of settings for a dataset into one url query parameter.
export function serializeDatasetSettings<SettingsType extends BaseSettings>(
  allSettings: Array<SettingsType>,
  configGenerators: Array<(context?) => SerializationConfig>,
) : Array<string> {
  const serializedSettings = new Array<string>();
  for (const settings of allSettings) {
    const fragments = new Array<string>();
    // Run through each config in order.
    for (const geneator of configGenerators) {
      fragments.push(serializeByConfig(geneator(settings), settings));
    }
    serializedSettings.push(fragments.filter(x => !!x).join('~'));
  }

  return serializedSettings;
}

// Deserializes all of a dataset.  The configs are deserialized in order like a
// foldLeft using the defaultAllSettings[0] as the first value. That means
// later configs can depend on results of earlier ones.
export function deserializeDatasetSettings<SettingsType extends DatasetSettings>(
  queries: Array<string>,
  defaultAllSettings: Array<SettingsType>,
  configGenerators: SettingsConfigGenerators
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
      settings = deserializeByConfig(settings, geneator(settings), queries[i]);
    }

    // Stamp a new Id and add.
    settings.id = i;
    allSettings.push(settings);
  }

  return allSettings;
}
