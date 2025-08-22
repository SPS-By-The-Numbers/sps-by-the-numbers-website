type MetricHistoryPanelFactoryOptions = {
  metricName : string;
  title : string;
};

type MetricHistoryComponents = {
  keyStatsCell: object;
  chartCell: object;
};

export default class MetricHistoryPanelFactory {
  constructor(options : MetricHistoryPanelFactoryOptions, components: MetricHistoryComponents) {
    this.metricName = options.metricName;
    this.title = options.title;
    this.components = components;
  }

  // Produces a composite entry for a highchart dashboard layout cell.
  makeLayout() {
    return {
      cells: [{
        id: `${this.metricName}-panel`,
        layout: {
          cellClassName: `metric-history-cell ${this.metricName}-metric-history-cell`,
          rowClassName: `metric-history-row ${this.metricName}-metric-history-row`,
          rows: [
            {
              cells: [{ id: `${this.metricName}-metric-history-header` }]
            },
            {
              cells: [
                { id: `${this.metricName}-metric-history-key-stats`, style: { maxWidth: '15em' } },
                { id: `${this.metricName}-metric-history-chart`, },
              ]
            },
          ],
        },
      }],
    };
  }

  makeComponents() {
    return [
        {
          cell: `${this.metricName}-metric-history-key-stats`,
          ...this.components.keyStatsCell,
        },
        {
          cell: `${this.metricName}-metric-history-chart`,
          ...this.components.chartCell,
        }
    ];
  }
}
