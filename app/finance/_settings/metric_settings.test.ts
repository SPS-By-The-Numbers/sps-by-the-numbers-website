import { expect, jest, test } from "@jest/globals";

import {
  DEFAULT_METRIC_SETTINGS,
  serializeOneMetricSettings,
  deserializeOneMetricSettings,
} from "app/finance/_settings/metric_settings";

describe("metric_settings", () => {
  it("smoke test: default roundtrips.", () => {
    const setting = {
      id: 100,
      ccddd: 14005, // Aberdeen
      filterGrouping: 'ospi' as const,
      currencyNormalization: 'pctexp' as const,
      staffingNormalization: 'pctfte' as const,
      name: "incorrect",
    };
    const serlialized = serializeOneMetricSettings(setting);
    const restored = deserializeOneMetricSettings(DEFAULT_METRIC_SETTINGS[0], serlialized);
    expect(restored.ccddd).toEqual(setting.ccddd);
    expect(restored.filterGrouping).toEqual(setting.filterGrouping);
    expect(restored.currencyNormalization).toEqual(setting.currencyNormalization);
    expect(restored.staffingNormalization).toEqual(setting.staffingNormalization);
    expect(restored.name).toEqual('Aberdeen School District');  // Ensure name is filled by ccddd.
    expect(restored.id).toBe(0);  // Ensure ID is populated and reset.
  });
});
