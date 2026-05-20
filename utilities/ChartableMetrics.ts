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
  skipNormalizationJoin = false,
) {
  const deriveClause = normalizeColumnDeriveClause(
    metricColumns,
    normalization,
  );
  // Bypass the normalization-table join when the caller has remapped
  // class_of away from real fiscal years (e.g. years_to_diploma). Only
  // safe for amount/fte where the norm factor is a constant 1; the
  // EnrollmentDashboard guarantees that when it sets this flag.
  const joined = skipNormalizationJoin
    ? df.derive({ norm: () => 1 })
    : df.join_left(extractNormalizationDf(districtData, normalization));
  const normalizedDf = joined
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
  skipNormalizationJoin = false,
): ColumnTable {
  let normalizedData;
  if (amount_only_columns.length > 0) {
    normalizedData = normalizeColumn(
      districtData,
      df,
      amount_only_columns,
      "amount" as const,
      skipNormalizationJoin,
    )
      .join_left(
        normalizeColumn(
          districtData,
          df,
          currency_columns,
          metricSettings.currencyNormalization,
          skipNormalizationJoin,
        ),
      )
      .join_left(
        normalizeColumn(
          districtData,
          df,
          staffing_columns,
          metricSettings.staffingNormalization,
          skipNormalizationJoin,
        ),
      );
  } else {
    normalizedData = normalizeColumn(
      districtData,
      df,
      currency_columns,
      metricSettings.currencyNormalization,
      skipNormalizationJoin,
    ).join_left(
      normalizeColumn(
        districtData,
        df,
        staffing_columns,
        metricSettings.staffingNormalization,
        skipNormalizationJoin,
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

export function extractRawS275Staffing(df: ColumnTable, facetColumn: string = "duty_root") {
  const facetCodeColumn = `${facetColumn}_code`;
  const data = df.groupby("class_of", facetCodeColumn).rollup({
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

function extractRawEnrollment(
  df: ColumnTable,
  facetColumn: string,
  metricColumn: string = "all_students",
  breakdownCodeColumn: string | null = null,
  xColumn: string = "class_of",
  extraSeriesDimCol: string | null = null,
) {
  const facetCodeColumn = `${facetColumn}_code`;

  // Stage the chosen metric under a known name so the rollup can stay
  // a static expression while the caller picks an arbitrary rc_enrollment
  // column. After the long-format fold in DistrictData.filteredEnrollment,
  // student_group_code is always present on the input frame and acts as
  // an implicit series dimension — every selected dataset becomes its own
  // series in each facet's chart. The optional breakdown column adds
  // another nested series dim (e.g. grade-cohort lines per dataset).
  // extraSeriesDimCol is a synthetic series dim (e.g. diploma_year for
  // the cohort view) that's always added when present.
  const useBreakdown =
    breakdownCodeColumn &&
    breakdownCodeColumn !== facetCodeColumn &&
    breakdownCodeColumn !== "student_group_code";
  const staged = df.derive({ _metric: aq.escape((d) => d[metricColumn]) });
  const groupCols = [xColumn, "grade", facetCodeColumn, "student_group_code"];
  if (useBreakdown) {
    groupCols.push(breakdownCodeColumn);
  }
  if (extraSeriesDimCol && !groupCols.includes(extraSeriesDimCol)) {
    groupCols.push(extraSeriesDimCol);
  }
  return staged.groupby(...groupCols).rollup({
    [metricColumn]: (d) => op.sum(d._metric),
  });
}

export function toFacetedCharatbleEnrollmentDataset(
  districtData,
  filteredDf,
  facet,
  settings,
  metricColumn: string = "all_students",
  breakdownCodeColumn: string | null = null,
  xColumn: string = "class_of",
  extraSeriesDimCol: string | null = null,
) {
  const facetCodeColumn = `${facet}_code`;
  const useBreakdown =
    breakdownCodeColumn &&
    breakdownCodeColumn !== facetCodeColumn &&
    breakdownCodeColumn !== "student_group_code";
  const df = extractRawEnrollment(
    filteredDf, facet, metricColumn, breakdownCodeColumn, xColumn, extraSeriesDimCol,
  );

  // composite_key shape:
  //   useBreakdown + extra:  <facetCode>_<breakdownCode>_<studentGroupCode>_<extra>
  //   useBreakdown:          <facetCode>_<breakdownCode>_<studentGroupCode>
  //   extra:                 <facetCode>_<studentGroupCode>_<extra>
  //   else:                  <facetCode>_<studentGroupCode>
  // The multi-series chart's column lookup
  // (`<metricColumn>_<facetCode>_<seriesCode>_actuals`) matches by
  // appending `<seriesCode>` after the facet code, where the seriesCode
  // is the rest of the composite_key after the leading facet segment.
  const withComposite = df
    .filter(d => d.grade != "All Grades")
    .derive({ _metric: aq.escape((d) => d[metricColumn]) })
    .derive({
      composite_key: aq.escape((d) => {
        const parts = [d[facetCodeColumn]];
        if (useBreakdown) parts.push(d[breakdownCodeColumn]);
        parts.push(d.student_group_code);
        if (extraSeriesDimCol) parts.push(d[extraSeriesDimCol]);
        return parts.join("_");
      }),
    });

  let pdata = withComposite
    .groupby([xColumn])
    .pivot(["composite_key"], {
      [metricColumn]: (d) => op.sum(d._metric),
      _pivot_name_hack_: (d) => op.any("_pivot_name_hack_"),
    })
    .select(aq.not(aq.startswith("_pivot_name_hack_")))
    .derive({ data_type: (d) => "actuals" });

  // Downstream chartable pipeline keys on a column named "class_of".
  // When the caller uses a different x column (e.g. years_to_diploma),
  // rename it so the pivot/normalize stages don't need parameterization.
  if (xColumn !== "class_of") {
    pdata = pdata.rename({ [xColumn]: "class_of" });
  }

  const names = getDataColumnNames(pdata);
  return toChartableDataset(
    districtData,
    pdata,
    settings,
    [],
    names,
    [],
    xColumn !== "class_of",
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
