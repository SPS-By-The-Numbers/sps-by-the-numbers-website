import { expect, test } from "@jest/globals";

import {
  serializeDatasetSettings,
  deserializeDatasetSettings,
} from "app/finance/_settings/common_settings";
import {
  DEFAULT_FLOW_SETTINGS,
  SERIALIZE_FLOW_SETTINGS_GENERATORS,
  deserializeEnabledLevels,
  serializeEnabledLevels,
} from "app/finance/flow/FlowSettings";
import ProgramFilter from "app/finance/_filteritems/program";

import type { Level } from "utilities/sankey/types";

describe("FlowSettings", () => {
  it("enabled-level letters round-trip and ignore junk", () => {
    expect(serializeEnabledLevels(new Set<Level>())).toEqual("");
    expect(serializeEnabledLevels(new Set<Level>(["object"]))).toEqual("o");
    // Always emitted in canonical order regardless of insertion order.
    expect(
      serializeEnabledLevels(new Set<Level>(["school", "object", "nces"])),
    ).toEqual("ons");

    expect(deserializeEnabledLevels("")).toEqual(new Set());
    expect(deserializeEnabledLevels("os")).toEqual(
      new Set<Level>(["object", "school"]),
    );
    // Unknown letters are ignored.
    expect(deserializeEnabledLevels("oxz")).toEqual(new Set<Level>(["object"]));
  });

  it("defaults omit the flow-only url vars", () => {
    const [serialized] = serializeDatasetSettings(
      DEFAULT_FLOW_SETTINGS,
      SERIALIZE_FLOW_SETTINGS_GENERATORS,
    );
    expect(serialized).not.toContain("lv.");
    expect(serialized).not.toContain("sm.");
    expect(serialized).not.toContain("y.");
    expect(serialized).not.toContain("dt.");
  });

  it("full settings round-trip through the URL", () => {
    const programSubset = new Set([...ProgramFilter.allCodes()].slice(0, 2));
    const modified = {
      ...DEFAULT_FLOW_SETTINGS[0],
      enabledLevels: new Set<Level>(["object", "school"]),
      sourceMode: "account" as const,
      classOf: 2025,
      dataType: "budget" as const,
      programCodes: programSubset,
    };

    const serialized = serializeDatasetSettings(
      [modified],
      SERIALIZE_FLOW_SETTINGS_GENERATORS,
    );
    // The four custom vars are present in the URL fragment.
    expect(serialized[0]).toContain("lv.os");
    expect(serialized[0]).toContain("sm.a");
    expect(serialized[0]).toContain("y.2025");
    expect(serialized[0]).toContain("dt.b");

    const [restored] = deserializeDatasetSettings(
      serialized,
      DEFAULT_FLOW_SETTINGS,
      SERIALIZE_FLOW_SETTINGS_GENERATORS,
    );

    expect(restored.enabledLevels).toEqual(
      new Set<Level>(["object", "school"]),
    );
    expect(restored.sourceMode).toEqual("account");
    expect(restored.classOf).toEqual(2025);
    expect(restored.dataType).toEqual("budget");
    expect(restored.programCodes).toEqual(programSubset);
  });

  it("latest year (null classOf) and category mode round-trip as defaults", () => {
    const [restored] = deserializeDatasetSettings(
      serializeDatasetSettings(
        DEFAULT_FLOW_SETTINGS,
        SERIALIZE_FLOW_SETTINGS_GENERATORS,
      ),
      DEFAULT_FLOW_SETTINGS,
      SERIALIZE_FLOW_SETTINGS_GENERATORS,
    );
    expect(restored.classOf).toBeNull();
    expect(restored.sourceMode).toEqual("category");
    expect(restored.dataType).toEqual("actuals");
    expect(restored.enabledLevels).toEqual(new Set());
  });
});
