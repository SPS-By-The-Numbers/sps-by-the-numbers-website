import { expect, jest, test } from "@jest/globals";

import {
  DEFAULT_DATASET_SETTINGS,
  serializeFilterGrouping,
  deserializeFilterGrouping,
} from "app/finance/_settings/dataset_settings";

describe("metric_settings", () => {
  it("golden test: values roundtrip.", () => {
    expect(serializeFilterGrouping("spsbtn")).toEqual("spsbtn");
    expect(serializeFilterGrouping("ospi")).toEqual("ospi");
    expect(deserializeFilterGrouping("spsbtn")).toEqual("spsbtn");
    expect(deserializeFilterGrouping("ospi")).toEqual("ospi");
    expect(deserializeFilterGrouping("garbage")).toEqual("spsbtn");
  });
});
