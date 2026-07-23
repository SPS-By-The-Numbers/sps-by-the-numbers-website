// Sankey flow computation for the Expenditure Flow view.
//
// Turns pre-filtered expenditure + revenue rows into deduped Highcharts-shaped
// nodes and links. Pipeline:
//   1. Attribute revenue -> program on UNFILTERED data (attribution.ts).
//   2. Aggregate expenditures to the tuple of enabled expenditure levels (perf:
//      before expanding across sources).
//   3. Expand each aggregated row across its program's attributed sources
//      proportionally (share = attributed[p][src] / prog_tot[p]).
//   4. Partition each resulting flow record per Locked decision 4: at the first
//      enabled level whose filter fails, the record follows real nodes for the
//      columns before it and one chained gray "Filtered Out" node per column
//      from there to the last column. Grand total is conserved in every column.
//   5. Emit deduped nodes (prefixed ids, colors, explicit columns) and links
//      summed per (from, to), dropping links below `minWeight` to kill dust.

import {
  attributeSources,
  DRAWDOWN_SOURCE_CODE,
  GROWTH_PROGRAM_CODE,
  NEVER_COMBINE_REVENUE_CODES,
  prorate,
  sourceKeyOf,
} from "utilities/sankey/attribution";
import { colorForNode } from "utilities/sankey/colors";
import type {
  ComputeFlowsOpts,
  ComputeFlowsResult,
  ExpRow,
  FlowFilters,
  FlowTotals,
  Level,
  RevRow,
  SankeyLink,
  SankeyNode,
} from "utilities/sankey/types";

const DEFAULT_MIN_WEIGHT = 0.005;

// Map an expenditure level to its code/label fields on an ExpRow.
const EXP_CODE_FIELD: Record<Exclude<Level, "source">, keyof ExpRow> = {
  program: "program_code",
  activity: "activity_code",
  object: "object_code",
  nces: "nces_code",
  school: "school_code",
};
const EXP_LABEL_FIELD: Record<Exclude<Level, "source">, keyof ExpRow> = {
  program: "program",
  activity: "activity",
  object: "object",
  nces: "nces",
  school: "school",
};

// Map a level to its FlowFilters key.
const FILTER_KEY: Record<Level, keyof FlowFilters> = {
  source: "sourceCodes",
  program: "programCodes",
  activity: "activityCodes",
  object: "objectCodes",
  nces: "ncesCodes",
  school: "schoolCodes",
};

// The id/level/label a column entry carries.
type Cell = {
  level: Level | "fundBalance" | "filtered";
  code: number | null; // null for fund-balance / filtered nodes
  id: string;
  name: string;
};

// A flow record: an ordered path of cells (one per enabled column) plus weight.
type FlowRecord = { path: Cell[]; weight: number };

function nodeIdForSource(code: number, sourceLabel: string): Cell {
  if (code === DRAWDOWN_SOURCE_CODE) {
    return {
      level: "fundBalance",
      code: null,
      id: "fb:drawdown",
      name: "General Fund Balance Drawdown",
    };
  }
  return { level: "source", code, id: `src:${code}`, name: sourceLabel };
}

const LEVEL_ID_PREFIX: Record<Exclude<Level, "source">, string> = {
  program: "prog",
  activity: "act",
  object: "obj",
  nces: "nces",
  school: "sch",
};

