import { expect } from "@jest/globals";
import { linksForNode } from "utilities/sankey/deepLinks";

import ActivityFilter from "app/finance/_filteritems/activity";
import NcesFilter from "app/finance/_filteritems/nces";
import ObjectFilter from "app/finance/_filteritems/object";
import ProgramFilter from "app/finance/_filteritems/program";
import RevenueCategoryFilter from "app/finance/_filteritems/revenue_category";
import RevenueFilter from "app/finance/_filteritems/revenue";
import { makeSchoolFilter } from "app/finance/_filteritems/school";

import * as CommonSettings from "app/finance/_settings/common_settings";
import { DEFAULT_DATASET_SETTINGS } from "app/finance/_settings/dataset_settings";

import type { DeepLink } from "utilities/sankey/deepLinks";
import type { SankeyNode } from "utilities/sankey/types";

const CCDDD = 17001;

// All-selected filters => each carried filter serializes to "" and is omitted,
// so a generated `d` value is just `c.<ccddd>~<self>.<code>`.
const ALL_FILTERS = {
  revenueCategoryCodes: RevenueCategoryFilter.allCodes(),
  revenueCodes: RevenueFilter.allCodes(),
  programCodes: ProgramFilter.allCodes(),
  activityCodes: ActivityFilter.allCodes(),
  objectCodes: ObjectFilter.allCodes(),
  ncesCodes: NcesFilter.allCodes(),
  schoolCodes: makeSchoolFilter(CCDDD).allCodes(),
};
const CTX_CATEGORY = {
  ccddd: CCDDD,
  sourceMode: "category" as const,
  filters: ALL_FILTERS,
};
const CTX_ACCOUNT = {
  ccddd: CCDDD,
  sourceMode: "account" as const,
  filters: ALL_FILTERS,
};

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
function byPath(links: DeepLink[], path: string): DeepLink {
  const l = links.find((x) => x.href.startsWith(path));
  if (!l) {
    throw new Error(`no link to ${path} in ${JSON.stringify(links)}`);
  }
  return l;
}

