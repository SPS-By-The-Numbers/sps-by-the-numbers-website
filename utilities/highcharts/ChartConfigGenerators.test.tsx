import {
  makeBaseChartConfig,
  makeBudgetActualsChartConfig,
  makeActualsLineChartConfig,
  makeBudgetActualsContextChartConfig,
  makeMultiSeriesLineChartConfig,
  makeCorrelationChartConfig,
  makeContextCell,
} from "utilities/highcharts/ChartConfigGenerators";

// The generators embed function values (formatters, afterSetExtremes
// handlers) which jest snapshots collapse to an opaque [Function]. Replace
// each function with its whitespace-normalized source so refactors that
// change handler bodies show up in snapshot diffs.
function serializeConfig(value) {
  if (typeof value === "function") {
    return value.toString().replace(/\s+/g, " ").trim();
  }
  if (Array.isArray(value)) {
    return value.map(serializeConfig);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, serializeConfig(v)]),
    );
  }
  return value;
}

const BASE_OPTIONS = {
  title: "Test Chart",
  connectorId: "test-connector",
  renderTo: "test-cell",
  yValueFormat: "currency" as const,
  xValueFormat: "year" as const,
};

const BA_OPTIONS = {
  ...BASE_OPTIONS,
  metricColumn: "sps_amount_expenditures",
  captionType: "variance" as const,
  xDataColumn: "class_of",
};

describe("makeBaseChartConfig", () => {
  it("builds the shared config skeleton", () => {
    expect(serializeConfig(makeBaseChartConfig(BASE_OPTIONS))).toMatchSnapshot();
  });
});

describe("makeBudgetActualsChartConfig", () => {
  it("builds a two-series column chart", () => {
    expect(
      serializeConfig(makeBudgetActualsChartConfig(BA_OPTIONS)),
    ).toMatchSnapshot();
  });

  it("appends the facet to column names", () => {
    expect(
      serializeConfig(
        makeBudgetActualsChartConfig({ ...BA_OPTIONS, facet: "27" }),
      ),
    ).toMatchSnapshot();
  });

  it("keeps a literal-0 facet in column names", () => {
    const config = makeBudgetActualsChartConfig({ ...BA_OPTIONS, facet: 0 });
    expect(config.connector.columnAssignment.map((c) => c.data.y)).toEqual([
      "sps_amount_expenditures_0_budget",
      "sps_amount_expenditures_0_actuals",
    ]);
  });

  it("respects disableLegend", () => {
    const config = makeBudgetActualsChartConfig({
      ...BA_OPTIONS,
      disableLegend: true,
    });
    expect(config.chartOptions.legend.enabled).toBe(false);
  });

  it("handles pctexp axes and stats captions", () => {
    expect(
      serializeConfig(
        makeBudgetActualsChartConfig({
          ...BA_OPTIONS,
          yValueFormat: "pctexp" as const,
          captionType: "stats" as const,
        }),
      ),
    ).toMatchSnapshot();
  });
});

describe("makeActualsLineChartConfig", () => {
  it("builds a single actuals line", () => {
    expect(
      serializeConfig(
        makeActualsLineChartConfig({ ...BA_OPTIONS, facet: "27" }),
      ),
    ).toMatchSnapshot();
  });
});

describe("makeBudgetActualsContextChartConfig", () => {
  it("builds a stripped-down context chart", () => {
    expect(
      serializeConfig(makeBudgetActualsContextChartConfig(BA_OPTIONS)),
    ).toMatchSnapshot();
  });
});

describe("makeMultiSeriesLineChartConfig", () => {
  it("builds one line per series def", () => {
    expect(
      serializeConfig(
        makeMultiSeriesLineChartConfig({
          ...BA_OPTIONS,
          facet: "5",
          seriesDefs: [
            { key: "1_3", name: "Grade 3" },
            { key: "1_4", name: "Grade 4", colorIndex: 7 },
          ],
          useCovidMarker: true,
        }),
      ),
    ).toMatchSnapshot();
  });
});

describe("makeCorrelationChartConfig", () => {
  it("builds a scatter chart per series def", () => {
    expect(
      serializeConfig(
        makeCorrelationChartConfig({
          ...BASE_OPTIONS,
          xValueFormat: "currency" as const,
          yMetricColumn: "sps_amount_expenditures",
          xMetricColumn: "sps_amount_revenues",
          dataLabelColumn: "class_of",
          seriesDefs: [
            { name: "Budget", columnSuffix: "budget", colorIndex: 2 },
            { name: "Actuals", columnSuffix: "actuals", colorIndex: 1 },
          ],
        }),
      ),
    ).toMatchSnapshot();
  });
});

describe("makeContextCell", () => {
  it("builds a context cell with bounds", () => {
    expect(
      serializeConfig(
        makeContextCell(
          "context-cashflow",
          "test-connector",
          "context_amount_cashflow",
          "Cashflow",
          "currency" as const,
          { min: -5, max: 100 },
        ),
      ),
    ).toMatchSnapshot();
  });

  it("builds a context cell without bounds", () => {
    expect(
      serializeConfig(
        makeContextCell(
          "context-fte",
          "test-connector",
          "context_fte_staffing",
          "Staffing",
          "fte" as const,
          undefined,
          "FTE",
        ),
      ),
    ).toMatchSnapshot();
  });
});
