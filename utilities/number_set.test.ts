import { Filter, makeInternalNode, makeLeafNode } from "utilities/filter";
import { expect, jest, test } from "@jest/globals";

import { decodeNumberSet, encodeNumberSet, COMPACT_MAX, EXTENDED_COMPACT_MAX, DIRECT19_MAX, DIRECT31_MAX } from "utilities/number_set";

describe("number_set", () => {
  it("Disallows negatives", () => {
    expect(() => {
      encodeNumberSet("include", new Set([-1]))
    }).toThrow()
  });

  it("Disallows overlarge numbers", () => {
    expect(() => {
      encodeNumberSet("include", new Set([DIRECT31_MAX]))
    }).toThrow()
  });

  it("Encodes Compact numbers", () => {
    expect(encodeNumberSet("include", new Set([0]))).toEqual("IAgA");
    expect(encodeNumberSet("exclude", new Set([0]))).toEqual("YAgA");
    expect(encodeNumberSet("include", new Set([COMPACT_MAX - 1]))).toEqual("ABAB");
    expect(encodeNumberSet("exclude", new Set([COMPACT_MAX - 1]))).toEqual("QBAB");
  });

  it("Decodes Compact numbers", () => {
    expect(decodeNumberSet("IAgA")).toEqual({include: new Set([0])});
    expect(decodeNumberSet("YAgA")).toEqual({exclude: new Set([0])});
  });

  it("Encodes Full Range of ExtendedCompact numbers", () => {
    expect(encodeNumberSet("include", new Set([COMPACT_MAX]))).toEqual("gQgA");
    expect(encodeNumberSet("exclude", new Set([COMPACT_MAX]))).toEqual("oQgA");
    expect(encodeNumberSet("include", new Set([EXTENDED_COMPACT_MAX-1]))).toEqual("nhAB");
    expect(encodeNumberSet("exclude", new Set([EXTENDED_COMPACT_MAX-1]))).toEqual("vhAB");
  })

  it("Encodes multiple code pages of ExtendedCompact numbers", () => {
    expect(encodeNumberSet("include", new Set([COMPACT_MAX, COMPACT_MAX + 20,
                                                EXTENDED_COMPACT_MAX-1]))).toEqual("gYgAAInhAB");
    expect(encodeNumberSet("exclude", new Set([COMPACT_MAX, COMPACT_MAX + 20,
                                                EXTENDED_COMPACT_MAX-1]))).toEqual("oYgAAIvhAB");
  });

  it("Decodes multiple code pages of ExtendedCompact numbers", () => {
    expect(decodeNumberSet("gYgAAInhAB")).toEqual(
      {
        include: new Set([COMPACT_MAX, COMPACT_MAX + 20, EXTENDED_COMPACT_MAX - 1])
      }
    );
    expect(decodeNumberSet("oYgAAIvhAB")).toEqual(
      {
        exclude: new Set([COMPACT_MAX, COMPACT_MAX + 20, EXTENDED_COMPACT_MAX - 1])
      }
    );
  });

  it("Encodes Direct19 numbers", () => {
    expect(encodeNumberSet("include", new Set([EXTENDED_COMPACT_MAX]))).toEqual("wAAA");
    expect(encodeNumberSet("exclude", new Set([EXTENDED_COMPACT_MAX]))).toEqual("yAAA");
    expect(encodeNumberSet("include", new Set([DIRECT19_MAX-1]))).toEqual("x___");
    expect(encodeNumberSet("exclude", new Set([DIRECT19_MAX-1]))).toEqual("z___");

    expect(encodeNumberSet("include", new Set([EXTENDED_COMPACT_MAX, DIRECT19_MAX-1]))).toEqual(
      "wAAAx___");
    expect(encodeNumberSet("exclude", new Set([EXTENDED_COMPACT_MAX, DIRECT19_MAX-1]))).toEqual(
      "yAAAz___");
  });

  it("Encodes Direct31 numbers", () => {
    expect(encodeNumberSet("include", new Set([DIRECT19_MAX]))).toEqual("0AAAAA");
    expect(encodeNumberSet("exclude", new Set([DIRECT19_MAX]))).toEqual("2AAAAA");
    expect(encodeNumberSet("include", new Set([DIRECT31_MAX-1]))).toEqual("1_____");
    expect(encodeNumberSet("exclude", new Set([DIRECT31_MAX-1]))).toEqual("3_____");

    expect(encodeNumberSet("include", new Set([DIRECT31_MAX-1, DIRECT19_MAX]))).toEqual("0AAAAA1_____");
    expect(encodeNumberSet("exclude", new Set([DIRECT31_MAX-1, DIRECT19_MAX]))).toEqual("2AAAAA3_____");
  });

  it("Decodes Direct19 numbers", () => {
    expect(decodeNumberSet("wAAA")).toEqual({include: new Set([EXTENDED_COMPACT_MAX])});
    expect(decodeNumberSet("yAAA")).toEqual({exclude: new Set([EXTENDED_COMPACT_MAX])});
  });

  it("Decodes Direct31 numbers", () => {
    expect(decodeNumberSet("1_____")).toEqual({include: new Set([DIRECT31_MAX - 1])});
    expect(decodeNumberSet("2AAAAA")).toEqual({exclude: new Set([DIRECT19_MAX])});
  });

  it("Decodes Mashup of many values", () => {
    expect(decodeNumberSet("ABABYAgAvhABgQgAgYgAAInhABz___wAAA2AAAAA0AAAAA1_____")).toEqual(
      {
        include: new Set([
          COMPACT_MAX - 1,
          COMPACT_MAX,
          COMPACT_MAX + 20,
          EXTENDED_COMPACT_MAX - 1,
          EXTENDED_COMPACT_MAX,
          DIRECT19_MAX,
          DIRECT31_MAX - 1,
        ]),
        exclude: new Set([
          0,
          EXTENDED_COMPACT_MAX - 1,
          DIRECT19_MAX - 1,
          DIRECT19_MAX,
        ]),
      }
    );
  });
});
