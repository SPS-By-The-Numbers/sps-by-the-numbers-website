import { expect } from "@jest/globals";
import { linkForNode } from "utilities/sankey/deepLinks";

import ActivityFilter from "app/finance/_filteritems/activity";
import NcesFilter from "app/finance/_filteritems/nces";
import ObjectFilter from "app/finance/_filteritems/object";
import ProgramFilter from "app/finance/_filteritems/program";
import RevenueCategoryFilter from "app/finance/_filteritems/revenue_category";
import RevenueFilter from "app/finance/_filteritems/revenue";
import { makeSchoolFilter } from "app/finance/_filteritems/school";

import * as CommonSettings from "app/finance/_settings/common_settings";
import { DEFAULT_DATASET_SETTINGS } from "app/finance/_settings/dataset_settings";

import type { SankeyNode } from "utilities/sankey/types";

const CCDDD = 17001;
const CTX_CATEGORY = { ccddd: CCDDD, sourceMode: "category" as const };
const CTX_ACCOUNT = { ccddd: CCDDD, sourceMode: "account" as const };

function makeNode(
  level: SankeyNode["custom"]["level"],
  code: number | null,
  name = "Node",
): SankeyNode {
  return {
    id: `${level}:${code}`,
    name,
    color: "#000",
    column: 0,
    custom: { level, code },
  };
}

// Pulls the `d=` value back out of an href produced by `linkForNode`, for
// feeding into the real `deserializeDatasetSettings`/`deserializeByConfig`
// machinery.
function extractD(href: string): string {
  const match = href.match(/[?&]d=([^&]*)/);
  if (!match) {
    throw new Error(`no d= param in href: ${href}`);
  }
  return decodeURIComponent(match[1]);
}

function extractC(href: string): string {
  const match = href.match(/[?&]c=([^&]*)/);
  if (!match) {
    throw new Error(`no c= param in href: ${href}`);
  }
  return decodeURIComponent(match[1]);
}

