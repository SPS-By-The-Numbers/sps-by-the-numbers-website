"use client";

import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";

const BUCKET_PREFIX = "https://storage.googleapis.com/sps-btn-data-all-data/";

type Entry = { code: string; avro?: string; schema?: string };

export default function OdataTable({ entries }: { entries: Entry[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return entries;
    return entries.filter((e) => e.code.toLowerCase().includes(needle));
  }, [q, entries]);

  return (
    <>
      <TextField
        label={`Filter ${entries.length.toLocaleString()} datasets by code`}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        size="small"
        sx={{ maxWidth: 400, mb: 1 }}
      />
      {filtered.length === 0 ? (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          No datasets match "{q}".
        </Typography>
      ) : (
        <table style={{ borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "4px 8px" }}>
                Dataset code
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "4px 8px" }}>
                Data
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "4px 8px" }}>
                Schema
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 500).map((e) => (
              <tr key={e.code}>
                <td style={{ padding: "2px 8px", fontFamily: "monospace" }}>{e.code}</td>
                <td style={{ padding: "2px 8px" }}>
                  {e.avro && <Link href={`${BUCKET_PREFIX}${e.avro}`}>.avro</Link>}
                </td>
                <td style={{ padding: "2px 8px" }}>
                  {e.schema && <Link href={`${BUCKET_PREFIX}${e.schema}`}>.schema</Link>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {filtered.length > 500 && (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Showing first 500 of {filtered.length.toLocaleString()} results. Narrow the filter to see more.
        </Typography>
      )}
    </>
  );
}
