import DutyRootFilter from "app/finance/_filteritems/duty_root";

import type { DutyRootFilters } from "utilities/DistrictData";

export const DEFAULT_DUTY_ROOT_FILTERS : DutyRootFilters = {
  dutyRootCodes: DutyRootFilter.allCodes()
};
