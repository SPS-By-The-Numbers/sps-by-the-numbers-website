import { Filter, makeInternalNode, makeLeafNode } from "utilities/filter";
import { expect, jest, test } from "@jest/globals";

import { encodeNumberSet, COMPACT_MAX, EXTENDED_COMPACT_MAX, DIRECT19_MAX, DIRECT31_MAX } from "utilities/number_set";

describe("number_set", () => {
  it("Disallows negatives", () => {
    expect(() => {
      encodeNumberSet("inclusive", new Set([-1]))
    }).toThrow()
  });

  it("Disallows overlarge numbers", () => {
    expect(() => {
      encodeNumberSet("inclusive", new Set([DIRECT31_MAX]))
    }).toThrow()
  });

  it("Encodes Compact numbers", () => {
    expect(encodeNumberSet("inclusive", new Set([1, 2]))).toEqual("IAAG");
    expect(encodeNumberSet("exclusive", new Set([1, 2]))).toEqual("YAAG");
  });

  it("Encodes ExtendedCompact numbers", () => {
    expect(encodeNumberSet("inclusive", new Set([COMPACT_MAX]))).toEqual("0AQ4");
    expect(encodeNumberSet("exclusive", new Set([COMPACT_MAX]))).toEqual("2AQ4");
  });

  it("Encodes Direct19 numbers", () => {
    expect(encodeNumberSet("inclusive", new Set([EXTENDED_COMPACT_MAX]))).toEqual("0AQ4");
    expect(encodeNumberSet("exclusive", new Set([EXTENDED_COMPACT_MAX]))).toEqual("2AQ4");
  });

  it("Encodes Direct31 numbers", () => {
    expect(encodeNumberSet("inclusive", new Set([DIRECT19_MAX]))).toEqual("wACAQ4");
    expect(encodeNumberSet("exclusive", new Set([DIRECT19_MAX]))).toEqual("yACAQ4");
  });
});
