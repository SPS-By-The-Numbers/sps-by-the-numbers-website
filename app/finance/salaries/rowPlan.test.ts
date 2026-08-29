import { groupByDuty, planRows } from "./rowPlan";

import type { Person } from "./rowPlan";

function people(duty: string, salaries: number[], fte = 1): Person[] {
  return salaries.map((salary) => ({ duty, salary, fte }));
}

describe("groupByDuty", () => {
  it("orders duties by total payroll, not headcount", () => {
    const rows = [
      ...people("Aide", [10, 10, 10, 10]), // 4 people, $40
      ...people("Teacher", [50, 50]), // 2 people, $100
    ];
    expect([...groupByDuty(rows).keys()]).toEqual(["Teacher", "Aide"]);
  });

  it("orders people within a duty by salary descending", () => {
    const rows = people("Teacher", [30, 90, 60]);
    expect(
      groupByDuty(rows)
        .get("Teacher")
        ?.map((p) => p.salary),
    ).toEqual([90, 60, 30]);
  });

  it("breaks payroll ties by name so the layout is stable", () => {
    const rows = [...people("Zeta", [10]), ...people("Alpha", [10])];
    expect([...groupByDuty(rows).keys()]).toEqual(["Alpha", "Zeta"]);
  });

  it("does not mutate the caller's array", () => {
    const rows = people("Teacher", [30, 90]);
    const before = rows.map((p) => p.salary);
    groupByDuty(rows);
    expect(rows.map((p) => p.salary)).toEqual(before);
  });
});

describe("planRows", () => {
  it("keeps a duty that fits on one row in one segment", () => {
    const plan = planRows(people("Teacher", [5, 4, 3]), 10);
    expect(plan.rows).toHaveLength(1);
    expect(plan.rows[0].segments).toHaveLength(1);
    expect(plan.rows[0].segments[0].continued).toBe(false);
    expect(plan.rows[0].filled).toBe(3);
  });

  it("wraps an oversized duty and labels the continuations", () => {
    const plan = planRows(people("Teacher", [9, 8, 7, 6, 5]), 2);
    expect(plan.rows).toHaveLength(3);
    expect(plan.rows.map((r) => r.segments[0].label)).toEqual([
      "Teacher",
      "Teacher Cont'd (1)",
      "Teacher Cont'd (2)",
    ]);
    expect(plan.rows.map((r) => r.filled)).toEqual([2, 2, 1]);
  });

  it("packs several small duties onto one row", () => {
    const plan = planRows(
      [...people("Big", [10, 10]), ...people("Small", [1, 1])],
      10,
    );
    expect(plan.rows).toHaveLength(1);
    expect(plan.rows[0].segments.map((s) => s.duty)).toEqual(["Big", "Small"]);
    // Second segment starts where the first left off, so rows share a scale.
    expect(plan.rows[0].segments.map((s) => s.start)).toEqual([0, 2]);
  });

  it("splits a duty across the row boundary rather than leaving a gap", () => {
    const plan = planRows(
      [...people("Big", [10, 10, 10]), ...people("Small", [1, 1, 1])],
      4,
    );
    expect(plan.rows).toHaveLength(2);
    expect(
      plan.rows[0].segments.map((s) => [s.label, s.people.length]),
    ).toEqual([
      ["Big", 3],
      ["Small", 1],
    ]);
    expect(
      plan.rows[1].segments.map((s) => [s.label, s.people.length]),
    ).toEqual([["Small Cont'd (1)", 2]]);
  });

  it("never overfills a row and loses nobody", () => {
    const rows = [
      ...people(
        "A",
        Array.from({ length: 37 }, (_, i) => 100 - i),
      ),
      ...people(
        "B",
        Array.from({ length: 11 }, (_, i) => 50 - i),
      ),
      ...people("C", [7]),
    ];
    const plan = planRows(rows, 8);
    for (const row of plan.rows) {
      expect(row.filled).toBeLessThanOrEqual(8);
      const counted = row.segments.reduce((n, s) => n + s.people.length, 0);
      expect(counted).toBe(row.filled);
    }
    const placed = plan.rows.reduce((n, r) => n + r.filled, 0);
    expect(placed).toBe(rows.length);
    expect(plan.totalPeople).toBe(rows.length);
  });

  it("numbers each row's offset across the whole roster", () => {
    const plan = planRows(people("A", [9, 8, 7, 6, 5]), 2);
    expect(plan.rows.map((r) => r.offset)).toEqual([0, 2, 4]);
  });

  it("reports the tallest salary for a shared y-axis", () => {
    const plan = planRows([...people("A", [10, 400]), ...people("B", [7])], 2);
    expect(plan.maxSalary).toBe(400);
  });

  it("handles an empty roster", () => {
    const plan = planRows([], 10);
    expect(plan.rows).toEqual([]);
    expect(plan.maxSalary).toBe(0);
    expect(plan.totalPeople).toBe(0);
  });

  it("rejects a nonsense row width instead of looping forever", () => {
    expect(() => planRows(people("A", [1]), 0)).toThrow(/slotsPerRow/);
    expect(() => planRows(people("A", [1]), -3)).toThrow(/slotsPerRow/);
    expect(() => planRows(people("A", [1]), NaN)).toThrow(/slotsPerRow/);
  });
});
