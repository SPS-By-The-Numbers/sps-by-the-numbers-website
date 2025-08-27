export const baselineClassOfChartOptions = {
  chart: {
    type: 'column',
    animation: false,
    styledMode: true,
    zooming: {
      type: 'x'
    }
  },
  yAxis: {
    crosshair: true,
    minorTickInterval: "auto",
  },
  xAxis: {
    type: 'category',
    accessibility: {
      description: 'Class of',
    },
  },
  credits: {
    enabled: false,
  },
  plotOptions: {
    series: {
      groupPadding: 0,
      label: {
        enabled: true,
        useHTML: true
      }
    }
  },
  legend: {
    enabled: true,
    verticalAlign: 'bottom',
  },
  tooltip: {
    stickOnContact: true,
  },
};

export const baselineHighchartsCell = {
  type: 'Highcharts',
  sync: {
    visibility: true,
    highlight: true,
    extremes: true,
  },
  chartOptions: baselineClassOfChartOptions,
};
