import { expect } from "@jest/globals";
import { computeFlows } from "utilities/sankey/flows";
import { SANKEY_COLORS } from "utilities/sankey/colors";
import type {
  ExpRow,
  Level,
  RevRow,
  SankeyLink,
  SankeyNode,
} from "utilities/sankey/types";

function exp(
  program_code: number,
  program: string,
  activity_code: number,
  activity: string,
  amount: number,
  extra: Partial<ExpRow> = {},
): ExpRow {
  return {
    program_code,
    program,
    activity_code,
    activity,
    object_code: 0,
    object: "",
    nces_code: 0,
    nces: "",
    school_code: 0,
    school: "",
    amount,
    ...extra,
  };
}

function rev(
  revenue_code: number,
  category_code: number,
  program_code: number,
  amount: number,
): RevRow {
  return {
    revenue_code,
    revenue: `rev ${revenue_code}`,
    category_code,
    category: `cat ${category_code}`,
    program_code,
    program: `prog ${program_code}`,
    amount,
  };
}

// The standard deficit fixture used across several tests.
//   Program 10 "Basic" spends 100 (act 27 = 60, act 29 = 40).
//   Program 20 "SpEd"  spends 50  (act 27 = 50).
//   Revenue: account 4210 directed to program 20 (50), account 1100 fungible (70).
//   Total expenditure 150, revenue 120 => Fund Balance Drawdown 30.
function deficitExp(): ExpRow[] {
  return [
    exp(10, "Basic", 27, "Teaching", 60),
    exp(10, "Basic", 29, "Other", 40),
    exp(20, "SpEd", 27, "Teaching", 50),
  ];
}
function deficitRev(): RevRow[] {
  return [rev(4210, 4000, 20, 50), rev(1100, 1000, 0, 70)];
}

function link(links: SankeyLink[], from: string, to: string): number {
  return links
    .filter((l) => l.from === from && l.to === to)
    .reduce((a, l) => a + l.weight, 0);
}

function outflow(links: SankeyLink[], id: string): number {
  return links.filter((l) => l.from === id).reduce((a, l) => a + l.weight, 0);
}

function inflow(links: SankeyLink[], id: string): number {
  return links.filter((l) => l.to === id).reduce((a, l) => a + l.weight, 0);
}

function nodeById(nodes: SankeyNode[], id: string): SankeyNode | undefined {
  return nodes.find((n) => n.id === id);
}

// Total link weight leaving every node that sits in `column`.
function columnOutgoing(
  nodes: SankeyNode[],
  links: SankeyLink[],
  column: number,
): number {
  const ids = new Set(
    nodes.filter((n) => n.column === column).map((n) => n.id),
  );
  return links.filter((l) => ids.has(l.from)).reduce((a, l) => a + l.weight, 0);
}

function columnIncoming(
  nodes: SankeyNode[],
  links: SankeyLink[],
  column: number,
): number {
  const ids = new Set(
    nodes.filter((n) => n.column === column).map((n) => n.id),
  );
  return links.filter((l) => ids.has(l.to)).reduce((a, l) => a + l.weight, 0);
}

const BASE_LEVELS: Level[] = ["source", "program", "activity"];

