'use client';

import { useDistrictData } from 'app/finance/DistrictDataProvider';
import { useState, useEffect } from 'react';
import DistrictSelector from 'app/finance/DistrictSelector';
import ExpenditureFilter, { ALL_PROGRAM_ITEMS, ALL_ACTIVITY_ITEMS, ALL_COMP_OBJECT_ITEMS } from 'app/finance/ExpenditureFilter';
import FacetedBudgetActualCharts from 'app/finance/FacetedBudgetActualCharts';
import {DeptToPad} from 'app/finance/sps/orgchart/padOrgMapping';
import HcChart from 'components/HcChart';
import Loading from 'components/Loading';
import MetricVariantSelector from 'app/finance/MetricVariantSelector';
import Stack from '@mui/material/Stack';

import type { DistrictDataMap } from 'app/finance/DistrictDataProvider';
import type { MetricDef } from 'app/finance/FacetedBudgetActualCharts';

// TODO: Combine with highcharts organization data type.
type NodeInfo = {id: string, name: string, layout: string,  paos: Array<any>};

const leafs = [
    'Bastarnisch', 'Brabantian', 'Burgundian', 'Crimean Gothic', 'Danish',
    'Dutch', 'English', 'Faroese', 'Flemish', 'Frisian', 'Gepidisch', 'Gothic',
    'Herulisch', '(High) German', 'Hollandic', 'Icelandic', 'Limburgish',
    'Low German', 'Norwegian', 'Rhinelandic', 'Rugisch', 'Skirisch', 'Swedish',
    'Vandalic', 'Yiddish'
].map(function (leaf) {
    return {
        id: leaf,
        layout: 'hanging',
    };
});

// Choose hanging nodes:
const hangingNodes = [
    {
        id: 'North Germanic',
        layout: 'hanging',
        // Push node a bit to the left.
        offsetHorizontal: -15
    },
    {
        id: 'West Germanic',
        layout: 'hanging'
    },
    {
        id: 'East Germanic',
        layout: 'hanging'
    }
];

const testNodes = hangingNodes.concat(leafs);

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

function getOrgChartNodes(cur, level, allNodes: Array<NodeInfo>) {
  if (Array.isArray(cur)) {
    return cur;
  }

  const allChildPaos = new Array<any>; 
  for (const [k,v] of Object.entries(cur)) {
    const paos = getOrgChartNodes(v, level + 1, allNodes);
    allChildPaos.push(...paos);
    allNodes.push({
      id: k,
      name: k,
      layout: 'hanging',
      paos,
    });
  }

  return allChildPaos;
}

// Charts expenditures for 
export default function OrgChartDashboard() {
  const facet = 'nces';
  const {districtDataMap, loadCcddd} = useDistrictData();
  const initialCcddd = 17001;
  const [selectedObjects, setSelectedObjects] = useState<string[]>(ALL_COMP_OBJECT_ITEMS);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(ALL_ACTIVITY_ITEMS);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(ALL_PROGRAM_ITEMS);
  const [metricList, setMetricList] = useState<Array<MetricDef>>(
    [
      {
        ccddd: initialCcddd,
        metricVariant: 'amount' as const,
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

  // Merge all the data.
  // Create handlers used to update the metricList from the correct set of controls.
  const updateMetricList = (i, newState) => {
    // Copy the list.
    const newList = [...metricList];

    // Override the fields in the right MetricDef then set.
    newList[i] = {...metricList[i], ...newState};
    setMetricList(newList);
  };

  const orgData = new Array<[number, number]>;
  getOrgChartEdges(DeptToPad, null, orgData);

  const orgNodes = new Array<NodeInfo>;
  getOrgChartNodes(DeptToPad, 0, orgNodes);

  const testData = [
            // West Germanic branch
            ['Germanic', 'West Germanic'],
                ['West Germanic', 'Old English'],
                    ['Old English', 'Middle English'],
                        ['Middle English', 'English'],
                ['West Germanic', 'Old Frisian'],
                    ['Old Frisian', 'Frisian'],
                ['West Germanic', 'Old Dutch'],
                    ['Old Dutch', 'Middle Dutch'],
                        ['Middle Dutch', 'Hollandic'],
                        ['Middle Dutch', 'Flemish'],
                        ['Middle Dutch', 'Dutch'],
                        ['Middle Dutch', 'Limburgish'],
                        ['Middle Dutch', 'Brabantian'],
                        ['Middle Dutch', 'Rhinelandic'],
                ['West Germanic', 'Old Low German'],
                    ['Old Low German', 'Middle Low German'],
                        ['Middle Low German', 'Low German'],
                ['West Germanic', 'Old High German'],
                    ['Old High German', 'Middle High German'],
                        ['Middle High German', '(High) German'],
                        ['Middle High German', 'Yiddish'],

            // East Germanic branch
            ['Germanic', 'East Germanic'],
                ['East Germanic', 'Gothic'],
                ['East Germanic', 'Vandalic'],
                ['East Germanic', 'Burgundian'],
                ['East Germanic', 'Bastarnisch'],
                ['East Germanic', 'Gepidisch'],
                ['East Germanic', 'Herulisch'],
                ['East Germanic', 'Rugisch'],
                ['East Germanic', 'Skirisch'],
                ['East Germanic', 'Crimean Gothic'],

            // North Germanic branch
            ['Germanic', 'North Germanic'],
                ['North Germanic', 'Old Norse'],
                    ['Old Norse', 'Old Icelandic'],
                        ['Old Icelandic', 'Icelandic'],
                    ['Old Norse', 'Old Norwegian'],
                        ['Old Norwegian', 'Norwegian'],
                    ['Old Norse', 'Faroese'],
                ['North Germanic', 'Old Swedish'],
                    ['Old Swedish', 'Middle Swedish'],
                        ['Middle Swedish', 'Swedish'],
                ['North Germanic', 'Old Danish'],
                    ['Old Danish', 'Middle Danish'],
                        ['Middle Danish', 'Danish']
        ];


  const data = orgData;
  const nodes = orgNodes;

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
      nodeWidth: 62,
      nodePadding: 15,
      colorByPoint: false,
      hangingIndentTranslation: 'cumulative',
      // Crimp a bit to avoid nodes overlapping lines
      hangingIndent: 10,
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
        color: 'white'
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
      <HcChart config={config} sx={{"overflow": "scroll"}} />
    </div>
  );
}
