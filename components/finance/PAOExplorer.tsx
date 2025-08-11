'use client'

import { useState, useEffect } from 'react';
import { readCSV, DataFrame } from "danfojs"

import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

import Stack from '@mui/material/Stack';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

type ActivityData = {
  activities: Array<string>,
  school_years: Array<string>,
  data_types: Array<string>,
  df: DataFrame
};

function handleChange() {
}

function makeChart(activity, schoolYears, dataTypes, chart_df) {
  // Build Highcharts series array
  const seriesData = dataTypes.map(data_type => {
    const subDf = chart_df.query(chart_df["activity"].eq(activity)
      .and(chart_df["data_type"].eq(data_type)));

    const values = subDf.sortValues("school_year").values
    if (!values) {
      return null;
    }

    return {
      name: data_type,
      data: values.map(row => [row[0], row[3]]) // [school_year, amount]
    };
  });

  // Highcharts config
  const options = {
    chart: {
      type: "line",
      renderTo: "container"
    },
    title: {
      text: activity,
    },
    xAxis: {
      title: { text: "School Year" },
      type: "category",
      categories: schoolYears.sort(),
      labels: {
        style: {
          fontSize: '8px'
        }
      }
    },
    yAxis: {
      title: { text: "Amount" },
      labels: {
        style: {
          fontSize: '8px'
        }
      }
    },
    series: seriesData
  };

  return (
    <ImageListItem key={activity}>
      <HighchartsReact
        containerProps={{ style: { height: "100%" } }}
        highcharts={Highcharts}
        options={options}
      />
    </ImageListItem>
    );
}

export default function PAOExplorer() {
  const [data, setData] = useState<ActivityData>({
    activities: [],
    school_years: [],
    data_types: [],
    df: new DataFrame()
  });

  useEffect(() => {
    let ignore = false;
    if (!ignore) {
      readCSV('http://localhost:3000/_TEMP_gfe_17001.csv').then(df => {
        const df_no_finance = df.query(df["object_code"].gt(1))
        const df_by_activity = df_no_finance.groupby(["school_year", "data_type", "activity"]).agg(
          {"amount": "sum"})

        const activities = df_no_finance["activity"].unique().values;
        const school_years = df_no_finance["school_year"].unique().values;
        const data_types = df_no_finance["data_type"].unique().values;

        setData({
          activities,
          school_years,
          data_types,
          df: df_by_activity
        });
      });
    }

    return () => {
      ignore = true;
    }
  },
  []);


  let charts = [];
  for (const activity of data["activities"]) {
    try {
      const c = makeChart(activity, data["school_years"], data["data_types"], data["df"]);
      if (c) {
        charts.push(c);
      }
    } catch (e) {
      console.error("activity ", activity, e);
    }
  }
  console.log(`Have ${charts.length} charts`);

  return (
    <Stack style={{width: "100%"}} spacing={2} direction="row">
      <Paper sx={{ padding: "1em", width: "100%"}}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Age</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={10}
            label="Age"
            onChange={handleChange}
          >
            <MenuItem value={10}>Ten</MenuItem>
            <MenuItem value={20}>Twenty</MenuItem>
            <MenuItem value={30}>Thirty</MenuItem>
          </Select>
        </FormControl>
        <ImageList sx={{ width: "80%" }} cols={2} rowHeight={300}>
          {charts}
        </ImageList>
      </Paper>
    </Stack>
  );
}

