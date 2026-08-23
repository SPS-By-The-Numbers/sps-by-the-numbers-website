"use client";

// Browser for the fiscal subcorpora that are filed statewide rather than by
// org: raw/fiscal/<subcorpus>/<year>/<file>. One tab per subcorpus, then one
// bordered box per school year with a chip per document.
//
// Three of these subcorpora (county treasurer, technical colleges, state
// agencies) were published by OSPI as unnamed downloads — every file is
// literally "PDF (12)" or "XLS (3)" — so the chips are numbered rather than
// titled. There is no way to tell which entity a file covers without opening
// it; they are listed here so they are at least reachable.

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import { BUCKET_PREFIX, type FiscalCorpus } from "./fiscalCorpus";

type Props = {
  corpus: FiscalCorpus;
  /** Subcorpus directory -> tab label, in tab order. Only listed dirs show. */
  labels: Record<string, string>;
  /** Subcorpora whose filenames are OSPI's unnamed "PDF (n)" downloads. */
  unnamed?: string[];
};

export default function FiscalStatewideBrowser({
  corpus,
  labels,
  unnamed = [],
}: Props) {
  const subs = Object.keys(labels).filter((s) => corpus.flat[s]);
  const [sub, setSub] = useState(subs[0]);

  if (subs.length === 0) return null;

  const byYear = corpus.flat[sub] ?? {};
  const years = Object.keys(byYear).sort().reverse();
  const isUnnamed = unnamed.includes(sub);

  return (
    <Stack spacing={1.5}>
      <Tabs
        value={sub}
        onChange={(_, v) => setSub(v)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {subs.map((s) => (
          <Tab key={s} value={s} label={labels[s]} />
        ))}
      </Tabs>

      {isUnnamed && (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          OSPI published these without filenames — every download is just
          &ldquo;PDF&rdquo; or &ldquo;XLS&rdquo; plus a counter — so the labels
          below are the bucket filenames as-is. Open one to see which entity it
          covers; nothing in the path says.
        </Typography>
      )}

      {years.map((year) => {
        const files = corpus.sets[byYear[year]];
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
              {year}{" "}
              <Typography
                component="span"
                variant="caption"
                sx={{ color: "text.secondary" }}
              >
                ({files.length.toLocaleString()}{" "}
                {files.length === 1 ? "file" : "files"})
              </Typography>
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {files.map((file) => (
                <Chip
                  key={file}
                  component={Link}
                  href={`${BUCKET_PREFIX}raw/fiscal/${sub}/${year}/${encodeURIComponent(file)}`}
                  target="_blank"
                  rel="noopener"
                  label={file.replace(/\.(pdf|xls[xm]?)$/i, "")}
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
  );
}