describe("computeFlows — basic deficit, no filters", () => {
  const { nodes, links, totals } = computeFlows(deficitExp(), deficitRev(), {
    mode: "account",
    enabledLevels: BASE_LEVELS,
    filters: {},
  });

  it("credits attributed sources into programs", () => {
    expect(link(links, "src:1100", "prog:10")).toBeCloseTo(70, 6);
    expect(link(links, "fb:drawdown", "prog:10")).toBeCloseTo(30, 6);
    expect(link(links, "src:4210", "prog:20")).toBeCloseTo(50, 6);
  });

  it("per-program inflow == outflow == prog_tot for every program", () => {
    // program 10: inflow 100 (70 + 30), outflow 100 (act 27 = 60, act 29 = 40).
    expect(inflow(links, "prog:10")).toBeCloseTo(100, 6);
    expect(outflow(links, "prog:10")).toBeCloseTo(100, 6);
    // program 20: 50 in, 50 out.
    expect(inflow(links, "prog:20")).toBeCloseTo(50, 6);
    expect(outflow(links, "prog:20")).toBeCloseTo(50, 6);
  });

  it("reports the fund balance drawdown", () => {
    expect(totals.drawdown).toBeCloseTo(30, 6);
    expect(totals.growth).toBeCloseTo(0, 6);
    expect(totals.expenditure).toBeCloseTo(150, 6);
    expect(totals.revenue).toBeCloseTo(120, 6);
    // Grand total = revenue + drawdown = expenditure.
    expect(totals.grandTotal).toBeCloseTo(150, 6);
    expect(outflow(links, "fb:drawdown")).toBeCloseTo(30, 6);
  });

  it("every column totals the grand total", () => {
    // Column 0 (source) and column 1 (program) both emit the grand total.
    expect(columnOutgoing(nodes, links, 0)).toBeCloseTo(150, 6);
    expect(columnOutgoing(nodes, links, 1)).toBeCloseTo(150, 6);
    // Columns 1 and 2 both receive the grand total.
    expect(columnIncoming(nodes, links, 1)).toBeCloseTo(150, 6);
    expect(columnIncoming(nodes, links, 2)).toBeCloseTo(150, 6);
  });

  it("assigns prefixed ids, colors and columns", () => {
    expect(nodeById(nodes, "src:1100")!.column).toBe(0);
    expect(nodeById(nodes, "src:1100")!.color).toBe(SANKEY_COLORS.localTaxes);
    expect(nodeById(nodes, "prog:10")!.column).toBe(1);
    expect(nodeById(nodes, "prog:10")!.color).toBe(SANKEY_COLORS.program);
    expect(nodeById(nodes, "act:27")!.column).toBe(2);
    expect(nodeById(nodes, "fb:drawdown")!.color).toBe(
      SANKEY_COLORS.fundBalance,
    );
    expect(nodeById(nodes, "fb:drawdown")!.custom).toEqual({
      level: "fundBalance",
      code: null,
    });
  });
});

describe("computeFlows — column conservation with a program filter", () => {
  // Keep only program 20; program 10 diverts to the Filtered Out chain at the
  // Program column.
  const { nodes, links } = computeFlows(deficitExp(), deficitRev(), {
    mode: "account",
    enabledLevels: BASE_LEVELS,
    filters: { programCodes: new Set([20]) },
  });

  it("diverts the filtered program into a chained gray band", () => {
    // Real sources still credited at column 0.
    expect(link(links, "src:1100", "flt:1")).toBeCloseTo(70, 6);
    expect(link(links, "fb:drawdown", "flt:1")).toBeCloseTo(30, 6);
    // The gray band chains left -> right to the last column.
    expect(link(links, "flt:1", "flt:2")).toBeCloseTo(100, 6);
    // program 20 is unaffected.
    expect(link(links, "src:4210", "prog:20")).toBeCloseTo(50, 6);
    expect(link(links, "prog:20", "act:27")).toBeCloseTo(50, 6);
  });

  it("conserves the grand total in every column", () => {
    for (let col = 0; col <= 1; col++) {
      expect(columnOutgoing(nodes, links, col)).toBeCloseTo(150, 6);
    }
    for (let col = 1; col <= 2; col++) {
      expect(columnIncoming(nodes, links, col)).toBeCloseTo(150, 6);
    }
  });

  it("colors the Filtered Out nodes gray", () => {
    expect(nodeById(nodes, "flt:1")!.color).toBe(SANKEY_COLORS.filteredOut);
    expect(nodeById(nodes, "flt:2")!.color).toBe(SANKEY_COLORS.filteredOut);
    expect(nodeById(nodes, "flt:1")!.column).toBe(1);
    expect(nodeById(nodes, "flt:2")!.column).toBe(2);
  });
});