export function computeFlows(
  expRows: ReadonlyArray<ExpRow>,
  revRows: ReadonlyArray<RevRow>,
  opts: ComputeFlowsOpts,
): ComputeFlowsResult {
  const minWeight = opts.minWeight ?? DEFAULT_MIN_WEIGHT;

  // `enabledLevels` is the exact ordered list of display columns. `source` and
  // `program` may be omitted (disabled), and the remaining levels may appear in
  // any order. (The UI pins Resource/Program to the front, but the engine does
  // not depend on that.) Program is ALWAYS used internally for revenue
  // attribution, even when its own column is hidden.
  const displayLevels = opts.enabledLevels;
  const showSource = displayLevels.includes("source");
  // Displayed expenditure levels, in display order (everything but source). May
  // include `program` at some position.
  const expDisplayLevels = displayLevels.filter(
    (l) => l !== "source",
  ) as Exclude<Level, "source">[];
  // The displayed non-program expenditure levels. Program is keyed separately
  // below because attribution needs it whether or not its column is shown.
  const reorderableDisplay = expDisplayLevels.filter(
    (l) => l !== "program",
  ) as Exclude<Level, "source" | "program">[];

  const { progTot, attributed } = attributeSources(expRows, revRows, opts.mode);

  // --- Label maps ---------------------------------------------------------
  // Source labels come from revenue rows, keyed the SAME way attribution keys
  // sources (see `sourceKeyOf`): by category in category mode, by account in
  // account mode, and always by account for never-combine accounts.
  const sourceLabel = new Map<number, string>();
  // For source filtering: in category mode the source filter holds CATEGORY
  // codes, but a never-combine account is shown by its own account code, so map
  // it back to its category for the filter check (otherwise it would always
  // fail the category filter and divert to "Filtered Out").
  const sourceFilterCode = new Map<number, number>();
  for (const r of revRows) {
    const key = sourceKeyOf(r, opts.mode);
    const combined =
      opts.mode === "category" &&
      !NEVER_COMBINE_REVENUE_CODES.has(r.revenue_code);
    sourceLabel.set(key, combined ? r.category : r.revenue);
    if (opts.mode === "category" && NEVER_COMBINE_REVENUE_CODES.has(key)) {
      sourceFilterCode.set(key, r.category_code);
    }
  }
  // Program labels (for the program cell) plus the other expenditure-level
  // labels come from expenditure rows.
  const programLabel = new Map<number, string>();
  const expLabels: Record<string, Map<number, string>> = {};
  for (const l of reorderableDisplay) {
    expLabels[l] = new Map<number, string>();
  }

  // --- Aggregate expenditures to (program, displayed reorderable levels) ---
  // Program is always part of the aggregation key (needed to group flow by
  // program for attribution) even when the Program column is hidden.
  type Agg = {
    program: number;
    codes: Map<Exclude<Level, "source" | "program">, number>;
    amount: number;
  };
  const agg = new Map<string, Agg>();
  for (const e of expRows) {
    if (e.amount === 0) {
      continue;
    }
    const program = e.program_code;
    if (!programLabel.has(program)) {
      programLabel.set(program, e.program);
    }
    const codes = new Map<Exclude<Level, "source" | "program">, number>();
    const keyParts: number[] = [program];
    for (const l of reorderableDisplay) {
      const code = e[EXP_CODE_FIELD[l]] as number;
      codes.set(l, code);
      keyParts.push(code);
      const label = e[EXP_LABEL_FIELD[l]] as string;
      if (!expLabels[l].has(code)) {
        expLabels[l].set(code, label);
      }
    }
    const key = keyParts.join("|");
    const existing = agg.get(key);
    if (existing) {
      existing.amount += e.amount;
    } else {
      agg.set(key, { program, codes, amount: e.amount });
    }
  }

  // --- Build flow records -------------------------------------------------
  const records: FlowRecord[] = [];

  // The displayed expenditure cells for one aggregated tuple, in display order.
  // The `program` column (if shown) uses the tuple's own program code.
  const buildExpCells = (row: Agg): Cell[] =>
    expDisplayLevels.map((l) => {
      if (l === "program") {
        const name = programLabel.get(row.program) ?? String(row.program);
        return {
          level: "program",
          code: row.program,
          id: `prog:${row.program}`,
          name,
        };
      }
      const code = row.codes.get(l)!;
      const name = expLabels[l].get(code) ?? String(code);
      return { level: l, code, id: `${LEVEL_ID_PREFIX[l]}:${code}`, name };
    });

  // Group aggregated tuples by program. A tuple whose NET amount is <= 0 (real
  // OSPI data carries negative correction/abatement lines) cannot be drawn as a
  // band; dropping it outright would leak its magnitude and break per-column
  // conservation. Instead we scale each program's surviving positive tuples so
  // they sum EXACTLY to the program's net expenditure (progTot) -- which is also
  // its attributed inflow -- keeping every column penny-conserved. (Session 6
  // fix: the old per-row `w <= 0` skip dropped net-negative tuples and let the
  // source/activity columns overshoot the grand total; see SANKEY_PLAY.md.)
  const rowsByProgram = new Map<number, Agg[]>();
  for (const row of agg.values()) {
    if (row.amount <= 0) {
      continue;
    }
    let arr = rowsByProgram.get(row.program);
    if (!arr) {
      arr = [];
      rowsByProgram.set(row.program, arr);
    }
    arr.push(row);
  }

  for (const [program, progRows] of rowsByProgram.entries()) {
    const total = progTot.get(program) ?? 0;
    if (total <= 0) {
      continue;
    }
    // Scale the positive tuples down so they sum to the net program total.
    const scaled = prorate(
      total,
      progRows.map((r) => r.amount),
    );

    if (showSource) {
      // Split each tuple across the program's attributed revenue sources.
      const sources = attributed.get(program);
      if (!sources) {
        continue;
      }
      const srcCodes = [...sources.keys()];
      const srcWeights = srcCodes.map((s) => sources.get(s)!);
      for (let ri = 0; ri < progRows.length; ri++) {
        const rowAmount = scaled[ri];
        if (rowAmount <= 0) {
          continue;
        }
        const shares = prorate(rowAmount, srcWeights);
        const expCells = buildExpCells(progRows[ri]);
        for (let i = 0; i < srcCodes.length; i++) {
          const w = shares[i];
          if (w <= 0) {
            continue;
          }
          const s = srcCodes[i];
          const srcCell = nodeIdForSource(s, sourceLabel.get(s) ?? String(s));
          records.push({ path: [srcCell, ...expCells], weight: w });
        }
      }
    } else {
      // Source column hidden: no revenue side, no per-source split. Each tuple
      // flows as one record starting at the first displayed expenditure column.
      for (let ri = 0; ri < progRows.length; ri++) {
        const rowAmount = scaled[ri];
        if (rowAmount <= 0) {
          continue;
        }
        const expCells = buildExpCells(progRows[ri]);
        if (expCells.length === 0) {
          continue;
        }
        records.push({ path: expCells, weight: rowAmount });
      }
    }
  }

  // --- Growth: source -> Fund Balance Growth (terminal) -------------------
  // The growth total is a fund-level fact (independent of which columns show);
  // the source -> growth records are only emitted when the Source column is on.
  let growthTotal = 0;
  const growthSources = attributed.get(GROWTH_PROGRAM_CODE);
  if (growthSources) {
    for (const amount of growthSources.values()) {
      if (amount > 0) {
        growthTotal += amount;
      }
    }
    if (showSource) {
      const growthCell: Cell = {
        level: "fundBalance",
        code: null,
        id: "fb:growth",
        name: "General Fund Balance Growth",
      };
      for (const [s, amount] of growthSources.entries()) {
        if (amount <= 0) {
          continue;
        }
        const srcCell = nodeIdForSource(s, sourceLabel.get(s) ?? String(s));
        records.push({ path: [srcCell, growthCell], weight: amount });
      }
    }
  }

  // --- Partition per filters + accumulate links & nodes -------------------
  const filteredCells = new Map<number, Cell>(); // column -> shared "Filtered Out" cell
  const filteredCell = (col: number): Cell => {
    let c = filteredCells.get(col);
    if (!c) {
      c = {
        level: "filtered",
        code: null,
        id: `flt:${col}`,
        name: "Filtered Out",
      };
      filteredCells.set(col, c);
    }
    return c;
  };

  const passesFilter = (cell: Cell): boolean => {
    // Synthetic fund-balance nodes are never filtered by a level filter.
    if (cell.level === "fundBalance") {
      return true;
    }
    const set = opts.filters[FILTER_KEY[cell.level as Level]];
    if (!set) {
      return true;
    }
    if (cell.code === null) {
      return false;
    }
    // Source cells are checked against the source filter, mapping a
    // never-combine account back to its category when in category mode.
    const code =
      cell.level === "source"
        ? (sourceFilterCode.get(cell.code) ?? cell.code)
        : cell.code;
    return set.has(code);
  };

  const nodes = new Map<string, SankeyNode>();
  const registerNode = (cell: Cell, column: number): void => {
    if (nodes.has(cell.id)) {
      return;
    }
    nodes.set(cell.id, {
      id: cell.id,
      name: cell.name,
      color: colorForNode(cell.level, cell.code),
      column,
      custom: { level: cell.level, code: cell.code },
    });
  };

  const linkWeights = new Map<string, number>();
  const linkEndpoints = new Map<string, { from: string; to: string }>();
  const addLink = (from: string, to: string, weight: number): void => {
    const key = `${from} ${to}`;
    linkWeights.set(key, (linkWeights.get(key) ?? 0) + weight);
    if (!linkEndpoints.has(key)) {
      linkEndpoints.set(key, { from, to });
    }
  };

  for (const rec of records) {
    // First column (in the path's own indexing) whose filter fails.
    let failIdx = rec.path.length;
    for (let c = 0; c < rec.path.length; c++) {
      if (!passesFilter(rec.path[c])) {
        failIdx = c;
        break;
      }
    }
    // A record whose SOURCE is filtered out is DROPPED entirely (the diagram
    // then shows a sub-flow of the selected sources) rather than diverted into a
    // gray "Filtered Out" node -- which makes no sense in the leftmost
    // (Resource) column. Downstream levels still divert (below). The drawdown
    // source is level "fundBalance" and always passes, so it is never dropped.
    if (failIdx < rec.path.length && rec.path[failIdx].level === "source") {
      continue;
    }
    // Resolve each path column to a concrete cell (real or Filtered Out) and
    // register its node with the correct absolute column.
    const resolved: Cell[] = rec.path.map((cell, c) =>
      c < failIdx ? cell : filteredCell(c),
    );
    for (let c = 0; c < resolved.length; c++) {
      registerNode(resolved[c], c);
    }
    for (let c = 0; c < resolved.length - 1; c++) {
      addLink(resolved[c].id, resolved[c + 1].id, rec.weight);
    }
  }

  // --- Emit links, dropping dust -----------------------------------------
  const links: SankeyLink[] = [];
  for (const [key, weight] of linkWeights.entries()) {
    if (weight < minWeight) {
      continue;
    }
    const ends = linkEndpoints.get(key)!;
    links.push({ from: ends.from, to: ends.to, weight });
  }

  // Drop nodes that ended up with no surviving link (dust-only nodes).
  const referenced = new Set<string>();
  for (const l of links) {
    referenced.add(l.from);
    referenced.add(l.to);
  }
  const nodeList: SankeyNode[] = [];
  for (const n of nodes.values()) {
    if (referenced.has(n.id)) {
      nodeList.push(n);
    }
  }

  // --- Totals -------------------------------------------------------------
  const expenditure = expRows.reduce((a, e) => a + e.amount, 0);
  const revenue = revRows.reduce((a, r) => a + r.amount, 0);
  let drawdown = 0;
  for (const inner of attributed.values()) {
    drawdown += inner.get(DRAWDOWN_SOURCE_CODE) ?? 0;
  }
  const totals: FlowTotals = {
    expenditure,
    revenue,
    drawdown,
    growth: growthTotal,
    grandTotal: revenue + drawdown,
  };

  if (opts.coalesceLevels && opts.coalesceLevels.length > 0) {
    const { nodes: cNodes, links: cLinks } = coalesceSmall(
      nodeList,
      links,
      totals.grandTotal,
      new Set(opts.coalesceLevels),
    );
    return { nodes: cNodes, links: cLinks, totals };
  }

  return { nodes: nodeList, links, totals };
}

