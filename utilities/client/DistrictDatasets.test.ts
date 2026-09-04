import * as aq from "arquero";

import { fetchDataset } from "utilities/client/FetchData";

// arquero is stubbed repo-wide (__mocks__/arquero.ts), so these tests use
// sentinel objects as "frames". The cache does not inspect them -- it only
// has to hand back the same one, exactly once per district-dataset.

import {
  loadDataset,
  loadDatasets,
  registerNormalizer,
  resetDatasetCacheForTest,
} from "./DistrictDatasets";

jest.mock("utilities/client/FetchData", () => ({
  fetchDataset: jest.fn(),
}));

const mockFetch = fetchDataset as jest.MockedFunction<typeof fetchDataset>;

type Frame =
  ReturnType<typeof fetchDataset> extends Promise<infer T> ? T : never;

function frame(id: string) {
  return { id } as unknown as Frame;
}

describe("loadDataset", () => {
  beforeEach(() => {
    resetDatasetCacheForTest();
    mockFetch.mockReset();
  });

  it("fetches a district-dataset pair only once", async () => {
    mockFetch.mockResolvedValue(frame("a"));

    await loadDataset(17001, "gf_expenditures");
    await loadDataset(17001, "gf_expenditures");

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("shares one request between concurrent callers", async () => {
    let release: (t: unknown) => void = () => {};
    mockFetch.mockReturnValue(
      new Promise((resolve) => {
        release = resolve;
      }) as ReturnType<typeof fetchDataset>,
    );

    const a = loadDataset(17001, "assessment");
    const b = loadDataset(17001, "assessment");
    release(frame("a"));
    await Promise.all([a, b]);

    // The point of caching promises rather than values: a second caller
    // arriving mid-flight must not start a second download.
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("keeps districts separate", async () => {
    mockFetch.mockResolvedValue(frame("a"));

    await loadDataset(17001, "sqss");
    await loadDataset(31005, "sqss");

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("does not cache a failure, so a later attempt can retry", async () => {
    mockFetch.mockRejectedValueOnce(new Error("boom"));
    await expect(loadDataset(17001, "enrollment")).rejects.toThrow("boom");

    mockFetch.mockResolvedValueOnce(frame("b"));
    await expect(loadDataset(17001, "enrollment")).resolves.toBeDefined();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("falls back for datasets that may legitimately not exist", async () => {
    mockFetch.mockRejectedValue(new Error("not deployed"));

    // budgeted_fte is optional: a district with no F-195 filing must not break
    // every dashboard that merely overlays it. The fallback builds an empty
    // frame via aq.table, which is what we can observe under the stub.
    await expect(loadDataset(17001, "budgeted_fte")).resolves.not.toThrow();
    expect(aq.table).toHaveBeenCalledWith(expect.objectContaining({ fte: [] }));
  });

  it("does not invent a fallback for a required dataset", async () => {
    mockFetch.mockRejectedValue(new Error("boom"));

    // The opposite case, and the more important one: a dataset with no
    // fallback must surface the failure rather than quietly resolving empty.
    await expect(loadDataset(17001, "gf_expenditures")).rejects.toThrow("boom");
  });

  it("applies a registered normalizer once per district-dataset", async () => {
    mockFetch.mockResolvedValue(frame("a"));
    const normalized = frame("normalized");
    const normalize = jest.fn(() => normalized);
    registerNormalizer("actuals_items", normalize);

    const first = await loadDataset(17001, "actuals_items");
    const second = await loadDataset(17001, "actuals_items");

    expect(first).toBe(normalized);
    expect(second).toBe(normalized);
    // Normalizing in the cache rather than per DistrictData is the whole
    // point: two dashboards sharing a dataset must not redo the work.
    expect(normalize).toHaveBeenCalledTimes(1);
  });
});

describe("loadDatasets", () => {
  beforeEach(() => {
    resetDatasetCacheForTest();
    mockFetch.mockReset();
    mockFetch.mockResolvedValue(frame("a"));
  });

  it("returns a bundle keyed by dataset name", async () => {
    const bundle = await loadDatasets(17001, ["enrollment", "gf_revenues"]);
    expect(Object.keys(bundle).sort()).toEqual(["enrollment", "gf_revenues"]);
  });

  it("requests nothing beyond what was asked for", async () => {
    await loadDatasets(17001, ["enrollment"]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(17001, "enrollment");
  });

  it("de-duplicates a repeated name in one call", async () => {
    await loadDatasets(17001, ["sqss", "sqss"]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
