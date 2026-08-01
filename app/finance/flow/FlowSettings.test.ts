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
  groupTokenForNodeId,
  otherGroupToken,
  schoolGroupToken,
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
    expect(serialized).not.toContain("scm.");
    expect(serialized).not.toContain("sy.");
    expect(serialized).not.toContain("xg.");
  });

  it("builds group tokens that survive the settings URL encoding", () => {
    // Tokens may not contain "." or "~" (see utilities/settings.ts) -- the
    // school ones are derived from node ids that do.
    expect(otherGroupToken("activity")).toEqual("other-a");
    expect(schoolGroupToken("sbucket:3")).toEqual("sbucket-3");
    expect(schoolGroupToken("sregion:North East")).toEqual(
      "sregion-North-East",
    );
    for (const t of [
      otherGroupToken("school"),
      schoolGroupToken("sregion:North East"),
    ]) {
      expect(t).toMatch(/^[A-Za-z0-9-]+$/);
    }
  });

  it("maps a collapsed node id to its group token, and nothing else", () => {
    // The engine's per-level "Other …" node -- keyed by LEVEL, since its own id
    // carries a column that moves when levels are reordered.
    expect(groupTokenForNodeId("other:2", "activity")).toEqual("other-a");
    expect(groupTokenForNodeId("sbucket:3", "school")).toEqual("sbucket-3");
    expect(groupTokenForNodeId("smsg:12", "school")).toEqual("smsg-12");
    // Ordinary nodes are not groups.
    expect(groupTokenForNodeId("act:27", "activity")).toBeNull();
    expect(groupTokenForNodeId("flt:2", "filtered")).toBeNull();
    expect(groupTokenForNodeId("other:0", "filtered")).toBeNull();
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
      coalesceLevels: new Set<Level>(["activity", "school"]),
      schoolCoalesceMode: "ms" as const,
      schoolSizeYear: 2019,
      highlightPta: true,
      expandedGroups: new Set(["other-a", "smsg-12"]),
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
    // cs encodes the EXPANDED (complement) levels: coalescing {activity,school}
    // means the other four (source/program/object/nces) are expanded => "rpon".
    expect(serialized[0]).toContain("cs.rpon");
    expect(serialized[0]).toContain("pt.1");
    expect(serialized[0]).toContain("scm.m"); // ms mode
    expect(serialized[0]).toContain("sy.2019");
    expect(serialized[0]).toContain("xg.other-a_smsg-12");

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
    expect(restored.coalesceLevels).toEqual(
      new Set<Level>(["activity", "school"]),
    );
    expect(restored.schoolCoalesceMode).toEqual("ms");
    expect(restored.schoolSizeYear).toEqual(2019);
    expect(restored.highlightPta).toBe(true);
    expect(restored.expandedGroups).toEqual(new Set(["other-a", "smsg-12"]));
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
