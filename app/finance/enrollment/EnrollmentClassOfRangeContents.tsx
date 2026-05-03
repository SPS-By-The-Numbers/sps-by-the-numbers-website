import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import type { EnrollmentContextSettings } from "app/finance/enrollment/EnrollmentPage";

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

// Factory: bounds are computed from the actual loaded district data, so
// the slider only spans years that have data. The caller passes in
// (sliderMin, sliderMax) discovered from districtDataMap.all_class_ofs.
export function makeEnrollmentClassOfRangeContents(
  sliderMin: number,
  sliderMax: number,
) {
  const Bound = (props: {
    settings: EnrollmentContextSettings;
    setSettings: (x: EnrollmentContextSettings) => void;
  }) => {
    const { settings, setSettings } = props;
    const lo = clamp(settings.classOfMin, sliderMin, sliderMax);
    const hi = clamp(settings.classOfMax, sliderMin, sliderMax);
    const value: [number, number] = [lo, hi];
    return (
      <Box sx={{ marginX: "0.75rem" }}>
        <Typography variant="caption">
          Class of: {lo}–{hi}
        </Typography>
        <Slider
          value={value}
          size="small"
          valueLabelDisplay="auto"
          min={sliderMin}
          max={sliderMax}
          step={1}
          marks={[
            { value: sliderMin, label: String(sliderMin) },
            { value: sliderMax, label: String(sliderMax) },
          ]}
          onChange={(_, v) => {
            if (Array.isArray(v) && v.length === 2) {
              const [newLo, newHi] = v as [number, number];
              setSettings({ ...settings, classOfMin: newLo, classOfMax: newHi });
            }
          }}
        />
      </Box>
    );
  };
  return Bound;
}
