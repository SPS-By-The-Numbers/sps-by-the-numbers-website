import * as aq from "arquero";
import { op } from "arquero";

import { toChartableDataset, toFacetedCharatbleDataset, getDataColumnNames } from "utilities/ChartableMetrics";
import DistrictData from "utilities/DistrictData";

import type { ColumnTable } from "arquero";
import type { FacetInfo } from "utilities/ChartableMetrics";
import type { SortOrder, SortType } from "utilities/ChartOptions";
import type { DistrictDataMap } from "app/finance/_providers/DistrictDataProvider";
import type { VitalsSettings } from "app/finance/vitals/VitalsDashboard";
import type { CurrencyNormalization } from "utilities/normalizations";

function extractRawVitals(districtData, ccddd) {
  return districtData
    .fundedEnrollmentSummary()
    .join_full(districtData.staffingSummary())
    .join_full(districtData.balances())
    .join_full(districtData.cashflow())
    .join_full(districtData.compensation());
}

function makeVitalsForDistrict(districtData, vitalsSettings): ColumnTable {
  const AMOUNT_ONLY_COLUMN_NAMES = [
    "fundedEnrollment",
    "revenues",
    "expenditures",
  ];
  const CURRENCY_COLUMN_NAMES = [
    "cashflow",
    "beginningBalance",
    "endingBalance",
    "teachingComp",
    "studentSupportComp",
    "buildingSupportComp",
    "otherComp",
  ];
  const STAFFING_COLUMN_NAMES = [
    "staffFte",
    "teachingFte",
    "studentSupportFte",
    "buildingSupportFte",
    "otherFte",
  ];

  const rawVitals = extractRawVitals(districtData, vitalsSettings.ccddd);

  return toChartableDataset(
    districtData,
    rawVitals,
    vitalsSettings,
    AMOUNT_ONLY_COLUMN_NAMES,
    CURRENCY_COLUMN_NAMES,
    STAFFING_COLUMN_NAMES,
  );
}

export function makeChartableVitals(
  districtDataMap: DistrictDataMap,
  allVitalsSettings: Array<VitalsSettings>,
): ColumnTable {
  const allDatasets = new Array<ColumnTable>();
  for (const vitalsSettings of allVitalsSettings) {
    allDatasets.push(
      makeVitalsForDistrict(
        districtDataMap[vitalsSettings.ccddd],
        vitalsSettings,
      ),
    );
  }

  let data = allDatasets[0];
  for (const d of allDatasets.slice(1)) {
    data = data.join(d);
  }
  return data;
}

function sortOrderOp(sortOrder: SortOrder, expr) {
  if (sortOrder === "ascending") {
    return expr;
  } else if (sortOrder === "descending") {
    return aq.desc(expr);
  }

  throw `Unknown sort order ${sortOrder}`;
}

function extractFacetsSortedByLatestAmount(
  df: ColumnTable,
  facetColumn: string,
  sortColumn: string,
  sortOrder: SortOrder,
) : Array<FacetInfo> {
  const facetCodeColumn = `${facetColumn}_code`;
  const sorted = df
    .filter(d => d.class_of === op.max(d.class_of))  // Only get latest year.
    .groupby(facetColumn, facetCodeColumn)
    .params({ sortCol: sortColumn })
    .rollup({ sortval: (d, $) => op.sum(d[$.sortCol]) })  // Sum up across non-facet categories
    .orderby(aq.desc('sortval'));

  const facetInfo = sorted
    .derive({
      facet_info: aq.escape((d) => ({
        code: d[facetCodeColumn],
        title: d[facetColumn],
      })),
    })
    .array("facet_info");

  return facetInfo as Array<FacetInfo>;
}

