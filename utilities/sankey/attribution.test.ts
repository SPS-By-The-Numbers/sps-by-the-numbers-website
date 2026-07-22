import { expect } from "@jest/globals";
import {
  attributeSources,
  DRAWDOWN_SOURCE_CODE,
  GROWTH_PROGRAM_CODE,
  prorate,
} from "utilities/sankey/attribution";
import type { RevRow } from "utilities/sankey/types";

type ExpLike = { program_code: number; amount: number };

function exp(program_code: number, amount: number): ExpLike {
  return { program_code, amount };
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

// Sum of every attributed dollar routed into a (real) program.
function inflow(
  attributed: Map<number, Map<number, number>>,
  program: number,
): number {
  const inner = attributed.get(program);
  if (!inner) {
    return 0;
  }
  let total = 0;
  for (const v of inner.values()) {
    total += v;
  }
  return total;
}

function drawdownTotal(attributed: Map<number, Map<number, number>>): number {
  let total = 0;
  for (const [program, inner] of attributed.entries()) {
    if (program === GROWTH_PROGRAM_CODE) {
      continue;
    }
    total += inner.get(DRAWDOWN_SOURCE_CODE) ?? 0;
  }
  return total;
}

function growthTotal(attributed: Map<number, Map<number, number>>): number {
  const inner = attributed.get(GROWTH_PROGRAM_CODE);
  if (!inner) {
    return 0;
  }
  let total = 0;
  for (const v of inner.values()) {
    total += v;
  }
  return total;
}

describe("prorate", () => {
  it("gives the last recipient the exact remainder (sums to total)", () => {
    const parts = prorate(100, [1, 2]);
    expect(parts.length).toBe(2);
    // 100 * 1/3 for the first, remainder for the last.
    expect(parts[0]).toBeCloseTo(33.3333333, 6);
    expect(parts[0] + parts[1]).toBeCloseTo(100, 10);
  });

  it("splits evenly-divisible totals cleanly", () => {
    expect(prorate(100, [60, 40])).toEqual([60, 40]);
  });

  it("returns zeros when weights sum to zero", () => {
    expect(prorate(50, [0, 0])).toEqual([0, 0]);
  });

  it("handles a three-way indivisible split exactly", () => {
    const parts = prorate(100, [1, 1, 1]);
    expect(parts[0] + parts[1] + parts[2]).toBeCloseTo(100, 10);
  });
});

describe("attributeSources — directed clamping + spillover", () => {
  it("clamps a directed account at capacity and spills the rest to fungible", () => {
    // Program 10 spends 100, program 20 spends 50.
    const expRows = [exp(10, 100), exp(20, 50)];
    // Account 4010 is directed at program 10 but carries 120 (> 100 spend);
    // 20 must spill into the fungible pool. Account 2000 is 30 fungible.
    const revRows = [rev(4010, 4000, 10, 120), rev(2000, 2000, 0, 30)];

    const { attributed } = attributeSources(expRows, revRows, "account");

    // Program 10 filled to exactly its capacity by the directed account.
    expect(attributed.get(10)!.get(4010)).toBeCloseTo(100, 6);
    // The 20 spillover of account 4010 landed in program 20 via the fungible
    // pass, alongside the 30 truly-fungible dollars.
    expect(attributed.get(20)!.get(4010)).toBeCloseTo(20, 6);
    expect(attributed.get(20)!.get(2000)).toBeCloseTo(30, 6);

    // No drawdown / growth in a perfectly-balanced fixture.
    expect(drawdownTotal(attributed)).toBeCloseTo(0, 6);
    expect(growthTotal(attributed)).toBeCloseTo(0, 6);
  });

  it("spills a directed account whose target program has no expenditure", () => {
    // Program 99 has revenue directed to it but never spent anything.
    const expRows = [exp(10, 100)];
    const revRows = [rev(4099, 4000, 99, 40), rev(1000, 1000, 0, 60)];

    const { attributed, progTot } = attributeSources(
      expRows,
      revRows,
      "account",
    );

    // Program 99 gets nothing (no capacity); its directed money is redirected.
    expect(progTot.has(99)).toBe(false);
    expect(attributed.has(99)).toBe(false);
    // Program 10 is filled to 100 from the fungible pool (40 spillover + 60).
    expect(inflow(attributed, 10)).toBeCloseTo(100, 6);
    expect(attributed.get(10)!.get(4099)).toBeCloseTo(40, 6);
    expect(attributed.get(10)!.get(1000)).toBeCloseTo(60, 6);
  });
});

describe("attributeSources — fungible proration", () => {
  it("distributes the fungible pool across gaps summing exactly to the pool", () => {
    // Gaps 60 and 40; a single fungible account of 100.
    const expRows = [exp(10, 60), exp(20, 40)];
    const revRows = [rev(9000, 9000, 0, 100)];

    const { attributed } = attributeSources(expRows, revRows, "account");

    expect(attributed.get(10)!.get(9000)).toBeCloseTo(60, 6);
    expect(attributed.get(20)!.get(9000)).toBeCloseTo(40, 6);
    const placed =
      (attributed.get(10)!.get(9000) ?? 0) +
      (attributed.get(20)!.get(9000) ?? 0);
    expect(placed).toBeCloseTo(100, 10);
  });

  it("prorates an indivisible pool without losing pennies", () => {
    // Gaps 1 and 2 (total 3), pool 100 — does not divide evenly.
    const expRows = [exp(10, 1), exp(20, 2)];
    const revRows = [rev(9000, 9000, 0, 3)];

    const { attributed } = attributeSources(expRows, revRows, "account");

    const placed =
      (attributed.get(10)!.get(9000) ?? 0) +
      (attributed.get(20)!.get(9000) ?? 0);
    expect(placed).toBeCloseTo(3, 10);
    // Programs still filled exactly to their capacity.
    expect(inflow(attributed, 10)).toBeCloseTo(1, 10);
    expect(inflow(attributed, 20)).toBeCloseTo(2, 10);
  });
});

describe("attributeSources — fund balance", () => {
  it("fills a deficit with Fund Balance Drawdown (= expenditure - revenue)", () => {
    const expRows = [exp(10, 100)];
    const revRows = [rev(9000, 9000, 0, 70)];

    const { attributed } = attributeSources(expRows, revRows, "account");

    expect(attributed.get(10)!.get(DRAWDOWN_SOURCE_CODE)).toBeCloseTo(30, 6);
    expect(drawdownTotal(attributed)).toBeCloseTo(30, 6); // 100 - 70
    expect(inflow(attributed, 10)).toBeCloseTo(100, 6);
  });

  it("routes a surplus to Fund Balance Growth (= revenue - expenditure)", () => {
    const expRows = [exp(10, 50)];
    const revRows = [rev(9000, 9000, 0, 80)];

    const { attributed } = attributeSources(expRows, revRows, "account");

    expect(growthTotal(attributed)).toBeCloseTo(30, 6); // 80 - 50
    expect(attributed.get(GROWTH_PROGRAM_CODE)!.get(9000)).toBeCloseTo(30, 6);
    // The program is still filled to exactly its spend.
    expect(inflow(attributed, 10)).toBeCloseTo(50, 6);
  });
});

describe("attributeSources — per-program conservation", () => {
  it("balances inflow == prog_tot for every program (mixed fixture)", () => {
    const expRows = [
      exp(10, 100),
      exp(20, 60),
      exp(30, 40),
      exp(20, 20), // program 20 total = 80
    ];
    const revRows = [
      rev(4210, 4000, 20, 50), // directed to 20
      rev(4310, 4000, 30, 100), // directed to 30 (> its 40 spend -> spills 60)
      rev(1100, 1000, 0, 40), // fungible
      rev(9000, 9000, 0, 10), // fungible
    ];

    const { attributed, progTot } = attributeSources(
      expRows,
      revRows,
      "account",
    );

    for (const [p, total] of progTot.entries()) {
      expect(inflow(attributed, p)).toBeCloseTo(total, 6);
    }

    // Deficit check: expenditure 220 vs revenue 200 => 20 drawdown.
    expect(drawdownTotal(attributed)).toBeCloseTo(20, 6);
    expect(growthTotal(attributed)).toBeCloseTo(0, 6);
  });
});

describe("attributeSources — category rollup keeps directed/fungible split", () => {
  it("attributes a category that mixes directed and fungible accounts", () => {
    // Both accounts are category 4000, but one is directed and one fungible.
    const expRows = [exp(10, 40), exp(20, 30)];
    const revRows = [
      rev(4210, 4000, 20, 30), // directed to program 20
      rev(4050, 4000, 0, 40), // fungible
    ];

    const { attributed } = attributeSources(expRows, revRows, "category");

    // In category mode both roll up to source key 4000, but the directed
    // 30 lands in program 20 and the fungible 40 fills program 10.
    expect(attributed.get(20)!.get(4000)).toBeCloseTo(30, 6);
    expect(attributed.get(10)!.get(4000)).toBeCloseTo(40, 6);
  });
});

describe("attributeSources — negative directed revenue (Session 6 regression)", () => {
  // A directed revenue account that nets negative (a mid-year revenue
  // correction) must still be conserved: total attributed real-source dollars
  // must equal total revenue to the penny, so drawdown == expenditure - revenue.
  // Regression for the pre-fix `spill > 0` guard that silently dropped it.
  it("nets a negative directed account so drawdown == exp - rev", () => {
    // Program 10 spends 100, program 20 spends 50 (total exp 150).
    const expRows = [exp(10, 100), exp(20, 50)];
    // Directed to program 20: +50 on account 4210 and a -10 correction on the
    // same directed account (net directed = 40). Fungible account 1100 = 70.
    // Revenue total = 50 - 10 + 70 = 110, so drawdown must be 150 - 110 = 40.
    const revRows = [
      rev(4210, 4000, 20, 50),
      rev(4210, 4000, 20, -10),
      rev(1100, 1000, 0, 70),
    ];

    const { progTot, attributed } = attributeSources(
      expRows,
      revRows,
      "account",
    );

    const revTotal = revRows.reduce((a, r) => a + r.amount, 0);
    let realConsumed = 0;
    for (const [program, inner] of attributed.entries()) {
      if (program === GROWTH_PROGRAM_CODE) {
        continue;
      }
      for (const [s, v] of inner.entries()) {
        if (s !== DRAWDOWN_SOURCE_CODE) {
          realConsumed += v;
        }
      }
    }
    // Real-source attribution equals revenue exactly (the -10 nets in, it is
    // not dropped).
    expect(realConsumed).toBeCloseTo(revTotal, 6);
    expect(revTotal).toBeCloseTo(110, 6);
    // Every attributed value is non-negative (no negative bands).
    for (const inner of attributed.values()) {
      for (const v of inner.values()) {
        expect(v).toBeGreaterThanOrEqual(0);
      }
    }
    // Drawdown fills the gap: 150 - 110 = 40, and per-program inflow == prog_tot.
    expect(drawdownTotal(attributed)).toBeCloseTo(40, 6);
    expect(growthTotal(attributed)).toBeCloseTo(0, 6);
    expect(inflow(attributed, 10)).toBeCloseTo(progTot.get(10)!, 6);
    expect(inflow(attributed, 20)).toBeCloseTo(progTot.get(20)!, 6);
  });
});
