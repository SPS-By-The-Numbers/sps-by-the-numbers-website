'use client';

import { useId } from 'react';
import * as ChartOptions from 'utilities/ChartOptions';
import InputLabel from '@mui/material/InputLabel';
import SettingsSelect from 'app/finance/_widgets/SettingsSelect';
import Stack from '@mui/material/Stack';

import type { CommonSharedSettings } from 'app/finance/_widgets/CommonSharedSettingsContents';
import type { SettingsContentsProps } from 'app/finance/_widgets/SettingsContents';
import type { SortOrder, SortType } from 'utilities/ChartableMetrics';

const ALL_FACETS = ["activity", "program", "object", "nces", "school"];
type Facet = typeof ALL_FACETS[number];
const FACET_OPTIONS : Record<Facet, string> = {
  "activity": "Activity",
  "program": "Program",
  "object": "Object",
  "nces": "NCES (actuals only)",
  "school": "School (actuals only)",
};

const YSCALE_OPTIONS : Record<ChartOptions.YScale, string> = {
  "ascending": "Ascending",
  "descending": "Descending",
};

export interface PAOFilterSettings {
  selectedObjects : string[];
  selectedActivities : string[];
  selectedPrograms : string[];
}

export interface ExpendituresDashboardSettings extends CommonSharedSettings, PAOFilterSettings {
  facet: Facet;
  facetLimit: ChartOptions.FacetLimit;
  sortOrder: SortOrder;
  sortType: SortType;
  yScale: ChartOptions.YScale;
};

export default function ExpendituresDashboardSettingsContents(props : SettingsContentsProps<ExpendituresDashboardSettings>) {
  return (
    <>
      <SettingsSelect {...props} label="Facet" fieldName="facet" options={FACET_OPTIONS} />
      <SettingsSelect {...props} label="Facet Limit" fieldName="facetLimit" options={ChartOptions.FACET_LIMIT_OPTIONS} />
      <SettingsSelect {...props} label="Sort Type" fieldName="sortType" options={ChartOptions.SORT_TYPE_OPTIONS} />
      <SettingsSelect {...props} label="Sort Order" fieldName="sortOrder" options={ChartOptions.SORT_ORDER_OPTIONS} />
      <SettingsSelect {...props} label="YScale" fieldName="yScale" options={ChartOptions.YSCALES_OPTIONS} />
    </>
  );
}
