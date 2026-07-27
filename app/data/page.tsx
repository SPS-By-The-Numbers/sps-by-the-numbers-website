import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import SectionCard from "./_widgets/SectionCard";
import counts from "./_manifest/counts.json";

type Section = {
  href: string;
  title: string;
  blurb: string;
  count: number;
};

const SECTIONS: Section[] = [
  {
    href: "/data/finance",
    title: "SPS Budget and Purple Books",
    blurb:
      "Seattle Public Schools' own budget documents — adopted budgets, budget books, and the supporting purple books — grouped by school year back to 2002.",
    count: counts.sps_budgets,
  },
  {
    href: "/data/fiscal",
    title: "Fiscal Reports (OSPI PDFs)",
    blurb: `The OSPI fiscal-report PDF corpus — F-195/F-196 district packets plus monthly apportionment reports and their supporting schedules for every district, ESD, college, and state agency — ${counts.fiscal_raw_files.toLocaleString()} PDFs (~${Math.round(counts.fiscal_raw_bytes / 1024 ** 3)} GiB), with ${counts.fiscal_tables} extracted AVRO tables. Use the district chooser to browse packets.`,
    count: counts.fiscal_raw_files + counts.fiscal_tables,
  },
  {
    href: "/data/safs",
    title: "SAFS Financial Databases (F-195 / F-196)",
    blurb:
      "OSPI's machine-readable financial data for every district in the state: F-195 budget and F-196 actuals databases, per-section AVRO splits, joined cross-year files, per-school analysis CSVs, and the accounting-code lookup tables that feed the Finance Dashboard.",
    count:
      counts.f195_raw +
      counts.f196_raw +
      counts.f195_processed +
      counts.f196_processed +
      counts.f19x_processed +
      counts.analysis +
      counts.domains,
  },
  {
    href: "/data/enrollment",
    title: "Enrollment (P-223)",
    blurb:
      "Monthly P-223 enrollment counts — SPS PDFs, OSPI statewide PDFs, processed monthly CSVs, and the SAFS historical enrollment workbooks.",
    count:
      counts.sps_p223_pdf + counts.ospi_p223_pdf + counts.processed_monthly_csv,
  },
  {
    href: "/data/staffing",
    title: "Staffing (S-275)",
    blurb:
      "Per-year S-275 personnel databases from OSPI plus normalized AVRO tables (assignments, employees, reports).",
    count: counts.s275_years + 5,
  },
  {
    href: "/data/assessment",
    title: "Assessment",
    blurb:
      "Report Card assessment data plus per-school joined CSVs covering 2015–2025.",
    count: 4,
  },
  {
    href: "/data/transportation",
    title: "Transportation (STARS)",
    blurb: `STARS pupil transportation reports — Key Performance Indicators, Quarterly District Detail, Efficiency, Efficiency Review, and Operations Allocation — for ${counts.stars_districts} districts across 9 school years. Use the district chooser to drill in.`,
    count: counts.stars_total,
  },
  {
    href: "/data/odata",
    title: "OSPI OData (Socrata mirror)",
    blurb:
      "Snapshot of OSPI's public Socrata datasets as AVRO + schema pairs. Useful when you need fields that don't fit into the curated sections above.",
    count: counts.odata,
  },
  {
    href: "/data/sqss",
    title: "School Quality Status System (SQSS)",
    blurb:
      "Multi-year SQSS AVRO files covering school accountability indicators across Washington.",
    count: counts.sqss,
  },
  {
    href: "/data/public-records",
    title: "Public Records Requests",
    blurb:
      "Documents released through Public Records Requests — primarily the SOFG (Seattle Operations + Finance Group) installments and accompanying redaction logs.",
    count: counts.public_records,
  },
];

export default function Page() {
  // Sum only the file-count keys — *_bytes entries are sizes, not counts.
  const total = Object.entries(counts).reduce(
    (s, [k, n]) => (k.endsWith("_bytes") ? s : s + n),
    0,
  );
  return (
    <Container
      maxWidth="lg"
      component="main"
      sx={{ display: "flex", flexDirection: "column", my: 2, gap: 4 }}
    >
      <Stack spacing={2}>
        <Typography component="h1" variant="h2">
          Data Archive
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          A mirror of publicly available data about Seattle Public Schools and
          Washington education in general &mdash; about{" "}
          <strong>{total.toLocaleString()}</strong> files in total, hosted in
          Google Cloud Storage. Everything below is downloadable directly; the
          curated dashboards on this site are built on top of it.
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {SECTIONS.map((s) => (
          <SectionCard key={s.href} {...s} />
        ))}
      </Stack>

      <Box>
        <Typography component="h2" variant="h5" sx={{ mb: 1 }}>
          About this archive
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Files live in the public Cloud Storage bucket{" "}
          <code>gs://sps-btn-data-all-data</code>. Raw artifacts (PDFs, Word
          docs, Access databases, AVRO from Socrata) are under <code>raw/</code>
          ; cleaned and joined outputs sit under <code>processed/</code>. The
          listing on each subpage is generated at build time from a snapshot (
          <code>all_data.txt</code>) of the bucket. If something is missing or
          stale, run <code>gsutil ls -r</code> against the bucket and refresh
          that file.
        </Typography>
      </Box>
    </Container>
  );
}
