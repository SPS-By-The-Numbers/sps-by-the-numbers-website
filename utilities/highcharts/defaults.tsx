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
    endOnTick: false,
    minorTickInterval: "auto",
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
