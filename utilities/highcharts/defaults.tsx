export const baselineClassOfChartOptions = {
  chart: {
    type: 'column',
    animation: false,
    styledMode: true,
    zooming: {
      type: 'x',
      resetButton: {
        position: {
          align: 'left',
          verticalAlign: 'top',
          x: 5,
          y: 5,
        },
        theme: {
          width: 70,
          height: 5
        },
        relativeTo: 'chart'
      }
    },
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
    layout: 'vertical',
    verticalAlign: 'bottom',
    floating: true,
    align: 'left',
    enabled: true,
  },
  tooltip: {
    outside: true,
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
