// Revenue -> Program attribution for the Sankey compute engine.
//
// Ports the three-pass SAFS-only attribution algorithm from SANKEY_HANDOFF.md.
// It is an economic fact about the whole General Fund, so it always runs on
// UNFILTERED data (Locked decision 3). The result feeds `computeFlows`, which
// expands expenditures across each program's attributed sources.
//
// Passes:
//   1. Directed revenue accounts (program_code != 0) route to their target
//      program, clamped at the program's remaining capacity. Overflow spills
//      into the fungible pool.
//   2. The fungible pool (unrestricted accounts + pass-1 spillover) is
//      distributed proportionally over the programs' remaining gaps. Any
//      fungible dollars that cannot be placed (all gaps full, i.e. a surplus)
//      route to Fund Balance Growth.
//   3. Any residual program gap is filled by Fund Balance Drawdown.
//
// Every real program balances inflow == outflow == prog_tot to the penny.

import type { ExpRow, RevRow, SourceMode } from "utilities/sankey/types";

// Sentinel "source" code for Fund Balance Drawdown inflows (an inflow into real
// programs). Real revenue codes are non-negative, so a negative sentinel is
// safe.
export const DRAWDOWN_SOURCE_CODE = -2;

// Sentinel "program" code for the Fund Balance Growth sink (unspent revenue,
// terminal in the Program column). Its attributed entry maps real source codes
// to the dollars they contributed to growth.
export const GROWTH_PROGRAM_CODE = -1;

export type AttributionResult = {
  // Real program_code -> total expenditure for that program.
  progTot: Map<number, number>;
  // program_code -> (sourceCode -> attributed dollars).
  //   - For a real program p: keys are real source codes plus (possibly)
  //     DRAWDOWN_SOURCE_CODE, and the values sum to progTot[p].
  //   - For GROWTH_PROGRAM_CODE: keys are real source codes whose dollars ended
  //     up as Fund Balance Growth. Not present in progTot.
  attributed: Map<number, Map<number, number>>;
};

// Distribute `total` across `weights` proportionally, giving the LAST recipient
// the exact remainder so the parts sum back to `total` (no penny drift from
// rounding a proportional share). Returns zeros if the weights sum to <= 0.
export function prorate(total: number, weights: number[]): number[] {
  const n = weights.length;
  if (n === 0) {
    return [];
  }
  const sumW = weights.reduce((a, b) => a + b, 0);
  if (sumW <= 0) {
    return weights.map(() => 0);
  }
  const out = new Array<number>(n);
  let allocated = 0;
  for (let i = 0; i < n - 1; i++) {
    const share = total * (weights[i] / sumW);
    out[i] = share;
    allocated += share;
  }
  out[n - 1] = total - allocated;
  return out;
}

function addTo(map: Map<number, number>, key: number, amount: number): void {
  if (amount === 0) {
    return;
  }
  map.set(key, (map.get(key) ?? 0) + amount);
}

function nestedAdd(
  outer: Map<number, Map<number, number>>,
  program: number,
  source: number,
  amount: number,
): void {
  if (amount === 0) {
    return;
  }
  let inner = outer.get(program);
  if (!inner) {
    inner = new Map<number, number>();
    outer.set(program, inner);
  }
  addTo(inner, source, amount);
}

