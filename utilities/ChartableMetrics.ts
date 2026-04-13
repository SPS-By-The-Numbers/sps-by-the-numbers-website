import * as aq from "arquero";
import { op } from "arquero";

import type { ColumnTable } from "arquero";
import type { SortOrder } from "utilities/ChartOptions";
import type DistrictData from "utilities/DistrictData";
import type { CurrencyNormalization, StaffingNormalization } from "utilities/normalizations";

export type FacetInfo = {
  code: string;
  title: string;
};

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
    .join_left(nd)
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
    fte: (d) => op.sum(d.fte),
  });

  return data;
}

export function toFacetedCharatbleDataset(
  districtData,
  filteredDf,
  facet,
  settings,
) {
  const df = extractRawExpenditures(filteredDf, facet);

  const pdata = df
    .groupby(["class_of", "data_type"])
    .pivot([`${facet}_code`], {
      amount: (d) => op.sum(d.amount),
      _pivot_name_hack_: (d) => op.any("_pivot_name_hack_"),
    })
    .select(aq.not(aq.startswith("_pivot_name_hack_")));

  const names = getDataColumnNames(pdata);
  return toChartableDataset(
    districtData,
    pdata,
    settings,
    [],
    names,
    [],
  );
}

function extractRawEnrollment(df: ColumnTable, facetColumn: string) {
  const facetCodeColumn = `${facetColumn}_code`;

  return df
  .groupby("class_of", "grade", facetCodeColumn)
  .rollup({
    pct_met_standard: d => op.sum(d.pct_met_standard),
  });
}

export function toFacetedCharatbleEnrollmentDataset(
  districtData,
  filteredDf,
  facet,
  settings
) {
  const df = extractRawEnrollment(filteredDf, facet);

  const pdata = df
    .filter(d => d.grade != "All Grades")
    .groupby(["class_of"])
    .pivot([`${facet}_code`], {
      pct_met_standard: (d) => op.sum(d.pct_met_standard),
      _pivot_name_hack_: (d) => op.any("_pivot_name_hack_"),
    })
    .select(aq.not(aq.startswith("_pivot_name_hack_")))
    .derive({ data_type: (d) => "actuals" });

  const names = getDataColumnNames(pdata);
  return toChartableDataset(
    districtData,
    pdata,
    settings,
    [],
    names,
    [],
  );
}

export function toFacetedCharatbleAssessmentDataset(
  districtData,
  filteredDf,
  facet,
  settings
) {
  const facetCodeColumn = `${facet}_code`;

  // Create composite pivot key combining facet (school) with all series
  // dimensions so each unique tuple is a separate line.
  const withComposite = filteredDf
    .params({ facetCodeColumn })
    .derive({
      composite_key: aq.escape(d => `${d[facetCodeColumn]}_${d.test_subject_code}_${d.grade_level_code}_${d.test_administration_code}_${d.student_group_code}`),
    });

  // Pivot by composite key, averaging pct_met_standard per group.
  const pdata = withComposite
    .groupby(["class_of", "data_type"])
    .pivot(["composite_key"], {
      pct_met_standard: (d) => op.mean(d.pct_met_standard),
      _pivot_name_hack_: (d) => op.any("_pivot_name_hack_"),
    })
    .select(aq.not(aq.startswith("_pivot_name_hack_")));

  const names = getDataColumnNames(pdata);
  return toChartableDataset(
    districtData,
    pdata,
    settings,
    [],
    names,
    [],
  );
}
