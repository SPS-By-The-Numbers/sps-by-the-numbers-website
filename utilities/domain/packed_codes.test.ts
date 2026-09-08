import { decodePackedCode, packedCodeLabel } from "./packed_codes";

describe("decodePackedCode", () => {
  it("decodes the codes that actually occur in the S-275", () => {
    // Verified against BigQuery: these are every negative program/activity
    // code in safs_s275.assignment, 2013-14 through 2024-25.
    expect(decodePackedCode(-8656)).toBe("CP");
    expect(decodePackedCode(-10690)).toBe("SB");
    expect(decodePackedCode(-4257)).toBe("!!");
  });

  it("leaves ordinary numeric codes alone", () => {
    expect(decodePackedCode(27)).toBeNull();
    expect(decodePackedCode(0)).toBeNull();
    expect(decodePackedCode(9990)).toBeNull();
  });

  it("handles a missing code", () => {
    expect(decodePackedCode(null)).toBeNull();
    expect(decodePackedCode(undefined)).toBeNull();
  });

  it("rejects a negative number that does not pack to printable ASCII", () => {
    // -1 is (0, 1): control characters, so not a packed pair.
    expect(decodePackedCode(-1)).toBeNull();
  });

  it("round-trips the packing it documents", () => {
    const pack = (s: string) => -((s.charCodeAt(0) << 7) | s.charCodeAt(1));
    expect(pack("CP")).toBe(-8656);
    expect(decodePackedCode(pack("ZZ"))).toBe("ZZ");
  });
});

describe("packedCodeLabel", () => {
  it("names the funds it knows", () => {
    expect(packedCodeLabel(-8656)).toBe("Capital Projects");
    expect(packedCodeLabel(-10690)).toBe("ASB (Associated Student Body)");
  });

  it("still renders an unrecognized pair rather than hiding it", () => {
    // "!!" is a known error in the source file. Surfacing it is the point:
    // dropping it would disguise a data problem as an intentional blank.
    expect(packedCodeLabel(-4257)).toBe('"!!" (unrecognized code)');
  });

  it("returns null for ordinary codes", () => {
    expect(packedCodeLabel(1)).toBeNull();
  });
});
