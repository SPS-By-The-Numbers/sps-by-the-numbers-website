import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import ALL_DISTRICTS from "utilities/domain/ccddd";

import type { SxProps, Theme } from "@mui/material";
import type { DistrictsMap } from "utilities/domain/ccddd";

type Params = {
  ccddd: number;
  onChange: (ccddd: number) => void;
  sx?: SxProps<Theme>;
};

function makeDistrictOptions(districts: DistrictsMap) {
  const options = Object.entries(districts).map(([ccddd, info]) => ({
    label: info.district,
    value: ccddd,
  }));

  // Alphabetize the districts.
  options.sort((a, b) => {
    if (a.label < b.label) {
      return -1;
    }
    if (a.label > b.label) {
      return 1;
    }
    return 0;
  });

  return options;
}

export default function DistrictSelector({ ccddd, onChange, sx = [] }: Params) {
  const districtOptions = makeDistrictOptions(ALL_DISTRICTS);

  return (
    <Autocomplete
      size="small"
      disableClearable
      value={{ label: ALL_DISTRICTS[ccddd].district, value: String(ccddd) }}
      options={districtOptions}
      onChange={(_event, newValue) => onChange(parseInt(newValue.value))}
      renderInput={(params) => (
        <TextField
          {...params}
          label="District"
          size="small"
          sx={{ input: { textAlign: "center" } }}
        />
      )}
      sx={[{}, ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
}
