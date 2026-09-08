// A few S-275 program and activity codes are negative. They are not numeric
// codes at all: they are a two-letter code packed seven bits per character and
// negated, so -((hi << 7) | lo) where hi and lo are ASCII.
//
//   -8656  -> (8656 >> 7, 8656 & 127) = (67, 80)  = "CP"  Capital Projects
//   -10690 -> (83, 66)                            = "SB"
//   -4257  -> (33, 33)                            = "!!"  a source data error
//
// Decoding is deliberately faithful rather than forgiving: "!!" is a real
// error in the input file, and rendering it as-is surfaces that, where
// silently dropping it or calling it "unknown" would hide a data problem
// behind something that looks intentional.

/** The two-letter code a negative S-275 program/activity code packs, if any. */
export function decodePackedCode(
  code: number | null | undefined,
): string | null {
  if (code === null || code === undefined || code >= 0) return null;
  const packed = -code;
  const hi = packed >> 7;
  const lo = packed & 127;
  // Printable ASCII only; anything else is not a packed pair.
  if (hi < 32 || hi > 126 || lo < 32 || lo > 126) return null;
  return String.fromCharCode(hi, lo);
}

const LABELS: Record<string, string> = {
  CP: "Capital Projects",
  // The other non-General-Fund source staff are charged to. Left abbreviated
  // because the S-275 only carries the two letters.
  SB: "SB (student activities)",
};

/**
 * A human label for a packed code, or null when the code is not packed.
 *
 * An unrecognised pair still gets rendered, quoted, so a new abbreviation --
 * or a corrupt one like "!!" -- shows up instead of disappearing.
 */
export function packedCodeLabel(
  code: number | null | undefined,
): string | null {
  const decoded = decodePackedCode(code);
  if (decoded === null) return null;
  return LABELS[decoded] ?? `"${decoded}" (unrecognized code)`;
}