// Nodes below this fraction of the grand total are candidates for coalescing
// into "Other" (per column).
const COALESCE_MIN_FRACTION = 0.01;

// The name of the coalesced "Other" node per level (the count is appended,
// italicized, at render time -- see FlowDashboard's nodeFormatter).
const OTHER_LABEL: Record<Level, string> = {
  source: "Other Resources",
  program: "Other Programs",
  activity: "Other Activities",
  object: "Other Objects",
  nces: "Other NCES",
  school: "Other Schools",
};

// A node can be coalesced only if its level is enabled for coalescing AND it is
// not a fund-balance node, a Filtered Out node, or a never-combine source
// account (which must always stay separate).
function isCoalescable(n: SankeyNode, coalesceLevels: Set<Level>): boolean {
  if (n.custom.level === "fundBalance" || n.custom.level === "filtered") {
    return false;
  }
  if (!coalesceLevels.has(n.custom.level)) {
    return false;
  }
  if (
    n.custom.level === "source" &&
    n.custom.code !== null &&
    NEVER_COMBINE_REVENUE_CODES.has(n.custom.code)
  ) {
    return false;
  }
  return true;
}

// Combine small coalescable nodes on each column (whose level is in
// `coalesceLevels`) into a single "Other:<col>" node, rerouting their links and
// re-summing. The "Other" node lists the combined members (name + through-flow)
// in its `custom.members` for the tooltip. Columns with fewer than two small
// nodes are left untouched.
function coalesceSmall(
  nodes: SankeyNode[],
  links: SankeyLink[],
  grandTotal: number,
  coalesceLevels: Set<Level>,
): { nodes: SankeyNode[]; links: SankeyLink[] } {
  const threshold = grandTotal * COALESCE_MIN_FRACTION;
  if (threshold <= 0) {
    return { nodes, links };
  }

  // Node through-flow = larger of in/out (equal for interior nodes).
  const inflow = new Map<string, number>();
  const outflow = new Map<string, number>();
  for (const l of links) {
    outflow.set(l.from, (outflow.get(l.from) ?? 0) + l.weight);
    inflow.set(l.to, (inflow.get(l.to) ?? 0) + l.weight);
  }
  const nodeTotal = (id: string) =>
    Math.max(inflow.get(id) ?? 0, outflow.get(id) ?? 0);

  // Small coalescable nodes grouped by column.
  const smallByColumn = new Map<number, SankeyNode[]>();
  for (const n of nodes) {
    if (isCoalescable(n, coalesceLevels) && nodeTotal(n.id) < threshold) {
      const arr = smallByColumn.get(n.column);
      if (arr) {
        arr.push(n);
      } else {
        smallByColumn.set(n.column, [n]);
      }
    }
  }

  const rename = new Map<string, string>(); // small node id -> other:<col>
  const otherNodes: SankeyNode[] = [];
  for (const [col, small] of smallByColumn.entries()) {
    if (small.length < 2) {
      continue; // nothing to combine
    }
    const otherId = `other:${col}`;
    const members = small
      .map((n) => ({ name: n.name, weight: nodeTotal(n.id) }))
      .sort((a, b) => b.weight - a.weight);
    for (const n of small) {
      rename.set(n.id, otherId);
    }
    const level = small[0].custom.level;
    otherNodes.push({
      id: otherId,
      name:
        level === "fundBalance" || level === "filtered"
          ? "Other"
          : OTHER_LABEL[level],
      color: small[0].color,
      column: col,
      custom: { level, code: null, members },
    });
  }

  if (rename.size === 0) {
    return { nodes, links };
  }

  // Reroute + re-sum links through the rename map.
  const mapId = (id: string) => rename.get(id) ?? id;
  const weights = new Map<string, number>();
  const ends = new Map<string, { from: string; to: string }>();
  for (const l of links) {
    const from = mapId(l.from);
    const to = mapId(l.to);
    if (from === to) {
      continue; // guard against a degenerate self-loop
    }
    const key = `${from}\t${to}`;
    weights.set(key, (weights.get(key) ?? 0) + l.weight);
    if (!ends.has(key)) {
      ends.set(key, { from, to });
    }
  }
  const newLinks: SankeyLink[] = [];
  for (const [key, e] of ends.entries()) {
    newLinks.push({ from: e.from, to: e.to, weight: weights.get(key)! });
  }

  const newNodes = nodes.filter((n) => !rename.has(n.id)).concat(otherNodes);

  return { nodes: newNodes, links: newLinks };
}
