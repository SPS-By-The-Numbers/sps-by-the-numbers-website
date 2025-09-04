import type Dashboards from '@highcharts/dashboards/es-modules/masters/dashboards.src.js';
import type DistrictData from "utilities/DistrictData";

export {};

declare global {
  interface Window {
    districtData: DistrictData;
    dashboards: Dashboards;
  }
}
