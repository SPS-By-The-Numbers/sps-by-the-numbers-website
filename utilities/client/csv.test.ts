import { describe, expect, it } from "@jest/globals";

import { rowsToCsv } from "utilities/client/csv";

describe("rowsToCsv", () => {
  it("emits a header row plus one line per row", () => {
    const csv = rowsToCsv(
      ["a", "b"],
      [
        { a: "1", b: "2" },
        { a: "3", b: "4" },
      ],
    );
    expect(csv).toBe("a,b\r\n1,2\r\n3,4");
  });

  it("quotes a value containing a comma", () => {
    const csv = rowsToCsv(["a"], [{ a: "hello, world" }]);
    expect(csv).toBe('a\r\n"hello, world"');
  });

  it("quotes and doubles an embedded double-quote", () => {
    const csv = rowsToCsv(["a"], [{ a: 'she said "hi"' }]);
    expect(csv).toBe('a\r\n"she said ""hi"""');
  });

  it("quotes a value containing a newline", () => {
    const csv = rowsToCsv(["a"], [{ a: "line1\nline2" }]);
    expect(csv).toBe('a\r\n"line1\nline2"');
  });

  it("quotes a value containing a CRLF", () => {
    const csv = rowsToCsv(["a"], [{ a: "line1\r\nline2" }]);
    expect(csv).toBe('a\r\n"line1\r\nline2"');
  });

  it("renders null and undefined as empty cells", () => {
    const csv = rowsToCsv(["a", "b"], [{ a: null, b: undefined }]);
    expect(csv).toBe("a,b\r\n,");
  });

  it("renders booleans as true/false", () => {
    const csv = rowsToCsv(["a", "b"], [{ a: true, b: false }]);
    expect(csv).toBe("a,b\r\ntrue,false");
  });

  it("renders numbers including 0, and NaN as empty", () => {
    const csv = rowsToCsv(["a", "b", "c"], [{ a: 0, b: 42, c: NaN }]);
    expect(csv).toBe("a,b,c\r\n0,42,");
  });

  it("passes unicode content through unchanged", () => {
    const csv = rowsToCsv(["a"], [{ a: "café — 日本" }]);
    expect(csv).toBe("a\r\ncafé — 日本");
  });

  it("emits an empty cell for a field missing from the row object", () => {
    const csv = rowsToCsv(["a", "b", "c"], [{ a: "x", c: "z" }]);
    expect(csv).toBe("a,b,c\r\nx,,z");
  });

  it("follows fieldNames order, not object key order", () => {
    const csv = rowsToCsv(["c", "a", "b"], [{ a: "1", b: "2", c: "3" }]);
    expect(csv).toBe("c,a,b\r\n3,1,2");
  });

  it("does not emit a trailing newline after the last record", () => {
    const csv = rowsToCsv(["a"], [{ a: "1" }, { a: "2" }]);
    expect(csv.endsWith("\n")).toBe(false);
    expect(csv).toBe("a\r\n1\r\n2");
  });

  it("emits just the header when there are no rows", () => {
    const csv = rowsToCsv(["a", "b"], []);
    expect(csv).toBe("a,b");
  });

  it("quotes header names that require quoting", () => {
    const csv = rowsToCsv(["a,b", 'c"d'], []);
    expect(csv).toBe('"a,b","c""d"');
  });
});
