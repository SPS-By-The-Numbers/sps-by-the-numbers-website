// Row planning for the salary skyline.
//
// One column per employee, ordered by duty title, is far too wide to read on a
// single axis -- SPS 2024-25 is 7,156 people. The chart instead wraps into
// rows of a fixed number of people, the way a paragraph wraps into lines, and
// a duty title that does not fit in what is left of a row continues onto the
// next one under a "Cont'd" label.
//
// Every row is planned to the same slot count so the rows share a horizontal
// scale: a column 40% across row 3 sits above a column 40% across row 1. The
// final row is left short rather than stretched, for the same reason.

export type Person = {
  duty: string;
  salary: number;
  fte: number;
};

/** A run of one duty title's people inside a single row. */
export type Segment = {
  duty: string;
  /** Display label; the duty title, or "<duty> Cont'd (n)" on later rows. */
  label: string;
  /** True when this segment continues a duty title from an earlier row. */
  continued: boolean;
  /** Slot index of this segment's first person within its row. */
  start: number;
  people: Person[];
};

export type Row = {
  segments: Segment[];
  /** People in this row; <= slotsPerRow, and short on the final row. */
  filled: number;
  /** Index of this row's first person across the whole roster, for captions. */
  offset: number;
};

export type Plan = {
  rows: Row[];
  slotsPerRow: number;
  /** Tallest salary anywhere, so every row can share one y-axis. */
  maxSalary: number;
  totalPeople: number;
};

/**
 * Group people by duty title, biggest payroll first, each group's people
 * ordered by salary descending -- the shape the skyline is read in.
 */
export function groupByDuty(people: Person[]): Map<string, Person[]> {
  const byDuty = new Map<string, Person[]>();
  for (const p of people) {
    const bucket = byDuty.get(p.duty);
    if (bucket) {
      bucket.push(p);
    } else {
      byDuty.set(p.duty, [p]);
    }
  }

  const payroll = (rows: Person[]) =>
    rows.reduce((sum, p) => sum + p.salary, 0);
  const ordered = [...byDuty.entries()].sort((a, b) => {
    const diff = payroll(b[1]) - payroll(a[1]);
    // Ties broken by name so the layout is stable across reloads.
    return diff !== 0 ? diff : a[0].localeCompare(b[0]);
  });

  return new Map(
    ordered.map(([duty, rows]) => [
      duty,
      [...rows].sort((a, b) => b.salary - a.salary),
    ]),
  );
}

/**
 * Lay people out into rows of `slotsPerRow` columns, splitting a duty title
 * across rows when it does not fit in what is left of the current one.
 */
export function planRows(people: Person[], slotsPerRow: number): Plan {
  if (!Number.isFinite(slotsPerRow) || slotsPerRow < 1) {
    throw new Error(`slotsPerRow must be >= 1, got ${slotsPerRow}`);
  }

  const byDuty = groupByDuty(people);
  const rows: Row[] = [];
  let row: Segment[] = [];
  let filled = 0;
  let placed = 0;

  const closeRow = () => {
    if (row.length > 0) {
      rows.push({ segments: row, filled, offset: placed });
      placed += filled;
      row = [];
      filled = 0;
    }
  };

  for (const [duty, members] of byDuty) {
    // `part` counts how many rows of this duty are already placed, so the
    // continuation labels number from 1 rather than restarting per row.
    let part = 0;
    let offset = 0;
    while (offset < members.length) {
      const room = slotsPerRow - filled;
      if (room === 0) {
        closeRow();
        continue;
      }
      const take = Math.min(room, members.length - offset);
      row.push({
        duty,
        label: part === 0 ? duty : `${duty} Cont'd (${part})`,
        continued: part > 0,
        start: filled,
        people: members.slice(offset, offset + take),
      });
      offset += take;
      filled += take;
      part += 1;
      if (filled === slotsPerRow) {
        closeRow();
      }
    }
  }
  closeRow();

  return {
    rows,
    slotsPerRow,
    maxSalary: people.reduce((max, p) => Math.max(max, p.salary), 0),
    totalPeople: people.length,
  };
}
