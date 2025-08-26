'use client';

import HighchartsReact from 'highcharts-react-official'
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { useHighcharts } from 'components/providers/HighchartsProvider';
import { useSearchParams } from "next/navigation";

import RawData from 'data/2024-06-18-sps-demographic-data.json'

const AllData = RawData.rows.map(
  (row, id) => {
    const out = { id };
    RawData.header.forEach((header,header_idx) => {
      if (header === 'All Students') {
        out[header] = parseInt(row[header_idx]);
      } else if (header.startsWith('%')) {
        out[header] = parseFloat(row[header_idx])/100;

      } else {
        out[header] = row[header_idx];
      }
    });
    return out;
  });


const AllRegionTypes = ["Closure", "Director District"];
const DirectorDistricts = ["1","2","3","4","5","6","7"];
const DirectorNames = [
  "Liza Rankin",
  "Sarah Clark",
  "Evan Briggs",
  "Joe Mizrahi",
  "Michelle Sarju",
  "Gina Topp",
  "Brandon K. Hersey"];

const AllRegions = [
  "NW", "NE", "Central", "SW", "SE"
];

const AllCategory = [
  "Female",
  "Gender X",
  "Male",
  "American Indian_ Alaskan Native",
  "Asian",
  "Black_ African American",
  "Hispanic_ Latino of any race_s_",
  "Native Hawaiian_ Other Pacific Islander",
  "Two or More Races",
  "White",
  "English Language Learners",
  "Foster Care",
  "Highly Capable",
  "Homeless",
  "Low-Income",
  "Migrant",
  "Military Parent",
  "Mobile",
  "Section 504",
  "Students with Disabilities",
];

const AllChangeType = [
  "Close A,B",
  "Close A",
  "Close B",
  "Move",
  "Program A",
  "Program A,B",
];

const RegionNorth = 'North (NW + NE)';
const RegionSouth = 'North (NW + NE)';
const RegionAll = 'All';

const RegionTypeClosure = 'Closure';
const RegionTypeDirector = 'Director';

function sanitizeRegionType(r) {
  if (AllRegionTypes.includes(r)) {
    return r;
  }

  return AllRegionTypes[0];
}

function sanitizeRegions(regions) {
  const finalRegions = []
  for (const r in regions) {
    if (AllRegions.includes(r)) {
      finalRegions.push(r);
    }
  }

  // Default to ['NW', 'NE'] cause north seattle has most obvious disproportionate racial imapct
  if (finalRegions.length == 0) {
      finalRegions.push('NW', 'NE');
  }

  return finalRegions;
}

function sanitizeCategories(categories) {
  const finalCategories = []
  for (const c in categories) {
    if (AllCategory.includes(c)) {
      finalCategories.push(c);
    }
  }

  // Default to Asians cause that's the most systemically impacted. <shakes-head />
  if (finalCategories.length == 0) {
      finalCategories.push(AllCategory[4]);
  }

  return finalCategories;
}

function sanitizeChangeTypes(changeTypes) {
  const finalChangeTypes = []
  for (const c in changeTypes) {
    if (AllChangeType.includes(c)) {
      finalChangeTypes.push(c);
    }
  }

  // Default to all changes because the splatter impact of uncertainty is the union of all changes.
  if (finalChangeTypes.length == 0) {
      finalChangeTypes.push(...AllChangeType);
  }

  return finalChangeTypes;
}

function getColor(entry, changeType) {
  if (typeof(changeType) === 'string') {
    if (entry['Change'] === changeType) {
      return "#ca0020";
    }
  } else if (Array.isArray(changeType)) {
    if (changeType.findIndex(x => x == entry['Change']) !== -1) {
      return "#ca0020";
    }
  }

  return "#0571b0";
}

function getData(regions, regionType) {
  const data = [];
  if (regionType === "Closure") {
    for (const r of regions) {
      data.push(...AllData.filter(x => x["Closure Region"] === r));
    }
  } else {
    for (const r of regions) {
      data.push(...AllData.filter(x => x["District"] == r));
    }
  }
  return data;
}

function combineCategories(entry, categories, type) {
  return categories.reduce((a, cat) => a + parseFloat(entry[`${type} ${cat}`]), 0);
}