describe("linkForNode", () => {
  it("source (category mode) -> /finance/revenues rc, facet 0", () => {
    const node = makeNode("source", 1000, "Local Taxes");
    const link = linkForNode(node, CTX_CATEGORY);
    expect(link).not.toBeNull();
    expect(link!.href.startsWith("/finance/revenues?d=")).toBe(true);
    expect(extractC(link!.href)).toBe("f.0");
    expect(link!.label).toBe("Explore Local Taxes");

    const d = extractD(link!.href);
    expect(d.startsWith(`c.${CCDDD}~rc.`)).toBe(true);
    const filterString = d.slice(`c.${CCDDD}~rc.`.length);
    expect(RevenueCategoryFilter.fromFilterString(filterString)).toEqual(
      new Set([1000]),
    );
  });

  it("source (account mode) -> /finance/revenues rv, facet 1", () => {
    const node = makeNode("source", 1100, "Local Property Tax");
    const link = linkForNode(node, CTX_ACCOUNT);
    expect(link).not.toBeNull();
    expect(link!.href.startsWith("/finance/revenues?d=")).toBe(true);
    expect(extractC(link!.href)).toBe("f.1");

    const d = extractD(link!.href);
    expect(d.startsWith(`c.${CCDDD}~rv.`)).toBe(true);
    const filterString = d.slice(`c.${CCDDD}~rv.`.length);
    expect(RevenueFilter.fromFilterString(filterString)).toEqual(
      new Set([1100]),
    );
  });

  it("program -> /finance/expenditures p, facet 1 -- full real-generator round trip", () => {
    const node = makeNode("program", 1, "Basic Education");
    const link = linkForNode(node, CTX_CATEGORY);
    expect(link).not.toBeNull();
    expect(link!.href.startsWith("/finance/expenditures?d=")).toBe(true);
    expect(extractC(link!.href)).toBe("f.1");

    const d = extractD(link!.href);
    expect(ProgramFilter.fromFilterString(d.split("~p.")[1])).toEqual(
      new Set([1]),
    );

    // Full round trip through the same generators
    // SERIALIZE_EXPENDITURES_SETTINGS_GENERATORS is built from
    // (makeDatasetSerializeConfig + makePaoSerializeConfig), confirming the
    // hand-composed `d` value deserializes exactly like the real page would
    // produce it.
    const defaultSettings = {
      ...DEFAULT_DATASET_SETTINGS[0],
      ...CommonSettings.makeDefaultDatasetSettings(CCDDD),
      ...CommonSettings.makeDefaultPaoSettings(),
    };
    const [deserialized] = CommonSettings.deserializeDatasetSettings(
      [d],
      [defaultSettings],
      [
        CommonSettings.makeDatasetSerializeConfig,
        CommonSettings.makePaoSerializeConfig,
      ],
    );
    expect(deserialized.programCodes).toEqual(new Set([1]));
    expect(deserialized.ccddd).toBe(CCDDD);
  });

  it("activity -> /finance/expenditures a, facet 0", () => {
    const node = makeNode("activity", 11, "Board of Directors");
    const link = linkForNode(node, CTX_CATEGORY);
    expect(link).not.toBeNull();
    expect(extractC(link!.href)).toBe("f.0");

    const d = extractD(link!.href);
    expect(ActivityFilter.fromFilterString(d.split("~a.")[1])).toEqual(
      new Set([11]),
    );
  });

  it("object -> /finance/expenditures o, facet 2 -- full real-generator round trip", () => {
    const node = makeNode("object", 2, "Certificated");
    const link = linkForNode(node, CTX_CATEGORY);
    expect(link).not.toBeNull();
    expect(extractC(link!.href)).toBe("f.2");

    const d = extractD(link!.href);
    expect(ObjectFilter.fromFilterString(d.split("~o.")[1])).toEqual(
      new Set([2]),
    );

    const defaultSettings = {
      ...DEFAULT_DATASET_SETTINGS[0],
      ...CommonSettings.makeDefaultDatasetSettings(CCDDD),
      ...CommonSettings.makeDefaultPaoSettings(),
    };
    const [deserialized] = CommonSettings.deserializeDatasetSettings(
      [d],
      [defaultSettings],
      [
        CommonSettings.makeDatasetSerializeConfig,
        CommonSettings.makePaoSerializeConfig,
      ],
    );
    expect(deserialized.objectCodes).toEqual(new Set([2]));
  });

  it("nces -> /finance/detailedactuals n, facet 4 -- viable (verified against DetailedActualsPage generators)", () => {
    const node = makeNode("nces", 110, "Salaries of Regular Employee");
    const link = linkForNode(node, CTX_CATEGORY);
    expect(link).not.toBeNull();
    expect(link!.href.startsWith("/finance/detailedactuals?d=")).toBe(true);
    expect(extractC(link!.href)).toBe("f.4");

    const d = extractD(link!.href);
    expect(NcesFilter.fromFilterString(d.split("~n.")[1])).toEqual(
      new Set([110]),
    );

    const defaultSettings = {
      ...DEFAULT_DATASET_SETTINGS[0],
      ...CommonSettings.makeDefaultDatasetSettings(CCDDD),
      ...CommonSettings.makeDefaultActualsSettings(CCDDD),
    };
    const [deserialized] = CommonSettings.deserializeDatasetSettings(
      [d],
      [defaultSettings],
      [
        CommonSettings.makeDatasetSerializeConfig,
        CommonSettings.makeNcesSerializeConfig,
      ],
    );
    expect(deserialized.ncesCodes).toEqual(new Set([110]));
  });

  it("school -> /finance/detailedactuals s, facet 3 -- viable (verified against DetailedActualsPage generators)", () => {
    const node = makeNode("school", 1002, "District Office");
    const link = linkForNode(node, CTX_CATEGORY);
    expect(link).not.toBeNull();
    expect(link!.href.startsWith("/finance/detailedactuals?d=")).toBe(true);
    expect(extractC(link!.href)).toBe("f.3");

    const d = extractD(link!.href);
    expect(makeSchoolFilter(CCDDD).fromFilterString(d.split("~s.")[1])).toEqual(
      new Set([1002]),
    );

    const defaultSettings = {
      ...DEFAULT_DATASET_SETTINGS[0],
      ...CommonSettings.makeDefaultDatasetSettings(CCDDD),
      ...CommonSettings.makeDefaultActualsSettings(CCDDD),
    };
    const [deserialized] = CommonSettings.deserializeDatasetSettings(
      [d],
      [defaultSettings],
      [
        CommonSettings.makeDatasetSerializeConfig,
        CommonSettings.makeSchoolFilterConfig,
      ],
    );
    expect(deserialized.schoolCodes).toEqual(new Set([1002]));
  });

  it("fund balance drawdown/growth nodes have no link", () => {
    expect(
      linkForNode(
        makeNode("fundBalance", null, "Fund Balance Drawdown"),
        CTX_CATEGORY,
      ),
    ).toBeNull();
    expect(
      linkForNode(
        makeNode("fundBalance", null, "Fund Balance Growth"),
        CTX_CATEGORY,
      ),
    ).toBeNull();
  });

  it("filtered-out nodes have no link", () => {
    expect(
      linkForNode(makeNode("filtered", null, "Filtered Out"), CTX_CATEGORY),
    ).toBeNull();
  });

  it("defensively returns null for any node whose code is null regardless of level", () => {
    // Shouldn't happen in practice (only fb:*/flt:* carry a null code), but
    // the null check is the primary guard and should hold regardless of
    // `level`.
    expect(
      linkForNode(makeNode("program", null, "?"), CTX_CATEGORY),
    ).toBeNull();
  });
});
