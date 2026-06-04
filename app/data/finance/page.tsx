import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import FileList from "../_widgets/FileList";
import Section from "../_widgets/Section";
import SectionPage from "../_widgets/SectionPage";
import manifest from "../_manifest/finance.json";

const BUCKET_PREFIX = "https://storage.googleapis.com/sps-btn-data-all-data/";

type ProcessedF19x = {
  file: string;
  path: string;
  year: string | null;
  section: string | null;
};

function groupByYear(rows: ProcessedF19x[]) {
  const out = new Map<string, ProcessedF19x[]>();
  for (const r of rows) {
    const key = r.year ?? "unknown";
    if (!out.has(key)) out.set(key, []);
    out.get(key)!.push(r);
  }
  return Array.from(out.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

function ProcessedByYear({ rows }: { rows: ProcessedF19x[] }) {
  const groups = groupByYear(rows);
  return (
    <Stack spacing={1}>
      {groups.map(([year, files]) => (
        <details key={year} style={{ borderTop: "1px solid #eee", paddingTop: 4 }}>
          <summary style={{ cursor: "pointer", fontWeight: 500 }}>
            {year} <span style={{ color: "#666", fontWeight: 400 }}>({files.length} sections)</span>
          </summary>
          <ul style={{ marginTop: 4, marginBottom: 8, columns: 2, columnGap: "2em" }}>
            {files.map((f) => (
              <li key={f.path} style={{ breakInside: "avoid" }}>
                <Link href={`${BUCKET_PREFIX}${f.path}`}>
                  {f.section ?? f.file}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </Stack>
  );
}

export default function Page() {
  return (
    <SectionPage
      title="Finance"
      intro={
        <>
          District money — SPS budget books, the state F-195 (budgets) and F-196
          (actuals) series from OSPI SAFS, lookup tables for the accounting
          codes, and the joined cross-year files the{" "}
          <Link href="/finance/vitals">Finance Dashboard</Link> is built on.
        </>
      }
    >
      <Section
        heading="SPS Budget Books & Purple Books"
        count={manifest.sps_budgets.length}
        blurb={
          <>
            Adopted budgets and the supporting &ldquo;purple books&rdquo; for
            Seattle Public Schools. Older years were scraped from archive.org;
            see notes at the bottom of this section for the URLs used.
          </>
        }
      >
        <FileList files={manifest.sps_budgets} />
        <details style={{ marginTop: 8 }}>
          <summary style={{ cursor: "pointer", color: "#555" }}>
            How these were sourced
          </summary>
          <ul>
            <li>2019&ndash;present: <code>seattleschools.org/departments/finance/budget/</code></li>
            <li>2016&ndash;2018: <code>seattleschools.org/cms/One.aspx?portalId=627&amp;pageId=4236325</code></li>
            <li>2015: <code>sps.ss8.sharpschool.com/cms/one.aspx?portalId=627&amp;pageId=14984</code></li>
            <li>2014&ndash;2015 has a broken-link patch; checking different months will find it</li>
            <li>2007&ndash;2014: <code>seattleschools.org/modules/cms/pages.phtml?sessionid=&amp;pageid=225568</code></li>
            <li>2004&ndash;2005: blue book era &mdash; one PDF per school via archive.org</li>
            <li>2002&ndash;2003: <code>seattleschools.org/area/finance/budget/index.html</code></li>
          </ul>
        </details>
      </Section>

      <Section
        heading="State F-195 Budgets (raw)"
        count={manifest.f195_raw.length}
        blurb="Annual budget databases as Microsoft Access (.accdb / .mdb) from OSPI SAFS — one per fiscal year, covering every district in the state."
      >
        <FileList files={manifest.f195_raw} />
      </Section>

      <Section
        heading="State F-195 Budgets (processed)"
        count={manifest.f195_processed.length}
        blurb="Same F-195 data split into per-section AVRO files (activity, object, program, revenue, etc.), one file per section per year. Easier to load than the source .accdb."
      >
        <ProcessedByYear rows={manifest.f195_processed as ProcessedF19x[]} />
      </Section>

      <Section
        heading="State F-196 Actuals (raw)"
        count={manifest.f196_raw.length}
        blurb="Annual actual-spending databases (and supporting CSVs/dictionaries) from OSPI SAFS."
      >
        <FileList files={manifest.f196_raw} />
      </Section>

      <Section
        heading="State F-196 Actuals (processed)"
        count={manifest.f196_processed.length}
        blurb="F-196 split into per-section AVRO files, one file per section per year."
      >
        <ProcessedByYear rows={manifest.f196_processed as ProcessedF19x[]} />
      </Section>

      <Section
        heading="F-19x joined cross-year files"
        count={manifest.f19x_processed.length}
        blurb="Single AVRO per section concatenated across all available years &mdash; the easiest starting point for multi-year analysis."
      >
        <FileList files={manifest.f19x_processed} />
      </Section>

      <Section
        heading="OSPI domain / lookup tables"
        count={manifest.domains.length}
        blurb="Lookup tables for the OSPI accounting codes used in F-195/F-196 — activity, object, program, revenue, county, fund, NCES, school, etc."
      >
        <FileList files={manifest.domains} />
      </Section>

      <Section
        heading="Joined per-school analysis CSVs"
        count={manifest.analysis.length}
        blurb="Convenience CSVs joining 2015–2025 data at the school level. Useful for quick spreadsheet work without building a join yourself."
      >
        <FileList files={manifest.analysis} />
      </Section>

      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        Looking for interactive views of this data? See the{" "}
        <Link href="/finance/vitals">Finance Dashboard</Link>.
      </Typography>
    </SectionPage>
  );
}