function OneGraph({data, categories, changeType, title, ylabel, highcharts}) {
  const column_name = `% ${categories}`;

  data.sort((x,y) => {
    const combined_x = combineCategories(x, categories, '%');
    const combined_y = combineCategories(y, categories, '%');
    if (combined_x < combined_y) {
      return -1;
    } else if (combined_x > combined_y) {
      return 1;
    }
    return 0;
  });

  const options = {
    title: { text: title },
    xAxis: {
      title: { text: 'Schools' },
      categories: data.map(x => x['SchoolName']),
    },
    yAxis: {
      title: { text: ylabel },
      title: { text: '% of students in selected categories' },
      plotLines: [{
        color: 'black', // Color value
        value: 0, // Value of where the line will appear
        width: 3 // Width of the line
      }],
    },
    plotOptions: {
      series: {
        stacking: 'normal'
      }
    },
    series: [{
      name: "% of students in school",
      type: "column",
      dataSorting: {
        enable: true,
      },
      data: data.map((entry, idx) => {
        const combined_percent = Math.round(combineCategories(entry, categories, '%') * 1000)/10;
        const combined_num = combineCategories(entry, categories, '#');
        const all_num = entry['All Students'];
        return {
          x: idx,
          y: combined_percent,
          name: `% in ${categories}`,
          color: getColor(entry, changeType),
          dataLabels: {
            enabled: true,
            format: `${combined_percent}%<br/>[${combined_num}]`,
            verticalAlign: 'top',
          }
        }
      }),
    }],
  };
  return (
    <HighchartsReact
      containerProps={{ style: { height: "100%" } }}
      highcharts={highcharts}
      options={options}
    />
  );
}

function makeRegionOptions(regionType) {
  const options = [];

  if (regionType == 'Closure') {
    options.push(...AllRegions.map( r => (<option key={r} value={r}>{r}</option>)));
  } else {
    options.push(...DirectorDistricts.map( r => (<option key={r} value={r}>{DirectorNames[parseInt(r)-1]}</option>)));
  }

  return options;
}

export default function DemographicGraph() {
  const { highchartsObjs } = useHighcharts();

  const searchParams = useSearchParams();
  const [regionType, setRegionType] = useState(sanitizeRegionType(searchParams.get('regionType')));
  const [regions, setRegions] = useState(sanitizeRegions(searchParams.getAll('regions')));
  const [categories, setCategories] = useState(sanitizeCategories(searchParams.getAll('categories')));
  const [changeTypes, setChangeTypes] = useState(sanitizeChangeTypes(searchParams.getAll('changeTypes')));

  const data = getData(regions, regionType);
  const columns = 
    RawData.header.map(
      name => {
        const def = {
          field: name,
          headerName: name,
        };

        if (name === 'SchoolName') {
          def.width = 300;
        }

        if (name.startsWith('%')) {
          def.valueFormatter = (value) => {
            if (!value) {
              return value;
            }
            // Convert the decimal value to a percentage
            return (value * 100).toPrecision(3) + '%';
          };
        }

        return def;
      });
  const regionOptions = makeRegionOptions(regionType);

  return (
    <Stack
      style={{padding: "1px", mx: "4rex", mt: "1ex"}}
      spacing={2}>
      <Card>
        <b>Data from <a href="https://data.wa.gov/education/Report-Card-Enrollment-2023-24-School-Year/q4ba-s3jc/about_data">OSPI Enrollment Report Card for 2023-2024</a>. There is a data table too! Scroll down.</b> 
        <p>{'Red schools are slated for closure for selected Closure Type. "Closure A,B" means closed in both A & B.  "Program A,B" means reconfigured in both A & B. Close A, Close B, Program A means only closed in A, only closed in B, and only reconfigured in A. No school is only reconfigured in B.'}</p>
        <Stack style={{padding: "1px"}} spacing={2} direction="row">
            <label>
              RegionType: 
              <select 
                  onChange={(e) => setRegionType(e.target.value)}
                  className="m-2 border-black border-2"
                  value={regionType}>
                {
                  AllRegionTypes.map( r => (<option key={r} value={r}>{r}</option>))
                }
              </select>
            </label>
            <label>
              Region: 
              <select 
                  multiple
                  onChange={(e) => setRegions(Array.from(e.target.selectedOptions, option => option.value))}
                  className="m-2 border-black border-2"
                  value={regions}>
                {regionOptions}
              </select>
            </label>
            <label>
              Category: 

              <select 
                  multiple
                  onChange={(e) => setCategories(Array.from(e.target.selectedOptions, option => option.value))}
                  className="m-2 border-black border-2"
                  value={categories}>
                {
                  AllCategory.map( r => (<option key={r} value={r}>{r}</option>))
                }
              </select>
            </label>
            <label>
              Change Type: 
              <select 
                  multiple
                  onChange={(e) => setChangeTypes(Array.from(e.target.selectedOptions, option => option.value))}
                  className="m-2 border-black border-2"
                  value={changeTypes}>
                {
                  AllChangeType.map( r => (<option key={r} value={r}>{r}</option>))
                }
              </select>
            </label>
        </Stack>
      </Card>

      <Card style={{height: "600px"}}>
        <a id="graph" />
        <OneGraph
          title={`% ${categories} in School`}
          categories={categories}
          changeType={changeTypes}
          data={data}
          ylabel="%"
          highcharts={highchartsObjs.highcharts}
        />
      </Card>
      <Card>
        <a id="table" />
        <DataGrid
          rows={data}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 100,
              },
            },
          }}
          pageSizeOptions={[100]}
          disableRowSelectionOnClick
        />
      </Card>
    </Stack>
  );
}
