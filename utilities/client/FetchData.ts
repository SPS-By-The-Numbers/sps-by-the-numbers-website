import { fetchEndpoint } from "utilities/client/endpoint";
import avro from "avsc/etc/browser/avsc";
import * as aq from "arquero";

// Code for DecimalType taken from here
// https://github.com/mtth/avsc/issues/287#issuecomment-600398817

// Decimal is a numeric type which allows greater control
// over scale and precision than JavaScript's primitive "number"
export class Decimal {
  constructor(
    public readonly unscaled: bigint,
    public readonly precision = 38,
    public readonly scale = 9,
  ) {}
  public toNumber(): number {
    const scaleMultiplier = 10n ** BigInt(this.scale);
    const fractional =
      Number(this.unscaled % scaleMultiplier) * Math.pow(10, -this.scale);
    const wholeNumbers = this.unscaled / scaleMultiplier;
    if (
      wholeNumbers < Number.MIN_SAFE_INTEGER ||
      wholeNumbers > Number.MAX_SAFE_INTEGER
    ) {
      throw `${this.unscaled} too large!`;
    }
    const result = Number(wholeNumbers) + fractional;
    return result;
  }
}

class DecimalType extends avro.types.LogicalType {
  protected precision: number;
  protected scale: number;

  constructor(schema: avro.Schema, opts?: any) {
    super(schema, opts);

    // make typescript happy
    const s = schema as avro.schema.LogicalTypeExtension;

    // parse precision
    if (!s.precision || s.precision !== (s.precision | 0) || s.precision <= 0) {
      throw new Error("invalid precision");
    }

    // parse scale
    if (s.scale !== (s.scale | 0) || s.scale < 0 || s.scale > s.precision) {
      throw new Error("invalid scale");
    }

    // determine if we can work with the specified precision
    if (avro.Type.isType(super.underlyingType, "fixed")) {
      const size = (super.underlyingType as avro.types.FixedType).size;
      const maxPrecision =
        Math.log(Math.pow(2, 8 * size - 1) - 1) / Math.log(10);
      if (s.precision > (maxPrecision | 0)) {
        throw new Error("fixed size too small to hold required precision");
      }
    }

    this.precision = s.precision;
    this.scale = s.scale;
  }

  // convert Buffer to Decimal
  protected _fromValue(rawVal: Buffer): any {
    if (rawVal.length != 16) {
      throw "Expected 128-bit buffers to back a decimal";
    }
    const first64Bits = rawVal.subarray(0, 8);

    if (
      !first64Bits.every((n) => n === 0) &&
      !first64Bits.every((n) => n === 255)
    ) {
      throw "Cannot handle numbers > 64-bit";
    }

    const upper = BigInt(rawVal.readInt32BE(8));
    // HACK: Should the lower word always be a uint? Think through this.
    const lower = BigInt(rawVal.readUint32BE(12));
    const value = (upper << 32n) + lower;

    return new Decimal(value, this.precision, this.scale);
  }
}

class DecimalToNumberType extends DecimalType {
  protected _fromValue(val: Buffer): any {
    return super._fromValue(val).toNumber();
  }
}

export async function fetchDatasetUrl(ccddd: string, dataset: string) {
  const datasetResponse = await fetchEndpoint("finance", "GET", {
    ccddd,
    dataset,
  });
  if (!datasetResponse.ok) {
    console.error(datasetResponse);
    throw "Unable to read data";
  }

  return datasetResponse.data;
}

export async function avroToDf(dataUrl) {
  const response = await fetch(dataUrl);
  const data = new Array<object>();

  let metadata: any;
  const blob = await response.blob();
  await new Promise((resolve, reject) => {
    avro
      .createBlobDecoder(blob, {
        parseHook: (schema) =>
          avro.Type.forSchema(schema, {
            logicalTypes: { decimal: DecimalToNumberType },
          }),
      })
      .on("metadata", (v) => {
        metadata = v;
      })
      .on("data", (row) => data.push(row))
      .on("end", () => resolve(true))
      .on("error", (err) => {
        console.error(err);
        reject(false);
      });
  });

  // HACK: This type conversion is completely wrong and arises because arquero fromJSON
  // does not correctly accept object[].
  const df = aq.fromJSON(data as unknown as string, { type: "rows" });
  return df;
}

export async function fetchDataset(ccddd, dataset) {
  const { dataUrl } = await fetchDatasetUrl(ccddd, dataset);

  return await avroToDf(dataUrl);
}
