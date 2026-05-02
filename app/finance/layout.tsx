import { parse } from "csv-parse/sync";
import DistrictDataProvider from "app/finance/_providers/DistrictDataProvider";
import { Suspense } from 'react';


import type { ReactNode } from "react";

import "highcharts/css/highcharts.css";
import "@highcharts/grid-pro/css/grid-pro.css";
import "@highcharts/dashboards/css/dashboards.css";
import "styles/highcharts-base.scss";
import "styles/finance-dashboard.scss";
import "styles/hc-ba-history.scss";

export default async function FinanceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense>
      <DistrictDataProvider>
        {children}
      </DistrictDataProvider>
    </Suspense>
  );
}
