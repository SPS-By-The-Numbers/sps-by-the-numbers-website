import Dashboards from '@highcharts/dashboards/es-modules/masters/dashboards.src.js';

import * as dfd from "danfojs";

// Show key historical metric with min/max/average.
export default class KeyStatsComponent extends Dashboards.ComponentRegistry.types.HTML {
  constructor(board, options) {
    super(board, options);
    this.type = 'KeyStatsComponent';
    return this;
  }

  // Called whenever data or component state changes
  async load() {
    await super.load();
    const table = await this.getFirstConnector().table;
    const series = new dfd.Series(table.getColumn(this.options['columnName']));

    this.element.innerHTML = `
      <div class="key-stats-box">
        <text class="key-stats-header">${this.options['title']}</text>
        <div class="key-stats-primary">
          <div class="key-stats-item">
            <div class="key-stats-value">${series.values[series.values.length - 1]}</div>
            <div class="key-stats-label">Current</div>
          </div>
        </div>
        <div class="key-stats-secondary">
          <div class="key-stats-item">
            <div class="key-stats-value">${series.min()}</div>
            <div class="key-stats-label">Min</div>
          </div>
          <div class="key-stats-item">
            <div class="key-stats-value">${series.mean().toFixed(0)}</div>
            <div class="key-stats-label">Average</div>
          </div>
          <div class="key-stats-item">
            <div class="key-stats-value">${series.max()}</div>
            <div class="key-stats-label">Max</div>
          </div>
        </div>
      </div>
    `;

    this.render();
  }
}
