// Helper functions to serialize and deserialize a dictionary to short short string suitable
// for use in a query parameter. The key and value are assumed to be URL safe.

// Ensure query parameters come back as an array of strings.
export function getParamAsStringArray(value) {
  if (Array.isArray(value)) {
    for (const v in value) {
      if (typeof v !== "string") {
        return [];
      }
    }
    return value;
  } else if (typeof value === "string") {
    return [value];
  }
  return [];
}

export function serializeSettingsDict(dict: Record<string, string>) {
  const values = new Array<string>();
  for (const [k, v] of Object.entries(dict)) {
    if (k.indexOf("~") !== -1) {
      throw `Unable to serialize ${k}`;
    }
    if (typeof v === "string" && v.indexOf(".") !== -1) {
      throw `Unable to serialize ${v}`;
    }
    if (v) {
      values.push(`${k}.${v}`);
    }
  }

  return values.join("~");
}

export function deserializeSettingsDict(serialized: string) {
  const parts = serialized.split("~");
  const dict = new Map<string, string>();
  for (const p of parts) {
    const firstColonIndex = p.indexOf(".");
    const key = p.substr(0, firstColonIndex);
    const value = p.substr(firstColonIndex + 1);
    dict[key] = value;
  }
  return dict;
}