describe("computeFlows — first-failing-level diversion at Activity", () => {
  // Keep only activity 29; activity-27 flow must still credit real Source and
  // Program nodes, then divert to Filtered Out from the Activity column on.
  const { nodes, links } = computeFlows(deficitExp(), deficitRev(), {
    mode: "account",
    enabledLevels: BASE_LEVELS,
    filters: { activityCodes: new Set([29]) },
  });

  it("credits real Source and Program before diverting at Activity", () => {
    // Real source -> program links carry the full program-10 attribution
    // (both the passing act-29 flow and the diverted act-27 flow).
    expect(link(links, "src:1100", "prog:10")).toBeCloseTo(70, 6);
    expect(link(links, "fb:drawdown", "prog:10")).toBeCloseTo(30, 6);
    // The kept activity survives.
    expect(link(links, "prog:10", "act:29")).toBeCloseTo(40, 6);
    // The filtered activities divert from the Activity column.
    expect(link(links, "prog:10", "flt:2")).toBeCloseTo(60, 6);
    expect(link(links, "prog:20", "flt:2")).toBeCloseTo(50, 6);
  });

  it("does not emit a node for the fully-filtered activity", () => {
    expect(nodeById(nodes, "act:27")).toBeUndefined();
    expect(nodeById(nodes, "act:29")).toBeDefined();
  });

  it("still conserves the grand total in the Activity column", () => {
    // act:29 (40) + flt:2 (110) == 150.
    expect(columnIncoming(nodes, links, 2)).toBeCloseTo(150, 6);
  });
});

describe("computeFlows — surplus routes to Fund Balance Growth", () => {
  const expRows = [exp(10, "Basic", 27, "Teaching", 50)];
  const revRows = [rev(9000, 9000, 0, 80)];
  const { nodes, links, totals } = computeFlows(expRows, revRows, {
    mode: "account",
    enabledLevels: BASE_LEVELS,
    filters: {},
  });

  it("emits a terminal Fund Balance Growth node in the Program column", () => {
    expect(totals.growth).toBeCloseTo(30, 6);
    expect(link(links, "src:9000", "fb:growth")).toBeCloseTo(30, 6);
    const growth = nodeById(nodes, "fb:growth")!;
    expect(growth.column).toBe(1);
    expect(growth.color).toBe(SANKEY_COLORS.fundBalance);
    // Growth is terminal: it has inflow but no outflow.
    expect(inflow(links, "fb:growth")).toBeCloseTo(30, 6);
    expect(outflow(links, "fb:growth")).toBeCloseTo(0, 6);
    // Grand total = revenue = expenditure + growth.
    expect(totals.grandTotal).toBeCloseTo(80, 6);
  });
});

describe("computeFlows — optional levels", () => {
  it("adds the Object column when enabled and keeps conservation", () => {
    const expRows = [
      exp(10, "Basic", 27, "Teaching", 60, { object_code: 2, object: "Cert" }),
      exp(10, "Basic", 27, "Teaching", 40, {
        object_code: 4,
        object: "Benefits",
      }),
    ];
    const revRows = [rev(9000, 9000, 0, 100)];
    const { nodes, links } = computeFlows(expRows, revRows, {
      mode: "account",
      enabledLevels: ["source", "program", "activity", "object"],
      filters: {},
    });

    expect(nodeById(nodes, "obj:2")!.column).toBe(3);
    expect(nodeById(nodes, "obj:2")!.color).toBe(SANKEY_COLORS.object[2]);
    expect(link(links, "act:27", "obj:2")).toBeCloseTo(60, 6);
    expect(link(links, "act:27", "obj:4")).toBeCloseTo(40, 6);
    // Every column still totals 100.
    for (let col = 0; col <= 2; col++) {
      expect(columnOutgoing(nodes, links, col)).toBeCloseTo(100, 6);
    }
    expect(columnIncoming(nodes, links, 3)).toBeCloseTo(100, 6);
  });
});

describe("computeFlows — negative expenditure lines (Session 6 regression)", () => {
  // Real OSPI data carries negative correction/abatement lines. A tuple whose
  // NET is <= 0 cannot be a band, but its magnitude must NOT leak: the program's
  // emitted flow must still sum to its net expenditure, so every column stays
  // conserved. Regression for the pre-fix `w <= 0` per-row skip in flows.ts.
  it("nets a negative tuple without breaking column conservation", () => {
    // Program 10 spends net 100: act 27 = +150, act 29 = -50 (a refund).
    const expRows = [
      exp(10, "Basic", 27, "Teaching", 150),
      exp(10, "Basic", 29, "Refund", -50),
    ];
    const revRows = [rev(1100, 1000, 0, 100)];
    const { nodes, links, totals } = computeFlows(expRows, revRows, {
      mode: "account",
      enabledLevels: BASE_LEVELS,
      filters: {},
    });

    // Net program total is 100 = revenue, so no drawdown, no growth.
    expect(totals.expenditure).toBeCloseTo(100, 6);
    expect(totals.grandTotal).toBeCloseTo(100, 6);
    // The negative activity produced no band; the surviving positive activity
    // was scaled down from 150 to the net 100 rather than shown at 150.
    expect(nodeById(nodes, "act:29")).toBeUndefined();
    expect(link(links, "prog:10", "act:27")).toBeCloseTo(100, 6);
    // Every column conserves the net grand total (would be 150 pre-fix).
    for (let col = 0; col <= 1; col++) {
      expect(columnOutgoing(nodes, links, col)).toBeCloseTo(100, 6);
    }
    expect(columnIncoming(nodes, links, 2)).toBeCloseTo(100, 6);
  });
});

