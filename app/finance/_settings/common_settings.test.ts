import { expect, jest, test } from "@jest/globals";

import * as CommonSettings from "app/finance/_settings/common_settings";

const ALL_TEST_CONFIGS = [
  {
    name: "PAOFilter",
    configGenerator: CommonSettings.makePaoSerializeConfig,
    serializedMinusFirst: "p.QA~a.QA~o.QA",
  },
  {
    name: "PAFilter",
    configGenerator: CommonSettings.makePaSerializeConfig,
    serializedMinusFirst: "p.QA~a.QA",
  },
  {
    name: "ProgramFilter",
    configGenerator: CommonSettings.makeProgramSerializeConfig,
    serializedMinusFirst: "p.QA",
  },
  {
    name: "DutyRootFilter",
    configGenerator: CommonSettings.makeDutyRootSerializeConfig,
    serializedMinusFirst: "d.QA",
  },
  {
    name: "SchoolFilter",
    configGenerator: CommonSettings.makeSchoolFilterConfig,
    serializedMinusFirst: "s.QA",
  },
  {
    name: "NcesFilter",
    configGenerator: CommonSettings.makeNcesSerializeConfig,
    serializedMinusFirst: "n.QA",
  },
  {
    name: "RevenueFilter",
    configGenerator: CommonSettings.makeRevenueSerializeConfig,
    serializedMinusFirst: "rc.QA~rv.QA",
  },
];

describe("CommonSettings", () => {
  const TEST_DEFAULT_SETTINGS = {
    ...CommonSettings.makeDefaultSettings(17001),
    ...CommonSettings.makeDefaultRevenueSettings(),
  };

  for (const testConfig of ALL_TEST_CONFIGS) {
    const serializerConfig = testConfig.configGenerator(TEST_DEFAULT_SETTINGS);
    it("golden test: ", () => {
      expect(
        CommonSettings.serializeByConfig(
          serializerConfig,
          TEST_DEFAULT_SETTINGS,
        ),
      ).toEqual(testConfig.serializedMinusFirst);
    });

    it(`${testConfig.name}: roundtrip tests`, () => {
      const serialized = CommonSettings.serializeByConfig(
        serializerConfig,
        TEST_DEFAULT_SETTINGS,
      );
      expect(
        CommonSettings.deserializeByConfig(
          TEST_DEFAULT_SETTINGS,
          serializerConfig,
          serialized,
        ),
      ).toEqual(TEST_DEFAULT_SETTINGS);
    });
  }
});
