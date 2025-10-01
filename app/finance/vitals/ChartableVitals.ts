import * as aq from 'arquero';
import { op } from 'arquero';

import { extractNormalizationDf } from 'utilities/ChartableMetrics';

import type { ColumnTable } from 'arquero';
import type { DistrictDataMap } from 'app/finance/DistrictDataProvider';
import type { VitalsSettings } from 'app/finance/vitals/VitalsSettingsContents';
import type { MetricNormalization } from 'utilities/ChartableMetrics';

function extractRawVitals(districtData, ccddd) {
  return districtData.enrollmentSummary()
    .join_full(districtData.staffingSummary())
    .join_full(districtData.balances())
    .join_full(districtData.cashflow())
    .join_full(districtData.compensation())
}

function normalizeColumnDeriveClause(metricColumns, normalization) {
  const clauses = metricColumns.map(
    mc => [
      `${normalization}_${mc}`,
      aq.escape(d => d[mc] / d.norm)
    ]);

  return Object.fromEntries(clauses);
}

function normalizeColumn(districtData, df, metricColumns, normalization) {
  // We need to rename the column to amount.
  const nd = extractNormalizationDf(districtData, normalization);
  const deriveClause = normalizeColumnDeriveClause(metricColumns, normalization);
  const normalizedDf = df
    .join(nd)
    .derive(deriveClause)
    .select(['class_of', 'data_type', ...Object.keys(deriveClause)]);

  return normalizedDf;
}

function getDataColumnNames(df) {
  return df.columnNames().filter(x => ! (['class_of', 'data_type'].includes(x)));
}

function makeVitalsForDistrict(districtDataMap, ccddd, rawVariants) : ColumnTable {
  const AMOUNT_ONLY_COLUMN_NAMES = ['enrollment', 'staffFte', 'teachingFte', 'studentSupportFte', 'buildingSupportFte', 'otherFte'];
  const NORMALIZED_COLUMN_NAMES = ['cashflow', 'beginningBalance', 'teachingComp', 'studentSupportComp', 'buildingSupportComp', 'otherComp'];

  const districtData = districtDataMap[ccddd];
  const rawVitals = extractRawVitals(districtData, ccddd);

  let data = normalizeColumn(districtData, rawVitals, AMOUNT_ONLY_COLUMN_NAMES, 'amount' as const);
  const normalizations = new Set(rawVariants);
  normalizations.add('amount' as const);
  for (const v of normalizations) {
    const normalizedDf = normalizeColumn(districtData, rawVitals, NORMALIZED_COLUMN_NAMES, v);
    data = data.join_left(normalizedDf);
  }

  // Prefix the ccddd.
  data = data.rename(
    Object.fromEntries(getDataColumnNames(data).map(x => [x, `${ccddd}_${x}`])));

  // Pivot in the budget/actuals.
  data = data.groupby('class_of').pivot('data_type', getDataColumnNames(data));
  return data;
}

export function makeChartableVitals(
    districtDataMap: DistrictDataMap,
    allVitalsSettings: Array<VitalsSettings>) : ColumnTable {

  // Some settings can be repeated. Naively joining through those will misname
  // the columns and add duplicates. Generate a unique list of settings makes
  // generating data next easier.
  const uniqueSettings = new Map<number, Set<MetricNormalization>>;
  for (const vitalsSettings of allVitalsSettings) {
    if (!uniqueSettings.has(vitalsSettings.ccddd)) {
      uniqueSettings.set(vitalsSettings.ccddd, new Set<MetricNormalization>);
    }
    uniqueSettings.get(vitalsSettings.ccddd).add(vitalsSettings.metricNormalization);
  }

  // Get the data tables.
  const allDatasets = new Array<ColumnTable>;
  for (const [ccddd, normalizations] of uniqueSettings.entries()) {
    allDatasets.push(makeVitalsForDistrict(districtDataMap, ccddd, normalizations));
  }

  let data = allDatasets[0];
  for (const d of allDatasets.slice(1)) {
    data = data.join(d);
  }
  return data;
}
