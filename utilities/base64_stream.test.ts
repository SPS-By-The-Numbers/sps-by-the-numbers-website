import { expect, jest, test } from "@jest/globals";
import { Base64Stream } from "utilities/base64_stream";

describe("base64_stream", () => {
  it("Encodes nothing to emptystring", () => {
    const b64Stream = new Base64Stream();
    expect(b64Stream.urlsafeEncode()).toEqual("");
  });

  it("Basic smoke test", () => {
    const b64Stream = new Base64Stream();

    // First bit is 0 gets A.
    b64Stream.pushBits(0);
    expect(b64Stream.urlsafeEncode()).toEqual("A");

    // 5 more 0 bits still gets an A.
    b64Stream.pushBits(0, 0, 0, 0, 0);
    expect(b64Stream.urlsafeEncode()).toEqual("A");

    // Inserting one more bit, making it 7, gets 2 Base64 digits.
    b64Stream.pushBits(0);
    expect(b64Stream.urlsafeEncode()).toEqual("AA");

    // Inserting a true bit will set the second higest bit in the second
    // digit high. That would be 0b010000 or 0x10
    b64Stream.pushBits(1);
    expect(b64Stream.urlsafeEncode()).toEqual("AQ");

    // Fill the next 4 with ones and it should become 0x1F
    b64Stream.pushBits(1, 1, 1, 1);
    expect(b64Stream.urlsafeEncode()).toEqual("Af");

    // Fill in all 6 1s to get one more base64 digit that is the last in value if _.
    for (let i = 0; i < 6; i++) {
      b64Stream.pushBits(true);
    }

    expect(b64Stream.urlsafeEncode()).toEqual("Af_");
  });
});