function extractFacetsSortedByAbsMedianVariance(
  df: ColumnTable,
  facetColumn: string,
  sortOrder: SortOrder,
) : Array<FacetInfo> {
  const facetCodeColumn = `${facetColumn}_code`;

  // Calculate variance for sort order.
  let varianceDf = df
    .groupby("class_of", "data_type", facetColumn, facetCodeColumn)
    .rollup({
      val: op.sum(`amount`),
    })
    .groupby("class_of", facetColumn, facetCodeColumn)
    .pivot(["data_type"], { val: (d) => op.sum(d.val) });

  // Ensure the pivot ends up with both a budget and an actual column
  // in case the dataset was completely missing one or the other.
  if (!varianceDf.column("budget")) {
    varianceDf = varianceDf.derive({ budget: () => null });
  }
  if (!varianceDf.column("actuals")) {
    varianceDf = varianceDf.derive({ actuals: () => null });
  }

  varianceDf = varianceDf
    .derive({ variance: (d) => d.budget - d.actuals })
    .filter((d) => !op.is_nan(d.variance));

  const facetInfo = varianceDf
    .groupby(facetColumn, facetCodeColumn)
    .rollup({ absmedian: (d) => op.abs(op.median(d.variance)) })
    .orderby(sortOrderOp(sortOrder, "absmedian"))
    .derive({
      facet_info: aq.escape((d) => ({
        code: d[facetCodeColumn],
        title: d[facetColumn],
      })),
    })
    .array("facet_info") as Array<FacetInfo>;

  return facetInfo;
}

export function extractFacets(
  districtDataMap,
  allSettings,
  facet,
  sortType : SortType,
  sortOrder : SortOrder,
  extractor = DistrictData.prototype.filteredExpenditures,
  dataTransform = toFacetedCharatbleDataset,
  valueColumn : string = "amount",
  skipVitalsContext = false,
) {
  const allDatasets = new Array<ColumnTable>();
  let fullFacetOrder;
  for (const expenditureSettings of allSettings) {
    const districtData = districtDataMap[expenditureSettings.ccddd];
    const filteredExpenditures = extractor.call(districtData, expenditureSettings);

    const data = dataTransform(
      districtData,
      filteredExpenditures,
      facet,
      expenditureSettings,
    );

    allDatasets.push(data);
    if (fullFacetOrder === undefined) {
      if (sortType === 'variance') {
        fullFacetOrder = extractFacetsSortedByAbsMedianVariance(
          filteredExpenditures,
          facet,
          sortOrder,
        );
      } else {
        fullFacetOrder = extractFacetsSortedByLatestAmount(
          filteredExpenditures,
          facet,
          valueColumn,
          sortOrder,
        );
      }
    }
  }

  let data: ColumnTable;
  if (skipVitalsContext) {
    // Caller has remapped class_of away from real fiscal years (e.g.
    // diploma_year facet uses years_to_diploma in the class_of column),
    // so the fiscal-year-keyed vitals base would inner-join to nothing.
    // Start from the first dataset and join the rest on shared columns.
    data = allDatasets[0];
    for (let i = 1; i < allDatasets.length; i++) {
      data = data.join(allDatasets[i]);
    }
  } else {
    data = makeChartableVitals(districtDataMap, [
      {
        ...allSettings[0],
        id: "context",
        currencyNormalization: "amount",
      },
    ]);

    for (const d of allDatasets) {
      data = data.join(d);
    }
  }

  // Fill in any missing class_of values between the min and max year
  // present in the joined data with null-valued rows. Line charts then
  // render a gap at those years rather than connecting a misleading
  // straight line across them. We only fill the interior — older years
  // unique to one dataset (e.g. vitals back to 2002) stay excluded by
  // the inner join above.
  const years = (data.array("class_of") as Array<number | null>)
    .filter((y): y is number => y !== null && y !== undefined);
  if (years.length > 0) {
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const existing = new Set(years);
    const missing: Array<number> = [];
    for (let y = minYear; y <= maxYear; y++) {
      if (!existing.has(y)) {
        missing.push(y);
      }
    }
    if (missing.length > 0) {
      data = data.join_full(aq.table({ class_of: missing }));
    }
  }

  data = data.orderby("class_of");

  return { data, fullFacetOrder };
}

