"use client";

// District chooser for the OSPI fiscal F-195/F-196 packet corpus
// (raw/fiscal/fiscal/<year>/<district_dir>/<packet>.pdf). Same interaction
// as the STARS DistrictReportChooser: pick a district, get one bordered box
// per school year with a chip per packet PDF.

import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";

const BUCKET_PREFIX = "https://storage.googleapis.com/sps-btn-data-all-data/";

type District = { code: string; name: string };

type YearPackets = { dir: string; files: string[] };
type Packets = Record<string, Record<string, YearPackets>>;

type Props = {
  districts: District[];
  packets: Packets;
};

export default function DistrictPacketChooser({ districts, packets }: Props) {
  const [district, setDistrict] = useState<District | null>(null);

  const byYear = district ? (packets[district.code] ?? {}) : {};
  const years = Object.keys(byYear).sort().reverse();

  return (
    <Stack spacing={2}>
      <Autocomplete
        options={districts}
        getOptionLabel={(d) => `${d.name} (${d.code})`}
        value={district}
        onChange={(_, v) => setDistrict(v)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="District"
            placeholder="Start typing a district name…"
          />
        )}
        sx={{ maxWidth: 500 }}
        isOptionEqualToValue={(a, b) => a.code === b.code}
      />

      {district && (
        <Stack spacing={1.5}>
          {years.length === 0 && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              No fiscal packets on file for {district.name}.
            </Typography>
          )}
          {years.map((year) => {
            const entry = byYear[year];
            return (
              <Box
                key={year}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1.5,
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {year}
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {entry.files.map((file) => (
                    <Chip
                      key={file}
                      component={Link}
                      href={`${BUCKET_PREFIX}raw/fiscal/fiscal/${year}/${entry.dir}/${file}`}
                      target="_blank"
                      rel="noopener"
                      label={file.replace(/\.pdf$/i, "")}
                      clickable
                      size="small"
                      variant="outlined"
                      sx={{ textDecoration: "none" }}
                    />
                  ))}
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
