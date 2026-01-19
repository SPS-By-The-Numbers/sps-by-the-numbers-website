// All implementations pad to a byte or an in and this is just a stream of bits.
const WEBSAFE_BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

const MAX_BITS_IN_BYTE = 6;  // One base64 digit represents 6 bits.

// This class lets one push bits in one end and outputs Web-safe Base64
// encodings of those bit patterns without padding. Bits are pushed from
// msb down.
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
