import * as aq from 'arquero';
import { op } from 'arquero';

import { toChartableDataset } from 'utilities/ChartableMetrics';

import type { ColumnTable } from 'arquero';
import type { DistrictDataMap } from 'app/finance/_providers/DistrictDataProvider';
import type { VitalsSettings } from 'app/finance/vitals/VitalsDashboard';
import type { CurrencyNormalization } from 'utilities/ChartableMetrics';

function extractRawVitals(districtData, ccddd) {
  return districtData.enrollmentSummary()
    .join(districtData.staffingSummary())
    .join_full(districtData.balances())
    .join_full(districtData.cashflow())
    .join_full(districtData.compensation())
}

function makeVitalsForDistrict(districtData, vitalsSettings) : ColumnTable {
  const AMOUNT_ONLY_COLUMN_NAMES = ['enrollment', 'revenues', 'expenditures'];
  const CURRENCY_COLUMN_NAMES = ['cashflow', 'beginningBalance', 'teachingComp', 'studentSupportComp', 'buildingSupportComp', 'otherComp'];
  const STAFFING_COLUMN_NAMES = ['staffFte', 'teachingFte', 'studentSupportFte', 'buildingSupportFte', 'otherFte'];

  const rawVitals = extractRawVitals(districtData, vitalsSettings.ccddd);

  return toChartableDataset(districtData, rawVitals, vitalsSettings,
                            AMOUNT_ONLY_COLUMN_NAMES,
                            CURRENCY_COLUMN_NAMES,
                            STAFFING_COLUMN_NAMES);
}

export function makeChartableVitals(
    districtDataMap: DistrictDataMap,
    allVitalsSettings: Array<VitalsSettings>) : ColumnTable {

  const allDatasets = new Array<ColumnTable>;
  for (const vitalsSettings of allVitalsSettings) {
    allDatasets.push(makeVitalsForDistrict(districtDataMap[vitalsSettings.ccddd], vitalsSettings))
  }

  let data = allDatasets[0];
  for (const d of allDatasets.slice(1)) {
    data = data.join(d);
  }
  return data;
}
