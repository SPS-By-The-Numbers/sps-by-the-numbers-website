"use client";

// Org chooser for the OSPI fiscal PDF corpus. Pick a district, college or
// state agency and get one bordered box per school year, subdivided by the
// report family the documents came from: the F-195/F-196 packet
// (raw/fiscal/fiscal/...), the org's own apportionment reports
// (raw/fiscal/apportionment/<year>/<org_type>/...), and — for districts — the
// copies routed through their ESD (.../apportionment/<year>/esd/<esd>/<org>/).

import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import {
  BUCKET_PREFIX,
  type FiscalCorpus,
  type FiscalOrg,
} from "./fiscalCorpus";

// Document kinds in the order they should appear within a school year. The
// key is the `docs[org][kind]` key; everything but "fiscal" is a directory
// under apportionment/<year>/.
const KINDS: { key: string; label: string }[] = [
  { key: "fiscal", label: "F-195 / F-196 packet" },
  { key: "district", label: "Apportionment" },
  { key: "college", label: "Apportionment" },
  { key: "state_agency", label: "Apportionment" },
  { key: "esd", label: "Apportionment (via ESD)" },
];

type Props = { corpus: FiscalCorpus };

export default function FiscalOrgChooser({ corpus }: Props) {
  const [org, setOrg] = useState<FiscalOrg | null>(null);

  const byKind = org ? (corpus.docs[org.code] ?? {}) : {};
  const years = Array.from(
    new Set(Object.values(byKind).flatMap((byYear) => Object.keys(byYear))),
  )
    .sort()
    .reverse();

  return (
    <Stack spacing={2}>
      <Autocomplete
        options={corpus.orgs}
        getOptionLabel={(o) => `${o.name} (${o.code})`}
        value={org}
        onChange={(_, v) => setOrg(v)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="District, college or state agency"
            placeholder="Start typing a name…"
          />
        )}
        sx={{ maxWidth: 500 }}
        isOptionEqualToValue={(a, b) => a.code === b.code}
      />

      {org && (
        <Stack spacing={1.5}>
          {years.length === 0 && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              No fiscal documents on file for {org.name}.
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
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {year}
              </Typography>
              <Stack spacing={1}>
                {KINDS.map(({ key, label }) => {
                  const ref = byKind[key]?.[year];
                  if (!ref) return null;
                  const [setId, dirId] = ref;
                  const sub = key === "fiscal" ? "fiscal" : "apportionment";
                  const dir = corpus.dirs[dirId];
                  const heading =
                    key === "esd" && org.esd
                      ? `Apportionment (via ${org.esd.name})`
                      : label;
                  return (
                    <Box key={key}>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        {heading}
                      </Typography>
                      <Stack
                        direction="row"
                        flexWrap="wrap"
                        gap={1}
                        sx={{ mt: 0.5 }}
                      >
                        {corpus.sets[setId].map((file) => (
                          <Chip
                            key={file}
                            component={Link}
                            href={`${BUCKET_PREFIX}raw/fiscal/${sub}/${year}/${dir}/${encodeURIComponent(file)}`}
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
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
