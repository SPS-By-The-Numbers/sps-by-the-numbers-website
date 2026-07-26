import {
  computeVarianceStats,
  makeBaseChartConfig,
  makeBudgetActualsChartConfig,
  makeActualsLineChartConfig,
  makeBudgetActualsContextChartConfig,
  makeMultiSeriesLineChartConfig,
  makeCorrelationChartConfig,
  makeContextCell,
} from "utilities/highcharts/ChartConfigGenerators";
import { BUDGET_REVISED_ACTUALS_SERIES } from "utilities/highcharts/SeriesSpecs";

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
    expect(
      serializeConfig(makeBaseChartConfig(BASE_OPTIONS)),
    ).toMatchSnapshot();
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

  it("builds a three-series chart from explicit specs", () => {
    const config = makeBudgetActualsChartConfig({
      ...BA_OPTIONS,
      seriesSpecs: BUDGET_REVISED_ACTUALS_SERIES,
    });
    expect(config.connector.columnAssignment.map((c) => c.data.y)).toEqual([
      "sps_amount_expenditures_budget",
      "sps_amount_expenditures_revised",
      "sps_amount_expenditures_actuals",
    ]);
    expect(
      config.chartOptions.series.map((s) => [
        s.id,
        s.name,
        s.colorIndex,
        s.pointPadding,
        s.dataLabels.y,
      ]),
    ).toEqual([
      ["budget", "Budget", 2, 0, undefined],
      ["revised", "Revised Budget", 3, 0.13, 30],
      ["actuals", "Actuals", 1, 0.26, 60],
    ]);
  });

  it("drops declared series the frame has no data for", () => {
    // Duck-typed chartable frame: arquero is mocked out under jest, and
    // filterSpecsWithData only needs column()/array().
    const columns = {
      sps_amount_expenditures_budget: [1, 2],
      sps_amount_expenditures_revised: [null, NaN],
      sps_amount_expenditures_actuals: [1, 2],
    };
    const config = makeBudgetActualsChartConfig({
      ...BA_OPTIONS,
      seriesSpecs: BUDGET_REVISED_ACTUALS_SERIES,
      data: {
        column: (name) => columns[name],
        array: (name) => columns[name],
      } as never,
    });
    expect(
      config.chartOptions.series.map((s) => [s.id, s.pointPadding]),
    ).toEqual([
      ["budget", 0],
      ["actuals", 0.26],
    ]);
    expect(config.chartOptions.series[1].dataLabels.y).toBe(30);
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

describe("computeVarianceStats", () => {
  it("computes the classic single variance without a revised series", () => {
    const rows = [
      { x: 2022, budget: 100, actuals: 90 },
      { x: 2023, budget: 110, actuals: 120 },
    ];
    expect(computeVarianceStats(rows, "Variance")).toEqual([
      {
        label: "Variance",
        colored: true,
        xVal: 2023,
        latest: -10,
        median: 0,
        mean: 0,
      },
    ]);
  });

  it("computes Amendment and Execution deltas when revised is present", () => {
    const rows = [
      { x: 2022, budget: 100, revised: 110, actuals: 105 },
      { x: 2023, budget: 200, revised: 240, actuals: 220 },
    ];
    const stats = computeVarianceStats(rows, "Variance");
    expect(stats.map((s) => [s.label, s.colored, s.latest])).toEqual([
      ["Amendment", false, 40],
      ["Execution", true, 20],
    ]);
    expect(stats[0].median).toBe(25);
    expect(stats[0].mean).toBe(25);
  });

  it("ignores years where the revised value is missing", () => {
    // Typical current-year shape: budget filed, F-196 not yet.
    const rows = [
      { x: 2023, budget: 100, revised: 110, actuals: 105 },
      { x: 2024, budget: 130, actuals: 128 },
      { x: 2025, budget: 150 },
    ];
    const stats = computeVarianceStats(rows, "Variance");
    expect(stats.map((s) => [s.label, s.xVal, s.latest])).toEqual([
      ["Amendment", 2023, 10],
      ["Execution", 2023, 5],
    ]);
  });

  it("drops a delta with no finite points instead of erroring", () => {
    // Revised exists but budget never does: Amendment can't be computed.
    const rows = [{ x: 2023, revised: 110, actuals: 105 }];
    expect(computeVarianceStats(rows, "Variance")).toEqual([
      {
        label: "Execution",
        colored: true,
        xVal: 2023,
        latest: 5,
        median: 5,
        mean: 5,
      },
    ]);
  });

  it("returns nothing for an empty window", () => {
    expect(computeVarianceStats([], "Variance")).toEqual([]);
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
