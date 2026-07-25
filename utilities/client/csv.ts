// Pure, dependency-free CSV writer following RFC 4180.
//
// This module intentionally has NO external dependencies (in particular it does
// NOT import arquero) so it can be unit-tested in isolation and used directly by
// the client-side download button.

// Serializes a single cell value into its string form (pre-quoting).
//   - null / undefined      -> "" (empty string)
//   - boolean               -> "true" / "false"
//   - number               -> String(n), except NaN -> "" (typeof NaN === "number")
//   - everything else       -> String(value)
function serializeCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "number") {
    return Number.isNaN(value) ? "" : String(value);
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return String(value);
}

// Quotes a cell per RFC 4180 rules: a cell is wrapped in double-quotes if it
// contains a comma, a double-quote, a carriage return, or a newline. Inside a
// quoted cell, embedded double-quotes are escaped by doubling them.
function quoteCell(cell: string): string {
  if (/[",\r\n]/.test(cell)) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

/**
 * Converts an array of row objects into an RFC 4180 CSV string.
 *
 * The first line is a header row containing `fieldNames` in the given order.
 * Each subsequent line contains one row, with cells emitted in `fieldNames`
 * order (i.e. column order follows `fieldNames`, not object key order). Fields
 * present in `fieldNames` but missing from a row object serialize to an empty
 * cell.
 *
 * Records are separated by "\r\n". There is NO trailing newline after the last
 * record. Unicode content passes through unchanged.
 */
export function rowsToCsv(
  fieldNames: string[],
  rows: Record<string, unknown>[],
): string {
  const lines: string[] = [];

  lines.push(fieldNames.map((name) => quoteCell(name)).join(","));

  for (const row of rows) {
    lines.push(
      fieldNames.map((name) => quoteCell(serializeCell(row[name]))).join(","),
    );
  }

  return lines.join("\r\n");
}
