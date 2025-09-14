'use client';

import { makeChartableExpenditures } from 'utilities/ChartableMetrics';
import { useDistrictData } from '../DistrictDataProvider';
import { useState, useEffect } from 'react';
import DistrictSelector from 'components/finance/DistrictSelector';
import ExpenditureFilter, { ALL_PROGRAM_ITEMS, ALL_ACTIVITY_ITEMS, ALL_OBJECT_ITEMS } from 'app/finance/ExpenditureFilter';
import FacetedBudgetActualCharts from 'components/finance/FacetedBudgetActualCharts';
import Loading from 'components/Loading';
import MetricVariantSelector from 'components/finance/MetricVariantSelector';
import Stack from '@mui/material/Stack';

import type { DistrictDataMap } from 'app/finance/DistrictDataProvider';
import type { MetricDef } from './ComparisonDashboard';

type Params = {
  primaryCcddd: number;
  facet: "program" | "activity" | "object";
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

function allInMap(districtDataMap, allCcddds) {
  for (const ccddd of allCcddds) {
    if (!(ccddd in districtDataMap)) {
      return false;
    }
  }

  return true;
}

function compileData(districtDataMap, firstCcddd, otherCcddds, filterSelection, facet) {
  if (!allInMap(districtDataMap, [firstCcddd, ...otherCcddds])) {
    return [null,null];
  }

  const [firstData, facetOrder] = makeChartableExpenditures(
    firstCcddd,
    districtDataMap[firstCcddd].filteredExpenditures(filterSelection),
    facet,
    'variance' as const,
    'descending' as const);

    const data = [...otherCcddds].reduce(
      (acc, ccddd) => {
        if (!(ccddd in districtDataMap)) {
          console.warn("Not loaded yet " + ccddd);
          return acc;
        }

        const [otherData, _] = makeChartableExpenditures(
          ccddd,
          districtDataMap[ccddd].filteredExpenditures(filterSelection),
          facet,
          'variance' as const,
          'descending' as const
        );

        return acc.join_full(otherData);
      },
      firstData);

      return [data, facetOrder];
}

// Charts expenditures for 
export default function ExpendituresDashboard({facet} : Params) {
  const {districtDataMap, loadCcddd} = useDistrictData();
  const initialCcddd = 17001;
  const [selectedObjects, setSelectedObjects] = useState<string[]>(ALL_OBJECT_ITEMS);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(ALL_ACTIVITY_ITEMS);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(ALL_PROGRAM_ITEMS);
  const [metricList, setMetricList] = useState<Array<MetricDef>>(
    [
      {
        ccddd: initialCcddd,
        metricVariant: 'amount' as const,
      },
      {
        ccddd: initialCcddd,
        metricVariant: 'pctexp' as const,
      },
    ]
  );

  useEffect(
    () => {
      for (const metricDef of metricList) {
        loadCcddd(metricDef.ccddd);
      }
    },
    [loadCcddd, metricList]
  );

  // Create filters for expenditures.
  const filterSelection = {
    selectedObjectCodes: extractCodes('obj', selectedObjects),
    selectedActivityCodes: extractCodes('act', selectedActivities),
    selectedProgramCodes: extractCodes('prog', selectedPrograms),
  };

  const firstCcddd = metricList[0].ccddd;
  const otherCcddds = new Set(metricList.map(def => def.ccddd));
  otherCcddds.delete(firstCcddd);

  const [data, facetOrder] = compileData(districtDataMap, firstCcddd, otherCcddds,
                                         filterSelection, facet);

  if (data === null) {
    return (
      <Loading text="Loading data" />
    );
  }

  // Merge all the data.
  // Create handlers used to update the metricList from the correct set of controls.
  const updateMetricList = (i, newState) => {
    // Copy the list.
    const newList = [...metricList];

    // Override the fields in the right MetricDef then set.
    newList[i] = {...metricList[i], ...newState};
    setMetricList(newList);
  };

  return (
    <div>
      {/* This section is configuration of the data set. */}
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

      {/* This section is configuration of each comparison */}
      <Stack direction="row" spacing={4}>
        {metricList.map(
          (def,i) => (
              <Stack key={i} spacing={4} direction="column">
                <DistrictSelector
                  ccddd={def.ccddd}
                  onChange={(selection) => {
                    updateMetricList(i, {ccddd: selection})
                  }}
                />
                <MetricVariantSelector
                  label={`Column ${i} variant`}
                  variant={metricList[i].metricVariant}
                  onChange={newValue => updateMetricList(i, {metricVariant: newValue})}
                />
              </Stack>
          ))
        }
      </Stack>

      {/* Draw the Charts */}
      <FacetedBudgetActualCharts
        idPrefix={facet}
        data={data}
        xColumn="class_of"
        xLabel="Class of"
        facetOrder={facetOrder}
        metricList={metricList}
      />
    </div>
  );
}
