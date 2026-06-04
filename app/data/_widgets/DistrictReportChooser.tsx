"use client";

import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";

const BUCKET_PREFIX = "https://storage.googleapis.com/sps-btn-data-all-data/";

type District = { code: string; name: string; short: string };

type CategoryPrefix = {
  key: string;
  label: string;
  dirPrefix: string;     // e.g. "raw/stars/kpi/"
  seasonal?: boolean;
};

type ByYear = Record<string, string | Record<string, string>>;
type ByDistrict = Record<string, ByYear>;
type Categories = Record<string, ByDistrict>;

type Props = {
  districts: District[];
  categories: Categories;
  categoryDefs: CategoryPrefix[];
};

const SEASONS = ["FALL", "WINTER", "SPRING"];

function url(prefix: string, filename: string) {
  return `${BUCKET_PREFIX}${prefix}${filename}`;
}

export default function DistrictReportChooser({
  districts,
  categories,
  categoryDefs,
}: Props) {
  const [district, setDistrict] = useState<District | null>(null);

  // Years available for the selected district, across all categories.
  const years = useMemo(() => {
    if (!district) return [];
    const set = new Set<string>();
    for (const def of categoryDefs) {
      const byYear = categories[def.key]?.[district.code];
      if (!byYear) continue;
      for (const y of Object.keys(byYear)) set.add(y);
    }
    return Array.from(set).sort().reverse();
  }, [district, categoryDefs, categories]);

  return (
    <Stack spacing={2}>
      <Autocomplete
        options={districts}
        getOptionLabel={(d) => `${d.name} (${d.code})`}
        value={district}
        onChange={(_, v) => setDistrict(v)}
        renderInput={(params) => (
          <TextField {...params} label="District" placeholder="Start typing a district name…" />
        )}
        sx={{ maxWidth: 500 }}
        isOptionEqualToValue={(a, b) => a.code === b.code}
      />

      {district && (
        <Stack spacing={1.5}>
          {years.length === 0 && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              No reports on file for {district.name}.
            </Typography>
          )}
          {years.map((year) => (
            <Box
              key={year}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                p: 1.5,
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1 }}>{year}</Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {categoryDefs.map((def) => {
                  const entry = categories[def.key]?.[district.code]?.[year];
                  if (!entry) return null;
                  if (def.seasonal && typeof entry === "object") {
                    return SEASONS.flatMap((season) => {
                      const filename = (entry as Record<string, string>)[season];
                      if (!filename) return [];
                      return [
                        <Chip
                          key={`${def.key}-${season}`}
                          component={Link}
                          href={url(def.dirPrefix, filename)}
                          target="_blank"
                          rel="noopener"
                          label={`${def.label} · ${season.toLowerCase()}`}
                          clickable
                          size="small"
                          variant="outlined"
                          sx={{ textDecoration: "none" }}
                        />,
                      ];
                    });
                  }
                  if (typeof entry === "string") {
                    return (
                      <Chip
                        key={def.key}
                        component={Link}
                        href={url(def.dirPrefix, entry)}
                        target="_blank"
                        rel="noopener"
                        label={def.label}
                        clickable
                        size="small"
                        variant="outlined"
                        sx={{ textDecoration: "none" }}
                      />
                    );
                  }
                  return null;
                })}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
