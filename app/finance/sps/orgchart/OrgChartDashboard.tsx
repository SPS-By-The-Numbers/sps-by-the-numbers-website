'use client';

import { DeptToPad } from 'app/finance/sps/orgchart/padOrgMapping';
import { op } from 'arquero';
import { useDistrictData } from 'app/finance/DistrictDataProvider';
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react';
import * as aq from 'arquero';
import DistrictSelector from 'app/finance/DistrictSelector';
import ExpenditureFilter, { ALL_PROGRAM_ITEMS, ALL_ACTIVITY_ITEMS, ALL_COMP_OBJECT_ITEMS } from 'app/finance/ExpenditureFilter';
import FacetedBudgetActualCharts from 'app/finance/FacetedBudgetActualCharts';
import HcChart from 'components/HcChart';
import Loading from 'components/Loading';
import { makeCurrencyFormatter } from 'utilities/highcharts/utils';
import Stack from '@mui/material/Stack';

import type { DistrictDataMap } from 'app/finance/DistrictDataProvider';
import type { MetricDef } from 'app/finance/FacetedBudgetActualCharts';

type StaffInfo = {
  fte: number;
  estSalaryBudget: number;
  estSalaryActuals: number;
};

const salaryFormatter = makeCurrencyFormatter(1);

// TODO: Combine with highcharts organization data type.
type NodeInfo = {id: string, name: string, layout: string, staffInfo: StaffInfo};

function getStaffInfo(s275SummaryDf, padList) {
  let fte = 0;
  let estSalaryBudget = 0;
  let estSalaryActuals = 0;
  for (const pad of padList) {
    const df = s275SummaryDf
      .filter(aq.escape(
        d =>
        d.program_code == 97 &&
          d.activity_code == 11 &&
          d.duty_root_code == 99))
      .rollup({
        fte: op.sum('fte_in_assignment'),
        est_salary_budget: op.sum('c_est_total_initial_salary'),
        est_salary_actuals: op.sum('c_est_total_final_salary')
      });
      fte += df.get('fte');
      estSalaryBudget += df.get('est_salary_budget');
      estSalaryActuals += df.get('est_salary_actuals');
    }
  return {fte, estSalaryBudget, estSalaryActuals};
}

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

// Fills edges with a list of pairs showing all tree edges in the org chart.
function getOrgChartEdges(node, parent, edges) {
  if (Array.isArray(node)) {
    return;
  }

  for (const [k,v] of Object.entries(node)) {
    if (parent !== null) {
      edges.push([parent, k]);
    }
    getOrgChartEdges(v, k, edges);
  }
}

function getOrgChartNodes(cur, level, s275SummaryDf, allNodes: Array<NodeInfo>) {
  if (Array.isArray(cur)) {
    return getStaffInfo(s275SummaryDf, cur);
  }

  const curStaffInfo : StaffInfo = {fte: 0, estSalaryBudget: 0, estSalaryActuals: 0};
  for (const [k,v] of Object.entries(cur)) {
    const childStaffInfo = getOrgChartNodes(v, level + 1, s275SummaryDf, allNodes);
    curStaffInfo.fte += childStaffInfo.fte;
    curStaffInfo.estSalaryBudget += childStaffInfo.estSalaryBudget;
    curStaffInfo.estSalaryActuals += childStaffInfo.estSalaryActuals;

    const nodeInfo : NodeInfo = {
      id: k,
      name: `${k}<br>${childStaffInfo.fte} FTE,
      ${salaryFormatter(childStaffInfo.estSalaryActuals)}`,
      layout: 'hanging',
      staffInfo: childStaffInfo,
    };

    allNodes.push(nodeInfo);
  }

  return curStaffInfo;
}

// Charts expenditures for 
export default function OrgChartDashboard() {
  const facet = 'nces';
  const searchParams = useSearchParams();
  const {districtDataMap, loadCcddd} = useDistrictData();
  const [selectedObjects, setSelectedObjects] = useState<string[]>(ALL_COMP_OBJECT_ITEMS);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(ALL_ACTIVITY_ITEMS);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(ALL_PROGRAM_ITEMS);
  const [ccddd, setCcddd] = useState<number>(parseInt(searchParams.get('ccddd') ?? '17001'));
  const selectedClassOf = 2024;

  useEffect(
    () => {
      loadCcddd(ccddd);
    },
    [loadCcddd, ccddd]
  );

  const districtData = districtDataMap[ccddd];
  if (!districtData) {
    return <Loading text="Loading district data." />;
  }

  // Create filters for expenditures.
  const filterSelection = {
    selectedObjectCodes: extractCodes('obj', selectedObjects),
    selectedActivityCodes: extractCodes('act', selectedActivities),
    selectedProgramCodes: extractCodes('prog', selectedPrograms),
  };

  const data = new Array<[number, number]>;
  getOrgChartEdges(DeptToPad, null, data);

  const nodes = new Array<NodeInfo>;
  getOrgChartNodes(DeptToPad, 0,
                   districtData.s275Summary().filter(aq.escape(d => d.class_of == selectedClassOf)),
                   nodes)

  const config = {
    chart: {
      height: 2200,
      inverted: true,
    },

    title: {
      text: 'SPS Org Chart'
    },

    accessibility: {
      point: {
        descriptionFormat: '{add index 1}. {toNode.name}' +
        '{#if (ne toNode.name toNode.id)}, {toNode.id}{/if}, ' +
        'reports to {fromNode.id}'
      }
    },

    series: [{
      type: 'organization',
      name: 'SPS',
      keys: ['from', 'to'],
      data,
      nodes,
      nodeWidth: 70,
      nodePadding: 20,
      colorByPoint: false,
      hangingIndentTranslation: 'cumulative',
      // Crimp a bit to avoid nodes overlapping lines
      hangingIndent: 20,
      levels: [{
        level: 0,
        color: 'silver',
        dataLabels: {
          color: 'black'
        },
      }, {
        level: 1,
        color: 'silver',
        dataLabels: {
          color: 'black'
        },
      }, {
        level: 2,
        color: '#980104'
      }, {
        level: 4,
        color: '#359154'
      }],
      color: '#007ad0',
      dataLabels: {
        color: 'white',
        style: {
          fontSize: '0.7rem',
        }
      },
      borderColor: 'var(--highcharts-background-color, white)',
    }],
    tooltip: {
      outside: true
    },
    exporting: {
      allowHTML: true,
    }
  };
  console.log(config);

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
        <DistrictSelector
          ccddd={ccddd}
          onChange={(selection) => setCcddd(selection)}
        />
      </Stack>

      {/* Draw the Charts */}
      <HcChart config={config} sx={{"overflow": "scroll"}} />
    </div>
  );
}
