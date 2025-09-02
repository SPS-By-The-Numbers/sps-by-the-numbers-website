type MetricHistoryPanelFactoryOptions = {
  metricName : string;
};

type MetricHistoryComponents = {
  keyStatsCell: object;
  chartCell: object;
};

export default class MetricHistoryPanelFactory {
  private metricName: string;
  private components: MetricHistoryComponents;

  constructor(options : MetricHistoryPanelFactoryOptions, components: MetricHistoryComponents) {
    this.metricName = options.metricName;
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
              cells: [
                { id: `${this.metricName}-metric-history-chart`, },
              ]
            }
          ],
        },
      }],
    };
  }

  makeComponents() {
    return [
        {
          cell: `${this.metricName}-metric-history-chart`,
          ...this.components.chartCell,
        }
    ];
  }
}
