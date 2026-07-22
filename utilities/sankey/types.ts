// Pure type definitions for the Sankey compute engine.
//
// Everything here is plain data (no arquero, no Highcharts, no React). Callers
// (the Expenditure Flow route in `app/finance/flow/`) convert their arquero
// `ColumnTable`s to plain rows via `.objects()` before handing them to this
// module, and adapt the emitted nodes/links to the Highcharts sankey series
// shape on the way out.

// A pre-aggregated General Fund expenditure row (one (program, activity,
// object, nces, school) tuple), already filtered by the caller to a single
// (class_of, data_type).
export type ExpRow = {
  program_code: number;
  program: string;
  activity_code: number;
  activity: string;
  object_code: number;
  object: string;
  nces_code: number;
  nces: string;
  school_code: number;
  school: string;
  amount: number;
};

// A per-account General Fund revenue row, already filtered by the caller to a
// single (class_of, data_type). `program_code === 0` (label
// "[special] Unrestricted") marks a fungible account; a nonzero `program_code`
// means OSPI directs that account to that program.
export type RevRow = {
  revenue_code: number;
  revenue: string;
  category_code: number;
  category: string;
  program_code: number;
  program: string;
  amount: number;
};

// The possible sankey columns. `source` is derived via revenue attribution; the
// rest are expenditure classifications. The displayed subset and their order
// are chosen by the caller (see ComputeFlowsOpts.enabledLevels).
export type Level =
  | "source"
  | "program"
  | "activity"
  | "object"
  | "nces"
  | "school";

// Whether the Source column is bucketed by revenue category (~9 nodes) or by
// revenue account (~60 nodes).
export type SourceMode = "category" | "account";

// Per-level include filters. A missing key means "no filter" (all pass); a
// present Set means only the codes it contains pass. `sourceCodes` holds
// category codes or account codes depending on `SourceMode`.
export type FlowFilters = Partial<{
  sourceCodes: Set<number>;
  programCodes: Set<number>;
  activityCodes: Set<number>;
  objectCodes: Set<number>;
  ncesCodes: Set<number>;
  schoolCodes: Set<number>;
}>;

// An emitted sankey node. `id` is prefixed to avoid numeric collisions across
// levels (see `nodeId`). `column` pins the node to a band. `custom` carries the
// info a tooltip needs to build a deep link back into a dashboard.
export type SankeyNode = {
  id: string;
  name: string;
  color: string;
  column: number;
  custom: { level: Level | "fundBalance" | "filtered"; code: number | null };
  // True when Fund Balance Drawdown-sourced flow passes through this node
  // (downstream of the drawdown source), for the light-red outline.
  drawdown?: boolean;
};

// An emitted sankey link (already summed per (from, to) pair). `drawdown` marks
// links that carry Fund Balance Drawdown-sourced flow.
export type SankeyLink = {
  from: string;
  to: string;
  weight: number;
  drawdown?: boolean;
};

// Options for `computeFlows`.
export type ComputeFlowsOpts = {
  mode: SourceMode;
  // The exact ordered list of columns to render, left to right. Any level may
  // be omitted (its column is hidden) and the levels may appear in any order.
  // `program` is always used internally for revenue attribution even when its
  // own column is not shown; when `source` is omitted the revenue side (and the
  // Fund Balance nodes) are dropped and the diagram starts at the first listed
  // expenditure column.
  enabledLevels: Level[];
  filters: FlowFilters;
  // Links below this weight (in dollars) are dropped to kill float dust.
  minWeight?: number;
};

// Totals summarizing the flow, for reconciliation and chart titles.
export type FlowTotals = {
  expenditure: number; // sum of expRows.amount
  revenue: number; // sum of revRows.amount
  drawdown: number; // total Fund Balance Drawdown inflow
  growth: number; // total Fund Balance Growth outflow
  grandTotal: number; // the source-column total (revenue + drawdown == expenditure + growth)
};

export type ComputeFlowsResult = {
  nodes: SankeyNode[];
  links: SankeyLink[];
  totals: FlowTotals;
};
