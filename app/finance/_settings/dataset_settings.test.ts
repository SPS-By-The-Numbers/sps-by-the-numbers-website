import { expect, jest, test } from "@jest/globals";

import {
  DEFAULT_DATASET_SETTINGS,
  serializeDatasetSettings,
  deserializeDatasetSettings,
} from "app/finance/_settings/dataset_settings";

describe("metric_settings", () => {
  it("smoke test: values roundtrip.", () => {
    const setting = {
      id: 100,
      ccddd: 14005, // Aberdeen
      filterGrouping: 'ospi' as const,
      currencyNormalization: 'pctexp' as const,
      staffingNormalization: 'pctfte' as const,
      name: "incorrect",
    };
    const serialized = serializeDatasetSettings(setting);
    const restored = deserializeDatasetSettings(DEFAULT_DATASET_SETTINGS[0], serialized);
    expect(restored.ccddd).toEqual(setting.ccddd);
    expect(restored.filterGrouping).toEqual(setting.filterGrouping);
    expect(restored.currencyNormalization).toEqual(setting.currencyNormalization);
    expect(restored.staffingNormalization).toEqual(setting.staffingNormalization);
    expect(restored.name).toEqual('Aberdeen School District');  // Ensure name is filled by ccddd.
    expect(restored.id).toBe(0);  // Ensure ID is populated and reset.
  });
});
