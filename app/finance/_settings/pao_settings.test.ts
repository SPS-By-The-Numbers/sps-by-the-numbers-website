import { expect, jest, test } from "@jest/globals";

import {
  DEFAULT_PA_FILTERS,
  DEFAULT_PAO_FILTERS,
  serializePAFilters,
  deserializePAFilters,
  serializePAOFilters,
  deserializePAOFilters,
} from "app/finance/_settings/pao_settings";

describe("PAFilters", () => {
  it("smoke test: values roundtrip.", () => {
    // Do a better test here.
    const serialized = serializePAFilters(DEFAULT_PA_FILTERS);
    expect(serialized.length).not.toEqual(0);
    const restored = deserializePAFilters(DEFAULT_PA_FILTERS, serialized);
    expect(restored.programCodes).toEqual(DEFAULT_PA_FILTERS.programCodes);
    expect(restored.activityCodes).toEqual(DEFAULT_PA_FILTERS.activityCodes);
  });
});

// TODO: Test PAOFilters.
