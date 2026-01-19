import { DEFAULT_COMMON_SHARED_SETTINGS } from "app/finance/_widgets/CommonSharedSettingsContents";
import { useId } from "react";
import * as ChartOptions from "utilities/ChartOptions";
import InputLabel from "@mui/material/InputLabel";
import SettingsSelect from "app/finance/_widgets/SettingsSelect";
import Stack from "@mui/material/Stack";
import { serializeSettingsDict, deserializeSettingsDict } from 'utilities/settings';

import type { CommonSharedSettings } from "app/finance/_widgets/CommonSharedSettingsContents";
import type { SettingsContentsProps } from "app/finance/_widgets/SettingsContents";
import type { SortOrder, SortType } from "utilities/ChartOptions";

const ALL_FACETS = ["activity", "program", "object"];
type Facet = (typeof ALL_FACETS)[number];
const FACET_OPTIONS: Record<Facet, string> = {
  activity: "Activity",
  program: "Program",
  object: "Object",
};

const YSCALE_OPTIONS: Record<ChartOptions.YScale, string> = {
  ascending: "Ascending",
  descending: "Descending",
};

export interface ExpendituresDashboardSettings extends CommonSharedSettings {
  facet: Facet;
  facetLimit: ChartOptions.FacetLimit;
  sortOrder: SortOrder;
  sortType: SortType;
  yScale: ChartOptions.YScale;
}

const DEFAULT_DASHBOARD_SETTINGS : ExpendituresDashboardSettings = {
  ...DEFAULT_COMMON_SHARED_SETTINGS,
  facet: "activity",
  facetLimit: "0",
  sortOrder: "descending",
  sortType: "variance",
  yScale: "fixed",
};

function serializeFacet(facet: Facet) {
  return facet as string;
}

function deserializeFacet(s: string) : Facet {
  switch (s) {
    case 'activity':
      return 'activity';

    case 'program':
      return 'program';

    case 'object':
      return 'object';
  }

  return 'activity';
}

export function serializeExpenditureDashboardSettings(s : ExpendituresDashboardSettings) {
  const settingsDict = {
    f: serializeFacet(s.facet),
    l: ChartOptions.serializeFacetLimit(s.facetLimit),
    so: ChartOptions.serializeSortOrder(s.sortOrder),
    st: ChartOptions.serializeSortType(s.sortType),
    ys: ChartOptions.serializeYScales(s.yScale),
  };

  return serializeSettingsDict(settingsDict);
}

export function deserializeExpenditureDashboardSettings(serialized : string) {
  const settingsDict = deserializeSettingsDict(serialized);
  const settings = DEFAULT_DASHBOARD_SETTINGS;
  for (const [key, value] of Object.entries(settingsDict)) {
    switch (key) {
      case 'f':
        settings.facet = deserializeFacet(value);
        break;

      case 'l':
        settings.facetLimit = ChartOptions.deserializeFacetLimit(value);
        break;

      case 'so':
        settings.sortOrder = ChartOptions.deserializeSortOrder(value);
        break;

      case 'st':
        settings.sortType = ChartOptions.deserializeSortType(value);
        break;

      case 'ys':
        settings.yScale = ChartOptions.deserializeYScales(value);
        break;
    }
  }
  return settings;
}

export default function ExpendituresDashboardSettingsContents(
  props: SettingsContentsProps<ExpendituresDashboardSettings>,
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
      <SettingsSelect
        {...props}
        label="Sort Type"
        fieldName="sortType"
        options={ChartOptions.SORT_TYPE_OPTIONS}
      />
      <SettingsSelect
        {...props}
        label="Sort Order"
        fieldName="sortOrder"
        options={ChartOptions.SORT_ORDER_OPTIONS}
      />
      <SettingsSelect
        {...props}
        label="YScale"
        fieldName="yScale"
        options={ChartOptions.YSCALES_OPTIONS}
      />
    </>
  );
}