describe("computeFlows — reorderable levels and disabling source/program", () => {
  it("renders the columns in the caller's order", () => {
    // Object before Activity: obj is column 2, activity is column 3.
    const expRows = [
      exp(10, "Basic", 27, "Teaching", 100, {
        object_code: 2,
        object: "Cert Salaries",
      }),
    ];
    const revRows = [rev(1100, 1000, 0, 100)];
    const { nodes, links } = computeFlows(expRows, revRows, {
      mode: "account",
      enabledLevels: ["source", "program", "object", "activity"],
      filters: {},
    });

    expect(nodeById(nodes, "prog:10")!.column).toBe(1);
    expect(nodeById(nodes, "obj:2")!.column).toBe(2);
    expect(nodeById(nodes, "act:27")!.column).toBe(3);
    // Links follow the chosen order program -> object -> activity.
    expect(link(links, "prog:10", "obj:2")).toBeCloseTo(100, 6);
    expect(link(links, "obj:2", "act:27")).toBeCloseTo(100, 6);
  });

  it("hides the Program column but keeps attribution (source -> activity)", () => {
    const { nodes, links, totals } = computeFlows(deficitExp(), deficitRev(), {
      mode: "account",
      enabledLevels: ["source", "activity"],
      filters: {},
    });

    // No program node; sources link straight to activities.
    expect(nodes.some((n) => n.custom.level === "program")).toBe(false);
    // Attribution still ran: drawdown source exists (deficit fixture), total
    // conserved across both columns.
    expect(totals.drawdown).toBeCloseTo(30, 6);
    expect(columnOutgoing(nodes, links, 0)).toBeCloseTo(150, 6);
    expect(columnIncoming(nodes, links, 1)).toBeCloseTo(150, 6);
    // act 27 is funded by both programs (60 from prog10 + 50 from prog20 = 110).
    expect(inflow(links, "act:27")).toBeCloseTo(110, 6);
  });

  it("hides the Source column: no revenue side, starts at Program", () => {
    const { nodes, links, totals } = computeFlows(deficitExp(), deficitRev(), {
      mode: "account",
      enabledLevels: ["program", "activity"],
      filters: {},
    });

    // No source or fund-balance nodes at all.
    expect(nodes.some((n) => n.custom.level === "source")).toBe(false);
    expect(nodes.some((n) => n.custom.level === "fundBalance")).toBe(false);
    expect(nodeById(nodes, "prog:10")!.column).toBe(0);
    expect(nodeById(nodes, "act:27")!.column).toBe(1);
    // The displayed columns total the net expenditure (150), and the totals
    // still report the fund-level drawdown for the subtitle.
    expect(columnOutgoing(nodes, links, 0)).toBeCloseTo(150, 6);
    expect(totals.drawdown).toBeCloseTo(30, 6);
    expect(link(links, "prog:10", "act:27")).toBeCloseTo(60, 6);
    expect(link(links, "prog:20", "act:27")).toBeCloseTo(50, 6);
  });
});

