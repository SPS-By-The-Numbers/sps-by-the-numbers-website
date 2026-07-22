import { DEFAULT_COMMON_FACET_CONTEXT_SETTINGS } from "app/finance/_settings/common_context_settings";
import * as ChartOptions from "utilities/ChartOptions";
import SettingsSelect from "app/finance/_widgets/SettingsSelect";

import type { CommonContextSettings } from "app/finance/_settings/common_context_settings";
import type { SettingsContentsProps } from "app/finance/_widgets/SettingsContents";
import type { SortOrder, SortType } from "utilities/ChartOptions";

const ALL_FACETS = ["category", "revenue", "program"];
export type Facet = (typeof ALL_FACETS)[number];
export const FACET_OPTIONS: Record<Facet, string> = {
  category: "Revenue Category",
  revenue: "Revenue Account",
  program: "Program",
};

export type RevenuesContextSettings = CommonContextSettings & {
  facet: Facet;
  facetLimit: ChartOptions.FacetLimit;
  sortOrder: SortOrder;
  sortType: SortType;
  yScale: ChartOptions.YScale;
};

export const DEFAULT_DASHBOARD_SETTINGS: RevenuesContextSettings = {
  ...DEFAULT_COMMON_FACET_CONTEXT_SETTINGS,
  facet: "category",
};

export function serializeRevenuesDashbaordFacet(facet: Facet): string {
  switch (facet) {
    case "category":
      return "0";

    case "revenue":
      return "1";

    case "program":
      return "2";
  }

  return "0";
}

export function deserializeRevenuesDashbaordFacet(s: string): Facet {
  switch (s) {
    case "0":
      return "category";

    case "1":
      return "revenue";

    case "2":
      return "program";
  }

  return "category";
}

export default function RevenuesContextSettingsContents(
  props: SettingsContentsProps<RevenuesContextSettings>,
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
