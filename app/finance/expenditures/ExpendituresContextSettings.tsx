import { DEFAULT_COMMON_CONTEXT_SETTINGS } from "app/finance/_settings/common_context_settings";
import { useId } from "react";
import * as ChartOptions from "utilities/ChartOptions";
import InputLabel from "@mui/material/InputLabel";
import SettingsSelect from "app/finance/_widgets/SettingsSelect";
import Stack from "@mui/material/Stack";
import {
  serializeSettingsDict,
  deserializeSettingsDict,
} from "utilities/settings";

import type { SettingsConfig } from "app/finance/_settings/base_settings";
import type { CommonContextSettings } from "app/finance/_settings/common_context_settings";
import type { SettingsContentsProps } from "app/finance/_widgets/SettingsContents";
import type { SortOrder, SortType } from "utilities/ChartOptions";

const ALL_FACETS = ["activity", "program", "object"];
export type Facet = (typeof ALL_FACETS)[number];
export const FACET_OPTIONS: Record<Facet, string> = {
  activity: "Activity",
  program: "Program",
  object: "Object",
};

export type ExpendituresContextSettings = CommonContextSettings & {
  facet: Facet;
  facetLimit: ChartOptions.FacetLimit;
  sortOrder: SortOrder;
  sortType: SortType;
  yScale: ChartOptions.YScale;
}

export const DEFAULT_DASHBOARD_SETTINGS: ExpendituresContextSettings = {
  ...DEFAULT_COMMON_CONTEXT_SETTINGS,
  facet: "activity",
  facetLimit: "0",
  sortOrder: "descending",
  sortType: "variance",
  yScale: "fixed",
};

export function serializeExpendituresDashbaordFacet(facet: Facet): string {
  switch (facet) {
    case "activity":
      return "0";

    case "program":
      return "1";

    case "object":
      return "2";
  }

  return "0";
}

export function deserializeExpendituresDashbaordFacet(s: string): Facet {
  switch (s) {
    case "0":
      return "activity";

    case "1":
      return "program";

    case "2":
      return "object";
  }

  return "activity";
}

export default function ExpendituresContextSettingsContents(
  props: SettingsContentsProps<ExpendituresContextSettings>,
) {
  return (
    <>
      <SettingsSelect
        {...props}
        label="Facet"
        fieldName="facet"
        options={FACET_OPTIONS}
      />
      <SettingsSelect
        {...props}
        label="Facet Limit"
        fieldName="facetLimit"
        options={ChartOptions.FACET_LIMIT_OPTIONS}
      />
    </>
  );
}
