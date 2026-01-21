// Defines functions to encode and decode a set of numbers into a compact,
// URL-safe, string.  It is heavily optimized for space savings when encoding
// numbers from [0, 119] that are densly packed in a block (the block size is 12 and
// all members of that block only use 2 bytes). This happens frequently with
// filter codes. From [120 to 1079], it is slightly less efficient.
//
// After that, it encodes each number individually using a tagged Base64. In
// [1080, 525,367] it uses 4 bytes per entry.  In [525,368, 2,148,009,016] it uses
// 6-bits per entry. This range goes over 2^31 which is pretty good.
//
// There are 4 formats each identified by a tag sequence. They are as follows:
//   0 - Compact
//   1 0 - ExtendedCompact
//   1 1 0 0 - Direct19
//   1 1 0 1 - Direct31
//   1 1 1 - RESERVED
//
//
// == Compact ==
//   Uses a 2 b64digit header for 12 bits.
//   Represents numbers in the range [0, 119]
//   Worst case: 4 bytes per number
//   Best case: 0.18 bytes per number
//
// Compact Header:
//   b[0] = 0 (Compact)
//   b[1] = Inclusive or Exclusive filter. 1 for Exclusive
//   b[2:12] = Block mask
//
// The Block Mask is a 10 element bitvector representing ranges of 12 numbers
// starting from 0.  The element is set to true if a number in that range is
// in the number set. For ever element that is true, there is a corresponding
// 2-b64digit datablock that defines which values are included. If the element
// is false, the entire datablock is assumed to be empty and is elided.
//
// The Data block is a sequence of 2-base64 digit bitmasks which indicate
// membership in the set. The number of datablocks for one header is defined as
// 2x the number of set bits in the Block Mask. The data blocks must match the
// order of the block mask.
//
//
// == ExtendedCompact ==
//   Uses a 2 b64digit header for 12 bits.
//   Represents numbers in the range [120, 1079]
//   Worst case: 4 bytes per number
//   Best case: 0.2 bytes per number
//
// This a modification of the Compact Header format where instead of using 10
// bits for the Block Mask, 4 are used to define an code-page for the blocks
// and the Block Mask can only support up to 5 data blocks.
//
// ExtendedCompact Header:
//   b[0:1] = 10 (ExtendedCompact)
//   b[2] = Inclusive or Exclusive filter. 1 for Exclusive
//   b[3:6] = Code page
//   b[7:12] = Block mask
//
// Each Code Page is sized to be the number of values representatble by a
// Block Mask. In this case, it's 5 * 12 = 60. Thus the ranges are
//   Code Page 0 [120, 179]
//   Code Page 1 [180, 239]
//   ...
//   Code Page 15 [1020, 1079]
//
//
// == Direct19/Direct31 ==
//   Uses a 5-bit header followed by either 3 or 5 data bytes.
//   Specifies just one entry.
//   Best/Worst case: 4 or 6 bytes per entry.
//
//   This is mostly an escape hatch in case some weird value creeps in.
//   It is basically the base64 encoding of a number with some flags
//   at the start to make it parseable.
//
// Direct19/Direct31 Header:
//   b[0:2] = 1 1 0 - (Direct number)
//   b[3] = 0 for 19-bit number. 1 for 31-bit number
//   b[4] = Inclusive or Exclusive filter. 1 for Exclusive
//
// For Direct19, b[5:24] is a 19-bit number starting after the ExtendedCompact range. 
// For Direct31, b[5:36] is the 31-bit number starting after the Direct19 range.

import { Base64Stream, Base64Reader } from "utilities/base64_stream";

type NumberSetType = "inclusive" | "exclusive";

const BLOCK_SIZE : number = 12;
export const COMPACT_MAX = 10*12;  // 120
export const EXTENDED_COMPACT_MAX = COMPACT_MAX + 2**4 * (5*12);  // 1,080
export const DIRECT19_MAX = EXTENDED_COMPACT_MAX + 2**19;  // 525,368
export const DIRECT31_MAX = DIRECT19_MAX + 2**31;  // 2,148,009,016

function pushValue(b64Stream, value, numBits) {
  let mask = 1 << (numBits - 1);
  while (mask !== 0) {
    const bit = (value & mask) !== 0;
    b64Stream.pushBits(bit);
    mask = mask >>> 1;
  }
}

function encodeCompact(b64Stream, type, values) {
  if (values.length === 0) {
    return;
  }

  b64Stream.pushBits(0, type === "exclusive");

  // Construct all data blocks.
  const blocks = new Array<number>(10);
  blocks.fill(0, 0, 10);
  for (const v of values) {
    const blockNumber = Math.trunc(v / BLOCK_SIZE);
    const bit = v % BLOCK_SIZE;
    blocks[blockNumber] = blocks[blockNumber] | (1 << bit);
  }

  // Iterate over all blocks to generate the BlockMask.
  for (const blockValue of blocks) {
    b64Stream.pushBits(blockValue !== 0);
  }

  // Runtime sanity check cause this code is so finicky.
  if (b64Stream.encodedLength() != 2) {
    throw "Major runtime error in encoding.";
  }

  // Now to push the data into the stream.
  for (const blockValue of blocks) {
    if (blockValue !== 0) {
      // Start at the MSB and push each bit.
      let mask = 1 << (BLOCK_SIZE - 1);
      while (mask !== 0) {
        const bit = (blockValue & mask) !== 0;
        b64Stream.pushBits(bit);
        mask = mask >>> 1;
      }
    }
  }
}

function encodeExtendedCompact(b64Stream, type, values) {
  if (values.length === 0) {
    return;
  }
}

function encodeOneDirect(b64Stream, type, value) {
  const is19 = value < DIRECT19_MAX;

  b64Stream.pushBits(1, 1, 0, is19, type === "exclusive");
  pushValue(b64Stream, value, is19? 19 : 31);
}

function encodeDirect(b64Stream, type, values) {
  if (values.length === 0) {
    return;
  }

  for (const v of values) {
    encodeOneDirect(b64Stream, type, v);
  }
}

export function encodeNumberSet(type : NumberSetType, numbers: Set<number>) {
  const compact = new Array<number>;
  const extendedCompact = new Array<number>;
  const direct = new Array<number>;

  for (const n of numbers) {
    if (n < 0) {
      throw `Negative values not supported: ${n}`;
    }

    if (n < COMPACT_MAX) {
      compact.push(n);
    } else if (n < EXTENDED_COMPACT_MAX) {
      extendedCompact.push(n);
    } else if (n < DIRECT31_MAX) {
      direct.push(n);
    } else {
      throw `values too large: ${n}`;
    }
  }

  const b64Stream = new Base64Stream();
  encodeCompact(b64Stream, type, compact);
  encodeExtendedCompact(b64Stream, type, extendedCompact);
  encodeDirect(b64Stream, type, direct);

  return b64Stream.urlsafeEncode();
}
