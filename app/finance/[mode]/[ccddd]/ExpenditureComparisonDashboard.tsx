import { useState } from 'react';
import { makeChartableExpenditures } from 'utilities/ChartableMetrics';

import ComparisonDashboard from './ComparisonDashboard';
import ExpenditureFilter, { ALL_PROGRAM_ITEMS, ALL_ACTIVITY_ITEMS, ALL_OBJECT_ITEMS } from 'app/finance/ExpenditureFilter';

import type DistrictDataMap from 'app/finance/DistrictDataProvider';

type Params = {
  primaryCcddd: number;
  districtDataMap: DistrictDataMap;
  expenditureFacet: "program" | "activity" | "object";
};

function extractCodes(prefix, selectedItems) {
  const selectedCodes = new Array<number>;
  for (const id of selectedItems) {
    const parts = id.split('-');
    if (parts.length === 2 && parts[0] === prefix) {
      selectedCodes.push(parseInt(parts[1]));
    }
  }
  return selectedCodes;
}

// Charts expenditures for 
export default function ExpenditureComparisonDashboard({primaryCcddd, districtDataMap, expenditureFacet} : Params) {
  const [selectedObjects, setSelectedObjects] = useState<string[]>(ALL_OBJECT_ITEMS);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(ALL_ACTIVITY_ITEMS);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(ALL_PROGRAM_ITEMS);

  const filterSelection = {
    selectedObjectCodes: extractCodes('obj', selectedObjects),
    selectedActivityCodes: extractCodes('act', selectedActivities),
    selectedProgramCodes: extractCodes('prog', selectedPrograms),
  };

  const [data, facetOrder] = makeChartableExpenditures(
    primaryCcddd,
    districtDataMap[primaryCcddd].filteredExpenditures(filterSelection),
    expenditureFacet,
    'variance' as const,
    'descending' as const);

  return (
    <div>
      <ExpenditureFilter
        filterState={
          {
            selectedObjects,
            setSelectedObjects,
            selectedActivities,
            setSelectedActivities,
            selectedPrograms,
            setSelectedPrograms
          }}
      />
    <ComparisonDashboard
      idPrefix={expenditureFacet}
      data={data}
      xColumn="class_of"
      xLabel="Class of"
      facetOrder={facetOrder}
      metricList={
        [
          {
            primaryCcddd,
            metricVaraint: 'amount',
            valueFormat: 'currency' as const,
            precision: 2,  // TODO: remove and infer from valueFormat
          },
          {
            primaryCcddd,
            metricVaraint: 'pctexp',
            valueFormat: 'pctexp' as const,
            precision: 2,  // TODO: remove and infer from valueFormat
          },
        ]
      }
    />
  </div>);
}
