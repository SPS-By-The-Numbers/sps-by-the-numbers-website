import { g_dfd } from 'components/providers/DanfoProvider';
import { g_highchartsObjs } from 'components/providers/HighchartsProvider';

export const SINGLE_MODE = 'single';
export const BUDGET_ACTUALS_MODE = 'budget_actuals';


const currencyFormatter  = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 0,
}).format;

// Show key historical metric with min/max/average.
export default class KeyStatsComponent extends
    g_highchartsObjs.dashboards.ComponentRegistry.types.HTML {
  constructor(board, options) {
    super(board, options);
    this.type = 'KeyStatsComponent';
    this.xAxisName = options.xAxisName;
    this.title = options.title;

    this.mode = options.mode ?? SINGLE_MODE;
    // TODO: Generalize to list of columns.
    if (this.mode == SINGLE_MODE) {
      this.columnName = options.columnName;
    } else if (this.mode == BUDGET_ACTUALS_MODE) {
      this.budgetColumn = options.budgetColumn;
      this.actualsColumn = options.actualsColumn;
    }

    return this;
  }

  // Called whenever data or component state changes
  async load() {
    await super.load();
    const table = await this.getFirstConnector().table;
    const df = new g_dfd.DataFrame(table.getRowObjects());

    this.element.innerHTML = `
      <div class="key-stats-box">
        <div class="key-stats-title">
            <h2>
              ${this.title}
            </h2>
        </div>
        <div class="key-stats-primary">
            ${this.primaryValueHtml(df)}
        </div>
        <div class="key-stats-secondary">
          ${this.secondaryValueHtml(df)}
        </div>
      </div>
    `;

    this.render();
  }

  private primaryValueHtml(df) : string {
    if (this.mode === SINGLE_MODE) {
      const lastRow = df.iloc({ rows: [df.shape[0] - 1] });
      return (`
        <div class="key-stats-item">
          <div class="key-stats-value-actuals">
          ${lastRow[this.columnName].iat(0, 0).toLocaleString()}
          </div>
          <div class="key-stats-label">(${lastRow[this.xAxisName].iat(0, 0)})</div>
        </div>
      `);
    } else if (this.mode === BUDGET_ACTUALS_MODE) {
      const complete_df = df.loc({columns: [this.xAxisName, this.budgetColumn, this.actualsColumn]}).dropNa();
      const lastRow = complete_df.iloc({ rows: [complete_df.shape[0] - 1] });
      return (`
        <div class="key-stats-item-row">
          <div class="key-stats-item">
            <div class="key-stats-value-actuals">
              ${currencyFormatter(lastRow[this.actualsColumn].iat(0, 0))}
            </div>
            <div class="key-stats-label">Actual</div>
          </div>

          <div class="key-stats-item key-stats-subvalue">
            <div class="key-stats-value-budget">
              ${currencyFormatter(lastRow[this.budgetColumn].iat(0, 0))}
            </div>
            <div class="key-stats-label">Budget</div>
          </div>
        </div>
      `);
    } else {
      return 'Unknown Mode';
    }
  }

  private secondaryValueHtml(df) : string {
    if (this.mode === SINGLE_MODE) {
      const minIdx = df[this.columnName].argMin();
      const maxIdx = df[this.columnName].argMax();
      const average = df[this.columnName].mean();
      const minVal = df[this.columnName].iat(minIdx, 0);
      const minXVal = df[this.xAxisName].iat(minIdx, 0);
      const maxVal = df[this.columnName].iat(maxIdx, 0);
      const maxXVal = df[this.xAxisName].iat(maxIdx, 0);

      return (`
        <div class="key-stats-item">
          <div class="key-stats-value">
          ${minVal.toLocaleString()}
          </div>
          <div class="key-stats-label">Min (${minXVal})</div>
        </div>
        <div class="key-stats-item">
          <div class="key-stats-value">
          ${Number(average.toFixed(0)).toLocaleString()}
          </div>
          <div class="key-stats-label">Average</div>
        </div>
        <div class="key-stats-item">
          <div class="key-stats-value">
          ${maxVal.toLocaleString()}
          </div>
          <div class="key-stats-label">Max (${maxXVal})</div>
        </div>
      `);
    } else if (this.mode === BUDGET_ACTUALS_MODE) {
      return (
        `<div class="key-stats-value">
        </div>`);
    } else {
      return 'Unknown Mode';
    }
  }
}
