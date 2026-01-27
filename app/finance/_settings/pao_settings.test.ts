import { expect, jest, test } from "@jest/globals";

import {
  DEFAULT_PA_FILTER_SETTINGS,
  DEFAULT_PAO_FILTER_SETTINGS,
  serializePAFilterSettings,
  deserializePAFilterSettings,
  serializePAOFilterSettings,
  deserializePAOFilterSettings,
} from "app/finance/_settings/pao_settings";

describe("PAFilterSettings", () => {
  it("smoke test: values roundtrip.", () => {
    const serialized = serializePAFilterSettings(DEFAULT_PA_FILTER_SETTINGS);
    expect(serialized.length).not.toEqual(0);
    const restored = deserializePAFilterSettings(DEFAULT_PA_FILTER_SETTINGS, serialized);
    expect(restored.programs).toEqual(DEFAULT_PA_FILTER_SETTINGS.programs);
  });
});
