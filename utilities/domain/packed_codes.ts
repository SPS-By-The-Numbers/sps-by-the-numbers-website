// A few S-275 program and activity codes are negative. They are not numeric
// codes at all: they are a two-letter code packed seven bits per character and
// negated, so -((hi << 7) | lo) where hi and lo are ASCII.
//
//   -8656  -> (8656 >> 7, 8656 & 127) = (67, 80)  = "CP"  Capital Projects
//   -10690 -> (83, 66)                            = "SB"  the ASB fund
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
  // The other non-General-Fund source staff are charged to. The S-275 carries
  // only the trailing two letters of ASB.
  SB: "ASB (Associated Student Body)",
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

// The filter trees and the URL encoder both work in non-negative integers
// (utilities/number_set.ts encodes [0, 2^31), no sign bit), so the packed
// codes cannot go into a filter as themselves. Each gets a positive stand-in
// in the same 99xx range the synthetic activity codes already use, well clear
// of real program codes (<= 99) and activity codes (<= 91).
export const S275_ONLY_CODE_CP = 9980;
export const S275_ONLY_CODE_ASB = 9981;
export const S275_ONLY_CODE_BAD = 9982;

const S275_ONLY_BY_PACKED: Record<string, number> = {
  CP: S275_ONLY_CODE_CP,
  SB: S275_ONLY_CODE_ASB,
  "!!": S275_ONLY_CODE_BAD,
};

/**
 * Map a raw S-275 program or activity code to the code its filter uses.
 *
 * Packed codes become their positive stand-in so they can be selected like
 * anything else; everything else passes through untouched.
 */
export function toFilterableCode(code: number | null | undefined) {
  const decoded = decodePackedCode(code);
  if (decoded === null) return code;
  return S275_ONLY_BY_PACKED[decoded] ?? code;
}

/** Label for a stand-in code, for the filter tree. */
export const S275_ONLY_LABELS: Record<number, string> = {
  [S275_ONLY_CODE_CP]: "Capital Projects (CP)",
  [S275_ONLY_CODE_ASB]: "ASB (Associated Student Body)",
  // Kept visible on purpose: this is a known error in the source file, and a
  // filter entry that names it is easier to notice than a silent omission.
  [S275_ONLY_CODE_BAD]: 'Bad data ("!!")',
};
