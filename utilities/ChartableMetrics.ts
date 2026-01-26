import * as aq from "arquero";
import { op } from "arquero";

import { DUTY_ROOTS, makeDutyRootItems } from "app/finance/_domain/DutyRoots";

import type { ColumnTable } from "arquero";
import type { SortOrder } from "utilities/ChartOptions";
import type DistrictData from "utilities/DistrictData";
import type { CurrencyNormalization, StaffingNormalization } from "utilities/normalizations";

export type FacetInfo = {
  code: number;
  title: string;
};

function sortOrderOp(sortOrder: SortOrder, expr) {
  if (sortOrder === "ascending") {
    return expr;
  } else if (sortOrder === "descending") {
    return aq.desc(expr);
  }

  throw `Unknown sort order ${sortOrder}`;
}

function normalizeColumnDeriveClause(metricColumns, normalization) {
  const clauses = metricColumns.map((mc) => [
    `${normalization}_${mc}`,
    aq.escape((d) => d[mc] / d.norm),
  ]);

  return Object.fromEntries(clauses);
}

export function normalizeColumn(
  districtData,
  df,
  metricColumns,
  normalization,
) {
  // We need to rename the column to amount.
  const nd = extractNormalizationDf(districtData, normalization);
  const deriveClause = normalizeColumnDeriveClause(
    metricColumns,
    normalization,
  );
  const normalizedDf = df
    .join(nd)
    .derive(deriveClause)
    .select(["class_of", "data_type", ...Object.keys(deriveClause)]);

  return normalizedDf;
}

export function getDataColumnNames(df) {
  return df.columnNames().filter((x) => !["class_of", "data_type"].includes(x));
}

export function extractNormalizationDf(
  districtData: DistrictData,
  normalization: CurrencyNormalization | StaffingNormalization,
) {
  if (normalization === "amount" || normalization === "fte") {
    const data_types = aq.table({ data_type: ["budget", "actuals"] });
    return districtData.all_class_ofs().cross(data_types).derive({ norm: 1 });
  }
  if (normalization === "pctexp") {
    return districtData
      .expenditures()
      .groupby(["data_type", "class_of"])
      .rollup({ norm: (d) => op.sum(d.amount) / 100 });
  } else if (normalization === "pctrev") {
    return districtData
      .revenues()
      .groupby(["data_type", "class_of"])
      .rollup({ norm: (d) => op.sum(d.amount) / 100 });
  } else if (normalization === "pctcomp") {
    return districtData
      .compensation()
      .groupby(["data_type", "class_of"])
      .derive({ norm: (d) => d.allStaffComp / 100 });
  } else if (normalization === "pctsalary") {
    throw `Not implemented`;
  } else if (normalization === "pctfte") {
    return districtData
      .staffingSummary()
      .groupby(["data_type", "class_of"])
      .derive({ norm: (d) => d.staffFte / 100 });
  }

  throw `Invalid Normalizaiton: ${normalization}`;
}

export function toChartableDataset(
  districtData,
  df,
  metricSettings,
  amount_only_columns,
  currency_columns,
  staffing_columns,
): ColumnTable {
  let normalizedData;
  if (amount_only_columns.length > 0) {
    normalizedData = normalizeColumn(
      districtData,
      df,
      amount_only_columns,
      "amount" as const,
    )
      .join_left(
        normalizeColumn(
          districtData,
          df,
          currency_columns,
          metricSettings.currencyNormalization,
        ),
      )
      .join_left(
        normalizeColumn(
          districtData,
          df,
          staffing_columns,
          metricSettings.staffingNormalization,
        ),
      );
  } else {
    normalizedData = normalizeColumn(
      districtData,
      df,
      currency_columns,
      metricSettings.currencyNormalization,
    ).join_left(
      normalizeColumn(
        districtData,
        df,
        staffing_columns,
        metricSettings.staffingNormalization,
      ),
    );
  }

  // Prefix the dataset id.
  const prefixedData = normalizedData.rename(
    Object.fromEntries(
      getDataColumnNames(normalizedData).map((x) => [
        x,
        `${metricSettings.id}_${x}`,
      ]),
    ),
  );

  // Pivot in the budget/actuals.
  // Do not collapse the two getDataColumnNames() calls as data is modifieid.
  const data = prefixedData
    .groupby("class_of")
    .pivot("data_type", getDataColumnNames(prefixedData))
    .orderby("class_of");

  return data;
}

export function extractVarianceFacets(
  df: ColumnTable,
  facetColumn: string,
  sortOrder: SortOrder,
) {
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
    .array("facet_info") as Array<{ code: string; title: string }>;

  return facetInfo;
}

export function extractFacetsByAmount(
  df: ColumnTable,
  facetColumn: string,
  sortColumn: string,
  sortOrder: SortOrder,
) {
  const facetCodeColumn = `${facetColumn}_code`;
  const sorted = df
    .groupby(facetColumn, facetCodeColumn)
    .params({ sortCol: sortColumn })
    .rollup({ sortval: (d, $) => op.sum(d[$.sortCol]) })
    .orderby(aq.desc("sortval"));

  const facetInfo = sorted
    .derive({
      facet_info: aq.escape((d) => ({
        code: d[facetCodeColumn],
        title: d[facetColumn],
      })),
    })
    .array("facet_info");

  return facetInfo;
}

export function extractRawExpenditures(df: ColumnTable, facetColumn: string) {
  const facetCodeColumn = `${facetColumn}_code`;

  const data = df.groupby("class_of", "data_type", facetCodeColumn).rollup({
    amount: op.sum(`amount`),
  });

  return data;
}

export function extractRawS275Staffing(df: ColumnTable) {
  const data = df.groupby("class_of", "duty_root_code").rollup({
    finalSalary: (d) => op.sum(d.c_est_total_final_salary),
    initialSalary: (d) => op.sum(d.c_est_total_initial_salary),
    fte: (d) => op.sum(d.fte_in_assignment),
  });

  return data;
}
