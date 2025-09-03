type BudgetActualsHistoryPanelFactoryOptions = {
  metricName : string;
};

type PanelConfig = {
  keyStatsCell: object;
  chartCell: object;
};

// A BudgetActualsHistoryPanel is one row representing a metric.
export default class BudgetActualsHistoryPanelFactory {
  private metricName: string;
  private components: PanelConfig;

  constructor(options : BudgetActualsHistoryPanelFactoryOptions, components: PanelConfig) {
    this.metricName = options.metricName;
    this.components = components;
  }

  // Produces a composite entry for a highchart dashboard layout cell.
  makeLayout() {
    return {
      cells: [{
        id: `${this.metricName}-panel`,
        layout: {
          cellClassName: `ba-history-cell ${this.metricName}-ba-history-cell`,
          rowClassName: `ba-history-row ${this.metricName}-ba-history-row`,
          rows: [
            {
              cells: [
                { id: `${this.metricName}-ba-history-chart`, },
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
          cell: `${this.metricName}-ba-history-chart`,
          ...this.components.chartCell,
        }
    ];
  }
}