export function attributeSources(
  expRows: ReadonlyArray<Pick<ExpRow, "program_code" | "amount">>,
  revRows: ReadonlyArray<RevRow>,
  mode: SourceMode,
): AttributionResult {
  // --- prog_tot: expenditure total per program.
  const progTot = new Map<number, number>();
  for (const e of expRows) {
    addTo(progTot, e.program_code, e.amount);
  }

  const attributed = new Map<number, Map<number, number>>();
  // consumed[p] = dollars routed into program p so far.
  const consumed = new Map<number, number>();

  // The source key used for link emission depends on the mode. Attribution math
  // itself is independent of source identity (it is about programs and
  // amounts), so we key by the emission code directly. Directed vs fungible is
  // decided per revenue ROW (its own program_code), which is why we must NOT
  // pre-aggregate accounts to categories before this step: a single category
  // can mix directed and fungible accounts.
  const sourceKeyOf = (r: RevRow): number =>
    mode === "category" ? r.category_code : r.revenue_code;

  // --- Pass 1: directed accounts route to their target program, clamped.
  // Aggregate directed dollars per (target program, sourceKey) for determinism,
  // then clamp cumulatively against each program's capacity. Overflow (a
  // program directed more than it spent, or directed to a program with no
  // expenditure) spills into the fungible pool.
  const directed = new Map<number, Map<number, number>>(); // target -> sourceKey -> amount
  const fungible = new Map<number, number>(); // sourceKey -> amount
  for (const r of revRows) {
    if (r.amount === 0) {
      continue;
    }
    const key = sourceKeyOf(r);
    if (r.program_code !== 0) {
      let inner = directed.get(r.program_code);
      if (!inner) {
        inner = new Map<number, number>();
        directed.set(r.program_code, inner);
      }
      addTo(inner, key, r.amount);
    } else {
      addTo(fungible, key, r.amount);
    }
  }

  // Sort targets and sources for reproducible clamping order.
  const targets = [...directed.keys()].sort((a, b) => a - b);
  for (const target of targets) {
    const cap = progTot.get(target) ?? 0;
    let used = consumed.get(target) ?? 0;
    const sources = [...directed.get(target)!.entries()].sort(
      (a, b) => a[0] - b[0],
    );
    for (const [key, amount] of sources) {
      const room = Math.max(0, cap - used);
      // Only positive dollars fill a program's capacity; never "place" a
      // net-negative directed amount as a (negative) band. Any unplaced
      // remainder -- positive overflow OR a negative revenue correction --
      // spills into the fungible pool so it nets there and total attribution
      // still equals revenue to the penny. (Session 6 fix: `spill > 0` used to
      // drop net-negative directed revenue, understating the drawdown/total;
      // see SANKEY_PLAY.md.)
      const v = amount > 0 ? Math.min(amount, room) : 0;
      if (v > 0) {
        nestedAdd(attributed, target, key, v);
        used += v;
      }
      const spill = amount - v;
      if (spill !== 0) {
        addTo(fungible, key, spill);
      }
    }
    consumed.set(target, used);
  }

  // --- Pass 2: distribute the fungible pool over remaining program gaps.
  // Aggregate-then-distribute (rather than the handoff's row-by-row form) so
  // the allocation is penny-exact and surplus is handled uniformly: a single
  // fungible row that exceeds the remaining gap cannot overfill a program here.
  const realPrograms = [...progTot.keys()].sort((a, b) => a - b);
  const remaining = realPrograms.map((p) =>
    Math.max(0, (progTot.get(p) ?? 0) - (consumed.get(p) ?? 0)),
  );
  const totalRemaining = remaining.reduce((a, b) => a + b, 0);

  // The fungible pool may now contain net-negative entries (a directed revenue
  // correction spilled here by pass 1). They net into `fungibleTotal` correctly,
  // but only POSITIVE sources can carry a (non-negative) Sankey band; a net
  // negative simply shrinks the placeable pool, surfacing as extra Fund Balance
  // Drawdown rather than a negative band. (Session 6 fix; see SANKEY_PLAY.md.)
  const allFungibleSources = [...fungible.keys()].sort((a, b) => a - b);
  const fungibleTotal = allFungibleSources.reduce(
    (a, s) => a + fungible.get(s)!,
    0,
  );
  const fungibleSources = allFungibleSources.filter(
    (s) => fungible.get(s)! > 0,
  );
  const fungibleAmounts = fungibleSources.map((s) => fungible.get(s)!);

  const placedTotal = Math.max(0, Math.min(fungibleTotal, totalRemaining));
  const growthTotal = Math.max(0, fungibleTotal - placedTotal);

  // Placement and growth are each prorated over the positive sources; their sum
  // is the NET fungibleTotal, so the tiny negative corrections are absorbed
  // proportionally instead of being drawn as bands.
  const sourcePlaced =
    fungibleAmounts.length > 0 ? prorate(placedTotal, fungibleAmounts) : [];
  if (growthTotal > 0 && fungibleAmounts.length > 0) {
    const growthSplit = prorate(growthTotal, fungibleAmounts);
    for (let i = 0; i < fungibleSources.length; i++) {
      if (growthSplit[i] > 0) {
        nestedAdd(
          attributed,
          GROWTH_PROGRAM_CODE,
          fungibleSources[i],
          growthSplit[i],
        );
      }
    }
  }

  // Distribute the placed dollars across programs proportional to their gap,
  // then split each program's fill among sources proportional to what each
  // source placed. The nested prorate keeps both axes penny-exact.
  if (placedTotal > 0 && totalRemaining > 0) {
    const programFill = prorate(placedTotal, remaining);
    for (let pi = 0; pi < realPrograms.length; pi++) {
      const fill = programFill[pi];
      if (fill <= 0) {
        continue;
      }
      const p = realPrograms[pi];
      const splits = prorate(fill, sourcePlaced);
      for (let si = 0; si < fungibleSources.length; si++) {
        nestedAdd(attributed, p, fungibleSources[si], splits[si]);
        consumed.set(p, (consumed.get(p) ?? 0) + splits[si]);
      }
    }
  }

  // --- Pass 3: Fund Balance Drawdown fills any residual gap.
  for (const p of realPrograms) {
    const gap = (progTot.get(p) ?? 0) - (consumed.get(p) ?? 0);
    if (gap > 0) {
      nestedAdd(attributed, p, DRAWDOWN_SOURCE_CODE, gap);
      consumed.set(p, (consumed.get(p) ?? 0) + gap);
    }
  }

  return { progTot, attributed };
}
