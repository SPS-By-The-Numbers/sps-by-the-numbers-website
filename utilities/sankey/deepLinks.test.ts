import { expect } from "@jest/globals";
import { linksForBand, linksForNode } from "utilities/sankey/deepLinks";

import ActivityFilter from "app/finance/_filteritems/activity";
import EmploymentClassFilter from "app/finance/_filteritems/employment_class";
import {
  CERTIFICATED_CLASS_CODE,
  CLASSIFIED_CLASS_CODE,
} from "utilities/domain/duty_roots";
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
    expect(links[0].label).toBe("Revenues");
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
    expect(exp.label).toBe("Bud/Act History");
    expect(det.label).toBe("Detailed Actuals");

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

describe("linksForBand", () => {
  it("program -> activity: Exp + Det, facet activity, narrows both ends", () => {
    const links = linksForBand(
      makeNode("program", 1, "Basic"),
      makeNode("activity", 11, "Board of Directors"),
      CTX_CATEGORY,
    );
    expect(links.map((l) => l.label)).toEqual([
      "Bud/Act History",
      "Detailed Actuals",
    ]);
    const exp = byPath(links, "/finance/expenditures");
    expect(extractC(exp.href)).toBe("f.0"); // downstream (activity) facet
    const d = extractD(exp.href);
    expect(
      ProgramFilter.fromFilterString(d.split("~p.")[1].split("~")[0]),
    ).toEqual(new Set([1]));
    expect(
      ActivityFilter.fromFilterString(d.split("~a.")[1].split("~")[0]),
    ).toEqual(new Set([11]));
  });

  it("source -> program: Exp + Det, facet program, narrows program only", () => {
    const links = linksForBand(
      makeNode("source", 1000, "Local Taxes"),
      makeNode("program", 1, "Basic"),
      CTX_CATEGORY,
    );
    expect(links.map((l) => l.label)).toEqual([
      "Bud/Act History",
      "Detailed Actuals",
    ]);
    expect(extractC(byPath(links, "/finance/expenditures").href)).toBe("f.1");
    // Source isn't an expenditure dimension, so it can't narrow the target.
    expect(extractD(byPath(links, "/finance/expenditures").href)).not.toContain(
      "~rc.",
    );
  });

  it("activity -> compensation object: adds Staffing narrowed by activity", () => {
    const links = linksForBand(
      makeNode("activity", 11, "Board of Directors"),
      makeNode("object", 2, "Certificated Salaries"),
      CTX_CATEGORY,
    );
    expect(links.map((l) => l.label)).toEqual([
      "Bud/Act History",
      "Detailed Actuals",
      "Staffing (FTE)",
      "Staffing (FTE) by Duty Root",
    ]);
    // Exp/Det facet the downstream object level.
    expect(extractC(byPath(links, "/finance/expenditures").href)).toBe("f.2");
    // Staffing facets activity (its own index) and narrows by activity, not
    // object (staffing has no object filter).
    const staff = byPath(links, "/finance/staffing");
    expect(extractC(staff.href)).toBe("f.0");
    const d = extractD(staff.href);
    expect(
      ActivityFilter.fromFilterString(d.split("~a.")[1].split("~")[0]),
    ).toEqual(new Set([11]));
    expect(d).not.toContain("~o.");
    // Certificated-salary object (2) narrows staffing to the Certificated
    // employment class.
    expect(EmploymentClassFilter.fromFilterString(d.split("~ec.")[1])).toEqual(
      new Set([CERTIFICATED_CLASS_CODE]),
    );
    // The "by Duty Root" variant is the same narrowed Staffing view but opened
    // on the Duty Root facet (f.3) instead of Activity.
    const staffByDuty = links.find(
      (l) => l.label === "Staffing (FTE) by Duty Root",
    )!;
    expect(extractC(staffByDuty.href)).toBe("f.3");
    expect(extractD(staffByDuty.href)).toBe(d);
  });

  it("compensation object -> school: Detailed Actuals + Staffing (School facet) + by Duty Root", () => {
    const links = linksForBand(
      makeNode("object", 3, "Classified Salaries"),
      makeNode("school", 1002, "Some School"),
      CTX_CATEGORY,
    );
    // object -> school: Expenditures can't facet school, so Det + both Staffing.
    expect(links.map((l) => l.label)).toEqual([
      "Detailed Actuals",
      "Staffing (FTE)",
      "Staffing (FTE) by Duty Root",
    ]);
    // Detailed Actuals always opens on the NCES facet (f.4).
    expect(extractC(byPath(links, "/finance/detailedactuals").href)).toBe(
      "f.4",
    );
    // The primary Staffing link opens on the School facet (f.2); the variant on
    // Duty Root (f.3). Both narrow to the one school (1002).
    const staff = byPath(links, "/finance/staffing");
    expect(extractC(staff.href)).toBe("f.2");
    const staffByDuty = links.find(
      (l) => l.label === "Staffing (FTE) by Duty Root",
    )!;
    expect(extractC(staffByDuty.href)).toBe("f.3");
    const d = extractD(staff.href);
    expect(extractD(staffByDuty.href)).toBe(d);
    expect(
      makeSchoolFilter(CCDDD).fromFilterString(d.split("~s.")[1].split("~")[0]),
    ).toEqual(new Set([1002]));
    // Classified-salary object (3) narrows staffing to the Classified
    // employment class.
    expect(EmploymentClassFilter.fromFilterString(d.split("~ec.")[1])).toEqual(
      new Set([CLASSIFIED_CLASS_CODE]),
    );
  });

  it("non-compensation object -> non-salary target gets no Staffing link", () => {
    const links = linksForBand(
      makeNode("object", 5, "Supplies"),
      makeNode("school", 1002, "Some School"),
      CTX_CATEGORY,
    );
    expect(links.map((l) => l.label)).toEqual(["Detailed Actuals"]);
  });

  it("compensation object -> salary nces: Staffing faceted by Duty Root", () => {
    const links = linksForBand(
      makeNode("object", 2, "Certificated Salaries"),
      makeNode("nces", 110, "Salaries of Regular Employee"),
      CTX_CATEGORY,
    );
    // Downstream nces: no Expenditures facet; Det (NCES facet) + Staffing.
    expect(links.map((l) => l.label)).toEqual([
      "Detailed Actuals",
      "Staffing (FTE)",
    ]);
    expect(extractC(byPath(links, "/finance/detailedactuals").href)).toBe(
      "f.4",
    );
    // Neither end is P/A/S, so staffing opens on the Duty Root facet.
    expect(extractC(byPath(links, "/finance/staffing").href)).toBe("f.3");
  });

  it("benefit nces -> school: Staffing too (benefits are compensation)", () => {
    const links = linksForBand(
      makeNode("nces", 212, "Group Insurance"),
      makeNode("school", 1002, "Some School"),
      CTX_CATEGORY,
    );
    expect(links.map((l) => l.label)).toEqual([
      "Detailed Actuals",
      "Staffing (FTE)",
      "Staffing (FTE) by Duty Root",
    ]);
  });

  it("salary nces -> school: Staffing on School facet + by Duty Root, narrowed by school", () => {
    const links = linksForBand(
      makeNode("nces", 120, "Salaries of Temporary EEs & Subs"),
      makeNode("school", 1002, "Some School"),
      CTX_CATEGORY,
    );
    expect(links.map((l) => l.label)).toEqual([
      "Detailed Actuals",
      "Staffing (FTE)",
      "Staffing (FTE) by Duty Root",
    ]);
    // School endpoint: primary opens on the School facet (f.2), variant on Duty
    // Root (f.3); both narrowed to the one school.
    const staff = byPath(links, "/finance/staffing");
    expect(extractC(staff.href)).toBe("f.2");
    expect(
      extractC(
        links.find((l) => l.label === "Staffing (FTE) by Duty Root")!.href,
      ),
    ).toBe("f.3");
    expect(
      makeSchoolFilter(CCDDD).fromFilterString(
        extractD(staff.href).split("~s.")[1].split("~")[0],
      ),
    ).toEqual(new Set([1002]));
  });
});
