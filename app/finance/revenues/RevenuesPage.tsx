"use client";

import { DEFAULT_DATASET_SETTINGS } from "app/finance/_settings/dataset_settings";
import * as CommonContextSettings from "app/finance/_settings/common_context_settings";
import * as CommonSettings from "app/finance/_settings/common_settings";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import {
  makeDefaultRevenueSettings,
  makeDefaultDatasetSettings,
  makeDefaultProgramSettings,
} from "app/finance/_settings/common_settings";
import RevenuesDashboard from "./RevenuesDashboard";
import {
  DEFAULT_DASHBOARD_SETTINGS,
  serializeRevenuesDashbaordFacet,
  deserializeRevenuesDashbaordFacet,
} from "./RevenuesContextSettings";

import type { Facet } from "./RevenuesContextSettings";

import type { DatasetSettings } from "app/finance/_settings/dataset_settings";
import type {
  RevenueCategoryFilters,
  RevenueAccountFilters,
  PFilters,
} from "utilities/DistrictData";

export type RevenuesSettings = DatasetSettings &
  RevenueCategoryFilters &
  RevenueAccountFilters &
  PFilters;

export const DEFAULT_REVENUES_SETTINGS = DEFAULT_DATASET_SETTINGS.map((v) => ({
  ...v,
  ...makeDefaultDatasetSettings(v.ccddd),
  ...makeDefaultRevenueSettings(),
  ...makeDefaultProgramSettings(),
}));

export const SERIALIZE_REVENUES_SETTINGS_GENERATORS = [
  CommonSettings.makeDatasetSerializeConfig,
  CommonSettings.makeRevenueSerializeConfig,
  CommonSettings.makeProgramSerializeConfig,
];

export const SERIALIZE_REVENUES_CONTEXT_SETTINGS_GENERATORS = [
  CommonContextSettings.makeFacetSerializeConfigHelper<Facet>(
    serializeRevenuesDashbaordFacet,
    deserializeRevenuesDashbaordFacet,
  ),
  CommonContextSettings.makeSortOrderSerializeConfig,
  CommonContextSettings.makeYScaleSerializeConfig,
  CommonContextSettings.makeChartsEnabledSerializeConfig,
];

export default function RevenuesPage() {
  return (
    <EnsureDistrictData
      defaultAllSettings={DEFAULT_REVENUES_SETTINGS}
      allSettingsConfigGenerators={SERIALIZE_REVENUES_SETTINGS_GENERATORS}
      defaultContextSettings={DEFAULT_DASHBOARD_SETTINGS}
      contextSettingsConfigGenerators={
        SERIALIZE_REVENUES_CONTEXT_SETTINGS_GENERATORS
      }
      ContentComponent={RevenuesDashboard}
    />
  );
}
