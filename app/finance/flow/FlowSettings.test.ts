import { expect } from "@jest/globals";

import {
  serializeDatasetSettings,
  deserializeDatasetSettings,
} from "app/finance/_settings/common_settings";
import {
  DEFAULT_FLOW_SETTINGS,
  SERIALIZE_FLOW_SETTINGS_GENERATORS,
  deserializeLevelPlan,
  enabledLevelsFromPlan,
  serializeLevelPlan,
} from "app/finance/flow/FlowSettings";
import ProgramFilter from "app/finance/_filteritems/program";

import type { LevelPlan } from "app/finance/flow/FlowSettings";
import type { Level } from "utilities/sankey/types";

function plan(entries: Array<[Level, boolean]>): LevelPlan {
  return entries.map(([level, enabled]) => ({ level, enabled }));
}

describe("FlowSettings level plan", () => {
  it("encodes enabled state (case) and order; default serializes to empty", () => {
    // Default plan is omitted from the URL.
    expect(serializeLevelPlan(DEFAULT_FLOW_SETTINGS[0].levelPlan)).toEqual("");

    // Enabling Object + School (order unchanged) => RP A O n S.
    expect(
      serializeLevelPlan(
        plan([
          ["source", true],
          ["program", true],
          ["activity", true],
          ["object", true],
          ["nces", false],
          ["school", true],
        ]),
      ),
    ).toEqual("RPAOnS");

    // Disabling Resource (Source) and reordering School before Activity.
    expect(
      serializeLevelPlan(
        plan([
          ["source", false],
          ["program", true],
          ["school", true],
          ["activity", true],
          ["object", false],
          ["nces", false],
        ]),
      ),
    ).toEqual("rPSAon");
  });

  it("deserialize round-trips order + enabled and pins Resource/Program", () => {
    const restored = deserializeLevelPlan("rPSAon");
    expect(restored).toEqual(
      plan([
        ["source", false],
        ["program", true],
        ["school", true],
        ["activity", true],
        ["object", false],
        ["nces", false],
      ]),
    );

    // Resource/Program are always pinned to the front even if the URL puts a
    // reorderable first, and any level missing from the URL is filled in
    // (canonical order, default-enabled state).
    const junky = deserializeLevelPlan("O"); // only "object enabled" mentioned
    expect(junky.map((e) => e.level)).toEqual([
      "source",
      "program",
      "object",
      "activity",
      "nces",
      "school",
    ]);
    expect(junky[0]).toEqual({ level: "source", enabled: true });
    expect(junky[1]).toEqual({ level: "program", enabled: true });
    expect(junky[2]).toEqual({ level: "object", enabled: true });
  });

  it("Program can never be disabled, even via a hand-crafted URL", () => {
    // "rp" tries to disable both Resource and Program; only Resource obeys.
    const restored = deserializeLevelPlan("rp");
    const program = restored.find((e) => e.level === "program");
    const source = restored.find((e) => e.level === "source");
    expect(program!.enabled).toBe(true);
    expect(source!.enabled).toBe(false);
  });

  it("enabledLevelsFromPlan returns the enabled levels in order", () => {
    expect(enabledLevelsFromPlan(deserializeLevelPlan("rPSAon"))).toEqual([
      "program",
      "school",
      "activity",
    ]);
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
    expect(serialized).not.toContain("cs.");
    expect(serialized).not.toContain("pt.");
  });

  it("full settings round-trip through the URL", () => {
    const programSubset = new Set([...ProgramFilter.allCodes()].slice(0, 2));
    const modifiedPlan = plan([
      ["source", false],
      ["program", true],
      ["school", true],
      ["activity", true],
      ["object", false],
      ["nces", false],
    ]);
    const modified = {
      ...DEFAULT_FLOW_SETTINGS[0],
      levelPlan: modifiedPlan,
      sourceMode: "account" as const,
      classOf: 2025,
      dataType: "budget" as const,
      programCodes: programSubset,
      coalesce: true,
      highlightPta: true,
    };

    const serialized = serializeDatasetSettings(
      [modified],
      SERIALIZE_FLOW_SETTINGS_GENERATORS,
    );
    // The custom vars are present in the URL fragment.
    expect(serialized[0]).toContain("lv.rPSAon");
    expect(serialized[0]).toContain("sm.a");
    expect(serialized[0]).toContain("y.2025");
    expect(serialized[0]).toContain("dt.b");
    expect(serialized[0]).toContain("cs.1");
    expect(serialized[0]).toContain("pt.1");

    const [restored] = deserializeDatasetSettings(
      serialized,
      DEFAULT_FLOW_SETTINGS,
      SERIALIZE_FLOW_SETTINGS_GENERATORS,
    );

    expect(restored.levelPlan).toEqual(modifiedPlan);
    expect(restored.sourceMode).toEqual("account");
    expect(restored.classOf).toEqual(2025);
    expect(restored.dataType).toEqual("budget");
    expect(restored.programCodes).toEqual(programSubset);
    expect(restored.coalesce).toBe(true);
    expect(restored.highlightPta).toBe(true);
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
    expect(restored.levelPlan).toEqual(DEFAULT_FLOW_SETTINGS[0].levelPlan);
  });
});