describe("linksForNode", () => {
  it("source (category) -> Revenues rc; node facet category, band facet program", () => {
    const node = makeNode("source", 1000, "Local Taxes");
    const links = linksForNode(node, CTX_CATEGORY);
    expect(links).toHaveLength(1);
    expect(links[0].href.startsWith("/finance/revenues?d=")).toBe(true);
    expect(links[0].label).toBe("Explore Local Taxes in Revenues");
    expect(extractC(links[0].href)).toBe("f.0"); // category (own)

    const d = extractD(links[0].href);
    expect(RevenueCategoryFilter.fromFilterString(d.split("~rc.")[1])).toEqual(
      new Set([1000]),
    );

    // Band click facets one level down: program.
    expect(extractC(linksForNode(node, CTX_CATEGORY, true)[0].href)).toBe(
      "f.2",
    );
  });

  it("source (account) -> Revenues rv; node facet revenue", () => {
    const links = linksForNode(
      makeNode("source", 1100, "Local Property Tax"),
      CTX_ACCOUNT,
    );
    expect(links).toHaveLength(1);
    expect(links[0].href.startsWith("/finance/revenues?d=")).toBe(true);
    expect(extractC(links[0].href)).toBe("f.1"); // revenue (own)
    const d = extractD(links[0].href);
    expect(RevenueFilter.fromFilterString(d.split("~rv.")[1])).toEqual(
      new Set([1100]),
    );
  });

  it("program -> Expenditures AND Detailed Actuals, own facet program", () => {
    const links = linksForNode(makeNode("program", 1, "Basic"), CTX_CATEGORY);
    expect(links).toHaveLength(2);
    const exp = byPath(links, "/finance/expenditures");
    const det = byPath(links, "/finance/detailedactuals");
    expect(extractC(exp.href)).toBe("f.1"); // program
    expect(extractC(det.href)).toBe("f.1");
    expect(exp.label).toBe("Explore Basic in Expenditures");
    expect(det.label).toBe("Explore Basic in Detailed Actuals");

    // Both narrow program to [1]; round-trip the Expenditures one through the
    // real generators.
    const d = extractD(exp.href);
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
  });

  it("activity -> Exp+Det; node facet activity, band facet object", () => {
    const node = makeNode("activity", 27, "Teaching");
    const own = linksForNode(node, CTX_CATEGORY);
    expect(own).toHaveLength(2);
    expect(extractC(byPath(own, "/finance/expenditures").href)).toBe("f.0");
    expect(extractC(byPath(own, "/finance/detailedactuals").href)).toBe("f.0");

    const band = linksForNode(node, CTX_CATEGORY, true);
    expect(extractC(byPath(band, "/finance/expenditures").href)).toBe("f.2");
  });

  it("object -> Exp+Det, facet object", () => {
    const links = linksForNode(makeNode("object", 2, "Cert"), CTX_CATEGORY);
    expect(links).toHaveLength(2);
    expect(extractC(byPath(links, "/finance/expenditures").href)).toBe("f.2");
    const d = extractD(byPath(links, "/finance/expenditures").href);
    expect(ObjectFilter.fromFilterString(d.split("~o.")[1])).toEqual(
      new Set([2]),
    );
  });

  it("nces -> Detailed Actuals only; node facet nces, band facet school", () => {
    const node = makeNode("nces", 110, "Salaries");
    const links = linksForNode(node, CTX_CATEGORY);
    expect(links).toHaveLength(1);
    expect(links[0].href.startsWith("/finance/detailedactuals?d=")).toBe(true);
    expect(extractC(links[0].href)).toBe("f.4"); // nces
    expect(extractC(linksForNode(node, CTX_CATEGORY, true)[0].href)).toBe(
      "f.3",
    );

    const d = extractD(links[0].href);
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

  it("school -> Detailed Actuals only, facet school", () => {
    const links = linksForNode(
      makeNode("school", 1002, "District Office"),
      CTX_CATEGORY,
    );
    expect(links).toHaveLength(1);
    expect(extractC(links[0].href)).toBe("f.3");
    const d = extractD(links[0].href);
    expect(makeSchoolFilter(CCDDD).fromFilterString(d.split("~s.")[1])).toEqual(
      new Set([1002]),
    );
  });

  it("carries active filters and narrows the hovered level to its code", () => {
    const programSubset = new Set([...ProgramFilter.allCodes()].slice(0, 3));
    const ctx = {
      ccddd: CCDDD,
      sourceMode: "category" as const,
      filters: { ...ALL_FILTERS, programCodes: programSubset },
    };
    // Hover an ACTIVITY node: activity narrows to [11]; the active program
    // filter is preserved; all-selected filters are omitted.
    const exp = byPath(
      linksForNode(makeNode("activity", 11, "Board of Directors"), ctx),
      "/finance/expenditures",
    );
    const defaultSettings = {
      ...DEFAULT_DATASET_SETTINGS[0],
      ...CommonSettings.makeDefaultDatasetSettings(CCDDD),
      ...CommonSettings.makeDefaultPaoSettings(),
    };
    const [deserialized] = CommonSettings.deserializeDatasetSettings(
      [extractD(exp.href)],
      [defaultSettings],
      [
        CommonSettings.makeDatasetSerializeConfig,
        CommonSettings.makePaoSerializeConfig,
      ],
    );
    expect(deserialized.activityCodes).toEqual(new Set([11]));
    expect(deserialized.programCodes).toEqual(programSubset);
  });

  it("fund balance, filtered, and null-code nodes have no links", () => {
    expect(linksForNode(makeNode("fundBalance", null), CTX_CATEGORY)).toEqual(
      [],
    );
    expect(linksForNode(makeNode("filtered", null), CTX_CATEGORY)).toEqual([]);
    expect(linksForNode(makeNode("program", null), CTX_CATEGORY)).toEqual([]);
  });
});
