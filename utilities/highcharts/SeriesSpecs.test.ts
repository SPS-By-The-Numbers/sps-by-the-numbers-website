import {
  ACTUALS_SERIES,
  BUDGET_ACTUALS_SERIES,
  BUDGET_REVISED_ACTUALS_SERIES,
  BUDGET_SERIES,
  filterSpecsWithData,
  seriesColumnName,
  seriesDataLabelOffset,
  seriesPointPadding,
} from "utilities/highcharts/SeriesSpecs";

// Duck-typed stand-in for an arquero ColumnTable (the real module is
// mocked out under jest).
function makeFrame(columns: Record<string, Array<unknown>>) {
  return {
    column: (name: string) => columns[name],
    array: (name: string) => columns[name],
  };
}

describe("seriesColumnName", () => {
  it("joins metric, facet, and suffix", () => {
    expect(seriesColumnName("sps_amount_cashflow", "27", "budget")).toBe(
      "sps_amount_cashflow_27_budget",
    );
  });

  it("omits an absent facet", () => {
    expect(seriesColumnName("sps_amount_cashflow", undefined, "revised")).toBe(
      "sps_amount_cashflow_revised",
    );
    expect(seriesColumnName("sps_amount_cashflow", "", "actuals")).toBe(
      "sps_amount_cashflow_actuals",
    );
  });

  it("keeps a literal-0 facet", () => {
    expect(seriesColumnName("m", 0, "actuals")).toBe("m_0_actuals");
  });
});

describe("filterSpecsWithData", () => {
  it("passes specs through without a frame", () => {
    expect(
      filterSpecsWithData(
        undefined,
        "m",
        undefined,
        BUDGET_REVISED_ACTUALS_SERIES,
      ),
    ).toEqual(BUDGET_REVISED_ACTUALS_SERIES);
  });

  it("drops a spec whose column is missing", () => {
    const df = makeFrame({
      m_budget: [1, 2],
      m_actuals: [1, 2],
    });
    expect(
      filterSpecsWithData(df, "m", undefined, BUDGET_REVISED_ACTUALS_SERIES),
    ).toEqual(BUDGET_ACTUALS_SERIES);
  });

  it("drops a spec whose column is entirely null", () => {
    const df = makeFrame({
      m_budget: [1, 2],
      m_revised: [null, undefined],
      m_actuals: [1, 2],
    });
    expect(
      filterSpecsWithData(df, "m", undefined, BUDGET_REVISED_ACTUALS_SERIES),
    ).toEqual(BUDGET_ACTUALS_SERIES);
  });

  it("drops a spec whose column is entirely NaN (e.g. pctcomp revised)", () => {
    const df = makeFrame({
      m_budget: [1],
      m_revised: [NaN],
      m_actuals: [1],
    });
    expect(
      filterSpecsWithData(df, "m", undefined, BUDGET_REVISED_ACTUALS_SERIES),
    ).toEqual(BUDGET_ACTUALS_SERIES);
  });

  it("keeps a spec with at least one finite value", () => {
    const df = makeFrame({
      m_5_budget: [1, 2],
      m_5_revised: [null, 3],
      m_5_actuals: [1, 2],
    });
    expect(
      filterSpecsWithData(df, "m", "5", BUDGET_REVISED_ACTUALS_SERIES),
    ).toEqual(BUDGET_REVISED_ACTUALS_SERIES);
  });

  it("can drop the budget series too (actuals-only dataset)", () => {
    const df = makeFrame({
      m_actuals: [1, 2],
    });
    expect(
      filterSpecsWithData(df, "m", undefined, BUDGET_REVISED_ACTUALS_SERIES),
    ).toEqual([ACTUALS_SERIES]);
  });
});

describe("seriesPointPadding", () => {
  it("keeps the historical pair for two series", () => {
    expect(seriesPointPadding(0, 2)).toBe(0);
    expect(seriesPointPadding(1, 2)).toBe(0.26);
  });

  it("spreads three series evenly to the wider endpoint", () => {
    expect(seriesPointPadding(0, 3)).toBe(0);
    expect(seriesPointPadding(1, 3)).toBe(0.16);
    expect(seriesPointPadding(2, 3)).toBe(0.32);
  });

  it("renders a single series at full width", () => {
    expect(seriesPointPadding(0, 1)).toBe(0);
  });
});

describe("seriesDataLabelOffset", () => {
  it("stacks labels 30px per tier", () => {
    expect(seriesDataLabelOffset(0)).toBe(0);
    expect(seriesDataLabelOffset(1)).toBe(30);
    expect(seriesDataLabelOffset(2)).toBe(60);
  });
});

describe("spec constants", () => {
  it("orders series back to front", () => {
    expect(BUDGET_REVISED_ACTUALS_SERIES.map((s) => s.id)).toEqual([
      "budget",
      "revised",
      "actuals",
    ]);
    expect(BUDGET_ACTUALS_SERIES[0]).toBe(BUDGET_SERIES);
  });
});
