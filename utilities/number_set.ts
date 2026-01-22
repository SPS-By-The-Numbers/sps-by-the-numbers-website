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

type FilterType = "include" | "exclude";
type DecodedNumberSets = {include?: Set<number>, exclude?: Set<number>};
type DecodedNumberArray = [FilterType, Array<number>];

const BLOCK_SIZE : number = 12;
const CODEPAGE_SIZE : number = 5 * 12;

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

function readValue(b64Reader: Base64Reader, numBits) {
  let result = 0;
  for (let i = 0; i < numBits; i++) {
    result = result << 1 | b64Reader.nextBit();
  }
  return result;
}

function directFormatConfig(is31) {
  if (is31) {
    return { bits: 31, offset: DIRECT19_MAX};
  }

  return { bits: 19, offset: EXTENDED_COMPACT_MAX};
}

function encodeBlocks(b64Stream, numBlocks, blockStart, values) {
  // Construct all data blocks.
  const blocks = new Array<number>(numBlocks);
  blocks.fill(0, 0, numBlocks);
  for (const v of values) {
    const offsetValue = (v - blockStart);
    const blockNumber = Math.trunc(offsetValue / BLOCK_SIZE);
    const bit = offsetValue % BLOCK_SIZE;
    blocks[blockNumber] = blocks[blockNumber] | (1 << ((BLOCK_SIZE - 1) - bit));
  }

  // Ouptut the BlockMask by iterating over all blocks.
  for (const blockValue of blocks) {
    b64Stream.pushBits(blockValue !== 0);
  }

  // Now to push the data into the stream.
  for (const blockValue of blocks) {
    if (blockValue !== 0) {
      pushValue(b64Stream, blockValue, BLOCK_SIZE);
    }
  }
}

function encodeCompact(b64Stream, filterType, values) {
  if (values.length === 0) {
    return;
  }

  // Write header.
  b64Stream.pushBits(0, filterType === "exclude");

  // Write block mask + data.
  encodeBlocks(b64Stream, 10, 0, values);
}

function encodeOneCodepage(b64Stream, filterType, page, values) {
  if (values.length === 0) {
    return;
  }

  // Write header.
  b64Stream.pushBits(1, 0, filterType === "exclude");

  // Write codepage number.
  pushValue(b64Stream, page, 4);

  // Write block mask + data.
  encodeBlocks(b64Stream, 5, 120 + (page * CODEPAGE_SIZE), values);
}

function encodeExtendedCompact(b64Stream, filterType, values) {
  if (values.length === 0) {
    return;
  }

  const codepages = new Array<Array<number>>;
  for (let i = 0; i < 16; i++) {
    codepages.push(new Array<number>());
  }

  for (const v of values) {
    // Each codepage is 60 bytes starting at 120.
    const cp = Math.trunc((v - COMPACT_MAX)/CODEPAGE_SIZE);
    codepages[cp].push(v);
  }

  for (let i = 0; i < 16; i++) {
    encodeOneCodepage(b64Stream, filterType, i, codepages[i]);
  }
}

function encodeOneDirect(b64Stream, filterType, value) {
  const is31 = value >= DIRECT19_MAX;
  const {bits, offset} = directFormatConfig(is31);

  b64Stream.pushBits(1, 1, 0, is31, filterType === "exclude");
  pushValue(b64Stream, (value - offset), bits);
}

function encodeDirect(b64Stream, filterType, values) {
  if (values.length === 0) {
    return;
  }

  for (const v of values) {
    encodeOneDirect(b64Stream, filterType, v);
  }
}

export function encodeNumberSet(filterType : FilterType, numbers: Set<number>) {
  const compact = new Array<number>;
  const extendedCompact = new Array<number>;
  const direct = new Array<number>;
  const sortedNumbers = [...numbers].sort((a,b) => a-b);

  for (const n of sortedNumbers) {
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
  encodeCompact(b64Stream, filterType, compact);
  encodeExtendedCompact(b64Stream, filterType, extendedCompact);
  encodeDirect(b64Stream, filterType, direct);

  return b64Stream.urlsafeEncode();
}

function decodeFilterType(b64Reader: Base64Reader) : FilterType {
  return b64Reader.nextBit() ? 'exclude' as const : 'include' as const;
}

function decodeBlock(block, start, numbers) {
  const startMask = 1 << (BLOCK_SIZE - 1);
  for (let i = 0; i < BLOCK_SIZE; i++) {
    const mask = startMask >>> i; 
    if ((block & mask) !== 0) {
      numbers.push(start + i);
    }
  }
}

function decodeBlockMaskAndData(b64Reader: Base64Reader, numBlocks, offset, result) {
  const blockStarts = new Array<number>;
  for (let i = 0; i < numBlocks; i++) {
    if (b64Reader.nextBit()) {
      // The start of each block is the map mask is a multiple of BLOCK_SIZE.
      blockStarts.push(offset + (i * BLOCK_SIZE));
    }
  }

  const blocks = new Array<number>;
  for (let i = 0; i < blockStarts.length; i++) {
    blocks.push(readValue(b64Reader, BLOCK_SIZE));
  }

  for (let i = 0; i < blockStarts.length; i++) {
    decodeBlock(blocks[i], blockStarts[i], result);
  }
}

function decodeCompact(b64Reader: Base64Reader) : DecodedNumberArray {
  const result = new Array<number>();

  const filterType = decodeFilterType(b64Reader);

  // Decode 10 blocks at offset 0.
  decodeBlockMaskAndData(b64Reader, 10, 0, result);
  return [filterType, result];
}

function decodeExtendedCompact(b64Reader: Base64Reader) : DecodedNumberArray {
  const result = new Array<number>();

  const filterType = decodeFilterType(b64Reader);
  const codepage = readValue(b64Reader, 4);
  const offset = codepage * CODEPAGE_SIZE + COMPACT_MAX;
  decodeBlockMaskAndData(b64Reader, 5, offset, result);

  return [filterType, result];
}

function decodeDirect(b64Reader: Base64Reader) : DecodedNumberArray {
  const {bits, offset} = directFormatConfig(b64Reader.nextBit());

  const filterType = decodeFilterType(b64Reader);
  const value = offset + readValue(b64Reader, bits);
  return [filterType, [value]];
}

export function decodeNumberSet(encoded: string) : DecodedNumberSets {
  const allDecoded = new Array<DecodedNumberArray>;

  const b64Reader = new Base64Reader(encoded);
  while (!b64Reader.done()) {
    if (!b64Reader.nextBit()) {
      // Compact form starts with 0
      allDecoded.push(decodeCompact(b64Reader));
    } else {
      if (!b64Reader.nextBit()) {
        // ExtendedCompact form starts with 1 0
        allDecoded.push(decodeExtendedCompact(b64Reader));
      } else {
        if (!b64Reader.nextBit()) {
          // Direct Starts form starts with 1 1 0
          allDecoded.push(decodeDirect(b64Reader));
        } else {
          // Reserved header 1 1 1 found.
          throw "Reserved header cannot be used";
        }
      }
    }
  }

  // Combine and sort the results.
  const includedNums = (allDecoded.filter(e => e[0] === 'include')
                        .flatMap(([_,v]) => v)
                        .sort((a,b) => a-b));
  const excludedNums = (allDecoded.filter(e => e[0] === 'exclude')
                        .flatMap(([_,v]) => v)
                        .sort((a,b) => a-b));

  const result : DecodedNumberSets = {};
  if (includedNums.length > 0) {
    result.include = new Set(includedNums);
  }
  if (excludedNums.length > 0) {
    result.exclude = new Set(excludedNums);
  }

  return result;
}
