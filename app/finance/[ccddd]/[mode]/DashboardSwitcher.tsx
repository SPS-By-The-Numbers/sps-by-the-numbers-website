'use client';

import { useEffect } from 'react';
import { useDistrictData } from '../../DistrictDataProvider';
import { useHighcharts } from 'components/providers/HighchartsProvider';

import makeSummaryConfig from './SummaryConfig';
import makeEnrollmentConfig from './EnrollmentConfig';
import makeExpendituresConfig from './ExpendituresConfig';

import "styles/hc-ba-history.scss"

type Params = {
  ccddd: number;
  mode: string;
};

export default function DashboardSwitcher({ccddd, mode} : Params) {
  const { highchartsObjs } = useHighcharts();
  const { districtDataMap, loadCcddd } = useDistrictData();

  useEffect(
    () => {
      if (!(ccddd in districtDataMap)) {
        loadCcddd(ccddd)
      }

      if (highchartsObjs.dashboards && ccddd in districtDataMap) {
        const dashboards = highchartsObjs.dashboards;
        const districtData = districtDataMap[ccddd];

        if (mode === 'summary') {
          dashboards.board('dashboard-charts-container',
                           makeSummaryConfig(districtData));
        } else if (mode === 'enrollment') {
          dashboards.board('dashboard-charts-container',
                           makeEnrollmentConfig(districtData));
        } else if (mode === 'expenditures') {
          dashboards.board('dashboard-charts-container',
                           makeExpendituresConfig(districtData));
        }
      }
    },
    [ccddd, districtDataMap, highchartsObjs]);

  return (<div id="dashboard-charts-container">Loading...</div>);
}
