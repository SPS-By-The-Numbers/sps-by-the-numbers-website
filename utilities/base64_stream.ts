const WEBSAFE_BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const WEBSAFE_BASE64_DICT = Object.fromEntries([...WEBSAFE_BASE64].map((v,i) => [v, i]));

const MAX_BITS_IN_BYTE = 6;  // One base64 digit represents 6 bits.

type Bit = 0 | 1;

// This class lets one push bits in one end and outputs Web-safe Base64
// encodings of those bit patterns without padding. Bits are pushed from
// msb down.
//
// All native implemenations to 8-bits or 16-bits which is annoying. This
// just lets us stream out bits in 6-bit letters from the WEBSAFE_BASE64
// alphabet.
export class Base64Stream {
  private encoded : Array<number> = new Array<number>();
  private bitsFilled : number = 0;
  private currentByte : number = 0;

  pushBits(...bits : Array<boolean | number>) {
    for (const b of bits) {
      this.pushOneBit(b);
    }
  }

  private pushOneBit(bit : boolean | number) {
    if (this.bitsFilled >= MAX_BITS_IN_BYTE) {
      this.encoded.push(this.currentByte);
      this.currentByte = 0;
      this.bitsFilled = 0;
    }

    this.bitsFilled++;
    this.currentByte = (this.currentByte << 1) | (bit ? 1 : 0);
  }

  urlsafeEncode() {
    let retval = "";
    const toEncode = [...this.encoded, ...this.getLastByte()];

    for (const b64Digit of toEncode) {
      retval += WEBSAFE_BASE64[b64Digit];
    }

    return retval;
  }

  encodedLength() : number {
    return this.encoded.length + (this.bitsFilled > 0 ? 1 : 0);
  }

  // Returns last byte as an array if it exists with bits padded for output.
  // Empty array returned otherwise.
  private getLastByte() {
    if (this.bitsFilled === 0) {
      return [];
    }

    const shiftedBytes = this.currentByte << (MAX_BITS_IN_BYTE - this.bitsFilled);
    return [shiftedBytes];
  }
}

export class Base64Reader {
  inString: string;
  cursor: number = 0;

  constructor(s: string) {
    this.inString = s;
  }

  done() : boolean {
    return this.cursor >= (this.inString.length * 6);
  }

  nextBit() : Bit {
    if (this.done()) {
      throw "Iterator overrun";
    }

    const bucket = Math.trunc(this.cursor / 6);
    const position = this.cursor % 6;
    const base64Letter = this.inString[bucket];
    const val = WEBSAFE_BASE64_DICT[base64Letter];
    const mask = 1 << (6 - position - 1);
    const result = (val & mask) ? 1: 0;
    this.cursor++;
    return result;
  }
}

