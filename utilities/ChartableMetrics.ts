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
    all_students: d => op.sum(d.all_students),
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
      all_students: (d) => op.sum(d.all_students),
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

// All assessment code columns in a fixed order. The facet dimension is
// separated out and the rest form the series key within each chart.
// ms_assignment_code is intentionally absent — it is only ever used as a
// chart facet (never a series), and including it as a series component
// would just duplicate information already encoded by school_code.
const ASSESSMENT_CODE_COLUMNS = [
  "school_code",
  "test_subject_code",
  "grade_level_code",
  "test_administration_code",
  "student_group_code",
];

export function toFacetedCharatbleAssessmentDataset(
  districtData,
  filteredDf,
  facet,
  settings,
  metricColumn: string = "pct_met_standard_withdat",
) {
  const facetCodeColumn = `${facet}_code`;
  const seriesCodeColumns = ASSESSMENT_CODE_COLUMNS.filter(c => c !== facetCodeColumn);

  // Stage the chosen metric under a known name so the rollup expression
  // can reference it without depending on dynamic column-name parsing.
  // Then create the composite pivot key: facet code first, then the
  // remaining dimensions.
  const withComposite = filteredDf
    .derive({
      _metric: aq.escape((d) => d[metricColumn]),
      composite_key: aq.escape(d =>
        `${d[facetCodeColumn]}_${seriesCodeColumns.map(c => d[c]).join("_")}`
      ),
    });

  // Pivot by composite key, averaging the chosen metric per group.
  // Multiply by 100 so the chart axis renders as a percent. The output
  // column prefix uses metricColumn so the chart's expected
  // `<id>_<norm>_<metric>_<facet>_<series>_actuals` columns line up.
  const pdata = withComposite
    .groupby(["class_of", "data_type"])
    .pivot(["composite_key"], {
      [metricColumn]: (d) => op.mean(d._metric) * 100,
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