describe("computeFlows — never-combine sources and node names", () => {
  it("keeps Gifts/Grants/Donations (2500) separate even in category mode", () => {
    // Two fungible accounts in the same category 2000: the grants/gifts account
    // (2500, never-combine) and another (2100). Program 10 spends 100.
    const expRows = [exp(10, "Basic", 27, "Teaching", 100)];
    const revRows = [
      rev(2500, 2000, 0, 40), // Gifts, Grants, and Donations
      rev(2100, 2000, 0, 60), // other Local Non-tax
    ];
    const { nodes, links } = computeFlows(expRows, revRows, {
      mode: "category",
      enabledLevels: BASE_LEVELS,
      filters: {},
    });

    // 2500 stays its own account node; 2100 rolls up into the category node.
    expect(nodeById(nodes, "src:2500")).toBeDefined();
    expect(nodeById(nodes, "src:2000")).toBeDefined();
    expect(link(links, "src:2500", "prog:10")).toBeCloseTo(40, 6);
    expect(link(links, "src:2000", "prog:10")).toBeCloseTo(60, 6);
  });

  it("does not divert a never-combine source under the default category filter", () => {
    // Regression: account 2500's source cell carries code 2500, but the
    // category filter holds category codes. It must map back to category 2000
    // (selected here) and pass -- not fall into a "Filtered Out" resource.
    const expRows = [exp(10, "Basic", 27, "Teaching", 100)];
    const revRows = [rev(2500, 2000, 0, 100)];
    const { nodes } = computeFlows(expRows, revRows, {
      mode: "category",
      enabledLevels: BASE_LEVELS,
      // Category filter selects 2000 (and others) -- as the default all-selected
      // filter would.
      filters: { sourceCodes: new Set([1000, 2000, 3000]) },
    });
    expect(nodeById(nodes, "src:2500")).toBeDefined();
    expect(nodes.some((n) => n.custom.level === "filtered")).toBe(false);
  });

  it("drops a never-combine source when its category is deselected", () => {
    const expRows = [exp(10, "Basic", 27, "Teaching", 100)];
    const revRows = [rev(2500, 2000, 0, 100)];
    const { nodes } = computeFlows(expRows, revRows, {
      mode: "category",
      enabledLevels: BASE_LEVELS,
      // Category 2000 (which 2500 belongs to) is NOT selected.
      filters: { sourceCodes: new Set([1000, 3000]) },
    });
    // The source is dropped (not diverted): no src node and, crucially, no
    // "Filtered Out" resource in the source column.
    expect(nodeById(nodes, "src:2500")).toBeUndefined();
    expect(nodes.some((n) => n.custom.level === "filtered")).toBe(false);
  });

  it("names the drawdown node 'General Fund Balance Drawdown'", () => {
    const { nodes } = computeFlows(deficitExp(), deficitRev(), {
      mode: "account",
      enabledLevels: BASE_LEVELS,
      filters: {},
    });
    expect(nodeById(nodes, "fb:drawdown")!.name).toBe(
      "General Fund Balance Drawdown",
    );
  });
});

describe("computeFlows — the Resource column never contains Filtered Out", () => {
  const sourceColumnHasFiltered = (nodes: SankeyNode[]) =>
    nodes.some((n) => n.column === 0 && n.custom.level === "filtered");

  it("has no Filtered Out resource under default filters", () => {
    const { nodes } = computeFlows(deficitExp(), deficitRev(), {
      mode: "account",
      enabledLevels: BASE_LEVELS,
      filters: {},
    });
    expect(sourceColumnHasFiltered(nodes)).toBe(false);
  });

  it("drops excluded sources instead of adding a Filtered Out resource", () => {
    const { nodes } = computeFlows(deficitExp(), deficitRev(), {
      mode: "account",
      enabledLevels: BASE_LEVELS,
      filters: { sourceCodes: new Set([1100]) }, // exclude directed account 4210
    });
    expect(sourceColumnHasFiltered(nodes)).toBe(false);
    expect(nodes.some((n) => n.custom.level === "filtered")).toBe(false);
    expect(nodeById(nodes, "src:4210")).toBeUndefined();
  });

  it("keeps the Resource column clean even with a downstream filter", () => {
    const { nodes } = computeFlows(deficitExp(), deficitRev(), {
      mode: "account",
      enabledLevels: BASE_LEVELS,
      filters: { programCodes: new Set([20]) }, // exclude program 10 downstream
    });
    expect(sourceColumnHasFiltered(nodes)).toBe(false);
    // The downstream filter still diverts into a Filtered Out band (later column).
    expect(nodes.some((n) => n.custom.level === "filtered")).toBe(true);
  });
});
